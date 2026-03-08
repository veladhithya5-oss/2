// ============================================
// GLOBAL DOMINATION — UI & Rendering
// ============================================

// ================== RENDERING ==================
function renderLoop() {
    renderMap();
    renderMinimap();
    requestAnimationFrame(renderLoop);
}

function renderMap() {
    ctx.fillStyle = '#05070a'; // Darker ocean
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.translate(G.panX, G.panY);
    ctx.scale(G.zoom, G.zoom);

    const ox = W / 2, oy = H / 2;
    const p = playerC();

    // 1. Draw Countries
    G.countries.forEach(c => {
        ctx.beginPath();
        c.paths.forEach(poly => {
            if (poly.length > 0) {
                ctx.moveTo(poly[0][0] * SCALE + ox, -poly[0][1] * SCALE + oy);
                for (let i = 1; i < poly.length; i++) {
                    ctx.lineTo(poly[i][0] * SCALE + ox, -poly[i][1] * SCALE + oy);
                }
                ctx.closePath();
            }
        });

        const isSelected = G.selectedId === c.id;
        const isHovered = G.hoveredId === c.id && !isSelected;
        const isPlayer = c.id === G.player;

        // Map mode coloring
        let fill = c.color;
        if (G.mapMode === 'population') {
            const ratio = Math.min(1, c.population / 1428);
            fill = `hsl(210, 70%, ${Math.max(15, 80 - ratio * 60)}%)`;
        } else if (G.mapMode === 'military') {
            const ratio = Math.min(1, c.armyStrength / 100);
            fill = `hsl(0, 70%, ${Math.max(15, 80 - ratio * 60)}%)`;
        } else if (G.mapMode === 'economy') {
            const ratio = Math.min(1, c.gdp / 20000);
            fill = `hsl(140, 70%, ${Math.max(15, 80 - ratio * 60)}%)`;
        } else if (G.mapMode === 'diplomacy' || G.mapMode === 'relations') {
            if (p) {
                if (c.id === p.id) fill = '#3b82f6';
                else if (p.atWar.includes(c.id)) fill = '#ef4444';
                else if (p.allies.includes(c.id)) fill = '#10b981';
                else {
                    const rel = getRelation(p, c.id);
                    const r = (rel + 100) / 200;
                    fill = `hsl(${r * 120}, 40%, 35%)`;
                }
            } else fill = '#334155';
        } else {
            if (p && !isPlayer) {
                if (p.atWar.includes(c.id)) fill = blendColor(c.color, '#ef4444', 0.6);
                else if (p.allies.includes(c.id)) fill = blendColor(c.color, '#10b981', 0.4);
            }
        }

        ctx.fillStyle = fill;
        if (isHovered) {
            ctx.fillStyle = lightenColor(fill, 20);
            ctx.shadowColor = 'rgba(255,255,255,0.3)';
            ctx.shadowBlur = 15 / G.zoom;
        }
        if (isSelected) {
            ctx.fillStyle = '#facc15';
            ctx.shadowColor = 'rgba(250,204,21,0.5)';
            ctx.shadowBlur = 25 / G.zoom;
        }

        ctx.fill();
        ctx.shadowBlur = 0;

        // Borders
        ctx.lineWidth = isSelected ? 2.5 / G.zoom : (isHovered ? 1.5 / G.zoom : 0.6 / G.zoom);
        ctx.strokeStyle = isSelected ? '#fff' : (isHovered ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.15)');
        ctx.stroke();
    });

    // 2. Army Units
    G.countries.forEach(c => {
        const army = Math.floor(c.armyStrength);
        if (army <= 0) return;

        const x = c.center.x * SCALE + ox;
        const y = -c.center.y * SCALE + oy;

        ctx.save();
        ctx.translate(x, y);

        // Tactical Circle
        ctx.beginPath();
        ctx.arc(0, 0, 8 / G.zoom, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fill();
        ctx.strokeStyle = c.color;
        ctx.lineWidth = 2 / G.zoom;
        ctx.stroke();

        ctx.font = `bold ${9 / G.zoom}px Inter`;
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(army, 0, 0);
        ctx.restore();
    });

    // 3. Country Names
    if (G.zoom > 1.8) {
        G.countries.forEach(c => {
            const x = c.center.x * SCALE + ox, y = -c.center.y * SCALE + oy;
            ctx.font = `bold ${8 / G.zoom}px Inter`;
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            ctx.strokeStyle = 'rgba(0,0,0,0.9)';
            ctx.lineWidth = 2 / G.zoom;
            ctx.strokeText(c.name.toUpperCase(), x, y - 12 / G.zoom);
            ctx.fillText(c.name.toUpperCase(), x, y - 12 / G.zoom);
        });
    }

    // 4. War Lines
    G.wars.forEach(war => {
        const atk = getC(war.attacker), def = getC(war.defender);
        if (!atk || !def) return;
        const ax = atk.center.x * SCALE + ox, ay = -atk.center.y * SCALE + oy;
        const dx = def.center.x * SCALE + ox, dy = -def.center.y * SCALE + oy;

        ctx.beginPath();
        ctx.setLineDash([5 / G.zoom, 5 / G.zoom]);
        ctx.lineDashOffset = -(Date.now() % 2000) / 100;
        ctx.moveTo(ax, ay);
        ctx.lineTo(dx, dy);
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
        ctx.lineWidth = 2 / G.zoom;
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.font = `${12 / G.zoom}px Inter`;
        ctx.fillText('💥', (ax + dx) / 2, (ay + dy) / 2);
    });

    ctx.restore();

    // 5. Tooltip
    if (G.hoveredId && !G.isDragging) {
        const c = getC(G.hoveredId);
        if (c) drawTooltip(c);
    } else {
        hideTooltip();
    }
}

// Track mouse position globally for tooltip
let _mouseX = 0, _mouseY = 0;
window.addEventListener('mousemove', e => { _mouseX = e.clientX; _mouseY = e.clientY; });

let _tipEl = null;
function drawTooltip(c) {
    const p = playerC();
    let info = `${c.flag} ${c.name}`;
    if (p && c.id !== p.id) {
        const rel = Math.floor(getRelation(p, c.id));
        const status = rel > 50 ? 'Friendly' : rel < -50 ? 'Hostile' : 'Neutral';
        info += ` | ${status} (${rel})`;
        if (p.atWar.includes(c.id)) info += ' | ⚔️ AT WAR';
        if (p.allies.includes(c.id)) info += ' | 🛡️ Allied';
    }

    if (!_tipEl) {
        _tipEl = document.createElement('div');
        _tipEl.className = 'tooltip';
        document.body.appendChild(_tipEl);
    }

    _tipEl.textContent = info;
    _tipEl.style.display = 'block';
    _tipEl.style.left = (_mouseX + 15) + 'px';
    _tipEl.style.top = (_mouseY - 10) + 'px';
}

// Hide tooltip when nothing is hovered (called each frame in renderMap)
function hideTooltip() {
    if (_tipEl) _tipEl.style.display = 'none';
}

// ================== MINIMAP ==================
function renderMinimap() {
    const mc = document.getElementById('minimap-canvas');
    const mctx = mc.getContext('2d');
    const mw = mc.width, mh = mc.height;

    mctx.fillStyle = '#0f172a';
    mctx.fillRect(0, 0, mw, mh);

    // Scale to fit world
    const sx = mw / 720;
    const sy = mh / 360;
    const offX = 360;
    const offY = 90;

    G.countries.forEach(c => {
        mctx.beginPath();
        c.paths.forEach(poly => {
            if (poly.length > 0) {
                mctx.moveTo((poly[0][0] + offX * 0.5) * sx, (-poly[0][1] + offY) * sy);
                for (let i = 1; i < poly.length; i++) {
                    mctx.lineTo((poly[i][0] + offX * 0.5) * sx, (-poly[i][1] + offY) * sy);
                }
            }
        });
        mctx.fillStyle = c.isHumanPlayer ? c.color : (c.color || '#334155');
        mctx.fill();
        mctx.strokeStyle = 'rgba(0,0,0,0.3)';
        mctx.lineWidth = 0.3;
        mctx.stroke();
    });
}

// ================== COUNTRY PANEL ==================
function openCountryPanel(c) {
    if (!c) return;
    const panel = document.getElementById('country-panel');
    document.getElementById('panel-flag').textContent = c.flag;
    document.getElementById('panel-title').textContent = c.name;

    const body = document.getElementById('panel-body');
    const p = playerC();
    const rel = p ? Math.floor(getRelation(p, c.id)) : 0;
    const relPct = (rel + 100) / 2;
    let status = 'Neutral';
    if (p && p.atWar.includes(c.id)) status = '⚔️ WAR';
    else if (p && p.allies.includes(c.id)) status = '🛡️ Allied';
    else if (p && p.pacts.includes(c.id)) status = '📜 Pact';
    else if (rel > 50) status = 'Friendly';
    else if (rel > 20) status = 'Warm';
    else if (rel < -50) status = 'Hostile';
    else if (rel < -20) status = 'Tense';

    const isPlayer = c.isPlayer;
    const warData = G.wars.find(w => (w.attacker === c.id && w.defender === G.player) || (w.attacker === G.player && w.defender === c.id));

    let html = `
        <div class="dn-panel-grid">
            <div class="dn-stat-box"><div class="dn-stat-label">GDP</div><div class="dn-stat-value green">$${Math.floor(c.gdp)}B</div></div>
            <div class="dn-stat-box"><div class="dn-stat-label">Population</div><div class="dn-stat-value">${Math.floor(c.population)}M</div></div>
            <div class="dn-stat-box"><div class="dn-stat-label">Army</div><div class="dn-stat-value red">${Math.floor(c.armyStrength)}</div></div>
            <div class="dn-stat-box"><div class="dn-stat-label">Stability</div><div class="dn-stat-value ${c.stability > 50 ? 'green' : 'red'}">${Math.floor(c.stability)}%</div></div>
            <div class="dn-stat-box"><div class="dn-stat-label">Treasury</div><div class="dn-stat-value green">${formatMoney(c.treasury)}</div></div>
            <div class="dn-stat-box"><div class="dn-stat-label">Tech Level</div><div class="dn-stat-value blue">${c.techLevel.toFixed(1)}</div></div>
        </div>`;

    if (!isPlayer) {
        html += `
        <div class="dn-relation-section">
            <div class="dn-relation-header">
                <span>RELATIONS: ${status.toUpperCase()}</span>
                <span>${rel}</span>
            </div>
            <div class="dn-relation-bar-bg">
                <div class="dn-relation-bar-fill" style="width:${relPct}%"></div>
            </div>
        </div>`;

        if (warData) {
            const isAttacker = warData.attacker === G.player;
            html += `
            <div class="section-title">WAR PROGRESS</div>
            <div class="war-progress-card">
                <div class="war-prog-header">
                    <span class="war-prog-title">${isAttacker ? 'OUR OFFENSIVE' : 'ENEMY OFFENSIVE'}</span>
                    <span class="war-prog-pct">${Math.floor(isAttacker ? warData.progress : 100 - warData.progress)}%</span>
                </div>
                <div class="war-prog-bar"><div class="war-prog-fill" style="width:${isAttacker ? warData.progress : 100 - warData.progress}%"></div></div>
            </div>`;
        }

        html += `<div class="dn-panel-actions">`;

        if (p && p.atWar.includes(c.id)) {
            html += `<button class="dn-action-btn" onclick="playerMakePeace('${c.id}')">🕊️ PROPOSE PEACE</button>`;
        } else {
            html += `<button class="dn-action-btn" onclick="playerImproveRelations('${c.id}')">🤝 IMPROVE RELATIONS ($5B)</button>`;
            if (!p.allies.includes(c.id)) {
                html += `<button class="dn-action-btn" onclick="playerFormAlliance('${c.id}')" ${rel < 50 ? 'disabled' : ''}>🛡️ FORM ALLIANCE (50+)</button>`;
            }
            if (!p.pacts.includes(c.id)) {
                html += `<button class="dn-action-btn" onclick="playerSignPact('${c.id}')" ${rel < 0 ? 'disabled' : ''}>📜 NON-AGGRESSION PACT</button>`;
            }
            const canWar = rel <= 30 && !p.pacts.includes(c.id) && !p.allies.includes(c.id);
            html += `<button class="dn-action-btn war" onclick="playerDeclareWar('${c.id}')" ${!canWar ? 'disabled' : ''}>⚔️ DECLARE WAR</button>`;
        }
        html += `</div>`;

        // Strategic analysis
        const threat = c.armyStrength > (p ? p.armyStrength : 0) ? '⚠️ Military Threat' : '✅ Weaker militarily';
        const econ = c.gdp > (p ? p.gdp : 0) ? '📊 Stronger economy' : '📉 Weaker economy';
        html += `<div style="margin-top:10px;font-size:11px;color:var(--text-muted);line-height:1.5;">
            <strong style="color:var(--text-secondary);">Intel:</strong><br>${threat}<br>${econ}<br>
            Neighbors: ${c.neighbors.join(', ') || 'None'}</div>`;
    } else {
        html += `<div style="text-align:center;padding:10px;color:var(--text-secondary);font-size:13px;">This is your nation.</div>`;
    }

    body.innerHTML = html;
    panel.classList.add('open');
}

function closePanel() {
    G.selectedId = null;
    document.getElementById('country-panel').classList.remove('open');
}

// ================== TAB PANELS ==================
window.switchTab = function (tab) {
    G.currentTab = tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('tab-' + tab).classList.add('active');

    if (tab === 'overview') {
        closeTabPanel();
        return;
    }

    const panel = document.getElementById('tab-panel');
    const title = document.getElementById('tab-panel-title');
    const body = document.getElementById('tab-panel-body');

    switch (tab) {
        case 'economy': title.textContent = '📊 Economy'; body.innerHTML = buildEconomyPanel(); break;
        case 'military': title.textContent = '⚔️ Military'; body.innerHTML = buildMilitaryPanel(); break;
        case 'troops': title.textContent = '🪖 Buy Troops'; body.innerHTML = buildTroopsPanel(); break;
        case 'diplomacy': title.textContent = '🤝 Diplomacy'; body.innerHTML = buildDiplomacyPanel(); break;
        case 'governance': title.textContent = '🏛️ Governance'; body.innerHTML = buildGovernancePanel(); break;
        case 'research': title.textContent = '🔬 Research'; body.innerHTML = buildResearchPanel(); break;
    }

    panel.style.display = 'block';
    requestAnimationFrame(() => panel.classList.add('open'));
};

function closeTabPanel() {
    const panel = document.getElementById('tab-panel');
    panel.classList.remove('open');
    setTimeout(() => panel.style.display = 'none', 350);
}
window.closeTabPanel = closeTabPanel;

// ---- Economy Panel ----
function buildEconomyPanel() {
    const p = playerC();
    if (!p) return '';
    const net = p.getNetIncome();
    return `
        <div class="stats-grid">
            <div class="stat-card"><div class="stat-label">Treasury</div><div class="stat-value" style="color:#4ade80;">${formatMoney(p.treasury)}</div></div>
            <div class="stat-card"><div class="stat-label">GDP</div><div class="stat-value">$${Math.floor(p.gdp)}B</div></div>
            <div class="stat-card"><div class="stat-label">Income/day</div><div class="stat-value" style="color:#4ade80;">+${p.income.toFixed(1)}B</div></div>
            <div class="stat-card"><div class="stat-label">Expenses/day</div><div class="stat-value" style="color:#f87171;">-${p.expenses.toFixed(1)}B</div></div>
        </div>
        <div class="section-title">Net Income</div>
        <div class="stat-card"><div class="stat-value" style="color:${net >= 0 ? '#4ade80' : '#f87171'};font-size:20px;">${net >= 0 ? '+' : ''}${net.toFixed(2)}B / day</div></div>

        <div class="section-title">Tax Rate</div>
        <div class="slider-group">
            <div class="slider-header"><span class="slider-label">Tax Rate</span><span class="slider-value" id="tax-val">${p.taxRate}%</span></div>
            <input type="range" min="10" max="90" value="${p.taxRate}" oninput="setTaxRate(this.value)">
        </div>

        <div class="section-title">Budget Allocation</div>
        <div class="budget-bar">
            <div class="budget-segment military-seg" style="width:${p.budgetMilitary}%"></div>
            <div class="budget-segment economy-seg" style="width:${p.budgetEconomy}%"></div>
            <div class="budget-segment research-seg" style="width:${p.budgetResearch}%"></div>
            <div class="budget-segment welfare-seg" style="width:${p.budgetWelfare}%"></div>
        </div>
        <div class="budget-legend">
            <div class="legend-item"><div class="legend-dot" style="background:var(--accent-red)"></div>Military ${p.budgetMilitary}%</div>
            <div class="legend-item"><div class="legend-dot" style="background:var(--accent-green)"></div>Economy ${p.budgetEconomy}%</div>
            <div class="legend-item"><div class="legend-dot" style="background:var(--accent-purple)"></div>Research ${p.budgetResearch}%</div>
            <div class="legend-item"><div class="legend-dot" style="background:var(--accent-yellow)"></div>Welfare ${p.budgetWelfare}%</div>
        </div>

        <div class="slider-group">
            <div class="slider-header"><span class="slider-label">⚔️ Military</span><span class="slider-value">${p.budgetMilitary}%</span></div>
            <input type="range" min="5" max="70" value="${p.budgetMilitary}" oninput="setBudget('military',this.value)">
        </div>
        <div class="slider-group">
            <div class="slider-header"><span class="slider-label">📈 Economy</span><span class="slider-value">${p.budgetEconomy}%</span></div>
            <input type="range" min="5" max="70" value="${p.budgetEconomy}" oninput="setBudget('economy',this.value)">
        </div>
        <div class="slider-group">
            <div class="slider-header"><span class="slider-label">🔬 Research</span><span class="slider-value">${p.budgetResearch}%</span></div>
            <input type="range" min="0" max="50" value="${p.budgetResearch}" oninput="setBudget('research',this.value)">
        </div>
        <div class="slider-group">
            <div class="slider-header"><span class="slider-label">🏥 Welfare</span><span class="slider-value">${p.budgetWelfare}%</span></div>
            <input type="range" min="0" max="50" value="${p.budgetWelfare}" oninput="setBudget('welfare',this.value)">
        </div>

        <div class="section-title">Overextension</div>
        <div class="stat-card">
            <div class="stat-label">Conquered: ${p.conqueredTerritories.length} territories</div>
            <div class="stat-value" style="color:${p.overextension > 30 ? '#f87171' : '#4ade80'};">${Math.floor(p.overextension)}%</div>
        </div>`;
}

window.setTaxRate = function (val) {
    const p = playerC();
    p.taxRate = parseInt(val);
    document.getElementById('tax-val').textContent = val + '%';
    // High taxes reduce stability
    if (p.taxRate > 70) notify('⚠️ High taxes may cause unrest!', 'warn');
};

window.setBudget = function (cat, val) {
    const p = playerC();
    val = parseInt(val);
    const cats = ['military', 'economy', 'research', 'welfare'];
    const key = 'budget' + cat.charAt(0).toUpperCase() + cat.slice(1);
    const oldVal = p[key];
    const diff = val - oldVal;
    p[key] = val;

    // Redistribute the difference among others proportionally
    const others = cats.filter(c => c !== cat);
    const otherSum = others.reduce((s, c) => s + p['budget' + c.charAt(0).toUpperCase() + c.slice(1)], 0);
    if (otherSum > 0) {
        others.forEach(c => {
            const k = 'budget' + c.charAt(0).toUpperCase() + c.slice(1);
            p[k] = Math.max(0, Math.round(p[k] - diff * (p[k] / otherSum)));
        });
    }

    // Normalize to 100
    const total = cats.reduce((s, c) => s + p['budget' + c.charAt(0).toUpperCase() + c.slice(1)], 0);
    if (total !== 100) {
        const adj = 100 - total;
        // Apply to economy or first available
        p.budgetEconomy = Math.max(0, p.budgetEconomy + adj);
    }

    switchTab('economy');
};

// ---- Military & Global Statistics Panel ----
function buildMilitaryPanel() {
    const p = playerC();
    if (!p) return '';

    // Sort all countries by power (army strength + GDP/10)
    const ranking = [...G.countries].sort((a, b) => (b.armyStrength + b.gdp / 10) - (a.armyStrength + a.gdp / 10));
    const pRank = ranking.findIndex(c => c.id === p.id) + 1;

    let html = `
    <div class="dn-stats-panel">
        <div class="stats-grid">
            <div class="stat-card"><div class="stat-label">Global Rank</div><div class="stat-value">#${pRank}</div></div>
            <div class="stat-card"><div class="stat-label">Army Strength</div><div class="stat-value" style="color:#f87171;">${Math.floor(p.armyStrength)}</div></div>
            <div class="stat-card"><div class="stat-label">Manpower</div><div class="stat-value">${Math.floor(p.manpower)}K</div></div>
            <div class="stat-card"><div class="stat-label">Max Manpower</div><div class="stat-value">${Math.floor(p.maxManpower)}K</div></div>
        </div>

        <div class="section-title">Global Ranking (Top 10)</div>
        <div class="dn-ranking-list">`;

    ranking.slice(0, 10).forEach((c, i) => {
        const isSelf = c.id === p.id;
        html += `
            <div class="dn-ranking-item ${isSelf ? 'self' : ''}">
                <span class="rank-num">#${i + 1}</span>
                <span class="rank-flag">${c.flag}</span>
                <span class="rank-name">${c.name}</span>
                <span class="rank-val">${Math.floor(c.armyStrength + c.gdp / 10)}</span>
            </div>`;
    });

    html += `</div>

        <div class="section-title">Standing Orders</div>
        <div class="order-grid">
            <button class="order-btn ${p.militaryOrder === 'defend' ? 'active' : ''}" onclick="setOrder('defend')">
                <span class="order-icon">🛡️</span>Defend
            </button>
            <button class="order-btn ${p.militaryOrder === 'attack' ? 'active' : ''}" onclick="setOrder('attack')">
                <span class="order-icon">⚔️</span>Attack
            </button>
            <button class="order-btn ${p.militaryOrder === 'spread' ? 'active' : ''}" onclick="setOrder('spread')">
                <span class="order-icon">🌊</span>Spread
            </button>
        </div>

        <div class="section-title">Active Conflicts</div>
        ${p.atWar.length === 0 ? '<div class="no-data">No active conflicts.</div>' :
            p.atWar.map(eid => {
                const e = getC(eid);
                if (!e) return '';
                const war = G.wars.find(w => (w.attacker === p.id && w.defender === eid) || (w.attacker === eid && w.defender === p.id));
                const prog = war ? (war.attacker === p.id ? war.progress : 100 - war.progress) : 50;
                return `
                <div class="war-progress-card">
                    <div class="war-prog-header">
                        <span class="war-prog-title">${e.flag} ${e.name}</span>
                        <span class="war-prog-pct">${Math.floor(prog)}%</span>
                    </div>
                    <div class="war-prog-bar"><div class="war-prog-fill" style="width:${prog}%"></div></div>
                    <button class="dn-peace-btn" onclick="playerMakePeace('${eid}')">PROPOSE PEACE</button>
                </div>`;
            }).join('')}
    </div>`;
    return html;
}

window.setOrder = function (order) {
    playerC().militaryOrder = order;
    switchTab('military');
    notify(`Military order: ${order.toUpperCase()}`, '');
};

// ---- Diplomacy Panel ----
function buildDiplomacyPanel() {
    const p = playerC();
    if (!p) return '';
    const sorted = [...G.countries].filter(c => c.id !== p.id).sort((a, b) => {
        const ra = getRelation(p, a.id), rb = getRelation(p, b.id);
        // Wars first, then by relation
        const aw = p.atWar.includes(a.id) ? -200 : 0;
        const bw = p.atWar.includes(b.id) ? -200 : 0;
        return (aw + ra) - (bw + rb);
    });

    let html = `<div class="diplo-list">`;
    sorted.forEach(c => {
        const rel = Math.floor(getRelation(p, c.id));
        let statusClass = 'neutral', statusText = 'Neutral';
        if (p.atWar.includes(c.id)) { statusClass = 'war'; statusText = '⚔️ WAR'; }
        else if (p.allies.includes(c.id)) { statusClass = 'allied'; statusText = 'Allied'; }
        else if (p.pacts.includes(c.id)) { statusClass = 'pact'; statusText = 'Pact'; }
        else if (rel > 50) { statusClass = 'friendly'; statusText = 'Friendly'; }
        else if (rel < -50) { statusClass = 'hostile'; statusText = 'Hostile'; }

        html += `
            <div class="diplo-item" onclick="G.selectedId='${c.id}';openCountryPanel(getC('${c.id}'));">
                <div class="diplo-item-left">
                    <span class="diplo-flag">${c.flag}</span>
                    <span class="diplo-name">${c.name}</span>
                </div>
                <div style="display:flex;align-items:center;gap:6px;">
                    <span style="font-size:11px;color:var(--text-muted);">${rel}</span>
                    <span class="diplo-status ${statusClass}">${statusText}</span>
                </div>
            </div>`;
    });
    html += '</div>';

    // Alliances summary
    if (p.allies.length > 0) {
        html += `<div class="section-title" style="margin-top:12px;">Your Alliances</div>`;
        p.allies.forEach(aId => {
            const a = getC(aId);
            if (a) html += `<div style="font-size:12px;color:var(--accent-green);padding:4px 0;">${a.flag} ${a.name} — Army: ${Math.floor(a.armyStrength)}</div>`;
        });
    }

    return html;
}

// ---- R&D Panel (Dummynation Style) ----
let selectedTechId = 'nuclear_program';

function buildResearchPanel() {
    const p = playerC();
    if (!p) return '';
    let html = `
    <div class="dn-rd-container">
        <!-- Top Tech Icons Grid -->
        <div class="dn-rd-icons">`;

    TECHS.forEach(tech => {
        const researched = p.researchedTechs.includes(tech.id);
        const isResearching = G.techQueue === tech.id;
        const isSelected = selectedTechId === tech.id ? 'selected' : '';
        const locked = !researched && !isResearching && !tech.requires.every(r => p.researchedTechs.includes(r));

        let iconHtml = '';
        if (tech.name.includes('Nuclear')) iconHtml = '☢️';
        else if (tech.name.includes('Space')) iconHtml = '🚀';
        else if (tech.name.includes('Trade')) iconHtml = '🏢';
        else if (tech.name.includes('Tax')) iconHtml = '💵';
        else if (tech.name.includes('Conscription')) iconHtml = '🎖️';
        else if (tech.name.includes('Blitzkrieg')) iconHtml = '⚡';
        else if (tech.name.includes('Fort')) iconHtml = '🛡️';
        else if (tech.name.includes('Propaganda')) iconHtml = '📰';
        else if (tech.name.includes('Spy')) iconHtml = '🕵️';
        else if (tech.name.includes('Labs')) iconHtml = '🧫';
        else iconHtml = '🔬';

        let statusCls = researched ? 'researched' : (isResearching ? 'researching' : (locked ? 'locked' : 'available'));

        html += `
            <div class="dn-rd-icon-box ${statusCls} ${isSelected}" onclick="selectedTechId='${tech.id}'; switchTab('research');">
                <span class="dn-rd-emoji">${iconHtml}</span>
            </div>`;
    });

    html += `</div>
        <!-- Selected Tech Details -->
        <div class="dn-rd-details">`;

    const tech = TECHS.find(t => t.id === selectedTechId);
    if (tech) {
        const cleanName = tech.name.replace(/[^\x00-\x7F]/g, "").trim(); // remove emoji
        html += `<div class="dn-rd-title">${cleanName}</div>
                 <div class="dn-rd-desc">${tech.desc}</div>`;

        const researched = p.researchedTechs.includes(tech.id);
        const isResearching = G.techQueue === tech.id;
        const canResearch = !researched && !G.techQueue && tech.requires.every(r => p.researchedTechs.includes(r));

        if (researched) {
            html += `<button class="dn-rd-btn researched" disabled>Researched</button>`;
        } else if (isResearching) {
            const pct = Math.min(100, (G.techProgress / tech.cost) * 100);
            html += `<div class="dn-rd-progress">
                        <div class="dn-rd-progress-fill" style="width:${pct}%;"></div>
                        <div class="dn-rd-progress-text">${Math.floor(pct)}%</div>
                     </div>`;
        } else if (canResearch) {
            html += `<button class="dn-rd-btn available" onclick="startResearch('${tech.id}')">RESEARCH (${tech.cost} RP)</button>`;
        } else {
            html += `<button class="dn-rd-btn locked" disabled>Locked (Missing Prerequisites)</button>`;
        }
    }

    html += `</div></div>`;
    return html;
}

window.startResearch = function (techId) {
    if (G.techQueue) { notify('Already researching something.', 'warn'); return; }
    const tech = TECHS.find(t => t.id === techId);
    if (!tech) return;
    const p = playerC();
    if (!tech.requires.every(r => p.researchedTechs.includes(r))) { notify('Prerequisites not met.', 'warn'); return; }

    G.techQueue = techId;
    G.techProgress = 0;

    // Sync to multiplayer tech queue
    if (G.mpTechQueues && G.mpTechQueues[G.player]) {
        G.mpTechQueues[G.player].queue = techId;
        G.mpTechQueues[G.player].progress = 0;
    }

    notify(`🔬 Started research: ${tech.name}`, 'info');
    switchTab('research');
};

// ---- Governance Panel ----
function buildGovernancePanel() {
    const p = playerC();
    if (!p) return '';
    return `
        <div class="section-title">Government Type</div>
        <p style="font-size:12px;color:var(--text-muted);margin-bottom:8px;">Choose your nation's political structure. This deeply affects stability.</p>
        <div class="order-grid" style="margin-bottom:15px;">
            <button class="order-btn ${p.governmentType === 'democracy' ? 'active' : ''}" onclick="setPolicy('governmentType', 'democracy')">
                <span class="order-icon">🗳️</span>Democracy
            </button>
            <button class="order-btn ${p.governmentType === 'authoritarian' ? 'active' : ''}" onclick="setPolicy('governmentType', 'authoritarian')">
                <span class="order-icon">👑</span>Authoritarian
            </button>
            <button class="order-btn ${p.governmentType === 'oligarchy' ? 'active' : ''}" onclick="setPolicy('governmentType', 'oligarchy')">
                <span class="order-icon">💼</span>Oligarchy
            </button>
        </div>

        <div class="section-title">Economic Policy</div>
        <p style="font-size:12px;color:var(--text-muted);margin-bottom:8px;">Defines the level of state intervention in the economy.</p>
        <div class="order-grid" style="margin-bottom:15px;">
            <button class="order-btn ${p.economicPolicy === 'free_market' ? 'active' : ''}" onclick="setPolicy('economicPolicy', 'free_market')">
                <span class="order-icon">🗽</span>Free Market
            </button>
            <button class="order-btn ${p.economicPolicy === 'mixed' ? 'active' : ''}" onclick="setPolicy('economicPolicy', 'mixed')">
                <span class="order-icon">⚖️</span>Mixed Economy
            </button>
            <button class="order-btn ${p.economicPolicy === 'planned' ? 'active' : ''}" onclick="setPolicy('economicPolicy', 'planned')">
                <span class="order-icon">🏭</span>Planned Economy
            </button>
        </div>

        <div class="section-title">Conscription Law</div>
        <p style="font-size:12px;color:var(--text-muted);margin-bottom:8px;">Determines manpower growth vs societal stability.</p>
        <div class="order-grid">
            <button class="order-btn ${p.conscriptionLaw === 'volunteer' ? 'active' : ''}" onclick="setPolicy('conscriptionLaw', 'volunteer')">
                <span class="order-icon">🧑‍🤝‍🧑</span>Volunteer Only
            </button>
            <button class="order-btn ${p.conscriptionLaw === 'limited' ? 'active' : ''}" onclick="setPolicy('conscriptionLaw', 'limited')">
                <span class="order-icon">🪖</span>Limited Conscription
            </button>
            <button class="order-btn ${p.conscriptionLaw === 'extensive' ? 'active' : ''}" onclick="setPolicy('conscriptionLaw', 'extensive')">
                <span class="order-icon">⚔️</span>Extensive Conscription
            </button>
        </div>`;
}

window.setPolicy = function (type, value) {
    const p = playerC();
    if (p.treasury < 100) {
        notify('Changing policy requires $100B in treasury.', 'warn');
        return;
    }
    p.treasury -= 100;
    p.stability = Math.max(0, p.stability - 10);
    p[type] = value;
    notify(`Policy enacted! Cost: $100B, -10% Stability.`, 'event');
    switchTab('governance');
};

// ---- Troops Panel (Dummynation-style) ----
function buildTroopsPanel() {
    const p = playerC();
    if (!p) return '';
    const types = window.TROOP_TYPES || [];
    let totalTroops = 0;
    Object.values(p.troops).forEach(v => totalTroops += v);

    let html = `<div class="stats-grid">
        <div class="stat-card"><div class="stat-label">Total Troops</div><div class="stat-value" style="color:#f87171;">${totalTroops.toLocaleString()}</div></div>
        <div class="stat-card"><div class="stat-label">Manpower</div><div class="stat-value">${Math.floor(p.manpower)}K / ${Math.floor(p.maxManpower)}K</div></div>
        <div class="stat-card"><div class="stat-label">Treasury</div><div class="stat-value" style="color:#4ade80;">${formatMoney(p.treasury)}</div></div>
    </div>`;

    html += `<div class="section-title">Recruit Units</div>`;
    html += `<div class="troop-grid">`;
    types.forEach(t => {
        const count = p.troops[t.id] || 0;
        const canAfford = p.treasury >= t.cost && p.manpower >= t.manpowerCost;
        html += `
        <div class="troop-card ${canAfford ? '' : 'locked'}">
            <div class="troop-header">
                <span class="troop-icon">${t.icon}</span>
                <span class="troop-name">${t.name}</span>
                <span class="troop-count">×${count}</span>
            </div>
            <div class="troop-desc">${t.desc}</div>
            <div class="troop-stats">
                <span>⚔️${t.attack}</span>
                <span>🛡️${t.defense}</span>
                <span>💵${t.cost}B</span>
                <span>👥${t.manpowerCost}K</span>
            </div>
            <div class="troop-actions">
                <button class="troop-recruit-btn" onclick="recruitTroop('${t.id}',1)" ${canAfford ? '' : 'disabled'}>+1</button>
                <button class="troop-recruit-btn" onclick="recruitTroop('${t.id}',5)" ${canAfford ? '' : 'disabled'}>+5</button>
                <button class="troop-recruit-btn" onclick="recruitTroop('${t.id}',10)" ${canAfford ? '' : 'disabled'}>+10</button>
            </div>
        </div>`;
    });
    html += '</div>';
    return html;
}

window.recruitTroop = function (typeId, count) {
    const p = playerC();
    const t = (window.TROOP_TYPES || []).find(x => x.id === typeId);
    if (!t) return;
    let recruited = 0;
    for (let i = 0; i < count; i++) {
        if (p.treasury >= t.cost && p.manpower >= t.manpowerCost) {
            p.treasury -= t.cost;
            p.manpower -= t.manpowerCost;
            p.troops[typeId] = (p.troops[typeId] || 0) + 1;
            p.armyStrength += (t.attack + t.defense) * 0.1;
            recruited++;
        } else break;
    }
    if (recruited > 0) {
        notify(`Recruited ${recruited}× ${t.icon} ${t.name}`, 'good');
    } else {
        notify('Not enough resources!', 'warn');
    }
    switchTab('troops');
};

// ---- Map Mode ----
window.setMapMode = function (mode) {
    G.mapMode = mode;
    document.querySelectorAll('.map-mode-btn').forEach(b => b.classList.remove('active'));
    const el = document.getElementById('mode-' + mode);
    if (el) el.classList.add('active');
};


// ================== UTILITY ==================
function blendColor(c1, c2, ratio) {
    const r1 = parseInt(c1.slice(1, 3), 16), g1 = parseInt(c1.slice(3, 5), 16), b1 = parseInt(c1.slice(5, 7), 16);
    const r2 = parseInt(c2.slice(1, 3), 16), g2 = parseInt(c2.slice(3, 5), 16), b2 = parseInt(c2.slice(5, 7), 16);
    const r = Math.round(r1 + (r2 - r1) * ratio), g = Math.round(g1 + (g2 - g1) * ratio), b = Math.round(b1 + (b2 - b1) * ratio);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function lightenColor(hex, amt) {
    try {
        let r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
        r = Math.min(255, r + amt); g = Math.min(255, g + amt); b = Math.min(255, b + amt);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    } catch (e) { return hex; }
}
