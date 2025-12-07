# Configuration Guide

## Customizing Indicators

### Changing SMA Period

Edit `src/lib/indicators.ts`:

```typescript
export const calculateSMA = (data: number[], period: number = 20): (number | null)[] => {
  // Change the default period from 20 to your preferred value
  // Example: period: number = 50 for a 50-period SMA
  // ...
};
```

**In TradingChart.tsx**, update the SMA calculation call:

```typescript
const smaData = calculateSMA(closePrices, 50); // Changed from default 20 to 50
```

### Changing EMA Period

Edit `src/lib/indicators.ts`:

```typescript
export const calculateEMA = (data: number[], period: number = 9): (number | null)[] => {
  // Change the default period from 9 to your preferred value
  // Example: period: number = 21 for a 21-period EMA
  // ...
};
```

**In TradingChart.tsx**, update the EMA calculation call:

```typescript
const emaData = calculateEMA(closePrices, 21); // Changed from default 9 to 21
```

### Adding New Indicators

1. **Add calculation function** in `src/lib/indicators.ts`:

```typescript
export const calculateRSI = (data: number[], period: number = 14): (number | null)[] => {
  // Implement RSI calculation logic
  // Return array of RSI values
};
```

2. **Add indicator state** to Zustand store in `src/lib/store.ts`:

```typescript
export interface ChartState {
  // ... existing fields
  showRSI?: boolean; // Add new indicator flag
}
```

3. **Add toggle action** in store:

```typescript
toggleIndicator: (chartId: string, indicator: 'sma' | 'ema' | 'volume' | 'rsi') => {
  // ... existing logic
  if (indicator === 'rsi') {
    chart.showRSI = !chart.showRSI;
  }
}
```

4. **Render indicator** in `TradingChart.tsx`:

```typescript
// In the useEffect where indicators are rendered
if (chartState.showRSI) {
  const rsiData = calculateRSI(closePrices, 14);
  // Add RSI line series to chart
}
```

5. **Add toolbar button** in `Toolbar.tsx`:

```typescript
<Button
  variant={selectedChart?.showRSI ? 'default' : 'ghost'}
  size="sm"
  onClick={() => toggleIndicator(selectedChart.id, 'rsi')}
>
  RSI
</Button>
```

## Customizing Layouts

### Adding Custom Grid Layouts

Edit `src/lib/store.ts`:

```typescript
const DEFAULT_LAYOUTS: LayoutConfig[] = [
  { id: '1x1', name: '1×1', rows: 1, cols: 1, cells: 1 },
  { id: '1x2', name: '1×2', rows: 1, cols: 2, cells: 2 },
  { id: '2x2', name: '2×2', rows: 2, cols: 2, cells: 4 },
  { id: '3x2', name: '3×2', rows: 3, cols: 2, cells: 6 },
  { id: '3x3', name: '3×3', rows: 3, cols: 3, cells: 9 },
  { id: '4x4', name: '4×4', rows: 4, cols: 4, cells: 16 },
  
  // Add your custom layouts here
  { id: '2x3', name: '2×3', rows: 2, cols: 3, cells: 6 },
  { id: '1x3', name: '1×3', rows: 1, cols: 3, cells: 3 },
  { id: '4x2', name: '4×2', rows: 4, cols: 2, cells: 8 },
];
```

### Changing Default Layout

In `src/lib/store.ts`:

```typescript
const initialState: DashboardState = {
  // ...
  layout: DEFAULT_LAYOUTS[2], // Change index to select different default
  // 0 = 1×1, 1 = 1×2, 2 = 2×2, etc.
};
```

### Customizing Chart Minimum Height

In `src/app/page.tsx`:

```typescript
<div
  className="w-full h-full gap-2"
  style={{
    display: 'grid',
    gridTemplateRows: `repeat(${layout.rows}, 1fr)`,
    gridTemplateColumns: `repeat(${layout.cols}, 1fr)`,
    minHeight: `${layout.rows * 400}px`, // Change 400 to your preferred minimum height
  }}
>
```

## Customizing Theme

### Main Colors

Edit `src/app/globals.css`:

```css
:root {
  /* Background colors */
  --background: #131722;  /* Main app background */
  --card: #1e222d;        /* Chart container background */
  
  /* Text colors */
  --foreground: #d1d4dc;  /* Main text */
  --muted-foreground: #787b86; /* Secondary text */
  
  /* Accent colors */
  --primary: #2962FF;     /* Primary accent (selected items, buttons) */
  --primary-foreground: #ffffff; /* Text on primary buttons */
  
  /* Interactive elements */
  --secondary: #2a2e39;   /* Secondary buttons */
  --accent: #2a2e39;      /* Accent backgrounds */
  
  /* Borders and inputs */
  --border: #2b2b43;      /* Border color */
  --input: #2b2b43;       /* Input border */
  
  /* Status colors */
  --destructive: #ef5350; /* Error/delete actions */
  
  /* Border radius */
  --radius: 0.5rem;       /* Default border radius */
}
```

### Chart Colors

Edit `src/components/TradingChart.tsx`:

```typescript
chart.applyOptions({
  layout: {
    background: { color: '#1e222d' }, // Chart background
    textColor: '#d1d4dc',             // Text color
  },
  grid: {
    vertLines: { color: '#2b2b43' },  // Vertical grid lines
    horzLines: { color: '#2b2b43' },  // Horizontal grid lines
  },
  // ... more options
});
```

### Candlestick Colors

In `TradingChart.tsx`:

```typescript
const candlestickSeries = chart.addCandlestickSeries({
  upColor: '#26a69a',        // Bullish candle color
  downColor: '#ef5350',      // Bearish candle color
  borderUpColor: '#26a69a',  // Bullish border
  borderDownColor: '#ef5350',// Bearish border
  wickUpColor: '#26a69a',    // Bullish wick
  wickDownColor: '#ef5350',  // Bearish wick
});
```

### Indicator Colors

In `TradingChart.tsx`:

```typescript
// SMA Line Color
const smaLine = chart.addLineSeries({
  color: '#2962FF',     // Change to your preferred color
  lineWidth: 2,
  // ...
});

// EMA Line Color
const emaLine = chart.addLineSeries({
  color: '#FF6D00',     // Change to your preferred color
  lineWidth: 2,
  // ...
});
```

### Volume Colors

In `TradingChart.tsx`:

```typescript
const volumeData = formattedData.map((d: any) => ({
  time: d.time,
  value: d.volume,
  color: d.close >= d.open ? '#26a69a' : '#ef5350', // Green : Red
}));
```

## Customizing Data Source

### Adding Different Exchanges

The app currently uses Binance. To add other exchanges:

1. **Create new API file** (e.g., `src/lib/coinbase-api.ts`)
2. **Implement same interface** as `binance-api.ts`:
   - `fetchKlines()`
   - `fetch24hrTicker()`
   - `subscribeToKline()`
   - `unsubscribeFromKline()`
3. **Update imports** in components to use new API
4. **Adjust data format** to match TradingView Lightweight Charts format

### Changing Data Limits

In `src/lib/binance-api.ts`:

```typescript
export const fetchKlines = async (
  symbol: string,
  interval: string
): Promise<Kline[]> => {
  const response = await fetch(
    `${BASE_URL}/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=500`
    // Change limit from 500 to your preferred value (max 1000 for Binance)
  );
  // ...
};
```

### Changing Watchlist Symbols

In `src/components/Watchlist.tsx`:

```typescript
// Modify the fetch24hrTicker() filter logic
const topSymbols = tickers
  .filter(t => t.symbol.endsWith('USDT')) // Change to 'BTC', 'ETH', etc.
  .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
  .slice(0, 50); // Change number of symbols shown
```

## Advanced Customization

### Adding Authentication

To restrict access:

1. Install auth library (NextAuth.js, Clerk, etc.)
2. Wrap `src/app/page.tsx` with authentication provider
3. Add login page at `src/app/login/page.tsx`
4. Redirect unauthenticated users

### Database Integration

To save chart setups across devices:

1. Set up database (Postgres, MongoDB, etc.)
2. Create API routes in `src/app/api/`
3. Replace localStorage with API calls in store middleware
4. Add user accounts and workspace management

### Real-time Collaboration

To enable multiple users to view the same charts:

1. Set up WebSocket server (Socket.io, Pusher, etc.)
2. Broadcast state changes to all connected clients
3. Add user presence indicators
4. Implement conflict resolution for simultaneous edits

## Environment Variables

Create a `.env.local` file for configuration:

```env
# API Configuration
NEXT_PUBLIC_BINANCE_API_URL=https://api.binance.com
NEXT_PUBLIC_BINANCE_WS_URL=wss://stream.binance.com:9443

# Feature Flags
NEXT_PUBLIC_ENABLE_TIME_SYNC=false
NEXT_PUBLIC_ENABLE_CROSSHAIR_SYNC=false

# Limits
NEXT_PUBLIC_MAX_CHARTS=16
NEXT_PUBLIC_MAX_KLINES=500
```

Use in code:

```typescript
const MAX_CHARTS = parseInt(process.env.NEXT_PUBLIC_MAX_CHARTS || '16');
```

## Performance Tuning

### Adjust Update Frequency

In `src/lib/binance-api.ts`, add throttling to WebSocket callbacks:

```typescript
let lastUpdate = 0;
const THROTTLE_MS = 100; // Update every 100ms max

ws.on('message', (data) => {
  const now = Date.now();
  if (now - lastUpdate < THROTTLE_MS) return;
  lastUpdate = now;
  
  // Process update
  callback(kline);
});
```

### Reduce Memory Usage

Limit historical data kept in memory:

```typescript
const MAX_CANDLES_IN_MEMORY = 500;

// In chart update logic
if (candleData.length > MAX_CANDLES_IN_MEMORY) {
  candleData = candleData.slice(-MAX_CANDLES_IN_MEMORY);
}
```
