import React from 'react';
import { 
  Plane, 
  Battery, 
  BatteryCharging, 
  BatteryWarning, 
  Wifi, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Navigation, 
  Clock, 
  Compass,
  Radio
} from 'lucide-react';
import { Drone, DroneStatus } from '../types/fleet';

interface FleetSidebarProps {
  drones: Drone[];
  selectedDroneId: string | null;
  onSelectDrone: (id: string) => void;
  filter: string;
  setFilter: (filter: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeAlertsCount: number;
}

export const FleetSidebar: React.FC<FleetSidebarProps> = ({
  drones,
  selectedDroneId,
  onSelectDrone,
  filter,
  setFilter,
  searchQuery,
  setSearchQuery,
  activeAlertsCount,
}) => {
  // Counters
  const totalCount = drones.length;
  const activeCount = drones.filter((d) => ['delivering', 'en_route_pickup', 'returning_to_base'].includes(d.status)).length;
  const chargingCount = drones.filter((d) => d.status === 'charging').length;
  const attentionCount = drones.filter((d) => d.status === 'attention_required' || d.vitals.batteryPercentage < 30).length;
  const idleCount = drones.filter((d) => d.status === 'standby').length;

  // Filtered drones
  const filteredDrones = drones.filter((drone) => {
    // Search query match
    const matchesSearch = 
      drone.callsign.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drone.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drone.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (drone.delivery?.destinationAddress || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Filter pill match
    if (filter === 'all') return true;
    if (filter === 'active') return ['delivering', 'en_route_pickup', 'returning_to_base'].includes(drone.status);
    if (filter === 'delivering') return drone.status === 'delivering';
    if (filter === 'charging') return drone.status === 'charging';
    if (filter === 'attention') return drone.status === 'attention_required' || drone.vitals.batteryPercentage < 30;
    return true;
  });

  const getBatteryColor = (percent: number) => {
    if (percent > 55) return 'bg-emerald-500 text-emerald-400';
    if (percent > 30) return 'bg-amber-500 text-amber-400';
    return 'bg-rose-500 text-rose-400';
  };

  const getStatusBadge = (status: DroneStatus) => {
    switch (status) {
      case 'delivering':
        return { text: 'Delivering', color: 'bg-cyan-950 text-cyan-400 border-cyan-800' };
      case 'en_route_pickup':
        return { text: 'En Route', color: 'bg-blue-950 text-blue-400 border-blue-800' };
      case 'returning_to_base':
        return { text: 'Returning', color: 'bg-emerald-950 text-emerald-400 border-emerald-800' };
      case 'charging':
        return { text: 'Charging', color: 'bg-amber-950 text-amber-400 border-amber-800' };
      case 'attention_required':
        return { text: 'Attention', color: 'bg-rose-950 text-rose-400 border-rose-800' };
      default:
        return { text: 'Standby', color: 'bg-slate-900 text-slate-400 border-slate-700' };
    }
  };

  return (
    <aside className="w-[280px] lg:w-[310px] bg-[#0c101a] border-r border-[#1f2a40] flex flex-col h-full shrink-0 select-none overflow-hidden">
      {/* Top Header matching reference image: "ACTIVE AIRCRAFT (4)" */}
      <div className="p-3 border-b border-[#1f2a40] bg-[#101522]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-xs font-bold tracking-wider text-slate-100 uppercase">
              ACTIVE AIRCRAFT ({activeCount})
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">FLEET {totalCount} UNITS</span>
        </div>

        {/* Fleet KPI mini counters */}
        <div className="grid grid-cols-4 gap-1 mb-2.5">
          <div className="bg-[#151c2e] p-1.5 rounded border border-[#222e47] text-center">
            <div className="text-[9px] font-mono uppercase text-slate-400">Total</div>
            <div className="text-xs font-bold text-white font-mono">{totalCount}</div>
          </div>
          <div className="bg-[#151c2e] p-1.5 rounded border border-cyan-900/40 text-center">
            <div className="text-[9px] font-mono uppercase text-cyan-400">Active</div>
            <div className="text-xs font-bold text-cyan-300 font-mono">{activeCount}</div>
          </div>
          <div className="bg-[#151c2e] p-1.5 rounded border border-amber-900/40 text-center">
            <div className="text-[9px] font-mono uppercase text-amber-400">Charge</div>
            <div className="text-xs font-bold text-amber-300 font-mono">{chargingCount}</div>
          </div>
          <div className={`p-1.5 rounded border text-center ${attentionCount > 0 ? 'bg-rose-950/40 border-rose-800/60' : 'bg-[#151c2e] border-[#222e47]'}`}>
            <div className={`text-[9px] font-mono uppercase ${attentionCount > 0 ? 'text-rose-400' : 'text-slate-400'}`}>Alert</div>
            <div className={`text-xs font-bold font-mono ${attentionCount > 0 ? 'text-rose-400' : 'text-slate-300'}`}>{attentionCount}</div>
          </div>
        </div>

        {/* Search input */}
        <div className="relative mb-2">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search callsign, ID or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#141b2b] border border-[#243352] rounded pl-8 pr-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] scrollbar-none">
          {[
            { id: 'all', label: 'All' },
            { id: 'active', label: 'Active' },
            { id: 'delivering', label: 'Delivering' },
            { id: 'charging', label: 'Charging' },
            { id: 'attention', label: 'Alert' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={`px-2 py-0.5 rounded font-medium whitespace-nowrap transition-colors ${
                filter === item.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200 bg-[#141a29]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Drone List Cards */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {filteredDrones.map((drone) => {
          const isSelected = drone.id === selectedDroneId;
          const statusBadge = getStatusBadge(drone.status);
          const batColor = getBatteryColor(drone.vitals.batteryPercentage);

          return (
            <div
              key={drone.id}
              onClick={() => onSelectDrone(drone.id)}
              className={`p-2.5 rounded-md cursor-pointer transition-all border ${
                isSelected
                  ? 'bg-[#151f33] border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400/50'
                  : 'bg-[#121724] border-[#1e2a42] hover:bg-[#161d2e] hover:border-slate-700'
              }`}
            >
              {/* Header: Drone Callsign & Altitude (Matches Screenshot) */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {/* Drone SVG Icon */}
                  <div className={`p-1 rounded ${isSelected ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-300'}`}>
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2a4 4 0 0 0-4 4v1H6a3 3 0 0 0-3 3v1h18v-1a3 3 0 0 0-3-3h-2V6a4 4 0 0 0-4-4z" />
                      <path d="M6 14v4a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-4" />
                      <line x1="2" y1="11" x2="22" y2="11" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-xs font-bold font-mono tracking-wider text-white">
                      {drone.callsign}
                    </span>
                    <span className="text-[9px] text-slate-500 ml-1.5 font-mono">{drone.id}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold font-mono text-cyan-300">
                    {Math.round(drone.vitals.altitudeMeters)} m
                  </span>
                </div>
              </div>

              {/* Battery Bar & Percentage (Matches Screenshot) */}
              <div className="flex items-center justify-between text-[11px] mb-1.5 font-mono">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <span className="text-[10px]">Battery</span>
                  {/* Progress bar */}
                  <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                    <div
                      className={`h-full transition-all duration-500 ${
                        drone.vitals.batteryPercentage > 50
                          ? 'bg-emerald-500'
                          : drone.vitals.batteryPercentage > 25
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, drone.vitals.batteryPercentage)}%` }}
                    />
                  </div>
                </div>
                <span className={`text-[11px] font-bold ${batColor.split(' ')[1]}`}>
                  {Math.round(drone.vitals.batteryPercentage)}%
                </span>
              </div>

              {/* Lat/Lon Coordinates Readout (Matches Screenshot) */}
              <div className="text-[10px] font-mono text-slate-400 mb-1.5 bg-[#0b0f19] px-2 py-1 rounded border border-[#1b253b]">
                Lat {drone.vitals.latitude.toFixed(6)}, Lon {drone.vitals.longitude.toFixed(6)}
              </div>

              {/* Footer row: Status badge, flight time & speed */}
              <div className="flex items-center justify-between pt-1 border-t border-[#1a253d] text-[10px]">
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${statusBadge.color}`}>
                  {statusBadge.text}
                </span>

                <div className="flex items-center gap-2 text-slate-400 font-mono">
                  <span title="Ground Speed">{Math.round(drone.vitals.groundSpeedKmh)} km/h</span>
                  <span>•</span>
                  <span title="Est Flight Time">{drone.vitals.estimatedFlightTimeMinutes} min</span>
                </div>
              </div>
            </div>
          );
        })}

        {filteredDrones.length === 0 && (
          <div className="p-6 text-center text-slate-500 text-xs">
            No aircraft match current filter.
          </div>
        )}
      </div>

      {/* Bottom Card: SYSTEM STATUS (Matches Reference Image) */}
      <div className="p-3 border-t border-[#1f2a40] bg-[#101522] shrink-0">
        <div className="text-[11px] font-bold font-mono tracking-wider text-slate-300 uppercase mb-2">
          SYSTEM STATUS
        </div>

        <div className="space-y-1.5 text-xs font-mono text-slate-300 mb-2.5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <Plane className="w-3.5 h-3.5 text-cyan-400" /> Total Aircraft
            </span>
            <span className="font-bold text-white">{totalCount}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <Compass className="w-3.5 h-3.5 text-emerald-400" /> Active Missions
            </span>
            <span className="font-bold text-emerald-400">{activeCount}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Alerts
            </span>
            <span className={`font-bold ${activeAlertsCount > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
              {activeAlertsCount}
            </span>
          </div>
        </div>

        {/* All Systems Normal indicator badge */}
        <div className={`p-2 rounded flex items-center gap-2 text-xs font-medium border ${
          activeAlertsCount > 1 
            ? 'bg-amber-950/30 border-amber-800/60 text-amber-300' 
            : 'bg-emerald-950/30 border-emerald-800/60 text-emerald-400'
        }`}>
          <span className={`w-2 h-2 rounded-full animate-ping ${activeAlertsCount > 1 ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
          <span className="font-bold text-[11px]">
            {activeAlertsCount > 1 ? 'Airspace Advisory Active' : '● All Systems Normal'}
          </span>
        </div>
      </div>
    </aside>
  );
};
