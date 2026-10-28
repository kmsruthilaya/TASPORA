import React, { useState } from 'react';
import { 
  Plane, 
  Battery, 
  Wrench, 
  Clock, 
  ShieldCheck, 
  Search, 
  Filter, 
  ExternalLink,
  Zap,
  Radio
} from 'lucide-react';
import { Drone } from '../types/fleet';

interface FleetViewProps {
  drones: Drone[];
  onSelectDroneAndSwitchToLive: (id: string) => void;
}

export const FleetView: React.FC<FleetViewProps> = ({
  drones,
  onSelectDroneAndSwitchToLive,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = drones.filter(
    (d) =>
      d.callsign.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 bg-[#090d15] p-6 overflow-y-auto select-none font-mono">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#1f2b45] gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Plane className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-extrabold text-white tracking-wider">AIRCRAFT FLEET REGISTRY</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Aerovata by Taspora Commercial BVLOS Delivery Fleet • 6 Registered Airframes
          </p>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Filter by ID, model, serial..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#121828] border border-[#21304d] rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* Fleet Table */}
      <div className="mt-6 bg-[#0f1422] border border-[#1f2a40] rounded-lg overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#141b2e] border-b border-[#202d47] text-slate-400 uppercase text-[10px] tracking-wider">
              <th className="py-3 px-4">Aircraft Callsign</th>
              <th className="py-3 px-4">Model & Type</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Battery SoC</th>
              <th className="py-3 px-4">Flight Hours</th>
              <th className="py-3 px-4">Motor Health</th>
              <th className="py-3 px-4">Last Inspection</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1b253b] text-slate-300">
            {filtered.map((drone) => (
              <tr key={drone.id} className="hover:bg-[#151c2f] transition-colors">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 font-bold">
                      ✈
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">{drone.callsign}</div>
                      <div className="text-[10px] text-slate-500">{drone.serialNumber}</div>
                    </div>
                  </div>
                </td>

                <td className="py-3.5 px-4">
                  <div className="font-medium text-slate-200">{drone.model}</div>
                  <div className="text-[10px] text-slate-500">Max Payload: {drone.vitals.maxPayloadKg} kg</div>
                </td>

                <td className="py-3.5 px-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${
                    drone.status === 'delivering' ? 'bg-cyan-950 text-cyan-400 border-cyan-800' :
                    drone.status === 'charging' ? 'bg-amber-950 text-amber-400 border-amber-800' :
                    drone.status === 'attention_required' ? 'bg-rose-950 text-rose-400 border-rose-800' :
                    'bg-slate-900 text-slate-400 border-slate-700'
                  }`}>
                    {drone.statusLabel}
                  </span>
                </td>

                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white w-8">{Math.round(drone.vitals.batteryPercentage)}%</span>
                    <div className="w-20 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${drone.vitals.batteryPercentage > 50 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                        style={{ width: `${drone.vitals.batteryPercentage}%` }}
                      />
                    </div>
                  </div>
                </td>

                <td className="py-3.5 px-4 text-slate-300">
                  {drone.flightHours} hrs
                </td>

                <td className="py-3.5 px-4">
                  <span className="text-emerald-400 font-bold">{drone.vitals.motorHealthPercent}%</span>
                </td>

                <td className="py-3.5 px-4 text-slate-400">
                  {drone.lastMaintenance}
                </td>

                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => onSelectDroneAndSwitchToLive(drone.id)}
                    className="px-3 py-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 rounded text-[11px] font-bold transition-colors inline-flex items-center gap-1"
                  >
                    <span>Track Live</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
