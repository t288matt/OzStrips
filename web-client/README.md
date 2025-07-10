# OzStrips Web Client

A web-based client for the OzStrips electronic flight strips system that mirrors the original Windows Forms application functionality exactly.

## Overview

The OzStrips Web Client is designed to provide the same functionality as the original OzStrips Windows Forms application, but accessible through a web browser. This allows controllers to run OzStrips on tablets, phones, or secondary monitors to save screen space on their main vatSys display.

## Features

### ✅ Complete Feature Parity
- **Exact Keyboard Shortcuts**: All original keyboard shortcuts work identically
- **Same Strip Layout**: Identical strip element positioning and styling
- **Real-time Synchronization**: Uses the same SignalR server as the original
- **Bay Management**: Complete bay system with drag-and-drop functionality
- **Strip Actions**: All strip element actions (cock, cross, ready, etc.)
- **Aerodrome Support**: Full aerodrome switching and filtering
- **Debug Panel**: Real-time message logging and debugging

### 🎯 Key Benefits
- **Cross-platform**: Works on any device with a modern web browser
- **Screen Space Efficient**: Dedicate main screen to vatSys radar
- **Touch Friendly**: Optimized for tablet and mobile use
- **No Installation**: Just open in a browser
- **Real-time Updates**: Instant synchronization with vatSys

## Architecture

The web client mirrors the original OzStrips architecture exactly:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   vatSys        │    │  OzStrips       │    │  Web Client     │
│   Plugin        │◄──►│  SignalR        │◄──►│  (Browser)      │
│                 │    │  Server         │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Core Components

1. **Strip System**: XML-based strip element configuration
2. **Bay Manager**: Handles strip organization and movement
3. **Socket Connection**: Real-time communication with server
4. **Keyboard Handler**: Exact key mapping from original
5. **Strip View**: Canvas-based rendering system

## Installation

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for SignalR server
- vatSys with OzStrips plugin running

### Setup
1. Download the web client files
2. Open `index.html` in your browser
3. Enter your aerodrome ICAO code
4. The client will connect to the OzStrips server automatically

## Usage

### Keyboard Shortcuts
All original OzStrips keyboard shortcuts work identically:

| Key | Action |
|-----|--------|
| `Enter` | SID Trigger (advance strip) |
| `Tab` | Cock strip |
| `Space` | Queue up |
| `Backspace` | Inhibit strip |
| `X` | Cross strip |
| `[` / `]` | Change aerodrome |
| `↑` / `↓` | Move strip position |
| `Ctrl+↑` / `Ctrl+↓` | Move between bays |

### Mouse Actions
- **Left Click**: Primary strip element actions
- **Right Click**: Secondary strip element actions
- **Drag & Drop**: Move strips between bays

### Strip Elements
Each strip element has specific actions:
- **ACID**: Pick strip
- **SID**: Trigger SID progression
- **CFL**: Modify cleared flight level
- **RWY**: Modify runway
- **CLX**: Modify clearance
- **READY**: Toggle ready status

## Configuration

### Server Settings
The client connects to the official OzStrips server:
- **Server**: `https://ozstripsserver.maxrumsey.xyz/`
- **Hub**: `OzStripsHub`
- **Protocol**: SignalR

### Aerodrome Support
Default aerodromes included:
- EGLL (London Heathrow)
- EGCC (Manchester)
- EGSS (London Stansted)
- EGBB (Birmingham)
- EGGW (London Luton)

## Development

### Project Structure
```
web-client/
├── index.html              # Main HTML file
├── js/
│   ├── config.js           # Configuration
│   ├── enums.js            # Enums and constants
│   ├── strip-elements.js   # Strip element definitions
│   ├── strip.js            # Strip class
│   ├── strip-controller.js # Strip controller
│   ├── strip-view.js       # Strip rendering
│   ├── bay.js              # Bay class
│   ├── bay-manager.js      # Bay management
│   ├── socket-connection.js # SignalR connection
│   ├── keyboard-handler.js # Keyboard handling
│   └── app.js              # Main application
├── styles/
│   ├── main.css            # Main styles
│   ├── strips.css          # Strip styles
│   ├── bays.css            # Bay styles
│   ├── controls.css        # Control styles
│   └── modals.css          # Modal styles
└── tests/
    └── test-suite.js       # Test suite
```

### Key Design Principles

1. **Exact Functionality**: Every feature matches the original
2. **Elegant Architecture**: Clean, maintainable code structure
3. **No Hardcoding**: Dynamic configuration and data-driven design
4. **Maintainability**: Clear separation of concerns
5. **Supportability**: Comprehensive error handling and logging

### Testing

The web client includes a comprehensive test suite that verifies:
- ✅ Configuration and enums match original
- ✅ Strip elements are correctly positioned
- ✅ All classes function as expected
- ✅ Event handling works properly
- ✅ DOM elements are present
- ✅ Application initializes correctly

Run tests by opening the web client and checking the browser console.

## Browser Compatibility

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 80+ | ✅ Full Support |
| Firefox | 75+ | ✅ Full Support |
| Safari | 13+ | ✅ Full Support |
| Edge | 80+ | ✅ Full Support |

## Troubleshooting

### Connection Issues
- Check internet connection
- Verify vatSys plugin is running
- Ensure aerodrome is set correctly

### Display Issues
- Refresh the page
- Check browser console for errors
- Verify all files are loaded

### Performance Issues
- Close other browser tabs
- Use hardware acceleration
- Consider using a dedicated browser window

## Contributing

The web client is designed to be a faithful recreation of the original OzStrips functionality. When contributing:

1. **Maintain Parity**: Any changes must preserve original behavior
2. **Test Thoroughly**: Run the test suite before submitting
3. **Document Changes**: Update documentation for any modifications
4. **Follow Architecture**: Maintain the existing code structure

## License

This web client is part of the OzStrips project and follows the same licensing terms.

## Support

For support and documentation:
- **Website**: https://maxrumsey.xyz/OzStrips/
- **Documentation**: https://maxrumsey.xyz/OzStrips/reference/
- **FAQ**: https://maxrumsey.xyz/OzStrips/faq/

## Version History

- **v0.5.7**: Initial web client release
  - Complete feature parity with original
  - Real-time SignalR communication
  - Responsive design for mobile/tablet
  - Comprehensive test suite

---

**Note**: This web client is designed to work alongside the original OzStrips Windows Forms application, providing additional flexibility for controllers who want to use tablets or secondary monitors for their strips while keeping their main screen dedicated to vatSys radar displays. 