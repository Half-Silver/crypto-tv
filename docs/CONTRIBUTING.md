# Contributing Guide

## Development Setup

### Prerequisites
- **Node.js 18+** or **Bun** (recommended)
- **Git** for version control
- Code editor (VS Code recommended)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd trading-dashboard

# Install dependencies
npm install
# or
bun install

# Run development server
npm run dev
# or
bun dev
```

The app will be available at `http://localhost:3000`.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main dashboard
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── TradingChart.tsx   # Chart component
│   ├── Toolbar.tsx        # Top toolbar
│   ├── Watchlist.tsx      # Symbol list
│   ├── LayoutSelector.tsx # Layout modal
│   └── SyncControls.tsx   # Sync toggles
└── lib/                   # Utilities and logic
    ├── types.ts          # TypeScript definitions
    ├── store.ts          # State management
    ├── binance-api.ts    # API integration
    └── indicators.ts     # Technical indicators
```

## Development Workflow

### 1. Pick an Issue
- Check the issue tracker for open tasks
- Comment on the issue to claim it
- Discuss approach before starting major changes

### 2. Create a Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 3. Make Changes
- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Test your changes thoroughly

### 4. Commit Changes
```bash
git add .
git commit -m "feat: add new indicator"
# or
git commit -m "fix: resolve chart rendering issue"
```

**Commit Message Format**:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

### 5. Push and Create PR
```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub with:
- Clear description of changes
- Screenshots (for UI changes)
- Testing notes
- Link to related issue

## Code Style Guidelines

### TypeScript
- Use TypeScript for all new files
- Define proper interfaces and types
- Avoid `any` type when possible
- Use meaningful variable names

```typescript
// Good
interface ChartConfig {
  symbol: string;
  interval: string;
}

// Avoid
let x: any = getData();
```

### React Components
- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use proper prop types

```typescript
// Good
interface ChartProps {
  chartState: ChartState;
}

export const TradingChart: React.FC<ChartProps> = ({ chartState }) => {
  // Component logic
};
```

### File Organization
- One component per file
- Co-locate related files
- Use barrel exports for cleaner imports
- Keep utility functions in `lib/`

### Styling
- Use Tailwind CSS for styling
- Follow existing color scheme
- Maintain responsive design
- Use semantic class names

```tsx
// Good
<div className="flex items-center gap-2 p-4 bg-card rounded-lg">

// Avoid inline styles unless dynamic
<div style={{ padding: '16px' }}>
```

## Testing

### Manual Testing
Before submitting a PR:
1. Test the feature/fix in development
2. Test on different screen sizes
3. Test edge cases and error scenarios
4. Verify no console errors

### Future: Automated Tests
(Coming soon - unit tests, integration tests, E2E tests)

## Adding Features

### Adding New Indicators

1. **Add calculation function** in `src/lib/indicators.ts`:
```typescript
export const calculateRSI = (data: number[], period: number = 14) => {
  // Implement calculation
  return rsiValues;
};
```

2. **Add to ChartState** in `src/lib/types.ts`:
```typescript
export interface ChartState {
  // ...
  showRSI?: boolean;
}
```

3. **Add toggle action** in `src/lib/store.ts`:
```typescript
toggleIndicator: (chartId, indicator) => {
  // Handle RSI toggle
}
```

4. **Render in chart** in `src/components/TradingChart.tsx`:
```typescript
if (chartState.showRSI) {
  const rsiData = calculateRSI(closePrices);
  // Add to chart
}
```

5. **Add UI button** in `src/components/Toolbar.tsx`:
```tsx
<Button onClick={() => toggleIndicator(selectedChart.id, 'rsi')}>
  RSI
</Button>
```

### Adding New Sync Modes

1. **Add state** in `src/lib/store.ts`:
```typescript
interface DashboardState {
  syncSettings: {
    // ...
    newSyncMode: boolean;
  };
}
```

2. **Add toggle** in store actions:
```typescript
toggleSync: (mode) => {
  if (mode === 'newMode') {
    set(state => ({
      syncSettings: {
        ...state.syncSettings,
        newSyncMode: !state.syncSettings.newSyncMode
      }
    }));
  }
}
```

3. **Implement logic** in relevant components
4. **Add UI toggle** in `src/components/SyncControls.tsx`

### Adding New Data Sources

1. **Create API file** (e.g., `src/lib/coinbase-api.ts`)
2. **Implement required functions**:
   - `fetchKlines()`
   - `fetch24hrTicker()`
   - `subscribeToKline()`
   - `unsubscribeFromKline()`
3. **Add exchange selector** in UI
4. **Update components** to use selected API

## Performance Guidelines

### Optimize Renders
```typescript
// Use useMemo for expensive calculations
const smaData = useMemo(() => 
  calculateSMA(prices, 20), 
  [prices]
);

// Use useCallback for stable function references
const handleSymbolChange = useCallback((symbol) => {
  updateChartSymbol(chartId, symbol);
}, [chartId]);
```

### Manage WebSocket Connections
```typescript
// Always cleanup WebSocket subscriptions
useEffect(() => {
  subscribeToKline(symbol, interval, callback);
  
  return () => {
    unsubscribeFromKline(symbol, interval);
  };
}, [symbol, interval]);
```

### Avoid Memory Leaks
- Clean up event listeners
- Unsubscribe from streams
- Clear timeouts/intervals
- Remove chart instances on unmount

## Documentation

### Code Comments
- Explain "why", not "what"
- Document complex algorithms
- Add JSDoc for public APIs

```typescript
/**
 * Calculates Simple Moving Average over a given period.
 * Returns null for data points where full period isn't available.
 */
export const calculateSMA = (data: number[], period: number = 20) => {
  // Implementation
};
```

### README Updates
- Update feature list for new features
- Add configuration examples
- Include usage instructions
- Update screenshots if UI changes

## Common Issues

### Chart Not Rendering
- Check console for errors
- Verify TradingView Lightweight Charts is loaded
- Ensure chart container has dimensions
- Check if data is being fetched correctly

### WebSocket Connection Fails
- Verify WebSocket URL is correct
- Check for CORS issues
- Ensure proper cleanup on unmount
- Test connection pooling logic

### State Not Persisting
- Check localStorage is enabled
- Verify store middleware is configured
- Test localStorage quota limits
- Check for serialization errors

## Getting Help

- **Questions**: Open a Discussion on GitHub
- **Bugs**: Create an Issue with reproduction steps
- **Features**: Propose in an Issue first
- **Security**: Email maintainers directly (don't open public issues)

## Pull Request Checklist

Before submitting:
- [ ] Code follows style guidelines
- [ ] All tests pass (when available)
- [ ] No console errors or warnings
- [ ] Documentation updated
- [ ] Screenshots added (for UI changes)
- [ ] Commit messages follow convention
- [ ] Branch is up-to-date with main
- [ ] Changes tested manually

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation

Thank you for contributing! 🎉
