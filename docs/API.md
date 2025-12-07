# API Reference

## Binance REST API

The application uses Binance's public REST API for historical data and market statistics.

**Base URL**: `https://api.binance.com`

### Endpoints Used

#### 1. Get Candlestick Data (Klines)

**Endpoint**: `GET /api/v3/klines`

**Description**: Fetches historical candlestick data for a specific symbol and timeframe.

**Parameters**:
- `symbol` (string, required): Trading pair symbol (e.g., "BTCUSDT")
- `interval` (string, required): Timeframe interval (e.g., "1m", "1h", "1d")
- `limit` (integer, optional): Number of candles to return (default: 500, max: 1000)

**Response Format**:
```json
[
  [
    1499040000000,      // Open time
    "0.01634790",       // Open price
    "0.80000000",       // High price
    "0.01575800",       // Low price
    "0.01577100",       // Close price
    "148976.11427815",  // Volume
    1499644799999,      // Close time
    "2434.19055334",    // Quote asset volume
    308,                // Number of trades
    "1756.87402397",    // Taker buy base asset volume
    "28.46694368",      // Taker buy quote asset volume
    "17928899.62484339" // Ignore
  ]
]
```

**Usage in App**:
```typescript
import { fetchKlines } from '@/lib/binance-api';

const klines = await fetchKlines('BTCUSDT', '1h');
```

#### 2. Get 24hr Ticker Price Change Statistics

**Endpoint**: `GET /api/v3/ticker/24hr`

**Description**: Fetches 24-hour price change statistics for all symbols or a specific symbol.

**Parameters**:
- None required for all symbols
- `symbol` (string, optional): Get data for specific symbol

**Response Format** (partial):
```json
[
  {
    "symbol": "BTCUSDT",
    "priceChange": "-94.99999800",
    "priceChangePercent": "-95.960",
    "weightedAvgPrice": "0.29628482",
    "prevClosePrice": "0.10002000",
    "lastPrice": "4.00000200",
    "lastQty": "200.00000000",
    "bidPrice": "4.00000000",
    "bidQty": "100.00000000",
    "askPrice": "4.00000200",
    "askQty": "100.00000000",
    "openPrice": "99.00000000",
    "highPrice": "100.00000000",
    "lowPrice": "0.10000000",
    "volume": "8913.30000000",
    "quoteVolume": "15.30000000",
    "openTime": 1499783499040,
    "closeTime": 1499869899040,
    "firstId": 28385,
    "lastId": 28460,
    "count": 76
  }
]
```

**Usage in App**:
```typescript
import { fetch24hrTicker } from '@/lib/binance-api';

const tickers = await fetch24hrTicker();
const topPairs = tickers
  .filter(t => t.symbol.endsWith('USDT'))
  .slice(0, 50);
```

## Binance WebSocket API

The application uses Binance's WebSocket streams for real-time price updates.

**Base URL**: `wss://stream.binance.com:9443/ws`

### Streams Used

#### Kline/Candlestick Streams

**Stream Name**: `<symbol>@kline_<interval>`

**Example**: `btcusdt@kline_1m`

**Description**: Real-time candlestick data updates for a specific symbol and interval.

**Message Format**:
```json
{
  "e": "kline",
  "E": 123456789,
  "s": "BTCUSDT",
  "k": {
    "t": 123400000,    // Kline start time
    "T": 123460000,    // Kline close time
    "s": "BTCUSDT",    // Symbol
    "i": "1m",         // Interval
    "f": 100,          // First trade ID
    "L": 200,          // Last trade ID
    "o": "0.0010",     // Open price
    "c": "0.0020",     // Close price
    "h": "0.0025",     // High price
    "l": "0.0015",     // Low price
    "v": "1000",       // Base asset volume
    "n": 100,          // Number of trades
    "x": false,        // Is this kline closed?
    "q": "1.0000",     // Quote asset volume
    "V": "500",        // Taker buy base asset volume
    "Q": "0.500",      // Taker buy quote asset volume
    "B": "123456"      // Ignore
  }
}
```

**Usage in App**:
```typescript
import { subscribeToKline, unsubscribeFromKline } from '@/lib/binance-api';

// Subscribe
subscribeToKline('BTCUSDT', '1h', (kline) => {
  console.log('New candle:', kline);
  // Update chart with new data
});

// Unsubscribe
unsubscribeFromKline('BTCUSDT', '1h');
```

## Internal API Functions

### binance-api.ts

#### fetchKlines()

```typescript
async function fetchKlines(
  symbol: string,
  interval: string
): Promise<Kline[]>
```

**Description**: Fetches historical candlestick data from Binance REST API.

**Parameters**:
- `symbol`: Trading pair (e.g., "BTCUSDT")
- `interval`: Timeframe (e.g., "1m", "5m", "1h", "1d")

**Returns**: Array of Kline objects with formatted data.

**Example**:
```typescript
const candles = await fetchKlines('ETHUSDT', '15m');
```

#### fetch24hrTicker()

```typescript
async function fetch24hrTicker(): Promise<TickerData[]>
```

**Description**: Fetches 24-hour ticker data for all symbols.

**Returns**: Array of ticker statistics.

**Example**:
```typescript
const tickers = await fetch24hrTicker();
const btcData = tickers.find(t => t.symbol === 'BTCUSDT');
```

#### subscribeToKline()

```typescript
function subscribeToKline(
  symbol: string,
  interval: string,
  callback: (kline: Kline) => void
): void
```

**Description**: Subscribes to real-time kline updates via WebSocket with connection pooling.

**Parameters**:
- `symbol`: Trading pair
- `interval`: Timeframe
- `callback`: Function called on each update

**Example**:
```typescript
subscribeToKline('BTCUSDT', '1m', (kline) => {
  chart.update(kline);
});
```

#### unsubscribeFromKline()

```typescript
function unsubscribeFromKline(
  symbol: string,
  interval: string
): void
```

**Description**: Unsubscribes from kline updates and cleans up WebSocket connection if no longer needed.

**Parameters**:
- `symbol`: Trading pair
- `interval`: Timeframe

**Example**:
```typescript
unsubscribeFromKline('BTCUSDT', '1m');
```

### indicators.ts

#### calculateSMA()

```typescript
function calculateSMA(
  data: number[],
  period: number = 20
): (number | null)[]
```

**Description**: Calculates Simple Moving Average.

**Parameters**:
- `data`: Array of closing prices
- `period`: Number of periods (default: 20)

**Returns**: Array of SMA values (nulls for insufficient data).

#### calculateEMA()

```typescript
function calculateEMA(
  data: number[],
  period: number = 9
): (number | null)[]
```

**Description**: Calculates Exponential Moving Average.

**Parameters**:
- `data`: Array of closing prices
- `period`: Number of periods (default: 9)

**Returns**: Array of EMA values (nulls for insufficient data).

## Data Types

### Kline

```typescript
interface Kline {
  time: number;      // Unix timestamp in seconds
  open: number;      // Open price
  high: number;      // High price
  low: number;       // Low price
  close: number;     // Close price
  volume: number;    // Trading volume
}
```

### TickerData

```typescript
interface TickerData {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  lastPrice: string;
  volume: string;
  quoteVolume: string;
}
```

### ChartState

```typescript
interface ChartState {
  id: string;
  symbol: string;
  interval: string;
  showSMA?: boolean;
  showEMA?: boolean;
  showVolume?: boolean;
}
```

### LayoutConfig

```typescript
interface LayoutConfig {
  id: string;
  name: string;
  rows: number;
  cols: number;
  cells: number;
}
```

## Rate Limits

### Binance API Rate Limits

**REST API**:
- Weight limit: 1200 requests per minute
- Order limit: 10 orders per second
- Klines endpoint weight: 1 per request

**WebSocket**:
- Maximum 10 connections per IP
- Maximum 1024 streams per connection
- No message rate limit

### App Implementation

The app respects rate limits through:
- WebSocket connection pooling (reuses connections)
- Efficient data fetching (only on symbol/interval change)
- No polling (uses WebSocket for updates)
- Automatic reconnection with exponential backoff

## Error Handling

### REST API Errors

```typescript
try {
  const klines = await fetchKlines('BTCUSDT', '1h');
} catch (error) {
  console.error('Failed to fetch klines:', error);
  // Handle error (show notification, use cached data, etc.)
}
```

### WebSocket Errors

```typescript
ws.on('error', (error) => {
  console.error('WebSocket error:', error);
  // Automatic reconnection will be attempted
});

ws.on('close', () => {
  console.log('WebSocket closed, reconnecting...');
  // Reconnection logic handled internally
});
```

## Testing

### Testing REST Endpoints

```bash
# Get klines
curl "https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1h&limit=10"

# Get 24hr ticker
curl "https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT"
```

### Testing WebSocket

```javascript
const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@kline_1m');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Kline update:', data);
};
```

## Security Considerations

### API Keys

The app uses **public endpoints only** and does not require API keys. No trading or account access functionality is implemented.

### CORS

Binance API allows CORS requests from browsers. No proxy server is required.

### Data Privacy

All data fetching happens client-side in the browser. No user data or API requests are logged on any server.
