// Dummynation Game Logic
// Author: Veladhithya5-oss
// Version: 0.1.0

const canvas = document.getElementById('map-canvas');
const ctx = canvas.getContext('2d');
let width, height;

// Game State
let gameState = {
    selectedCountry: null,
    playerCountry: 'United States', // Default
    turn: 1,
    money: 10000000,
    manpower: 500000,
    research: 10,
    zoom: 1,
    panX: 0,
    panY: 0,
    isDragging: false,
    lastMouseX: 0,
    lastMouseY: 0
};

// Simplified World Map Data
// In a real game, this would be GeoJSON or SVG path data
const countries = [
    { id: 'USA', name: 'United States', color: '#3b82f6', population: 331000000, gdp: 23000000, military: 100, x: 200, y: 150, paths: [[150, 100], [400, 100], [380, 250], [180, 250]] },
    { id: 'CHN', name: 'China', color: '#ef4444', population: 1400000000, gdp: 18000000, military: 90, x: 600, y: 150, paths: [[550, 100], [750, 100], [720, 220], [520, 220]] },
    { id: 'RUS', name: 'Russia', color: '#dc2626', population: 144000000, gdp: 1700000, military: 80, x: 600, y: 80, paths: [[500, 20], [800, 20], [780, 100], [520, 100]] },
    { id: 'IND', name: 'India', color: '#f97316', population: 1380000000, gdp: 3000000, military: 70, x: 580, y: 220, paths: [[550, 220], [650, 220], [620, 320], [560, 320]] },
    { id: 'BRA', name: 'Brazil', color: '#22c55e', population: 212000000, gdp: 1400000, military: 50, x: 300, y: 350, paths: [[280, 300], [380, 300], [350, 450], [290, 400]] },
    // Add many more... or procedurally generate
];

// Initialize
function init() {
    resize();
    window.addEventListener('resize', resize);

    // Fake loading delay
    setTimeout(() => {
        document.getElementById('loading-screen').style.display = 'none';
        startGameLoop();
    }, 1500);

    // Event Listeners
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('wheel', onScroll);
}

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

function startGameLoop() {
    requestAnimationFrame(render);
    setInterval(gameTick, 1000); // 1 sec = 1 day logic
}

function gameTick() {
    gameState.turn++;
    // Basic Economy
    gameState.money += countries.find(c => c.name === gameState.playerCountry).gdp / 365 * 0.1; // simplified tax
    gameState.manpower = Math.min(gameState.manpower + 100, 1000000); // Cap

    updateUI();
}

function updateUI() {
    document.getElementById('res-money').innerText = (gameState.money / 1000000).toFixed(1) + 'M';
    document.getElementById('res-manpower').innerText = (gameState.manpower / 1000).toFixed(1) + 'K';
    // Update date based on turn
}

// Rendering
function render() {
    ctx.clearRect(0, 0, width, height);

    ctx.save();
    // Apply Camera
    ctx.translate(gameState.panX + width / 2, gameState.panY + height / 2);
    ctx.scale(gameState.zoom, gameState.zoom);
    ctx.translate(-width / 2, -height / 2); // Center Zoom

    // Draw Sea
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-2000, -1000, 4000, 2000); // Infinite sea

    // Draw Countries
    countries.forEach(country => {
        ctx.beginPath();
        if (country.paths.length > 0) {
            ctx.moveTo(country.paths[0][0], country.paths[0][1]);
            country.paths.forEach(p => ctx.lineTo(p[0], p[1]));
        }
        ctx.closePath();

        ctx.fillStyle = country.color;

        // Highlight logic
        if (gameState.selectedCountry === country) {
            ctx.lineWidth = 3;
            ctx.strokeStyle = 'white';
            ctx.stroke();
            ctx.fillStyle = brighten(country.color, 20);
        } else {
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#000';
            ctx.stroke();
        }

        ctx.fill();

        // Draw Name
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(country.name, country.x, country.y);
    });

    ctx.restore();
    requestAnimationFrame(render);
}

// Input Handling
function onMouseDown(e) {
    gameState.isDragging = true;
    gameState.lastMouseX = e.clientX;
    gameState.lastMouseY = e.clientY;

    // Check click detection (simple box check for now)
    // Transform screen coords to world coords
    const worldX = (e.clientX - (gameState.panX + width / 2)) / gameState.zoom + width / 2;
    const worldY = (e.clientY - (gameState.panY + height / 2)) / gameState.zoom + height / 2;

    let clicked = null;
    countries.forEach(c => {
        // Simple bounding box check for demo
        // Real game needs point-in-polygon
        if (worldX > c.x - 50 && worldX < c.x + 50 && worldY > c.y - 50 && worldY < c.y + 50) {
            clicked = c;
        }
    });

    if (clicked) {
        selectCountry(clicked);
    } else {
        // Deselect if clicking sea (optional)
        // gameState.selectedCountry = null;
        // document.querySelector('.side-panel').classList.remove('open');
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
    if (e.deltaY < 0) {
        gameState.zoom = Math.min(gameState.zoom * (1 + zoomSpeed), 5);
    } else {
        gameState.zoom = Math.max(gameState.zoom * (1 - zoomSpeed), 0.5);
    }
}

// Logic
function selectCountry(country) {
    gameState.selectedCountry = country;
    const panel = document.getElementById('country-panel');
    panel.classList.add('open');
    document.getElementById('panel-title').innerText = country.name;
    document.getElementById('panel-stats').innerHTML = `
        <p>Population: ${(country.population / 1000000).toFixed(1)}M</p>
        <p>GDP: $${(country.gdp / 1000).toFixed(1)}B</p>
        <p>Military Strength: ${country.military}</p>
        <hr style="border-color: #444; margin: 10px 0;">
        <div style="display:flex; gap:10px;">
            <button class="action-btn" style="width:100%;" onclick="actionAttack()">Attack</button>
            <button class="action-btn" style="width:100%;" onclick="actionAlliance()">Alliance</button>
        </div>
    `;
}

function brighten(color, percent) {
    // Utility for hex color brightening
    // ... simplified return for now
    return color;
}

// Action Placeholders
window.actionAttack = function () {
    alert(`Declaring war on ${gameState.selectedCountry.name}!`);
    // Implement war logic
}

window.actionAlliance = function () {
    alert(`Proposed alliance with ${gameState.selectedCountry.name}.`);
}

window.setMode = function (mode) {
    // Switch UI modes implementation
    console.log("Mode switched to: " + mode);
}

init();
