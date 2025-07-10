/**
 * OzStrips Web Client Strip Class
 * Mirrors the original OzStrips Strip.cs functionality exactly
 */

class Strip {
    constructor(fdr, bayManager, socketConn) {
        this.fdr = fdr;
        this.bayManager = bayManager;
        this.parentAerodrome = bayManager.aerodromeName;
        this.socketConn = socketConn;
        this.currentBay = StripBay.BAY_PREA;
        
        if (this.arrDepType === StripArrDepType.ARRIVAL) {
            this.currentBay = StripBay.BAY_ARRIVAL;
        }

        this.controller = new StripController(this);
        
        // Initialize properties
        this.takeOffTime = null;
        this.validRoutes = null;
        this.condensedRoute = "";
        this.requestedRoutes = new Date(864000000000000); // Max date
        this.parsedRoutes = false;
        this.validRoutesAerodromePairing = "";
        this.dodgyRoute = false;
        this.cockLevel = 0;
        this.crossing = false;
        this.ready = false;
        this.clx = "";
        this.remark = "";
        this.gate = "";
        this.hdg = "";
        this.rwy = "";
        this.sid = "";
        this.firstWpt = "";
        this.vfrSidAssigned = false;
        this.sidTransition = null;
        this.squawkCorrect = true;
        this.hmiPicked = false;
        
        // Initialize from FDR
        this.initializeFromFDR();
    }

    // Initialize strip data from FDR
    initializeFromFDR() {
        if (!this.fdr) return;
        
        // Set initial values from FDR
        this.gate = this.fdr.depAirport || "";
        this.hdg = "";
        this.rwy = "";
        this.sid = "";
        this.firstWpt = this.getFirstWaypoint();
        this.clx = "";
        this.remark = "";
        
        // Check if this is a VFR aircraft with SID
        this.vfrSidAssigned = this.fdr.flightRules === 'V' && this.sid && this.sid.length > 0;
        
        // Check squawk correctness
        this.squawkCorrect = this.checkSquawkCorrect();
    }

    // Get arrival or departure type
    get arrDepType() {
        if (!this.bayManager) {
            return StripArrDepType.UNKNOWN;
        }

        if (this.fdr.desAirport && this.fdr.desAirport.toUpperCase() === this.bayManager.aerodromeName.toUpperCase()) {
            return StripArrDepType.ARRIVAL;
        }

        return this.fdr.depAirport && this.fdr.depAirport.toUpperCase() === this.bayManager.aerodromeName.toUpperCase() ?
            StripArrDepType.DEPARTURE :
            StripArrDepType.UNKNOWN;
    }

    // Get CFL (Cleared Flight Level)
    get cfl() {
        return this.fdr.cflString || "";
    }

    set cfl(value) {
        if (this.fdr) {
            this.fdr.cflString = value;
        }
    }

    // Get RFL (Requested Flight Level)
    get rfl() {
        if (!this.fdr || !this.fdr.rfl) return "000";
        return Math.floor(this.fdr.rfl / 100).toString().padStart(3, '0');
    }

    // Get time (EOBT)
    get time() {
        if (!this.fdr || !this.fdr.eobt) return "";
        return this.fdr.eobt;
    }

    // Get route
    get route() {
        if (!this.fdr) return "";
        return this.fdr.route || "";
    }

    // Get first waypoint
    getFirstWaypoint() {
        if (!this.fdr || !this.fdr.route) return "";
        
        const route = this.fdr.route;
        const parts = route.split(' ');
        
        if (parts.length === 0) return "";
        
        // Skip departure airport
        let startIndex = 0;
        if (parts[0] === this.fdr.depAirport) {
            startIndex = 1;
        }
        
        // Find first waypoint
        for (let i = startIndex; i < parts.length; i++) {
            const part = parts[i];
            if (part && part.length > 0 && !this.isAirportSpecificWaypoint(part)) {
                return part;
            }
        }
        
        return "";
    }

    // Check if waypoint is airport-specific
    isAirportSpecificWaypoint(waypoint) {
        const airportSpecific = ["ML", "TESAT"]; // Add more as needed
        return airportSpecific.includes(waypoint.toUpperCase());
    }

    // Check squawk correctness
    checkSquawkCorrect() {
        if (!this.fdr) return true;
        
        // Check if SSR code is assigned and valid
        if (this.fdr.assignedSSRCode === -1 || this.fdr.assignedSSRCode === 0) {
            return false;
        }
        
        // Check Mode C (simplified - in real implementation this would check actual Mode C)
        return true;
    }

    // Set HMI picked state
    setHMIPicked(picked) {
        this.hmiPicked = picked;
        if (this.controller) {
            this.controller.hmiTogglePick(picked);
        }
    }

    // Cock strip
    cockStrip() {
        this.cockLevel = (this.cockLevel + 1) % 2;
        this.syncStrip();
    }

    // Take off
    takeOff() {
        if (!this.takeOffTime) {
            this.takeOffTime = new Date();
        }
        this.syncStrip();
    }

    // SID trigger
    sidTrigger() {
        if (this.currentBay === StripBay.BAY_PREA) {
            this.currentBay = StripBay.BAY_CLEARED;
        } else if (this.currentBay === StripBay.BAY_CLEARED) {
            this.currentBay = StripBay.BAY_PUSHED;
        } else if (this.currentBay === StripBay.BAY_PUSHED) {
            this.currentBay = StripBay.BAY_TAXI;
        } else if (this.currentBay === StripBay.BAY_TAXI) {
            this.currentBay = StripBay.BAY_HOLDSHORT;
        } else if (this.currentBay === StripBay.BAY_HOLDSHORT) {
            this.currentBay = StripBay.BAY_RUNWAY;
        } else if (this.currentBay === StripBay.BAY_RUNWAY) {
            this.currentBay = StripBay.BAY_DEPARTURE;
        } else if (this.currentBay === StripBay.BAY_DEPARTURE) {
            this.currentBay = StripBay.BAY_DEAD;
        }
        
        this.syncStrip();
        this.bayManager.updateBay(this);
    }

    // Toggle pick
    togglePick() {
        this.hmiPicked = !this.hmiPicked;
        this.setHMIPicked(this.hmiPicked);
    }

    // Open vatSys FDR (web equivalent - could open in new window or modal)
    openVatsysFDR() {
        // In web version, this could open a modal with FDR details
        console.log("Opening FDR for:", this.fdr.callsign);
    }

    // Sync strip to server
    syncStrip() {
        if (this.socketConn) {
            this.socketConn.syncSC(this);
        }
    }

    // Send delete message
    sendDeleteMessage() {
        if (this.socketConn) {
            this.socketConn.syncDeletion(this);
        }
    }

    // Check if strip is applicable to aerodrome
    applicableToAerodrome(name) {
        if (!name || !this.fdr) return false;
        
        const upperName = name.toUpperCase();
        return (this.fdr.depAirport && this.fdr.depAirport.toUpperCase() === upperName) ||
               (this.fdr.desAirport && this.fdr.desAirport.toUpperCase() === upperName);
    }

    // Get distance to aerodrome (simplified)
    getDistToAerodrome(aerodrome) {
        // Simplified distance calculation
        // In real implementation, this would use actual coordinates
        return 0;
    }

    // Get radar track (simplified)
    getRadarTrack() {
        // In web version, this would return track data if available
        return null;
    }

    // Update FDR data
    updateFDR(newFdr) {
        if (!newFdr) return;
        
        this.fdr = newFdr;
        this.initializeFromFDR();
        
        // Check and invalidate saved routes if aerodrome pair changed
        this.checkAndInvalidateSavedRoutes(newFdr);
    }

    // Check and invalidate saved routes
    checkAndInvalidateSavedRoutes(newFdr) {
        const newPairing = `${newFdr.depAirport}-${newFdr.desAirport}`;
        if (this.validRoutesAerodromePairing && this.validRoutesAerodromePairing !== newPairing) {
            this.validRoutes = null;
            this.parsedRoutes = false;
            this.dodgyRoute = false;
        }
        this.validRoutesAerodromePairing = newPairing;
    }

    // Fetch strip data
    fetchStripData() {
        if (this.socketConn) {
            this.socketConn.requestStrip(this);
        }
    }

    // Determine SC validity
    determineSCValidity() {
        if (!this.fdr) return false;
        
        // Check if strip is valid for current aerodrome
        return this.applicableToAerodrome(this.bayManager.aerodromeName);
    }

    // Coordinate strip
    coordinateStrip() {
        // In original, this coordinates with vatSys
        // In web version, this could trigger coordination events
        console.log("Coordinating strip:", this.fdr.callsign);
    }

    // To string
    toString() {
        return `Strip: ${this.fdr ? this.fdr.callsign : 'Unknown'} - ${this.currentBay}`;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Strip;
} 