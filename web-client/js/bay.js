/**
 * OzStrips Web Client Bay Class
 * Mirrors the original OzStrips Bay.cs functionality exactly
 */

class Bay {
    constructor(bayTypes, bayManager, socketConn, name, index) {
        this.bayTypes = bayTypes;
        this.bayManager = bayManager;
        this.socketConn = socketConn;
        this.name = name;
        this.index = index;
        this.strips = [];
        this.bars = [];
        this.element = null;
        this.canvas = null;
        this.ctx = null;
        
        this.createBayElement();
        this.resizeBay();
    }

    // Create bay DOM element
    createBayElement() {
        this.element = document.createElement('div');
        this.element.className = 'bay';
        this.element.dataset.name = this.name;
        this.element.dataset.index = this.index;
        
        // Create canvas for rendering
        this.canvas = document.createElement('canvas');
        this.canvas.width = OzStripsConfig.stripWidth;
        this.canvas.height = 200; // Initial height, will be adjusted
        this.canvas.className = 'bay-canvas';
        this.element.appendChild(this.canvas);
        
        this.ctx = this.canvas.getContext('2d');
        
        // Add event listeners
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.handleRightClick(e);
        });
        this.canvas.addEventListener('mousemove', (e) => this.handleHover(e));
        
        // Add to bay container
        const bayContainer = document.getElementById('bay-container');
        if (bayContainer) {
            bayContainer.appendChild(this.element);
        }
    }

    // Add strip to bay
    addStrip(strip) {
        if (!this.strips.includes(strip)) {
            this.strips.push(strip);
            strip.currentBay = this.bayTypes[0];
            this.resizeBay();
        }
    }

    // Remove strip from bay
    removeStrip(strip) {
        const index = this.strips.indexOf(strip);
        if (index > -1) {
            this.strips.splice(index, 1);
            this.resizeBay();
        }
    }

    // Get strip by callsign
    getStrip(callsign) {
        return this.strips.find(strip => strip.fdr.callsign === callsign);
    }

    // Add bar
    addBar(type, text) {
        const bar = {
            type: type,
            text: text,
            id: Date.now() + Math.random()
        };
        this.bars.push(bar);
        this.resizeBay();
    }

    // Remove bar
    removeBar(bar) {
        const index = this.bars.indexOf(bar);
        if (index > -1) {
            this.bars.splice(index, 1);
            this.resizeBay();
        }
    }

    // Queue up
    queueUp() {
        if (this.strips.length > 1) {
            const firstStrip = this.strips[0];
            this.strips.splice(0, 1);
            this.strips.push(firstStrip);
            this.resizeBay();
        }
    }

    // Change strip position
    changeStripPosition(strip, relativePosition) {
        const currentIndex = this.strips.indexOf(strip);
        if (currentIndex === -1) return;

        const newIndex = Math.max(0, Math.min(this.strips.length - 1, currentIndex + relativePosition));
        if (newIndex !== currentIndex) {
            this.strips.splice(currentIndex, 1);
            this.strips.splice(newIndex, 0, strip);
            this.resizeBay();
        }
    }

    // Resize bay
    resizeBay() {
        const stripHeight = OzStripsConfig.stripHeight + OzStripsConfig.baySpacing;
        const totalHeight = (this.strips.length + this.bars.length) * stripHeight;
        
        this.canvas.height = Math.max(200, totalHeight);
        this.render();
    }

    // Render bay
    render() {
        if (!this.ctx) return;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        let yOffset = 0;

        // Render strips
        this.strips.forEach(strip => {
            const stripView = new StripView(strip, this);
            stripView.render(this.canvas, 0, yOffset);
            yOffset += OzStripsConfig.stripHeight + OzStripsConfig.baySpacing;
        });

        // Render bars
        this.bars.forEach(bar => {
            this.renderBar(bar, yOffset);
            yOffset += OzStripsConfig.stripHeight + OzStripsConfig.baySpacing;
        });
    }

    // Render bar
    renderBar(bar, yOffset) {
        // Draw bar background
        this.ctx.fillStyle = this.getBarColor(bar.type);
        this.ctx.fillRect(0, yOffset, this.canvas.width, OzStripsConfig.stripHeight);

        // Draw bar border
        this.ctx.strokeStyle = OzStripsConfig.colors.black;
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(0, yOffset, this.canvas.width, OzStripsConfig.stripHeight);

        // Draw bar text
        this.ctx.fillStyle = OzStripsConfig.colors.black;
        this.ctx.font = `${OzStripsConfig.defaultFontSize}px ${OzStripsConfig.fontFamily}`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(
            bar.text,
            this.canvas.width / 2,
            yOffset + OzStripsConfig.stripHeight / 2
        );
    }

    // Get bar color
    getBarColor(type) {
        switch (type) {
            case 1: return OzStripsConfig.colors.yellow;
            case 2: return OzStripsConfig.colors.orange;
            case 3: return OzStripsConfig.colors.red;
            default: return OzStripsConfig.colors.white;
        }
    }

    // Handle click
    handleClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const y = event.clientY - rect.top;
        
        const stripIndex = this.getStripIndexAtY(y);
        if (stripIndex >= 0 && stripIndex < this.strips.length) {
            const strip = this.strips[stripIndex];
            const stripView = new StripView(strip, this);
            stripView.handleClick(event);
        }
    }

    // Handle right click
    handleRightClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const y = event.clientY - rect.top;
        
        const stripIndex = this.getStripIndexAtY(y);
        if (stripIndex >= 0 && stripIndex < this.strips.length) {
            const strip = this.strips[stripIndex];
            const stripView = new StripView(strip, this);
            stripView.handleClick(event);
        }
    }

    // Handle hover
    handleHover(event) {
        const rect = this.canvas.getBoundingClientRect();
        const y = event.clientY - rect.top;
        
        const stripIndex = this.getStripIndexAtY(y);
        if (stripIndex >= 0 && stripIndex < this.strips.length) {
            const strip = this.strips[stripIndex];
            const stripView = new StripView(strip, this);
            stripView.handleHover(event);
        }
    }

    // Get strip index at Y position
    getStripIndexAtY(y) {
        const stripHeight = OzStripsConfig.stripHeight + OzStripsConfig.baySpacing;
        return Math.floor(y / stripHeight);
    }

    // Get strip at position
    getStripAtPosition(y) {
        const index = this.getStripIndexAtY(y);
        if (index >= 0 && index < this.strips.length) {
            return this.strips[index];
        }
        return null;
    }

    // Delete bar
    deleteBar(bar) {
        this.removeBar(bar);
    }

    // Get list item for strip
    getListItem(strip) {
        return {
            type: StripItemType.STRIP,
            stripController: strip,
            bay: this
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Bay;
} 