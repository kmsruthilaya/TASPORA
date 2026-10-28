import React from 'react';
import { 
  ShieldAlert, 
  Layers, 
  Wind, 
  Compass, 
  AlertTriangle, 
  CheckCircle, 
  Lock, 
  Radio 
} from 'lucide-react';
import { GeofenceZone, AirspaceConflict } from '../types/fleet';

interface AirspaceViewProps {
  geofences: GeofenceZone[];
  conflicts: AirspaceConflict[];
  onSwitchToLive: () => void;
}

export const AirspaceView: React.FC<AirspaceViewProps> = ({
  geofences,
  conflicts,
  onSwitchToLive,
}) => {
  return (
    <div className="flex-1 bg-[#090d15] p-6 overflow-y-auto select-none font-mono">
      {/* Top Banner */}
      <div className="pb-6 border-b border-[#1f2b45] flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-extrabold text-white tracking-wider">AIRSPACE COMPLIANCE & SAFETY ZONES</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            UTM Dynamic Geo-Fencing, No-Fly Sector Restrictions, and Separation Corridors
          </p>
        </div>

        <button
          onClick={onSwitchToLive}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-md text-xs transition-colors"
        >
          VIEW IN 3D MAP
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Geofences List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            Active Geofence Corridors & Envelopes
          </h2>

          <div className="space-y-3">
            {geofences.map((geo) => (
              <div
                key={geo.id}
                className={`p-4 rounded-lg border ${
                  geo.type === 'restricted'
                    ? 'bg-rose-950/20 border-rose-800/60'
                    : geo.type === 'caution'
                    ? 'bg-amber-950/20 border-amber-800/60'
                    : 'bg-[#101626] border-[#1e2a44]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {geo.type === 'restricted' ? (
                      <Lock className="w-4 h-4 text-rose-500" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                    )}
                    <span className="font-bold text-sm text-white">{geo.name}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                    geo.type === 'restricted' ? 'bg-rose-900/50 text-rose-300 border-rose-700' :
                    geo.type === 'caution' ? 'bg-amber-900/50 text-amber-300 border-amber-700' :
                    'bg-cyan-900/50 text-cyan-300 border-cyan-700'
                  }`}>
                    {geo.type}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mb-3">{geo.description}</p>

                <div className="grid grid-cols-3 gap-2 text-xs bg-[#0b0f19] p-2.5 rounded border border-slate-800 text-slate-400">
                  <div>
                    Floor Altitude: <span className="text-white font-bold">{geo.minAltitudeMeters} m AGL</span>
                  </div>
                  <div>
                    Ceiling Altitude: <span className="text-white font-bold">{geo.maxAltitudeMeters} m AGL</span>
                  </div>
                  <div>
                    Enforcement: <span className="text-emerald-400 font-bold">AUTOMATED BVLOS</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Weather & Conflict Monitor */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            Atmospheric & Radar Telemetry
          </h2>

          {/* Micro-Weather Card */}
          <div className="bg-[#101626] border border-[#1f2c45] p-4 rounded-lg space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-300 font-bold border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <Wind className="w-4 h-4" /> Micro-Climate Sensor Array
              </span>
              <span className="text-emerald-400">STABLE</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Surface Wind:</span>
                <span className="text-white font-bold">12 km/h • Bearing 045°</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Corridor Wind (90m AGL):</span>
                <span className="text-cyan-300 font-bold">18 km/h • Tailwind +4 km/h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Max Gust Threshold:</span>
                <span className="text-slate-300">38 km/h (Safe margin 55 km/h)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Precipitation:</span>
                <span className="text-emerald-400 font-bold">0.0 mm/hr (Clear sky)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Air Density Altitude:</span>
                <span className="text-slate-300">142 m MSL</span>
              </div>
            </div>
          </div>

          {/* Separation Advisory */}
          <div className="bg-[#101626] border border-[#1f2c45] p-4 rounded-lg space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-300 font-bold border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <Radio className="w-4 h-4" /> Deconfliction Engine
              </span>
              <span className="text-emerald-400">ACTIVE</span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time spatial separation model maintains continuous 250m horizontal and 30m vertical clearance bubbles between all active aircraft.
            </p>

            <div className="p-2.5 rounded bg-emerald-950/30 border border-emerald-700/50 text-xs text-emerald-300">
              ✓ Automated trajectory conflict detection running at 20 Hz simulation rate.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
