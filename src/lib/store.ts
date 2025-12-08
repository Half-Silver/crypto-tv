import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChartState, LayoutConfig, SyncMode, DashboardState, Currency } from './types';

const DEFAULT_LAYOUTS: LayoutConfig[] = [
  { id: '1x1', name: '1×1', rows: 1, cols: 1, cells: 1 },
  { id: '1x2', name: '1×2', rows: 1, cols: 2, cells: 2 },
  { id: '2x2', name: '2×2', rows: 2, cols: 2, cells: 4 },
  { id: '3x2', name: '3×2', rows: 2, cols: 3, cells: 6 },
  { id: '3x3', name: '3×3', rows: 3, cols: 3, cells: 9 },
  { id: '4x4', name: '4×4', rows: 4, cols: 4, cells: 16 },
];

interface DashboardStore extends DashboardState {
  currency: Currency;
  exchangeRates: Record<string, number>;
  scalpingMode: boolean;
  setLayout: (layout: LayoutConfig) => void;
  updateChart: (id: string, updates: Partial<ChartState>) => void;
  setSyncMode: (syncMode: Partial<SyncMode>) => void;
  setSelectedChart: (id: string | null) => void;
  updateChartSymbol: (id: string, symbol: string) => void;
  updateChartInterval: (id: string, interval: string) => void;
  toggleIndicator: (chartId: string, indicator: string) => void;
  setCurrency: (currency: Currency) => void;
  setExchangeRates: (rates: Record<string, number>) => void;
  setScalpingMode: (enabled: boolean) => void;
  setScalpingPreset: () => void;
}

const createInitialCharts = (count: number): ChartState[] => {
  const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT', 'ADAUSDT', 'DOGEUSDT', 'MATICUSDT', 'DOTUSDT', 'LTCUSDT', 'AVAXUSDT', 'ATOMUSDT', 'LINKUSDT', 'UNIUSDT', 'XLMUSDT', 'ALGOUSDT'];
  return Array.from({ length: count }, (_, i) => ({
    id: `chart-${i}`,
    symbol: symbols[i % symbols.length],
    interval: '1h' as const,
    indicators: {
      volume: { visible: true },
    },
  }));
};

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set, get) => ({
      charts: createInitialCharts(4),
      layout: DEFAULT_LAYOUTS[2], // Default to 2x2
      syncMode: {
        symbol: false,
        interval: false,
        time: false,
        crosshair: false,
      },
      selectedChart: null,
      currency: 'INR',
      exchangeRates: {
        USD: 1,
        INR: 83.5,
        EUR: 0.92,
        GBP: 0.79,
        JPY: 149.5,
      },
      scalpingMode: false,

      setLayout: (layout) => {
        set((state) => {
          const currentChartCount = state.charts.length;
          const newChartCount = layout.cells;
          
          let charts = [...state.charts];
          if (newChartCount > currentChartCount) {
            charts = [...charts, ...createInitialCharts(newChartCount - currentChartCount).map((c, i) => ({
              ...c,
              id: `chart-${currentChartCount + i}`,
            }))];
          } else {
            charts = charts.slice(0, newChartCount);
          }
          
          return { layout, charts };
        });
      },

      updateChart: (id, updates) => {
        set((state) => ({
          charts: state.charts.map((chart) =>
            chart.id === id ? { ...chart, ...updates } : chart
          ),
        }));
      },

      setSyncMode: (syncMode) => {
        set((state) => ({
          syncMode: { ...state.syncMode, ...syncMode },
        }));
      },

      setSelectedChart: (id) => {
        set({ selectedChart: id });
      },

      updateChartSymbol: (id, symbol) => {
        const state = get();
        if (state.syncMode.symbol) {
          // Update all charts
          set({
            charts: state.charts.map((chart) => ({ ...chart, symbol })),
          });
        } else {
          // Update only the specific chart
          set({
            charts: state.charts.map((chart) =>
              chart.id === id ? { ...chart, symbol } : chart
            ),
          });
        }
      },

      updateChartInterval: (id, interval) => {
        const state = get();
        if (state.syncMode.interval) {
          // Update all charts
          set({
            charts: state.charts.map((chart) => ({ ...chart, interval: interval as any })),
          });
        } else {
          // Update only the specific chart
          set({
            charts: state.charts.map((chart) =>
              chart.id === id ? { ...chart, interval: interval as any } : chart
            ),
          });
        }
      },

      toggleIndicator: (chartId, indicator) => {
        set((state) => ({
          charts: state.charts.map((chart) => {
            if (chart.id !== chartId) return chart;
            
            const indicators = { ...chart.indicators };
            if (indicator === 'sma') {
              indicators.sma = indicators.sma?.visible 
                ? { ...indicators.sma, visible: false }
                : { period: 20, visible: true };
            } else if (indicator === 'ema20') {
              indicators.ema20 = indicators.ema20?.visible
                ? { visible: false }
                : { visible: true };
            } else if (indicator === 'ema50') {
              indicators.ema50 = indicators.ema50?.visible
                ? { visible: false }
                : { visible: true };
            } else if (indicator === 'rsi') {
              indicators.rsi = indicators.rsi?.visible
                ? { visible: false }
                : { visible: true };
            } else if (indicator === 'volume') {
              indicators.volume = indicators.volume?.visible
                ? { visible: false }
                : { visible: true };
            }
            
            return { ...chart, indicators };
          }),
        }));
      },

      setCurrency: (currency) => {
        set({ currency });
      },

      setExchangeRates: (rates) => {
        set({ exchangeRates: rates });
      },

      setScalpingMode: (enabled) => {
        set({ scalpingMode: enabled });
      },

      setScalpingPreset: () => {
        set((state) => {
          // Scalping preset: 2x2 layout, same symbol (SOL), 5min + 1min intervals, EMA20/50 + RSI enabled
          const scalpingSymbol = 'SOLUSDT';
          
          const scalpingCharts: ChartState[] = [
            {
              id: 'chart-0',
              symbol: scalpingSymbol,
              interval: '5m',
              indicators: {
                ema20: { visible: true },
                ema50: { visible: true },
                rsi: { visible: true },
                volume: { visible: true },
              },
            },
            {
              id: 'chart-1',
              symbol: scalpingSymbol,
              interval: '1m',
              indicators: {
                ema20: { visible: true },
                ema50: { visible: true },
                rsi: { visible: true },
                volume: { visible: true },
              },
            },
            {
              id: 'chart-2',
              symbol: scalpingSymbol,
              interval: '1m',
              indicators: {
                ema20: { visible: true },
                ema50: { visible: true },
                rsi: { visible: true },
                volume: { visible: false },
              },
            },
            {
              id: 'chart-3',
              symbol: scalpingSymbol,
              interval: '5m',
              indicators: {
                ema20: { visible: true },
                ema50: { visible: true },
                rsi: { visible: false },
                volume: { visible: true },
              },
            },
          ];
          
          return {
            layout: DEFAULT_LAYOUTS[2], // 2x2
            charts: scalpingCharts,
            scalpingMode: true,
          };
        });
      },
    }),
    {
      name: 'dashboard-storage',
      partialize: (state) => ({
        layout: state.layout,
        syncMode: state.syncMode,
        currency: state.currency,
        scalpingMode: state.scalpingMode,
        charts: state.charts.map(({ id, symbol, interval, indicators }) => ({
          id,
          symbol,
          interval,
          indicators,
        })),
      }),
    }
  )
);

export { DEFAULT_LAYOUTS };