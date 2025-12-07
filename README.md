# TradingView-Style Multi-Chart Dashboard

A professional, production-ready multi-chart trading dashboard built with Next.js 15, TradingView Lightweight Charts, and real-time Binance data integration.

![Dashboard Preview](https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/download-1-1765041359444.png?width=1200&height=800&resize=contain)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Visit `http://localhost:3000` to see the dashboard.

## 📚 Documentation

This project uses modular documentation for easier navigation:

- **[Features](docs/FEATURES.md)** - Complete feature list and capabilities
- **[Architecture](docs/ARCHITECTURE.md)** - Technical stack and project structure
- **[Usage Guide](docs/USAGE.md)** - How to use the dashboard effectively
- **[Configuration](docs/CONFIGURATION.md)** - Customization and setup options
- **[API Reference](docs/API.md)** - Binance API endpoints and data types
- **[Contributing](docs/CONTRIBUTING.md)** - Development setup and guidelines

## ✨ Key Features

- **Real-time Data Streaming** - Live price updates via Binance WebSocket
- **Multiple Chart Layouts** - 6 flexible grid options (1×1 to 4×4)
- **Technical Indicators** - SMA, EMA, and Volume support
- **Sync Modes** - Symbol, interval, time, and crosshair sync
- **Professional Dark Theme** - Authentic TradingView-style design
- **LocalStorage Persistence** - Auto-save workspace and settings

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Charts**: TradingView Lightweight Charts 5.0
- **State**: Zustand with localStorage persistence
- **Styling**: Tailwind CSS 4 with custom theme
- **UI Components**: Shadcn/UI (Radix UI primitives)
- **Icons**: Lucide React
- **Data Source**: Binance Public API (REST + WebSocket)

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main dashboard page
│   └── globals.css         # TradingView-themed global styles
├── components/
│   ├── TradingChart.tsx    # Individual chart component
│   ├── Toolbar.tsx         # Top toolbar with controls
│   ├── Watchlist.tsx       # Left sidebar with symbols
│   ├── LayoutSelector.tsx  # Modal for selecting layout
│   └── SyncControls.tsx    # Bottom footer with sync toggles
└── lib/
    ├── types.ts            # TypeScript definitions
    ├── store.ts            # Zustand state management
    ├── binance-api.ts      # REST API + WebSocket integration
    └── indicators.ts       # Technical indicator calculations
```

## 🎯 Quick Usage

### Changing Symbols
1. Click any chart to select it (blue outline appears)
2. Click a symbol in the left sidebar watchlist
3. Enable "Symbol Sync" to change all charts at once

### Changing Timeframes
1. Select a chart by clicking on it
2. Choose from 14 intervals in the toolbar (1m to 1M)
3. Enable "Interval Sync" to change all charts together

### Adding Indicators
1. Select a chart
2. Click SMA, EMA, or Volume buttons in the toolbar
3. Toggle off to remove indicators

### Changing Layout
1. Click the layout button in the top-left toolbar
2. Select from 6 pre-configured grid layouts
3. Charts resize automatically

For detailed usage instructions, see the **[Usage Guide](docs/USAGE.md)**.

## 🔐 Data Privacy

- **No Account Required** - Uses public Binance API endpoints
- **Client-Side Only** - All processing happens in your browser
- **No Backend** - Direct API calls to Binance
- **LocalStorage Only** - Settings stored locally on your device

## 🤝 Contributing

Contributions are welcome! Please read our **[Contributing Guide](docs/CONTRIBUTING.md)** for details on:
- Development setup
- Code style guidelines
- Pull request process
- Adding new features

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- **TradingView** - For the Lightweight Charts library
- **Binance** - For providing free public API access
- **Shadcn/UI** - For beautiful UI components
- **Vercel** - For Next.js framework

---

**Built with ❤️ for traders and developers**