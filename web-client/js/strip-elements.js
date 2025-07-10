/**
 * OzStrips Web Client Strip Elements
 * Mirrors the original Strip.xml configuration exactly
 */

class StripElementList {
    constructor() {
        this.list = this.loadStripElements();
    }

    loadStripElements() {
        return [
            // COL1
            {
                x: 0,
                y: 0,
                w: 50,
                h: 20,
                value: StripElementValues.STAND,
                leftClick: StripElementActions.MOD_STD
            },
            {
                x: 0,
                y: 20,
                w: 50,
                h: 20,
                value: StripElementValues.ADES,
                leftClick: StripElementActions.OPEN_FDR
            },
            // COL2
            {
                x: 50,
                y: 0,
                w: 50,
                h: 20,
                value: StripElementValues.EOBT,
                leftClick: StripElementActions.COCK
            },
            {
                x: 50,
                y: 20,
                w: 25,
                h: 20,
                value: StripElementValues.ROUTE,
                leftClick: StripElementActions.SHOW_ROUTE
            },
            {
                x: 75,
                y: 20,
                w: 25,
                h: 20,
                value: StripElementValues.FRUL,
                leftClick: StripElementActions.SHOW_ROUTE
            },
            // COL 3/4
            {
                x: 100,
                y: 0,
                w: 50,
                h: 20,
                value: StripElementValues.TYPE,
                leftClick: StripElementActions.OPEN_FDR
            },
            {
                x: 150,
                y: 0,
                w: 25,
                h: 20,
                value: StripElementValues.WTC
            },
            {
                x: 100,
                y: 20,
                w: 25,
                h: 20,
                value: StripElementValues.PDC_INDICATOR,
                leftClick: StripElementActions.OPEN_PDC,
                rightClick: StripElementActions.OPEN_PM
            },
            {
                x: 125,
                y: 20,
                w: 50,
                h: 20,
                value: StripElementValues.SSR,
                leftClick: StripElementActions.ASSIGN_SSR,
                hover: StripElementHoverActions.SSR_WARNING
            },
            // COL 5
            {
                x: 175,
                y: 0,
                w: 75,
                h: 40,
                value: StripElementValues.ACID,
                leftClick: StripElementActions.PICK
            },
            // COL 6
            {
                x: 250,
                y: 0,
                w: 30,
                h: 20,
                value: StripElementValues.RWY,
                leftClick: StripElementActions.MOD_RWY
            },
            {
                x: 250,
                y: 20,
                w: 30,
                h: 20,
                value: StripElementValues.READY,
                leftClick: StripElementActions.SET_READY
            },
            // COL 7
            {
                x: 280,
                y: 0,
                w: 50,
                h: 40,
                value: StripElementValues.CLX,
                leftClick: StripElementActions.MOD_CLX
            },
            // COL 8
            {
                x: 330,
                y: 0,
                w: 60,
                h: 20,
                value: StripElementValues.SID,
                leftClick: StripElementActions.SID_TRIGGER,
                rightClick: StripElementActions.MOD_SID,
                hover: StripElementHoverActions.SID_TRIGGER
            },
            {
                x: 330,
                y: 20,
                w: 60,
                h: 20,
                value: StripElementValues.FIRST_WPT,
                leftClick: StripElementActions.OPEN_FDR,
                rightClick: StripElementActions.OPEN_REROUTE,
                hover: StripElementHoverActions.ROUTE_WARNING
            },
            // COL 9
            {
                x: 390,
                y: 0,
                w: 30,
                h: 20,
                value: StripElementValues.RFL,
                leftClick: StripElementActions.OPEN_FDR
            },
            {
                x: 390,
                y: 20,
                w: 30,
                h: 20,
                value: StripElementValues.CFL,
                leftClick: StripElementActions.MOD_CFL,
                hover: StripElementHoverActions.RFL_WARNING
            },
            // Base
            {
                x: 0,
                y: 40,
                w: 165,
                h: 20,
                value: StripElementValues.GLOP,
                leftClick: StripElementActions.MOD_GLOP
            },
            {
                x: 165,
                y: 40,
                w: 165,
                h: 20,
                value: StripElementValues.REMARK,
                leftClick: StripElementActions.MOD_REMARK
            },
            {
                x: 330,
                y: 40,
                w: 60,
                h: 20,
                value: StripElementValues.HDG,
                leftClick: StripElementActions.OPEN_HDG_ALT
            },
            {
                x: 390,
                y: 40,
                w: 30,
                h: 20,
                value: StripElementValues.TOT,
                leftClick: StripElementActions.SET_TOT,
                fontSize: 10
            }
        ];
    }

    // Get element by value
    getElementByValue(value) {
        return this.list.find(element => element.value === value);
    }

    // Get elements by action
    getElementsByAction(action) {
        return this.list.filter(element => 
            element.leftClick === action || element.rightClick === action
        );
    }

    // Get elements with hover actions
    getElementsWithHover() {
        return this.list.filter(element => element.hover && element.hover !== StripElementHoverActions.NONE);
    }
}

// Create singleton instance
const stripElementList = new StripElementList();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = stripElementList;
} 