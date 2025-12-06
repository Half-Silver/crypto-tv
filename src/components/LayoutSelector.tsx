'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { useDashboardStore, DEFAULT_LAYOUTS } from '@/lib/store';
import { Check } from 'lucide-react';

interface LayoutSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function LayoutSelector({ open, onOpenChange }: LayoutSelectorProps) {
  const { layout, setLayout } = useDashboardStore();

  const handleLayoutSelect = (selectedLayout: typeof DEFAULT_LAYOUTS[number]) => {
    setLayout(selectedLayout);
    onOpenChange(false);
  };

  const renderLayoutGrid = (rows: number, cols: number) => {
    return (
      <div
        className="w-full aspect-square bg-[#2A2E39] rounded p-1"
        style={{
          display: 'grid',
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: '2px',
        }}
      >
        {Array.from({ length: rows * cols }).map((_, i) => (
          <div key={i} className="bg-[#1E222D] rounded" />
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1E222D] border-[#2B2B43] text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white">Select Layout</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 py-4">
          {DEFAULT_LAYOUTS.map((layoutOption) => (
            <button
              key={layoutOption.id}
              onClick={() => handleLayoutSelect(layoutOption)}
              className={`relative p-4 rounded-lg border-2 transition-all hover:border-[#2962FF] ${
                layout.id === layoutOption.id
                  ? 'border-[#2962FF] bg-[#2962FF]/10'
                  : 'border-[#2B2B43] bg-[#2A2E39]/50'
              }`}
            >
              {layout.id === layoutOption.id && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-[#2962FF] rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
              
              <div className="mb-3">
                {renderLayoutGrid(layoutOption.rows, layoutOption.cols)}
              </div>
              
              <div className="text-center">
                <div className="text-sm font-semibold text-white mb-1">
                  {layoutOption.name}
                </div>
                <div className="text-xs text-gray-400">
                  {layoutOption.cells} {layoutOption.cells === 1 ? 'chart' : 'charts'}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="pt-4 border-t border-[#2B2B43]">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-[#2962FF]" />
              <span>Current layout</span>
            </div>
            <span className="mx-2">•</span>
            <span>Click any layout to switch</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
