import type { TimeInterval, Kline, BinanceKlineData } from './types';

const BINANCE_API_BASE = 'https://api.binance.com/api/v3';
const BINANCE_WS_BASE = 'wss://stream.binance.com:9443/ws';

// Convert interval to Binance format
const intervalMap: Record<TimeInterval, string> = {
  '1m': '1m',
  '3m': '3m',
  '5m': '5m',
  '15m': '15m',
  '30m': '30m',
  '1h': '1h',
  '2h': '2h',
  '4h': '4h',
  '6h': '6h',
  '12h': '12h',
  '1d': '1d',
  '3d': '3d',
  '1w': '1w',
  '1M': '1M',
};

export async function fetchKlines(
  symbol: string,
  interval: TimeInterval,
  limit: number = 500
): Promise<Kline[]> {
  try {
    const url = `${BINANCE_API_BASE}/klines?symbol=${symbol}&interval=${intervalMap[interval]}&limit=${limit}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch klines: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return data.map((k: any[]) => ({
      time: k[0] / 1000, // Convert to seconds
      open: parseFloat(k[1]),
      high: parseFloat(k[2]),
      low: parseFloat(k[3]),
      close: parseFloat(k[4]),
      volume: parseFloat(k[5]),
    }));
  } catch (error) {
    console.error('Error fetching klines:', error);
    return [];
  }
}

class WebSocketPool {
  private connections: Map<string, WebSocket> = new Map();
  private subscribers: Map<string, Set<(data: Kline) => void>> = new Map();
  private reconnectTimers: Map<string, NodeJS.Timeout> = new Map();

  subscribe(
    symbol: string,
    interval: TimeInterval,
    callback: (data: Kline) => void
  ): () => void {
    const key = `${symbol.toLowerCase()}@kline_${intervalMap[interval]}`;
    
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
      this.connect(key);
    }
    
    this.subscribers.get(key)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      const subs = this.subscribers.get(key);
      if (subs) {
        subs.delete(callback);
        if (subs.size === 0) {
          this.disconnect(key);
        }
      }
    };
  }

  private connect(streamKey: string) {
    if (this.connections.has(streamKey)) {
      return;
    }

    const ws = new WebSocket(`${BINANCE_WS_BASE}/${streamKey}`);
    
    ws.onopen = () => {
      console.log(`WebSocket connected: ${streamKey}`);
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const kline: BinanceKlineData = data.k;
        
        if (kline) {
          const formattedKline: Kline = {
            time: kline.t / 1000,
            open: parseFloat(kline.o),
            high: parseFloat(kline.h),
            low: parseFloat(kline.l),
            close: parseFloat(kline.c),
            volume: parseFloat(kline.v),
          };
          
          const subscribers = this.subscribers.get(streamKey);
          if (subscribers) {
            subscribers.forEach((callback) => callback(formattedKline));
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error(`WebSocket error (${streamKey}):`, error);
    };
    
    ws.onclose = () => {
      console.log(`WebSocket closed: ${streamKey}`);
      this.connections.delete(streamKey);
      
      // Attempt to reconnect if there are still subscribers
      if (this.subscribers.get(streamKey)?.size ?? 0 > 0) {
        const timer = setTimeout(() => {
          this.connect(streamKey);
        }, 3000);
        this.reconnectTimers.set(streamKey, timer);
      }
    };
    
    this.connections.set(streamKey, ws);
  }

  private disconnect(streamKey: string) {
    const ws = this.connections.get(streamKey);
    if (ws) {
      ws.close();
      this.connections.delete(streamKey);
    }
    
    this.subscribers.delete(streamKey);
    
    const timer = this.reconnectTimers.get(streamKey);
    if (timer) {
      clearTimeout(timer);
      this.reconnectTimers.delete(streamKey);
    }
  }

  disconnectAll() {
    this.connections.forEach((ws) => ws.close());
    this.connections.clear();
    this.subscribers.clear();
    this.reconnectTimers.forEach((timer) => clearTimeout(timer));
    this.reconnectTimers.clear();
  }
}

export const wsPool = new WebSocketPool();

// Fetch popular symbols
export async function fetchPopularSymbols(): Promise<string[]> {
  try {
    const response = await fetch(`${BINANCE_API_BASE}/ticker/24hr`);
    if (!response.ok) {
      throw new Error('Failed to fetch symbols');
    }
    
    const data = await response.json();
    
    // Filter USDT pairs and sort by volume
    const usdtPairs = data
      .filter((ticker: any) => ticker.symbol.endsWith('USDT'))
      .sort((a: any, b: any) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
      .slice(0, 50)
      .map((ticker: any) => ticker.symbol);
    
    return usdtPairs;
  } catch (error) {
    console.error('Error fetching symbols:', error);
    return ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT'];
  }
}
