import { Card } from './ui/card';
import { TrendingUp, TrendingDown, AlertTriangle, Target, ShieldAlert } from 'lucide-react';
import type { ScalpingSignal } from '@/lib/indicators';
import type { Currency } from '@/lib/types';

interface ScalpingPanelProps {
  signal: ScalpingSignal;
  currency: Currency;
  exchangeRate: number;
}

export const ScalpingPanel = ({ signal, currency, exchangeRate }: ScalpingPanelProps) => {
  const currencySymbols: Record<Currency, string> = {
    USD: '$',
    INR: '₹',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
  };

  const currencySymbol = currencySymbols[currency];
  const precision = currency === 'JPY' ? 0 : 2;

  // Calculate 10x leverage profits
  const calculateProfit = (entryPrice: number, exitPrice: number, leverage: number = 10) => {
    const changePercent = ((exitPrice - entryPrice) / entryPrice) * 100;
    return changePercent * leverage;
  };

  const tp1Profit = signal.entryPrice > 0 ? calculateProfit(signal.entryPrice, signal.takeProfit1) : 0;
  const tp2Profit = signal.entryPrice > 0 ? calculateProfit(signal.entryPrice, signal.takeProfit2) : 0;
  const tp3Profit = signal.entryPrice > 0 ? calculateProfit(signal.entryPrice, signal.takeProfit3) : 0;
  const slLoss = signal.entryPrice > 0 ? calculateProfit(signal.entryPrice, signal.stopLoss) : 0;

  const formatPrice = (price: number) => {
    const converted = price * exchangeRate;
    return `${currencySymbol}${converted.toLocaleString(currency === 'INR' ? 'en-IN' : 'en-US', {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    })}`;
  };

  const getSignalColor = () => {
    if (signal.type === 'BUY') return 'border-green-500/50 bg-green-500/10';
    if (signal.type === 'SELL') return 'border-red-500/50 bg-red-500/10';
    return 'border-yellow-500/50 bg-yellow-500/10';
  };

  const getSignalIcon = () => {
    if (signal.type === 'BUY') return <TrendingUp className="w-5 h-5 text-green-400" />;
    if (signal.type === 'SELL') return <TrendingDown className="w-5 h-5 text-red-400" />;
    return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
  };

  const getStrengthBadge = () => {
    const colors = {
      STRONG: 'bg-green-500/20 text-green-400 border-green-500/30',
      MODERATE: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      WEAK: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    };
    return colors[signal.strength];
  };

  return (
    <Card className={`border-2 ${getSignalColor()} p-4 space-y-3`}>
      {/* Signal Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getSignalIcon()}
          <span className="text-lg font-bold text-white">
            {signal.type === 'NEUTRAL' ? 'NO SIGNAL' : `${signal.type} SIGNAL`}
          </span>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-semibold border ${getStrengthBadge()}`}>
          {signal.strength}
        </span>
      </div>

      {/* Reasons */}
      <div className="space-y-1">
        {signal.reasons.map((reason, idx) => (
          <div key={idx} className="text-xs text-gray-300">
            {reason}
          </div>
        ))}
      </div>

      {/* Entry & Exit Levels */}
      {signal.type !== 'NEUTRAL' && signal.entryPrice > 0 && (
        <div className="space-y-2 pt-2 border-t border-gray-700">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            10× Leverage Scalping Setup
          </div>
          
          {/* Entry */}
          <div className="flex items-center justify-between bg-[#2a2e39] px-3 py-2 rounded">
            <span className="text-xs text-gray-400">Entry Price</span>
            <span className="text-sm font-bold text-white">{formatPrice(signal.entryPrice)}</span>
          </div>

          {/* Stop Loss */}
          <div className="flex items-center justify-between bg-red-500/10 px-3 py-2 rounded border border-red-500/30">
            <div className="flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              <span className="text-xs text-gray-400">Stop Loss</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-red-400">{formatPrice(signal.stopLoss)}</div>
              <div className="text-xs text-red-300">{slLoss.toFixed(1)}% loss</div>
            </div>
          </div>

          {/* Take Profits */}
          <div className="space-y-1">
            <div className="flex items-center justify-between bg-green-500/10 px-3 py-2 rounded border border-green-500/30">
              <div className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-green-400" />
                <span className="text-xs text-gray-400">TP1 (0.8%)</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-green-400">{formatPrice(signal.takeProfit1)}</div>
                <div className="text-xs text-green-300">+{tp1Profit.toFixed(1)}% gain</div>
              </div>
            </div>

            <div className="flex items-center justify-between bg-green-500/10 px-3 py-2 rounded border border-green-500/30">
              <div className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-green-400" />
                <span className="text-xs text-gray-400">TP2 (1.2%)</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-green-400">{formatPrice(signal.takeProfit2)}</div>
                <div className="text-xs text-green-300">+{tp2Profit.toFixed(1)}% gain</div>
              </div>
            </div>

            <div className="flex items-center justify-between bg-green-500/10 px-3 py-2 rounded border border-green-500/30">
              <div className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-green-400" />
                <span className="text-xs text-gray-400">TP3 (1.8%)</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-green-400">{formatPrice(signal.takeProfit3)}</div>
                <div className="text-xs text-green-300">+{tp3Profit.toFixed(1)}% gain</div>
              </div>
            </div>
          </div>

          {/* Risk Warning */}
          <div className="text-xs text-yellow-400 bg-yellow-500/10 px-2 py-1.5 rounded border border-yellow-500/30">
            ⚠️ <span className="font-semibold">10x Leverage Warning:</span> Never risk more than 1% of account. Close if trade lags.
          </div>
        </div>
      )}
    </Card>
  );
};
