import React, { useEffect, useRef } from 'react';
import { ArcReactorScene, ReactorTheme } from '../three/ArcReactorScene.ts';

interface ArcReactorCanvasProps {
  theme: ReactorTheme;
  powerBoost: boolean;
  hologramMode: boolean;
  explodedView: boolean;
  autoRotate: boolean;
  onStartupComplete?: () => void;
  sceneRef?: React.MutableRefObject<ArcReactorScene | null>;
}

export const ArcReactorCanvas: React.FC<ArcReactorCanvasProps> = ({
  theme,
  powerBoost,
  hologramMode,
  explodedView,
  autoRotate,
  onStartupComplete,
  sceneRef,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const internalSceneRef = useRef<ArcReactorScene | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new ArcReactorScene(containerRef.current, {
      theme,
      powerBoost,
      hologramMode,
      explodedView,
      autoRotate,
      onStartupComplete,
    });

    internalSceneRef.current = scene;
    if (sceneRef) {
      sceneRef.current = scene;
    }

    return () => {
      scene.dispose();
      internalSceneRef.current = null;
      if (sceneRef) {
        sceneRef.current = null;
      }
    };
  }, []);

  // Update theme when changed
  useEffect(() => {
    internalSceneRef.current?.applyTheme(theme);
  }, [theme]);

  // Update power boost
  useEffect(() => {
    internalSceneRef.current?.setPowerBoost(powerBoost);
  }, [powerBoost]);

  // Update hologram mode
  useEffect(() => {
    internalSceneRef.current?.setHologramMode(hologramMode);
  }, [hologramMode]);

  // Update exploded view
  useEffect(() => {
    internalSceneRef.current?.setExplodedView(explodedView);
  }, [explodedView]);

  // Update auto rotate
  useEffect(() => {
    internalSceneRef.current?.setAutoRotate(autoRotate);
  }, [autoRotate]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing touch-none select-none z-0"
    />
  );
};
