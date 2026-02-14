// Simplified World Map Data for Offline Play
// Coordinates are roughly scaled to fit a 0-1000 range for width/height logic
const WORLD_MAP = [
    {
        id: 'USA',
        properties: { name: 'United States' },
        geometry: {
            type: 'MultiPolygon',
            coordinates: [[
                [[-125, 48], [-70, 48], [-65, 25], [-100, 25], [-120, 30], [-125, 48]] // Mainland
            ]]
        }
    },
    {
        id: 'CAN',
        properties: { name: 'Canada' },
        geometry: {
            type: 'Polygon',
            coordinates: [[
                [-140, 70], [-60, 70], [-55, 50], [-130, 49], [-140, 70]
            ]]
        }
    },
    {
        id: 'MEX',
        properties: { name: 'Mexico' },
        geometry: {
            type: 'Polygon',
            coordinates: [[
                [-115, 32], [-97, 25], [-85, 20], [-95, 15], [-105, 20], [-115, 32]
            ]]
        }
    },
    {
        id: 'BRA',
        properties: { name: 'Brazil' },
        geometry: {
            type: 'Polygon',
            coordinates: [[
                [-70, 5], [-35, -5], [-40, -25], [-60, -20], [-70, -10], [-70, 5]
            ]]
        }
    },
    {
        id: 'ARG',
        properties: { name: 'Argentina' },
        geometry: {
            type: 'Polygon',
            coordinates: [[
                [-70, -22], [-55, -25], [-55, -35], [-65, -55], [-72, -50], [-70, -22]
            ]]
        }
    },
    {
        id: 'RUS',
        properties: { name: 'Russia' },
        geometry: {
            type: 'MultiPolygon',
            coordinates: [[
                [[30, 70], [180, 70], [170, 40], [130, 50], [60, 50], [30, 60], [30, 70]]
            ]]
        }
    },
    {
        id: 'CHN',
        properties: { name: 'China' },
        geometry: {
            type: 'Polygon',
            coordinates: [[
                [75, 45], [135, 50], [130, 20], [100, 20], [80, 30], [75, 45]
            ]]
        }
    },
    {
        id: 'IND',
        properties: { name: 'India' },
        geometry: {
            type: 'Polygon',
            coordinates: [[
                [70, 35], [90, 30], [85, 20], [75, 8], [70, 20], [70, 35]
            ]]
        }
    },
    {
        id: 'AUS',
        properties: { name: 'Australia' },
        geometry: {
            type: 'Polygon',
            coordinates: [[
                [115, -20], [150, -10], [155, -30], [140, -35], [115, -35], [115, -20]
            ]]
        }
    },
    {
        id: 'FRA',
        properties: { name: 'France' },
        geometry: {
            type: 'Polygon',
            coordinates: [[
                [-5, 48], [8, 50], [8, 42], [-2, 42], [-5, 48]
            ]]
        }
    },
    {
        id: 'DEU',
        properties: { name: 'Germany' },
        geometry: {
            type: 'Polygon',
            coordinates: [[
                [6, 55], [15, 53], [13, 47], [6, 49], [6, 55]
            ]]
        }
    },
    {
        id: 'GBR',
        properties: { name: 'United Kingdom' },
        geometry: {
            type: 'Polygon',
            coordinates: [[
                [-8, 50], [2, 50], [2, 58], [-8, 58], [-8, 50]
            ]]
        }
    },
    {
        id: 'ZAF',
        properties: { name: 'South Africa' },
        geometry: {
            type: 'Polygon',
            coordinates: [[
                [15, -22], [32, -22], [35, -30], [20, -35], [15, -22]
            ]]
        }
    },
    {
        id: 'EGY',
        properties: { name: 'Egypt' },
        geometry: {
            type: 'Polygon',
            coordinates: [[
                [25, 32], [35, 32], [36, 22], [25, 22], [25, 32]
            ]]
        }
    },
    {
        id: 'JPN',
        properties: { name: 'Japan' },
        geometry: {
            type: 'Polygon',
            coordinates: [[
                [130, 30], [145, 45], [146, 35], [130, 30]
            ]]
        }
    },
    {
        id: 'SAU',
        properties: { name: 'Saudi Arabia' },
        geometry: {
            type: 'Polygon',
            coordinates: [[
                [35, 30], [55, 25], [55, 15], [40, 15], [35, 30]
            ]]
        }
    }
];

// Attach to window to be accessible
window.OFFLINE_MAP_DATA = WORLD_MAP;
