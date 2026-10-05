/**
 * Arc Reactor 3D - Next-Generation Energy Core
 * Iron Man-inspired realistic 3D WebGL centerpiece with interactive HUD,
 * cinematic startup sequence, physics materials, and sound synthesizer.
 */

import { useState, useRef } from 'react';
import { ArcReactorCanvas } from './components/ArcReactorCanvas.tsx';
import { HUDOverlay } from './components/HUDOverlay.tsx';
import { ControlPanel } from './components/ControlPanel.tsx';
import { TopBar } from './components/TopBar.tsx';
import { DiagnosticPanel } from './components/DiagnosticPanel.tsx';
import { ArcReactorScene, REACTOR_THEMES, ReactorTheme } from './three/ArcReactorScene.ts';
import { soundEngine } from './audio/soundEngine.ts';

export default function App() {
  const [currentTheme, setCurrentTheme] = useState<ReactorTheme>(REACTOR_THEMES[0]);
  const [powerBoost, setPowerBoost] = useState(false);
  const [hologramMode, setHologramMode] = useState(false);
  const [explodedView, setExplodedView] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isStartingUp, setIsStartingUp] = useState(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);

  const sceneRef = useRef<ArcReactorScene | null>(null);

  const handleStartSequence = () => {
    setIsStartingUp(true);
    sceneRef.current?.startCinematicSequence();
  };

  const handleStartupComplete = () => {
    setIsStartingUp(false);
  };

  const handleReset = () => {
    sceneRef.current?.resetView();
  };

  const handleToggleSound = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="relative w-screen h-screen bg-[#030712] overflow-hidden select-none font-rajdhani text-cyan-400">
      {/* 1. Header Navigation Bar */}
      <TopBar
        onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
        onStartup={handleStartSequence}
        powerBoost={powerBoost}
      />

      {/* 2. Interactive Three.js 3D WebGL Canvas */}
      <ArcReactorCanvas
        theme={currentTheme}
        powerBoost={powerBoost}
        hologramMode={hologramMode}
        explodedView={explodedView}
        autoRotate={autoRotate}
        onStartupComplete={handleStartupComplete}
        sceneRef={sceneRef}
      />

      {/* 3. Holographic HUD Telemetry & Rotating Reticles */}
      <HUDOverlay
        theme={currentTheme}
        powerBoost={powerBoost}
        hologramMode={hologramMode}
        explodedView={explodedView}
        isStartingUp={isStartingUp}
      />

      {/* 4. Futuristic User Control Panel */}
      <ControlPanel
        onStart={handleStartSequence}
        powerBoost={powerBoost}
        onTogglePowerBoost={() => setPowerBoost((prev) => !prev)}
        autoRotate={autoRotate}
        onToggleAutoRotate={() => setAutoRotate((prev) => !prev)}
        onReset={handleReset}
        hologramMode={hologramMode}
        onToggleHologram={() => setHologramMode((prev) => !prev)}
        explodedView={explodedView}
        onToggleExplodedView={() => setExplodedView((prev) => !prev)}
        isMuted={isMuted}
        onToggleSound={handleToggleSound}
      />

      {/* 5. Deep Diagnostics & Telemetry Modal */}
      <DiagnosticPanel
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
        currentTheme={currentTheme}
        onSelectTheme={(theme) => setCurrentTheme(theme)}
        powerBoost={powerBoost}
      />
    </div>
  );
}
