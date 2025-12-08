// Core types for the trading dashboard
export type TimeInterval = '1m' | '3m' | '5m' | '15m' | '30m' | '1h' | '2h' | '4h' | '6h' | '12h' | '1d' | '3d' | '1w' | '1M';

export type Currency = 'USD' | 'INR' | 'EUR' | 'GBP' | 'JPY';

export interface Kline {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ChartState {
  id: string;
  symbol: string;
  interval: TimeInterval;
  indicators: {
    sma?: { period: number; visible: boolean };
    ema20?: { visible: boolean };
    ema50?: { visible: boolean };
    rsi?: { visible: boolean };
    volume?: { visible: boolean };
  };
}

export interface LayoutConfig {
  id: string;
  name: string;
  rows: number;
  cols: number;
  cells: number;
}

export interface SyncMode {
  symbol: boolean;
  interval: boolean;
  time: boolean;
  crosshair: boolean;
}

export interface DashboardState {
  charts: ChartState[];
  layout: LayoutConfig;
  syncMode: SyncMode;
  selectedChart: string | null;
}

export interface BinanceKlineData {
  t: number; // Open time
  o: string; // Open
  h: string; // High
  l: string; // Low
  c: string; // Close
  v: string; // Volume
  T: number; // Close time
  q: string; // Quote asset volume
  n: number; // Number of trades
  V: string; // Taker buy base asset volume
  Q: string; // Taker buy quote asset volume
  B: string; // Ignore
}