import React from 'react';
import { Sliders, Sparkles } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine.ts';

interface TopBarProps {
  onOpenDiagnostics: () => void;
  onStartup: () => void;
  powerBoost: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenDiagnostics,
  onStartup,
  powerBoost,
}) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-4 border-b border-cyan-500/20 bg-black/40 backdrop-blur-md">
      {/* Zone 1: Brand Title with Single Text Wordmark & Clean Subtitle */}
      <div className="flex flex-col">
        <h1 className="text-xl sm:text-2xl font-black font-orbitron tracking-widest text-cyan-400 text-glow-cyan">
          ARC REACTOR
        </h1>
        <div className="text-[10px] sm:text-xs font-tech tracking-widest text-slate-400 uppercase">
          NEXT-GENERATION ENERGY CORE
        </div>
      </div>

      {/* Zone 2: Clean Navigation / Status Center */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-tech tracking-widest text-slate-300">
        <span className="flex items-center gap-1.5 text-cyan-400">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>MARK-LXXXV</span>
        </span>
        <span aria-hidden="true" className="text-slate-600">/</span>
        <button
          onClick={() => {
            soundEngine.playClick(1000);
            onOpenDiagnostics();
          }}
          className="hover:text-cyan-300 transition-colors cursor-pointer"
        >
          TELEMETRY
        </button>
        <span aria-hidden="true" className="text-slate-600">/</span>
        <span className={powerBoost ? 'text-amber-400 font-bold' : 'text-slate-400'}>
          {powerBoost ? 'OUTPUT: 142.4%' : 'OUTPUT: 98.7%'}
        </span>
      </nav>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={() => {
            soundEngine.playClick(900);
            onOpenDiagnostics();
          }}
          className="flex items-center gap-1.5 py-2 px-3 sm:px-4 text-xs font-semibold font-orbitron text-cyan-300 hover:text-white bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/40 rounded-xl transition-all cursor-pointer whitespace-nowrap"
        >
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">DIAGNOSTICS</span>
        </button>

        <button
          onClick={() => {
            soundEngine.playStartup();
            onStartup();
          }}
          className="flex items-center gap-1.5 py-2 px-3 sm:px-4 text-xs font-semibold font-orbitron text-black bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-[0_0_15px_rgba(0,240,255,0.5)] active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>REBOOT</span>
        </button>
      </div>
    </header>
  );
};
