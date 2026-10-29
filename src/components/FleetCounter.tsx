import React, { useState } from 'react';
import { ChevronRight, Activity } from 'lucide-react';
import { Drone } from '../types/fleet';

interface FleetCounterProps {
  drones: Drone[];
  selectedDroneId: string | null;
  onSelectDrone: (id: string) => void;
}

const DroneIcon = ({ color = 'currentColor', size = 20 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="16" cy="16" rx="5" ry="3.5" fill={color} fillOpacity="0.9" />
    <line x1="11" y1="16" x2="5" y2="11" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <line x1="21" y1="16" x2="27" y2="11" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <line x1="11" y1="16" x2="5" y2="21" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <line x1="21" y1="16" x2="27" y2="21" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <ellipse cx="5" cy="10.5" rx="3.5" ry="1.2" fill={color} fillOpacity="0.45" />
    <ellipse cx="27" cy="10.5" rx="3.5" ry="1.2" fill={color} fillOpacity="0.45" />
    <ellipse cx="5" cy="21.5" rx="3.5" ry="1.2" fill={color} fillOpacity="0.45" />
    <ellipse cx="27" cy="21.5" rx="3.5" ry="1.2" fill={color} fillOpacity="0.45" />
    <circle cx="16" cy="16" r="1.5" fill="white" fillOpacity="0.85" />
  </svg>
);

const getDroneColor = (status: string) => {
  switch (status) {
    case 'delivering': return '#00e5ff';
    case 'en_route_pickup': return '#3b82f6';
    case 'returning_to_base': return '#10b981';
    case 'charging': return '#f59e0b';
    case 'attention_required': return '#ef4444';
    default: return '#475569';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'delivering': return 'In Transit';
    case 'en_route_pickup': return 'En Route';
    case 'returning_to_base': return 'Returning';
    case 'charging': return 'Charging';
    case 'attention_required': return 'Attention';
    default: return 'Standby';
  }
};

const calcETA = (drone: Drone): string => {
  const remaining = drone.route.slice(drone.currentWaypointIndex).find(w => w.type === 'delivery');
  if (remaining?.etaMinutes != null) {
    const mins = Math.max(0, Math.round(remaining.etaMinutes));
    if (mins === 0) return 'Arriving';
    return `${mins}m`;
  }
  if (drone.delivery?.estimatedArrivalTime) return drone.delivery.estimatedArrivalTime;
  return '--';
};

const calcDistanceKm = (drone: Drone): string => {
  const dest = drone.route.find(w => w.type === 'delivery');
  if (!dest) return '--';
  const R = 6371;
  const dLat = (dest.lat - drone.vitals.latitude) * Math.PI / 180;
  const dLon = (dest.lng - drone.vitals.longitude) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 +
    Math.cos(drone.vitals.latitude * Math.PI / 180) *
    Math.cos(dest.lat * Math.PI / 180) *
    Math.sin(dLon/2)**2;
  const km = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`;
};

export const FleetCounter: React.FC<FleetCounterProps> = ({
  drones,
  selectedDroneId,
  onSelectDrone,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const total = drones.length;
  const inFlight = drones.filter(d => ['delivering', 'en_route_pickup', 'returning_to_base'].includes(d.status)).length;
  const inTransit = drones.filter(d => d.status === 'delivering').length;
  const arriving = drones.filter(d => {
    const dest = d.route.find(w => w.type === 'delivery');
    return dest?.etaMinutes != null && dest.etaMinutes <= 2 && dest.etaMinutes > 0;
  }).length;
  const arrived = drones.filter(d => d.delivery?.status === 'Delivered').length;
  const attention = drones.filter(d => d.status === 'attention_required').length;

  return (
    <div
      className="fleet-counter"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* COUNTER CHIPS */}
      <div className="flex items-center divide-x divide-[#1a2235]">
        {/* Total */}
        <div className="px-3.5 py-2 flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-bold text-white font-mono tabular-nums">
              {String(total).padStart(2, '0')}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider hidden sm:block">Drones</span>
        </div>

        {/* In Flight */}
        <div className="px-3 py-2 flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" style={{ boxShadow: '0 0 6px #00e5ff' }} />
          <span className="text-xs font-bold text-cyan-400 font-mono tabular-nums">{String(inFlight).padStart(2, '0')}</span>
          <span className="text-[10px] text-slate-500 hidden sm:block">In Flight</span>
        </div>

        {/* In Transit */}
        <div className="px-3 py-2 flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          <span className="text-xs font-bold text-blue-400 font-mono tabular-nums">{String(inTransit).padStart(2, '0')}</span>
          <span className="text-[10px] text-slate-500 hidden sm:block">Delivering</span>
        </div>

        {/* Arriving */}
        {arriving > 0 && (
          <div className="px-3 py-2 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 status-dot-blink" />
            <span className="text-xs font-bold text-amber-400 font-mono tabular-nums">{String(arriving).padStart(2, '0')}</span>
            <span className="text-[10px] text-slate-500 hidden sm:block">Arriving</span>
          </div>
        )}

        {/* Arrived */}
        {arrived > 0 && (
          <div className="px-3 py-2 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-xs font-bold text-emerald-400 font-mono tabular-nums">{String(arrived).padStart(2, '0')}</span>
            <span className="text-[10px] text-slate-500 hidden sm:block">Arrived</span>
          </div>
        )}

        {/* Attention */}
        {attention > 0 && (
          <div className="px-3 py-2 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-400 status-dot-blink" />
            <span className="text-xs font-bold text-rose-400 font-mono tabular-nums">{String(attention).padStart(2, '0')}</span>
            <span className="text-[10px] text-slate-500 hidden sm:block">Attention</span>
          </div>
        )}

        {/* Sim label */}
        <div className="px-2.5 py-2">
          <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">SIM</span>
        </div>
      </div>

      {/* EXPANDED FLEET PANEL */}
      {isExpanded && (
        <div className="fleet-counter-panel">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">Fleet Overview</span>
            <span className="text-[10px] text-slate-500 font-mono">{total} units</span>
          </div>

          <div className="space-y-1.5">
            {drones.map(drone => {
              const color = getDroneColor(drone.status);
              const isSelected = drone.id === selectedDroneId;
              const eta = calcETA(drone);
              const dist = calcDistanceKm(drone);
              const bat = drone.vitals.batteryPercentage;

              return (
                <button
                  key={drone.id}
                  onClick={() => onSelectDrone(drone.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left pointer-events-auto ${
                    isSelected
                      ? 'bg-cyan-500/12 border border-cyan-500/20'
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {/* Drone icon */}
                  <div className="relative flex-shrink-0">
                    <DroneIcon color={color} size={22} />
                    {drone.status === 'attention_required' && (
                      <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-400 rounded-full status-dot-blink" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-white">{drone.callsign}</span>
                      <span className="text-[10px] font-mono" style={{ color }}>{getStatusLabel(drone.status)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {/* Battery bar */}
                      <div className="flex items-center gap-1">
                        <div className="w-16 h-1 bg-[#1a2235] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${bat}%`,
                              background: bat > 50 ? '#10b981' : bat > 25 ? '#f59e0b' : '#ef4444',
                            }}
                          />
                        </div>
                        <span className={`text-[9px] font-mono ${bat > 50 ? 'text-emerald-400' : bat > 25 ? 'text-amber-400' : 'text-rose-400'}`}>
                          {Math.round(bat)}%
                        </span>
                      </div>
                      {drone.status !== 'charging' && drone.status !== 'standby' && (
                        <>
                          <span className="text-[9px] text-slate-600">·</span>
                          <span className="text-[9px] text-slate-400 font-mono">{dist}</span>
                          <span className="text-[9px] text-slate-600">·</span>
                          <span className="text-[9px] text-slate-400 font-mono">ETA {eta}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <ChevronRight className={`w-3.5 h-3.5 transition-colors flex-shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-600'}`} />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
