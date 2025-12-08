'use client';

import { useEffect, useRef, useState } from 'react';
import type { ChartState, Kline } from '@/lib/types';
import { fetchKlines, wsPool } from '@/lib/binance-api';
import { calculateEMA, calculateRSI, analyzeScalpingSetup, type ScalpingSignal } from '@/lib/indicators';
import { useDashboardStore } from '@/lib/store';
import { Activity, ActivitySquare, TrendingUp, TrendingDown } from 'lucide-react';
import { ScalpingPanel } from './ScalpingPanel';

interface TradingChartProps {
  chartState: ChartState;
  onChartReady?: (chart: any) => void;
}

export default function TradingChart({ chartState, onChartReady }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const candlestickSeriesRef = useRef<any>(null);
  const volumeSeriesRef = useRef<any>(null);
  const ema20SeriesRef = useRef<any>(null);
  const ema50SeriesRef = useRef<any>(null);
  const rsiSeriesRef = useRef<any>(null);
  const [klineData, setKlineData] = useState<Kline[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const initializingRef = useRef(false);
  const [chartInitialized, setChartInitialized] = useState(false);
  const { setSelectedChart, selectedChart, currency, exchangeRates, setExchangeRates, scalpingMode } = useDashboardStore();
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [liveUpdatesEnabled, setLiveUpdatesEnabled] = useState(true);
  
  // Live price state
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [previousPrice, setPreviousPrice] = useState<number | null>(null);
  const [priceChangePercent, setPriceChangePercent] = useState<number>(0);

  // Scalping signal state
  const [scalpingSignal, setScalpingSignal] = useState<ScalpingSignal>({
    type: 'NEUTRAL',
    strength: 'WEAK',
    reasons: [],
    entryPrice: 0,
    stopLoss: 0,
    takeProfit1: 0,
    takeProfit2: 0,
    takeProfit3: 0,
  });

  // Track current symbol/interval to detect changes
  const currentSymbolRef = useRef(chartState.symbol);
  const currentIntervalRef = useRef(chartState.interval);

  // Fetch exchange rates
  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        if (data.rates) {
          setExchangeRates({
            USD: 1,
            INR: data.rates.INR || 83.5,
            EUR: data.rates.EUR || 0.92,
            GBP: data.rates.GBP || 0.79,
            JPY: data.rates.JPY || 149.5,
          });
        }
      } catch (error) {
        console.error('Failed to fetch exchange rates, using defaults:', error);
      }
    };

    fetchExchangeRates();
    const interval = setInterval(fetchExchangeRates, 3600000);
    return () => clearInterval(interval);
  }, [setExchangeRates]);

  // Initialize chart with v5 API
  useEffect(() => {
    if (!chartContainerRef.current || initializingRef.current || chartInitialized) return;

    initializingRef.current = true;
    let chart: any = null;
    let resizeObserver: ResizeObserver | null = null;

    import('lightweight-charts')
      .then((LWC) => {
        if (!chartContainerRef.current) return;

        try {
          chart = LWC.createChart(chartContainerRef.current, {
            layout: {
              background: { color: '#1e222d' },
              textColor: '#d1d4dc',
            },
            grid: {
              vertLines: { color: '#2b2b43' },
              horzLines: { color: '#2b2b43' },
            },
            crosshair: {
              mode: LWC.CrosshairMode.Normal,
            },
            rightPriceScale: {
              borderColor: '#2B2B43',
            },
            timeScale: {
              borderColor: '#2B2B43',
              timeVisible: true,
              secondsVisible: false,
            },
            watermark: {
              visible: false,
            },
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight,
          });

          chartRef.current = chart;

          const candlestickSeries = chart.addSeries(LWC.CandlestickSeries, {
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderUpColor: '#26a69a',
            borderDownColor: '#ef5350',
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
          });
          candlestickSeriesRef.current = candlestickSeries;

          const volumeSeries = chart.addSeries(LWC.HistogramSeries, {
            priceFormat: {
              type: 'volume',
            },
            priceScaleId: 'volume',
          });
          volumeSeriesRef.current = volumeSeries;

          chart.priceScale('volume').applyOptions({
            scaleMargins: {
              top: 0.8,
              bottom: 0,
            },
          });

          const handleResize = () => {
            if (resizeTimeoutRef.current) {
              clearTimeout(resizeTimeoutRef.current);
            }
            
            resizeTimeoutRef.current = setTimeout(() => {
              requestAnimationFrame(() => {
                if (chartContainerRef.current && chartRef.current) {
                  try {
                    chartRef.current.applyOptions({
                      width: chartContainerRef.current.clientWidth,
                      height: chartContainerRef.current.clientHeight,
                    });
                  } catch (error) {
                    // Suppress resize errors
                  }
                }
              });
            }, 100);
          };

          resizeObserver = new ResizeObserver(() => {
            try {
              handleResize();
            } catch (error) {
              // Suppress ResizeObserver errors
            }
          });
          
          if (chartContainerRef.current) {
            resizeObserver.observe(chartContainerRef.current);
          }

          setChartInitialized(true);
          if (onChartReady) {
            onChartReady(chart);
          }
        } catch (error) {
          console.error('Failed to initialize chart:', error);
          initializingRef.current = false;
        }
      })
      .catch((error) => {
        console.error('Failed to load lightweight-charts:', error);
        initializingRef.current = false;
      });

    return () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (chartRef.current) {
        try {
          chartRef.current.remove();
        } catch (e) {
          console.error('Error removing chart:', e);
        }
        chartRef.current = null;
      }
      initializingRef.current = false;
      setChartInitialized(false);
    };
  }, []);

  // Update chart price scale when currency changes
  useEffect(() => {
    if (!chartRef.current || !candlestickSeriesRef.current || !chartInitialized) return;

    try {
      candlestickSeriesRef.current.applyOptions({
        priceFormat: {
          type: 'price',
          precision: currency === 'JPY' ? 0 : 2,
          minMove: currency === 'JPY' ? 1 : 0.01,
        },
      });

      chartRef.current.priceScale('right').applyOptions({
        borderColor: '#2B2B43',
      });
    } catch (error) {
      console.error('Error updating chart currency:', error);
    }
  }, [currency, exchangeRates, chartInitialized]);

  // Fetch initial data
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      setKlineData([]);
      setCurrentPrice(null);
      setPreviousPrice(null);
      setPriceChangePercent(0);
      
      const data = await fetchKlines(chartState.symbol, chartState.interval, 500);
      
      if (isMounted && data.length > 0) {
        setKlineData(data);
        const latestKline = data[data.length - 1];
        setCurrentPrice(latestKline.close);
        setPreviousPrice(latestKline.close);
        setIsLoading(false);
      } else if (isMounted) {
        setIsLoading(false);
      }
    }

    currentSymbolRef.current = chartState.symbol;
    currentIntervalRef.current = chartState.interval;

    loadData();

    return () => {
      isMounted = false;
    };
  }, [chartState.symbol, chartState.interval]);

  // Update chart data with currency conversion
  useEffect(() => {
    if (!candlestickSeriesRef.current || !volumeSeriesRef.current || klineData.length === 0 || !chartInitialized) return;

    const rate = exchangeRates[currency] || 1;

    try {
      // Filter and validate candlestick data
      const candleData = klineData
        .filter((k) => {
          // Ensure all OHLC values are valid numbers
          return (
            k &&
            typeof k.time === 'number' &&
            typeof k.open === 'number' &&
            typeof k.high === 'number' &&
            typeof k.low === 'number' &&
            typeof k.close === 'number' &&
            !isNaN(k.open) &&
            !isNaN(k.high) &&
            !isNaN(k.low) &&
            !isNaN(k.close) &&
            k.open > 0 &&
            k.high > 0 &&
            k.low > 0 &&
            k.close > 0
          );
        })
        .map((k) => ({
          time: k.time,
          open: k.open * rate,
          high: k.high * rate,
          low: k.low * rate,
          close: k.close * rate,
        }));

      // Only update if we have valid data
      if (candleData.length === 0) {
        console.warn('No valid candlestick data to display');
        return;
      }

      const volumeData = klineData
        .filter((k) => k && typeof k.volume === 'number' && !isNaN(k.volume))
        .map((k) => ({
          time: k.time,
          value: k.volume,
          color: k.close >= k.open ? '#26a69a40' : '#ef535040',
        }));

      candlestickSeriesRef.current.setData(candleData);
      
      if (chartState.indicators.volume?.visible) {
        volumeSeriesRef.current.setData(volumeData);
      } else {
        volumeSeriesRef.current.setData([]);
      }

      if (chartRef.current && chartRef.current.timeScale) {
        try {
          chartRef.current.timeScale().fitContent();
        } catch (e) {
          // Ignore fit content errors
        }
      }
    } catch (error) {
      console.error('Error updating chart data:', error);
    }
  }, [klineData, chartState.indicators.volume?.visible, chartInitialized, currency, exchangeRates]);

  // Update EMA20 indicator
  useEffect(() => {
    if (!chartRef.current || klineData.length === 0 || !chartInitialized) return;

    const rate = exchangeRates[currency] || 1;

    import('lightweight-charts').then((LWC) => {
      try {
        if (ema20SeriesRef.current) {
          chartRef.current.removeSeries(ema20SeriesRef.current);
          ema20SeriesRef.current = null;
        }

        if (chartState.indicators.ema20?.visible) {
          const ema20Data = calculateEMA(klineData, 20);
          const series = chartRef.current.addSeries(LWC.LineSeries, {
            color: '#2196F3',
            lineWidth: 2,
            title: 'EMA20',
          });
          
          const validData = ema20Data
            .filter((d) => d.value !== null)
            .map((d) => ({ time: d.time, value: d.value! * rate }));
          
          series.setData(validData);
          ema20SeriesRef.current = series;
        }
      } catch (error) {
        console.error('Error updating EMA20:', error);
      }
    });
  }, [klineData, chartState.indicators.ema20, chartInitialized, currency, exchangeRates]);

  // Update EMA50 indicator
  useEffect(() => {
    if (!chartRef.current || klineData.length === 0 || !chartInitialized) return;

    const rate = exchangeRates[currency] || 1;

    import('lightweight-charts').then((LWC) => {
      try {
        if (ema50SeriesRef.current) {
          chartRef.current.removeSeries(ema50SeriesRef.current);
          ema50SeriesRef.current = null;
        }

        if (chartState.indicators.ema50?.visible) {
          const ema50Data = calculateEMA(klineData, 50);
          const series = chartRef.current.addSeries(LWC.LineSeries, {
            color: '#FF6D00',
            lineWidth: 2,
            title: 'EMA50',
          });
          
          const validData = ema50Data
            .filter((d) => d.value !== null)
            .map((d) => ({ time: d.time, value: d.value! * rate }));
          
          series.setData(validData);
          ema50SeriesRef.current = series;
        }
      } catch (error) {
        console.error('Error updating EMA50:', error);
      }
    });
  }, [klineData, chartState.indicators.ema50, chartInitialized, currency, exchangeRates]);

  // Update RSI indicator
  useEffect(() => {
    if (!chartRef.current || klineData.length === 0 || !chartInitialized) return;

    import('lightweight-charts').then((LWC) => {
      try {
        if (rsiSeriesRef.current) {
          chartRef.current.removeSeries(rsiSeriesRef.current);
          rsiSeriesRef.current = null;
        }

        if (chartState.indicators.rsi?.visible) {
          const rsiData = calculateRSI(klineData, 14);
          const series = chartRef.current.addSeries(LWC.LineSeries, {
            color: '#9C27B0',
            lineWidth: 2,
            priceScaleId: 'rsi',
            title: 'RSI',
          });
          
          const validData = rsiData
            .filter((d) => d.value !== null)
            .map((d) => ({ time: d.time, value: d.value! }));
          
          series.setData(validData);
          rsiSeriesRef.current = series;

          chartRef.current.priceScale('rsi').applyOptions({
            scaleMargins: {
              top: 0.85,
              bottom: 0,
            },
          });
        }
      } catch (error) {
        console.error('Error updating RSI:', error);
      }
    });
  }, [klineData, chartState.indicators.rsi, chartInitialized]);

  // Analyze scalping setup
  useEffect(() => {
    if (klineData.length < 50) return;

    const ema20Data = calculateEMA(klineData, 20);
    const ema50Data = calculateEMA(klineData, 50);
    const rsiData = calculateRSI(klineData, 14);

    const latestEMA20 = ema20Data[ema20Data.length - 1]?.value;
    const latestEMA50 = ema50Data[ema50Data.length - 1]?.value;
    const latestRSI = rsiData[rsiData.length - 1]?.value;

    const signal = analyzeScalpingSetup(
      klineData,
      latestEMA20,
      latestEMA50,
      latestRSI,
      chartState.interval
    );

    setScalpingSignal(signal);
  }, [klineData, chartState.interval]);

  // WebSocket real-time updates
  useEffect(() => {
    if (!chartInitialized || !liveUpdatesEnabled) return;

    const unsubscribe = wsPool.subscribe(
      chartState.symbol,
      chartState.interval,
      (newKline) => {
        if (currentSymbolRef.current !== chartState.symbol || currentIntervalRef.current !== chartState.interval) {
          return;
        }

        // Validate newKline data before using it
        if (
          !newKline ||
          typeof newKline.time !== 'number' ||
          typeof newKline.open !== 'number' ||
          typeof newKline.high !== 'number' ||
          typeof newKline.low !== 'number' ||
          typeof newKline.close !== 'number' ||
          typeof newKline.volume !== 'number' ||
          isNaN(newKline.open) ||
          isNaN(newKline.high) ||
          isNaN(newKline.low) ||
          isNaN(newKline.close) ||
          isNaN(newKline.volume) ||
          newKline.open <= 0 ||
          newKline.high <= 0 ||
          newKline.low <= 0 ||
          newKline.close <= 0
        ) {
          console.warn(`[Chart ${chartState.id}] Invalid kline data from WebSocket:`, newKline);
          return;
        }

        if (candlestickSeriesRef.current && volumeSeriesRef.current) {
          try {
            const store = useDashboardStore.getState();
            const rate = store.exchangeRates[store.currency] || 1;
            
            candlestickSeriesRef.current.update({
              time: newKline.time,
              open: newKline.open * rate,
              high: newKline.high * rate,
              low: newKline.low * rate,
              close: newKline.close * rate,
            });

            if (chartState.indicators.volume?.visible) {
              volumeSeriesRef.current.update({
                time: newKline.time,
                value: newKline.volume,
                color: newKline.close >= newKline.open ? '#26a69a40' : '#ef535040',
              });
            }

            setCurrentPrice((prevCurrent) => {
              setPreviousPrice(prevCurrent);
              return newKline.close;
            });
            
            setKlineData((prev) => {
              if (prev.length > 0) {
                const firstPrice = prev[0].open;
                const changePercent = ((newKline.close - firstPrice) / firstPrice) * 100;
                setPriceChangePercent(changePercent);
              }
              
              const lastTime = prev[prev.length - 1]?.time;
              if (lastTime === newKline.time) {
                return [...prev.slice(0, -1), newKline];
              } else {
                return [...prev, newKline];
              }
            });
          } catch (error) {
            console.error(`[Chart ${chartState.id}] Error updating chart from WebSocket:`, error);
          }
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [chartState.symbol, chartState.interval, chartState.indicators.volume?.visible, chartInitialized, liveUpdatesEnabled]);

  const handleChartClick = () => {
    setSelectedChart(chartState.id);
  };

  const toggleLiveUpdates = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiveUpdatesEnabled(prev => !prev);
  };

  const isSelected = selectedChart === chartState.id;
  
  const rate = exchangeRates[currency] || 1;
  const convertedPrice = currentPrice ? currentPrice * rate : null;
  const isPriceUp = currentPrice && previousPrice ? currentPrice > previousPrice : false;
  const isPriceDown = currentPrice && previousPrice ? currentPrice < previousPrice : false;

  const currencySymbols: Record<string, string> = {
    USD: '$',
    INR: '₹',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
  };

  const currencySymbol = currencySymbols[currency] || '$';
  const precision = currency === 'JPY' ? 0 : 2;

  return (
    <div 
      className="relative h-full w-full flex flex-col cursor-pointer transition-all duration-200 bg-[#1e222d] rounded-lg overflow-hidden"
      onClick={handleChartClick}
      style={{
        border: isSelected ? '2px solid #2962FF' : '2px solid #2b2b43',
      }}
    >
      {/* Chart header */}
      <div className="flex-shrink-0 px-3 py-2 flex items-center justify-between bg-[#1e222d] border-b border-[#2b2b43]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold text-sm">{chartState.symbol}</span>
            <span className="text-gray-400 text-xs">{chartState.interval}</span>
          </div>
          
          {convertedPrice && (
            <div className="flex items-center gap-2 px-2 py-0.5 bg-[#2a2e39] rounded border border-[#2b2b43]">
              <div className="flex items-center gap-1">
                <span className={`text-sm font-bold ${
                  isPriceUp ? 'text-green-400' : isPriceDown ? 'text-red-400' : 'text-white'
                }`}>
                  {currencySymbol}{convertedPrice.toLocaleString(currency === 'INR' ? 'en-IN' : 'en-US', { 
                    minimumFractionDigits: precision, 
                    maximumFractionDigits: precision 
                  })}
                </span>
                {isPriceUp && <TrendingUp className="w-3 h-3 text-green-400" />}
                {isPriceDown && <TrendingDown className="w-3 h-3 text-red-400" />}
              </div>
              <div className={`text-xs font-medium ${
                priceChangePercent >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%
              </div>
            </div>
          )}
          
          {(isLoading || !chartInitialized) && (
            <span className="text-gray-400 text-xs animate-pulse">Loading...</span>
          )}
        </div>
        
        <button
          onClick={toggleLiveUpdates}
          className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-all duration-200 ${
            liveUpdatesEnabled
              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
              : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
          }`}
          title={liveUpdatesEnabled ? 'Live updates enabled' : 'Live updates disabled'}
        >
          {liveUpdatesEnabled ? (
            <Activity className="w-3.5 h-3.5 animate-pulse" />
          ) : (
            <ActivitySquare className="w-3.5 h-3.5" />
          )}
          <span>{liveUpdatesEnabled ? 'LIVE' : 'PAUSED'}</span>
        </button>
      </div>

      {/* Chart and Scalping Panel Container */}
      <div className="flex-1 flex gap-2 p-2 overflow-hidden">
        {/* Chart container */}
        <div ref={chartContainerRef} className={scalpingMode ? "flex-1" : "w-full h-full"} />
        
        {/* Scalping Panel - only show in scalping mode */}
        {scalpingMode && (
          <div className="w-80 overflow-y-auto">
            <ScalpingPanel 
              signal={scalpingSignal} 
              currency={currency}
              exchangeRate={rate}
            />
          </div>
        )}
      </div>
    </div>
  );
}