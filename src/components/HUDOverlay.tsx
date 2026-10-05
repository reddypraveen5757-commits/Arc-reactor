import React, { useEffect, useState } from 'react';
import { ReactorTheme } from '../three/ArcReactorScene.ts';

interface HUDOverlayProps {
  theme: ReactorTheme;
  powerBoost: boolean;
  hologramMode: boolean;
  explodedView: boolean;
  isStartingUp: boolean;
}

export const HUDOverlay: React.FC<HUDOverlayProps> = ({
  theme,
  powerBoost,
  hologramMode,
  explodedView,
  isStartingUp,
}) => {
  // Animated telemetry numbers with subtle natural fluctuations
  const [telemetry, setTelemetry] = useState({
    powerOutput: 98.7,
    coreStability: 99.2,
    energyFlow: 87.4,
    frequency: 440.0,
    temperature: 312.4,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry((prev) => {
        if (powerBoost) {
          return {
            powerOutput: +(142.0 + Math.random() * 2.8).toFixed(1),
            coreStability: +(95.0 + Math.random() * 1.5).toFixed(1),
            energyFlow: +(164.0 + Math.random() * 3.5).toFixed(1),
            frequency: +(880.0 + Math.sin(Date.now() / 200) * 12).toFixed(1),
            temperature: +(428.0 + Math.random() * 4.2).toFixed(1),
          };
        }
        return {
          powerOutput: +(98.5 + (Math.random() - 0.5) * 0.4).toFixed(1),
          coreStability: +(99.1 + (Math.random() - 0.5) * 0.3).toFixed(1),
          energyFlow: +(87.2 + (Math.random() - 0.5) * 0.6).toFixed(1),
          frequency: +(440.0 + Math.sin(Date.now() / 500) * 3).toFixed(1),
          temperature: +(312.0 + (Math.random() - 0.5) * 0.8).toFixed(1),
        };
      });
    }, 280);

    return () => clearInterval(interval);
  }, [powerBoost]);

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-10">
      {/* 1. Dramatic Flash Overlay during Startup or Power Boost */}
      {isStartingUp && (
        <div className="absolute inset-0 bg-cyan-400/20 mix-blend-screen animate-pulse pointer-events-none transition-opacity duration-500" />
      )}
      {powerBoost && (
        <div className="absolute inset-0 bg-cyan-500/10 mix-blend-screen pointer-events-none animate-pulse" />
      )}

      {/* 2. Scanlines Texture Layer */}
      <div className="absolute inset-0 scanlines opacity-40 pointer-events-none" />

      {/* 3. Center Holographic Circular HUD Reticles (Centered around 3D Reactor) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <svg
          className="w-[min(90vw,680px)] h-[min(90vw,680px)] opacity-65 transition-transform duration-700"
          viewBox="0 0 800 800"
          style={{
            transform: explodedView ? 'scale(1.15)' : 'scale(1)',
          }}
        >
          <defs>
            <radialGradient id="hudGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={theme.glowColor} stopOpacity="0.3" />
              <stop offset="70%" stopColor={theme.glowColor} stopOpacity="0.05" />
              <stop offset="100%" stopColor={theme.glowColor} stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Central Radial Light Aura */}
          <circle cx="400" cy="400" r="320" fill="url(#hudGlow)" />

          {/* Outer Dashed Compass Ring - Clockwise Rotation */}
          <circle
            cx="400"
            cy="400"
            r="370"
            fill="none"
            stroke={theme.glowColor}
            strokeWidth="1.2"
            strokeDasharray="4 8"
            className="animate-spin-slow origin-center opacity-40"
          />

          {/* Segmented Outer Degree Arc */}
          <circle
            cx="400"
            cy="400"
            r="355"
            fill="none"
            stroke={theme.accentColor}
            strokeWidth="2.5"
            strokeDasharray="180 30 90 20 40 15"
            className="animate-spin-reverse-slow origin-center opacity-60"
          />

          {/* Middle Precision Tick Marks */}
          <g className="origin-center animate-spin-slow opacity-50" style={{ animationDuration: '60s' }}>
            {Array.from({ length: 36 }).map((_, i) => {
              const angle = (i / 36) * 360;
              const isMajor = i % 3 === 0;
              return (
                <line
                  key={i}
                  x1="400"
                  y1={isMajor ? 60 : 70}
                  x2="400"
                  y2="78"
                  stroke={theme.glowColor}
                  strokeWidth={isMajor ? 2 : 1}
                  transform={`rotate(${angle} 400 400)`}
                />
              );
            })}
          </g>

          {/* Inner Reticle Arcs */}
          <circle
            cx="400"
            cy="400"
            r="230"
            fill="none"
            stroke={theme.glowColor}
            strokeWidth="1.5"
            strokeDasharray="30 25 15 10 50 40"
            className="origin-center animate-spin-reverse-slow opacity-45"
            style={{ animationDuration: '24s' }}
          />

          {/* Core Target Crosshairs */}
          <line x1="400" y1="130" x2="400" y2="170" stroke={theme.glowColor} strokeWidth="1.5" opacity="0.6" />
          <line x1="400" y1="630" x2="400" y2="670" stroke={theme.glowColor} strokeWidth="1.5" opacity="0.6" />
          <line x1="130" y1="400" x2="170" y2="400" stroke={theme.glowColor} strokeWidth="1.5" opacity="0.6" />
          <line x1="630" y1="400" x2="670" y2="400" stroke={theme.glowColor} strokeWidth="1.5" opacity="0.6" />

          {/* Small Technical Annotations */}
          <text
            x="400"
            y="110"
            textAnchor="middle"
            fill={theme.glowColor}
            className="font-tech text-[10px] tracking-widest uppercase opacity-75"
          >
            ARC REACTOR // FLUX EMITTER
          </text>

          <text
            x="400"
            y="705"
            textAnchor="middle"
            fill={theme.glowColor}
            className="font-tech text-[10px] tracking-widest uppercase opacity-75"
          >
            {hologramMode ? 'DIAGNOSTIC BLUEPRINT SCAN' : 'PALLADIUM-VIBRANIUM MATRIX'}
          </text>
        </svg>
      </div>

      {/* 4. Left Telemetry Readout (Desktop & Tablet) */}
      <div className="hidden sm:flex absolute left-6 top-1/2 -translate-y-1/2 flex-col gap-4 font-tech text-xs tracking-wider max-w-[220px]">
        {/* Power Output Card */}
        <div className="p-3 bg-black/50 backdrop-blur-md border border-cyan-500/20 rounded-lg shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-cyan-400 group-hover:h-full transition-all" />
          <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">POWER OUTPUT</div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span
              className={`font-orbitron text-xl font-bold tabular-nums ${
                powerBoost ? 'text-amber-400 text-glow-cyan' : 'text-cyan-300'
              }`}
            >
              {telemetry.powerOutput}%
            </span>
            <span className="text-[10px] text-cyan-500 font-tech">
              {powerBoost ? 'OVERDRIVE' : 'NOMINAL'}
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-800/80 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                powerBoost ? 'bg-amber-400' : 'bg-cyan-400'
              }`}
              style={{ width: `${Math.min(telemetry.powerOutput / 1.5, 100)}%` }}
            />
          </div>
        </div>

        {/* Core Stability Card */}
        <div className="p-3 bg-black/50 backdrop-blur-md border border-cyan-500/20 rounded-lg shadow-lg relative overflow-hidden">
          <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">CORE STABILITY</div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-orbitron text-xl font-bold text-emerald-400 tabular-nums">
              {telemetry.coreStability}%
            </span>
            <span className="text-[10px] text-emerald-500 font-tech">CONTAINED</span>
          </div>
          <div className="w-full bg-slate-800/80 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-emerald-400 transition-all duration-300"
              style={{ width: `${telemetry.coreStability}%` }}
            />
          </div>
        </div>

        {/* Energy Flow Card */}
        <div className="p-3 bg-black/50 backdrop-blur-md border border-cyan-500/20 rounded-lg shadow-lg relative overflow-hidden">
          <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">ENERGY FLOW</div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-orbitron text-xl font-bold text-cyan-300 tabular-nums">
              {telemetry.energyFlow}%
            </span>
            <span className="text-[10px] text-cyan-500 font-tech">3.2 GJ/s</span>
          </div>
          <div className="w-full bg-slate-800/80 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-cyan-400 transition-all duration-300"
              style={{ width: `${Math.min(telemetry.energyFlow, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 5. Right Telemetry Readout (Desktop & Tablet) */}
      <div className="hidden sm:flex absolute right-6 top-1/2 -translate-y-1/2 flex-col gap-4 font-tech text-xs tracking-wider text-right max-w-[220px]">
        {/* System Status Card */}
        <div className="p-3 bg-black/50 backdrop-blur-md border border-cyan-500/20 rounded-lg shadow-lg relative overflow-hidden">
          <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">SYSTEM STATUS</div>
          <div className="flex items-center justify-end gap-2 mt-0.5">
            <span
              className={`w-2 h-2 rounded-full animate-ping ${
                powerBoost ? 'bg-amber-400' : 'bg-cyan-400'
              }`}
            />
            <span
              className={`font-orbitron text-base font-bold tracking-wider ${
                powerBoost ? 'text-amber-400' : 'text-cyan-300'
              }`}
            >
              {powerBoost ? 'OVERCLOCK' : 'ONLINE'}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-tech">
            10 COILS SYNCHRONIZED
          </div>
        </div>

        {/* Thermal Regulation */}
        <div className="p-3 bg-black/50 backdrop-blur-md border border-cyan-500/20 rounded-lg shadow-lg relative overflow-hidden">
          <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">THERMAL CORE</div>
          <div className="font-orbitron text-xl font-bold text-sky-300 mt-0.5 tabular-nums">
            {telemetry.temperature} K
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-tech">
            CRYO-LOOP ACTIVE
          </div>
        </div>

        {/* Operating Frequency */}
        <div className="p-3 bg-black/50 backdrop-blur-md border border-cyan-500/20 rounded-lg shadow-lg relative overflow-hidden">
          <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">HARMONIC FLUX</div>
          <div className="font-orbitron text-xl font-bold text-cyan-300 mt-0.5 tabular-nums">
            {telemetry.frequency} THz
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-tech">
            PHASE LOCKED
          </div>
        </div>
      </div>

      {/* 6. Mobile Quick Telemetry Banner (Compact for small screens) */}
      <div className="flex sm:hidden absolute top-16 left-4 right-4 justify-between items-center px-3 py-1.5 bg-black/60 backdrop-blur-md border border-cyan-500/20 rounded font-tech text-[11px] text-cyan-400">
        <div>
          <span className="text-slate-400">STATUS:</span>{' '}
          <span className="font-bold">{powerBoost ? 'BOOST' : 'ONLINE'}</span>
        </div>
        <div>
          <span className="text-slate-400">PWR:</span>{' '}
          <span className="font-bold text-cyan-300 tabular-nums">{telemetry.powerOutput}%</span>
        </div>
        <div>
          <span className="text-slate-400">STAB:</span>{' '}
          <span className="font-bold text-emerald-400 tabular-nums">{telemetry.coreStability}%</span>
        </div>
      </div>

      {/* 7. Precision Corner HUD Brackets */}
      <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-cyan-400/40 pointer-events-none" />
      <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-cyan-400/40 pointer-events-none" />
      <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-cyan-400/40 pointer-events-none" />
      <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-cyan-400/40 pointer-events-none" />
    </div>
  );
};
