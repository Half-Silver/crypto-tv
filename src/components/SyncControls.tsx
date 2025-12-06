'use client';

import { useDashboardStore } from '@/lib/store';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Link2, Clock, Crosshair, Activity } from 'lucide-react';

export default function SyncControls() {
  const { syncMode, setSyncMode } = useDashboardStore();

  return (
    <div className="h-10 bg-[#1E222D] border-t border-[#2B2B43] flex items-center px-4 gap-6">
      <span className="text-xs text-gray-400 font-medium">Sync Mode:</span>

      <div className="flex items-center gap-2">
        <Switch
          id="sync-symbol"
          checked={syncMode.symbol}
          onCheckedChange={(checked) => setSyncMode({ symbol: checked })}
          className="data-[state=checked]:bg-[#2962FF]"
        />
        <Label
          htmlFor="sync-symbol"
          className="text-xs text-gray-300 cursor-pointer flex items-center gap-1"
        >
          <Link2 className="w-3 h-3" />
          Symbol
        </Label>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="sync-interval"
          checked={syncMode.interval}
          onCheckedChange={(checked) => setSyncMode({ interval: checked })}
          className="data-[state=checked]:bg-[#2962FF]"
        />
        <Label
          htmlFor="sync-interval"
          className="text-xs text-gray-300 cursor-pointer flex items-center gap-1"
        >
          <Clock className="w-3 h-3" />
          Interval
        </Label>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="sync-time"
          checked={syncMode.time}
          onCheckedChange={(checked) => setSyncMode({ time: checked })}
          className="data-[state=checked]:bg-[#2962FF]"
        />
        <Label
          htmlFor="sync-time"
          className="text-xs text-gray-300 cursor-pointer flex items-center gap-1"
        >
          <Activity className="w-3 h-3" />
          Time
        </Label>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="sync-crosshair"
          checked={syncMode.crosshair}
          onCheckedChange={(checked) => setSyncMode({ crosshair: checked })}
          className="data-[state=checked]:bg-[#2962FF]"
        />
        <Label
          htmlFor="sync-crosshair"
          className="text-xs text-gray-300 cursor-pointer flex items-center gap-1"
        >
          <Crosshair className="w-3 h-3" />
          Crosshair
        </Label>
      </div>
    </div>
  );
}
