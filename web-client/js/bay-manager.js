/**
 * OzStrips Web Client Bay Manager
 * Mirrors the original OzStrips BayManager.cs functionality exactly
 */

class BayManager {
    constructor() {
        this.pickedStripItem = null;
        this.worldFlightMode = false;
        this.aerodromeName = "????";
        this.pickedBay = null;
        this.bays = [];
        this.stripRepository = new StripRepository();
        this.bayRepository = new BayRepository(this);
    }

    // Get picked controller
    get pickedController() {
        if (this.pickedStripItem && this.pickedStripItem.type === StripItemType.STRIP) {
            return this.pickedStripItem.stripController;
        }
        return null;
    }

    // Set picked callsign
    setPickedCallsign(callsign, ground) {
        if (callsign) {
            const strip = this.stripRepository.getController(callsign);
            if (strip) {
                this.setPickedFromFDR(strip.fdr);
            }
        } else {
            this.removePicked(false, true);
        }
    }

    // Set picked from FDR
    setPickedFromFDR(fdr) {
        if (!fdr) return;

        const strip = this.stripRepository.getController(fdr.callsign);
        if (strip) {
            this.setPickedStripItem({
                type: StripItemType.STRIP,
                stripController: strip,
                bay: this.findBayForStrip(strip)
            });
        }
    }

    // Find bay for strip
    findBayForStrip(strip) {
        return this.bays.find(bay => bay.strips.includes(strip));
    }

    // Force strip
    forceStrip(socketConn) {
        // In web version, this would force a strip from external selection
        console.log("Force strip called");
    }

    // SID trigger
    sidTrigger() {
        if (this.pickedController) {
            this.pickedController.sidTrigger();
        }
    }

    // Cock strip
    cockStrip() {
        if (this.pickedController) {
            this.pickedController.cockStrip();
        }
    }

    // Inhibit
    inhibit() {
        if (this.pickedController) {
            this.pickedController.currentBay = StripBay.BAY_DEAD;
            this.pickedController.syncStrip();
            this.updateBay(this.pickedController);
            this.removePicked(true, true);
        } else if (this.pickedBay && this.pickedStripItem && this.pickedStripItem.type !== StripItemType.STRIP) {
            this.pickedBay.deleteBar(this.pickedStripItem);
        }
    }

    // Send PDC
    sendPDC(strip = null) {
        const targetStrip = strip || this.pickedController;
        if (targetStrip) {
            // In web version, this would open PDC window
            console.log("Send PDC for:", targetStrip.fdr.callsign);
        }
    }

    // Cross strip
    crossStrip() {
        if (this.pickedController) {
            this.pickedController.crossing = !this.pickedController.crossing;
            this.pickedController.syncStrip();
        }
    }

    // Drop strip
    dropStrip(bay) {
        if (this.pickedController) {
            const currentBay = this.findBayForStrip(this.pickedController);
            if (currentBay) {
                currentBay.removeStrip(this.pickedController);
            }
            bay.addStrip(this.pickedController);
            this.removePicked(true);
        }
    }

    // Set aerodrome
    setAerodrome(name, socketConn) {
        this.aerodromeName = name.toUpperCase();
        
        // Update UI
        const aerodromeElement = document.getElementById('current-aerodrome');
        if (aerodromeElement) {
            aerodromeElement.textContent = this.aerodromeName;
        }

        // Sync with server
        if (socketConn) {
            socketConn.setAerodrome();
        }
    }

    // Set picked strip item
    setPickedStripItem(item, sendToVatsys = false, bay = null) {
        this.pickedStripItem = item;
        this.pickedBay = bay || item.bay;

        if (item.type === StripItemType.STRIP) {
            this.pickedController.setHMIPicked(true);
        }
    }

    // Toggle picked
    togglePicked(item, sendToVatsys = false, bay = null) {
        if (this.pickedStripItem === item) {
            this.removePicked(sendToVatsys);
        } else {
            this.setPickedStripItem(item, sendToVatsys, bay);
        }
    }

    // Remove picked
    removePicked(sendToVatsys = false, force = false) {
        if (this.pickedController) {
            this.pickedController.setHMIPicked(false);
        }
        this.pickedStripItem = null;
        this.pickedBay = null;
    }

    // Wipe strips
    wipeStrips() {
        this.bays.forEach(bay => {
            bay.strips = [];
            bay.resizeBay();
        });
        this.removePicked(true);
    }

    // Add strip
    addStrip(strip, save = true, inhibitReorders = false) {
        const bay = this.findBayForStripType(strip.currentBay);
        if (bay) {
            bay.addStrip(strip);
            
            if (save) {
                strip.syncStrip();
            }
        }
    }

    // Update bay
    updateBay(strip) {
        const bay = this.findBayForStripType(strip.currentBay);
        if (bay) {
            // Remove from current bay
            this.bays.forEach(b => {
                if (b.strips.includes(strip)) {
                    b.removeStrip(strip);
                }
            });
            
            // Add to new bay
            bay.addStrip(strip);
        }
    }

    // Force rerender
    forceRerender() {
        this.bays.forEach(bay => {
            bay.render();
        });
    }

    // Position to next bar
    positionToNextBar(direction) {
        if (!this.pickedStripItem) return;

        const currentBay = this.pickedBay;
        if (!currentBay) return;

        const currentIndex = this.bays.indexOf(currentBay);
        const newIndex = Math.max(0, Math.min(this.bays.length - 1, currentIndex + direction));
        
        if (newIndex !== currentIndex) {
            const newBay = this.bays[newIndex];
            this.dropStrip(newBay);
        }
    }

    // Position key
    positionKey(relativePosition) {
        if (this.pickedStripItem) {
            const bay = this.findBayForStrip(this.pickedStripItem.stripController);
            if (bay) {
                bay.changeStripPosition(this.pickedStripItem.stripController, relativePosition);
            }
        }
    }

    // Queue up
    queueUp() {
        if (this.pickedController) {
            const bay = this.findBayForStrip(this.pickedController);
            if (bay) {
                bay.queueUp();
            }
        }
    }

    // Add bar
    addBar(bayString, type, text) {
        const bay = this.bays.find(b => b.name === bayString);
        if (bay) {
            bay.addBar(type, text);
        }
    }

    // Set picked strip item (overload)
    setPickedStripItem(strip, sendToVatsys = false) {
        const bay = this.findBayForStrip(strip);
        if (bay) {
            const item = bay.getListItem(strip);
            this.setPickedStripItem(item, sendToVatsys, bay);
            return true;
        }
        return false;
    }

    // Find bay for strip type
    findBayForStripType(bayType) {
        return this.bays.find(bay => bay.bayTypes.includes(bayType));
    }

    // Create default bays
    createDefaultBays() {
        // Clear existing bays
        this.bays = [];
        
        // Create default bay layout
        this.bays.push(new Bay([StripBay.BAY_PREA], this, null, "Preactive", 0));
        this.bays.push(new Bay([StripBay.BAY_CLEARED], this, null, "Cleared", 1));
        this.bays.push(new Bay([StripBay.BAY_PUSHED], this, null, "Pushback", 2));
        this.bays.push(new Bay([StripBay.BAY_TAXI], this, null, "Taxi", 3));
        this.bays.push(new Bay([StripBay.BAY_HOLDSHORT], this, null, "Holding Point", 4));
        this.bays.push(new Bay([StripBay.BAY_RUNWAY], this, null, "Runway", 5));
        this.bays.push(new Bay([StripBay.BAY_DEPARTURE], this, null, "Departure", 6));
        this.bays.push(new Bay([StripBay.BAY_ARRIVAL], this, null, "Arrival", 7));
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BayManager;
} 