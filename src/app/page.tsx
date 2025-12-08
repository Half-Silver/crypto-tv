'use client';

import { useState } from 'react';
import { useDashboardStore } from '@/lib/store';
import TradingChart from '@/components/TradingChart';
import Toolbar from '@/components/Toolbar';
import Watchlist from '@/components/Watchlist';
import LayoutSelector from '@/components/LayoutSelector';
import SyncControls from '@/components/SyncControls';

export default function Home() {
  const [layoutModalOpen, setLayoutModalOpen] = useState(false);
  const { charts, layout } = useDashboardStore();

  return (
    <div className="flex flex-col h-screen bg-[#131722] overflow-hidden">
      {/* Toolbar */}
      <Toolbar onLayoutClick={() => setLayoutModalOpen(true)} />

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Watchlist sidebar */}
        <Watchlist />

        {/* Chart grid */}
        <div className="flex-1 p-2 overflow-hidden flex flex-col">
          <div
            className="w-full flex-1 gap-2"
            style={{
              display: 'grid',
              gridTemplateRows: `repeat(${layout.rows}, 1fr)`,
              gridTemplateColumns: `repeat(${layout.cols}, 1fr)`,
            }}
          >
            {charts.slice(0, layout.cells).map((chartState) => (
              <div 
                key={chartState.id} 
                className="min-h-0 rounded-lg overflow-hidden"
              >
                <TradingChart chartState={chartState} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sync controls footer */}
      <SyncControls />

      {/* Layout selector modal */}
      <LayoutSelector open={layoutModalOpen} onOpenChange={setLayoutModalOpen} />
    </div>
  );
}