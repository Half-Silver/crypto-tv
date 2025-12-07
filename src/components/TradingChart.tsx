'use client';

import { useEffect, useRef, useState } from 'react';
import type { ChartState, Kline } from '@/lib/types';
import { fetchKlines, wsPool } from '@/lib/binance-api';
import { calculateSMA, calculateEMA } from '@/lib/indicators';
import { useDashboardStore } from '@/lib/store';
import { Activity, ActivitySquare, TrendingUp, TrendingDown } from 'lucide-react';

interface TradingChartProps {
  chartState: ChartState;
  onChartReady?: (chart: any) => void;
}

export default function TradingChart({ chartState, onChartReady }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const candlestickSeriesRef = useRef<any>(null);
  const volumeSeriesRef = useRef<any>(null);
  const smaSeriesRef = useRef<any>(null);
  const emaSeriesRef = useRef<any>(null);
  const [klineData, setKlineData] = useState<Kline[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const initializingRef = useRef(false);
  const [chartInitialized, setChartInitialized] = useState(false);
  const { setSelectedChart, selectedChart } = useDashboardStore();
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [liveUpdatesEnabled, setLiveUpdatesEnabled] = useState(true);
  
  // Live price state
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [previousPrice, setPreviousPrice] = useState<number | null>(null);
  const [usdToInr, setUsdToInr] = useState<number>(83.5); // Default INR rate
  const [priceChangePercent, setPriceChangePercent] = useState<number>(0);

  // Fetch USD to INR exchange rate
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        if (data.rates?.INR) {
          setUsdToInr(data.rates.INR);
        }
      } catch (error) {
        console.error('Failed to fetch exchange rate, using default:', error);
      }
    };

    fetchExchangeRate();
    // Refresh exchange rate every hour
    const interval = setInterval(fetchExchangeRate, 3600000);
    return () => clearInterval(interval);
  }, []);

  // Initialize chart with v5 API
  useEffect(() => {
    if (!chartContainerRef.current || initializingRef.current || chartInitialized) return;

    initializingRef.current = true;
    let chart: any = null;
    let resizeObserver: ResizeObserver | null = null;

    // Dynamic import of lightweight-charts v5
    import('lightweight-charts')
      .then((LWC) => {
        if (!chartContainerRef.current) return;

        try {
          // Create chart using v5 API
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
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight,
          });

          chartRef.current = chart;

          // Create candlestick series using v5 API
          const candlestickSeries = chart.addSeries(LWC.CandlestickSeries, {
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderUpColor: '#26a69a',
            borderDownColor: '#ef5350',
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
          });
          candlestickSeriesRef.current = candlestickSeries;

          // Create volume series using v5 API
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

          // Debounced resize handler to prevent ResizeObserver errors
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

  // Fetch initial data
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      const data = await fetchKlines(chartState.symbol, chartState.interval, 500);
      
      if (isMounted && data.length > 0) {
        setKlineData(data);
        // Set initial price from latest kline
        const latestKline = data[data.length - 1];
        setCurrentPrice(latestKline.close);
        setPreviousPrice(latestKline.close);
        setIsLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [chartState.symbol, chartState.interval]);

  // Update chart data
  useEffect(() => {
    if (!candlestickSeriesRef.current || !volumeSeriesRef.current || klineData.length === 0 || !chartInitialized) return;

    try {
      const candleData = klineData.map((k) => ({
        time: k.time,
        open: k.open,
        high: k.high,
        low: k.low,
        close: k.close,
      }));

      const volumeData = klineData.map((k) => ({
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
    } catch (error) {
      console.error('Error updating chart data:', error);
    }
  }, [klineData, chartState.indicators.volume?.visible, chartInitialized]);

  // Update SMA indicator
  useEffect(() => {
    if (!chartRef.current || klineData.length === 0 || !chartInitialized) return;

    // Dynamic import for v5 API
    import('lightweight-charts').then((LWC) => {
      try {
        if (smaSeriesRef.current) {
          chartRef.current.removeSeries(smaSeriesRef.current);
          smaSeriesRef.current = null;
        }

        if (chartState.indicators.sma?.visible) {
          const smaData = calculateSMA(klineData, chartState.indicators.sma.period);
          const series = chartRef.current.addSeries(LWC.LineSeries, {
            color: '#2196F3',
            lineWidth: 2,
          });
          
          const validData = smaData
            .filter((d) => d.value !== null)
            .map((d) => ({ time: d.time, value: d.value! }));
          
          series.setData(validData);
          smaSeriesRef.current = series;
        }
      } catch (error) {
        console.error('Error updating SMA:', error);
      }
    });
  }, [klineData, chartState.indicators.sma, chartInitialized]);

  // Update EMA indicator
  useEffect(() => {
    if (!chartRef.current || klineData.length === 0 || !chartInitialized) return;

    // Dynamic import for v5 API
    import('lightweight-charts').then((LWC) => {
      try {
        if (emaSeriesRef.current) {
          chartRef.current.removeSeries(emaSeriesRef.current);
          emaSeriesRef.current = null;
        }

        if (chartState.indicators.ema?.visible) {
          const emaData = calculateEMA(klineData, chartState.indicators.ema.period);
          const series = chartRef.current.addSeries(LWC.LineSeries, {
            color: '#FF6D00',
            lineWidth: 2,
          });
          
          const validData = emaData
            .filter((d) => d.value !== null)
            .map((d) => ({ time: d.time, value: d.value! }));
          
          series.setData(validData);
          emaSeriesRef.current = series;
        }
      } catch (error) {
        console.error('Error updating EMA:', error);
      }
    });
  }, [klineData, chartState.indicators.ema, chartInitialized]);

  // WebSocket real-time updates
  useEffect(() => {
    if (!chartInitialized || !liveUpdatesEnabled) return;

    const unsubscribe = wsPool.subscribe(
      chartState.symbol,
      chartState.interval,
      (newKline) => {
        if (candlestickSeriesRef.current && volumeSeriesRef.current) {
          try {
            candlestickSeriesRef.current.update({
              time: newKline.time,
              open: newKline.open,
              high: newKline.high,
              low: newKline.low,
              close: newKline.close,
            });

            if (chartState.indicators.volume?.visible) {
              volumeSeriesRef.current.update({
                time: newKline.time,
                value: newKline.volume,
                color: newKline.close >= newKline.open ? '#26a69a40' : '#ef535040',
              });
            }

            // Update live price
            setPreviousPrice(currentPrice);
            setCurrentPrice(newKline.close);
            
            // Calculate 24h price change (approximate using first kline in current data)
            if (klineData.length > 0) {
              const firstPrice = klineData[0].open;
              const changePercent = ((newKline.close - firstPrice) / firstPrice) * 100;
              setPriceChangePercent(changePercent);
            }

            // Update klineData for indicator recalculation
            setKlineData((prev) => {
              const lastTime = prev[prev.length - 1]?.time;
              if (lastTime === newKline.time) {
                return [...prev.slice(0, -1), newKline];
              } else {
                return [...prev, newKline];
              }
            });
          } catch (error) {
            console.error('Error updating chart from WebSocket:', error);
          }
        }
      }
    );

    return unsubscribe;
  }, [chartState.symbol, chartState.interval, chartState.indicators.volume?.visible, chartInitialized, liveUpdatesEnabled, currentPrice, klineData]);

  const handleChartClick = () => {
    setSelectedChart(chartState.id);
  };

  const toggleLiveUpdates = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiveUpdatesEnabled(prev => !prev);
  };

  const isSelected = selectedChart === chartState.id;
  
  // Format price in INR
  const priceInINR = currentPrice ? currentPrice * usdToInr : null;
  const isPriceUp = currentPrice && previousPrice ? currentPrice > previousPrice : false;
  const isPriceDown = currentPrice && previousPrice ? currentPrice < previousPrice : false;

  return (
    <div 
      className="relative h-full w-full flex flex-col cursor-pointer transition-all duration-200"
      onClick={handleChartClick}
      style={{
        boxShadow: isSelected ? 'inset 0 0 0 2px #2962FF' : 'none',
      }}
    >
      {/* Chart header */}
      <div className="flex-shrink-0 px-3 py-2 flex items-center justify-between bg-[#1e222d] border-b border-[#2b2b43]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold text-sm">{chartState.symbol}</span>
            <span className="text-gray-400 text-xs">{chartState.interval}</span>
          </div>
          
          {/* Live Price in INR */}
          {priceInINR && (
            <div className="flex items-center gap-2 px-2 py-0.5 bg-[#2a2e39] rounded border border-[#2b2b43]">
              <div className="flex items-center gap-1">
                <span className={`text-sm font-bold ${
                  isPriceUp ? 'text-green-400' : isPriceDown ? 'text-red-400' : 'text-white'
                }`}>
                  ₹{priceInINR.toLocaleString('en-IN', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
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
        
        {/* Live updates toggle button */}
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

      {/* Chart container */}
      <div ref={chartContainerRef} className="flex-1 w-full" />
    </div>
  );
}