/**
 * OzStrips Web Client Socket Connection
 * Mirrors the original OzStrips SocketConn.cs functionality exactly
 */

class SocketConnection {
    constructor(bayManager, mainForm) {
        this.bayManager = bayManager;
        this.mainForm = mainForm;
        this.connection = null;
        this.freshClient = true;
        this.connected = false;
        this.isDisposed = false;
        this.messages = [];
        this.serverType = ServerTypes.VATSIM;
        this.versionShown = false;
        
        this.initializeConnection();
    }

    // Initialize SignalR connection
    initializeConnection() {
        // Skip connection if no server address is configured
        if (!OzStripsConfig.socketioaddr) {
            console.log("Running in offline mode - no SignalR connection");
            return;
        }

        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(OzStripsConfig.socketioaddr + "OzStripsHub")
            .withAutomaticReconnect()
            .build();

        this.setupEventHandlers();
    }

    // Setup event handlers
    setupEventHandlers() {
        // Skip if no connection
        if (!this.connection) return;

        // Connection events
        this.connection.onclose(async (error) => {
            await this.connectionLost(error);
        });

        this.connection.onreconnected(async (connectionId) => {
            await this.markConnected();
        });

        this.connection.onreconnecting(async (error) => {
            await this.connectionLost(error);
        });

        // Server message handlers
        this.connection.on("StripUpdate", (stripControllerDTO) => {
            this.addMessage("s:StripUpdate: " + JSON.stringify(stripControllerDTO));
            
            if (stripControllerDTO) {
                this.bayManager.stripRepository.updateFDR(stripControllerDTO, this.bayManager);
            }
        });

        this.connection.on("StripCache", (stripControllerDTOs) => {
            this.addMessage("s:StripCache: " + JSON.stringify(stripControllerDTOs));
            
            if (stripControllerDTOs && this.freshClient) {
                this.bayManager.stripRepository.loadCache(stripControllerDTOs, this.bayManager, this);
            }
        });

        this.connection.on("UpdateCache", async () => {
            this.addMessage("s:UpdateCache");
            if (!this.freshClient) {
                await this.sendCache();
            }
        });

        this.connection.on("Atis", (code) => {
            if (code) {
                this.mainForm.setATISCode(code);
            }
        });

        this.connection.on("ActivateWorldFlightMode", () => {
            this.bayManager.worldFlightMode = true;
        });

        this.connection.on("Metar", (metar) => {
            if (metar) {
                this.mainForm.setMetar(metar);
            }
        });

        this.connection.on("BayUpdate", (bayDTO) => {
            this.addMessage("s:BayUpdate: " + JSON.stringify(bayDTO));
            
            if (bayDTO) {
                this.bayManager.bayRepository.updateOrder(bayDTO);
            }
        });

        this.connection.on("Routes", (acid, routes) => {
            if (!acid || !routes || routes.length === 0) {
                return;
            }

            try {
                this.addMessage("s:Routes: " + JSON.stringify(routes));
                
                const strip = this.bayManager.stripRepository.getController(acid);
                if (strip) {
                    strip.validRoutes = routes;
                }
            } catch (ex) {
                console.error("Error handling routes:", ex);
            }
        });

        this.connection.on("GetStripStatus", (acid) => {
            if (acid) {
                this.bayManager.stripRepository.getStripStatus(acid, this);
            }
        });

        this.connection.on("VersionInfo", (appVersion) => {
            if (!appVersion) return;

            if (!this.versionShown && appVersion !== OzStripsConfig.version) {
                this.versionShown = true;
                this.showInfoBox("New Update Available: " + appVersion);
            }
        });

        this.connection.on("Message", (message) => {
            if (message) {
                this.showWarnBox(message);
            }
        });
    }

    // Connect to server
    async connect() {
        if (this.isDisposed) return;

        // Skip connection if no server address is configured
        if (!OzStripsConfig.socketioaddr) {
            this.connected = false;
            this.addMessage("Running in offline mode - no server connection");
            return;
        }

        try {
            await this.connection.start();
            this.connected = true;
            this.addMessage("Connected to server");
            
            // Set aerodrome after connection
            await this.setAerodrome();
            
        } catch (error) {
            console.error("Connection failed:", error);
            this.connected = false;
            this.addMessage("Connection failed: " + error.message);
            
            // Retry connection after delay
            setTimeout(() => {
                if (!this.isDisposed) {
                    this.connect();
                }
            }, 10000);
        }
    }

    // Disconnect from server
    async disconnect() {
        if (this.connection) {
            await this.connection.stop();
        }
        this.connected = false;
        this.addMessage("Disconnected from server");
    }

    // Set aerodrome
    async setAerodrome() {
        if (!this.connected || !this.connection) return;

        try {
            await this.connection.invoke("SetAerodrome", this.bayManager.aerodromeName);
            this.addMessage("Set aerodrome: " + this.bayManager.aerodromeName);
        } catch (error) {
            console.error("Failed to set aerodrome:", error);
        }
    }

    // Set server type
    async setServerType(type) {
        this.serverType = type;
        
        if (this.canConnectToCurrentServer()) {
            await this.connect();
        }
    }

    // Check if can connect to current server
    canConnectToCurrentServer() {
        return this.serverType === ServerTypes.VATSIM;
    }

    // Sync strip controller
    syncSC(strip) {
        if (!this.canSendDTO()) return;

        const dto = this.createStripDTO(strip);
        this.connection.invoke("StripUpdate", dto);
        this.addMessage("c:StripUpdate: " + JSON.stringify(dto));
    }

    // Send strip status
    sendStripStatus(strip, acid) {
        if (!this.canSendDTO()) return;

        const dto = this.createStripDTO(strip);
        this.connection.invoke("StripStatus", acid, dto);
        this.addMessage("c:StripStatus: " + JSON.stringify(dto));
    }

    // Request routes
    requestRoutes(strip) {
        if (!this.canSendDTO()) return;

        this.connection.invoke("RequestRoutes", strip.fdr.callsign);
        this.addMessage("c:RequestRoutes: " + strip.fdr.callsign);
    }

    // Request strip
    requestStrip(strip) {
        if (!this.canSendDTO()) return;

        this.connection.invoke("RequestStrip", strip.fdr.callsign);
        this.addMessage("c:RequestStrip: " + strip.fdr.callsign);
    }

    // Ready for bay data
    readyForBayData(force = false) {
        if (!this.canSendDTO()) return;

        this.connection.invoke("ReadyForBayData", force);
        this.addMessage("c:ReadyForBayData: " + force);
    }

    // Sync deletion
    syncDeletion(strip) {
        if (!this.canSendDTO()) return;

        this.connection.invoke("StripDeletion", strip.fdr.callsign);
        this.addMessage("c:StripDeletion: " + strip.fdr.callsign);
    }

    // Sync bay
    syncBay(bay) {
        if (!this.canSendDTO()) return;

        const dto = this.createBayDTO(bay);
        this.connection.invoke("BayUpdate", dto);
        this.addMessage("c:BayUpdate: " + JSON.stringify(dto));
    }

    // Send cache
    async sendCache() {
        if (!this.canSendDTO()) return;

        const cacheDTO = this.createCacheDTO();
        await this.connection.invoke("StripCache", cacheDTO);
        this.addMessage("c:StripCache: " + JSON.stringify(cacheDTO));
    }

    // Create strip DTO
    createStripDTO(strip) {
        if (!strip || !strip.fdr) return null;

        return {
            acid: strip.fdr.callsign,
            depAirport: strip.fdr.depAirport,
            desAirport: strip.fdr.desAirport,
            aircraftType: strip.fdr.aircraftType,
            aircraftWake: strip.fdr.aircraftWake,
            assignedSSRCode: strip.fdr.assignedSSRCode,
            flightRules: strip.fdr.flightRules,
            route: strip.fdr.route,
            eobt: strip.fdr.eobt,
            rfl: strip.fdr.rfl,
            cflString: strip.fdr.cflString,
            globalOpData: strip.fdr.globalOpData,
            remarks: strip.fdr.remarks,
            pdcSent: strip.fdr.pdcSent,
            textOnly: strip.fdr.textOnly,
            receiveOnly: strip.fdr.receiveOnly,
            currentBay: strip.currentBay,
            cockLevel: strip.cockLevel,
            crossing: strip.crossing,
            ready: strip.ready,
            clx: strip.clx,
            remark: strip.remark,
            gate: strip.gate,
            hdg: strip.hdg,
            rwy: strip.rwy,
            sid: strip.sid,
            firstWpt: strip.firstWpt,
            vfrSidAssigned: strip.vfrSidAssigned,
            sidTransition: strip.sidTransition,
            squawkCorrect: strip.squawkCorrect,
            takeOffTime: strip.takeOffTime,
            validRoutes: strip.validRoutes,
            condensedRoute: strip.condensedRoute,
            requestedRoutes: strip.requestedRoutes,
            parsedRoutes: strip.parsedRoutes,
            validRoutesAerodromePairing: strip.validRoutesAerodromePairing,
            dodgyRoute: strip.dodgyRoute
        };
    }

    // Create bay DTO
    createBayDTO(bay) {
        return {
            name: bay.name,
            index: bay.index,
            bayTypes: bay.bayTypes,
            strips: bay.strips.map(strip => strip.fdr.callsign),
            bars: bay.bars.map(bar => ({
                type: bar.type,
                text: bar.text
            }))
        };
    }

    // Create cache DTO
    createCacheDTO() {
        const strips = this.bayManager.stripRepository.controllers.map(strip => 
            this.createStripDTO(strip)
        ).filter(dto => dto !== null);

        return {
            strips: strips,
            aerodrome: this.bayManager.aerodromeName,
            version: OzStripsConfig.version
        };
    }

    // Check if can send DTO
    canSendDTO() {
        return this.connected && !this.isDisposed && this.connection;
    }

    // Connection lost
    async connectionLost(error) {
        this.connected = false;
        this.addMessage("Connection lost: " + (error ? error.message : "Unknown error"));
        
        // Update UI
        this.updateConnectionStatus();
    }

    // Mark connected
    async markConnected() {
        this.connected = true;
        this.freshClient = false;
        this.addMessage("Reconnected to server");
        
        // Update UI
        this.updateConnectionStatus();
        
        // Set aerodrome after reconnection
        await this.setAerodrome();
    }

    // Update connection status
    updateConnectionStatus() {
        const statusElement = document.getElementById('connection-status');
        if (statusElement) {
            statusElement.className = `status-indicator ${this.connected ? 'connected' : 'disconnected'}`;
        }
    }

    // Add message to debug log
    addMessage(message) {
        this.messages.push(new Date().toISOString() + ": " + message);
        
        // Keep only last 100 messages
        if (this.messages.length > 100) {
            this.messages.splice(0, this.messages.length - 100);
        }
        
        // Update debug panel if visible
        this.updateDebugPanel();
    }

    // Update debug panel
    updateDebugPanel() {
        const debugMessages = document.getElementById('debug-messages');
        if (debugMessages) {
            debugMessages.innerHTML = this.messages.map(msg => 
                `<div class="debug-message">${msg}</div>`
            ).join('');
            debugMessages.scrollTop = debugMessages.scrollHeight;
        }
    }

    // Show info box
    showInfoBox(message) {
        alert("Info: " + message);
    }

    // Show warning box
    showWarnBox(message) {
        alert("Warning: " + message);
    }

    // Dispose
    async dispose() {
        this.isDisposed = true;
        await this.disconnect();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SocketConnection;
} 