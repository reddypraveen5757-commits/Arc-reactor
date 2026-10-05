import React from 'react';
import { soundEngine } from '../audio/soundEngine.ts';
import {
  Zap,
  Rotate3d,
  RotateCcw,
  Eye,
  Layers,
  Play,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface ControlPanelProps {
  onStart: () => void;
  powerBoost: boolean;
  onTogglePowerBoost: () => void;
  autoRotate: boolean;
  onToggleAutoRotate: () => void;
  onReset: () => void;
  hologramMode: boolean;
  onToggleHologram: () => void;
  explodedView: boolean;
  onToggleExplodedView: () => void;
  isMuted: boolean;
  onToggleSound: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  onStart,
  powerBoost,
  onTogglePowerBoost,
  autoRotate,
  onToggleAutoRotate,
  onReset,
  hologramMode,
  onToggleHologram,
  explodedView,
  onToggleExplodedView,
  isMuted,
  onToggleSound,
}) => {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-4xl px-4 flex flex-col items-center gap-3">
      {/* Primary Action Button Cluster */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 p-1.5 sm:p-2 bg-black/60 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-2xl glow-cyan-sm">
        {/* 1. START / REBOOT SEQUENCE */}
        <button
          onClick={() => {
            soundEngine.playStartup();
            onStart();
          }}
          className="flex items-center gap-1.5 py-2 px-3 sm:px-4 text-xs sm:text-sm font-semibold font-orbitron tracking-wider text-cyan-300 hover:text-white bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/40 hover:border-cyan-400 rounded-xl transition-all duration-200 active:scale-95 whitespace-nowrap group cursor-pointer"
          title="Trigger cinematic startup and assembly sequence"
        >
          <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 group-hover:scale-110 transition-transform fill-cyan-400/20" />
          <span>START</span>
        </button>

        {/* 2. POWER BOOST */}
        <button
          onClick={() => {
            soundEngine.playPowerBoost(!powerBoost);
            onTogglePowerBoost();
          }}
          className={`flex items-center gap-1.5 py-2 px-3 sm:px-4 text-xs sm:text-sm font-semibold font-orbitron tracking-wider rounded-xl transition-all duration-200 active:scale-95 whitespace-nowrap cursor-pointer ${
            powerBoost
              ? 'bg-amber-500 text-black border border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.7)] animate-pulse'
              : 'text-amber-300 hover:text-white bg-amber-950/30 hover:bg-amber-900/50 border border-amber-500/40 hover:border-amber-400'
          }`}
          title="Overclock reactor output to 140%"
        >
          <Zap className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${powerBoost ? 'fill-black' : 'text-amber-400'}`} />
          <span>POWER BOOST</span>
        </button>

        {/* 3. ROTATE (Auto-Rotate Toggle) */}
        <button
          onClick={() => {
            soundEngine.playClick(900);
            onToggleAutoRotate();
          }}
          className={`flex items-center gap-1.5 py-2 px-3 sm:px-4 text-xs sm:text-sm font-semibold font-orbitron tracking-wider rounded-xl transition-all duration-200 active:scale-95 whitespace-nowrap cursor-pointer ${
            autoRotate
              ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400 glow-cyan-sm'
              : 'text-slate-300 hover:text-white bg-slate-900/50 hover:bg-slate-800/60 border border-slate-700/60'
          }`}
          title="Toggle automatic orbital rotation"
        >
          <Rotate3d className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
          <span>ROTATE</span>
        </button>

        {/* 4. RESET VIEW */}
        <button
          onClick={() => {
            soundEngine.playClick(800);
            onReset();
          }}
          className="flex items-center gap-1.5 py-2 px-3 sm:px-4 text-xs sm:text-sm font-semibold font-orbitron tracking-wider text-slate-300 hover:text-white bg-slate-900/50 hover:bg-slate-800/60 border border-slate-700/60 hover:border-slate-500 rounded-xl transition-all duration-200 active:scale-95 whitespace-nowrap cursor-pointer"
          title="Reset 3D camera to default front view"
        >
          <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
          <span>RESET</span>
        </button>

        {/* 5. HOLOGRAM MODE */}
        <button
          onClick={() => {
            soundEngine.playHologramToggle(!hologramMode);
            onToggleHologram();
          }}
          className={`flex items-center gap-1.5 py-2 px-3 sm:px-4 text-xs sm:text-sm font-semibold font-orbitron tracking-wider rounded-xl transition-all duration-200 active:scale-95 whitespace-nowrap cursor-pointer ${
            hologramMode
              ? 'bg-cyan-500 text-black border border-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.7)]'
              : 'text-cyan-300 hover:text-white bg-cyan-950/30 hover:bg-cyan-900/50 border border-cyan-500/40 hover:border-cyan-400'
          }`}
          title="Switch to CAD wireframe holographic blueprint"
        >
          <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>HOLOGRAM</span>
        </button>

        {/* 6. EXPLODED VIEW */}
        <button
          onClick={() => {
            soundEngine.playServoSound(!explodedView);
            onToggleExplodedView();
          }}
          className={`flex items-center gap-1.5 py-2 px-3 sm:px-4 text-xs sm:text-sm font-semibold font-orbitron tracking-wider rounded-xl transition-all duration-200 active:scale-95 whitespace-nowrap cursor-pointer ${
            explodedView
              ? 'bg-sky-500 text-black border border-sky-300 shadow-[0_0_20px_rgba(56,189,248,0.7)]'
              : 'text-sky-300 hover:text-white bg-sky-950/30 hover:bg-sky-900/50 border border-sky-500/40 hover:border-sky-400'
          }`}
          title="Expand mechanical layers along Z axis for internal inspection"
        >
          <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>EXPLODE</span>
        </button>

        {/* 7. SOUND TOGGLE */}
        <button
          onClick={() => {
            soundEngine.playClick(1100);
            onToggleSound();
          }}
          className={`flex items-center justify-center p-2 text-xs rounded-xl border transition-all duration-200 active:scale-95 cursor-pointer ${
            !isMuted
              ? 'text-cyan-300 bg-cyan-950/40 border-cyan-500/50 hover:bg-cyan-900/60'
              : 'text-slate-500 bg-slate-900/60 border-slate-700/50 hover:text-slate-300'
          }`}
          title={isMuted ? 'Unmute procedural sound FX' : 'Mute sound FX'}
        >
          {!isMuted ? (
            <Volume2 className="w-4 h-4 text-cyan-400" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-500" />
          )}
        </button>
      </div>

      {/* Helper Interaction Guide / Footer Status */}
      <div className="flex items-center gap-3 text-[11px] font-tech text-cyan-400/70 tracking-widest uppercase">
        <span>DRAG TO ROTATE 3D</span>
        <span aria-hidden="true">·</span>
        <span>SCROLL / PINCH TO ZOOM</span>
        <span aria-hidden="true">·</span>
        <span>POWER SYSTEM ONLINE</span>
      </div>
    </div>
  );
};
