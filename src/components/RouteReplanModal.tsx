import React from 'react';
import { 
  X, 
  RefreshCw, 
  Check, 
  AlertTriangle, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  Route 
} from 'lucide-react';
import { Drone, Waypoint } from '../types/fleet';

interface RouteReplanModalProps {
  drone: Drone;
  proposedRoute: Waypoint[];
  addedDistanceKm: number;
  addedDelayMinutes: number;
  onAccept: () => void;
  onReject: () => void;
}

export const RouteReplanModal: React.FC<RouteReplanModalProps> = ({
  drone,
  proposedRoute,
  addedDistanceKm,
  addedDelayMinutes,
  onAccept,
  onReject,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm select-none p-4">
      <div className="w-full max-w-lg bg-[#0e1422] border border-cyan-500/70 rounded-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 bg-[#131c2e] border-b border-[#223352] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin-slow" />
            <span className="font-bold font-mono text-sm tracking-wider text-white uppercase">
              SMART ROUTE REPLANNING • {drone.callsign}
            </span>
          </div>
          <button
            onClick={onReject}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          <div className="p-3 rounded-md bg-amber-950/30 border border-amber-600/50 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs font-mono text-amber-200">
              <div className="font-bold text-amber-300 mb-0.5">RESTRICTED ZONE CONFLICT DETECTED</div>
              Current planned flight trajectory intersects Sector 4 Restricted Airspace buffer. An automated clearance detour around the western corridor has been generated.
            </div>
          </div>

          {/* Diff Metrics */}
          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div className="p-3 bg-[#131929] border border-[#212f4d] rounded-md">
              <div className="text-slate-400 text-[11px] mb-1">ADDITIONAL DISTANCE</div>
              <div className="text-lg font-extrabold text-cyan-400">
                +{addedDistanceKm.toFixed(2)} km
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">West Bypass Corridor</div>
            </div>

            <div className="p-3 bg-[#131929] border border-[#212f4d] rounded-md">
              <div className="text-slate-400 text-[11px] mb-1">ESTIMATED FLIGHT DELAY</div>
              <div className="text-lg font-extrabold text-amber-400">
                +{addedDelayMinutes.toFixed(1)} min
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Sufficient battery reserve: 64%</div>
            </div>
          </div>

          {/* Waypoint Sequence Preview */}
          <div className="p-3 bg-[#101626] border border-[#1d2b45] rounded-md">
            <div className="text-[11px] font-mono font-bold text-slate-300 uppercase mb-2 flex items-center justify-between">
              <span>Proposed Waypoint Chain ({proposedRoute.length} WPs)</span>
              <span className="text-[10px] text-emerald-400 font-bold">100% CLEAR OF SECTOR 4</span>
            </div>

            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 text-xs font-mono">
              {proposedRoute.map((wp, idx) => (
                <div
                  key={wp.id}
                  className="flex items-center justify-between py-1 px-2 rounded bg-[#151d2e] border border-[#23334f]"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-[10px] font-bold text-cyan-400">0{idx + 1}.</span>
                    <span className="text-slate-200 truncate">{wp.name}</span>
                  </div>
                  <span className="text-slate-400 shrink-0 text-[11px]">{wp.altitudeMeters}m AGL</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="px-4 py-3 bg-[#131c2e] border-t border-[#223352] flex items-center justify-end gap-3 font-mono text-xs">
          <button
            onClick={onReject}
            className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors"
          >
            DISCARD PROPOSAL
          </button>
          <button
            onClick={onAccept}
            className="px-5 py-2 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold transition-all shadow-[0_0_15px_rgba(6,182,212,0.5)] flex items-center gap-2"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>ACCEPT & UPLOAD ROUTE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
