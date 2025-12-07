# Usage Guide

## Getting Started

### First Launch
When you first open the dashboard:
1. You'll see a default layout with charts pre-configured
2. The watchlist on the left shows the most traded USDT pairs
3. All data loads automatically from Binance

### Interface Overview
- **Top Toolbar**: Layout, symbol, interval, and indicator controls
- **Left Sidebar**: Watchlist with 50 most traded pairs
- **Center Area**: Chart grid (1 to 16 charts)
- **Bottom Footer**: Sync mode toggles

## Working with Charts

### Selecting a Chart
Click on any chart to select it. The selected chart will show a blue outline. All subsequent actions (changing symbol, interval, indicators) apply to the selected chart.

### Changing Symbols

#### Method 1: From Watchlist
1. Click on any chart to select it
2. Click on a symbol in the left sidebar watchlist
3. The selected chart will update to show that symbol

#### Method 2: From Toolbar
1. Click on any chart to select it
2. Click the symbol dropdown in the toolbar
3. Select a symbol from the list
4. The selected chart will update

#### With Symbol Sync Enabled
When symbol sync is active (toggle in bottom footer):
- Changing the symbol on any chart updates ALL charts
- Useful for comparing different timeframes of the same asset

### Changing Timeframes

#### Basic Usage
1. Click on any chart to select it
2. Click the interval dropdown in the toolbar
3. Select from 14 available intervals (1m to 1M)
4. The selected chart will update

#### Available Intervals
- **1m, 3m, 5m, 15m, 30m**: Short-term scalping
- **1h, 2h, 4h, 6h, 8h, 12h**: Intraday trading
- **1d, 3d**: Daily analysis
- **1w**: Weekly trends
- **1M**: Monthly overview

#### With Interval Sync Enabled
When interval sync is active:
- Changing the interval on any chart updates ALL charts
- Perfect for multi-timeframe analysis of the same symbol

## Working with Indicators

### Adding Indicators
1. Select a chart by clicking on it
2. Click the indicator button in the toolbar (SMA, EMA, or Volume)
3. The indicator will appear on the chart
4. Active indicators show with colored buttons

### Available Indicators

#### SMA (Simple Moving Average)
- Default period: 20
- Shows as a smooth line on the price chart
- Helps identify trend direction
- Color: Blue by default

#### EMA (Exponential Moving Average)
- Default period: 9
- More responsive to recent price changes
- Overlays on the price chart
- Color: Orange by default

#### Volume
- Shows trading volume as a histogram
- Color-coded: Green (price up), Red (price down)
- Appears in a separate pane below the price chart
- Helps confirm price movements

### Removing Indicators
Click the indicator button again to toggle it off. The indicator will be removed from the chart.

## Layouts

### Changing Layout
1. Click the layout button (grid icon) in the top-left toolbar
2. A modal will appear with 6 layout options
3. Click on any layout to apply it
4. Charts automatically adjust to the new grid

### Available Layouts
- **1×1**: Single chart, full screen
- **1×2**: Two charts, horizontal split
- **2×2**: Four charts, quad view
- **3×2**: Six charts, 3 rows × 2 columns
- **3×3**: Nine charts, 3×3 grid
- **4×4**: Sixteen charts, 4×4 grid

### Layout Behavior
- Charts resize automatically when you change layouts
- Existing chart configurations are preserved
- Extra chart slots are filled with default settings
- Minimum chart height maintained for readability

## Sync Modes

Sync modes allow you to coordinate multiple charts. Toggle them in the bottom footer.

### Symbol Sync
**Purpose**: Change all charts to the same symbol simultaneously

**Use Case**: You want to analyze the same asset across multiple timeframes

**How to Use**:
1. Enable "Symbol Sync" toggle in the footer
2. Click on any chart to select it
3. Change the symbol via watchlist or toolbar
4. All charts update to the new symbol

### Interval Sync
**Purpose**: Change all charts to the same timeframe simultaneously

**Use Case**: You want to view multiple assets at the same timeframe

**How to Use**:
1. Enable "Interval Sync" toggle in the footer
2. Click on any chart to select it
3. Change the interval via toolbar dropdown
4. All charts update to the new interval

### Time Sync (Coming Soon)
**Purpose**: Synchronize the visible time range across all charts

**Use Case**: Compare multiple assets at the exact same time period

**Status**: UI toggle present, full implementation in progress

### Crosshair Sync (Coming Soon)
**Purpose**: Link crosshair movements across all charts

**Use Case**: Compare prices at the same moment across different assets

**Status**: UI toggle present, full implementation in progress

## Tips & Tricks

### Efficient Workflow
1. Start with a multi-chart layout (2×2 or 3×3)
2. Enable symbol sync and set all charts to your target asset
3. Disable symbol sync
4. Set each chart to a different timeframe (e.g., 1m, 5m, 1h, 1d)
5. Now you have a multi-timeframe analysis setup

### Quick Symbol Switching
- Keep symbol sync off for normal trading
- Enable symbol sync when you want to quickly scan multiple assets
- The watchlist provides one-click access to 50 top pairs

### Indicator Stacking
- You can enable multiple indicators on the same chart
- SMA and EMA work well together for trend analysis
- Volume + price indicators provide confirmation

### Save Your Workspace
Your layout, chart configurations, and preferences are automatically saved to your browser's localStorage. When you return, everything will be exactly as you left it.

### Performance Tips
- Fewer charts = better performance on slower devices
- Use longer timeframes (1h+) for smoother operation
- Disable unused indicators
- Close unused browser tabs

## Keyboard Shortcuts

Currently, the dashboard uses click-based interactions. Keyboard shortcuts may be added in future updates.

## Troubleshooting

### Charts Not Loading
- Check your internet connection
- Refresh the page (Ctrl+R or Cmd+R)
- Clear browser cache if issues persist

### WebSocket Disconnection
- The app automatically reconnects within seconds
- You'll see "Connecting..." if connection is lost
- No action needed - just wait for reconnection

### Indicators Not Showing
- Make sure the chart is selected (blue outline)
- Click the indicator button in the toolbar
- Ensure the chart has loaded data first

### Slow Performance
- Reduce the number of charts (use smaller layout)
- Use longer timeframes (1h+ instead of 1m)
- Disable unused indicators
- Close other heavy browser tabs
