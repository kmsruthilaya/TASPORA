import React from 'react';
import { 
  FileText, 
  Battery, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Radio, 
  Plane, 
  ShieldAlert,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { Drone, FlightLogEntry } from '../types/fleet';

interface BottomOverviewPanelProps {
  drones: Drone[];
  flightLogs: FlightLogEntry[];
  onSelectDrone: (id: string) => void;
}

export const BottomOverviewPanel: React.FC<BottomOverviewPanelProps> = ({
  drones,
  flightLogs,
  onSelectDrone,
}) => {
  return (
    <div className="h-44 bg-[#0a0e17] border-t border-[#1f2a40] grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-[#1f2a40] select-none shrink-0 overflow-hidden">
      {/* 1. FLIGHT LOG (Live) - Exactly matches screenshot */}
      <div className="md:col-span-5 p-2.5 flex flex-col h-full overflow-hidden bg-[#0c101a]">
        <div className="flex items-center justify-between mb-1.5 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span className="text-[11px] font-bold font-mono tracking-wider text-slate-200 uppercase">
              FLIGHT LOG (Live)
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">AUTO-SCROLL ON</span>
        </div>

        {/* Scrollable event list */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 font-mono text-[11px]">
          {flightLogs.slice(0, 8).map((log) => {
            let tagColor = 'text-cyan-400';
            if (log.type === 'critical') tagColor = 'text-rose-400 font-bold';
            else if (log.type === 'warning') tagColor = 'text-amber-400 font-bold';
            else if (log.type === 'success') tagColor = 'text-emerald-400';

            return (
              <div
                key={log.id}
                onClick={() => onSelectDrone(log.droneId)}
                className="flex items-start gap-2 py-0.5 px-1.5 rounded hover:bg-slate-800/50 cursor-pointer transition-colors leading-tight"
              >
                <span className="text-slate-500 shrink-0 text-[10px]">{log.timestamp}</span>
                <span className={`shrink-0 font-bold ${tagColor}`}>
                  {log.droneCallsign}
                </span>
                <span className="text-slate-300 truncate">
                  {log.event}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. BATTERY STATUS - Exactly matches screenshot */}
      <div className="md:col-span-4 p-2.5 flex flex-col h-full overflow-hidden bg-[#0c101a]">
        <div className="flex items-center justify-between mb-1.5 shrink-0">
          <div className="flex items-center gap-1.5 text-slate-200">
            <Battery className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-bold font-mono tracking-wider uppercase">
              BATTERY STATUS
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">FLEET CELLS</span>
        </div>

        {/* Grid of Battery Gauges */}
        <div className="grid grid-cols-4 gap-2 flex-1 items-center">
          {drones.slice(0, 4).map((drone) => {
            const bat = Math.round(drone.vitals.batteryPercentage);
            let barBg = 'bg-emerald-500';
            let textColor = 'text-emerald-400';

            if (bat < 30) {
              barBg = 'bg-rose-500';
              textColor = 'text-rose-400';
            } else if (bat < 55) {
              barBg = 'bg-amber-500';
              textColor = 'text-amber-400';
            }

            return (
              <div
                key={drone.id}
                onClick={() => onSelectDrone(drone.id)}
                className="bg-[#121827] border border-[#1f2c45] p-2 rounded flex flex-col justify-between h-full cursor-pointer hover:border-cyan-500 transition-all"
              >
                <div className="text-[10px] font-mono font-bold text-slate-400 truncate">
                  {drone.callsign}
                </div>

                <div className={`text-base font-extrabold font-mono ${textColor}`}>
                  {bat}%
                </div>

                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full ${barBg}`} style={{ width: `${bat}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. MISSION HANDOFFS - Exactly matches screenshot */}
      <div className="md:col-span-3 p-2.5 flex flex-col h-full overflow-hidden bg-[#0c101a]">
        <div className="flex items-center justify-between mb-1.5 shrink-0">
          <div className="flex items-center gap-1.5 text-slate-200">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] font-bold font-mono tracking-wider uppercase">
              MISSION HANDOFFS
            </span>
          </div>
          <span className="text-[10px] font-mono text-cyan-400 font-bold">ACTIVE</span>
        </div>

        {/* Handoff Pipeline Progression nodes */}
        <div className="flex-1 flex items-center justify-between px-1">
          {/* Node 1: Drone 01 */}
          <div 
            onClick={() => onSelectDrone('AV-01')}
            className="flex flex-col items-center cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-400 flex items-center justify-center text-cyan-300 text-xs font-mono font-bold group-hover:scale-105 transition-transform shadow-[0_0_8px_rgba(6,182,212,0.3)]">
              ✈
            </div>
            <div className="text-[10px] font-bold font-mono text-slate-300 mt-1">DRONE 01</div>
            <div className="text-[9px] font-mono text-cyan-400">Handoff 10s</div>
          </div>

          {/* Connection arrow 1 */}
          <div className="flex-1 h-0.5 border-b-2 border-dashed border-cyan-500/50 mx-2 relative">
            <ArrowRight className="w-3 h-3 text-cyan-400 absolute right-0 -top-1.5" />
          </div>

          {/* Node 2: Drone 02 */}
          <div 
            onClick={() => onSelectDrone('AV-02')}
            className="flex flex-col items-center cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-400 flex items-center justify-center text-emerald-300 text-xs font-mono font-bold group-hover:scale-105 transition-transform shadow-[0_0_8px_rgba(16,185,129,0.3)]">
              ⟳
            </div>
            <div className="text-[10px] font-bold font-mono text-slate-300 mt-1">DRONE 02</div>
            <div className="text-[9px] font-mono text-emerald-400">Active Sync</div>
          </div>

          {/* Connection arrow 2 */}
          <div className="flex-1 h-0.5 border-b-2 border-dashed border-slate-600 mx-2 relative">
            <ArrowRight className="w-3 h-3 text-slate-500 absolute right-0 -top-1.5" />
          </div>

          {/* Node 3: Drone 04 */}
          <div 
            onClick={() => onSelectDrone('AV-04')}
            className="flex flex-col items-center cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-600 flex items-center justify-center text-slate-300 text-xs font-mono font-bold group-hover:scale-105 transition-transform">
              🎯
            </div>
            <div className="text-[10px] font-bold font-mono text-slate-300 mt-1">DRONE 04</div>
            <div className="text-[9px] font-mono text-slate-400">Next WP 3m</div>
          </div>
        </div>
      </div>
    </div>
  );
};
