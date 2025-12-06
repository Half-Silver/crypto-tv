# TradingView-Style Multi-Chart Dashboard

A professional, production-ready multi-chart trading dashboard built with Next.js 15, TradingView Lightweight Charts, and real-time Binance data integration.

![Dashboard Preview](https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/download-1-1765041359444.png?width=1200&height=800&resize=contain)

## 🚀 Features

### Core Functionality
- **Real-time Data Streaming**: Live price updates via Binance WebSocket with automatic reconnection
- **Historical Data**: Fetches up to 500 candlesticks for each symbol and interval
- **Multiple Chart Layouts**: Flexible grid system with 6 layout options (1×1, 1×2, 2×2, 3×2, 3×3, 4×4)
- **Interactive Watchlist**: Browse 50 most traded USDT pairs with live price changes
- **Professional Dark Theme**: Authentic TradingView-style color scheme

### Chart Features
- **Interactive Charts**: Built with TradingView Lightweight Charts library
- **Multiple Timeframes**: 14 intervals from 1 minute to 1 month
- **Volume Display**: Toggleable volume histogram with color-coded bars
- **Chart Selection**: Click any chart to select and configure it

### Technical Indicators
- **SMA (Simple Moving Average)**: Configurable period (default: 20)
- **EMA (Exponential Moving Average)**: Configurable period (default: 9)
- **Volume**: Color-coded histogram showing trading volume

### Sync Modes
- **Symbol Sync**: Change symbol on all charts simultaneously
- **Interval Sync**: Synchronize timeframe across all charts
- **Time Sync**: Align time ranges (ready for implementation)
- **Crosshair Sync**: Link crosshair movements (ready for implementation)

### Persistence
- **LocalStorage**: Automatically saves layout, charts, and settings
- **State Management**: Powered by Zustand with middleware support

## 📁 Project Structure

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

## 🎯 Usage Guide

### Changing Symbols
1. **From Watchlist**: Click any symbol in the left sidebar (chart must be selected first)
2. **Sync Mode**: Enable "Symbol Sync" to change all charts at once

### Changing Timeframes
1. **Select a Chart**: Click on any chart to select it (blue outline appears)
2. **Use Interval Selector**: Choose from 14 available intervals in the toolbar
3. **Sync Mode**: Enable "Interval Sync" to change all charts together

### Adding Indicators
1. **Select a Chart**: Click on the chart you want to configure
2. **Toggle Indicators**: Click SMA, EMA, or Volume buttons in the toolbar
3. **Visual Feedback**: Active indicators show with colored buttons

### Changing Layout
1. **Click Layout Button**: In the top-left toolbar
2. **Select Grid**: Choose from 6 pre-configured layouts
3. **Automatic Resize**: Charts adjust automatically with ResizeObserver

### Sync Modes
Toggle any combination of sync modes in the bottom footer:
- **Symbol**: All charts follow the selected symbol
- **Interval**: All charts use the same timeframe
- **Time**: Synchronized time range navigation
- **Crosshair**: Linked crosshair across all charts

## 🛠️ Technical Stack

- **Framework**: Next.js 15 (App Router)
- **Charts**: TradingView Lightweight Charts 5.0
- **State**: Zustand with localStorage persistence
- **Styling**: Tailwind CSS 4 with custom TradingView theme
- **UI Components**: Shadcn/UI (Radix UI primitives)
- **Icons**: Lucide React
- **Data Source**: Binance Public API (REST + WebSocket)

## 🔧 Configuration

### Customizing Indicators

Edit `src/lib/indicators.ts` to modify indicator calculations:

```typescript
// Change SMA period default
calculateSMA(data, 20) // Default: 20

// Change EMA period default
calculateEMA(data, 9) // Default: 9
```

### Adding More Layouts

Edit `src/lib/store.ts` to add custom grid layouts:

```typescript
const DEFAULT_LAYOUTS: LayoutConfig[] = [
  // Add your custom layout
  { id: '2x3', name: '2×3', rows: 3, cols: 2, cells: 6 },
];
```

### Customizing Theme

Edit `src/app/globals.css` to modify the color scheme:

```css
:root {
  --background: #131722;  /* Main background */
  --foreground: #d1d4dc;  /* Text color */
  --primary: #2962FF;     /* Accent color */
  /* ... more variables */
}
```

## 🌐 API Endpoints Used

### Binance REST API
- **Klines**: `GET /api/v3/klines` - Historical candlestick data
- **24hr Ticker**: `GET /api/v3/ticker/24hr` - Price statistics

### Binance WebSocket
- **Kline Stream**: `wss://stream.binance.com:9443/ws/{symbol}@kline_{interval}` - Real-time updates

## 🚀 Performance Features

- **WebSocket Pooling**: Efficient connection management with automatic cleanup
- **Automatic Reconnection**: Handles disconnections gracefully
- **ResizeObserver**: Smooth chart resizing without manual intervention
- **Optimized Rendering**: TradingView Lightweight Charts for 60fps performance
- **LocalStorage Caching**: Instant state restoration on page load

## 📱 Responsive Design

- **Flexible Grid**: Adapts to any screen size
- **Scrollable Watchlist**: Efficient list virtualization
- **Collapsible Panels**: Easy navigation on smaller screens
- **Touch-Friendly**: Optimized for mobile trading

## 🔐 Data Privacy

- **No Account Required**: Uses public Binance API endpoints
- **Client-Side Only**: All data processing happens in your browser
- **No Backend**: Direct API calls to Binance
- **LocalStorage Only**: Settings stored locally on your device

## 🎨 Features from Reference Images

✅ **Multi-chart grid layout** with dynamic sizing  
✅ **TradingView dark theme** with authentic colors  
✅ **Real-time candlestick charts** with live updates  
✅ **Volume histogram** with color coding  
✅ **Symbol watchlist** with price changes  
✅ **Layout selector modal** with visual previews  
✅ **Toolbar controls** for indicators and settings  
✅ **Sync mode toggles** in footer  
✅ **Technical indicators** (SMA, EMA, Volume)  
✅ **Responsive design** with ResizeObserver  

## 🚦 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Visit `http://localhost:3000` to see the dashboard.

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- **TradingView**: For the Lightweight Charts library
- **Binance**: For providing free public API access
- **Shadcn/UI**: For beautiful UI components
- **Vercel**: For Next.js framework

---

**Built with ❤️ for traders and developers**