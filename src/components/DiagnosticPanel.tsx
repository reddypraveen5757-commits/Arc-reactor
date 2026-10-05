import React, { useEffect, useRef } from 'react';
import { REACTOR_THEMES, ReactorTheme } from '../three/ArcReactorScene.ts';
import { soundEngine } from '../audio/soundEngine.ts';
import { X, Activity, Cpu, ShieldCheck } from 'lucide-react';

interface DiagnosticPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ReactorTheme;
  onSelectTheme: (theme: ReactorTheme) => void;
  powerBoost: boolean;
}

export const DiagnosticPanel: React.FC<DiagnosticPanelProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
  powerBoost,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Oscilloscope Animation
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const renderWave = () => {
      animId = requestAnimationFrame(renderWave);
      phase += powerBoost ? 0.12 : 0.04;

      ctx.fillStyle = 'rgba(3, 7, 18, 0.35)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Grid
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw Main Sine Wave
      ctx.beginPath();
      ctx.strokeStyle = currentTheme.glowColor;
      ctx.lineWidth = 2;
      ctx.shadowColor = currentTheme.glowColor;
      ctx.shadowBlur = 10;

      for (let x = 0; x < canvas.width; x++) {
        const freq = powerBoost ? 0.04 : 0.02;
        const amp = (canvas.height / 3) * (powerBoost ? 1.2 : 0.8);
        const y =
          canvas.height / 2 +
          Math.sin(x * freq + phase) * amp +
          Math.sin(x * freq * 2 - phase * 1.5) * (amp * 0.25);

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    renderWave();
    return () => cancelAnimationFrame(animId);
  }, [isOpen, powerBoost, currentTheme]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-slate-950/95 border border-cyan-500/40 rounded-2xl p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-cyan-500/20">
          <div className="flex items-center gap-3">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-lg font-bold font-orbitron text-cyan-300 tracking-wider">
                CORE DIAGNOSTICS & TELEMETRY
              </h2>
              <div className="flex items-center gap-2 text-xs font-tech text-slate-400">
                <span>MODEL: MARK-LXXXV</span>
                <span aria-hidden="true">·</span>
                <span>STATUS: ACTIVE</span>
                <span aria-hidden="true">·</span>
                <span>EFFICIENCY: 99.4%</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              soundEngine.playClick(900);
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="py-4 space-y-6 overflow-y-auto pr-1">
          {/* 1. Real-time Plasma Oscilloscope */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold font-orbitron text-slate-300 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                PLASMA OSCILLOSCOPE (440 THz)
              </span>
              <span className="text-[11px] font-tech text-cyan-400">
                {powerBoost ? 'OVERDRIVE HARMONIC' : 'NOMINAL CARRIER'}
              </span>
            </div>
            <div className="rounded-xl overflow-hidden border border-cyan-500/30 bg-black/80">
              <canvas
                ref={canvasRef}
                width={560}
                height={120}
                className="w-full h-28 block"
              />
            </div>
          </div>

          {/* 2. Theme / Core Spectrum Selector */}
          <div>
            <span className="text-xs font-semibold font-orbitron text-slate-300 block mb-2">
              CORE ENERGY SPECTRUM
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {REACTOR_THEMES.map((th) => (
                <button
                  key={th.id}
                  onClick={() => {
                    soundEngine.playClick(1000);
                    onSelectTheme(th);
                  }}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all cursor-pointer ${
                    currentTheme.id === th.id
                      ? 'bg-cyan-950/60 border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: th.glowColor }}
                  />
                  <div className="text-left">
                    <div className="text-xs font-semibold font-orbitron text-slate-200">
                      {th.name}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Mechanical Layer Architecture Breakdown */}
          <div>
            <span className="text-xs font-semibold font-orbitron text-slate-300 block mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              MECHANICAL SPECIFICATIONS
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-tech">
              <div className="p-3 bg-black/40 border border-slate-800 rounded-xl space-y-1">
                <div className="text-cyan-400 font-semibold font-orbitron">01. TOROIDAL COILS</div>
                <div className="text-slate-400">10 Segments · OFHC Copper Wire</div>
                <div className="text-slate-500">Magnetic Induction: 4.8 Tesla</div>
              </div>
              <div className="p-3 bg-black/40 border border-slate-800 rounded-xl space-y-1">
                <div className="text-cyan-400 font-semibold font-orbitron">02. IRIS APERTURE</div>
                <div className="text-slate-400">10-Blade Counter-Rotating System</div>
                <div className="text-slate-500">Brushless Servo Feedback · 0.02ms</div>
              </div>
              <div className="p-3 bg-black/40 border border-slate-800 rounded-xl space-y-1">
                <div className="text-cyan-400 font-semibold font-orbitron">03. PLASMA CORE</div>
                <div className="text-slate-400">Palladium-Vibranium Ring</div>
                <div className="text-slate-500">Flux Density: 3.2 GJ / Second</div>
              </div>
              <div className="p-3 bg-black/40 border border-slate-800 rounded-xl space-y-1">
                <div className="text-cyan-400 font-semibold font-orbitron">04. CRYO CHASSIS</div>
                <div className="text-slate-400">Grade 5 Titanium · Radial Fins</div>
                <div className="text-slate-500">Dissipation: 312 K Nominal</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-cyan-500/20 flex justify-end">
          <button
            onClick={() => {
              soundEngine.playClick(800);
              onClose();
            }}
            className="py-2 px-5 text-xs font-orbitron font-semibold text-black bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all cursor-pointer"
          >
            CONFIRM & RETURN
          </button>
        </div>
      </div>
    </div>
  );
};
