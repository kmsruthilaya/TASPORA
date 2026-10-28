export type DroneStatus = 
  | 'delivering'
  | 'en_route_pickup'
  | 'returning_to_base'
  | 'charging'
  | 'attention_required'
  | 'standby'
  | 'hovering';

export type MissionPriority = 'URGENT' | 'HIGH' | 'STANDARD' | 'ROUTINE';

export interface Waypoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  altitudeMeters: number;
  type: 'base' | 'pickup' | 'transit' | 'delivery' | 'handoff';
  status: 'completed' | 'active' | 'upcoming';
  etaMinutes?: number;
}

export interface DroneVitals {
  batteryPercentage: number;
  batteryVoltage: number;
  estimatedFlightTimeMinutes: number;
  altitudeMeters: number;
  groundSpeedKmh: number;
  verticalSpeedMs: number;
  headingDegrees: number;
  latitude: number;
  longitude: number;
  gpsFix: 'RTK_FIX' | '3D_FIX' | 'DGPS' | 'SEARCHING';
  satellites: number;
  signalStrengthDbm: number;
  signalQualityPercent: number;
  payloadWeightKg: number;
  maxPayloadKg: number;
  motorHealthPercent: number;
  motorTempsCelsius: number[];
  energyBurnRateWhPerKm: number;
  energyRequiredToTargetWh: number;
  energyReserveMarginPercent: number;
  rtbStatus: 'SUFFICIENT' | 'LOW_RESERVE' | 'RTB_RECOMMENDED';
}

export interface DeliveryDetails {
  missionId: string;
  packageId: string;
  packageDescription: string;
  packageWeightKg: number;
  priority: MissionPriority;
  pickupLocation: string;
  destinationAddress: string;
  recipientName: string;
  recipientPhone: string;
  recipientConfirmed: boolean;
  dispatchTime: string;
  estimatedArrivalTime: string;
  etaConfidencePercent: number;
  etaConfidenceReason: string;
  status: 'In Progress' | 'Dispatched' | 'Delivered' | 'On Hold' | 'Rerouted';
}

export interface Drone {
  id: string;
  callsign: string;
  model: string;
  serialNumber: string;
  status: DroneStatus;
  statusLabel: string;
  currentWaypointIndex: number;
  route: Waypoint[];
  originalRoute?: Waypoint[]; // Used during replanning
  proposedRoute?: Waypoint[]; // Alternative route candidate
  vitals: DroneVitals;
  delivery?: DeliveryDetails;
  flightHours: number;
  lastMaintenance: string;
  isPaused: boolean;
  inSimulationConflict?: boolean;
}

export interface AirspaceAlert {
  id: string;
  type: 'restricted_zone' | 'geofence' | 'separation_conflict' | 'low_battery' | 'weather_gust';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  droneId?: string;
  timestamp: string;
  acknowledged: boolean;
  actionRequired?: string;
}

export interface AirspaceConflict {
  id: string;
  droneAId: string;
  droneBId: string;
  distanceMeters: number;
  estimatedTimeToConflictSec: number;
  predictedLocation: [number, number];
  suggestedAction: string;
  severity: 'critical' | 'warning';
}

export interface FlightLogEntry {
  id: string;
  timestamp: string;
  droneId: string;
  droneCallsign: string;
  event: string;
  type: 'info' | 'success' | 'warning' | 'critical';
}

export interface GeofenceZone {
  id: string;
  name: string;
  type: 'boundary' | 'caution' | 'restricted';
  coordinates: [number, number][]; // [lng, lat]
  minAltitudeMeters: number;
  maxAltitudeMeters: number;
  description: string;
}
