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

export function calculateRSI(data: Kline[], period: number = 14): Array<{ time: number; value: number | null }> {
  const result: Array<{ time: number; value: number | null }> = [];
  
  if (data.length < period + 1) {
    return data.map(k => ({ time: k.time, value: null }));
  }
  
  // Calculate initial average gain and loss
  let avgGain = 0;
  let avgLoss = 0;
  
  for (let i = 1; i <= period; i++) {
    const change = data[i].close - data[i - 1].close;
    if (change > 0) {
      avgGain += change;
    } else {
      avgLoss += Math.abs(change);
    }
  }
  
  avgGain /= period;
  avgLoss /= period;
  
  // Fill initial values with null
  for (let i = 0; i < period; i++) {
    result.push({ time: data[i].time, value: null });
  }
  
  // Calculate RSI for remaining data
  for (let i = period; i < data.length; i++) {
    const change = data[i].close - data[i - 1].close;
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;
    
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));
    
    result.push({ time: data[i].time, value: rsi });
  }
  
  return result;
}

export interface ScalpingSignal {
  type: 'BUY' | 'SELL' | 'NEUTRAL';
  strength: 'STRONG' | 'MODERATE' | 'WEAK';
  reasons: string[];
  entryPrice: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  takeProfit3: number;
}

export function analyzeScalpingSetup(
  klineData: Kline[],
  ema20: number | null,
  ema50: number | null,
  rsi: number | null,
  interval: string
): ScalpingSignal {
  if (klineData.length < 3 || !ema20 || !ema50 || !rsi) {
    return {
      type: 'NEUTRAL',
      strength: 'WEAK',
      reasons: ['Insufficient data'],
      entryPrice: 0,
      stopLoss: 0,
      takeProfit1: 0,
      takeProfit2: 0,
      takeProfit3: 0,
    };
  }
  
  const currentPrice = klineData[klineData.length - 1].close;
  const prevCandle = klineData[klineData.length - 2];
  const currentCandle = klineData[klineData.length - 1];
  
  const reasons: string[] = [];
  let signal: 'BUY' | 'SELL' | 'NEUTRAL' = 'NEUTRAL';
  let strength: 'STRONG' | 'MODERATE' | 'WEAK' = 'WEAK';
  
  // Check trend (5min should show this)
  const isUptrend = currentPrice > ema20 && currentPrice > ema50 && ema20 > ema50;
  const isDowntrend = currentPrice < ema20 && currentPrice < ema50 && ema20 < ema50;
  
  // Detect candle patterns
  const isBullishEngulfing = 
    prevCandle.close < prevCandle.open && // prev bearish
    currentCandle.close > currentCandle.open && // current bullish
    currentCandle.open < prevCandle.close &&
    currentCandle.close > prevCandle.open;
  
  const isBearishEngulfing = 
    prevCandle.close > prevCandle.open && // prev bullish
    currentCandle.close < currentCandle.open && // current bearish
    currentCandle.open > prevCandle.close &&
    currentCandle.close < prevCandle.open;
  
  const isHammer = 
    currentCandle.close > currentCandle.open &&
    (currentCandle.close - currentCandle.open) < (currentCandle.high - currentCandle.low) * 0.3 &&
    (currentCandle.open - currentCandle.low) > (currentCandle.high - currentCandle.close) * 2;
  
  const isShootingStar = 
    currentCandle.close < currentCandle.open &&
    (currentCandle.open - currentCandle.close) < (currentCandle.high - currentCandle.low) * 0.3 &&
    (currentCandle.high - currentCandle.open) > (currentCandle.close - currentCandle.low) * 2;
  
  // Analyze for BUY signal
  if (isUptrend) {
    reasons.push('✅ Uptrend: Price > EMA20 > EMA50');
    
    if (rsi >= 30 && rsi <= 45) {
      reasons.push('✅ RSI Pullback: ' + rsi.toFixed(1));
      signal = 'BUY';
      strength = 'MODERATE';
    }
    
    if (isBullishEngulfing) {
      reasons.push('✅ Bullish Engulfing Pattern');
      signal = 'BUY';
      strength = 'STRONG';
    }
    
    if (isHammer) {
      reasons.push('✅ Hammer Candle');
      signal = 'BUY';
      strength = strength === 'STRONG' ? 'STRONG' : 'MODERATE';
    }
    
    const nearEMA20 = Math.abs(currentPrice - ema20) / currentPrice < 0.01;
    if (nearEMA20) {
      reasons.push('✅ Price near EMA20 support');
      if (signal === 'BUY') strength = 'STRONG';
    }
  }
  
  // Analyze for SELL signal
  if (isDowntrend) {
    reasons.push('✅ Downtrend: Price < EMA20 < EMA50');
    
    if (rsi >= 55 && rsi <= 70) {
      reasons.push('✅ RSI Rejection: ' + rsi.toFixed(1));
      signal = 'SELL';
      strength = 'MODERATE';
    }
    
    if (isBearishEngulfing) {
      reasons.push('✅ Bearish Engulfing Pattern');
      signal = 'SELL';
      strength = 'STRONG';
    }
    
    if (isShootingStar) {
      reasons.push('✅ Shooting Star Candle');
      signal = 'SELL';
      strength = strength === 'STRONG' ? 'STRONG' : 'MODERATE';
    }
    
    const nearEMA20 = Math.abs(currentPrice - ema20) / currentPrice < 0.01;
    if (nearEMA20) {
      reasons.push('✅ Price near EMA20 resistance');
      if (signal === 'SELL') strength = 'STRONG';
    }
  }
  
  // Calculate entry and exit prices for 10x leverage scalping
  const stopLossPercent = 0.01; // 1% stop loss
  const tp1Percent = 0.008; // 0.8% TP
  const tp2Percent = 0.012; // 1.2% TP
  const tp3Percent = 0.018; // 1.8% TP
  
  let stopLoss = 0;
  let tp1 = 0;
  let tp2 = 0;
  let tp3 = 0;
  
  if (signal === 'BUY') {
    stopLoss = currentPrice * (1 - stopLossPercent);
    tp1 = currentPrice * (1 + tp1Percent);
    tp2 = currentPrice * (1 + tp2Percent);
    tp3 = currentPrice * (1 + tp3Percent);
  } else if (signal === 'SELL') {
    stopLoss = currentPrice * (1 + stopLossPercent);
    tp1 = currentPrice * (1 - tp1Percent);
    tp2 = currentPrice * (1 - tp2Percent);
    tp3 = currentPrice * (1 - tp3Percent);
  }
  
  if (signal === 'NEUTRAL') {
    reasons.push('⚠️ No clear setup - wait for confirmation');
  }
  
  return {
    type: signal,
    strength,
    reasons,
    entryPrice: currentPrice,
    stopLoss,
    takeProfit1: tp1,
    takeProfit2: tp2,
    takeProfit3: tp3,
  };
}

export function formatVolume(volume: number): string {
  if (volume >= 1e9) return (volume / 1e9).toFixed(2) + 'B';
  if (volume >= 1e6) return (volume / 1e6).toFixed(2) + 'M';
  if (volume >= 1e3) return (volume / 1e3).toFixed(2) + 'K';
  return volume.toFixed(2);
}