# Architecture

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main dashboard page
│   └── globals.css         # TradingView-themed global styles
├── components/
│   ├── TradingChart.tsx    # Individual chart component with indicators
│   ├── Toolbar.tsx         # Top toolbar with controls
│   ├── Watchlist.tsx       # Left sidebar with symbols
│   ├── LayoutSelector.tsx  # Modal for selecting grid layout
│   └── SyncControls.tsx    # Bottom footer with sync toggles
└── lib/
    ├── types.ts            # TypeScript type definitions
    ├── store.ts            # Zustand state management
    ├── binance-api.ts      # REST API + WebSocket integration
    └── indicators.ts       # Technical indicator calculations
```

## Technical Stack

### Framework
- **Next.js 15**: React framework with App Router for modern web apps
- **React 18**: Latest React with concurrent features

### Charts & Data
- **TradingView Lightweight Charts 5.0**: Professional charting library
- **Binance API**: Real-time and historical cryptocurrency data

### State Management
- **Zustand**: Lightweight state management with middleware
- **localStorage**: Automatic persistence of user preferences

### Styling & UI
- **Tailwind CSS 4**: Utility-first CSS framework
- **Shadcn/UI**: Radix UI primitives with accessible components
- **Lucide React**: Beautiful, consistent icons

### TypeScript
Fully typed codebase for better developer experience and fewer runtime errors.

## Component Architecture

### TradingChart.tsx
Main chart component that:
- Renders TradingView Lightweight Charts
- Manages chart lifecycle (mount, update, cleanup)
- Handles indicator overlays (SMA, EMA, Volume)
- Subscribes to WebSocket updates
- Responds to user interactions

### Toolbar.tsx
Top navigation bar containing:
- Layout selector button
- Symbol and interval dropdowns
- Indicator toggles (SMA, EMA, Volume)
- Compact, space-efficient design

### Watchlist.tsx
Left sidebar panel featuring:
- List of 50 most traded USDT pairs
- Real-time price and 24h change
- Symbol selection on click
- Scrollable with custom styling

### LayoutSelector.tsx
Modal dialog for choosing chart layouts:
- Visual grid previews
- 6 pre-configured layouts
- Instant layout switching
- Responsive modal design

### SyncControls.tsx
Bottom footer with sync mode toggles:
- Symbol sync toggle
- Interval sync toggle
- Time sync toggle (UI ready)
- Crosshair sync toggle (UI ready)

## State Management

### Zustand Store (store.ts)
Central state container managing:

**Chart State**
- Array of chart configurations
- Current symbol and interval per chart
- Active indicators per chart
- Chart selection state

**Layout State**
- Current grid layout (rows, cols, cells)
- Available layout configurations

**Sync State**
- Symbol sync enabled/disabled
- Interval sync enabled/disabled
- Time sync enabled/disabled
- Crosshair sync enabled/disabled

**Actions**
- addChart, removeChart, selectChart
- updateChartSymbol, updateChartInterval
- toggleIndicator
- changeLayout
- toggleSync modes

### Persistence Middleware
Automatically saves state to localStorage on every change, enabling seamless workspace restoration.

## Data Flow

### Historical Data Flow
1. User selects symbol and interval
2. TradingChart component requests data via `fetchKlines()`
3. Binance REST API returns up to 500 candlesticks
4. Data is formatted and rendered on chart
5. Initial data loading complete

### Real-time Data Flow
1. TradingChart subscribes to WebSocket stream
2. `subscribeToKline()` manages connection pooling
3. Binance sends kline updates via WebSocket
4. Callback updates chart in real-time
5. On unmount, `unsubscribeFromKline()` cleans up

### Sync Data Flow
1. User toggles sync mode in SyncControls
2. Store updates sync state
3. Components react to sync state changes
4. Symbol/interval changes propagate across charts
5. All synced charts update simultaneously

## API Integration

### REST API (binance-api.ts)
```typescript
// Fetch historical candlestick data
fetchKlines(symbol: string, interval: string): Promise<Kline[]>

// Get 24-hour ticker statistics
fetch24hrTicker(): Promise<TickerData[]>
```

### WebSocket API (binance-api.ts)
```typescript
// Subscribe to real-time kline updates
subscribeToKline(
  symbol: string, 
  interval: string, 
  callback: (kline: Kline) => void
): void

// Clean up WebSocket connection
unsubscribeFromKline(symbol: string, interval: string): void
```

### Connection Pooling
WebSocket connections are pooled by stream name to:
- Avoid duplicate connections
- Reduce server load
- Improve performance
- Manage resources efficiently

## Performance Optimizations

### React Optimizations
- `useMemo` for expensive calculations
- `useCallback` for stable function references
- Conditional rendering to minimize updates
- Proper key usage in lists

### Chart Optimizations
- Hardware-accelerated canvas rendering
- Efficient data updates (only new candles)
- Automatic chart resizing with ResizeObserver
- Lazy indicator calculations

### Network Optimizations
- WebSocket connection pooling
- Automatic reconnection with backoff
- REST API batching where possible
- Efficient data serialization

## Error Handling

### Network Errors
- Automatic WebSocket reconnection
- REST API retry logic
- User-friendly error messages
- Graceful degradation

### Data Errors
- Validation of API responses
- Fallback to cached data when available
- Type-safe data parsing
- Console warnings for debugging
