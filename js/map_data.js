// ============================================
// WORLD MAP DATA — 80+ Countries (2024 Accurate Data)
// GDP in Billions USD, Pop in Millions, Mil = composite power score
// ============================================
const WORLD_MAP = [
    // ──── NORTH AMERICA ────
    {
        id: 'USA', properties: { name: 'United States' }, flag: '🇺🇸', stats: { gdp: 25500, pop: 331, mil: 100 },
        geometry: { type: 'MultiPolygon', coordinates: [[[[-125, 48], [-70, 48], [-65, 25], [-100, 25], [-120, 30], [-125, 48]]]] }
    },
    {
        id: 'CAN', properties: { name: 'Canada' }, flag: '🇨🇦', stats: { gdp: 2140, pop: 39, mil: 29 },
        geometry: { type: 'Polygon', coordinates: [[[-140, 70], [-60, 70], [-55, 50], [-130, 49], [-140, 70]]] }
    },
    {
        id: 'MEX', properties: { name: 'Mexico' }, flag: '🇲🇽', stats: { gdp: 1320, pop: 130, mil: 28 },
        geometry: { type: 'Polygon', coordinates: [[[-115, 32], [-97, 25], [-85, 20], [-95, 15], [-105, 20], [-115, 32]]] }
    },
    {
        id: 'CUB', properties: { name: 'Cuba' }, flag: '🇨🇺', stats: { gdp: 107, pop: 11, mil: 12 },
        geometry: { type: 'Polygon', coordinates: [[[-85, 23], [-74, 23], [-74, 20], [-85, 20], [-85, 23]]] }
    },
    {
        id: 'GTM', properties: { name: 'Guatemala' }, flag: '🇬🇹', stats: { gdp: 95, pop: 17, mil: 8 },
        geometry: { type: 'Polygon', coordinates: [[[-92, 18], [-88, 18], [-88, 14], [-92, 14], [-92, 18]]] }
    },
    // ──── SOUTH AMERICA ────
    {
        id: 'BRA', properties: { name: 'Brazil' }, flag: '🇧🇷', stats: { gdp: 1920, pop: 215, mil: 42 },
        geometry: { type: 'Polygon', coordinates: [[[-70, 5], [-35, -5], [-40, -25], [-60, -20], [-70, -10], [-70, 5]]] }
    },
    {
        id: 'ARG', properties: { name: 'Argentina' }, flag: '🇦🇷', stats: { gdp: 640, pop: 46, mil: 20 },
        geometry: { type: 'Polygon', coordinates: [[[-70, -22], [-55, -25], [-55, -35], [-65, -55], [-72, -50], [-70, -22]]] }
    },
    {
        id: 'COL', properties: { name: 'Colombia' }, flag: '🇨🇴', stats: { gdp: 340, pop: 52, mil: 22 },
        geometry: { type: 'Polygon', coordinates: [[[-78, 12], [-67, 12], [-67, 2], [-78, -2], [-78, 12]]] }
    },
    {
        id: 'CHL', properties: { name: 'Chile' }, flag: '🇨🇱', stats: { gdp: 300, pop: 19, mil: 18 },
        geometry: { type: 'Polygon', coordinates: [[[-72, -18], [-68, -22], [-68, -45], [-75, -50], [-72, -18]]] }
    },
    {
        id: 'PER', properties: { name: 'Peru' }, flag: '🇵🇪', stats: { gdp: 240, pop: 34, mil: 16 },
        geometry: { type: 'Polygon', coordinates: [[[-82, -3], [-69, -3], [-69, -18], [-82, -15], [-82, -3]]] }
    },
    {
        id: 'VEN', properties: { name: 'Venezuela' }, flag: '🇻🇪', stats: { gdp: 100, pop: 28, mil: 14 },
        geometry: { type: 'Polygon', coordinates: [[[-73, 12], [-60, 11], [-60, 2], [-73, 2], [-73, 12]]] }
    },
    {
        id: 'ECU', properties: { name: 'Ecuador' }, flag: '🇪🇨', stats: { gdp: 115, pop: 18, mil: 10 },
        geometry: { type: 'Polygon', coordinates: [[[-81, 2], [-75, 2], [-75, -5], [-81, -3], [-81, 2]]] }
    },
    {
        id: 'BOL', properties: { name: 'Bolivia' }, flag: '🇧🇴', stats: { gdp: 44, pop: 12, mil: 8 },
        geometry: { type: 'Polygon', coordinates: [[[-69, -10], [-57, -12], [-58, -22], [-69, -20], [-69, -10]]] }
    },
    {
        id: 'PRY', properties: { name: 'Paraguay' }, flag: '🇵🇾', stats: { gdp: 42, pop: 7, mil: 6 },
        geometry: { type: 'Polygon', coordinates: [[[-62, -19], [-55, -20], [-56, -27], [-62, -27], [-62, -19]]] }
    },
    {
        id: 'URY', properties: { name: 'Uruguay' }, flag: '🇺🇾', stats: { gdp: 71, pop: 3, mil: 6 },
        geometry: { type: 'Polygon', coordinates: [[[-58, -30], [-53, -33], [-55, -35], [-58, -34], [-58, -30]]] }
    },
    // ──── EUROPE ────
    {
        id: 'GBR', properties: { name: 'United Kingdom' }, flag: '🇬🇧', stats: { gdp: 3070, pop: 68, mil: 68 },
        geometry: { type: 'Polygon', coordinates: [[[-8, 50], [2, 50], [2, 58], [-8, 58], [-8, 50]]] }
    },
    {
        id: 'FRA', properties: { name: 'France' }, flag: '🇫🇷', stats: { gdp: 2780, pop: 68, mil: 65 },
        geometry: { type: 'Polygon', coordinates: [[[-5, 48], [8, 50], [8, 42], [-2, 42], [-5, 48]]] }
    },
    {
        id: 'DEU', properties: { name: 'Germany' }, flag: '🇩🇪', stats: { gdp: 4070, pop: 84, mil: 55 },
        geometry: { type: 'Polygon', coordinates: [[[6, 55], [15, 55], [15, 47], [6, 47], [6, 55]]] }
    },
    {
        id: 'ITA', properties: { name: 'Italy' }, flag: '🇮🇹', stats: { gdp: 2010, pop: 59, mil: 44 },
        geometry: { type: 'Polygon', coordinates: [[[6, 47], [18, 45], [16, 37], [8, 38], [6, 47]]] }
    },
    {
        id: 'ESP', properties: { name: 'Spain' }, flag: '🇪🇸', stats: { gdp: 1400, pop: 47, mil: 38 },
        geometry: { type: 'Polygon', coordinates: [[[-10, 44], [4, 44], [3, 36], [-8, 36], [-10, 44]]] }
    },
    {
        id: 'PRT', properties: { name: 'Portugal' }, flag: '🇵🇹', stats: { gdp: 255, pop: 10, mil: 16 },
        geometry: { type: 'Polygon', coordinates: [[[-10, 42], [-6, 42], [-6, 37], [-10, 37], [-10, 42]]] }
    },
    {
        id: 'POL', properties: { name: 'Poland' }, flag: '🇵🇱', stats: { gdp: 700, pop: 38, mil: 36 },
        geometry: { type: 'Polygon', coordinates: [[[14, 54], [24, 54], [24, 49], [14, 49], [14, 54]]] }
    },
    {
        id: 'UKR', properties: { name: 'Ukraine' }, flag: '🇺🇦', stats: { gdp: 160, pop: 37, mil: 45 },
        geometry: { type: 'Polygon', coordinates: [[[22, 52], [40, 52], [40, 45], [22, 45], [22, 52]]] }
    },
    {
        id: 'ROU', properties: { name: 'Romania' }, flag: '🇷🇴', stats: { gdp: 310, pop: 19, mil: 22 },
        geometry: { type: 'Polygon', coordinates: [[[22, 48], [30, 48], [30, 43], [22, 43], [22, 48]]] }
    },
    {
        id: 'NLD', properties: { name: 'Netherlands' }, flag: '🇳🇱', stats: { gdp: 1010, pop: 18, mil: 20 },
        geometry: { type: 'Polygon', coordinates: [[[3, 54], [7, 54], [7, 51], [3, 51], [3, 54]]] }
    },
    {
        id: 'BEL', properties: { name: 'Belgium' }, flag: '🇧🇪', stats: { gdp: 580, pop: 12, mil: 14 },
        geometry: { type: 'Polygon', coordinates: [[[2, 51], [6, 51], [6, 49], [2, 49], [2, 51]]] }
    },
    {
        id: 'SWE', properties: { name: 'Sweden' }, flag: '🇸🇪', stats: { gdp: 590, pop: 10, mil: 24 },
        geometry: { type: 'Polygon', coordinates: [[[11, 69], [24, 69], [20, 55], [11, 55], [11, 69]]] }
    },
    {
        id: 'NOR', properties: { name: 'Norway' }, flag: '🇳🇴', stats: { gdp: 480, pop: 5, mil: 22 },
        geometry: { type: 'Polygon', coordinates: [[[5, 70], [16, 70], [15, 58], [5, 58], [5, 70]]] }
    },
    {
        id: 'FIN', properties: { name: 'Finland' }, flag: '🇫🇮', stats: { gdp: 280, pop: 6, mil: 20 },
        geometry: { type: 'Polygon', coordinates: [[[20, 70], [30, 70], [30, 60], [20, 60], [20, 70]]] }
    },
    {
        id: 'GRC', properties: { name: 'Greece' }, flag: '🇬🇷', stats: { gdp: 220, pop: 10, mil: 22 },
        geometry: { type: 'Polygon', coordinates: [[[19, 42], [29, 42], [28, 35], [20, 35], [19, 42]]] }
    },
    {
        id: 'CZE', properties: { name: 'Czech Republic' }, flag: '🇨🇿', stats: { gdp: 290, pop: 11, mil: 16 },
        geometry: { type: 'Polygon', coordinates: [[[12, 51], [19, 51], [19, 48], [12, 48], [12, 51]]] }
    },
    {
        id: 'AUT', properties: { name: 'Austria' }, flag: '🇦🇹', stats: { gdp: 470, pop: 9, mil: 14 },
        geometry: { type: 'Polygon', coordinates: [[[10, 49], [17, 49], [17, 46], [10, 46], [10, 49]]] }
    },
    {
        id: 'CHE', properties: { name: 'Switzerland' }, flag: '🇨🇭', stats: { gdp: 810, pop: 9, mil: 12 },
        geometry: { type: 'Polygon', coordinates: [[[6, 48], [10, 48], [10, 46], [6, 46], [6, 48]]] }
    },
    {
        id: 'IRL', properties: { name: 'Ireland' }, flag: '🇮🇪', stats: { gdp: 530, pop: 5, mil: 8 },
        geometry: { type: 'Polygon', coordinates: [[[-11, 55], [-6, 55], [-6, 51], [-11, 51], [-11, 55]]] }
    },
    {
        id: 'SRB', properties: { name: 'Serbia' }, flag: '🇷🇸', stats: { gdp: 63, pop: 7, mil: 14 },
        geometry: { type: 'Polygon', coordinates: [[[19, 46], [23, 46], [23, 42], [19, 42], [19, 46]]] }
    },
    {
        id: 'HUN', properties: { name: 'Hungary' }, flag: '🇭🇺', stats: { gdp: 185, pop: 10, mil: 14 },
        geometry: { type: 'Polygon', coordinates: [[[16, 49], [23, 49], [23, 45], [16, 45], [16, 49]]] }
    },
    {
        id: 'BLR', properties: { name: 'Belarus' }, flag: '🇧🇾', stats: { gdp: 73, pop: 9, mil: 18 },
        geometry: { type: 'Polygon', coordinates: [[[23, 57], [32, 57], [32, 51], [23, 51], [23, 57]]] }
    },
    // ──── RUSSIA & CENTRAL ASIA ────
    {
        id: 'RUS', properties: { name: 'Russia' }, flag: '🇷🇺', stats: { gdp: 1780, pop: 144, mil: 88 },
        geometry: { type: 'MultiPolygon', coordinates: [[[[30, 70], [180, 70], [170, 42], [130, 50], [60, 50], [30, 60], [30, 70]]]] }
    },
    {
        id: 'KAZ', properties: { name: 'Kazakhstan' }, flag: '🇰🇿', stats: { gdp: 220, pop: 19, mil: 20 },
        geometry: { type: 'Polygon', coordinates: [[[50, 55], [87, 55], [87, 40], [50, 40], [50, 55]]] }
    },
    {
        id: 'UZB', properties: { name: 'Uzbekistan' }, flag: '🇺🇿', stats: { gdp: 80, pop: 35, mil: 14 },
        geometry: { type: 'Polygon', coordinates: [[[56, 45], [72, 45], [72, 37], [56, 37], [56, 45]]] }
    },
    // ──── EAST ASIA ────
    {
        id: 'CHN', properties: { name: 'China' }, flag: '🇨🇳', stats: { gdp: 17960, pop: 1412, mil: 92 },
        geometry: { type: 'Polygon', coordinates: [[[75, 45], [135, 50], [130, 20], [100, 20], [80, 30], [75, 45]]] }
    },
    {
        id: 'JPN', properties: { name: 'Japan' }, flag: '🇯🇵', stats: { gdp: 4230, pop: 125, mil: 52 },
        geometry: { type: 'Polygon', coordinates: [[[130, 30], [145, 45], [146, 35], [130, 30]]] }
    },
    {
        id: 'KOR', properties: { name: 'South Korea' }, flag: '🇰🇷', stats: { gdp: 1670, pop: 52, mil: 48 },
        geometry: { type: 'Polygon', coordinates: [[[126, 33], [130, 38], [127, 38], [126, 33]]] }
    },
    {
        id: 'PRK', properties: { name: 'North Korea' }, flag: '🇰🇵', stats: { gdp: 18, pop: 26, mil: 46 },
        geometry: { type: 'Polygon', coordinates: [[[124, 38], [130, 43], [131, 38], [124, 38]]] }
    },
    {
        id: 'TWN', properties: { name: 'Taiwan' }, flag: '🇹🇼', stats: { gdp: 790, pop: 24, mil: 30 },
        geometry: { type: 'Polygon', coordinates: [[[120, 22], [122, 25], [122, 22], [120, 22]]] }
    },
    {
        id: 'MNG', properties: { name: 'Mongolia' }, flag: '🇲🇳', stats: { gdp: 17, pop: 3, mil: 6 },
        geometry: { type: 'Polygon', coordinates: [[[87, 52], [120, 52], [120, 42], [87, 42], [87, 52]]] }
    },
    // ──── SOUTH ASIA ────
    {
        id: 'IND', properties: { name: 'India' }, flag: '🇮🇳', stats: { gdp: 3730, pop: 1428, mil: 72 },
        geometry: { type: 'Polygon', coordinates: [[[70, 35], [90, 30], [85, 20], [75, 8], [70, 20], [70, 35]]] }
    },
    {
        id: 'PAK', properties: { name: 'Pakistan' }, flag: '🇵🇰', stats: { gdp: 375, pop: 231, mil: 44 },
        geometry: { type: 'Polygon', coordinates: [[[61, 37], [77, 37], [72, 24], [62, 24], [61, 37]]] }
    },
    {
        id: 'BGD', properties: { name: 'Bangladesh' }, flag: '🇧🇩', stats: { gdp: 460, pop: 170, mil: 14 },
        geometry: { type: 'Polygon', coordinates: [[[88, 27], [92, 27], [92, 21], [88, 21], [88, 27]]] }
    },
    {
        id: 'LKA', properties: { name: 'Sri Lanka' }, flag: '🇱🇰', stats: { gdp: 84, pop: 22, mil: 8 },
        geometry: { type: 'Polygon', coordinates: [[[79, 10], [82, 10], [82, 6], [79, 6], [79, 10]]] }
    },
    {
        id: 'NPL', properties: { name: 'Nepal' }, flag: '🇳🇵', stats: { gdp: 40, pop: 30, mil: 6 },
        geometry: { type: 'Polygon', coordinates: [[[80, 31], [88, 31], [88, 26], [80, 26], [80, 31]]] }
    },
    {
        id: 'AFG', properties: { name: 'Afghanistan' }, flag: '🇦🇫', stats: { gdp: 14, pop: 41, mil: 18 },
        geometry: { type: 'Polygon', coordinates: [[[60, 38], [75, 38], [72, 29], [61, 30], [60, 38]]] }
    },
    // ──── SOUTHEAST ASIA ────
    {
        id: 'IDN', properties: { name: 'Indonesia' }, flag: '🇮🇩', stats: { gdp: 1320, pop: 276, mil: 30 },
        geometry: { type: 'Polygon', coordinates: [[[95, -5], [141, -5], [138, -10], [100, -10], [95, -5]]] }
    },
    {
        id: 'THA', properties: { name: 'Thailand' }, flag: '🇹🇭', stats: { gdp: 500, pop: 72, mil: 26 },
        geometry: { type: 'Polygon', coordinates: [[[97, 21], [106, 21], [105, 5], [98, 5], [97, 21]]] }
    },
    {
        id: 'VNM', properties: { name: 'Vietnam' }, flag: '🇻🇳', stats: { gdp: 409, pop: 99, mil: 24 },
        geometry: { type: 'Polygon', coordinates: [[[102, 23], [110, 23], [109, 8], [104, 9], [102, 23]]] }
    },
    {
        id: 'PHL', properties: { name: 'Philippines' }, flag: '🇵🇭', stats: { gdp: 404, pop: 115, mil: 18 },
        geometry: { type: 'Polygon', coordinates: [[[117, 5], [127, 19], [127, 5], [117, 5]]] }
    },
    {
        id: 'MMR', properties: { name: 'Myanmar' }, flag: '🇲🇲', stats: { gdp: 65, pop: 54, mil: 16 },
        geometry: { type: 'Polygon', coordinates: [[[92, 28], [101, 28], [101, 10], [92, 10], [92, 28]]] }
    },
    {
        id: 'MYS', properties: { name: 'Malaysia' }, flag: '🇲🇾', stats: { gdp: 406, pop: 33, mil: 16 },
        geometry: { type: 'Polygon', coordinates: [[[100, 7], [119, 7], [119, 1], [100, 1], [100, 7]]] }
    },
    // ──── MIDDLE EAST ────
    {
        id: 'TUR', properties: { name: 'Turkey' }, flag: '🇹🇷', stats: { gdp: 905, pop: 85, mil: 50 },
        geometry: { type: 'Polygon', coordinates: [[[26, 42], [44, 42], [44, 36], [26, 36], [26, 42]]] }
    },
    {
        id: 'IRN', properties: { name: 'Iran' }, flag: '🇮🇷', stats: { gdp: 367, pop: 87, mil: 46 },
        geometry: { type: 'Polygon', coordinates: [[[44, 40], [64, 38], [62, 25], [48, 25], [44, 40]]] }
    },
    {
        id: 'SAU', properties: { name: 'Saudi Arabia' }, flag: '🇸🇦', stats: { gdp: 1060, pop: 36, mil: 40 },
        geometry: { type: 'Polygon', coordinates: [[[35, 30], [55, 25], [55, 15], [40, 15], [35, 30]]] }
    },
    {
        id: 'IRQ', properties: { name: 'Iraq' }, flag: '🇮🇶', stats: { gdp: 264, pop: 43, mil: 24 },
        geometry: { type: 'Polygon', coordinates: [[[39, 38], [48, 38], [48, 29], [39, 29], [39, 38]]] }
    },
    {
        id: 'SYR', properties: { name: 'Syria' }, flag: '🇸🇾', stats: { gdp: 11, pop: 22, mil: 14 },
        geometry: { type: 'Polygon', coordinates: [[[36, 37], [42, 37], [42, 32], [36, 33], [36, 37]]] }
    },
    {
        id: 'ISR', properties: { name: 'Israel' }, flag: '🇮🇱', stats: { gdp: 525, pop: 10, mil: 38 },
        geometry: { type: 'Polygon', coordinates: [[[34, 33], [36, 33], [35, 29], [34, 29], [34, 33]]] }
    },
    {
        id: 'ARE', properties: { name: 'UAE' }, flag: '🇦🇪', stats: { gdp: 507, pop: 10, mil: 24 },
        geometry: { type: 'Polygon', coordinates: [[[51, 26], [56, 26], [56, 22], [51, 22], [51, 26]]] }
    },
    {
        id: 'JOR', properties: { name: 'Jordan' }, flag: '🇯🇴', stats: { gdp: 47, pop: 11, mil: 14 },
        geometry: { type: 'Polygon', coordinates: [[[35, 33], [39, 33], [39, 29], [35, 29], [35, 33]]] }
    },
    {
        id: 'YEM', properties: { name: 'Yemen' }, flag: '🇾🇪', stats: { gdp: 21, pop: 33, mil: 12 },
        geometry: { type: 'Polygon', coordinates: [[[42, 19], [54, 17], [52, 12], [43, 12], [42, 19]]] }
    },
    {
        id: 'OMN', properties: { name: 'Oman' }, flag: '🇴🇲', stats: { gdp: 104, pop: 5, mil: 14 },
        geometry: { type: 'Polygon', coordinates: [[[52, 25], [60, 22], [57, 16], [52, 17], [52, 25]]] }
    },
    // ──── AFRICA ────
    {
        id: 'EGY', properties: { name: 'Egypt' }, flag: '🇪🇬', stats: { gdp: 477, pop: 104, mil: 35 },
        geometry: { type: 'Polygon', coordinates: [[[25, 32], [35, 32], [36, 22], [25, 22], [25, 32]]] }
    },
    {
        id: 'NGA', properties: { name: 'Nigeria' }, flag: '🇳🇬', stats: { gdp: 477, pop: 223, mil: 22 },
        geometry: { type: 'Polygon', coordinates: [[[3, 14], [15, 14], [14, 4], [3, 4], [3, 14]]] }
    },
    {
        id: 'ZAF', properties: { name: 'South Africa' }, flag: '🇿🇦', stats: { gdp: 399, pop: 60, mil: 25 },
        geometry: { type: 'Polygon', coordinates: [[[15, -22], [33, -22], [35, -30], [20, -35], [15, -22]]] }
    },
    {
        id: 'ETH', properties: { name: 'Ethiopia' }, flag: '🇪🇹', stats: { gdp: 126, pop: 126, mil: 18 },
        geometry: { type: 'Polygon', coordinates: [[[33, 15], [48, 15], [47, 3], [33, 4], [33, 15]]] }
    },
    {
        id: 'KEN', properties: { name: 'Kenya' }, flag: '🇰🇪', stats: { gdp: 113, pop: 55, mil: 14 },
        geometry: { type: 'Polygon', coordinates: [[[34, 5], [42, 5], [41, -5], [34, -5], [34, 5]]] }
    },
    {
        id: 'TZA', properties: { name: 'Tanzania' }, flag: '🇹🇿', stats: { gdp: 75, pop: 65, mil: 12 },
        geometry: { type: 'Polygon', coordinates: [[[29, -1], [40, -1], [40, -11], [29, -11], [29, -1]]] }
    },
    {
        id: 'COD', properties: { name: 'DR Congo' }, flag: '🇨🇩', stats: { gdp: 64, pop: 102, mil: 14 },
        geometry: { type: 'Polygon', coordinates: [[[12, 5], [31, 5], [30, -13], [12, -13], [12, 5]]] }
    },
    {
        id: 'MAR', properties: { name: 'Morocco' }, flag: '🇲🇦', stats: { gdp: 141, pop: 37, mil: 18 },
        geometry: { type: 'Polygon', coordinates: [[[-13, 36], [-1, 36], [-1, 28], [-13, 28], [-13, 36]]] }
    },
    {
        id: 'DZA', properties: { name: 'Algeria' }, flag: '🇩🇿', stats: { gdp: 188, pop: 45, mil: 20 },
        geometry: { type: 'Polygon', coordinates: [[[-2, 37], [10, 37], [12, 19], [-2, 20], [-2, 37]]] }
    },
    {
        id: 'LBY', properties: { name: 'Libya' }, flag: '🇱🇾', stats: { gdp: 42, pop: 7, mil: 10 },
        geometry: { type: 'Polygon', coordinates: [[[10, 33], [25, 33], [25, 19], [10, 19], [10, 33]]] }
    },
    {
        id: 'SDN', properties: { name: 'Sudan' }, flag: '🇸🇩', stats: { gdp: 26, pop: 47, mil: 14 },
        geometry: { type: 'Polygon', coordinates: [[[22, 23], [38, 22], [36, 8], [22, 8], [22, 23]]] }
    },
    {
        id: 'SSD', properties: { name: 'South Sudan' }, flag: '🇸🇸', stats: { gdp: 5, pop: 11, mil: 10 },
        geometry: { type: 'Polygon', coordinates: [[[24, 12], [34, 12], [34, 3], [24, 3], [24, 12]]] }
    },
    {
        id: 'SOM', properties: { name: 'Somalia' }, flag: '🇸🇴', stats: { gdp: 8, pop: 18, mil: 8 },
        geometry: { type: 'Polygon', coordinates: [[[42, 12], [51, 12], [51, -1], [42, -1], [42, 12]]] }
    },
    {
        id: 'TUN', properties: { name: 'Tunisia' }, flag: '🇹🇳', stats: { gdp: 46, pop: 12, mil: 12 },
        geometry: { type: 'Polygon', coordinates: [[[8, 37], [11, 37], [11, 30], [8, 30], [8, 37]]] }
    },
    {
        id: 'BFA', properties: { name: 'Burkina Faso' }, flag: '🇧🇫', stats: { gdp: 19, pop: 23, mil: 8 },
        geometry: { type: 'Polygon', coordinates: [[[-5, 15], [2, 15], [2, 9], [-5, 9], [-5, 15]]] }
    },
    {
        id: 'NER', properties: { name: 'Niger' }, flag: '🇳🇪', stats: { gdp: 14, pop: 26, mil: 8 },
        geometry: { type: 'Polygon', coordinates: [[[0, 23], [15, 23], [15, 11], [0, 11], [0, 23]]] }
    },
    {
        id: 'MLI', properties: { name: 'Mali' }, flag: '🇲🇱', stats: { gdp: 19, pop: 22, mil: 10 },
        geometry: { type: 'Polygon', coordinates: [[[-12, 25], [4, 25], [2, 10], [-12, 10], [-12, 25]]] }
    },
    {
        id: 'TCD', properties: { name: 'Chad' }, flag: '🇹🇩', stats: { gdp: 12, pop: 18, mil: 11 },
        geometry: { type: 'Polygon', coordinates: [[[14, 23], [24, 23], [24, 7], [14, 7], [14, 23]]] }
    },
    {
        id: 'CAF', properties: { name: 'Central African Republic' }, flag: '🇨🇫', stats: { gdp: 2, pop: 5, mil: 6 },
        geometry: { type: 'Polygon', coordinates: [[[14, 10], [27, 10], [27, 3], [14, 3], [14, 10]]] }
    },
    {
        id: 'MRT', properties: { name: 'Mauritania' }, flag: '🇲🇷', stats: { gdp: 10, pop: 5, mil: 7 },
        geometry: { type: 'Polygon', coordinates: [[[-17, 27], [-5, 27], [-5, 15], [-17, 15], [-17, 27]]] }
    },
    {
        id: 'GAB', properties: { name: 'Gabon' }, flag: '🇬🇦', stats: { gdp: 21, pop: 2, mil: 10 },
        geometry: { type: 'Polygon', coordinates: [[[9, 2], [14, 2], [14, -3], [9, -3], [9, 2]]] }
    },
    {
        id: 'MWI', properties: { name: 'Malawi' }, flag: '🇲🇼', stats: { gdp: 14, pop: 20, mil: 6 },
        geometry: { type: 'Polygon', coordinates: [[[33, -9], [36, -9], [36, -17], [33, -17], [33, -9]]] }
    },
    {
        id: 'ZWE', properties: { name: 'Zimbabwe' }, flag: '🇿🇼', stats: { gdp: 28, pop: 16, mil: 10 },
        geometry: { type: 'Polygon', coordinates: [[[25, -16], [33, -16], [33, -22], [25, -22], [25, -16]]] }
    },
    {
        id: 'ZMB', properties: { name: 'Zambia' }, flag: '🇿🇲', stats: { gdp: 29, pop: 20, mil: 10 },
        geometry: { type: 'Polygon', coordinates: [[[22, -9], [33, -9], [33, -18], [22, -18], [22, -9]]] }
    },
    {
        id: 'MDG', properties: { name: 'Madagascar' }, flag: '🇲🇬', stats: { gdp: 15, pop: 30, mil: 6 },
        geometry: { type: 'Polygon', coordinates: [[[43, -12], [50, -12], [50, -25], [43, -25], [43, -12]]] }
    },
    {
        id: 'GIN', properties: { name: 'Guinea' }, flag: '🇬🇳', stats: { gdp: 18, pop: 14, mil: 8 },
        geometry: { type: 'Polygon', coordinates: [[[-15, 12], [-8, 12], [-8, 7], [-15, 7], [-15, 12]]] }
    },
    {
        id: 'RWA', properties: { name: 'Rwanda' }, flag: '🇷🇼', stats: { gdp: 13, pop: 14, mil: 12 },
        geometry: { type: 'Polygon', coordinates: [[[29, -1], [31, -1], [31, -3], [29, -3], [29, -1]]] }
    },
    {
        id: 'BDI', properties: { name: 'Burundi' }, flag: '🇧🇮', stats: { gdp: 3, pop: 13, mil: 8 },
        geometry: { type: 'Polygon', coordinates: [[[29, -3], [31, -3], [31, -5], [29, -5], [29, -3]]] }
    },
    {
        id: 'GHA', properties: { name: 'Ghana' }, flag: '🇬🇭', stats: { gdp: 77, pop: 33, mil: 10 },
        geometry: { type: 'Polygon', coordinates: [[[-3, 11], [1, 11], [1, 5], [-3, 5], [-3, 11]]] }
    },
    {
        id: 'CMR', properties: { name: 'Cameroon' }, flag: '🇨🇲', stats: { gdp: 45, pop: 28, mil: 10 },
        geometry: { type: 'Polygon', coordinates: [[[8, 13], [16, 13], [16, 2], [8, 2], [8, 13]]] }
    },
    {
        id: 'NAM', properties: { name: 'Namibia' }, flag: '🇳🇦', stats: { gdp: 12, pop: 3, mil: 10 },
        geometry: { type: 'Polygon', coordinates: [[[11, -17], [20, -17], [20, -28], [11, -28], [11, -17]]] }
    },
    // ──── OCEANIA ────
    {
        id: 'AUS', properties: { name: 'Australia' }, flag: '🇦🇺', stats: { gdp: 1680, pop: 26, mil: 34 },
        geometry: { type: 'Polygon', coordinates: [[[115, -20], [150, -10], [155, -30], [140, -35], [115, -35], [115, -20]]] }
    },
    {
        id: 'NZL', properties: { name: 'New Zealand' }, flag: '🇳🇿', stats: { gdp: 250, pop: 5, mil: 12 },
        geometry: { type: 'Polygon', coordinates: [[[166, -34], [178, -34], [178, -47], [166, -47], [166, -34]]] }
    }
];

// ====================================================
// NEIGHBOR ADJACENCY
// ====================================================
const NEIGHBORS = {
    'USA': ['CAN', 'MEX', 'CUB'], 'CAN': ['USA'], 'MEX': ['USA', 'GTM', 'CUB'], 'CUB': ['USA', 'MEX'], 'GTM': ['MEX', 'COL'],
    'BRA': ['ARG', 'COL', 'VEN', 'PER', 'BOL', 'PRY', 'URY', 'ECU'], 'ARG': ['BRA', 'CHL', 'BOL', 'PRY', 'URY'],
    'COL': ['BRA', 'VEN', 'ECU', 'PER', 'GTM'], 'CHL': ['ARG', 'PER', 'BOL'], 'PER': ['BRA', 'COL', 'ECU', 'BOL', 'CHL'],
    'VEN': ['BRA', 'COL'], 'ECU': ['COL', 'PER'], 'BOL': ['BRA', 'ARG', 'PER', 'CHL', 'PRY'], 'PRY': ['BRA', 'ARG', 'BOL'], 'URY': ['BRA', 'ARG'],
    'GBR': ['FRA', 'IRL', 'NOR', 'NLD', 'BEL'], 'FRA': ['GBR', 'DEU', 'ITA', 'ESP', 'BEL', 'CHE'],
    'DEU': ['FRA', 'POL', 'NLD', 'BEL', 'AUT', 'CHE', 'CZE'], 'ITA': ['FRA', 'AUT', 'CHE', 'GRC', 'SRB'],
    'ESP': ['FRA', 'PRT', 'MAR'], 'PRT': ['ESP'], 'POL': ['DEU', 'UKR', 'CZE', 'BLR', 'SWE', 'HUN'],
    'UKR': ['POL', 'RUS', 'ROU', 'BLR', 'HUN'], 'ROU': ['UKR', 'SRB', 'HUN', 'BLR'], 'NLD': ['DEU', 'GBR', 'BEL'],
    'BEL': ['FRA', 'DEU', 'NLD', 'GBR'], 'SWE': ['NOR', 'FIN', 'POL'], 'NOR': ['SWE', 'FIN', 'GBR', 'RUS'],
    'FIN': ['SWE', 'NOR', 'RUS'], 'GRC': ['TUR', 'ITA', 'SRB'], 'CZE': ['DEU', 'POL', 'AUT'],
    'AUT': ['DEU', 'ITA', 'CHE', 'CZE', 'HUN'], 'CHE': ['FRA', 'DEU', 'ITA', 'AUT'], 'IRL': ['GBR'],
    'SRB': ['ROU', 'HUN', 'GRC', 'ITA'], 'HUN': ['AUT', 'POL', 'UKR', 'ROU', 'SRB'], 'BLR': ['RUS', 'POL', 'UKR', 'ROU'],
    'RUS': ['NOR', 'FIN', 'UKR', 'BLR', 'KAZ', 'CHN', 'MNG', 'JPN', 'KOR', 'PRK', 'TUR', 'IRN', 'GRC'],
    'KAZ': ['RUS', 'CHN', 'UZB'], 'UZB': ['KAZ', 'AFG', 'IRN'],
    'CHN': ['RUS', 'MNG', 'KOR', 'PRK', 'IND', 'PAK', 'NPL', 'BGD', 'MMR', 'VNM', 'KAZ', 'AFG', 'TWN', 'JPN'],
    'JPN': ['KOR', 'RUS', 'CHN', 'TWN', 'PHL'], 'KOR': ['PRK', 'JPN', 'CHN'], 'PRK': ['KOR', 'CHN', 'RUS'],
    'TWN': ['CHN', 'JPN', 'PHL'], 'MNG': ['RUS', 'CHN'],
    'IND': ['PAK', 'CHN', 'NPL', 'BGD', 'LKA', 'MMR'], 'PAK': ['IND', 'CHN', 'AFG', 'IRN'],
    'BGD': ['IND', 'MMR'], 'LKA': ['IND'], 'NPL': ['IND', 'CHN'], 'AFG': ['PAK', 'IRN', 'UZB', 'CHN'],
    'IDN': ['MYS', 'AUS', 'PHL', 'THA'], 'THA': ['MMR', 'VNM', 'MYS'], 'VNM': ['CHN', 'THA', 'PHL'],
    'PHL': ['IDN', 'TWN', 'JPN', 'VNM'], 'MMR': ['IND', 'CHN', 'THA', 'BGD'], 'MYS': ['IDN', 'THA'],
    'TUR': ['GRC', 'SYR', 'IRQ', 'IRN', 'RUS'], 'IRN': ['IRQ', 'TUR', 'PAK', 'AFG', 'UZB', 'SAU', 'OMN'],
    'SAU': ['IRQ', 'JOR', 'YEM', 'ARE', 'OMN', 'EGY', 'ISR'], 'IRQ': ['TUR', 'IRN', 'SYR', 'JOR', 'SAU'],
    'SYR': ['TUR', 'IRQ', 'JOR', 'ISR'], 'ISR': ['SYR', 'JOR', 'EGY', 'SAU'], 'ARE': ['SAU', 'OMN'],
    'JOR': ['SYR', 'IRQ', 'SAU', 'ISR'], 'YEM': ['SAU', 'OMN'], 'OMN': ['SAU', 'ARE', 'YEM', 'IRN'],
    'EGY': ['LBY', 'SDN', 'ISR', 'SAU'], 'NGA': ['CMR', 'GHA', 'NER', 'TCD'],
    'ZAF': ['NAM', 'ZWE', 'ZMB'], 'ETH': ['SDN', 'KEN', 'SOM', 'SSD'], 'KEN': ['ETH', 'TZA', 'SOM', 'SSD'],
    'TZA': ['KEN', 'COD', 'ZMB', 'RWA', 'BDI'], 'COD': ['CMR', 'TZA', 'ZMB', 'SSD', 'CAF', 'RWA', 'BDI', 'GAB'],
    'MAR': ['DZA', 'ESP', 'MRT'], 'DZA': ['MAR', 'LBY', 'TUN', 'MLI', 'NER', 'MRT'],
    'LBY': ['EGY', 'DZA', 'SDN', 'TUN', 'NER', 'TCD'], 'SDN': ['EGY', 'LBY', 'ETH', 'SSD', 'TCD'],
    'GHA': ['NGA', 'BFA'], 'CMR': ['NGA', 'COD', 'GAB', 'TCD', 'CAF'],
    'NAM': ['ZAF', 'ZMB'], 'TUN': ['DZA', 'LBY'], 'MLI': ['DZA', 'MRT', 'BFA', 'NER', 'GIN'],
    'ZWE': ['ZAF', 'ZMB', 'MWI'], 'ZMB': ['COD', 'ZWE', 'NAM', 'MWI', 'TZA'],
    'SOM': ['ETH', 'KEN'], 'MDG': ['ZAF'], 'BFA': ['GHA', 'MLI', 'NER'], 'NER': ['DZA', 'LBY', 'NGA', 'MLI', 'TCD', 'BFA'],
    'TCD': ['LBY', 'SDN', 'NGA', 'CMR', 'CAF', 'NER'], 'CAF': ['COD', 'CMR', 'TCD', 'SSD'],
    'MRT': ['MAR', 'DZA', 'MLI'], 'GAB': ['CMR', 'COD'], 'MWI': ['ZMB', 'ZWE', 'TZA'],
    'GIN': ['MLI'], 'RWA': ['COD', 'TZA', 'BDI'], 'BDI': ['COD', 'TZA', 'RWA'], 'SSD': ['SDN', 'ETH', 'KEN', 'COD', 'CAF'],
    'AUS': ['IDN', 'NZL'], 'NZL': ['AUS']
};

// ====================================================
// TROOP TYPES — Unit definitions for recruitment
// ====================================================
window.TROOP_TYPES = [
    { id: 'infantry', name: 'Infantry', icon: '🪖', desc: 'Basic ground soldiers. Cheap and numerous.', attack: 1, defense: 1.2, cost: 0.5, upkeep: 0.02, manpowerCost: 1 },
    { id: 'artillery', name: 'Artillery', icon: '💣', desc: 'Long-range bombardment units. Strong attack, weak defense.', attack: 2.5, defense: 0.5, cost: 2, upkeep: 0.08, manpowerCost: 2 },
    { id: 'tank', name: 'Tank', icon: '🛡️', desc: 'Heavy armored vehicle. Strong in all situations.', attack: 3, defense: 3, cost: 5, upkeep: 0.15, manpowerCost: 3 },
    { id: 'navy', name: 'Navy', icon: '🚢', desc: 'Naval fleet for coastal defense and sea control.', attack: 2, defense: 2, cost: 8, upkeep: 0.2, manpowerCost: 4 },
    { id: 'airforce', name: 'Air Force', icon: '✈️', desc: 'Fighter jets and bombers. Devastating offensive power.', attack: 4, defense: 1, cost: 10, upkeep: 0.25, manpowerCost: 3 },
    { id: 'special', name: 'Special Forces', icon: '🎯', desc: 'Elite covert operatives. Extremely effective per unit.', attack: 5, defense: 2, cost: 15, upkeep: 0.3, manpowerCost: 5 },
    { id: 'nuclear', name: 'Nuclear Weapon', icon: '☢️', desc: 'Drops a nuclear bomb. Obliterates the selected location.', attack: 100, defense: 0, cost: 500, upkeep: 2, manpowerCost: 0 }
];

window.OFFLINE_MAP_DATA = WORLD_MAP;
window.NEIGHBOR_MAP = NEIGHBORS;
