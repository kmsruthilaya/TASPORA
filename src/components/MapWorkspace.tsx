import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import { 
  Layers, 
  Compass, 
  Maximize2, 
  Plus, 
  Minus, 
  Eye, 
  Box, 
  Map as MapIcon, 
  Satellite, 
  LocateFixed, 
  ShieldAlert,
  Flame,
  Wind
} from 'lucide-react';
import { Drone, GeofenceZone, Waypoint } from '../types/fleet';
import { AIRSPACE_CENTER } from '../data/mockFleet';

interface MapWorkspaceProps {
  drones: Drone[];
  selectedDroneId: string | null;
  onSelectDrone: (id: string) => void;
  geofences: GeofenceZone[];
  viewMode: '2d' | '3d' | 'pov';
  setViewMode: (mode: '2d' | '3d' | 'pov') => void;
  proposedRoute: Waypoint[] | null;
  selectedWaypointId: string | null;
  onSelectWaypoint: (wpId: string) => void;
}

export const MapWorkspace: React.FC<MapWorkspaceProps> = ({
  drones,
  selectedDroneId,
  onSelectDrone,
  geofences,
  viewMode,
  setViewMode,
  proposedRoute,
  selectedWaypointId,
  onSelectWaypoint,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: maplibregl.Marker }>({});
  const waypointMarkersRef = useRef<maplibregl.Marker[]>([]);

  // Map layer toggles
  const [showFlightPaths, setShowFlightPaths] = useState(true);
  const [showGeofences, setShowGeofences] = useState(true);
  const [showRestricted, setShowRestricted] = useState(true);
  const [showWaypoints, setShowWaypoints] = useState(true);
  const [mapStyle, setMapStyle] = useState<'satellite' | 'dark'>('satellite');
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  // Initialize MapLibre
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Tactical satellite style matching the user's reference image
    const satelliteStyle: maplibregl.StyleSpecification = {
      version: 8,
      sources: {
        'esri-satellite': {
          type: 'raster',
          tiles: [
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          ],
          tileSize: 256,
          attribution: 'Esri, Maxar, Earthstar Geographics',
          maxzoom: 19,
        },
      },
      layers: [
        {
          id: 'satellite-tiles',
          type: 'raster',
          source: 'esri-satellite',
          paint: {
            'raster-opacity': 0.88,
            'raster-contrast': 0.15,
            'raster-brightness-min': 0.05,
          },
        },
      ],
    };

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: satelliteStyle,
      center: AIRSPACE_CENTER,
      zoom: 14.8,
      pitch: viewMode === '3d' ? 58 : 0,
      bearing: viewMode === '3d' ? -18 : 0,
      attributionControl: false,
    });

    map.on('load', () => {
      // Add Sources and Layers for Geofences, Restricted Zones & Flight Paths
      initMapLayers(map);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update base map style (Satellite vs Dark Vector)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const source = map.getSource('esri-satellite') as maplibregl.RasterTileSource;
    if (source && map.getLayer('satellite-tiles')) {
      if (mapStyle === 'satellite') {
        map.setPaintProperty('satellite-tiles', 'raster-opacity', 0.88);
      } else {
        // Dark vector mode simulation
        map.setPaintProperty('satellite-tiles', 'raster-opacity', 0.25);
      }
    }
  }, [mapStyle]);

  // Handle 2D vs 3D camera transitions
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (viewMode === '2d') {
      map.easeTo({
        pitch: 0,
        bearing: 0,
        duration: 1200,
      });
    } else if (viewMode === '3d') {
      map.easeTo({
        pitch: 58,
        bearing: -22,
        duration: 1200,
      });
    }
  }, [viewMode]);

  // Center map on selected drone
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedDroneId) return;

    const selectedDrone = drones.find((d) => d.id === selectedDroneId);
    if (selectedDrone) {
      map.easeTo({
        center: [selectedDrone.vitals.longitude, selectedDrone.vitals.latitude],
        zoom: Math.max(map.getZoom(), 15.2),
        duration: 800,
      });
    }
  }, [selectedDroneId]);

  // Initialize Map Layers (Restricted polygon, Geofences, Flight Paths)
  const initMapLayers = (map: maplibregl.Map) => {
    // 1. Restricted Zones Source (Sector 4 Red Zone)
    const restrictedGeo = geofences.find((g) => g.type === 'restricted');
    if (restrictedGeo) {
      map.addSource('restricted-zone-src', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: { name: restrictedGeo.name },
          geometry: {
            type: 'Polygon',
            coordinates: [restrictedGeo.coordinates],
          },
        },
      });

      // Red fill with hatching/grid effect
      map.addLayer({
        id: 'restricted-zone-fill',
        type: 'fill',
        source: 'restricted-zone-src',
        paint: {
          'fill-color': '#dc2626',
          'fill-opacity': 0.38,
        },
      });

      // Bright red outline
      map.addLayer({
        id: 'restricted-zone-line',
        type: 'line',
        source: 'restricted-zone-src',
        paint: {
          'line-color': '#ef4444',
          'line-width': 2.5,
          'line-dasharray': [3, 1.5],
        },
      });
    }

    // 2. Caution Zone (Yellow Zone)
    const cautionGeo = geofences.find((g) => g.type === 'caution');
    if (cautionGeo) {
      map.addSource('caution-zone-src', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: { name: cautionGeo.name },
          geometry: {
            type: 'Polygon',
            coordinates: [cautionGeo.coordinates],
          },
        },
      });

      map.addLayer({
        id: 'caution-zone-fill',
        type: 'fill',
        source: 'caution-zone-src',
        paint: {
          'fill-color': '#eab308',
          'fill-opacity': 0.18,
        },
      });

      map.addLayer({
        id: 'caution-zone-line',
        type: 'line',
        source: 'caution-zone-src',
        paint: {
          'line-color': '#facc15',
          'line-width': 2,
        },
      });
    }

    // 3. BVLOS Outer Perimeter (Boundary)
    const boundaryGeo = geofences.find((g) => g.type === 'boundary');
    if (boundaryGeo) {
      map.addSource('boundary-zone-src', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: { name: boundaryGeo.name },
          geometry: {
            type: 'Polygon',
            coordinates: [boundaryGeo.coordinates],
          },
        },
      });

      map.addLayer({
        id: 'boundary-zone-line',
        type: 'line',
        source: 'boundary-zone-src',
        paint: {
          'line-color': '#38bdf8',
          'line-width': 1.5,
          'line-dasharray': [4, 3],
          'line-opacity': 0.6,
        },
      });
    }

    // 4. Flight Paths Source
    map.addSource('flight-paths-src', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [],
      },
    });

    // Glowing cyan/blue dashed line
    map.addLayer({
      id: 'flight-paths-glow',
      type: 'line',
      source: 'flight-paths-src',
      paint: {
        'line-color': '#06b6d4',
        'line-width': 5,
        'line-opacity': 0.35,
        'line-blur': 3,
      },
    });

    map.addLayer({
      id: 'flight-paths-line',
      type: 'line',
      source: 'flight-paths-src',
      paint: {
        'line-color': '#22d3ee',
        'line-width': 2.2,
        'line-dasharray': [3, 2],
      },
    });

    // 5. Proposed Replanning Detour Route Source
    map.addSource('proposed-replan-src', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [],
      },
    });

    map.addLayer({
      id: 'proposed-replan-line',
      type: 'line',
      source: 'proposed-replan-src',
      paint: {
        'line-color': '#10b981',
        'line-width': 3.5,
        'line-dasharray': [2, 1],
      },
    });
  };

  // Update Flight Paths GeoJSON when drones change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const source = map.getSource('flight-paths-src') as maplibregl.GeoJSONSource;
    if (!source) return;

    const features = drones
      .filter((d) => d.route.length > 1)
      .map((d) => {
        const isSelected = d.id === selectedDroneId;
        const coordinates = d.route.map((w) => [w.lng, w.lat]);
        return {
          type: 'Feature' as const,
          properties: {
            droneId: d.id,
            callsign: d.callsign,
            isSelected,
            status: d.status,
          },
          geometry: {
            type: 'LineString' as const,
            coordinates,
          },
        };
      });

    source.setData({
      type: 'FeatureCollection',
      features,
    });
  }, [drones, selectedDroneId]);

  // Update Proposed Replan Path GeoJSON
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const source = map.getSource('proposed-replan-src') as maplibregl.GeoJSONSource;
    if (!source) return;

    if (proposedRoute && proposedRoute.length > 1) {
      source.setData({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { type: 'replan' },
            geometry: {
              type: 'LineString',
              coordinates: proposedRoute.map((w) => [w.lng, w.lat]),
            },
          },
        ],
      });
    } else {
      source.setData({
        type: 'FeatureCollection',
        features: [],
      });
    }
  }, [proposedRoute]);

  // Layer Visibility Toggles
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    if (map.getLayer('flight-paths-line')) {
      map.setLayoutProperty('flight-paths-line', 'visibility', showFlightPaths ? 'visible' : 'none');
      map.setLayoutProperty('flight-paths-glow', 'visibility', showFlightPaths ? 'visible' : 'none');
    }
    if (map.getLayer('restricted-zone-fill')) {
      map.setLayoutProperty('restricted-zone-fill', 'visibility', showRestricted ? 'visible' : 'none');
      map.setLayoutProperty('restricted-zone-line', 'visibility', showRestricted ? 'visible' : 'none');
    }
    if (map.getLayer('caution-zone-fill')) {
      map.setLayoutProperty('caution-zone-fill', 'visibility', showGeofences ? 'visible' : 'none');
      map.setLayoutProperty('caution-zone-line', 'visibility', showGeofences ? 'visible' : 'none');
    }
  }, [showFlightPaths, showGeofences, showRestricted]);

  // Synchronize Drone HTML Markers (Matches Reference Image with Heading, Alt, Battery)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    drones.forEach((drone) => {
      const isSelected = drone.id === selectedDroneId;
      let marker = markersRef.current[drone.id];

      if (!marker) {
        // Create custom DOM element for drone marker
        const el = document.createElement('div');
        el.className = 'drone-marker-container cursor-pointer select-none';
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          onSelectDrone(drone.id);
        });

        marker = new maplibregl.Marker({
          element: el,
          anchor: 'center',
        })
          .setLngLat([drone.vitals.longitude, drone.vitals.latitude])
          .addTo(map);

        markersRef.current[drone.id] = marker;
      } else {
        marker.setLngLat([drone.vitals.longitude, drone.vitals.latitude]);
      }

      // Update inner HTML of marker to match screenshot badge
      const markerEl = marker.getElement();
      const batColor = drone.vitals.batteryPercentage > 50 ? '#10b981' : drone.vitals.batteryPercentage > 25 ? '#f59e0b' : '#ef4444';
      const isWarning = drone.status === 'attention_required' || drone.vitals.batteryPercentage < 30;

      markerEl.innerHTML = `
        <div class="relative flex flex-col items-center group">
          ${isSelected ? `
            <!-- Pulsing Radar Ring for Selected Drone -->
            <div class="absolute -inset-3 rounded-full bg-cyan-400/20 radar-ring pointer-events-none"></div>
            <div class="absolute -inset-1.5 rounded-full border border-cyan-400/80 pointer-events-none"></div>
          ` : ''}

          <!-- Directional Heading Arrow & Drone Icon -->
          <div class="w-8 h-8 rounded-full ${isWarning ? 'bg-amber-600' : isSelected ? 'bg-cyan-500' : 'bg-slate-900'} border-2 ${isSelected ? 'border-white' : 'border-cyan-400'} shadow-lg flex items-center justify-center transition-transform duration-300" style="transform: rotate(${drone.vitals.headingDegrees}deg);">
            <svg viewBox="0 0 24 24" class="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 19 21 12 17 5 21 12 2" fill="currentColor" fill-opacity="0.8" />
            </svg>
          </div>

          <!-- Drone Badge Tag (Matches Reference Image) -->
          <div class="mt-1 px-2 py-0.5 rounded bg-[#0d121f]/95 border ${isSelected ? 'border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.4)]' : 'border-[#22314d] text-slate-200'} text-[10px] font-mono font-bold whitespace-nowrap flex items-center gap-1.5 backdrop-blur-sm pointer-events-none">
            <span class="${isWarning ? 'text-amber-400' : 'text-cyan-400'}">${drone.callsign}</span>
            <span class="text-slate-400">•</span>
            <span class="text-slate-300">${Math.round(drone.vitals.altitudeMeters)}m</span>
            <span class="text-slate-400">•</span>
            <span style="color: ${batColor}">${Math.round(drone.vitals.batteryPercentage)}%</span>
          </div>
        </div>
      `;
    });
  }, [drones, selectedDroneId]);

  // Synchronize Waypoint Markers for Selected Drone
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing waypoint markers
    waypointMarkersRef.current.forEach((m) => m.remove());
    waypointMarkersRef.current = [];

    if (!showWaypoints) return;

    const activeDrone = drones.find((d) => d.id === selectedDroneId) || drones[0];
    if (!activeDrone) return;

    activeDrone.route.forEach((wp, idx) => {
      const isSelectedWp = wp.id === selectedWaypointId;
      const el = document.createElement('div');
      el.className = 'cursor-pointer select-none';
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectWaypoint(wp.id);
      });

      let iconHtml = 'WP';
      let bgColor = 'bg-slate-800 border-slate-600';
      if (wp.type === 'base') {
        iconHtml = 'H';
        bgColor = 'bg-cyan-900 border-cyan-400 text-cyan-300';
      } else if (wp.type === 'delivery') {
        iconHtml = '📍';
        bgColor = 'bg-emerald-900 border-emerald-400 text-emerald-300';
      } else if (wp.type === 'pickup') {
        iconHtml = '📦';
        bgColor = 'bg-blue-900 border-blue-400 text-blue-300';
      } else if (wp.type === 'handoff') {
        iconHtml = 'H';
        bgColor = 'bg-indigo-900 border-indigo-400 text-indigo-300';
      }

      el.innerHTML = `
        <div class="relative flex flex-col items-center group">
          <div class="w-6 h-6 rounded-full ${bgColor} border-2 flex items-center justify-center text-[10px] font-bold font-mono shadow-md ${isSelectedWp ? 'ring-2 ring-white scale-110' : ''}">
            ${iconHtml}
          </div>
          <div class="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-7 bg-slate-900 text-white text-[9px] font-mono px-1.5 py-0.5 rounded border border-slate-700 whitespace-nowrap pointer-events-none">
            ${wp.name} (${wp.altitudeMeters}m)
          </div>
        </div>
      `;

      const m = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([wp.lng, wp.lat])
        .addTo(map);

      waypointMarkersRef.current.push(m);
    });
  }, [drones, selectedDroneId, selectedWaypointId, showWaypoints]);

  return (
    <div className="relative flex-1 h-full w-full bg-[#080b12] overflow-hidden">
      {/* MapLibre GL Canvas Container */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

      {/* Static Airspace Labels matching Reference Image */}
      {/* 1. RESTRICTED ZONE center badge */}
      <div 
        className="absolute top-[28%] left-[58%] -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none z-10 transition-opacity"
        style={{ opacity: showRestricted ? 1 : 0 }}
      >
        <div className="px-3 py-1 bg-red-950/80 border border-red-500/80 rounded text-red-300 text-[11px] font-extrabold tracking-widest uppercase font-mono shadow-[0_0_15px_rgba(239,68,68,0.5)]">
          RESTRICTED ZONE
        </div>
      </div>

      {/* 2. CAUTION AREA label */}
      <div 
        className="absolute top-[42%] left-[72%] -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none z-10 transition-opacity"
        style={{ opacity: showGeofences ? 1 : 0 }}
      >
        <div className="px-2.5 py-0.5 bg-amber-950/70 border border-amber-500/70 rounded text-amber-300 text-[9px] font-bold tracking-wider uppercase font-mono shadow-[0_0_10px_rgba(245,158,11,0.3)]">
          CAUTION AREA
        </div>
      </div>

      {/* Top-Right Floating Controls (Matches Reference Image) */}
      <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
        {/* Primary View Modes Switcher: 2D | 3D | POV (Exactly per specs) */}
        <div className="flex items-center bg-[#0d121f]/90 backdrop-blur-md p-1 rounded-md border border-[#243350] shadow-xl">
          <button
            onClick={() => setViewMode('2d')}
            className={`px-3 py-1.5 rounded text-xs font-bold font-mono transition-all flex items-center gap-1.5 ${
              viewMode === '2d'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
            title="Conventional Top-Down 2D Tactical View"
          >
            <MapIcon className="w-3.5 h-3.5" />
            2D
          </button>

          <button
            onClick={() => setViewMode('3d')}
            className={`px-3 py-1.5 rounded text-xs font-bold font-mono transition-all flex items-center gap-1.5 ${
              viewMode === '3d'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
            title="3D Airspace View with Extruded Altitude & Terrain Tilt"
          >
            <Box className="w-3.5 h-3.5" />
            3D
          </button>

          <button
            onClick={() => setViewMode('pov')}
            className={`px-3 py-1.5 rounded text-xs font-bold font-mono transition-all flex items-center gap-1.5 ${
              viewMode === 'pov'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
            title="First-Person Drone Cockpit / Forward Camera POV"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400 group-hover:text-cyan-300" />
            POV
          </button>
        </div>

        {/* Quick Camera & Map Action Buttons */}
        <div className="flex items-center gap-1 bg-[#0d121f]/90 backdrop-blur-md p-1 rounded-md border border-[#243350] shadow-xl text-slate-300">
          {/* Zoom In */}
          <button
            onClick={() => mapRef.current?.zoomIn()}
            className="p-1.5 hover:text-cyan-300 hover:bg-slate-800/60 rounded transition-colors"
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Zoom Out */}
          <button
            onClick={() => mapRef.current?.zoomOut()}
            className="p-1.5 hover:text-cyan-300 hover:bg-slate-800/60 rounded transition-colors"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>

          {/* Reset North / Compass */}
          <button
            onClick={() => mapRef.current?.resetNorthPitch()}
            className="p-1.5 hover:text-cyan-300 hover:bg-slate-800/60 rounded transition-colors"
            title="Reset North & Pitch"
          >
            <Compass className="w-4 h-4 text-cyan-400" />
          </button>

          {/* Center on Selected Drone */}
          <button
            onClick={() => {
              const d = drones.find((dr) => dr.id === selectedDroneId) || drones[0];
              if (d && mapRef.current) {
                mapRef.current.easeTo({
                  center: [d.vitals.longitude, d.vitals.latitude],
                  zoom: 15.5,
                  duration: 800,
                });
              }
            }}
            className="p-1.5 hover:text-cyan-300 hover:bg-slate-800/60 rounded transition-colors"
            title="Track Selected Aircraft"
          >
            <LocateFixed className="w-4 h-4 text-emerald-400" />
          </button>

          {/* Layers Popover Toggle */}
          <button
            onClick={() => setShowLayerMenu((prev) => !prev)}
            className={`p-1.5 rounded transition-colors ${showLayerMenu ? 'bg-cyan-500/20 text-cyan-300' : 'hover:text-cyan-300 hover:bg-slate-800/60'}`}
            title="Toggle Map Layers"
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>

        {/* Layers Dropdown Menu */}
        {showLayerMenu && (
          <div className="w-52 bg-[#0c111e]/95 backdrop-blur-md border border-[#233352] rounded-md p-3 shadow-2xl text-xs space-y-2 select-none">
            <div className="font-bold font-mono uppercase text-slate-300 tracking-wider text-[11px] pb-1.5 border-b border-slate-800 flex items-center justify-between">
              <span>AIRSPACE LAYERS</span>
              <button 
                onClick={() => setShowLayerMenu(false)}
                className="text-slate-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <label className="flex items-center justify-between cursor-pointer text-slate-300 hover:text-white py-0.5">
              <span>Flight Paths</span>
              <input
                type="checkbox"
                checked={showFlightPaths}
                onChange={(e) => setShowFlightPaths(e.target.checked)}
                className="accent-cyan-400 rounded"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer text-slate-300 hover:text-white py-0.5">
              <span>Geofence Buffers</span>
              <input
                type="checkbox"
                checked={showGeofences}
                onChange={(e) => setShowGeofences(e.target.checked)}
                className="accent-amber-400 rounded"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer text-slate-300 hover:text-white py-0.5">
              <span>Restricted Zones</span>
              <input
                type="checkbox"
                checked={showRestricted}
                onChange={(e) => setShowRestricted(e.target.checked)}
                className="accent-rose-500 rounded"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer text-slate-300 hover:text-white py-0.5">
              <span>Waypoints & Hubs</span>
              <input
                type="checkbox"
                checked={showWaypoints}
                onChange={(e) => setShowWaypoints(e.target.checked)}
                className="accent-cyan-400 rounded"
              />
            </label>

            <div className="pt-2 border-t border-slate-800 text-[10px] space-y-1">
              <div className="text-slate-400 font-mono">BASEMAP STYLE</div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setMapStyle('satellite')}
                  className={`px-2 py-1 rounded text-center font-mono font-medium ${mapStyle === 'satellite' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50' : 'bg-slate-800 text-slate-400'}`}
                >
                  Satellite
                </button>
                <button
                  onClick={() => setMapStyle('dark')}
                  className={`px-2 py-1 rounded text-center font-mono font-medium ${mapStyle === 'dark' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50' : 'bg-slate-800 text-slate-400'}`}
                >
                  Dark Radar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Scale Bar (Matches Reference Image: "500 m") */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 bg-[#0c111e]/85 backdrop-blur-md px-2.5 py-1 rounded border border-[#22314d] text-slate-300 text-[10px] font-mono shadow-lg">
        <div className="w-14 h-1.5 border-b-2 border-l-2 border-r-2 border-cyan-400"></div>
        <span>500 m</span>
      </div>

      {/* Bottom Legend (Matches Reference Image: "--- Flight Path", "■ Geofence", "■ Restricted") */}
      <div className="absolute bottom-4 right-4 z-20 hidden sm:flex items-center gap-4 bg-[#0c111e]/90 backdrop-blur-md px-3 py-1.5 rounded border border-[#22314d] text-[11px] font-mono text-slate-300 shadow-lg select-none">
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-0.5 border-b-2 border-dashed border-cyan-400"></span>
          <span>Flight Path</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 border border-amber-400 bg-amber-400/20"></span>
          <span>Geofence</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 border border-rose-500 bg-rose-500/30"></span>
          <span>Restricted</span>
        </div>
      </div>
    </div>
  );
};
