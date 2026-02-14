// Dummynation Clone - Complex Logic
// Author: Veladhithya5-oss
// Features: Full GeoJSON Map (Requires Server/Online), AI, Diplomacy, Save/Load

const canvas = document.getElementById('map-canvas');
const ctx = canvas.getContext('2d');
let width, height;

// Configuration
const MAP_URL = 'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson';
const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1'];
const RELATION_THRESHOLD_WAR = -50;
const RELATION_THRESHOLD_ALLIANCE = 50;

// Game State
let gameState = {
    countries: [], // Array of Country objects
    playerCountryId: null, // ID of player's country
    turn: 0,
    money: 500, // Millions
    manpower: 100, // Thousands
    research: 1.0,
    date: new Date(2024, 0, 1),
    speed: 1, // 0=Paused, 1=Normal, 5=Fast
    isPaused: false,

    // Camera
    zoom: 1,
    panX: 0,
    panY: 0,

    // UI Interaction
    selectedCountryId: null,
    hoveredCountryId: null,
    isDragging: false,
    lastMouseX: 0,
    lastMouseY: 0,
    currentMode: 'diplomacy' // diplomacy, military, economy, research
};

// Data Helpers
const COUNTRY_DATA = {
    // Basic stats for fallback
    'USA': { gdp: 25000, pop: 331, mil: 100, color: '#3b82f6' },
    'CHN': { gdp: 18000, pop: 1400, mil: 90, color: '#ef4444' },
    'RUS': { gdp: 1700, pop: 144, mil: 85, color: '#b91c1c' },
    'IND': { gdp: 3000, pop: 1380, mil: 70, color: '#f97316' },
    'DEU': { gdp: 4000, pop: 83, mil: 60, color: '#10b981' },
    'FRA': { gdp: 2900, pop: 67, mil: 65, color: '#3b82f6' },
    'GBR': { gdp: 3100, pop: 67, mil: 65, color: '#8b5cf6' },
    'BRA': { gdp: 1600, pop: 212, mil: 45, color: '#22c55e' },
    'JPN': { gdp: 4900, pop: 125, mil: 55, color: '#ef4444' },
    // others will be generated procedurally
};

// Classes
class Country {
    constructor(feature) {
        this.id = feature.id || feature.properties.name.substring(0, 3).toUpperCase();
        this.name = feature.properties.name;
        this.paths = this.parseGeometry(feature.geometry);
        this.center = this.calculateCenter();

        // Stats
        const data = COUNTRY_DATA[this.id] || this.generateStats();
        this.gdp = data.gdp;
        this.population = data.pop;
        this.military = data.mil;
        this.color = data.color || this.randomColor();
        this.originalColor = this.color;

        // State
        this.money = this.gdp / 10;
        this.manpower = this.population * 10;
        this.relations = {};
        this.isAtWar = [];
        this.isAllied = [];
    }

    parseGeometry(geometry) {
        let paths = [];
        if (geometry.type === 'Polygon') {
            paths.push(geometry.coordinates[0]);
        } else if (geometry.type === 'MultiPolygon') {
            geometry.coordinates.forEach(poly => paths.push(poly[0]));
        }
        return paths;
    }

    calculateCenter() {
        let x = 0, y = 0, pts = 0;
        this.paths.forEach(path => {
            path.forEach(pt => {
                x += pt[0];
                y += pt[1];
                pts++;
            });
        });
        return { x: x / (pts || 1), y: y / (pts || 1) };
    }

    generateStats() {
        return {
            gdp: 10 + Math.random() * 500,
            pop: 1 + Math.random() * 50,
            mil: 10 + Math.random() * 30,
            color: '#64748b'
        };
    }

    randomColor() {
        return COLORS[Math.floor(Math.random() * COLORS.length)];
    }
}

// Initialization
async function init() {
    resize();
    window.addEventListener('resize', resize);

    // Canvas Events
    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('wheel', onScroll);

    // Fetch Map
    try {
        const response = await fetch(MAP_URL);
        const data = await response.json();

        // Process Data
        gameState.countries = data.features.map(f => new Country(f));

        // Setup Player
        const player = gameState.countries.find(c => c.name === 'United States');
        if (player) gameState.playerCountryId = player.id;
        else gameState.playerCountryId = gameState.countries[0].id;

        // Auto-Zoom to map
        gameState.zoom = 5;
        gameState.panX = width / 2;
        gameState.panY = height / 2;

        document.getElementById('loading-screen').style.display = 'none';
        startGameLoop();
        showNotification("Welcome, Commander. The world awaits your orders.");

    } catch (e) {
        console.error("Failed to load map:", e);
        document.querySelector('.loading-text').innerText = "Error: Open this site on a server (GitHub Pages/Vercel) to see the map.";
    }
}

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

// Game Loop
function startGameLoop() {
    requestAnimationFrame(render);
    setInterval(gameTick, 1000);
}

function gameTick() {
    if (gameState.isPaused) return;

    // Advance Date
    gameState.date.setDate(gameState.date.getDate() + 1);
    updateDateDisplay();

    // Logic for all countries
    gameState.countries.forEach(c => {
        c.money += (c.gdp / 365) * 0.1;
        c.manpower = Math.min(c.manpower + (c.population / 365) * 0.5, c.population * 20);

        if (c.id !== gameState.playerCountryId) {
            runAI(c);
        }
    });

    const player = getCountry(gameState.playerCountryId);
    if (player) {
        gameState.money = player.money;
        gameState.manpower = player.manpower;
        updateStatsUI();
        if (gameState.selectedCountryId) {
            updatePanel(getCountry(gameState.selectedCountryId));
        }
    }
}

function runAI(country) {
    if (Math.random() > 0.05) return;

    const target = gameState.countries[Math.floor(Math.random() * gameState.countries.length)];
    if (target.id === country.id) return;

    const relation = getRelation(country, target.id);

    if (relation < RELATION_THRESHOLD_WAR) {
        if (!country.isAtWar.includes(target.id) && country.military > target.military * 1.2) {
            declareWar(country, target);
        }
    } else if (relation > 20) {
        improveRelations(country, target, 1);
    } else {
        changeRelation(country, target.id, (Math.random() - 0.5) * 2);
    }
}

// Diplomacy System
function getRelation(c1, c2Id) {
    return c1.relations[c2Id] || 0;
}

function changeRelation(c1, c2Id, amount) {
    const old = c1.relations[c2Id] || 0;
    c1.relations[c2Id] = Math.max(-100, Math.min(100, old + amount));
    const c2 = getCountry(c2Id);
    if (c2) {
        const old2 = c2.relations[c1.id] || 0;
        c2.relations[c1.id] = Math.max(-100, Math.min(100, old2 + amount));
    }
}

function improveRelations(c1, c2, amount) {
    changeRelation(c1, c2.id, amount);
}

function actionImproveRelations() {
    const player = getCountry(gameState.playerCountryId);
    const target = getCountry(gameState.selectedCountryId);
    if (!target || player.money < 5) {
        showNotification("Not enough funds ($5M required).");
        return;
    }

    player.money -= 5;
    changeRelation(player, target.id, 10);
    showNotification(`Relations with ${target.name} improved.`);
    updatePanel(target);
}

function actionDeclareWar() {
    const player = getCountry(gameState.playerCountryId);
    const target = getCountry(gameState.selectedCountryId);
    declareWar(player, target);
}

function declareWar(attacker, defender) {
    if (attacker.isAtWar.includes(defender.id)) return;

    attacker.isAtWar.push(defender.id);
    defender.isAtWar.push(attacker.id);
    changeRelation(attacker, defender.id, -100);

    if (attacker.id === gameState.playerCountryId || defender.id === gameState.playerCountryId) {
        showNotification(`${attacker.name} has declared WAR on ${defender.name}!`);
    }
}

function actionAlliance() {
    const player = getCountry(gameState.playerCountryId);
    const target = getCountry(gameState.selectedCountryId);
    const rel = getRelation(player, target.id);

    if (rel < RELATION_THRESHOLD_ALLIANCE) {
        showNotification(`${target.name} refuses (Relations too low).`);
        return;
    }
    player.isAllied.push(target.id);
    target.isAllied.push(player.id);
    showNotification(`Alliance formed with ${target.name}!`);
}


// UI Helpers
function updateStatsUI() {
    document.getElementById('res-money').innerText = Math.floor(gameState.money) + ' M';
    document.getElementById('res-manpower').innerText = Math.floor(gameState.manpower) + ' K';
}

function updateDateDisplay() {
    const options = { year: 'numeric', month: 'short' };
    document.getElementById('date-display').innerText = gameState.date.toLocaleDateString('en-US', options);
}

function showNotification(msg) {
    const container = document.getElementById('notifications');
    const note = document.createElement('div');
    note.className = 'notif';
    note.innerText = msg;
    container.appendChild(note);
    setTimeout(() => {
        note.style.opacity = '0';
        setTimeout(() => note.remove(), 300);
    }, 4000);
}

function togglePause() {
    gameState.isPaused = !gameState.isPaused;
    document.getElementById('pause-btn').innerText = gameState.isPaused ? '▶️' : '⏸️';
}

function getCountry(id) {
    return gameState.countries.find(c => c.id === id);
}

function updatePanel(c) {
    if (!c) return;
    document.getElementById('panel-title').innerText = c.name;
    document.getElementById('panel-gdp').innerText = `$${Math.floor(c.gdp)} B`;
    document.getElementById('panel-pop').innerText = `${Math.floor(c.population)} M`;
    document.getElementById('panel-mil').innerText = Math.floor(c.military);

    const player = getCountry(gameState.playerCountryId);
    let rel = 0;
    if (player && c.id !== player.id) {
        rel = getRelation(player, c.id);
    }
    const bar = document.getElementById('relations-bar');
    bar.style.width = `${(rel + 100) / 2}%`;

    let status = "Neutral";
    if (rel > 50) status = "Friendly";
    if (rel > 80) status = "Ally";
    if (rel < -20) status = "Tense";
    if (rel < -50) status = "Hostile";
    if (player.isAtWar.includes(c.id)) status = "WAR";

    document.getElementById('relations-val').innerText = `${status} (${Math.floor(rel)})`;

    const analysis = document.getElementById('panel-analysis');
    if (c.id === player.id) {
        analysis.innerText = "Your nation.";
    } else if (player.isAtWar.includes(c.id)) {
        analysis.innerText = "Active Combatant.";
        analysis.style.color = '#f87171';
    } else {
        analysis.innerText = c.gdp > player.gdp ? "Strategic Threat." : "Expansion Opportunity.";
        analysis.style.color = '#94a3b8';
    }
}

function closePanel() {
    gameState.selectedCountryId = null;
    document.getElementById('country-panel').classList.remove('open');
}

// Rendering
function render() {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(gameState.panX, gameState.panY);
    ctx.scale(gameState.zoom, gameState.zoom);

    gameState.countries.forEach(c => {
        ctx.beginPath();
        c.paths.forEach(poly => {
            const SCALE = 3;
            if (poly.length > 0) {
                ctx.moveTo(poly[0][0] * SCALE + width / 2, -poly[0][1] * SCALE + height / 2);
                for (let i = 1; i < poly.length; i++) {
                    ctx.lineTo(poly[i][0] * SCALE + width / 2, -poly[i][1] * SCALE + height / 2);
                }
            }
        });
        ctx.closePath();

        const player = getCountry(gameState.playerCountryId);
        const isSelected = gameState.selectedCountryId === c.id;
        const isHovered = gameState.hoveredCountryId === c.id;
        const isPlayer = c.id === gameState.playerCountryId;

        ctx.fillStyle = '#334155';
        if (c.color) ctx.fillStyle = c.color;

        if (isPlayer) {
            ctx.fillStyle = '#3b82f6';
        } else if (player && player.isAtWar.includes(c.id)) {
            ctx.fillStyle = '#ef4444';
        } else if (player && player.isAllied.includes(c.id)) {
            ctx.fillStyle = '#10b981';
        }

        if (isSelected) ctx.fillStyle = '#eab308';
        if (isHovered && !isSelected) ctx.fillStyle = '#64748b';

        ctx.fill();
        ctx.lineWidth = 0.5 / gameState.zoom;
        ctx.strokeStyle = '#000';
        ctx.stroke();
    });

    ctx.restore();
    requestAnimationFrame(render);
}

// Interaction Logic
function onMouseDown(e) {
    gameState.isDragging = true;
    gameState.lastMouseX = e.clientX;
    gameState.lastMouseY = e.clientY;

    // Hit Detection (Approximate)
    const clickX = (e.clientX - gameState.panX) / gameState.zoom - width / 2;
    const clickY = -((e.clientY - gameState.panY) / gameState.zoom - height / 2);

    let bestDist = 200;
    let bestC = null;
    const SCALE = 3;

    gameState.countries.forEach(c => {
        const cx = c.center.x * SCALE;
        const cy = c.center.y * SCALE;
        const dist = Math.sqrt((cx - clickX) ** 2 + (cy - clickY) ** 2);

        if (dist < bestDist) {
            bestDist = dist;
            bestC = c;
        }
    });

    if (bestC) {
        gameState.selectedCountryId = bestC.id;
        document.getElementById('country-panel').classList.add('open');
        updatePanel(bestC);
    }
}

function onMouseMove(e) {
    if (gameState.isDragging) {
        gameState.panX += e.clientX - gameState.lastMouseX;
        gameState.panY += e.clientY - gameState.lastMouseY;
        gameState.lastMouseX = e.clientX;
        gameState.lastMouseY = e.clientY;
    }
}

function onMouseUp() {
    gameState.isDragging = false;
}

function onScroll(e) {
    e.preventDefault();
    const zoomSpeed = 0.1;
    const delta = -Math.sign(e.deltaY);
    const newZoom = gameState.zoom * (1 + delta * zoomSpeed);
    gameState.zoom = Math.min(Math.max(newZoom, 0.5), 50);
}

// Saving / Loading
window.saveGame = function () {
    const data = {
        countries: gameState.countries,
        player: gameState.playerCountryId,
        date: gameState.date,
        money: gameState.money
    };
    try {
        localStorage.setItem('dummynation_save', JSON.stringify(data));
        showNotification("Game Saved Successfully.");
    } catch (e) {
        showNotification("Error saving game.");
    }
}

window.loadGame = function () {
    const json = localStorage.getItem('dummynation_save');
    if (!json) {
        showNotification("No save file found.");
        return;
    }
    try {
        const data = JSON.parse(json);
        gameState.playerCountryId = data.player;
        gameState.money = data.money;
        gameState.date = new Date(data.date);

        data.countries.forEach(savedC => {
            const liveC = gameState.countries.find(c => c.id === savedC.id);
            if (liveC) {
                liveC.money = savedC.money;
                liveC.relations = savedC.relations;
                liveC.isAtWar = savedC.isAtWar;
            }
        });
        showNotification("Game Loaded.");
    } catch (e) {
        showNotification("Save file corrupted.");
    }
}

window.setMode = function (mode) {
    gameState.currentMode = mode;
    document.querySelectorAll('.action-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('mode-' + mode).classList.add('active');
    showNotification("Mode switched: " + mode.charAt(0).toUpperCase() + mode.slice(1));
}

init();
