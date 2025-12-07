# Features

## Core Functionality

### Real-time Data Streaming
Live price updates via Binance WebSocket with automatic reconnection and intelligent connection pooling.

### Historical Data
Fetches up to 500 candlesticks for each symbol and interval, providing comprehensive historical context for analysis.

### Multiple Chart Layouts
Flexible grid system with 6 layout options:
- 1×1 - Single chart view
- 1×2 - Horizontal split
- 2×2 - Quad view
- 3×2 - Six charts
- 3×3 - Nine charts
- 4×4 - Sixteen charts

### Interactive Watchlist
Browse 50 most traded USDT pairs with:
- Live price updates
- 24-hour price change percentages
- Color-coded change indicators
- Click to load on selected chart

### Professional Dark Theme
Authentic TradingView-style color scheme with carefully crafted UI elements.

## Chart Features

### Interactive Charts
Built with TradingView Lightweight Charts library for smooth 60fps performance.

### Multiple Timeframes
14 intervals available:
- **Minutes**: 1m, 3m, 5m, 15m, 30m
- **Hours**: 1h, 2h, 4h, 6h, 8h, 12h
- **Days**: 1d, 3d
- **Weeks**: 1w
- **Months**: 1M

### Volume Display
Toggleable volume histogram with:
- Color-coded bars (green for up, red for down)
- Separate volume pane below price chart
- Automatic scaling

### Chart Selection
Click any chart to select and configure it independently (blue outline indicates selection).

## Technical Indicators

### SMA (Simple Moving Average)
- Configurable period (default: 20)
- Overlays directly on price chart
- Classic trend-following indicator

### EMA (Exponential Moving Average)
- Configurable period (default: 9)
- More responsive to recent price changes
- Popular for short-term trading

### Volume
- Color-coded histogram
- Shows trading activity
- Helps confirm price movements

## Sync Modes

### Symbol Sync
Change the symbol on one chart, and all charts update to the same symbol simultaneously.

### Interval Sync
Synchronize timeframe across all charts for consistent multi-timeframe analysis.

### Time Sync
Align time ranges across all charts (infrastructure ready, full implementation coming soon).

### Crosshair Sync
Link crosshair movements across charts to compare prices at the same moment (infrastructure ready, full implementation coming soon).

## Persistence

### LocalStorage Integration
Automatically saves and restores:
- Current layout configuration
- All chart states (symbols, intervals, indicators)
- Sync mode preferences
- Selected chart ID

### State Management
Powered by Zustand with middleware support for:
- Automatic localStorage persistence
- Optimized re-renders
- Type-safe state updates
- DevTools integration ready

## Performance Features

### WebSocket Pooling
Efficient connection management that:
- Reuses connections for identical streams
- Automatically cleans up unused connections
- Handles reconnections gracefully
- Prevents connection leaks

### Automatic Reconnection
Robust error handling with:
- Exponential backoff for retries
- Connection health monitoring
- Seamless recovery from network issues

### ResizeObserver Integration
Charts automatically resize when:
- Window is resized
- Layout changes
- Sidebar is toggled
- No manual intervention needed

### Optimized Rendering
- TradingView Lightweight Charts for 60fps performance
- Efficient candlestick rendering
- Minimal re-renders with React optimization
- Hardware-accelerated canvas rendering

### LocalStorage Caching
- Instant state restoration on page load
- No loading spinners for UI state
- Preserves user workspace across sessions
