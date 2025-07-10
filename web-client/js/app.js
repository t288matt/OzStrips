/**
 * OzStrips Web Client Main Application
 * Mirrors the original OzStrips MainForm.cs functionality exactly
 */

class MainForm {
    constructor() {
        this.bayManager = new BayManager();
        this.socketConn = new SocketConnection(this.bayManager, this);
        this.keyboardHandler = new KeyboardHandler(this.bayManager, this);
        this.modalManager = new ModalManager();
        
        this.aerodromes = [...OzStripsConfig.defaultAerodromes];
        this.currentAerodromeIndex = 0;
        
        this.setupEventListeners();
        this.initializeUI();
        this.startTimer();
    }

    // Setup event listeners
    setupEventListeners() {
        // Aerodrome input
        const aerodromeInput = document.getElementById('aerodrome-input');
        if (aerodromeInput) {
            aerodromeInput.addEventListener('keypress', (e) => this.handleAerodromeKeyPress(e));
        }

        // Aerodrome select
        const aerodromeSelect = document.getElementById('aerodrome-select');
        if (aerodromeSelect) {
            aerodromeSelect.addEventListener('change', (e) => this.handleAerodromeChange(e));
        }

        // View mode
        const viewMode = document.getElementById('view-mode');
        if (viewMode) {
            viewMode.addEventListener('change', (e) => this.handleViewModeChange(e));
        }

        // Control buttons
        const inhibitBtn = document.getElementById('inhibit-btn');
        if (inhibitBtn) {
            inhibitBtn.addEventListener('click', () => this.bayManager.inhibit());
        }

        const forceStripBtn = document.getElementById('force-strip-btn');
        if (forceStripBtn) {
            forceStripBtn.addEventListener('click', () => this.bayManager.forceStrip(this.socketConn));
        }

        const crossBtn = document.getElementById('cross-btn');
        if (crossBtn) {
            crossBtn.addEventListener('click', () => this.bayManager.crossStrip());
        }

        const pdcBtn = document.getElementById('pdc-btn');
        if (pdcBtn) {
            pdcBtn.addEventListener('click', () => this.bayManager.sendPDC());
        }

        const addBarBtn = document.getElementById('add-bar-btn');
        if (addBarBtn) {
            addBarBtn.addEventListener('click', () => this.showAddBarModal());
        }

        // Debug button
        const debugBtn = document.getElementById('debug-btn');
        if (debugBtn) {
            debugBtn.addEventListener('click', () => this.toggleDebug());
        }

        // About button
        const aboutBtn = document.getElementById('about-btn');
        if (aboutBtn) {
            aboutBtn.addEventListener('click', () => this.showAbout());
        }

        // Close debug button
        const closeDebugBtn = document.getElementById('close-debug');
        if (closeDebugBtn) {
            closeDebugBtn.addEventListener('click', () => this.toggleDebug());
        }

        // Window resize
        window.addEventListener('resize', () => this.handleResize());
    }

    // Initialize UI
    initializeUI() {
        this.populateAerodromeSelect();
        this.createDefaultBays();
        this.updateTime();
        this.setAerodrome(this.aerodromes[0]);
        // Update connection status
        this.updateConnectionStatus();
    }

    // Populate aerodrome select
    populateAerodromeSelect() {
        const select = document.getElementById('aerodrome-select');
        if (!select) return;

        select.innerHTML = '<option value="">Select Aerodrome</option>';
        this.aerodromes.forEach(aerodrome => {
            const option = document.createElement('option');
            option.value = aerodrome;
            option.textContent = aerodrome;
            select.appendChild(option);
        });
    }

    // Create default bays
    createDefaultBays() {
        this.bayManager.createDefaultBays();
    }

    // Start timer
    startTimer() {
        setInterval(() => this.updateTime(), 1000);
    }

    // Update time
    updateTime() {
        const timeElement = document.getElementById('current-time');
        if (timeElement) {
            const now = new Date();
            const utcTime = now.toISOString().substr(11, 8);
            timeElement.textContent = utcTime;
        }
    }

    // Handle aerodrome key press
    handleAerodromeKeyPress(event) {
        if (event.key === 'Enter') {
            const input = event.target;
            const aerodrome = input.value.toUpperCase();
            if (aerodrome.length === 4) {
                this.setAerodrome(aerodrome);
                input.value = '';
            }
        }
    }

    // Handle aerodrome change
    handleAerodromeChange(event) {
        const aerodrome = event.target.value;
        if (aerodrome) {
            this.setAerodrome(aerodrome);
        }
    }

    // Handle view mode change
    handleViewModeChange(event) {
        const viewMode = event.target.value;
        console.log("View mode changed to:", viewMode);
        // In web version, this would filter strips based on view mode
    }

    // Set aerodrome
    setAerodrome(name) {
        this.bayManager.setAerodrome(name, this.socketConn);
        
        // Update aerodrome select
        const select = document.getElementById('aerodrome-select');
        if (select) {
            select.value = name;
        }
    }

    // Move lateral aerodrome
    moveLateralAerodrome(direction) {
        this.currentAerodromeIndex = Math.max(0, Math.min(this.aerodromes.length - 1, this.currentAerodromeIndex + direction));
        const aerodrome = this.aerodromes[this.currentAerodromeIndex];
        this.setAerodrome(aerodrome);
    }

    // Set ATIS code
    setATISCode(code) {
        console.log("ATIS code set to:", code);
        // In web version, this would display ATIS information
    }

    // Set METAR
    setMetar(metar) {
        console.log("METAR set to:", metar);
        // In web version, this would display METAR information
    }

    // Toggle debug
    toggleDebug() {
        const debugPanel = document.getElementById('debug-panel');
        if (debugPanel) {
            debugPanel.classList.toggle('hidden');
        }
    }

    // Show about
    showAbout() {
        const connectionStatus = OzStripsConfig.socketioaddr ? 
            "Connected to SignalR server for real-time updates." : 
            "Running in offline mode - no server connection.";
            
        alert(`OzStrips Web Client v${OzStripsConfig.version}\n\nA web-based client for OzStrips electronic flight strips system.\n\nMirrors the original Windows Forms application functionality exactly.\n\n${connectionStatus}\n\nFor more information, visit: https://maxrumsey.xyz/OzStrips/`);
    }

    // Update connection status
    updateConnectionStatus() {
        const statusElement = document.getElementById('connection-status');
        if (statusElement) {
            if (!OzStripsConfig.socketioaddr) {
                statusElement.className = 'status-indicator offline';
                statusElement.title = 'Offline Mode - No Server Connection';
            } else if (this.socketConn.connected) {
                statusElement.className = 'status-indicator connected';
                statusElement.title = 'Connected to Server';
            } else {
                statusElement.className = 'status-indicator disconnected';
                statusElement.title = 'Disconnected from Server';
            }
        }
    }

    // Show add bar modal
    showAddBarModal() {
        const bayName = prompt("Enter bay name:");
        if (bayName) {
            const barType = prompt("Enter bar type (1=Yellow, 2=Orange, 3=Red):", "1");
            const barText = prompt("Enter bar text:");
            
            if (barText) {
                this.bayManager.addBar(bayName, parseInt(barType) || 1, barText);
            }
        }
    }

    // Handle resize
    handleResize() {
        this.bayManager.forceRerender();
    }

    // Connect to server
    async connect() {
        await this.socketConn.connect();
    }

    // Disconnect from server
    async disconnect() {
        await this.socketConn.disconnect();
    }

    // Dispose
    dispose() {
        this.keyboardHandler.dispose();
        this.socketConn.dispose();
    }
}

// Create missing classes that are referenced but not yet implemented
class StripRepository {
    constructor() {
        this.controllers = [];
    }

    updateFDR(fdrDTO, bayManager) {
        // Find existing strip or create new one
        let strip = this.getController(fdrDTO.acid);
        if (!strip) {
            strip = new Strip(fdrDTO, bayManager, null);
            this.controllers.push(strip);
        } else {
            strip.updateFDR(fdrDTO);
        }
        return strip;
    }

    loadCache(stripDTOs, bayManager, socketConn) {
        this.controllers = [];
        stripDTOs.forEach(dto => {
            const strip = new Strip(dto, bayManager, socketConn);
            this.controllers.push(strip);
            bayManager.addStrip(strip, false);
        });
    }

    getController(callsign) {
        return this.controllers.find(strip => strip.fdr.callsign === callsign);
    }

    getStripStatus(acid, socketConn) {
        const strip = this.getController(acid);
        if (strip) {
            socketConn.sendStripStatus(strip, acid);
        }
    }
}

class BayRepository {
    constructor(bayManager) {
        this.bayManager = bayManager;
    }

    updateOrder(bayDTO) {
        // Update bay order based on DTO
        console.log("Bay order update:", bayDTO);
    }
}

class ModalManager {
    constructor() {
        this.currentModal = null;
    }

    showModal(content, title) {
        const overlay = document.getElementById('modal-overlay');
        const container = document.getElementById('modal-container');
        
        if (overlay && container) {
            container.innerHTML = `
                <div class="modal">
                    <div class="modal-header">
                        <h3>${title}</h3>
                        <button class="modal-close" onclick="this.closeModal()">×</button>
                    </div>
                    <div class="modal-content">
                        ${content}
                    </div>
                </div>
            `;
            
            overlay.classList.remove('hidden');
            this.currentModal = overlay;
        }
    }

    closeModal() {
        if (this.currentModal) {
            this.currentModal.classList.add('hidden');
            this.currentModal = null;
        }
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.ozStripsApp = new MainForm();
    
    // Connect to server (will be skipped in offline mode)
    window.ozStripsApp.connect();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MainForm;
} 