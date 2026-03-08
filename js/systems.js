// ============================================
// GLOBAL DOMINATION — Systems
// Diplomacy, Military, AI, Research, Events
// ============================================

// ================== DIPLOMACY ==================
function getRelation(c1, c2Id) { return c1.relations[c2Id] || 0; }

function changeRelation(c1, c2Id, amount) {
    c1.relations[c2Id] = Math.max(-100, Math.min(100, (c1.relations[c2Id] || 0) + amount));
    const c2 = getC(c2Id);
    if (c2) c2.relations[c1.id] = Math.max(-100, Math.min(100, (c2.relations[c1.id] || 0) + amount));
}

function declareWar(attacker, defender) {
    if (!attacker || !defender || attacker.id === defender.id) return;
    if (attacker.atWar.includes(defender.id)) return;
    if (attacker.pacts.includes(defender.id)) {
        if (attacker.isPlayer) { notify(`Cannot attack ${defender.name} — non-aggression pact active.`, 'warn'); return; }
        else return;
    }
    if (attacker.allies.includes(defender.id)) {
        // Break alliance first
        attacker.allies = attacker.allies.filter(a => a !== defender.id);
        defender.allies = defender.allies.filter(a => a !== attacker.id);
    }

    attacker.atWar.push(defender.id);
    defender.atWar.push(attacker.id);
    changeRelation(attacker, defender.id, -80);

    // Create war tracker
    G.wars.push({
        attacker: attacker.id,
        defender: defender.id,
        progress: 50, // 0=defender wins completely, 100=attacker wins completely
        startTurn: G.turn
    });

    const msg = `⚔️ ${attacker.name} declared WAR on ${defender.name}!`;
    notify(msg, 'war');

    // Allies join
    attacker.allies.forEach(aId => {
        const ally = getC(aId);
        if (ally && !ally.atWar.includes(defender.id)) {
            ally.atWar.push(defender.id);
            defender.atWar.push(ally.id);
            G.wars.push({ attacker: ally.id, defender: defender.id, progress: 50, startTurn: G.turn });
        }
    });
    defender.allies.forEach(aId => {
        const ally = getC(aId);
        if (ally && !ally.atWar.includes(attacker.id)) {
            ally.atWar.push(attacker.id);
            attacker.atWar.push(ally.id);
            G.wars.push({ attacker: attacker.id, defender: ally.id, progress: 50, startTurn: G.turn });
        }
    });
}

function makePeace(c1Id, c2Id) {
    const c1 = getC(c1Id), c2 = getC(c2Id);
    if (!c1 || !c2) return;
    c1.atWar = c1.atWar.filter(w => w !== c2Id);
    c2.atWar = c2.atWar.filter(w => w !== c1Id);
    G.wars = G.wars.filter(w => !((w.attacker === c1Id && w.defender === c2Id) || (w.attacker === c2Id && w.defender === c1Id)));
    changeRelation(c1, c2Id, 20);
    notify(`🕊️ Peace between ${c1.name} and ${c2.name}.`, 'good');
}

// ================== WAR PROCESSING ==================
function processWars() {
    G.wars.forEach(war => {
        const atk = getC(war.attacker);
        const def = getC(war.defender);
        if (!atk || !def) return;

        // Compare strengths
        const atkPow = atk.armyStrength * (atk.hasResearched('blitzkrieg') ? 1.25 : 1.0) * (atk.stability / 100);
        const defPow = def.armyStrength * (def.hasResearched('fortifications') ? 1.3 : 1.0) * (def.stability / 100);
        const total = atkPow + defPow;
        if (total === 0) return;

        const atkChance = atkPow / total;
        const shift = (Math.random() < atkChance ? 1 : -1) * (0.3 + Math.random() * 0.5);
        war.progress = Math.max(0, Math.min(100, war.progress + shift));

        // Attrition
        atk.armyStrength = Math.max(1, atk.armyStrength - 0.08);
        def.armyStrength = Math.max(1, def.armyStrength - 0.06);
        atk.manpower = Math.max(0, atk.manpower - 0.2);
        def.manpower = Math.max(0, def.manpower - 0.15);

        // Attacker victory
        if (war.progress >= 95) {
            atk.conqueredTerritories.push(def.id);
            def.color = atk.color; // territory changes color
            def.armyStrength *= 0.3;
            makePeace(atk.id, def.id);
            notify(`🏆 ${atk.name} has conquered ${def.name}!`, atk.isPlayer ? 'good' : 'war');
        }
        // Defender victory
        if (war.progress <= 5) {
            atk.armyStrength *= 0.5;
            makePeace(atk.id, def.id);
            notify(`🛡️ ${def.name} repelled ${atk.name}!`, def.isPlayer ? 'good' : 'event');
        }
    });
}

// ================== AI ==================
function runAI(c) {
    if (Math.random() > 0.04) return; // Only act ~4% of ticks

    // Budget management
    if (c.atWar.length > 0) {
        c.budgetMilitary = 55; c.budgetEconomy = 25; c.budgetResearch = 10; c.budgetWelfare = 10;
    } else {
        c.budgetMilitary = 25; c.budgetEconomy = 40; c.budgetResearch = 20; c.budgetWelfare = 15;
    }

    // Pick a random neighbor
    if (c.neighbors.length === 0) return;
    const targetId = c.neighbors[Math.floor(Math.random() * c.neighbors.length)];
    const target = getC(targetId);
    if (!target) return;

    const rel = getRelation(c, targetId);

    // Consider war
    if (rel < -50 && c.armyStrength > target.armyStrength * 1.3 && c.stability > 40 && !c.atWar.includes(targetId) && !c.pacts.includes(targetId)) {
        declareWar(c, target);
        return;
    }

    // Consider alliance
    if (rel > 60 && !c.allies.includes(targetId) && !c.atWar.includes(targetId) && Math.random() < 0.3) {
        c.allies.push(targetId);
        target.allies.push(c.id);
        return;
    }

    // Drift relations
    if (rel < 0 && Math.random() < 0.4) changeRelation(c, targetId, -1);
    else if (rel >= 0 && Math.random() < 0.3) changeRelation(c, targetId, 1);

    // Consider making peace if losing
    c.atWar.forEach(enemyId => {
        const war = G.wars.find(w =>
            (w.attacker === c.id && w.defender === enemyId) ||
            (w.attacker === enemyId && w.defender === c.id)
        );
        if (!war) return;
        const isAttacker = war.attacker === c.id;
        const losing = isAttacker ? war.progress < 25 : war.progress > 75;
        if (losing && c.armyStrength < 10 && Math.random() < 0.15) {
            makePeace(c.id, enemyId);
        }
    });
}

// ================== TECH TREE ==================
const TECHS = [
    { id: 'trade_networks', name: '📦 Trade Networks', desc: '+20% income from trade', cost: 15, category: 'economy', requires: [], effect: c => { c.techLevel += 0.1; } },
    { id: 'tax_reform', name: '💹 Tax Reform', desc: '+15% tax efficiency', cost: 20, category: 'economy', requires: ['trade_networks'], effect: c => { c.gdp *= 1.15; c.techLevel += 0.1; } },
    { id: 'conscription', name: '🎖️ Conscription', desc: '+50% recruitment rate', cost: 12, category: 'military', requires: [], effect: c => { c.techLevel += 0.1; } },
    { id: 'blitzkrieg', name: '⚡ Blitzkrieg Doctrine', desc: '+25% attack power', cost: 25, category: 'military', requires: ['conscription'], effect: c => { c.techLevel += 0.2; } },
    { id: 'fortifications', name: '🏰 Fortifications', desc: '+30% defense power', cost: 20, category: 'military', requires: [], effect: c => { c.techLevel += 0.1; } },
    { id: 'propaganda', name: '📰 Propaganda', desc: '+10 stability', cost: 10, category: 'diplomacy', requires: [], effect: c => { c.techLevel += 0.1; } },
    { id: 'spy_network', name: '🕵️ Spy Network', desc: 'See enemy army strength', cost: 18, category: 'diplomacy', requires: ['propaganda'], effect: c => { c.techLevel += 0.1; } },
    { id: 'advanced_labs', name: '🧪 Advanced Labs', desc: '+40% research speed', cost: 30, category: 'research', requires: ['trade_networks'], effect: c => { c.techLevel += 0.2; } },
    { id: 'nuclear_program', name: '☢️ Nuclear Program', desc: 'Ultimate deterrent (+50 army)', cost: 50, category: 'military', requires: ['advanced_labs', 'blitzkrieg'], effect: c => { c.armyStrength += 50; c.techLevel += 0.5; } },
    { id: 'space_program', name: '🚀 Space Program', desc: '+30% GDP, ultimate prestige', cost: 60, category: 'research', requires: ['advanced_labs'], effect: c => { c.gdp *= 1.3; c.techLevel += 0.3; } },
];

// ================== RANDOM EVENTS ==================
const RANDOM_EVENTS = [
    {
        icon: '📈', title: 'Economic Boom',
        desc: 'Your economy is thriving! Foreign investors are pouring in. ',
        effects: [{ text: '+$200B Treasury', type: 'positive' }],
        apply: p => { p.treasury += 200; }
    },
    {
        icon: '📉', title: 'Recession',
        desc: 'Global markets have crashed. Your economy takes a hit.',
        effects: [{ text: '-$150B Treasury', type: 'negative' }, { text: '-5 Stability', type: 'negative' }],
        apply: p => { p.treasury -= 150; p.stability = Math.max(0, p.stability - 5); }
    },
    {
        icon: '✊', title: 'Protests',
        desc: 'Citizens are unhappy with the government. Protests erupt in major cities.',
        effects: [{ text: '-10 Stability', type: 'negative' }],
        apply: p => { p.stability = Math.max(0, p.stability - 10); }
    },
    {
        icon: '🛢️', title: 'Oil Discovery',
        desc: 'Massive oil reserves discovered! Your GDP increases.',
        effects: [{ text: '+10% GDP', type: 'positive' }, { text: '+$300B', type: 'positive' }],
        apply: p => { p.gdp *= 1.1; p.treasury += 300; }
    },
    {
        icon: '🌪️', title: 'Natural Disaster',
        desc: 'A devastating hurricane has struck your coastal regions.',
        effects: [{ text: '-$200B Treasury', type: 'negative' }, { text: '-5K Manpower', type: 'negative' }],
        apply: p => { p.treasury -= 200; p.manpower = Math.max(0, p.manpower - 5); }
    },
    {
        icon: '🎉', title: 'Golden Age',
        desc: 'Culture and science flourish! Your nation enters a golden age.',
        effects: [{ text: '+15 Stability', type: 'positive' }, { text: '+$100B', type: 'positive' }],
        apply: p => { p.stability = Math.min(100, p.stability + 15); p.treasury += 100; }
    },
    {
        icon: '🦠', title: 'Pandemic',
        desc: 'A new virus is spreading rapidly through the population.',
        effects: [{ text: '-10K Manpower', type: 'negative' }, { text: '-$100B', type: 'negative' }, { text: '-8 Stability', type: 'negative' }],
        apply: p => { p.manpower = Math.max(0, p.manpower - 10); p.treasury -= 100; p.stability -= 8; }
    },
    {
        icon: '🏆', title: 'Military Parade',
        desc: 'A successful military parade boosts national pride.',
        effects: [{ text: '+10 Stability', type: 'positive' }, { text: '+5 Army', type: 'positive' }],
        apply: p => { p.stability = Math.min(100, p.stability + 10); p.armyStrength += 5; }
    },
    {
        icon: '💎', title: 'Rare Minerals Found',
        desc: 'Rare earth minerals discovered. Export revenue increases.',
        effects: [{ text: '+$250B Treasury', type: 'positive' }],
        apply: p => { p.treasury += 250; }
    },
    {
        icon: '🏴‍☠️', title: 'Piracy Surge',
        desc: 'Pirates disrupt your trade routes.',
        effects: [{ text: '-5% GDP', type: 'negative' }],
        apply: p => { p.gdp *= 0.95; }
    }
];

function triggerRandomEvent() {
    const evt = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
    showEventModal(evt);
}

function showEventModal(evt) {
    G.isPaused = true; // Pause during event
    const modal = document.getElementById('event-modal');
    document.getElementById('event-icon').textContent = evt.icon;
    document.getElementById('event-title').textContent = evt.title;
    document.getElementById('event-desc').textContent = evt.desc;

    const effectsDiv = document.getElementById('event-effects');
    effectsDiv.innerHTML = '';
    evt.effects.forEach(e => {
        const el = document.createElement('div');
        el.className = 'event-effect ' + e.type;
        el.textContent = e.text;
        effectsDiv.appendChild(el);
    });

    const actionsDiv = document.getElementById('event-actions');
    actionsDiv.innerHTML = '';
    const btn = document.createElement('button');
    btn.className = 'event-btn accept';
    btn.textContent = 'Acknowledge';
    btn.onclick = () => {
        evt.apply(playerC());
        modal.style.display = 'none';
        G.isPaused = false;
        notify(`${evt.icon} ${evt.title}`, 'event');
    };
    actionsDiv.appendChild(btn);
    modal.style.display = 'flex';
}

// ================== PLAYER ACTIONS ==================
window.playerImproveRelations = function (targetId) {
    const p = playerC(), t = getC(targetId);
    if (!t) return;
    if (p.treasury < 5) { notify('Not enough funds ($5B required).', 'warn'); return; }
    p.treasury -= 5;
    changeRelation(p, targetId, 12);
    notify(`🤝 Relations with ${t.name} improved.`, 'good');
    if (window.broadcastAction) broadcastAction('RELATIONS', targetId);
    refreshPanels();
};

window.playerDeclareWar = function (targetId) {
    const p = playerC(), t = getC(targetId);
    if (!t) return;
    if (getRelation(p, targetId) > 30) { notify('Relations too high to justify war.', 'warn'); return; }
    declareWar(p, t);
    if (window.broadcastAction) broadcastAction('WAR', targetId);
    refreshPanels();
};

window.playerFormAlliance = function (targetId) {
    const p = playerC(), t = getC(targetId);
    if (!t) return;
    if (p.allies.includes(targetId)) { notify('Already allied.', 'warn'); return; }
    if (getRelation(p, targetId) < 50) { notify(`${t.name} refuses — relations too low (need 50+).`, 'warn'); return; }
    p.allies.push(targetId);
    t.allies.push(p.id);
    notify(`🛡️ Alliance formed with ${t.name}!`, 'good');
    if (window.broadcastAction) broadcastAction('ALLIANCE', targetId);
    refreshPanels();
};

window.playerSignPact = function (targetId) {
    const p = playerC(), t = getC(targetId);
    if (!t) return;
    if (p.pacts.includes(targetId)) { notify('Pact already active.', 'warn'); return; }
    if (getRelation(p, targetId) < 0) { notify(`${t.name} refuses — relations too low.`, 'warn'); return; }
    p.pacts.push(targetId);
    t.pacts.push(p.id);
    changeRelation(p, targetId, 15);
    notify(`📜 Non-aggression pact signed with ${t.name}.`, 'good');
    if (window.broadcastAction) broadcastAction('PACT', targetId);
    refreshPanels();
};

window.playerMakePeace = function (targetId) {
    makePeace(G.player, targetId);
    if (window.broadcastAction) broadcastAction('PEACE', targetId);
    refreshPanels();
};

function refreshPanels() {
    if (G.selectedId) openCountryPanel(getC(G.selectedId));
    const tabBody = document.getElementById('tab-panel-body');
    if (tabBody.innerHTML && G.currentTab !== 'overview') switchTab(G.currentTab);
}
