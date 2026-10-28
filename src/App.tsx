import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { FleetSidebar } from './components/FleetSidebar';
import { MapWorkspace } from './components/MapWorkspace';
import { DronePOVCamera } from './components/DronePOVCamera';
import { BottomOverviewPanel } from './components/BottomOverviewPanel';
import { DroneDetailPanel } from './components/DroneDetailPanel';
import { RightSidebar } from './components/RightSidebar';
import { RouteReplanModal } from './components/RouteReplanModal';
import { MissionReplayModal } from './components/MissionReplayModal';
import { FleetView } from './components/FleetView';
import { MissionsView } from './components/MissionsView';
import { AirspaceView } from './components/AirspaceView';
import { AnalyticsView } from './components/AnalyticsView';
import { AboutModal } from './components/AboutModal';
import { SettingsModal } from './components/SettingsModal';
import { 
  INITIAL_DRONES, 
  INITIAL_GEOFENCES, 
  INITIAL_ALERTS, 
  INITIAL_FLIGHT_LOGS 
} from './data/mockFleet';
import { 
  Drone, 
  GeofenceZone, 
  AirspaceAlert, 
  FlightLogEntry, 
  AirspaceConflict,
  Waypoint 
} from './types/fleet';
import { 
  updateSimulationTick, 
  generateSmartReplan 
} from './services/telemetryEngine';

export function App() {
  // Navigation tab
  const [activeTab, setActiveTab] = useState<'live' | 'fleet' | 'missions' | 'airspace' | 'analytics' | 'about'>('live');

  // Core state
  const [drones, setDrones] = useState<Drone[]>(INITIAL_DRONES);
  const [selectedDroneId, setSelectedDroneId] = useState<string | null>('AV-01');
  const [selectedWaypointId, setSelectedWaypointId] = useState<string | null>(null);
  const [geofences, setGeofences] = useState<GeofenceZone[]>(INITIAL_GEOFENCES);
  const [alerts, setAlerts] = useState<AirspaceAlert[]>(INITIAL_ALERTS);
  const [flightLogs, setFlightLogs] = useState<FlightLogEntry[]>(INITIAL_FLIGHT_LOGS);
  const [conflicts, setConflicts] = useState<AirspaceConflict[]>([]);

  // Map view mode
  const [viewMode, setViewMode] = useState<'2d' | '3d' | 'pov'>('2d');

  // Sidebar filters
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Settings & Configuration
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [safetyReservePercent, setSafetyReservePercent] = useState<number>(20);
  const [separationDistanceMeters, setSeparationDistanceMeters] = useState<number>(250);

  // Modals & Panels
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState<boolean>(true);
  const [replanData, setReplanData] = useState<{
    drone: Drone;
    proposedRoute: Waypoint[];
    addedDistanceKm: number;
    addedDelayMinutes: number;
  } | null>(null);
  const [isReplayModalOpen, setIsReplayModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState<boolean>(false);

  // Synthetic Radar Beep using Web Audio API
  const playRadarBeep = (freq = 880) => {
    if (isMuted) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch {
      // Ignore if user hasn't interacted with audio context yet
    }
  };

  // Deterministic Telemetry Simulation Engine
  useEffect(() => {
    const tickInterval = 1000 / simulationSpeed;
    const timer = setInterval(() => {
      setDrones((prevDrones) => {
        const deltaSeconds = 1;
        const res = updateSimulationTick(prevDrones, deltaSeconds, geofences);

        // Prepend new flight logs if emitted
        if (res.newLogs.length > 0) {
          setFlightLogs((prevLogs) => [...res.newLogs, ...prevLogs].slice(0, 50));
          playRadarBeep(640);
        }

        // Update airspace conflicts
        setConflicts(res.conflicts);
        if (res.conflicts.length > 0) {
          playRadarBeep(1200);
        }

        return res.updatedDrones;
      });
    }, tickInterval);

    return () => clearInterval(timer);
  }, [simulationSpeed, geofences, isMuted]);

  // Selected drone helper
  const selectedDrone = drones.find((d) => d.id === selectedDroneId) || drones[0];

  // Handler: Select Drone
  const handleSelectDrone = (id: string) => {
    setSelectedDroneId(id);
    setIsDetailPanelOpen(true);
    setSelectedWaypointId(null);
    playRadarBeep(980);
  };

  // Handler: Pause / Resume Mission
  const handlePauseResume = (droneId: string) => {
    setDrones((prev) =>
      prev.map((d) => {
        if (d.id === droneId) {
          const nextPaused = !d.isPaused;
          const timeStr = new Date().toTimeString().split(' ')[0];
          setFlightLogs((logs) => [
            {
              id: `log-pause-${Date.now()}`,
              timestamp: timeStr,
              droneId: d.id,
              droneCallsign: d.callsign,
              event: nextPaused ? 'COMMAND: Auto-hover held; Mission paused by operator' : 'COMMAND: Mission resumed along assigned corridor',
              type: nextPaused ? 'warning' : 'info',
            },
            ...logs,
          ]);
          return { ...d, isPaused: nextPaused };
        }
        return d;
      })
    );
  };

  // Handler: Trigger Smart Route Replanning
  const handleTriggerReplan = (droneId: string) => {
    const targetDrone = drones.find((d) => d.id === droneId);
    if (!targetDrone) return;

    const restrictedZone = geofences.find((g) => g.type === 'restricted');
    const polygon = restrictedZone ? restrictedZone.coordinates : [];
    const replan = generateSmartReplan(targetDrone, polygon);

    setReplanData({
      drone: targetDrone,
      proposedRoute: replan.proposedRoute,
      addedDistanceKm: replan.addedDistanceKm,
      addedDelayMinutes: replan.addedDelayMinutes,
    });
  };

  // Handler: Accept Proposed Replan
  const handleAcceptReplan = () => {
    if (!replanData) return;

    setDrones((prev) =>
      prev.map((d) => {
        if (d.id === replanData.drone.id) {
          const timeStr = new Date().toTimeString().split(' ')[0];
          setFlightLogs((logs) => [
            {
              id: `log-replan-${Date.now()}`,
              timestamp: timeStr,
              droneId: d.id,
              droneCallsign: d.callsign,
              event: `SMART REPLAN: West clearance detour approved (+${replanData.addedDistanceKm} km, +${replanData.addedDelayMinutes} min)`,
              type: 'success',
            },
            ...logs,
          ]);

          return {
            ...d,
            route: replanData.proposedRoute,
            originalRoute: d.route,
            currentWaypointIndex: 0,
            status: 'delivering',
            isPaused: false,
          };
        }
        return d;
      })
    );

    setReplanData(null);
  };

  // Handler: Return to Base (RTB)
  const handleTriggerRTB = (droneId: string) => {
    setDrones((prev) =>
      prev.map((d) => {
        if (d.id === droneId) {
          const baseWaypoint: Waypoint = {
            id: `rtb-wp-${Date.now()}`,
            name: 'Hub Alpha Emergency RTB Dock',
            lat: -37.8155,
            lng: 145.1220,
            altitudeMeters: 0,
            type: 'base',
            status: 'upcoming',
            etaMinutes: 4,
          };

          const timeStr = new Date().toTimeString().split(' ')[0];
          setFlightLogs((logs) => [
            {
              id: `log-rtb-${Date.now()}`,
              timestamp: timeStr,
              droneId: d.id,
              droneCallsign: d.callsign,
              event: `COMMAND: Immediate Return-to-Base (RTB) commanded; Aborting current delivery drop`,
              type: 'warning',
            },
            ...logs,
          ]);

          return {
            ...d,
            status: 'returning_to_base',
            statusLabel: 'Returning to Base',
            route: [
              {
                id: `rtb-cur-${Date.now()}`,
                name: `Aborted Point (${d.callsign})`,
                lat: d.vitals.latitude,
                lng: d.vitals.longitude,
                altitudeMeters: d.vitals.altitudeMeters,
                type: 'transit',
                status: 'completed',
              },
              baseWaypoint,
            ],
            currentWaypointIndex: 0,
            isPaused: false,
          };
        }
        return d;
      })
    );
  };

  // Handler: Mark Delivery Complete
  const handleMarkComplete = (droneId: string) => {
    setDrones((prev) =>
      prev.map((d) => {
        if (d.id === droneId) {
          // Trigger confetti pulse
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.8 },
            colors: ['#00f0ff', '#10b981', '#ffffff'],
          });

          const timeStr = new Date().toTimeString().split(' ')[0];
          setFlightLogs((logs) => [
            {
              id: `log-complete-${Date.now()}`,
              timestamp: timeStr,
              droneId: d.id,
              droneCallsign: d.callsign,
              event: `DELIVERY VERIFIED: Optical package tether release confirmed by recipient PIN`,
              type: 'success',
            },
            ...logs,
          ]);

          return {
            ...d,
            status: 'returning_to_base',
            statusLabel: 'Returning to Base',
            delivery: d.delivery ? { ...d.delivery, status: 'Delivered' } : undefined,
          };
        }
        return d;
      })
    );
  };

  // Handler: Acknowledge All Alerts
  const handleAcknowledgeAllAlerts = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, acknowledged: true })));
  };

  // Handler: Acknowledge Single Alert
  const handleAcknowledgeAlert = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)));
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-[#080b12] text-slate-100 overflow-hidden select-none font-sans">
      {/* Top Navigation Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'about') {
            setIsAboutModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        alerts={alerts}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenReplay={() => setIsReplayModalOpen(true)}
      />

      {/* Main Command Workspace */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* TAB 1: LIVE OPERATIONS (Matches reference layout: Fleet Sidebar + Central Map + Detail / Overview + Right Alerts) */}
        {activeTab === 'live' && (
          <div className="flex-1 flex w-full h-full overflow-hidden">
            {/* Left Sidebar: Fleet Monitor */}
            <FleetSidebar
              drones={drones}
              selectedDroneId={selectedDroneId}
              onSelectDrone={handleSelectDrone}
              filter={filter}
              setFilter={setFilter}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              activeAlertsCount={alerts.filter((a) => !a.acknowledged).length}
            />

            {/* Central Workspace: Map / POV + Bottom Panels */}
            <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
              {/* Primary Viewport: Geospatial Map or Synthetic POV Camera */}
              <div className="flex-1 relative w-full h-full min-h-0">
                {viewMode === 'pov' && selectedDrone ? (
                  <DronePOVCamera
                    drone={selectedDrone}
                    onExit={() => setViewMode('2d')}
                  />
                ) : (
                  <MapWorkspace
                    drones={drones}
                    selectedDroneId={selectedDroneId}
                    onSelectDrone={handleSelectDrone}
                    geofences={geofences}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    proposedRoute={replanData ? replanData.proposedRoute : null}
                    selectedWaypointId={selectedWaypointId}
                    onSelectWaypoint={(wpId) => setSelectedWaypointId(wpId)}
                  />
                )}
              </div>

              {/* Bottom Panel: Selected Drone Detail Panel (when selected) OR Fleet Overview Strip */}
              {selectedDroneId && isDetailPanelOpen ? (
                <DroneDetailPanel
                  drone={selectedDrone}
                  onClose={() => setIsDetailPanelOpen(false)}
                  onPauseResume={handlePauseResume}
                  onTriggerReplan={handleTriggerReplan}
                  onTriggerRTB={handleTriggerRTB}
                  onMarkComplete={handleMarkComplete}
                  onSwitchToPOV={() => setViewMode('pov')}
                  onSelectWaypoint={(wpId) => setSelectedWaypointId(wpId)}
                  selectedWaypointId={selectedWaypointId}
                />
              ) : (
                <BottomOverviewPanel
                  drones={drones}
                  flightLogs={flightLogs}
                  onSelectDrone={handleSelectDrone}
                />
              )}
            </div>

            {/* Right Sidebar: Alerts, Airspace Conflict Radar & Mission Status */}
            <RightSidebar
              alerts={alerts}
              conflicts={conflicts}
              onAcknowledgeAll={handleAcknowledgeAllAlerts}
              onAcknowledgeAlert={handleAcknowledgeAlert}
              onSelectDrone={handleSelectDrone}
            />
          </div>
        )}

        {/* TAB 2: FLEET DIRECTORY */}
        {activeTab === 'fleet' && (
          <FleetView
            drones={drones}
            onSelectDroneAndSwitchToLive={(id) => {
              handleSelectDrone(id);
              setActiveTab('live');
            }}
          />
        )}

        {/* TAB 3: MISSIONS MANIFESTS */}
        {activeTab === 'missions' && (
          <MissionsView
            drones={drones}
            onSelectDroneAndSwitchToLive={(id) => {
              handleSelectDrone(id);
              setActiveTab('live');
            }}
          />
        )}

        {/* TAB 4: AIRSPACE & UTM COMPLIANCE */}
        {activeTab === 'airspace' && (
          <AirspaceView
            geofences={geofences}
            conflicts={conflicts}
            onSwitchToLive={() => {
              setViewMode('3d');
              setActiveTab('live');
            }}
          />
        )}

        {/* TAB 5: ANALYTICS & ENERGY EFFICIENCY */}
        {activeTab === 'analytics' && <AnalyticsView />}
      </main>

      {/* MODAL 1: Smart Route Replanning Modal */}
      {replanData && (
        <RouteReplanModal
          drone={replanData.drone}
          proposedRoute={replanData.proposedRoute}
          addedDistanceKm={replanData.addedDistanceKm}
          addedDelayMinutes={replanData.addedDelayMinutes}
          onAccept={handleAcceptReplan}
          onReject={() => setReplanData(null)}
        />
      )}

      {/* MODAL 2: Mission Flight Replay Modal */}
      {isReplayModalOpen && selectedDrone && (
        <MissionReplayModal
          drone={selectedDrone}
          onClose={() => setIsReplayModalOpen(false)}
        />
      )}

      {/* MODAL 3: Command Center Settings Modal */}
      {isSettingsModalOpen && (
        <SettingsModal
          onClose={() => setIsSettingsModalOpen(false)}
          simulationSpeed={simulationSpeed}
          setSimulationSpeed={setSimulationSpeed}
          isMuted={isMuted}
          setIsMuted={setIsMuted}
          safetyReservePercent={safetyReservePercent}
          setSafetyReservePercent={setSafetyReservePercent}
          separationDistanceMeters={separationDistanceMeters}
          setSeparationDistanceMeters={setSeparationDistanceMeters}
        />
      )}

      {/* MODAL 4: About Aerovata by Taspora System Modal */}
      {isAboutModalOpen && (
        <AboutModal onClose={() => setIsAboutModalOpen(false)} />
      )}
    </div>
  );
}

export default App;
