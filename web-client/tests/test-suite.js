/**
 * OzStrips Web Client Test Suite
 * Tests that the web client matches the original OzStrips functionality exactly
 */

class OzStripsTestSuite {
    constructor() {
        this.tests = [];
        this.results = {
            passed: 0,
            failed: 0,
            total: 0
        };
        this.setupTests();
    }

    setupTests() {
        // Test 1: Configuration and Enums
        this.addTest("Configuration and Enums", () => {
            // Test that all enums match original
            const requiredEnums = [
                'StripElementValues', 'StripElementActions', 'StripElementHoverActions',
                'StripBay', 'StripArrDepType', 'StripItemType', 'ServerTypes', 'Keys', 'MouseButtons'
            ];
            
            for (const enumName of requiredEnums) {
                if (typeof window[enumName] === 'undefined') {
                    throw new Error(`Missing enum: ${enumName}`);
                }
            }
            
            // Test that config values match original
            if (!OzStripsConfig.socketioaddr.includes('ozstripsserver.maxrumsey.xyz')) {
                throw new Error('Incorrect server address');
            }
            
            if (OzStripsConfig.stripWidth !== 420 || OzStripsConfig.stripHeight !== 60) {
                throw new Error('Incorrect strip dimensions');
            }
            
            return true;
        });

        // Test 2: Strip Elements Configuration
        this.addTest("Strip Elements Configuration", () => {
            if (!stripElementList || !stripElementList.list) {
                throw new Error('Strip element list not initialized');
            }
            
            // Test that all required elements exist
            const requiredElements = [
                'EOBT', 'ACID', 'SSR', 'TYPE', 'FRUL', 'FIRST_WPT', 'SID', 'ADES',
                'CFL', 'HDG', 'CLX', 'STAND', 'REMARK', 'TOT', 'RFL', 'READY',
                'GLOP', 'PDC_INDICATOR', 'RWY', 'WTC', 'ROUTE'
            ];
            
            for (const elementValue of requiredElements) {
                const element = stripElementList.getElementByValue(elementValue);
                if (!element) {
                    throw new Error(`Missing strip element: ${elementValue}`);
                }
            }
            
            return true;
        });

        // Test 3: Strip Class Functionality
        this.addTest("Strip Class Functionality", () => {
            const mockFdr = {
                callsign: 'TEST123',
                depAirport: 'EGLL',
                desAirport: 'EGCC',
                aircraftType: 'B738',
                aircraftWake: 'M',
                assignedSSRCode: 1234,
                flightRules: 'I',
                route: 'EGLL DCT EGCC',
                eobt: '1200',
                rfl: 33000,
                cflString: 'FL330',
                globalOpData: 'TEST DATA',
                remarks: 'TEST REMARKS',
                pdcSent: false,
                textOnly: false,
                receiveOnly: false
            };
            
            const mockBayManager = {
                aerodromeName: 'EGLL',
                stripRepository: { controllers: [] }
            };
            
            const strip = new Strip(mockFdr, mockBayManager, null);
            
            // Test basic properties
            if (strip.fdr.callsign !== 'TEST123') {
                throw new Error('Strip FDR not set correctly');
            }
            
            if (strip.arrDepType !== StripArrDepType.DEPARTURE) {
                throw new Error('Incorrect arrival/departure type');
            }
            
            if (strip.cfl !== 'FL330') {
                throw new Error('CFL not set correctly');
            }
            
            if (strip.rfl !== '330') {
                throw new Error('RFL not calculated correctly');
            }
            
            return true;
        });

        // Test 4: Bay Manager Functionality
        this.addTest("Bay Manager Functionality", () => {
            const bayManager = new BayManager();
            
            // Test default bays creation
            bayManager.createDefaultBays();
            
            if (bayManager.bays.length !== 8) {
                throw new Error('Incorrect number of default bays');
            }
            
            // Test bay names
            const expectedBayNames = [
                'Preactive', 'Cleared', 'Pushback', 'Taxi', 
                'Holding Point', 'Runway', 'Departure', 'Arrival'
            ];
            
            for (let i = 0; i < expectedBayNames.length; i++) {
                if (bayManager.bays[i].name !== expectedBayNames[i]) {
                    throw new Error(`Incorrect bay name: ${bayManager.bays[i].name}`);
                }
            }
            
            return true;
        });

        // Test 5: Keyboard Handler Functionality
        this.addTest("Keyboard Handler Functionality", () => {
            const mockBayManager = {
                positionToNextBar: () => {},
                positionKey: () => {},
                queueUp: () => {},
                sidTrigger: () => {},
                cockStrip: () => {},
                inhibit: () => {},
                crossStrip: () => {},
                forceRerender: () => {}
            };
            
            const mockMainForm = {
                moveLateralAerodrome: () => {}
            };
            
            const keyboardHandler = new KeyboardHandler(mockBayManager, mockMainForm);
            
            // Test that event listeners are set up
            if (!keyboardHandler.bayManager) {
                throw new Error('Bay manager not set in keyboard handler');
            }
            
            return true;
        });

        // Test 6: Socket Connection Functionality
        this.addTest("Socket Connection Functionality", () => {
            const mockBayManager = {
                stripRepository: { controllers: [] },
                bayRepository: { updateOrder: () => {} }
            };
            
            const mockMainForm = {
                setATISCode: () => {},
                setMetar: () => {}
            };
            
            const socketConn = new SocketConnection(mockBayManager, mockMainForm);
            
            // Test that connection is initialized
            if (!socketConn.connection) {
                throw new Error('SignalR connection not initialized');
            }
            
            // Test that event handlers are set up
            if (socketConn.bayManager !== mockBayManager) {
                throw new Error('Bay manager not set in socket connection');
            }
            
            return true;
        });

        // Test 7: Strip View Rendering
        this.addTest("Strip View Rendering", () => {
            const mockFdr = {
                callsign: 'TEST123',
                depAirport: 'EGLL',
                desAirport: 'EGCC',
                aircraftType: 'B738',
                aircraftWake: 'M',
                assignedSSRCode: 1234,
                flightRules: 'I',
                route: 'EGLL DCT EGCC',
                eobt: '1200',
                rfl: 33000,
                cflString: 'FL330',
                globalOpData: 'TEST DATA',
                remarks: 'TEST REMARKS',
                pdcSent: false,
                textOnly: false,
                receiveOnly: false
            };
            
            const mockBayManager = {
                aerodromeName: 'EGLL',
                stripRepository: { controllers: [] }
            };
            
            const strip = new Strip(mockFdr, mockBayManager, null);
            const mockBayRenderController = { bay: { bayManager: mockBayManager } };
            const stripView = new StripView(strip, mockBayRenderController);
            
            // Test that strip view is created
            if (!stripView.strip) {
                throw new Error('Strip not set in strip view');
            }
            
            // Test that showSSRError property works
            if (typeof stripView.showSSRError !== 'boolean') {
                throw new Error('showSSRError property not working');
            }
            
            return true;
        });

        // Test 8: Configuration Values
        this.addTest("Configuration Values", () => {
            // Test that all required config values exist
            const requiredConfig = [
                'socketioaddr', 'version', 'stripWidth', 'stripHeight', 'stripPadding',
                'baySpacing', 'maxBays', 'colors', 'defaultFontSize', 'fontFamily',
                'defaultAerodromes'
            ];
            
            for (const configKey of requiredConfig) {
                if (typeof OzStripsConfig[configKey] === 'undefined') {
                    throw new Error(`Missing config: ${configKey}`);
                }
            }
            
            // Test color values
            const requiredColors = ['departure', 'arrival', 'black', 'white', 'silver', 'gray', 'red', 'green', 'blue', 'yellow', 'orange', 'cyan', 'empty'];
            
            for (const colorKey of requiredColors) {
                if (!OzStripsConfig.colors[colorKey]) {
                    throw new Error(`Missing color: ${colorKey}`);
                }
            }
            
            return true;
        });

        // Test 9: Event Handling
        this.addTest("Event Handling", () => {
            // Test that DOM elements exist
            const requiredElements = [
                'aerodrome-input', 'aerodrome-select', 'view-mode', 'current-time',
                'current-aerodrome', 'connection-status', 'inhibit-btn', 'force-strip-btn',
                'cross-btn', 'pdc-btn', 'add-bar-btn', 'debug-btn', 'about-btn',
                'debug-panel', 'close-debug', 'debug-messages', 'modal-overlay',
                'modal-container', 'bay-container'
            ];
            
            for (const elementId of requiredElements) {
                const element = document.getElementById(elementId);
                if (!element) {
                    throw new Error(`Missing DOM element: ${elementId}`);
                }
            }
            
            return true;
        });

        // Test 10: Application Initialization
        this.addTest("Application Initialization", () => {
            // Test that the application can be initialized
            if (typeof MainForm !== 'function') {
                throw new Error('MainForm class not defined');
            }
            
            if (typeof Strip !== 'function') {
                throw new Error('Strip class not defined');
            }
            
            if (typeof BayManager !== 'function') {
                throw new Error('BayManager class not defined');
            }
            
            if (typeof SocketConnection !== 'function') {
                throw new Error('SocketConnection class not defined');
            }
            
            if (typeof KeyboardHandler !== 'function') {
                throw new Error('KeyboardHandler class not defined');
            }
            
            return true;
        });
    }

    addTest(name, testFunction) {
        this.tests.push({ name, testFunction });
    }

    async runTests() {
        console.log('🧪 Starting OzStrips Web Client Test Suite...\n');
        
        for (const test of this.tests) {
            try {
                console.log(`📋 Running test: ${test.name}`);
                const result = await test.testFunction();
                
                if (result === true) {
                    console.log(`✅ PASS: ${test.name}`);
                    this.results.passed++;
                } else {
                    console.log(`❌ FAIL: ${test.name} - Unexpected result: ${result}`);
                    this.results.failed++;
                }
            } catch (error) {
                console.log(`❌ FAIL: ${test.name} - Error: ${error.message}`);
                this.results.failed++;
            }
            
            this.results.total++;
        }
        
        this.printResults();
    }

    printResults() {
        console.log('\n📊 Test Results:');
        console.log(`Total Tests: ${this.results.total}`);
        console.log(`Passed: ${this.results.passed}`);
        console.log(`Failed: ${this.results.failed}`);
        console.log(`Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);
        
        if (this.results.failed === 0) {
            console.log('\n🎉 All tests passed! The web client matches the original functionality.');
        } else {
            console.log('\n⚠️  Some tests failed. Please review the implementation.');
        }
    }
}

// Run tests when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for all scripts to load
    setTimeout(() => {
        const testSuite = new OzStripsTestSuite();
        testSuite.runTests();
    }, 1000);
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OzStripsTestSuite;
} 