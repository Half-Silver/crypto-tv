'use client';

import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useDashboardStore } from '@/lib/store';
import { LayoutGrid, TrendingUp, Activity, BarChart3, DollarSign, Zap } from 'lucide-react';
import type { TimeInterval, Currency } from '@/lib/types';

const INTERVALS: { value: TimeInterval; label: string }[] = [
  { value: '1m', label: '1m' },
  { value: '3m', label: '3m' },
  { value: '5m', label: '5m' },
  { value: '15m', label: '15m' },
  { value: '30m', label: '30m' },
  { value: '1h', label: '1h' },
  { value: '2h', label: '2h' },
  { value: '4h', label: '4h' },
  { value: '6h', label: '6h' },
  { value: '12h', label: '12h' },
  { value: '1d', label: '1D' },
  { value: '3d', label: '3D' },
  { value: '1w', label: '1W' },
  { value: '1M', label: '1M' },
];

const CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
  { value: 'USD', label: 'USD', symbol: '$' },
  { value: 'INR', label: 'INR', symbol: '₹' },
  { value: 'EUR', label: 'EUR', symbol: '€' },
  { value: 'GBP', label: 'GBP', symbol: '£' },
  { value: 'JPY', label: 'JPY', symbol: '¥' },
];

interface ToolbarProps {
  onLayoutClick: () => void;
}

export default function Toolbar({ onLayoutClick }: ToolbarProps) {
  const { selectedChart, charts, currency, scalpingMode, updateChartInterval, toggleIndicator, setCurrency, setScalpingPreset } = useDashboardStore();

  const selectedChartData = charts.find((c) => c.id === selectedChart);

  const handleIntervalChange = (interval: string) => {
    if (selectedChart) {
      updateChartInterval(selectedChart, interval);
    }
  };

  const handleIndicatorToggle = (indicator: string) => {
    if (selectedChart) {
      toggleIndicator(selectedChart, indicator);
    }
  };

  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency as Currency);
  };

  return (
    <div className="h-12 bg-[#1E222D] border-b border-[#2B2B43] flex items-center px-4 gap-3">
      {/* Layout selector button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onLayoutClick}
        className="text-gray-300 hover:text-white hover:bg-[#2A2E39]"
      >
        <LayoutGrid className="w-4 h-4 mr-2" />
        Layout
      </Button>

      <div className="w-px h-6 bg-[#2B2B43]" />

      {/* Scalping Mode Preset */}
      <Button
        variant="ghost"
        size="sm"
        onClick={setScalpingPreset}
        className={`${
          scalpingMode
            ? 'bg-[#FF6D00] text-white hover:bg-[#F57C00]'
            : 'text-gray-300 hover:text-white hover:bg-[#2A2E39]'
        }`}
      >
        <Zap className="w-4 h-4 mr-2" />
        Scalping 10×
      </Button>

      <div className="w-px h-6 bg-[#2B2B43]" />

      {/* Currency selector */}
      <div className="flex items-center gap-2">
        <DollarSign className="w-4 h-4 text-gray-400" />
        <Select value={currency} onValueChange={handleCurrencyChange}>
          <SelectTrigger className="w-[90px] h-8 bg-[#2A2E39] border-[#2B2B43] text-white text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#1E222D] border-[#2B2B43]">
            {CURRENCIES.map((curr) => (
              <SelectItem
                key={curr.value}
                value={curr.value}
                className="text-white hover:bg-[#2A2E39] focus:bg-[#2A2E39] cursor-pointer"
              >
                {curr.symbol} {curr.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-px h-6 bg-[#2B2B43]" />

      {/* Interval selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400">Interval:</span>
        <Select
          value={selectedChartData?.interval || '1h'}
          onValueChange={handleIntervalChange}
          disabled={!selectedChart}
        >
          <SelectTrigger className="w-[80px] h-8 bg-[#2A2E39] border-[#2B2B43] text-white text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#1E222D] border-[#2B2B43]">
            {INTERVALS.map((interval) => (
              <SelectItem
                key={interval.value}
                value={interval.value}
                className="text-white hover:bg-[#2A2E39] focus:bg-[#2A2E39] cursor-pointer"
              >
                {interval.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-px h-6 bg-[#2B2B43]" />

      {/* Indicators */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400">Indicators:</span>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleIndicatorToggle('ema20')}
          disabled={!selectedChart}
          className={`h-8 text-xs ${
            selectedChartData?.indicators.ema20?.visible
              ? 'bg-[#2962FF] text-white hover:bg-[#1E53E5]'
              : 'text-gray-300 hover:text-white hover:bg-[#2A2E39]'
          }`}
        >
          <TrendingUp className="w-3 h-3 mr-1" />
          EMA20
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleIndicatorToggle('ema50')}
          disabled={!selectedChart}
          className={`h-8 text-xs ${
            selectedChartData?.indicators.ema50?.visible
              ? 'bg-[#FF6D00] text-white hover:bg-[#F57C00]'
              : 'text-gray-300 hover:text-white hover:bg-[#2A2E39]'
          }`}
        >
          <TrendingUp className="w-3 h-3 mr-1" />
          EMA50
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleIndicatorToggle('rsi')}
          disabled={!selectedChart}
          className={`h-8 text-xs ${
            selectedChartData?.indicators.rsi?.visible
              ? 'bg-[#9C27B0] text-white hover:bg-[#7B1FA2]'
              : 'text-gray-300 hover:text-white hover:bg-[#2A2E39]'
          }`}
        >
          <Activity className="w-3 h-3 mr-1" />
          RSI
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleIndicatorToggle('volume')}
          disabled={!selectedChart}
          className={`h-8 text-xs ${
            selectedChartData?.indicators.volume?.visible
              ? 'bg-[#26a69a] text-white hover:bg-[#00897B]'
              : 'text-gray-300 hover:text-white hover:bg-[#2A2E39]'
          }`}
        >
          <BarChart3 className="w-3 h-3 mr-1" />
          Volume
        </Button>
      </div>

      {!selectedChart && (
        <span className="text-xs text-gray-500 ml-2">
          (Select a chart to configure)
        </span>
      )}
    </div>
  );
}