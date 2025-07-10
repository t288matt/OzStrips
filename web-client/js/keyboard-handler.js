/**
 * OzStrips Web Client Keyboard Handler
 * Mirrors the original OzStrips keyboard functionality exactly
 */

class KeyboardHandler {
    constructor(bayManager, mainForm) {
        this.bayManager = bayManager;
        this.mainForm = mainForm;
        this.setupEventListeners();
    }

    // Setup event listeners
    setupEventListeners() {
        document.addEventListener('keydown', (event) => this.handleKeyDown(event));
        document.addEventListener('keyup', (event) => this.handleKeyUp(event));
        
        // Prevent context menu on right click
        document.addEventListener('contextmenu', (event) => {
            event.preventDefault();
        });
    }

    // Handle key down
    handleKeyDown(event) {
        // Check for modifier keys
        const ctrlKey = event.ctrlKey;
        const altKey = event.altKey;
        const shiftKey = event.shiftKey;

        // Handle Ctrl+Up/Down for moving between bars
        if (ctrlKey && event.key === 'ArrowUp') {
            this.bayManager.positionToNextBar(1);
            event.preventDefault();
            return true;
        }
        
        if (ctrlKey && event.key === 'ArrowDown') {
            this.bayManager.positionToNextBar(-1);
            event.preventDefault();
            return true;
        }

        // Handle Alt+X for crossing bar
        if (altKey && event.key.toLowerCase() === 'x') {
            this.bayManager.addBar("Runway", 3, "XXX CROSSING XXX");
            event.preventDefault();
            return true;
        }

        // Handle individual keys
        switch (event.key) {
            case 'ArrowUp':
                this.bayManager.positionKey(1);
                event.preventDefault();
                return true;
                
            case 'ArrowDown':
                this.bayManager.positionKey(-1);
                event.preventDefault();
                return true;
                
            case ' ':
                this.bayManager.queueUp();
                event.preventDefault();
                return true;
                
            case 'Enter':
                this.bayManager.sidTrigger();
                event.preventDefault();
                return true;
                
            case 'Tab':
                this.bayManager.cockStrip();
                event.preventDefault();
                return true;
                
            case '[':
                this.mainForm.moveLateralAerodrome(-1);
                event.preventDefault();
                return true;
                
            case ']':
                this.mainForm.moveLateralAerodrome(1);
                event.preventDefault();
                return true;
                
            case 'Backspace':
                this.bayManager.inhibit();
                event.preventDefault();
                return true;
                
            case 'x':
            case 'X':
                this.bayManager.crossStrip();
                event.preventDefault();
                return true;
                
            default:
                break;
        }

        // Force rerender
        this.bayManager.forceRerender();
        return false;
    }

    // Handle key up
    handleKeyUp(event) {
        // Handle any key up events if needed
        return false;
    }

    // Process command key (for modal dialogs)
    processCmdKey(keyData) {
        switch (keyData) {
            case 'Enter':
                // In modal context, this would exit modal with data
                return true;
                
            case 'Escape':
                // In modal context, this would exit modal without data
                return true;
                
            default:
                return false;
        }
    }

    // Handle mouse events for strips
    handleMouseEvent(event, stripView) {
        const rect = stripView.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Determine which button was pressed
        let button = MouseButtons.Left;
        if (event.button === 2) {
            button = MouseButtons.Right;
        } else if (event.button === 1) {
            button = MouseButtons.Middle;
        }

        // Create mouse event object similar to Windows Forms
        const mouseEvent = {
            x: x,
            y: y,
            button: button,
            isRightClick: button === MouseButtons.Right
        };

        // Handle click
        if (event.type === 'click') {
            stripView.handleClick(mouseEvent);
        } else if (event.type === 'contextmenu') {
            mouseEvent.button = MouseButtons.Right;
            stripView.handleClick(mouseEvent);
        } else if (event.type === 'mousemove') {
            stripView.handleHover(mouseEvent);
        }
    }

    // Handle drag and drop
    handleDragDrop(event, strip, targetBay) {
        if (strip && targetBay) {
            this.bayManager.dropStrip(targetBay);
        }
    }

    // Handle focus events
    handleFocusEvent(event) {
        // Handle focus events for keyboard navigation
        const target = event.target;
        
        // If focusing on a bay, select it
        if (target.classList.contains('bay')) {
            const bayIndex = parseInt(target.dataset.index);
            if (!isNaN(bayIndex)) {
                // Select the bay
                this.selectBay(bayIndex);
            }
        }
    }

    // Select bay
    selectBay(bayIndex) {
        if (this.bayManager.bays[bayIndex]) {
            this.bayManager.pickedBay = this.bayManager.bays[bayIndex];
        }
    }

    // Handle special key combinations
    handleSpecialKeys(event) {
        // Handle Ctrl+A for select all (if applicable)
        if (event.ctrlKey && event.key.toLowerCase() === 'a') {
            event.preventDefault();
            // In web version, this could select all strips
            return true;
        }

        // Handle Ctrl+C for copy (if applicable)
        if (event.ctrlKey && event.key.toLowerCase() === 'c') {
            event.preventDefault();
            // In web version, this could copy strip data
            return true;
        }

        // Handle Ctrl+V for paste (if applicable)
        if (event.ctrlKey && event.key.toLowerCase() === 'v') {
            event.preventDefault();
            // In web version, this could paste strip data
            return true;
        }

        return false;
    }

    // Handle function keys
    handleFunctionKeys(event) {
        switch (event.key) {
            case 'F1':
                // Help
                event.preventDefault();
                this.showHelp();
                return true;
                
            case 'F2':
                // Settings
                event.preventDefault();
                this.showSettings();
                return true;
                
            case 'F3':
                // Debug
                event.preventDefault();
                this.toggleDebug();
                return true;
                
            case 'F4':
                // About
                event.preventDefault();
                this.showAbout();
                return true;
                
            default:
                return false;
        }
    }

    // Show help
    showHelp() {
        window.open('https://maxrumsey.xyz/OzStrips/reference/keyboardcommands/', '_blank');
    }

    // Show settings
    showSettings() {
        // In web version, this would open settings modal
        console.log("Show settings");
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
        alert(`OzStrips Web Client v${OzStripsConfig.version}\n\nA web-based client for OzStrips electronic flight strips system.\n\nMirrors the original Windows Forms application functionality exactly.`);
    }

    // Cleanup
    dispose() {
        // Remove event listeners if needed
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KeyboardHandler;
} 