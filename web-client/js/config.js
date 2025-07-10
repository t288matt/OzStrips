/**
 * OzStrips Web Client Configuration
 * Mirrors the original OzStrips configuration
 */

const OzStripsConfig = {
    // Server configuration
    socketioaddr: "https://ozstripsserver.maxrumsey.xyz", // SignalR server address
    version: "0.5.7",
    
    // Strip dimensions (matching original)
    stripWidth: 420,
    stripHeight: 60,
    stripPadding: 2,
    
    // Bay configuration
    baySpacing: 10,
    maxBays: 10,
    
    // Colors (matching original SkiaSharp colors)
    colors: {
        departure: "#c1e6f2", // Light blue for departures
        arrival: "#ffffa0",   // Light yellow for arrivals
        black: "#000000",
        white: "#ffffff",
        silver: "#c0c0c0",
        gray: "#808080",
        red: "#ff0000",
        green: "#00ff00",
        blue: "#0000ff",
        yellow: "#ffff00",
        orange: "#ffa500",
        cyan: "#00ffff"
    },
    
    // Font configuration
    fontFamily: "Segoe UI, Arial, sans-serif",
    defaultFontSize: 12,
    
    // Animation settings
    animationDuration: 200,
    
    // Debug settings
    debugMode: false,
    
    // Default aerodromes (matching original OzStrips exactly)
    defaultAerodromes: [
        "YBBN", // Brisbane
        "YBCG", // Gold Coast
        "YBSU", // Brisbane West Wellcamp
        "YMEN", // Melbourne Essendon
        "YMML", // Melbourne
        "YPPH", // Perth
        "YSCB", // Canberra
        "YSSY"  // Sydney
    ]
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OzStripsConfig;
} 