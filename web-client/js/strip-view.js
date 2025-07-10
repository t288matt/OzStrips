/**
 * OzStrips Web Client Strip View
 * Mirrors the original OzStrips StripView.cs functionality exactly
 */

class StripView {
    constructor(strip, bayRenderController) {
        this.strip = strip;
        this.bayRenderController = bayRenderController;
        this.padding = 2;
        this.origin = { x: 0, y: 0 };
        this.elementOrigin = { x: 0, y: 0 };
        this.canvas = null;
        this.ctx = null;
        this.element = null;
    }

    // Get show SSR error flag
    get showSSRError() {
        return !this.strip.squawkCorrect && 
               this.strip.currentBay >= StripBay.BAY_TAXI && 
               this.strip.arrDepType === StripArrDepType.DEPARTURE;
    }

    // Render strip
    render(canvas, x, y) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.origin = { x, y };
        this.elementOrigin = { 
            x: this.origin.x + this.padding, 
            y: this.origin.y + this.padding 
        };

        this.drawStripBackground();
        this.drawStripBorder();
        this.drawStripElements();
    }

    // Draw strip background
    drawStripBackground() {
        const color = this.strip.arrDepType === StripArrDepType.ARRIVAL ? 
            OzStripsConfig.colors.arrival : 
            OzStripsConfig.colors.departure;

        this.ctx.fillStyle = color;
        this.ctx.fillRect(
            this.origin.x, 
            this.origin.y, 
            OzStripsConfig.stripWidth + (2 * this.padding), 
            OzStripsConfig.stripHeight
        );
    }

    // Draw strip border
    drawStripBorder() {
        this.ctx.strokeStyle = OzStripsConfig.colors.black;
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(
            this.elementOrigin.x,
            this.elementOrigin.y,
            OzStripsConfig.stripWidth,
            OzStripsConfig.stripHeight - (2 * this.padding)
        );
    }

    // Draw strip elements
    drawStripElements() {
        const elements = stripElementList.list;
        if (!elements) return;

        elements.forEach(element => {
            this.drawElement(element);
        });
    }

    // Draw individual element
    drawElement(element) {
        const baseX = this.elementOrigin.x + element.x;
        const baseY = this.elementOrigin.y + element.y;
        const text = this.getElementText(element);
        const fontSize = element.fontSize || OzStripsConfig.defaultFontSize;

        // Draw background
        const backColor = this.getElementBackColour(element);
        if (backColor) {
            this.ctx.fillStyle = backColor;
            this.ctx.fillRect(baseX, baseY, element.w, element.h);
        }

        // Draw border
        this.ctx.strokeStyle = OzStripsConfig.colors.black;
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(baseX, baseY, element.w, element.h);

        // Draw highlight for SID if needed
        if (element.value === StripElementValues.SID && this.strip.sidTransition) {
            this.ctx.strokeStyle = OzStripsConfig.colors.yellow;
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(baseX + 1.5, baseY + 1.5, element.w - 2, element.h - 2);
        }

        // Draw text
        this.ctx.fillStyle = this.getElementForeColour(element);
        this.ctx.font = `${fontSize}px ${OzStripsConfig.fontFamily}`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(
            text,
            baseX + (element.w / 2),
            baseY + (element.h / 2)
        );
    }

    // Get element text
    getElementText(element) {
        switch (element.value) {
            case StripElementValues.EOBT:
                return this.strip.time;
            case StripElementValues.ACID:
                return this.strip.fdr.callsign;
            case StripElementValues.SSR:
                return (this.strip.fdr.assignedSSRCode === -1) ? "XXXX" : 
                       this.strip.fdr.assignedSSRCode.toString(8).padStart(4, '0');
            case StripElementValues.ADES:
                return this.strip.fdr.desAirport;
            case StripElementValues.ROUTE:
                if (this.strip.fdr.textOnly) {
                    return "T";
                } else if (this.strip.fdr.receiveOnly) {
                    return "R";
                }
                return "";
            case StripElementValues.FRUL:
                return this.strip.fdr.flightRules;
            case StripElementValues.PDC_INDICATOR:
                return this.strip.fdr.pdcSent ? "P" : "";
            case StripElementValues.TYPE:
                return this.strip.fdr.aircraftType;
            case StripElementValues.WTC:
                return this.strip.fdr.aircraftWake;
            case StripElementValues.RWY:
                return this.strip.rwy;
            case StripElementValues.READY:
                return this.strip.ready ? "RDY" : "";
            case StripElementValues.CLX:
                return this.strip.clx;
            case StripElementValues.SID:
                return this.strip.sid;
            case StripElementValues.FIRST_WPT:
                if (this.strip.firstWpt.length > 5) {
                    return this.strip.firstWpt.substring(0, 5) + "...";
                }
                return this.strip.firstWpt;
            case StripElementValues.RFL:
                return this.strip.rfl;
            case StripElementValues.CFL:
                if (this.strip.cfl.includes("B")) {
                    return "BLK";
                }
                return this.strip.cfl;
            case StripElementValues.STAND:
                return this.strip.gate;
            case StripElementValues.GLOP:
                return this.strip.fdr.globalOpData;
            case StripElementValues.REMARK:
                return this.strip.remark;
            case StripElementValues.HDG:
                return this.strip.hdg;
            case StripElementValues.TOT:
                if (this.strip.takeOffTime) {
                    const diff = new Date() - this.strip.takeOffTime;
                    const minutes = Math.floor(diff / 60000);
                    const seconds = Math.floor((diff % 60000) / 1000);
                    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                }
                return "00:00";
            default:
                return "";
        }
    }

    // Get element background color
    getElementBackColour(element) {
        switch (element.value) {
            case StripElementValues.ACID:
                if (this.bayRenderController.bay.bayManager.pickedController === this.strip) {
                    return OzStripsConfig.colors.silver;
                } else if (this.strip.fdr.remarks && 
                          this.strip.fdr.remarks.toLowerCase().includes("state") && 
                          this.bayRenderController.bay.bayManager.worldFlightMode) {
                    return OzStripsConfig.colors.yellow;
                }
                break;
            case StripElementValues.STAND:
            case StripElementValues.ADES:
            case StripElementValues.EOBT:
            case StripElementValues.WTC:
            case StripElementValues.ROUTE:
            case StripElementValues.FRUL:
            case StripElementValues.PDC_INDICATOR:
            case StripElementValues.TYPE:
            case StripElementValues.SSR:
                if (element.value === StripElementValues.SSR && this.showSSRError) {
                    return OzStripsConfig.colors.orange;
                }
                if (this.strip.cockLevel === 1) {
                    return OzStripsConfig.colors.cyan;
                }
                break;
            case StripElementValues.GLOP:
            case StripElementValues.REMARK:
            case StripElementValues.HDG:
                if (this.strip.crossing) {
                    return OzStripsConfig.colors.red;
                }
                if (element.value === StripElementValues.HDG &&
                    this.strip.currentBay >= StripBay.BAY_HOLDSHORT &&
                    !this.strip.hdg &&
                    this.strip.sid.length === 3 &&
                    this.strip.arrDepType === StripArrDepType.DEPARTURE) {
                    return OzStripsConfig.colors.orange;
                }
                break;
            case StripElementValues.SID:
                let sidColor = OzStripsConfig.colors.green;
                if (this.strip.vfrSidAssigned) {
                    sidColor = OzStripsConfig.colors.orange;
                }
                return sidColor;
            case StripElementValues.CFL:
                return this.strip.controller.determineCFLBackColour();
            case StripElementValues.FIRST_WPT:
                return this.strip.controller.determineRouteBackColour();
            case StripElementValues.READY:
                if (!this.strip.ready && 
                    (this.strip.currentBay === StripBay.BAY_HOLDSHORT || 
                     this.strip.currentBay === StripBay.BAY_RUNWAY) && 
                    this.strip.arrDepType === StripArrDepType.DEPARTURE) {
                    return OzStripsConfig.colors.orange;
                }
                break;
        }
        return "";
    }

    // Get element foreground color
    getElementForeColour(element) {
        switch (element.value) {
            case StripElementValues.TOT:
                if (this.strip.takeOffTime) {
                    return OzStripsConfig.colors.green;
                }
                break;
            case StripElementValues.RFL:
                return OzStripsConfig.colors.gray;
        }
        return OzStripsConfig.colors.black;
    }

    // Mark picked
    markPicked(picked) {
        this.strip.setHMIPicked(picked);
    }

    // Handle click
    handleClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const clickedElement = this.getElementAtPosition(x, y);
        if (clickedElement) {
            const action = event.button === 2 ? clickedElement.rightClick : clickedElement.leftClick;
            this.handleClickAction(action);
        } else {
            // If no strip element was clicked, treat as a strip being dropped onto the bay
            this.bayRenderController.bay.bayManager.dropStrip(this.bayRenderController.bay);
        }
    }

    // Get element at position
    getElementAtPosition(x, y) {
        const elements = stripElementList.list;
        if (!elements) return null;

        return elements.find(element => {
            const elementX = this.elementOrigin.x + element.x;
            const elementY = this.elementOrigin.y + element.y;
            return x >= elementX && x < elementX + element.w &&
                   y >= elementY && y < elementY + element.h;
        });
    }

    // Handle click action
    handleClickAction(action) {
        switch (action) {
            case StripElementActions.SHOW_ROUTE:
                // In web version, this could show route on a map or in a modal
                console.log("Show route for:", this.strip.fdr.callsign);
                break;
            case StripElementActions.OPEN_FDR:
                this.strip.openVatsysFDR();
                break;
            case StripElementActions.SID_TRIGGER:
                this.strip.sidTrigger();
                break;
            case StripElementActions.PICK:
                this.strip.togglePick();
                break;
            case StripElementActions.ASSIGN_SSR:
                this.strip.controller.assignSSR();
                break;
            case StripElementActions.MOD_CLX:
                this.strip.controller.openCLXBayModal("clx");
                break;
            case StripElementActions.MOD_STD:
                this.strip.controller.openCLXBayModal("std");
                break;
            case StripElementActions.MOD_GLOP:
                this.strip.controller.openCLXBayModal("glop");
                break;
            case StripElementActions.MOD_REMARK:
                this.strip.controller.openCLXBayModal("remark");
                break;
            case StripElementActions.MOD_CFL:
                this.strip.controller.openCFLWindow();
                break;
            case StripElementActions.MOD_RWY:
                this.strip.controller.openRWYWindow();
                break;
            case StripElementActions.MOD_SID:
                this.strip.controller.openSIDWindow();
                break;
            case StripElementActions.OPEN_HDG_ALT:
                this.strip.controller.openHDGWindow();
                break;
            case StripElementActions.OPEN_REROUTE:
                this.strip.controller.openRerouteMenu();
                break;
            case StripElementActions.SET_READY:
                this.strip.controller.toggleReady();
                break;
            case StripElementActions.SET_TOT:
                this.strip.takeOff();
                break;
            case StripElementActions.COCK:
                this.strip.cockStrip();
                break;
            case StripElementActions.OPEN_PDC:
                this.bayRenderController.bay.bayManager.sendPDC(this.strip);
                break;
            case StripElementActions.OPEN_PM:
                // In web version, this could open a pilot message window
                console.log("Open PM for:", this.strip.fdr.callsign);
                break;
        }
    }

    // Handle hover
    handleHover(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const hoveredElement = this.getElementAtPosition(x, y);
        if (hoveredElement && hoveredElement.hover !== StripElementHoverActions.NONE) {
            this.showTooltip(hoveredElement, x, y);
        } else {
            this.hideTooltip();
        }
    }

    // Show tooltip
    showTooltip(element, x, y) {
        // In web version, this would show a tooltip
        console.log("Show tooltip for:", element.value, "at", x, y);
    }

    // Hide tooltip
    hideTooltip() {
        // In web version, this would hide the tooltip
        console.log("Hide tooltip");
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StripView;
} 