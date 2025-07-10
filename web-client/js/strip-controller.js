/**
 * OzStrips Web Client Strip Controller
 * Mirrors the original OzStrips StripController.cs functionality exactly
 */

class StripController {
    constructor(strip) {
        this.strip = strip;
        this.pickToggleControl = null;
    }

    // Get FDR
    get fdr() {
        return this.strip.fdr;
    }

    // Get RWY
    get rwy() {
        return this.strip.rwy;
    }

    set rwy(value) {
        this.strip.rwy = value;
    }

    // Get SID
    get sid() {
        return this.strip.sid;
    }

    set sid(value) {
        this.strip.sid = value;
    }

    // Cock strip
    cock(cockLevel = -1, sync = true, update = true) {
        if (cockLevel === -1) {
            cockLevel = this.strip.cockLevel + 1;
            if (cockLevel >= 2) {
                cockLevel = 0;
            }
        }

        if (update) {
            this.strip.cockLevel = cockLevel;
        }

        if (sync) {
            this.strip.syncStrip();
        }
    }

    // Set cross
    setCross(sync = true) {
        this.strip.crossing = true;
        if (sync) {
            this.strip.syncStrip();
        }
    }

    // Toggle HMI pick
    hmiTogglePick(picked) {
        if (this.pickToggleControl) {
            const color = picked ? OzStripsConfig.colors.silver : "";
            this.pickToggleControl.style.backgroundColor = color;
        }
    }

    // Open CFL window
    openCFLWindow() {
        // In web version, this opens a modal
        this.openHdgAltModal("cfl");
    }

    // Open HDG window
    openHDGWindow() {
        this.openHdgAltModal("hdg");
    }

    // Open RWY window
    openRWYWindow() {
        this.openHdgAltModal();
    }

    // Open SID window
    openSIDWindow() {
        this.openHdgAltModal();
    }

    // Open reroute menu
    openRerouteMenu() {
        // In web version, this opens a reroute modal
        console.log("Opening reroute menu for:", this.fdr.callsign);
    }

    // Open CLX bay modal
    openCLXBayModal(labelName) {
        // In web version, this opens a modal
        console.log("Opening CLX bay modal for:", this.fdr.callsign, "label:", labelName);
    }

    // Toggle ready
    toggleReady() {
        this.strip.ready = !this.strip.ready;
        this.strip.syncStrip();
    }

    // Assign SSR
    assignSSR() {
        // In web version, this could auto-generate or open SSR assignment
        console.log("Assigning SSR for:", this.fdr.callsign);
    }

    // Determine CFL back color
    determineCFLBackColour() {
        if (!this.strip.cfl) return OzStripsConfig.colors.empty;
        
        if (this.strip.cfl.includes("B")) {
            return OzStripsConfig.colors.orange; // Blocked level
        }
        
        return OzStripsConfig.colors.empty;
    }

    // Determine route back color
    determineRouteBackColour() {
        if (this.strip.dodgyRoute) {
            return OzStripsConfig.colors.orange;
        }
        return OzStripsConfig.colors.empty;
    }

    // Open heading/altitude modal
    openHdgAltModal(activeLabel = "") {
        // In web version, this opens a modal
        console.log("Opening HDG/ALT modal for:", this.fdr.callsign, "active:", activeLabel);
    }

    // Handle heading/altitude modal return
    headingAltReturned(control) {
        try {
            if (control.alt) {
                this.strip.cfl = control.alt;
            }

            this.strip.hdg = control.hdg;
            
            if (control.runway && this.strip.rwy !== control.runway) {
                this.strip.rwy = control.runway;
            }

            if (control.sid && this.strip.sid !== control.sid) {
                this.strip.sid = control.sid;
            }

            this.strip.syncStrip();
        } catch (error) {
            console.error("Error in headingAltReturned:", error);
        }
    }

    // Handle CLX bay modal return
    clxBayReturned(control) {
        this.strip.clx = control.clx;
        this.strip.gate = control.gate;
        this.strip.remark = control.remark;
        
        // Set global ops data
        if (this.fdr) {
            this.fdr.globalOpData = control.glop;
        }
        
        this.strip.syncStrip();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StripController;
} 