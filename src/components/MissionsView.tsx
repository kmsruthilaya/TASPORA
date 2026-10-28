import React from 'react';
import { 
  Package, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { Drone } from '../types/fleet';

interface MissionsViewProps {
  drones: Drone[];
  onSelectDroneAndSwitchToLive: (id: string) => void;
}

export const MissionsView: React.FC<MissionsViewProps> = ({
  drones,
  onSelectDroneAndSwitchToLive,
}) => {
  return (
    <div className="flex-1 bg-[#090d15] p-6 overflow-y-auto select-none font-mono">
      {/* Top Banner */}
      <div className="pb-6 border-b border-[#1f2b45] flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-extrabold text-white tracking-wider">DELIVERY MISSION OPERATIONS</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time Autonomous BVLOS Cargo & Medical Dispatch Manifests
          </p>
        </div>
      </div>

      {/* Grid of Missions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {drones.map((drone) => {
          const del = drone.delivery;
          if (!del) return null;

          return (
            <div
              key={del.missionId}
              className="bg-[#0f1422] border border-[#1f2a40] rounded-lg p-4 flex flex-col justify-between hover:border-cyan-500/50 transition-all shadow-lg"
            >
              <div>
                {/* Header row */}
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-cyan-400">{del.missionId}</span>
                    <span className="text-[10px] text-slate-500 font-bold">{drone.callsign}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${
                    del.priority === 'URGENT' ? 'bg-rose-950 text-rose-400 border-rose-800' :
                    del.priority === 'HIGH' ? 'bg-amber-950 text-amber-400 border-amber-800' :
                    'bg-slate-900 text-slate-400 border-slate-700'
                  }`}>
                    {del.priority}
                  </span>
                </div>

                {/* Package Info */}
                <div className="mb-3">
                  <div className="text-xs font-bold text-white leading-snug">
                    {del.packageDescription}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-3">
                    <span>Barcode: {del.packageId}</span>
                    <span>Weight: {del.packageWeightKg} kg</span>
                  </div>
                </div>

                {/* Route points */}
                <div className="space-y-2 text-xs bg-[#131a2b] p-2.5 rounded-md border border-[#212f4c] mb-3">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 mt-1"></div>
                    <div className="truncate">
                      <div className="text-[9px] text-slate-500 uppercase">Pickup Hub</div>
                      <div className="text-slate-300 text-[11px] truncate">{del.pickupLocation}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1"></div>
                    <div className="truncate">
                      <div className="text-[9px] text-slate-500 uppercase">Destination Drop Pad</div>
                      <div className="text-white font-bold text-[11px] truncate">{del.destinationAddress}</div>
                    </div>
                  </div>
                </div>

                {/* Recipient & ETA */}
                <div className="space-y-1 text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span>Recipient:</span>
                    <span className="text-slate-200">{del.recipientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Target ETA:</span>
                    <span className="text-cyan-300 font-bold">{del.estimatedArrivalTime}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>ETA Confidence:</span>
                    <span className="text-emerald-400 font-bold">{del.etaConfidencePercent}%</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center">
                <span className={`text-[10px] font-bold uppercase ${del.status === 'Delivered' ? 'text-emerald-400' : 'text-cyan-400'}`}>
                  ● {del.status}
                </span>

                <button
                  onClick={() => onSelectDroneAndSwitchToLive(drone.id)}
                  className="px-3 py-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 rounded text-[11px] font-bold transition-colors inline-flex items-center gap-1"
                >
                  <span>Track Route</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
