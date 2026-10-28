import React from 'react';
import { 
  X, 
  Info, 
  ShieldCheck, 
  Cpu, 
  Radio, 
  Layers, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';

interface AboutModalProps {
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm select-none p-4 font-mono">
      <div className="w-full max-w-2xl bg-[#0e1422] border border-cyan-500/70 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-[#131c2e] border-b border-[#223352] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center text-white font-extrabold text-sm">
              A
            </div>
            <div>
              <div className="font-extrabold text-sm text-white tracking-widest uppercase">
                AEROVATA by TASPORA
              </div>
              <div className="text-[10px] text-cyan-400">
                AUTONOMOUS DRONE DELIVERY COMMAND CENTER • BVLOS UTM PLATFORM
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto text-xs text-slate-300 leading-relaxed">
          {/* Executive Overview */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1.5 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" /> System Architecture & Mission
            </h3>
            <p className="text-slate-400">
              <strong className="text-slate-200">AEROVATA by TASPORA</strong> is an enterprise-grade autonomous drone delivery command and control platform designed for commercial beyond-visual-line-of-sight (BVLOS) operations, high-priority medical logistics, and multi-drone corridor deconfliction.
            </p>
          </div>

          {/* Core Aerospace Capabilities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div className="bg-[#121929] border border-[#212f4d] p-3 rounded-md">
              <div className="font-bold text-cyan-300 mb-1 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" /> Multi-Tier Airspace UTM
              </div>
              <p className="text-[11px] text-slate-400">
                Real-time 2D, 3D extruded airspace, and synthetic gimbal POV camera modes with automated geofence barriers and no-fly zone enforcement.
              </p>
            </div>

            <div className="bg-[#121929] border border-[#212f4d] p-3 rounded-md">
              <div className="font-bold text-emerald-300 mb-1 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-emerald-400" /> Smart Route Replanning
              </div>
              <p className="text-[11px] text-slate-400">
                Autonomous convex detour generation around restricted sectors, displaying delta distance and delay with operator confirmation gating.
              </p>
            </div>

            <div className="bg-[#121929] border border-[#212f4d] p-3 rounded-md">
              <div className="font-bold text-purple-300 mb-1 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-purple-400" /> Conflict Detection Radar
              </div>
              <p className="text-[11px] text-slate-400">
                Continuous 20Hz trajectory separation monitoring between all flying airframes with automated vertical and horizontal evasion recommendations.
              </p>
            </div>

            <div className="bg-[#121929] border border-[#212f4d] p-3 rounded-md">
              <div className="font-bold text-amber-300 mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Smart Return-to-Base (RTB)
              </div>
              <p className="text-[11px] text-slate-400">
                Calibrated energy modeling factoring payload weight, battery discharge curves, and atmospheric headwinds with a 20% safety reserve buffer.
              </p>
            </div>
          </div>

          {/* Hardware & MAVLink Integration Readiness */}
          <div className="p-3 bg-[#0a0f18] rounded-md border border-[#1b273d] space-y-1.5">
            <div className="font-bold text-white text-[11px] uppercase tracking-wider">
              MAVLink 2.0 & ROS2 Micro-XRCE Bridge Integration
            </div>
            <p className="text-[11px] text-slate-400">
              The telemetry engine uses an extensible state model ready to swap from client simulation to secure WebSocket / gRPC feeds connected to real Pixhawk / PX4 / ArduPilot autopilots. No hardware keys or secrets are exposed in client builds.
            </p>
            <div className="text-[10px] text-cyan-400 font-bold pt-1">
              STATUS: DEMONSTRATION SIMULATION ACTIVE • DETERMINISTIC SYNTHETIC TELEMETRY
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#131c2e] border-t border-[#223352] flex items-center justify-between text-xs text-slate-400">
          <span>Version 3.8.2-commercial (Release Build)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded transition-colors"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
