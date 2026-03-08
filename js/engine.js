// ============================================
// GLOBAL DOMINATION — Core Engine
// ============================================

// ---- Constants ----
const SCALE = 4;
const TICK_MS = 800;
const COLORS_POOL = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#06b6d4',
    '#84cc16', '#e11d48', '#7c3aed', '#0ea5e9', '#d946ef',
    '#64748b', '#78716c', '#059669', '#dc2626', '#2563eb',
    '#9333ea', '#c026d3', '#ea580c', '#0d9488', '#4f46e5'
];

// ---- Player Colors for Multiplayer ----
const PLAYER_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];

// ---- Game State ----
const G = {
    countries: [],
    player: null,       // Current active player ID
    turn: 0,
    date: new Date(2024, 0, 1),
    speed: 1,
    isPaused: false,
    zoom: 1,
    panX: 0, panY: 0,
    selectedId: null,
    hoveredId: null,
    isDragging: false,
    dragMoved: false,
    lastMX: 0, lastMY: 0,
    currentTab: 'overview',
    wars: [],
    events: [],
    techQueue: null,
    techProgress: 0,
    tickTimer: null,
    mapMode: 'countries', // countries, population, military

    // Multiplayer / Networking
    mode: 'single',         // 'single' or 'multi'
    players: [],            // Array of player IDs
    playerCount: 1,
    currentPlayerIdx: 0,
    mpPickIdx: 0,
    mpTechQueues: {},
    mpTicksPerTurn: 10,

    isOnline: false,
    isHost: false,
    peer: null,
    conn: null,
    onlineReady: false
};

// ---- Country Class ----
class Country {
    constructor(data, index) {
        this.id = data.id;
        this.name = data.properties.name;
        this.flag = data.flag || '🏳️';
        this.paths = this._parsePaths(data.geometry);
        this.center = this._calcCenter();
        this.color = COLORS_POOL[index % COLORS_POOL.length];
        this.originalColor = this.color;

        const s = data.stats || { gdp: 50 + Math.random() * 200, pop: 5 + Math.random() * 50, mil: 10 + Math.random() * 30 };
        this.gdp = s.gdp;
        this.population = s.pop;
        this.baseMilitary = s.mil;

        // Economy
        this.treasury = s.gdp * 0.4;
        this.income = 0;
        this.expenses = 0;
        this.taxRate = 50;

        // Sliders (% allocation, must sum to 100)
        this.budgetMilitary = 30;
        this.budgetEconomy = 40;
        this.budgetResearch = 15;
        this.budgetWelfare = 15;

        // Military
        this.armyStrength = s.mil;
        this.manpower = s.pop * 8;
        this.maxManpower = s.pop * 15;
        this.armyUpkeep = 0;
        this.recruitRate = 0;
        this.militaryOrder = 'defend'; // attack, spread, defend

        // Diplomacy
        this.relations = {};
        this.atWar = [];
        this.allies = [];
        this.pacts = []; // non-aggression
        this.coalition = null;

        // Stability & overextension
        this.stability = 100;
        this.overextension = 0;
        this.conqueredTerritories = [];

        // Governance & Policies
        this.governmentType = 'democracy'; // democracy, authoritarian, oligarchy
        this.economicPolicy = 'mixed'; // free_market, mixed, planned
        this.conscriptionLaw = 'volunteer'; // volunteer, limited, extensive

        // Troops
        this.troops = {
            infantry: Math.floor(s.mil * 8),
            artillery: Math.floor(s.mil * 1.5),
            tank: Math.floor(s.mil * 0.8),
            navy: Math.floor(s.mil * 0.4),
            airforce: Math.floor(s.mil * 0.3),
            special: Math.floor(s.mil * 0.1),
            nuclear: s.mil >= 80 ? 1 : 0
        };

        // Tech
        this.techLevel = 1.0;
        this.researchedTechs = [];

        // Neighbors
        this.neighbors = (window.NEIGHBOR_MAP && window.NEIGHBOR_MAP[this.id]) || [];
    }

    _parsePaths(geom) {
        let paths = [];
        if (geom.type === 'Polygon') paths.push(geom.coordinates[0]);
        else if (geom.type === 'MultiPolygon') geom.coordinates.forEach(p => paths.push(p[0]));
        return paths;
    }

    _calcCenter() {
        let x = 0, y = 0, n = 0;
        this.paths.forEach(p => p.forEach(pt => { x += pt[0]; y += pt[1]; n++; }));
        return { x: x / (n || 1), y: y / (n || 1) };
    }

    get isPlayer() { return this.id === G.player; }
    get isHumanPlayer() { return G.players.includes(this.id); }

    getNetIncome() {
        let taxEfficiency = 1.0;
        if (this.governmentType === 'authoritarian') taxEfficiency = 1.15;
        if (this.economicPolicy === 'planned') taxEfficiency = 1.1;
        if (this.economicPolicy === 'free_market') taxEfficiency = 0.85;

        const taxIncome = this.gdp * (this.taxRate / 100) * 0.01 * taxEfficiency;

        let tradeMult = 0.002;
        if (this.economicPolicy === 'free_market') tradeMult = 0.0035;
        if (this.economicPolicy === 'planned') tradeMult = 0.001;

        const tradeIncome = this.gdp * tradeMult * (this.allies.length + 1);
        const techBonus = this.hasResearched('trade_networks') ? 1.2 : 1.0;
        this.income = (taxIncome + tradeIncome) * techBonus;

        const armyCost = this.armyStrength * 0.15;
        const welfareCost = this.population * 0.005 * (this.budgetWelfare / 100);
        const researchCost = this.budgetResearch * 0.1;
        this.armyUpkeep = armyCost;
        this.expenses = armyCost + welfareCost + researchCost;

        return this.income - this.expenses;
    }

    hasResearched(techId) {
        return this.researchedTechs.includes(techId);
    }

    calcStability() {
        let stab = 100;
        // Overextension penalty
        const conqueredPct = this.conqueredTerritories.length * 12;
        this.overextension = conqueredPct;
        stab -= conqueredPct;
        // War penalty
        stab -= this.atWar.length * 8;
        // Low treasury
        if (this.treasury < 0) stab -= 15;
        // Welfare bonus
        stab += (this.budgetWelfare / 100) * 10;
        // Tech bonus
        if (this.hasResearched('propaganda')) stab += 10;

        // Governance modifiers
        if (this.governmentType === 'authoritarian') {
            stab += 15; // Iron fist stability
        } else if (this.governmentType === 'democracy') {
            // Democracies hate high taxes and high war
            if (this.taxRate > 60) stab -= 15;
            stab -= this.atWar.length * 5;
        } else if (this.governmentType === 'oligarchy') {
            // Oligarchy hates high welfare
            if (this.budgetWelfare > 20) stab -= 10;
        }

        // Conscription penalties
        if (this.conscriptionLaw === 'extensive') stab -= 15;
        else if (this.conscriptionLaw === 'limited') stab -= 5;

        this.stability = Math.max(0, Math.min(100, stab));
    }
}

// ---- Initialization ----
let canvas, ctx, W, H;

function setupCanvas() {
    canvas = document.getElementById('map-canvas');
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
}

function resize() {
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.scale(dpr, dpr);
}

// ============================================
// AUTH SYSTEM (localStorage-based)
// ============================================
let currentUser = null;

window.showAuth = function () {
    document.getElementById('start-page').style.display = 'none';
    document.getElementById('auth-screen').style.display = 'flex';
};

window.backToStart = function () {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('start-page').style.display = 'flex';
};

window.switchAuthTab = function (tab) {
    document.getElementById('auth-signin-tab').classList.toggle('active', tab === 'signin');
    document.getElementById('auth-signup-tab').classList.toggle('active', tab === 'signup');
    document.getElementById('signin-form').style.display = tab === 'signin' ? 'flex' : 'none';
    document.getElementById('signup-form').style.display = tab === 'signup' ? 'flex' : 'none';
    document.getElementById('signin-error').textContent = '';
    document.getElementById('signup-error').textContent = '';
};

function getUsers() {
    try { return JSON.parse(localStorage.getItem('gdom_users') || '{}'); }
    catch { return {}; }
}
function saveUsers(users) {
    localStorage.setItem('gdom_users', JSON.stringify(users));
}

window.signIn = function () {
    const username = document.getElementById('signin-username').value.trim();
    const password = document.getElementById('signin-password').value;
    const errEl = document.getElementById('signin-error');

    if (!username || !password) { errEl.textContent = 'Please fill in all fields.'; return; }

    const users = getUsers();
    if (!users[username]) { errEl.textContent = 'Account not found. Try signing up.'; return; }
    if (users[username].password !== password) { errEl.textContent = 'Incorrect password.'; return; }

    currentUser = username;
    users[username].lastLogin = new Date().toISOString();
    saveUsers(users);
    enterGame();
};

window.signUp = function () {
    const username = document.getElementById('signup-username').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirm = document.getElementById('signup-confirm').value;
    const errEl = document.getElementById('signup-error');

    if (!username || !password || !confirm) { errEl.textContent = 'Please fill in all fields.'; return; }
    if (username.length < 3) { errEl.textContent = 'Username must be at least 3 characters.'; return; }
    if (password.length < 4) { errEl.textContent = 'Password must be at least 4 characters.'; return; }
    if (password !== confirm) { errEl.textContent = 'Passwords do not match.'; return; }

    const users = getUsers();
    if (users[username]) { errEl.textContent = 'Username already taken.'; return; }

    users[username] = {
        password: password,
        created: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        wins: 0,
        gamesPlayed: 0
    };
    saveUsers(users);
    currentUser = username;
    enterGame();
};

window.playAsGuest = function () {
    currentUser = 'Guest';
    enterGame();
};

window.playAsGoogle = function () {
    const btn = document.querySelector('.auth-google-btn');
    if (btn) btn.innerHTML = 'Connecting to Google...';

    // Simulate network delay
    setTimeout(() => {
        currentUser = 'Google Commander';
        notify('Successfully signed in with Google!', 'good');
        enterGame();
    }, 1200);
};

function enterGame() {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('start-page').style.display = 'none';
    document.getElementById('loading-screen').style.display = 'flex';
    document.getElementById('game-container').style.display = 'block';
    init();
}

// ============================================
// MAP LOADING — GeoJSON from URL + offline fallback
// ============================================
const MAP_URL = 'https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json';

// Country stats lookup — used to enrich GeoJSON countries with gameplay data
const COUNTRY_STATS = {};
if (window.OFFLINE_MAP_DATA) {
    window.OFFLINE_MAP_DATA.forEach(c => {
        COUNTRY_STATS[c.id] = { flag: c.flag, stats: c.stats };
    });
}

// Map ISO A3 codes and common name variations to our IDs
// Map ISO A3 codes and common name variations to our IDs
// Map ISO A3 codes and common name variations to our IDs
const NAME_TO_ID = {
    'United States of America': 'USA', 'United States': 'USA', 'Canada': 'CAN', 'Mexico': 'MEX', 'Cuba': 'CUB', 'Guatemala': 'GTM',
    'Brazil': 'BRA', 'Argentina': 'ARG', 'Colombia': 'COL', 'Chile': 'CHL', 'Peru': 'PER',
    'Venezuela': 'VEN', 'Venezuela, RB': 'VEN', 'Bolivarian Republic of Venezuela': 'VEN',
    'Ecuador': 'ECU', 'Bolivia': 'BOL', 'Bolivia (Plurinational State of)': 'BOL',
    'Paraguay': 'PRY', 'Uruguay': 'URY',
    'United Kingdom': 'GBR', 'France': 'FRA', 'Germany': 'DEU', 'Italy': 'ITA', 'Spain': 'ESP',
    'Portugal': 'PRT', 'Poland': 'POL', 'Ukraine': 'UKR', 'Romania': 'ROU', 'Netherlands': 'NLD',
    'Belgium': 'BEL', 'Sweden': 'SWE', 'Norway': 'NOR', 'Finland': 'FIN', 'Greece': 'GRC',
    'Czech Republic': 'CZE', 'Czechia': 'CZE', 'Austria': 'AUT', 'Switzerland': 'CHE', 'Ireland': 'IRL',
    'Serbia': 'SRB', 'Hungary': 'HUN', 'Belarus': 'BLR',
    'Russia': 'RUS', 'Kazakhstan': 'KAZ', 'Uzbekistan': 'UZB',
    'China': 'CHN', 'Japan': 'JPN', 'South Korea': 'KOR', 'Korea, Rep.': 'KOR', 'Korea, South': 'KOR',
    'North Korea': 'PRK', "Dem. People's Rep. of Korea": 'PRK', 'Korea, North': 'PRK',
    'Taiwan': 'TWN', 'Taiwan, China': 'TWN', 'Mongolia': 'MNG',
    'India': 'IND', 'Pakistan': 'PAK', 'Bangladesh': 'BGD', 'Sri Lanka': 'LKA', 'Nepal': 'NPL', 'Afghanistan': 'AFG',
    'Indonesia': 'IDN', 'Thailand': 'THA', 'Vietnam': 'VNM', 'Viet Nam': 'VNM', 'Philippines': 'PHL',
    'Myanmar': 'MMR', 'Burma': 'MMR', 'Malaysia': 'MYS',
    'Turkey': 'TUR', 'Iran': 'IRN', 'Iran, Islamic Rep.': 'IRN', 'Saudi Arabia': 'SAU', 'Iraq': 'IRQ', 'Syria': 'SYR',
    'Israel': 'ISR', 'United Arab Emirates': 'ARE', 'Jordan': 'JOR', 'Yemen': 'YEM', 'Republic of Yemen': 'YEM', 'Oman': 'OMN',
    // Africa Full List
    'Egypt': 'EGY', 'Egypt, Arab Rep.': 'EGY', 'Nigeria': 'NGA', 'South Africa': 'ZAF', 'Ethiopia': 'ETH', 'Kenya': 'KEN',
    'Tanzania': 'TZA', 'United Republic of Tanzania': 'TZA', 'Democratic Republic of the Congo': 'COD', 'Congo, Dem. Rep.': 'COD',
    'Morocco': 'MAR', 'Algeria': 'DZA', 'Libya': 'LBY', 'Sudan': 'SDN', 'Ghana': 'GHA', 'Cameroon': 'CMR', 'Angola': 'AGO',
    'Mozambique': 'MOZ', 'Tunisia': 'TUN', 'Ivory Coast': 'CIV', "Côte d'Ivoire": 'CIV', 'Senegal': 'SEN', 'Mali': 'MLI',
    'Zimbabwe': 'ZWE', 'Zambia': 'ZMB', 'Uganda': 'UGA', 'Somalia': 'SOM', 'Madagascar': 'MDG', 'Botswana': 'BWA', 'Namibia': 'NAM',
    'Burkina Faso': 'BFA', 'Malawi': 'MWI', 'Niger': 'NER', 'Mali': 'MLI', 'Chad': 'TCD', 'Guinea': 'GIN', 'Rwanda': 'RWA',
    'Benin': 'BEN', 'Burundi': 'BDI', 'South Sudan': 'SSD', 'Eritrea': 'ERI', 'Sierra Leone': 'SLE', 'Togo': 'TGO',
    'Central African Republic': 'CAF', 'Congo': 'COG', 'Liberia': 'LBR', 'Mauritania': 'MRT', 'Gabon': 'GAB', 'Gambia': 'GMB',
    'Lesotho': 'LSO', 'Mauritius': 'MUS', 'Swaziland': 'SWZ', 'Eswatini': 'SWZ', 'Djibouti': 'DJI', 'Equatorial Guinea': 'GNQ',
    // Oceania
    'Australia': 'AUS', 'New Zealand': 'NZL',
    // Additional ISO mappings for robustness
    'USA': 'USA', 'CAN': 'CAN', 'MEX': 'MEX', 'BRA': 'BRA', 'ARG': 'ARG', 'GBR': 'GBR', 'FRA': 'FRA', 'DEU': 'DEU', 'CHN': 'CHN', 'IND': 'IND', 'RUS': 'RUS', 'JPN': 'JPN'
};

function parseGeoJSON(geojson) {
    const results = [];
    const features = geojson.features || [];
    features.forEach((f, i) => {
        const name = f.properties.name || f.properties.NAME || f.properties.ADMIN || f.properties.name_en || '';
        const isoA3 = f.properties.ISO_A3 || f.properties.iso_a3 || f.properties.ADM0_A3 || '';

        let id = null;
        if (NAME_TO_ID[name]) id = NAME_TO_ID[name];
        else if (NAME_TO_ID[isoA3]) id = NAME_TO_ID[isoA3];
        else if (isoA3 && isoA3 !== '-99') id = isoA3; // Fallback to ISO code as ID

        if (!id) return;

        const info = COUNTRY_STATS[id] || {};
        results.push({
            id: id,
            properties: { name: name },
            flag: info.flag || '🏳️',
            stats: info.stats || { gdp: 50 + Math.random() * 200, pop: 5 + Math.random() * 50, mil: 10 + Math.random() * 30 },
            geometry: f.geometry
        });
    });
    return results;
}

async function loadMapData() {
    // Try to fetch real GeoJSON
    try {
        const resp = await fetch(MAP_URL);
        if (resp.ok) {
            const geojson = await resp.json();
            const parsed = parseGeoJSON(geojson);
            if (parsed.length > 10) return parsed; // success
        }
    } catch (e) {
        console.log('GeoJSON fetch failed, using offline data:', e.message);
    }
    // Fallback to offline data
    return window.OFFLINE_MAP_DATA || [];
}

// ============================================
// GAME INITIALIZATION
// ============================================
async function init() {
    setupCanvas();
    setupControls();

    const bar = document.getElementById('loading-bar');
    bar.style.width = '10%';
    document.querySelector('.loading-subtitle').textContent = 'Loading world map data...';

    bar.style.width = '30%';
    const mapData = await loadMapData();

    if (!mapData || mapData.length === 0) {
        document.querySelector('.loading-subtitle').textContent = 'Error: Map data not found.';
        return;
    }

    document.querySelector('.loading-subtitle').textContent = `Loaded ${mapData.length} nations...`;
    bar.style.width = '60%';

    G.countries = mapData.map((d, i) => new Country(d, i));

    // Validate neighbors
    const ids = new Set(G.countries.map(c => c.id));
    G.countries.forEach(c => { c.neighbors = c.neighbors.filter(n => ids.has(n)); });

    bar.style.width = '80%';
    document.querySelector('.loading-subtitle').textContent = 'Initializing diplomacy...';

    // Initialize relations
    G.countries.forEach(c => {
        G.countries.forEach(o => {
            if (c.id !== o.id) {
                c.relations[o.id] = (Math.random() - 0.5) * 40;
            }
        });
    });

    bar.style.width = '100%';
    document.querySelector('.loading-subtitle').textContent = 'Ready!';

    // Show user badge
    const userBadge = document.getElementById('user-badge');
    if (userBadge) {
        if (currentUser && currentUser !== 'Guest') {
            userBadge.textContent = '👤 ' + currentUser;
        } else if (currentUser === 'Guest') {
            userBadge.textContent = '👤 Guest';
        }
    }

    setTimeout(() => {
        document.getElementById('loading-screen').style.display = 'none';
        showModeSelect();
    }, 600);
}

// ---- Mode Selection ----
function showModeSelect() {
    document.getElementById('mode-select-modal').style.display = 'flex';
}

window.selectMode = function (mode) {
    if (mode === 'single') {
        G.mode = 'single';
        G.playerCount = 1;
        G.isOnline = false;
        document.getElementById('mode-select-modal').style.display = 'none';
        G.mpPickIdx = 0;
        G.players = [];
        showCountryPicker();
    } else {
        G.mode = 'multi';
        G.isOnline = true;
        document.getElementById('mode-select-modal').style.display = 'none';
        document.getElementById('online-lobby-modal').style.display = 'flex';
    }
};

// ---- Online Lobby Logic ----
window.closeLobby = function () {
    document.getElementById('online-lobby-modal').style.display = 'none';
    document.getElementById('mode-select-modal').style.display = 'flex';
};

window.hostGame = function () {
    const code = 'gdom-' + Math.random().toString(36).substring(2, 6);
    G.isHost = true;
    G.peer = new Peer(code);

    G.peer.on('open', (id) => {
        document.getElementById('host-code-display').style.display = 'block';
        document.getElementById('room-code').textContent = id;
        notify('Lobby opened. Waiting for opponent...', 'good');
    });

    G.peer.on('connection', (conn) => {
        G.conn = conn;
        setupConnection(conn);
    });

    G.peer.on('error', (err) => {
        console.error(err);
        if (err.type === 'unavailable-id') {
            notify('ID unavailable, retrying...', 'warn');
            hostGame();
        } else {
            notify('Network error: ' + err.type, 'warn');
        }
    });
};

window.copyRoomCode = function () {
    const code = document.getElementById('room-code').textContent;
    navigator.clipboard.writeText(code).then(() => {
        notify('Room code copied to clipboard!', 'good');
    });
};

window.joinGame = function () {
    const code = document.getElementById('join-room-input').value.trim();
    if (!code) { notify('Please enter a room code.', 'warn'); return; }

    G.isHost = false;
    G.peer = new Peer();

    G.peer.on('open', (id) => {
        const conn = G.peer.connect(code);
        G.conn = conn;
        setupConnection(conn);
    });

    G.peer.on('error', (err) => {
        console.error(err);
        notify('Failed to connect to room.', 'warn');
    });
};

function setupConnection(conn) {
    conn.on('open', () => {
        notify('Connected to peer!', 'good');
        document.getElementById('online-lobby-modal').style.display = 'none';
        G.playerCount = 2;
        G.mpPickIdx = 0;
        G.players = [];
        showCountryPicker();

        // Host starts the picks
        if (G.isHost) {
            sendNetworkMessage('LOBBY_START', { msg: 'Game beginning' });
        }
    });

    conn.on('data', (data) => {
        handleNetworkData(data);
    });

    conn.on('close', () => {
        notify('Opponent disconnected.', 'warn');
        location.reload();
    });
}

function sendNetworkMessage(type, payload) {
    if (G.conn && G.conn.open) {
        G.conn.send({ type, payload });
    }
}

function handleNetworkData(data) {
    console.log('NET RECV:', data);
    const { type, payload } = data;

    switch (type) {
        case 'PICK':
            // Logic for picking a country on behalf of opponent
            receivePlayerPick(payload.id);
            break;
        case 'END_TURN':
            // Update state and start our turn
            receiveEndTurn(payload.state);
            break;
        case 'ACTION':
            // Relay actions (war, pacts, etc)
            handleRemoteAction(payload);
            break;
    }
}

function handleRemoteAction(data) {
    const { action, targetId, actorId } = data;
    const actor = getC(actorId);
    if (!actor) return;

    switch (action) {
        case 'WAR':
            declareWar(actor, getC(targetId));
            break;
        case 'PEACE':
            makePeace(actorId, targetId);
            break;
        case 'ALLIANCE':
            actor.allies.push(targetId);
            getC(targetId).allies.push(actorId);
            break;
        case 'PACT':
            actor.pacts.push(targetId);
            getC(targetId).pacts.push(actorId);
            break;
        case 'RELATIONS':
            changeRelation(actor, targetId, 12);
            break;
    }
}

window.broadcastAction = function (action, targetId) {
    if (G.isOnline) {
        sendNetworkMessage('ACTION', { action, targetId, actorId: G.player });
    }
}

function receivePlayerPick(id) {
    const c = getC(id);
    c.color = PLAYER_COLORS[G.mpPickIdx % PLAYER_COLORS.length];
    G.players.push(id);
    G.mpTechQueues[id] = { queue: null, progress: 0 };
    G.mpPickIdx++;

    if (G.mpPickIdx < G.playerCount) {
        document.getElementById('country-picker-modal').style.display = 'none';
        setTimeout(() => showCountryPicker(), 200);
    } else {
        finalizeSetup();
    }
}

function finalizeSetup() {
    G.player = G.players[0];
    G.currentPlayerIdx = 0;
    const p = getC(G.player);
    const flagEl = document.getElementById('player-flag');
    if (flagEl) flagEl.textContent = p.flag;
    const nameEl = document.getElementById('player-nation-name');
    if (nameEl) { nameEl.textContent = p.name; nameEl.style.opacity = '1'; nameEl.style.fontSize = '13px'; }
    document.getElementById('country-picker-modal').style.display = 'none';
    G.techQueue = G.mpTechQueues[G.player].queue;
    G.techProgress = G.mpTechQueues[G.player].progress;
    startGame();
}

window.setPlayerCount = function (n, btn) {
    G.playerCount = n;
    document.querySelectorAll('.pcount-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
};

window.confirmMode = function () {
    document.getElementById('mode-select-modal').style.display = 'none';
    G.mpPickIdx = 0;
    G.players = [];
    showCountryPicker();
};

function showCountryPicker() {
    const modal = document.getElementById('country-picker-modal');
    const grid = document.getElementById('country-picker-grid');
    grid.innerHTML = '';

    // Update title for multiplayer
    const pickNum = G.mpPickIdx + 1;
    if (G.mode === 'multi') {
        document.getElementById('picker-title').textContent = `👤 Player ${pickNum} — Choose Your Nation`;
        document.getElementById('picker-desc').textContent = `Player ${pickNum} of ${G.playerCount}, select your country.`;
    } else {
        document.getElementById('picker-title').textContent = '🌍 Choose Your Nation';
        document.getElementById('picker-desc').textContent = 'Select the country you will lead to global domination.';
    }

    const sorted = [...G.countries].sort((a, b) => b.gdp - a.gdp);
    sorted.forEach(c => {
        const taken = G.players.includes(c.id);
        const item = document.createElement('div');
        item.className = 'picker-item' + (taken ? ' taken' : '');
        item.innerHTML = `
            <div class="picker-flag">${c.flag}</div>
            <div class="picker-name">${c.name}</div>
            <div class="picker-stats">GDP: $${c.gdp}B | Mil: ${c.baseMilitary}</div>`;
        if (!taken) item.onclick = () => selectPlayerPick(c.id);
        grid.appendChild(item);
    });
    modal.style.display = 'flex';
}

function selectPlayerPick(id) {
    if (G.isOnline) {
        // In online mode, host picks first (Player 1), guest picks second (Player 2)
        const myTurnToPick = (G.isHost && G.mpPickIdx === 0) || (!G.isHost && G.mpPickIdx === 1);
        if (!myTurnToPick) {
            notify("Waiting for opponent to pick...", "warn");
            return;
        }
        sendNetworkMessage('PICK', { id });
    }
    receivePlayerPick(id);
}

function startGame() {
    notify('Welcome, Commander. The world awaits your orders.', 'good');
    renderLoop();
    if (G.mode === 'single') {
        G.tickTimer = setInterval(gameTick, TICK_MS);
    } else {
        G.isPaused = true;
        updateTurnBanner();
    }
}

// ---- Helpers ----
function getC(id) { return G.countries.find(c => c.id === id); }
function playerC() { return getC(G.player); }

function notify(msg, type = '') {
    const box = document.getElementById('notifications');
    if (!box) return;
    const el = document.createElement('div');
    el.className = 'notif' + (type ? ` ${type}-notif` : '');
    el.textContent = msg;
    box.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateX(-30px)'; setTimeout(() => el.remove(), 300); }, 4500);
    while (box.children.length > 6) box.removeChild(box.firstChild);
}

// ---- Game Tick ----
function gameTick() {
    if (G.isPaused) return;
    for (let i = 0; i < G.speed; i++) tickOnce();
}

function tickOnce() {
    G.turn++;
    G.date.setDate(G.date.getDate() + 1);

    G.countries.forEach(c => {
        const net = c.getNetIncome();
        c.treasury += net;

        const recruitBonus = c.hasResearched('conscription') ? 1.5 : 1.0;
        let conscriptionMult = 0.003;
        if (c.conscriptionLaw === 'limited') conscriptionMult = 0.006;
        if (c.conscriptionLaw === 'extensive') conscriptionMult = 0.012;

        c.recruitRate = (c.budgetMilitary / 100) * c.population * conscriptionMult * recruitBonus;
        c.manpower = Math.min(c.manpower + c.recruitRate * 0.1, c.maxManpower);

        const armyGrowth = (c.budgetMilitary / 100) * 0.08;
        c.armyStrength = Math.max(1, c.armyStrength + armyGrowth - (c.armyStrength > c.manpower * 0.5 ? 0.05 : 0));

        c.calcStability();

        if (c.stability < 20 && Math.random() < 0.02) {
            c.armyStrength *= 0.9;
            if (c.isPlayer) notify('⚠️ Civil unrest! Army morale plummets.', 'warn');
        }
        if (c.stability < 10 && Math.random() < 0.01) {
            if (c.conqueredTerritories.length > 0) {
                const lostId = c.conqueredTerritories.pop();
                const lost = getC(lostId);
                if (lost) {
                    lost.color = lost.originalColor;
                    if (c.isPlayer) notify(`💥 ${lost.name} has broken free from your empire!`, 'war');
                }
            }
        }

        // AI (skip all human players)
        if (!c.isHumanPlayer) runAI(c);
    });

    processWars();

    if (G.turn % 30 === 0 && Math.random() < 0.6) {
        triggerRandomEvent();
    }

    // Tech progress — process for all human players
    G.players.forEach(pid => {
        const pc = getC(pid);
        const tq = G.mpTechQueues[pid];
        if (pc && tq && tq.queue) {
            const tech = TECHS.find(t => t.id === tq.queue);
            if (tech) {
                const researchSpeed = (pc.budgetResearch / 100) * 0.5 * (pc.hasResearched('advanced_labs') ? 1.4 : 1.0);
                tq.progress += researchSpeed;
                if (tq.progress >= tech.cost) {
                    pc.researchedTechs.push(tech.id);
                    tech.effect(pc);
                    tq.queue = null;
                    tq.progress = 0;
                    if (pid === G.player) notify(`🔬 Research complete: ${tech.name}!`, 'good');
                }
            }
        }
    });
    if (G.mpTechQueues[G.player]) {
        G.techQueue = G.mpTechQueues[G.player].queue;
        G.techProgress = G.mpTechQueues[G.player].progress;
    }

    updateTopBar();
    updateWarBanner();
}

// ---- Top Bar Update ----
function updateTopBar() {
    const p = playerC();
    if (!p) return;

    // Core resources
    const moneyEl = document.getElementById('res-money');
    if (moneyEl) moneyEl.textContent = formatMoney(p.treasury);

    const moneyRate = document.getElementById('res-money-rate');
    if (moneyRate) {
        const net = p.getNetIncome();
        moneyRate.textContent = `(${net >= 0 ? '+' : ''}${net.toFixed(1)}B)`;
        moneyRate.style.color = net >= 0 ? '#4ade80' : '#f87171';
    }

    const scienceEl = document.getElementById('res-science');
    if (scienceEl) scienceEl.textContent = Math.floor(G.techProgress || 0);

    const mpRate = document.getElementById('res-mp-rate');
    if (mpRate) mpRate.textContent = `(+${(p.budgetResearch / 5).toFixed(1)})`;

    const armyEl = document.getElementById('res-army');
    if (armyEl) {
        let total = 0;
        if (p.troops) Object.values(p.troops).forEach(v => total += v);
        armyEl.textContent = total.toLocaleString();
    }

    const popEl = document.getElementById('res-pop');
    if (popEl) popEl.textContent = (p.population).toFixed(1) + 'M';

    const stabilityEl = document.getElementById('res-stability');
    if (stabilityEl) {
        stabilityEl.textContent = Math.floor(p.stability) + '%';
        stabilityEl.style.color = p.stability > 50 ? '#4ade80' : '#f87171';
    }

    // Date display
    const dateEl = document.getElementById('date-display');
    if (dateEl) {
        const opts = { year: 'numeric', month: 'short', day: 'numeric' };
        dateEl.textContent = G.date.toLocaleDateString('en-US', opts);
    }

    // Active player name
    const nameEl = document.getElementById('player-nation-name');
    if (nameEl) nameEl.textContent = p.name;
}

function formatMoney(v) {
    if (Math.abs(v) >= 1000) return (v / 1000).toFixed(1) + 'T';
    return Math.floor(v) + 'B';
}

function updateWarBanner() {
    const p = playerC();
    if (!p) return;
    const banner = document.getElementById('war-banner');
    if (p.atWar.length > 0) {
        banner.style.display = 'flex';
        const names = p.atWar.map(id => { const c = getC(id); return c ? c.name : id; }).join(', ');
        document.getElementById('war-banner-text').textContent = 'At war with: ' + names;
    } else {
        banner.style.display = 'none';
    }
}

// ---- Speed Controls ----
window.setSpeed = function (s) {
    G.speed = s;
    G.isPaused = s === 0;
    document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
    const id = s === 0 ? 'speed-pause' : 'speed-' + s;
    document.getElementById(id).classList.add('active');
};

// ---- Camera Controls ----
function setupControls() {
    canvas.addEventListener('mousedown', e => {
        G.isDragging = true;
        G.dragMoved = false;
        G.lastMX = e.clientX;
        G.lastMY = e.clientY;
    });
    window.addEventListener('mousemove', e => {
        if (G.isDragging) {
            const dx = e.clientX - G.lastMX;
            const dy = e.clientY - G.lastMY;
            if (Math.abs(dx) > 2 || Math.abs(dy) > 2) G.dragMoved = true;
            G.panX += dx;
            G.panY += dy;
            G.lastMX = e.clientX;
            G.lastMY = e.clientY;
        }
        // Hover detection
        updateHover(e.clientX, e.clientY);
    });
    window.addEventListener('mouseup', e => {
        if (!G.dragMoved) handleClick(e.clientX, e.clientY);
        G.isDragging = false;
    });
    canvas.addEventListener('wheel', e => {
        e.preventDefault();
        const delta = -Math.sign(e.deltaY) * 0.12;
        const oldZoom = G.zoom;
        G.zoom = Math.max(0.4, Math.min(50, G.zoom * (1 + delta)));
        const ratio = G.zoom / oldZoom;
        G.panX = e.clientX - (e.clientX - G.panX) * ratio;
        G.panY = e.clientY - (e.clientY - G.panY) * ratio;
    }, { passive: false });
}

function screenToWorld(sx, sy) {
    return {
        x: (sx - G.panX) / G.zoom / SCALE - W / (2 * SCALE) + W / (2 * SCALE * SCALE),
        y: -((sy - G.panY) / G.zoom / SCALE - H / (2 * SCALE) + H / (2 * SCALE * SCALE))
    };
}

function pointInPolygon(x, y, poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const xi = poly[i][0], yi = poly[i][1];
        const xj = poly[j][0], yj = poly[j][1];
        if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
            inside = !inside;
        }
    }
    return inside;
}

function findCountryAt(sx, sy) {
    const wx = (sx - G.panX) / G.zoom - W / 2;
    const wy = (sy - G.panY) / G.zoom - H / 2;
    const gx = wx / SCALE;
    const gy = -wy / SCALE;

    for (let i = G.countries.length - 1; i >= 0; i--) {
        const c = G.countries[i];
        for (const poly of c.paths) {
            if (pointInPolygon(gx, gy, poly)) return c;
        }
    }
    let best = null, bestD = 80;
    G.countries.forEach(c => {
        const d = Math.sqrt((c.center.x - gx) ** 2 + (c.center.y - gy) ** 2);
        if (d < bestD) { bestD = d; best = c; }
    });
    return best;
}

function updateHover(mx, my) {
    const c = findCountryAt(mx, my);
    G.hoveredId = c ? c.id : null;
}

function handleClick(mx, my) {
    const c = findCountryAt(mx, my);
    if (c) {
        G.selectedId = c.id;
        openCountryPanel(c);
    }
}

// ---- Save / Load ----
window.saveGame = function () {
    try {
        const data = {
            player: G.player, turn: G.turn, date: G.date.toISOString(),
            speed: G.speed, zoom: G.zoom, panX: G.panX, panY: G.panY,
            techQueue: G.techQueue, techProgress: G.techProgress,
            mode: G.mode, players: G.players, currentPlayerIdx: G.currentPlayerIdx,
            mpTechQueues: G.mpTechQueues, user: currentUser,
            countries: G.countries.map(c => ({
                id: c.id, treasury: c.treasury, armyStrength: c.armyStrength,
                manpower: c.manpower, stability: c.stability, relations: c.relations,
                atWar: c.atWar, allies: c.allies, pacts: c.pacts,
                conqueredTerritories: c.conqueredTerritories, researchedTechs: c.researchedTechs,
                color: c.color, budgetMilitary: c.budgetMilitary, budgetEconomy: c.budgetEconomy,
                budgetResearch: c.budgetResearch, budgetWelfare: c.budgetWelfare,
                taxRate: c.taxRate, militaryOrder: c.militaryOrder,
                governmentType: c.governmentType, economicPolicy: c.economicPolicy,
                conscriptionLaw: c.conscriptionLaw
            })),
            wars: G.wars
        };
        localStorage.setItem('gdom_save', JSON.stringify(data));
        notify('💾 Game saved!', 'good');
    } catch (e) { notify('Error saving game.', 'warn'); }
};

window.loadGame = function () {
    const json = localStorage.getItem('gdom_save');
    if (!json) { notify('No save found.', 'warn'); return; }
    try {
        const d = JSON.parse(json);
        G.player = d.player;
        G.turn = d.turn;
        G.date = new Date(d.date);
        G.zoom = d.zoom; G.panX = d.panX; G.panY = d.panY;
        G.techQueue = d.techQueue; G.techProgress = d.techProgress;
        G.wars = d.wars || [];
        G.mode = d.mode || 'single';
        G.players = d.players || [G.player];
        G.currentPlayerIdx = d.currentPlayerIdx || 0;
        G.mpTechQueues = d.mpTechQueues || {};
        d.countries.forEach(sc => {
            const c = getC(sc.id);
            if (!c) return;
            Object.assign(c, {
                treasury: sc.treasury, armyStrength: sc.armyStrength,
                manpower: sc.manpower, stability: sc.stability, relations: sc.relations,
                atWar: sc.atWar, allies: sc.allies, pacts: sc.pacts,
                conqueredTerritories: sc.conqueredTerritories, researchedTechs: sc.researchedTechs,
                color: sc.color, budgetMilitary: sc.budgetMilitary, budgetEconomy: sc.budgetEconomy,
                budgetResearch: sc.budgetResearch, budgetWelfare: sc.budgetWelfare,
                taxRate: sc.taxRate, militaryOrder: sc.militaryOrder,
                governmentType: sc.governmentType || 'democracy',
                economicPolicy: sc.economicPolicy || 'mixed',
                conscriptionLaw: sc.conscriptionLaw || 'volunteer'
            });
        });
        const p = playerC();
        const pf = document.getElementById('player-flag');
        if (pf) pf.textContent = p.flag;
        const pn = document.getElementById('player-nation-name');
        if (pn) pn.textContent = p.name;
        document.getElementById('country-picker-modal').style.display = 'none';
        document.getElementById('loading-screen').style.display = 'none';
        if (!G.tickTimer) { renderLoop(); G.tickTimer = setInterval(gameTick, TICK_MS); }
        notify('📂 Game loaded!', 'good');
    } catch (e) { notify('Save corrupted.', 'warn'); }
};

// ---- Multiplayer Turn System ----
function updateTurnBanner() {
    const banner = document.getElementById('turn-banner');
    if (G.mode !== 'multi') { banner.style.display = 'none'; return; }
    banner.style.display = 'flex';
    const p = playerC();
    if (p) {
        document.getElementById('turn-flag').textContent = p.flag;
        document.getElementById('turn-text').textContent = `Player ${G.currentPlayerIdx + 1}'s Turn — ${p.name}`;
    }
}

window.endTurn = function () {
    if (G.mode !== 'multi') return;

    // In online mode, ensure it's our turn
    if (G.isOnline) {
        const myId = G.players[G.isHost ? 0 : 1];
        if (G.player !== myId) {
            notify("It is not your turn!", "warn");
            return;
        }
    }

    G.mpTechQueues[G.player] = { queue: G.techQueue, progress: G.techProgress };
    closePanel();
    if (typeof closeTabPanel === 'function') closeTabPanel();

    for (let i = 0; i < G.mpTicksPerTurn; i++) {
        tickOnce();
    }

    G.currentPlayerIdx = (G.currentPlayerIdx + 1) % G.players.length;
    G.player = G.players[G.currentPlayerIdx];

    const tq = G.mpTechQueues[G.player] || { queue: null, progress: 0 };
    G.techQueue = tq.queue;
    G.techProgress = tq.progress;

    if (G.isOnline) {
        const state = getSerializableState();
        sendNetworkMessage('END_TURN', { state });
        notify('Turn ended. Sending data to opponent...', 'good');
        showTurnTransition(); // This will show "Guest's Turn" for host, etc.
    } else {
        showTurnTransition();
    }
};

function getSerializableState() {
    return {
        countries: G.countries.map(c => ({
            id: c.id,
            gdp: c.gdp,
            population: c.population,
            armyStrength: c.armyStrength,
            manpower: c.manpower,
            treasury: c.treasury,
            owner: c.owner,
            stability: c.stability,
            overextension: c.overextension,
            techLevel: c.techLevel,
            researchedTechs: c.researchedTechs,
            relations: c.relations,
            atWar: c.atWar,
            allies: c.allies,
            pacts: c.pacts,
            governmentType: c.governmentType,
            economicPolicy: c.economicPolicy,
            conscriptionLaw: c.conscriptionLaw
        })),
        wars: G.wars,
        date: { month: G.month, year: G.year },
        techQueues: G.mpTechQueues
    };
}

function receiveEndTurn(state) {
    applySerializableState(state);

    // Update local player state
    G.player = G.players[G.isHost ? 0 : 1];
    // Wait, if we just received END_TURN, it means it's now OUR turn.
    // The state we received already has G.player advanced? No, we should set it locally.

    G.currentPlayerIdx = G.isHost ? 0 : 1;
    G.player = G.players[G.currentPlayerIdx];

    const tq = G.mpTechQueues[G.player] || { queue: null, progress: 0 };
    G.techQueue = tq.queue;
    G.techProgress = tq.progress;

    updateTopBar();
    updateWarBanner();
    updateTurnBanner();
    notify("Commander, it is your turn!", "event");
}

function applySerializableState(state) {
    state.countries.forEach(data => {
        const c = getC(data.id);
        if (c) {
            Object.assign(c, data);
        }
    });
    G.wars = state.wars;
    G.month = state.date.month;
    G.year = state.date.year;
    G.mpTechQueues = state.techQueues;
}

function showTurnTransition() {
    const p = playerC();
    if (!p) return;

    const overlay = document.createElement('div');
    overlay.className = 'turn-transition';
    overlay.innerHTML = `
        <div class="turn-transition-flag">${p.flag}</div>
        <div class="turn-transition-text">Player ${G.currentPlayerIdx + 1}'s Turn</div>
        <div class="turn-transition-sub">${p.name} — Army: ${Math.floor(p.armyStrength)} | Treasury: ${formatMoney(p.treasury)}</div>
        <button class="turn-transition-btn" id="turn-ready-btn">Ready</button>
    `;
    document.body.appendChild(overlay);

    document.getElementById('turn-ready-btn').onclick = () => {
        overlay.remove();
        const pf2 = document.getElementById('player-flag');
        if (pf2) pf2.textContent = p.flag;
        const pn2 = document.getElementById('player-nation-name');
        if (pn2) pn2.textContent = p.name;
        updateTopBar();
        updateWarBanner();
        updateTurnBanner();
    };
}

window.logout = function () {
    if (confirm('Are you sure you want to log out? Your progress will stay in local storage.')) {
        location.reload();
    }
};

// ---- NO auto-init — the start page handles the flow ----
