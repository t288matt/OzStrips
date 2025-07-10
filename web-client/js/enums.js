/**
 * OzStrips Web Client Enums
 * Mirrors the original OzStrips enums exactly
 */

// Strip element values (matching StripElements.Values)
const StripElementValues = {
    EOBT: "EOBT",
    ACID: "ACID",
    SSR: "SSR",
    TYPE: "TYPE",
    FRUL: "FRUL",
    FIRST_WPT: "FIRST_WPT",
    SID: "SID",
    ADES: "ADES",
    CFL: "CFL",
    HDG: "HDG",
    CLX: "CLX",
    STAND: "STAND",
    REMARK: "REMARK",
    TOT: "TOT",
    RFL: "RFL",
    READY: "READY",
    GLOP: "GLOP",
    PDC_INDICATOR: "PDC_INDICATOR",
    RWY: "RWY",
    WTC: "WTC",
    ROUTE: "ROUTE"
};

// Strip element actions (matching StripElements.Actions)
const StripElementActions = {
    NONE: "NONE",
    SHOW_ROUTE: "SHOW_ROUTE",
    OPEN_HDG_ALT: "OPEN_HDG_ALT",
    OPEN_FDR: "OPEN_FDR",
    PICK: "PICK",
    ASSIGN_SSR: "ASSIGN_SSR",
    MOD_SID: "MOD_SID",
    OPEN_REROUTE: "OPEN_REROUTE",
    MOD_RWY: "MOD_RWY",
    MOD_CFL: "MOD_CFL",
    MOD_CLX: "MOD_CLX",
    MOD_STD: "MOD_STD",
    MOD_GLOP: "MOD_GLOP",
    MOD_REMARK: "MOD_REMARK",
    COCK: "COCK",
    SID_TRIGGER: "SID_TRIGGER",
    SET_READY: "SET_READY",
    SET_TOT: "SET_TOT",
    OPEN_PDC: "OPEN_PDC",
    OPEN_PM: "OPEN_PM"
};

// Strip element hover actions (matching StripElements.HoverActions)
const StripElementHoverActions = {
    NONE: "NONE",
    ROUTE_WARNING: "ROUTE_WARNING",
    RFL_WARNING: "RFL_WARNING",
    SSR_WARNING: "SSR_WARNING",
    SID_TRIGGER: "SID_TRIGGER"
};

// Strip bay types (matching StripBay enum)
const StripBay = {
    BAY_PREA: "BAY_PREA",
    BAY_CLEARED: "BAY_CLEARED",
    BAY_PUSHED: "BAY_PUSHED",
    BAY_TAXI: "BAY_TAXI",
    BAY_HOLDSHORT: "BAY_HOLDSHORT",
    BAY_RUNWAY: "BAY_RUNWAY",
    BAY_DEPARTURE: "BAY_DEPARTURE",
    BAY_ARRIVAL: "BAY_ARRIVAL",
    BAY_DEAD: "BAY_DEAD"
};

// Strip arrival/departure types (matching StripArrDepType)
const StripArrDepType = {
    ARRIVAL: "ARRIVAL",
    DEPARTURE: "DEPARTURE",
    UNKNOWN: "UNKNOWN"
};

// Strip item types (matching StripItemType)
const StripItemType = {
    STRIP: "STRIP",
    BAR: "BAR",
    DIVIDER: "DIVIDER"
};

// Server types (matching SocketConn.Servers)
const ServerTypes = {
    VATSIM: "VATSIM",
    SWEATBOX1: "SWEATBOX1",
    SWEATBOX2: "SWEATBOX2",
    SWEATBOX3: "SWEATBOX3"
};

// Keyboard keys (matching Windows Forms Keys)
const Keys = {
    Up: "Up",
    Down: "Down",
    Left: "Left",
    Right: "Right",
    Enter: "Enter",
    Escape: "Escape",
    Tab: "Tab",
    Space: "Space",
    Backspace: "Backspace",
    X: "X",
    A: "A",
    B: "B",
    C: "C",
    D: "D",
    E: "E",
    F: "F",
    G: "G",
    H: "H",
    I: "I",
    J: "J",
    K: "K",
    L: "L",
    M: "M",
    N: "N",
    O: "O",
    P: "P",
    Q: "Q",
    R: "R",
    S: "S",
    T: "T",
    U: "U",
    V: "V",
    W: "W",
    Y: "Y",
    Z: "Z",
    OemOpenBrackets: "OemOpenBrackets", // [
    OemCloseBrackets: "OemCloseBrackets" // ]
};

// Mouse buttons (matching Windows Forms MouseButtons)
const MouseButtons = {
    Left: "Left",
    Right: "Right",
    Middle: "Middle"
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        StripElementValues,
        StripElementActions,
        StripElementHoverActions,
        StripBay,
        StripArrDepType,
        StripItemType,
        ServerTypes,
        Keys,
        MouseButtons
    };
} 