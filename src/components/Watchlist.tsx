'use client';

import { useEffect, useState } from 'react';
import { fetchPopularSymbols } from '@/lib/binance-api';
import { useDashboardStore } from '@/lib/store';
import { Search, TrendingUp, TrendingDown } from 'lucide-react';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';

interface SymbolData {
  symbol: string;
  price: string;
  change: string;
  changePercent: string;
}

export default function Watchlist() {
  const [symbols, setSymbols] = useState<string[]>([]);
  const [symbolData, setSymbolData] = useState<Map<string, SymbolData>>(new Map());
  const [searchQuery, setSearchQuery] = useState('');
  const { selectedChart, updateChartSymbol } = useDashboardStore();

  useEffect(() => {
    async function loadSymbols() {
      const popularSymbols = await fetchPopularSymbols();
      setSymbols(popularSymbols);

      // Fetch 24hr ticker data
      try {
        const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');
        const data = await response.json();
        
        const dataMap = new Map<string, SymbolData>();
        data.forEach((ticker: any) => {
          if (popularSymbols.includes(ticker.symbol)) {
            dataMap.set(ticker.symbol, {
              symbol: ticker.symbol,
              price: parseFloat(ticker.lastPrice).toFixed(2),
              change: parseFloat(ticker.priceChange).toFixed(2),
              changePercent: parseFloat(ticker.priceChangePercent).toFixed(2),
            });
          }
        });
        
        setSymbolData(dataMap);
      } catch (error) {
        console.error('Error fetching ticker data:', error);
      }
    }

    loadSymbols();
  }, []);

  const filteredSymbols = symbols.filter((symbol) =>
    symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSymbolClick = (symbol: string) => {
    if (selectedChart) {
      updateChartSymbol(selectedChart, symbol);
    }
  };

  return (
    <div className="w-64 bg-[#1E222D] border-r border-[#2B2B43] flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-[#2B2B43]">
        <h2 className="text-white font-semibold text-sm mb-2">Watchlist</h2>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search symbols..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 bg-[#2A2E39] border-[#2B2B43] text-white text-xs placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* Symbol list */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredSymbols.map((symbol) => {
            const data = symbolData.get(symbol);
            const isPositive = data ? parseFloat(data.changePercent) >= 0 : true;

            return (
              <button
                key={symbol}
                onClick={() => handleSymbolClick(symbol)}
                disabled={!selectedChart}
                className={`w-full p-2 rounded hover:bg-[#2A2E39] text-left transition-colors ${
                  !selectedChart ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white text-xs font-medium">
                    {symbol.replace('USDT', '/USDT')}
                  </span>
                  {data && (
                    <div className="flex items-center gap-1">
                      {isPositive ? (
                        <TrendingUp className="w-3 h-3 text-[#26a69a]" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-[#ef5350]" />
                      )}
                    </div>
                  )}
                </div>
                {data ? (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-xs">${data.price}</span>
                    <span
                      className={`text-xs font-medium ${
                        isPositive ? 'text-[#26a69a]' : 'text-[#ef5350]'
                      }`}
                    >
                      {isPositive ? '+' : ''}
                      {data.changePercent}%
                    </span>
                  </div>
                ) : (
                  <div className="text-gray-500 text-xs">Loading...</div>
                )}
              </button>
            );
          })}
        </div>
      </ScrollArea>

      {!selectedChart && (
        <div className="p-3 border-t border-[#2B2B43] bg-[#2A2E39]/50">
          <p className="text-xs text-gray-400 text-center">
            Select a chart to change symbol
          </p>
        </div>
      )}
    </div>
  );
}
