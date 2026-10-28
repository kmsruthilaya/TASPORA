import React from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Info, 
  Radio, 
  ChevronDown, 
  Check, 
  BellRing,
  Radar,
  ArrowRight
} from 'lucide-react';
import { AirspaceAlert, AirspaceConflict } from '../types/fleet';

interface RightSidebarProps {
  alerts: AirspaceAlert[];
  conflicts: AirspaceConflict[];
  onAcknowledgeAll: () => void;
  onAcknowledgeAlert: (id: string) => void;
  onSelectDrone: (id: string) => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  alerts,
  conflicts,
  onAcknowledgeAll,
  onAcknowledgeAlert,
  onSelectDrone,
}) => {
  const unacknowledgedCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <aside className="w-[280px] lg:w-[300px] bg-[#0c101a] border-l border-[#1f2a40] flex flex-col h-full shrink-0 select-none overflow-hidden">
      {/* 1. ALERTS PANEL - Exactly matches reference screenshot */}
      <div className="p-3 border-b border-[#1f2a40] bg-[#101522] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />
          <span className="text-xs font-bold font-mono tracking-wider text-slate-100 uppercase">
            ALERTS ({unacknowledgedCount})
          </span>
        </div>

        <button 
          onClick={onAcknowledgeAll}
          className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          Acknowledge All
        </button>
      </div>

      {/* Alerts List */}
      <div className="p-2 space-y-2 overflow-y-auto max-h-[42%] border-b border-[#1f2a40]">
        {alerts.map((alert) => {
          let icon = <Info className="w-4 h-4 text-blue-400" />;
          let borderStyle = 'border-blue-900/60 bg-blue-950/20';

          if (alert.severity === 'critical') {
            icon = <ShieldAlert className="w-4 h-4 text-rose-500" />;
            borderStyle = 'border-rose-900/60 bg-rose-950/30';
          } else if (alert.severity === 'warning') {
            icon = <AlertTriangle className="w-4 h-4 text-amber-400" />;
            borderStyle = 'border-amber-900/60 bg-amber-950/20';
          }

          return (
            <div
              key={alert.id}
              onClick={() => alert.droneId && onSelectDrone(alert.droneId)}
              className={`p-2 rounded border ${borderStyle} transition-all cursor-pointer hover:border-slate-500 ${
                alert.acknowledged ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start gap-2">
                <div className="mt-0.5 shrink-0">{icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-200 truncate font-mono">
                      {alert.title}
                    </span>
                    <span className="text-[9px] font-mono text-slate-500">{alert.timestamp}</span>
                  </div>

                  <p className="text-[10px] text-slate-300 mt-0.5 leading-snug">
                    {alert.description}
                  </p>

                  {!alert.acknowledged && (
                    <div className="mt-1.5 flex justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAcknowledgeAlert(alert.id);
                        }}
                        className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1"
                      >
                        <Check className="w-3 h-3 text-cyan-400" />
                        <span>ACK</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {alerts.length === 0 && (
          <div className="p-4 text-center text-slate-500 text-xs font-mono">
            No active alerts in airspace.
          </div>
        )}
      </div>

      {/* 2. AIRSPACE SEPARATION RADAR - Innovation Feature */}
      <div className="p-2.5 bg-[#0e1320] border-b border-[#1f2a40] shrink-0">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400 uppercase">
            <Radar className="w-3.5 h-3.5 animate-spin-slow" />
            <span>Airspace Separation</span>
          </div>
          <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-800">
            AUTO-SCAN
          </span>
        </div>

        {conflicts.length > 0 ? (
          <div className="bg-rose-950/40 border border-rose-600/70 p-2 rounded text-[10px] font-mono text-rose-200">
            <div className="font-bold flex items-center justify-between text-rose-300 mb-1">
              <span>TRAJECTORY CONFLICT</span>
              <span>{conflicts[0].estimatedTimeToConflictSec}s to CPA</span>
            </div>
            <div>
              Separation: <span className="font-bold text-white">{conflicts[0].distanceMeters}m</span> (Min 250m req)
            </div>
            <div className="mt-1 text-[9px] text-rose-400">
              Advisory: {conflicts[0].suggestedAction}
            </div>
          </div>
        ) : (
          <div className="bg-[#131929] border border-[#212f4d] p-2 rounded text-[10px] font-mono text-slate-300 flex items-center justify-between">
            <span>Airspace Deconfliction</span>
            <span className="text-emerald-400 font-bold">CLEAR (&gt; 350m)</span>
          </div>
        )}
      </div>

      {/* 3. MISSION STATUS - Exactly matches reference screenshot */}
      <div className="flex-1 p-3 flex flex-col justify-between overflow-y-auto bg-[#0a0e17]">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold font-mono tracking-wider text-slate-100 uppercase">
              MISSION STATUS
            </span>
            <span className="text-[10px] font-mono text-slate-500">4 ACTIVE</span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            {/* Event Coverage */}
            <div className="p-2 rounded bg-[#111726] border border-[#1f2b44] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="text-white font-bold text-[11px]">Event Coverage</div>
                  <div className="text-[9px] text-emerald-400">In Progress (DRONE 01)</div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-400">94%</span>
            </div>

            {/* Perimeter Scan */}
            <div className="p-2 rounded bg-[#111726] border border-[#1f2b44] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="text-white font-bold text-[11px]">Perimeter Scan</div>
                  <div className="text-[9px] text-emerald-400">In Progress (DRONE 02)</div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-400">81%</span>
            </div>

            {/* Medical Urgent Delivery */}
            <div className="p-2 rounded bg-[#111726] border border-[#1f2b44] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="text-white font-bold text-[11px]">Medical Delivery</div>
                  <div className="text-[9px] text-cyan-400">In Progress (DRONE 04)</div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-400">72%</span>
            </div>

            {/* Return to Base */}
            <div className="p-2 rounded bg-[#111726] border border-[#1f2b44] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="text-white font-bold text-[11px]">Return-to-Base</div>
                  <div className="text-[9px] text-amber-400">Returning (DRONE 03)</div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-amber-400 font-bold">49%</span>
            </div>
          </div>
        </div>

        {/* Dispatcher Notice */}
        <div className="mt-2 p-2 rounded bg-[#0f1422] border border-[#1b253b] text-[10px] font-mono text-slate-400">
          <div className="text-slate-300 font-bold mb-0.5">BVLOS CERTIFICATION</div>
          CASA Instrument EX-2026. Automated collision avoidance advisory active.
        </div>
      </div>
    </aside>
  );
};
