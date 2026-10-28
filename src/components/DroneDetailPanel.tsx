import React, { useState } from 'react';
import { 
  X, 
  Activity, 
  Package, 
  Route, 
  Sliders, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  Eye, 
  Battery, 
  ShieldCheck, 
  Radio, 
  Gauge, 
  Clock, 
  Crosshair, 
  ArrowUpRight,
  Zap,
  MapPin
} from 'lucide-react';
import { Drone, Waypoint } from '../types/fleet';

interface DroneDetailPanelProps {
  drone: Drone;
  onClose: () => void;
  onPauseResume: (droneId: string) => void;
  onTriggerReplan: (droneId: string) => void;
  onTriggerRTB: (droneId: string) => void;
  onMarkComplete: (droneId: string) => void;
  onSwitchToPOV: () => void;
  onSelectWaypoint: (wpId: string) => void;
  selectedWaypointId: string | null;
}

export const DroneDetailPanel: React.FC<DroneDetailPanelProps> = ({
  drone,
  onClose,
  onPauseResume,
  onTriggerReplan,
  onTriggerRTB,
  onMarkComplete,
  onSwitchToPOV,
  onSelectWaypoint,
  selectedWaypointId,
}) => {
  const [activeTab, setActiveTab] = useState<'vitals' | 'delivery' | 'waypoints' | 'controls'>('vitals');

  const getRtbBadge = (status: string) => {
    switch (status) {
      case 'SUFFICIENT':
        return { text: 'SUFFICIENT RESERVE', color: 'bg-emerald-950/80 text-emerald-400 border-emerald-800' };
      case 'LOW_RESERVE':
        return { text: 'LOW RESERVE MARGIN', color: 'bg-amber-950/80 text-amber-400 border-amber-800' };
      case 'RTB_RECOMMENDED':
        return { text: 'RETURN-TO-BASE RECOMMENDED', color: 'bg-rose-950/80 text-rose-400 border-rose-800 animate-pulse' };
      default:
        return { text: 'CALCULATING', color: 'bg-slate-900 text-slate-400 border-slate-700' };
    }
  };

  const rtbBadge = getRtbBadge(drone.vitals.rtbStatus);

  return (
    <div className="h-64 bg-[#0c101a] border-t border-cyan-500/40 flex flex-col select-none shrink-0 overflow-hidden shadow-2xl relative z-20">
      {/* Top Header of Detail Panel */}
      <div className="h-9 px-3 bg-[#111726] border-b border-[#1f2a40] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
            <span className="font-extrabold font-mono text-sm tracking-wider text-white">
              {drone.callsign}
            </span>
            <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">
              {drone.model} • {drone.serialNumber}
            </span>
          </div>

          {/* Section Tabs */}
          <div className="flex items-center gap-1 ml-4">
            <button
              onClick={() => setActiveTab('vitals')}
              className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'vitals'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              A. Drone Vitals
            </button>

            <button
              onClick={() => setActiveTab('delivery')}
              className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'delivery'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              B. Delivery Details
            </button>

            <button
              onClick={() => setActiveTab('waypoints')}
              className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'waypoints'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Route className="w-3.5 h-3.5" />
              C. Flight Plan ({drone.route.length})
            </button>

            <button
              onClick={() => setActiveTab('controls')}
              className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'controls'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              D. Mission Controls
            </button>
          </div>
        </div>

        {/* Right close & quick actions */}
        <div className="flex items-center gap-2">
          {/* 1-click POV camera jump */}
          <button
            onClick={onSwitchToPOV}
            className="flex items-center gap-1.5 px-2.5 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-700/60 rounded text-xs font-mono font-bold hover:bg-cyan-900/60 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>POV CAMERA</span>
          </button>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
            title="Minimize Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="flex-1 p-3 overflow-y-auto">
        {/* SECTION A: DRONE VITALS */}
        {activeTab === 'vitals' && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2.5 h-full">
            {/* 1. Battery & Smart RTB Prediction */}
            <div className="md:col-span-2 bg-[#121828] border border-[#202e48] p-2.5 rounded-md flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-mono text-slate-400 font-bold uppercase flex items-center gap-1">
                  <Battery className="w-3.5 h-3.5 text-emerald-400" /> Power & RTB Reserve
                </span>
                <span className={`px-2 py-0.5 text-[9px] font-mono font-bold border rounded ${rtbBadge.color}`}>
                  {rtbBadge.text}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-mono font-extrabold text-white">
                  {Math.round(drone.vitals.batteryPercentage)}%
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {drone.vitals.batteryVoltage}V LiPo • {drone.vitals.estimatedFlightTimeMinutes} min remaining
                </span>
              </div>

              {/* Reserve calculation bar */}
              <div className="mt-2 text-[10px] font-mono space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Energy to Return Base</span>
                  <span className="text-white font-bold">{drone.vitals.energyRequiredToTargetWh} Wh</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                  <div className="bg-cyan-500 h-full" style={{ width: `${Math.min(100, (drone.vitals.energyRequiredToTargetWh / 150) * 100)}%` }}></div>
                  <div className="bg-emerald-500 h-full" style={{ width: `${Math.min(100, drone.vitals.energyReserveMarginPercent)}%` }}></div>
                </div>
                <div className="flex justify-between text-[9px] text-slate-500">
                  <span>Burn: {drone.vitals.energyBurnRateWhPerKm} Wh/km</span>
                  <span>Safety Margin: {drone.vitals.energyReserveMarginPercent}%</span>
                </div>
              </div>
            </div>

            {/* 2. Kinematics (Altitude, Speed, Heading) */}
            <div className="bg-[#121828] border border-[#202e48] p-2.5 rounded-md flex flex-col justify-between">
              <div className="text-[11px] font-mono text-slate-400 font-bold uppercase flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-cyan-400" /> Kinematics
              </div>
              <div className="space-y-1 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Altitude:</span>
                  <span className="text-white font-bold">{Math.round(drone.vitals.altitudeMeters)} m AGL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Ground Speed:</span>
                  <span className="text-cyan-300 font-bold">{Math.round(drone.vitals.groundSpeedKmh)} km/h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Heading:</span>
                  <span className="text-white font-bold">{drone.vitals.headingDegrees}°</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">V. Speed:</span>
                  <span className="text-slate-300">{drone.vitals.verticalSpeedMs} m/s</span>
                </div>
              </div>
            </div>

            {/* 3. Navigation & GPS Quality */}
            <div className="bg-[#121828] border border-[#202e48] p-2.5 rounded-md flex flex-col justify-between">
              <div className="text-[11px] font-mono text-slate-400 font-bold uppercase flex items-center gap-1">
                <Crosshair className="w-3.5 h-3.5 text-emerald-400" /> Navigation Fix
              </div>
              <div className="space-y-1 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">GPS Status:</span>
                  <span className="text-emerald-400 font-bold">{drone.vitals.gpsFix}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Satellites:</span>
                  <span className="text-white font-bold">{drone.vitals.satellites} Locked</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate pt-1">
                  {drone.vitals.latitude.toFixed(6)}, {drone.vitals.longitude.toFixed(6)}
                </div>
              </div>
            </div>

            {/* 4. Connectivity & Telemetry Link */}
            <div className="bg-[#121828] border border-[#202e48] p-2.5 rounded-md flex flex-col justify-between">
              <div className="text-[11px] font-mono text-slate-400 font-bold uppercase flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 text-cyan-400" /> RF Telemetry
              </div>
              <div className="space-y-1 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Signal RSSI:</span>
                  <span className="text-white font-bold">{drone.vitals.signalStrengthDbm} dBm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Link Quality:</span>
                  <span className="text-cyan-400 font-bold">{drone.vitals.signalQualityPercent}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Band:</span>
                  <span className="text-slate-400">5.8 GHz BVLOS</span>
                </div>
              </div>
            </div>

            {/* 5. Propulsion & ESC Temperatures */}
            <div className="bg-[#121828] border border-[#202e48] p-2.5 rounded-md flex flex-col justify-between">
              <div className="text-[11px] font-mono text-slate-400 font-bold uppercase flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Motors & Health
              </div>
              <div className="space-y-1 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Motor Health:</span>
                  <span className="text-emerald-400 font-bold">{drone.vitals.motorHealthPercent}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mean Temp:</span>
                  <span className="text-amber-300 font-bold">{drone.vitals.motorTempsCelsius[0]}°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payload:</span>
                  <span className="text-white font-bold">{drone.vitals.payloadWeightKg} / {drone.vitals.maxPayloadKg} kg</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION B: DELIVERY DETAILS */}
        {activeTab === 'delivery' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 h-full">
            <div className="bg-[#121828] border border-[#202e48] p-3 rounded-md flex flex-col justify-between">
              <div className="text-xs font-mono text-slate-400 font-bold uppercase">Package Manifest</div>
              <div className="my-1">
                <div className="text-sm font-bold text-white">{drone.delivery?.packageDescription}</div>
                <div className="text-xs font-mono text-cyan-400 mt-0.5">{drone.delivery?.packageId}</div>
              </div>
              <div className="text-xs font-mono text-slate-400">
                Weight: <span className="text-white font-bold">{drone.delivery?.packageWeightKg} kg</span> • Priority: <span className="text-rose-400 font-bold">{drone.delivery?.priority}</span>
              </div>
            </div>

            <div className="bg-[#121828] border border-[#202e48] p-3 rounded-md flex flex-col justify-between">
              <div className="text-xs font-mono text-slate-400 font-bold uppercase">Routing & Recipient</div>
              <div className="space-y-1 text-xs font-mono">
                <div>
                  <span className="text-slate-500">From: </span>
                  <span className="text-slate-300 truncate">{drone.delivery?.pickupLocation}</span>
                </div>
                <div>
                  <span className="text-slate-500">To: </span>
                  <span className="text-cyan-300 font-bold">{drone.delivery?.destinationAddress}</span>
                </div>
                <div className="pt-1 text-slate-400">
                  Recipient: <span className="text-white">{drone.delivery?.recipientName}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#121828] border border-[#202e48] p-3 rounded-md flex flex-col justify-between">
              <div className="text-xs font-mono text-slate-400 font-bold uppercase">Delivery ETA & Confidence</div>
              <div>
                <div className="text-base font-extrabold font-mono text-white">
                  ETA {drone.delivery?.estimatedArrivalTime}
                </div>
                <div className="text-xs font-mono text-emerald-400 font-bold mt-0.5">
                  Confidence: {drone.delivery?.etaConfidencePercent}% (High)
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {drone.delivery?.etaConfidenceReason}
                </div>
              </div>
            </div>

            <div className="bg-[#121828] border border-[#202e48] p-3 rounded-md flex flex-col justify-between">
              <div className="text-xs font-mono text-slate-400 font-bold uppercase">Drop Pad Status</div>
              <div className="space-y-1 text-xs font-mono">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="font-bold">Landing Pad Clear</span>
                </div>
                <div className="text-[11px] text-slate-300">
                  Recipient PIN: <span className="text-cyan-400 font-mono font-bold">VERIFIED</span>
                </div>
                <div className="text-[10px] text-slate-500">
                  Optical Tether release mechanism armed on final approach.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION C: FLIGHT PLAN & WAYPOINTS */}
        {activeTab === 'waypoints' && (
          <div className="h-full flex items-center overflow-x-auto pb-1">
            <div className="flex items-center gap-3 min-w-full px-2">
              {drone.route.map((wp, idx) => {
                const isSelectedWp = wp.id === selectedWaypointId;
                const isCurrent = idx === drone.currentWaypointIndex;

                let badgeColor = 'bg-slate-800 text-slate-400 border-slate-700';
                if (wp.status === 'completed') badgeColor = 'bg-emerald-950 text-emerald-400 border-emerald-700';
                else if (isCurrent) badgeColor = 'bg-cyan-950 text-cyan-300 border-cyan-400 ring-2 ring-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.4)]';

                return (
                  <React.Fragment key={wp.id}>
                    <div
                      onClick={() => onSelectWaypoint(wp.id)}
                      className={`p-2 rounded-md border cursor-pointer transition-all min-w-[150px] shrink-0 ${
                        isSelectedWp
                          ? 'bg-[#182338] border-cyan-400 shadow-lg'
                          : 'bg-[#121828] border-[#1e2c46] hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono text-slate-400 font-bold">
                          WP-0{idx + 1}
                        </span>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono uppercase font-bold border ${badgeColor}`}>
                          {wp.status}
                        </span>
                      </div>

                      <div className="text-xs font-bold text-white truncate">{wp.name}</div>
                      <div className="text-[10px] font-mono text-slate-400 mt-1">
                        Alt: <span className="text-cyan-300">{wp.altitudeMeters}m</span> • Type: <span className="text-slate-300 uppercase">{wp.type}</span>
                      </div>
                    </div>

                    {idx < drone.route.length - 1 && (
                      <div className="w-6 h-0.5 border-b-2 border-dashed border-slate-600 shrink-0"></div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION D: MISSION CONTROLS */}
        {activeTab === 'controls' && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 h-full items-center">
            {/* Pause / Resume Mission */}
            <button
              onClick={() => onPauseResume(drone.id)}
              className={`p-3 rounded-md border font-mono text-xs font-bold flex flex-col items-center justify-center gap-2 transition-all ${
                drone.isPaused
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-600 hover:bg-emerald-900 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'bg-amber-950 text-amber-300 border-amber-600 hover:bg-amber-900 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
              }`}
            >
              {drone.isPaused ? <Play className="w-5 h-5 text-emerald-400" /> : <Pause className="w-5 h-5 text-amber-400" />}
              <span>{drone.isPaused ? 'RESUME FLIGHT' : 'PAUSE HOVER'}</span>
            </button>

            {/* Smart Recalculate Route per specs */}
            <button
              onClick={() => onTriggerReplan(drone.id)}
              className="p-3 rounded-md bg-[#162136] hover:bg-[#1e2d4a] text-cyan-300 border border-cyan-500 font-mono text-xs font-bold flex flex-col items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(6,182,212,0.25)]"
            >
              <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin-slow" />
              <span>RECALCULATE ROUTE</span>
            </button>

            {/* Smart Return to Base */}
            <button
              onClick={() => onTriggerRTB(drone.id)}
              className="p-3 rounded-md bg-[#1d1628] hover:bg-[#2b1f3d] text-purple-300 border border-purple-500 font-mono text-xs font-bold flex flex-col items-center justify-center gap-2 transition-all"
            >
              <RotateCcw className="w-5 h-5 text-purple-400" />
              <span>RETURN TO BASE</span>
            </button>

            {/* Mark Delivery Complete */}
            <button
              onClick={() => onMarkComplete(drone.id)}
              className="p-3 rounded-md bg-[#11241f] hover:bg-[#1a3830] text-emerald-300 border border-emerald-500 font-mono text-xs font-bold flex flex-col items-center justify-center gap-2 transition-all"
            >
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span>MARK DELIVERED</span>
            </button>

            {/* Switch to POV cockpit */}
            <button
              onClick={onSwitchToPOV}
              className="p-3 rounded-md bg-[#141b2b] hover:bg-[#1d273e] text-slate-200 border border-slate-600 font-mono text-xs font-bold flex flex-col items-center justify-center gap-2 transition-all"
            >
              <Eye className="w-5 h-5 text-cyan-400" />
              <span>DRONE POV COCKPIT</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
