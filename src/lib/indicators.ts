import type { Kline } from './types';

export function calculateSMA(data: Kline[], period: number): Array<{ time: number; value: number | null }> {
  const result: Array<{ time: number; value: number | null }> = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push({ time: data[i].time, value: null });
    } else {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j].close;
      }
      result.push({ time: data[i].time, value: sum / period });
    }
  }
  
  return result;
}

export function calculateEMA(data: Kline[], period: number): Array<{ time: number; value: number | null }> {
  const result: Array<{ time: number; value: number | null }> = [];
  const multiplier = 2 / (period + 1);
  
  // Calculate initial SMA
  let ema = 0;
  for (let i = 0; i < period && i < data.length; i++) {
    ema += data[i].close;
    if (i < period - 1) {
      result.push({ time: data[i].time, value: null });
    }
  }
  
  if (data.length < period) {
    return result;
  }
  
  ema = ema / period;
  result.push({ time: data[period - 1].time, value: ema });
  
  // Calculate EMA for the rest
  for (let i = period; i < data.length; i++) {
    ema = (data[i].close - ema) * multiplier + ema;
    result.push({ time: data[i].time, value: ema });
  }
  
  return result;
}

export function formatVolume(volume: number): string {
  if (volume >= 1e9) return (volume / 1e9).toFixed(2) + 'B';
  if (volume >= 1e6) return (volume / 1e6).toFixed(2) + 'M';
  if (volume >= 1e3) return (volume / 1e3).toFixed(2) + 'K';
  return volume.toFixed(2);
}
