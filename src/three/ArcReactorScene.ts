/**
 * 3D Arc Reactor Scene Manager built with Three.js
 * Features multi-layered realistic metallic geometries, copper coil windings,
 * quartz glass refraction, dynamic volumetric glow, dancing electric arcs,
 * particle vortex, exploded view, holographic mode, and cinematic startup.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export interface ReactorTheme {
  id: string;
  name: string;
  coreColor: string;
  glowColor: string;
  accentColor: string;
  emissiveHex: number;
  glowHex: number;
}

export const REACTOR_THEMES: ReactorTheme[] = [
  {
    id: 'vibranium',
    name: 'Vibranium Blue',
    coreColor: '#e0f7ff',
    glowColor: '#00f0ff',
    accentColor: '#0284c7',
    emissiveHex: 0x00f0ff,
    glowHex: 0x00a8ff,
  },
  {
    id: 'arc-white',
    name: 'Arc Ultra-White',
    coreColor: '#ffffff',
    glowColor: '#7dd3fc',
    accentColor: '#38bdf8',
    emissiveHex: 0xe0f2fe,
    glowHex: 0x38bdf8,
  },
  {
    id: 'overdrive',
    name: 'Overdrive Amber',
    coreColor: '#fffbeb',
    glowColor: '#f59e0b',
    accentColor: '#d97706',
    emissiveHex: 0xf59e0b,
    glowHex: 0xd97706,
  },
  {
    id: 'crimson',
    name: 'Nanotech Crimson',
    coreColor: '#ffe4e6',
    glowColor: '#f43f5e',
    accentColor: '#e11d48',
    emissiveHex: 0xf43f5e,
    glowHex: 0xbe123c,
  },
  {
    id: 'emerald',
    name: 'Tesseract Green',
    coreColor: '#ecfdf5',
    glowColor: '#10b981',
    accentColor: '#059669',
    emissiveHex: 0x10b981,
    glowHex: 0x047857,
  }
];

export interface SceneConfig {
  theme: ReactorTheme;
  powerBoost: boolean;
  hologramMode: boolean;
  explodedView: boolean;
  autoRotate: boolean;
  onStartupComplete?: () => void;
}

export class ArcReactorScene {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private clock: THREE.Clock;
  private animFrameId: number | null = null;

  // Scene object groups for exploded view and animation
  private rootGroup: THREE.Group;
  private layerFrontGlass: THREE.Group;
  private layerOuterChassis: THREE.Group;
  private layerCoilSegments: THREE.Group;
  private layerIrisGears: THREE.Group;
  private layerCoreEmitter: THREE.Group;
  private layerRearHeatsink: THREE.Group;
  private hologramRingsGroup: THREE.Group;

  // Dynamic rotating elements
  private outerRingMesh!: THREE.Mesh;
  private middleCounterRing!: THREE.Mesh;
  private innerGearRing!: THREE.Group;
  private irisApertureGroup!: THREE.Group;
  private corePlasmaMesh!: THREE.Mesh;
  private coreInnerGlowMesh!: THREE.Mesh;
  private volumetricRaysMesh!: THREE.Mesh;
  private coilGlowMeshes: THREE.Mesh[] = [];

  // Particle systems
  private ambientParticles!: THREE.Points;
  private vortexParticles!: THREE.Points;
  private shockwaveMeshes: THREE.Mesh[] = [];

  // Electric arc lightning
  private electricArcLines: THREE.Line[] = [];

  // Dynamic Lights
  private corePointLight!: THREE.PointLight;
  private rimLight1!: THREE.PointLight;
  private rimLight2!: THREE.PointLight;
  private ambientLight!: THREE.AmbientLight;

  // Materials collection for theme updates and hologram mode
  private metallicMaterials: THREE.MeshStandardMaterial[] = [];
  private copperMaterials: THREE.MeshStandardMaterial[] = [];
  private glassMaterials: THREE.MeshPhysicalMaterial[] = [];
  private emissiveMaterials: THREE.MeshBasicMaterial[] = [];
  private wireframeBackup: Map<THREE.Material, boolean> = new Map();

  // State variables
  private config: SceneConfig;
  private targetExplodedZ = { glass: 0, chassis: 0, coils: 0, iris: 0, core: 0, rear: 0 };
  private currentExplodedZ = { glass: 0, chassis: 0, coils: 0, iris: 0, core: 0, rear: 0 };
  private mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
  private isUserInteracting = false;
  private isDestroyed = false;

  // Startup animation state
  private isStartingUp = false;
  private startupTime = 0;
  private startupDuration = 3.2; // seconds

  constructor(container: HTMLElement, initialConfig: SceneConfig) {
    this.container = container;
    this.config = { ...initialConfig };
    this.clock = new THREE.Clock();

    // 1. Scene & Fog Setup
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x020611, 0.04);

    // 2. Camera Setup
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 0, 4.4);

    // 3. Renderer Setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.35;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // 4. Orbit Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.rotateSpeed = 0.8;
    this.controls.enableZoom = true;
    this.controls.minDistance = 2.0;
    this.controls.maxDistance = 8.5;
    this.controls.enablePan = false;
    this.controls.autoRotate = this.config.autoRotate;
    this.controls.autoRotateSpeed = 1.2;
    this.controls.addEventListener('start', () => {
      this.isUserInteracting = true;
    });
    this.controls.addEventListener('end', () => {
      this.isUserInteracting = false;
    });

    // 5. Initialize Hierarchical Groups
    this.rootGroup = new THREE.Group();
    this.layerFrontGlass = new THREE.Group();
    this.layerOuterChassis = new THREE.Group();
    this.layerCoilSegments = new THREE.Group();
    this.layerIrisGears = new THREE.Group();
    this.layerCoreEmitter = new THREE.Group();
    this.layerRearHeatsink = new THREE.Group();
    this.hologramRingsGroup = new THREE.Group();

    this.rootGroup.add(this.layerRearHeatsink);
    this.rootGroup.add(this.layerOuterChassis);
    this.rootGroup.add(this.layerCoilSegments);
    this.rootGroup.add(this.layerIrisGears);
    this.rootGroup.add(this.layerCoreEmitter);
    this.rootGroup.add(this.layerFrontGlass);
    this.rootGroup.add(this.hologramRingsGroup);
    this.scene.add(this.rootGroup);

    // 6. Build Scene Components
    this.setupLighting();
    this.buildLabBackground();
    this.buildRearHeatsink();
    this.buildOuterChassis();
    this.buildCoilSegments();
    this.buildIrisAndGears();
    this.buildCentralCore();
    this.buildFrontGlass();
    this.buildHologramRings();
    this.buildElectricArcs();
    this.buildParticleSystems();
    this.buildShockwaves();

    // 7. Event Listeners
    window.addEventListener('resize', this.onResize);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('touchmove', this.onTouchMove, { passive: true });

    // Initial theme application
    this.applyTheme(this.config.theme);
    this.setHologramMode(this.config.hologramMode);

    // 8. Start Rendering Loop
    this.animate();
  }

  // ==========================================
  // LIGHTING SETUP
  // ==========================================
  private setupLighting() {
    this.ambientLight = new THREE.AmbientLight(0x0f172a, 1.2);
    this.scene.add(this.ambientLight);

    // Dynamic Central Core Point Light (casts realistic reflections on copper & metal)
    this.corePointLight = new THREE.PointLight(this.config.theme.emissiveHex, 3.5, 9, 1.5);
    this.corePointLight.position.set(0, 0, 0.4);
    this.corePointLight.castShadow = true;
    this.corePointLight.shadow.bias = -0.002;
    this.scene.add(this.corePointLight);

    // Cyan/Blue Key & Rim Highlights
    this.rimLight1 = new THREE.PointLight(0x00f0ff, 2.0, 12, 1.8);
    this.rimLight1.position.set(3, 3, 3);
    this.scene.add(this.rimLight1);

    this.rimLight2 = new THREE.PointLight(0x0077ff, 1.8, 12, 1.8);
    this.rimLight2.position.set(-3, -3, 2);
    this.scene.add(this.rimLight2);

    // Directional Key Light from front-top for crisp metallic bevel reflections
    const keyDirLight = new THREE.DirectionalLight(0xe0f2fe, 1.5);
    keyDirLight.position.set(2, 4, 5);
    this.scene.add(keyDirLight);
  }

  // ==========================================
  // BACKGROUND LAB ATMOSPHERE
  // ==========================================
  private buildLabBackground() {
    // 1. Subtle 3D Hexagonal / Cyber Grid Floor in distant background
    const gridHelper = new THREE.GridHelper(24, 48, 0x00f0ff, 0x082f49);
    gridHelper.position.y = -3.2;
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.22;
    this.scene.add(gridHelper);

    // 2. Distant circular containment chamber ring
    const chamberGeo = new THREE.TorusGeometry(6, 0.08, 16, 64);
    const chamberMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.18,
      wireframe: true,
    });
    const chamberMesh = new THREE.Mesh(chamberGeo, chamberMat);
    chamberMesh.position.z = -2.5;
    this.scene.add(chamberMesh);
  }

  // ==========================================
  // LAYER 0: REAR HEATSINK & BASE CHASSIS
  // ==========================================
  private buildRearHeatsink() {
    const heatsinkGroup = new THREE.Group();

    // 1. Main Base Plate
    const basePlateGeo = new THREE.CylinderGeometry(1.68, 1.72, 0.12, 48);
    const basePlateMat = new THREE.MeshStandardMaterial({
      color: 0x11161d,
      metalness: 0.92,
      roughness: 0.35,
    });
    this.metallicMaterials.push(basePlateMat);
    const basePlate = new THREE.Mesh(basePlateGeo, basePlateMat);
    basePlate.rotation.x = Math.PI / 2;
    basePlate.position.z = -0.15;
    heatsinkGroup.add(basePlate);

    // 2. Stepped ventilation ring
    const ventRingGeo = new THREE.TorusGeometry(1.5, 0.06, 12, 48);
    const ventRingMat = new THREE.MeshStandardMaterial({
      color: 0x1f2937,
      metalness: 0.95,
      roughness: 0.2,
    });
    this.metallicMaterials.push(ventRingMat);
    const ventRing = new THREE.Mesh(ventRingGeo, ventRingMat);
    ventRing.position.z = -0.1;
    heatsinkGroup.add(ventRing);

    // 3. Radial heatsink cooling fins (24 fins)
    const finGeo = new THREE.BoxGeometry(0.04, 0.45, 0.08);
    const finMat = new THREE.MeshStandardMaterial({
      color: 0x18202a,
      metalness: 0.88,
      roughness: 0.3,
    });
    this.metallicMaterials.push(finMat);

    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      const fin = new THREE.Mesh(finGeo, finMat);
      fin.position.x = Math.cos(angle) * 1.45;
      fin.position.y = Math.sin(angle) * 1.45;
      fin.position.z = -0.12;
      fin.rotation.z = angle;
      heatsinkGroup.add(fin);
    }

    // 4. Rear power conduit ports with subtle glow
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const portGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.06, 16);
      const portMat = new THREE.MeshBasicMaterial({
        color: this.config.theme.emissiveHex,
        transparent: true,
        opacity: 0.7,
      });
      this.emissiveMaterials.push(portMat);
      const port = new THREE.Mesh(portGeo, portMat);
      port.rotation.x = Math.PI / 2;
      port.position.x = Math.cos(angle) * 0.9;
      port.position.y = Math.sin(angle) * 0.9;
      port.position.z = -0.09;
      heatsinkGroup.add(port);
    }

    this.layerRearHeatsink.add(heatsinkGroup);
  }

  // ==========================================
  // LAYER 1: OUTER CHASSIS & RETAINING RINGS
  // ==========================================
  private buildOuterChassis() {
    const chassisGroup = new THREE.Group();

    // 1. Heavy Titanium Outer Ring
    const outerTorusGeo = new THREE.TorusGeometry(1.68, 0.09, 24, 64);
    const outerTorusMat = new THREE.MeshStandardMaterial({
      color: 0x1e2530,
      metalness: 0.92,
      roughness: 0.22,
    });
    this.metallicMaterials.push(outerTorusMat);
    this.outerRingMesh = new THREE.Mesh(outerTorusGeo, outerTorusMat);
    chassisGroup.add(this.outerRingMesh);

    // 2. Beveled Gunmetal Trim Ring
    const trimGeo = new THREE.TorusGeometry(1.78, 0.035, 16, 64);
    const trimMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.96,
      roughness: 0.15,
    });
    this.metallicMaterials.push(trimMat);
    const trimMesh = new THREE.Mesh(trimGeo, trimMat);
    chassisGroup.add(trimMesh);

    // 3. Ten Heavy Outer Clamping Brackets with Hex Rivets
    const bracketGeo = new THREE.BoxGeometry(0.14, 0.18, 0.14);
    const bracketMat = new THREE.MeshStandardMaterial({
      color: 0x222a36,
      metalness: 0.94,
      roughness: 0.2,
    });
    this.metallicMaterials.push(bracketMat);

    const rivetGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.04, 8);
    const rivetMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.98,
      roughness: 0.1,
    });
    this.metallicMaterials.push(rivetMat);

    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const bracket = new THREE.Mesh(bracketGeo, bracketMat);
      bracket.position.x = Math.cos(angle) * 1.68;
      bracket.position.y = Math.sin(angle) * 1.68;
      bracket.position.z = 0.04;
      bracket.rotation.z = angle;

      // Hex rivet on top of bracket
      const rivet = new THREE.Mesh(rivetGeo, rivetMat);
      rivet.position.z = 0.08;
      rivet.rotation.x = Math.PI / 2;
      bracket.add(rivet);

      chassisGroup.add(bracket);
    }

    // 4. Etched Technical Calibration Ring with small tick markers
    const tickMat = new THREE.MeshBasicMaterial({
      color: this.config.theme.emissiveHex,
      transparent: true,
      opacity: 0.5,
    });
    this.emissiveMaterials.push(tickMat);

    for (let i = 0; i < 60; i++) {
      const angle = (i / 60) * Math.PI * 2;
      const isMajor = i % 5 === 0;
      const tickGeo = new THREE.BoxGeometry(isMajor ? 0.05 : 0.025, 0.012, 0.01);
      const tick = new THREE.Mesh(tickGeo, tickMat);
      tick.position.x = Math.cos(angle) * 1.58;
      tick.position.y = Math.sin(angle) * 1.58;
      tick.position.z = 0.07;
      tick.rotation.z = angle;
      chassisGroup.add(tick);
    }

    this.layerOuterChassis.add(chassisGroup);
  }

  // ==========================================
  // LAYER 2: THE 10 TOROIDAL COIL SEGMENTS (Iconic Arc Reactor Core)
  // ==========================================
  private buildCoilSegments() {
    const coilsGroup = new THREE.Group();
    const segmentCount = 10;
    const ringRadius = 1.28;

    // 1. Toroidal support ring housing the coils
    const supportRingGeo = new THREE.TorusGeometry(ringRadius, 0.08, 16, 64);
    const supportRingMat = new THREE.MeshStandardMaterial({
      color: 0x151b22,
      metalness: 0.94,
      roughness: 0.28,
    });
    this.metallicMaterials.push(supportRingMat);
    const supportRing = new THREE.Mesh(supportRingGeo, supportRingMat);
    coilsGroup.add(supportRing);

    // 2. High-Conductivity Copper Material
    const copperMat = new THREE.MeshStandardMaterial({
      color: 0xd97736,
      metalness: 0.95,
      roughness: 0.22,
      envMapIntensity: 1.5,
    });
    this.copperMaterials.push(copperMat);

    // 3. Segment Core Armature Material (Dark Machined Carbon/Titanium)
    const armatureMat = new THREE.MeshStandardMaterial({
      color: 0x1e242c,
      metalness: 0.92,
      roughness: 0.25,
    });
    this.metallicMaterials.push(armatureMat);

    // 4. Chrome Retaining Clamp Material
    const clampMat = new THREE.MeshStandardMaterial({
      color: 0xcfd8dc,
      metalness: 0.98,
      roughness: 0.12,
    });
    this.metallicMaterials.push(clampMat);

    // Create 10 Individual Coil Units
    for (let i = 0; i < segmentCount; i++) {
      const angle = (i / segmentCount) * Math.PI * 2;
      const unitGroup = new THREE.Group();

      // Position unit around the torus
      unitGroup.position.x = Math.cos(angle) * ringRadius;
      unitGroup.position.y = Math.sin(angle) * ringRadius;
      unitGroup.rotation.z = angle;

      // Base armature block
      const armGeo = new THREE.BoxGeometry(0.24, 0.22, 0.18);
      const armMesh = new THREE.Mesh(armGeo, armatureMat);
      unitGroup.add(armMesh);

      // Multiple copper coil turns wrapping around the segment
      const turnCount = 7;
      for (let t = -3; t <= 3; t++) {
        const turnGeo = new THREE.TorusGeometry(0.088, 0.016, 12, 24);
        const turnMesh = new THREE.Mesh(turnGeo, copperMat);
        turnMesh.position.x = t * 0.026;
        turnMesh.rotation.y = Math.PI / 2;
        unitGroup.add(turnMesh);
      }

      // Center Chrome Clamp with screw
      const clampGeo = new THREE.BoxGeometry(0.045, 0.23, 0.2);
      const clampMesh = new THREE.Mesh(clampGeo, clampMat);
      clampMesh.position.z = 0.01;
      unitGroup.add(clampMesh);

      // Luminous Under-Coil Plasma Conduit
      const glowGeo = new THREE.BoxGeometry(0.18, 0.05, 0.06);
      const glowMat = new THREE.MeshBasicMaterial({
        color: this.config.theme.emissiveHex,
        transparent: true,
        opacity: 0.85,
      });
      this.emissiveMaterials.push(glowMat);
      const glowMesh = new THREE.Mesh(glowGeo, glowMat);
      glowMesh.position.z = 0.1;
      unitGroup.add(glowMesh);
      this.coilGlowMeshes.push(glowMesh);

      coilsGroup.add(unitGroup);
    }

    this.layerCoilSegments.add(coilsGroup);
  }

  // ==========================================
  // LAYER 3: INNER ROTATING IRIS & GEAR RINGS
  // ==========================================
  private buildIrisAndGears() {
    const irisGroup = new THREE.Group();

    // 1. Counter-Rotating Middle Ring with Radial Slots
    const middleRingGeo = new THREE.RingGeometry(0.78, 0.98, 48);
    const middleRingMat = new THREE.MeshStandardMaterial({
      color: 0x242e3d,
      metalness: 0.94,
      roughness: 0.18,
      side: THREE.DoubleSide,
    });
    this.metallicMaterials.push(middleRingMat);
    this.middleCounterRing = new THREE.Mesh(middleRingGeo, middleRingMat);
    this.middleCounterRing.position.z = 0.06;
    irisGroup.add(this.middleCounterRing);

    // 2. Inner Precision Gear Teeth Ring
    this.innerGearRing = new THREE.Group();
    const toothCount = 20;
    const toothGeo = new THREE.BoxGeometry(0.035, 0.06, 0.04);
    const toothMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.92,
      roughness: 0.2,
    });
    this.metallicMaterials.push(toothMat);

    for (let i = 0; i < toothCount; i++) {
      const angle = (i / toothCount) * Math.PI * 2;
      const tooth = new THREE.Mesh(toothGeo, toothMat);
      tooth.position.x = Math.cos(angle) * 0.76;
      tooth.position.y = Math.sin(angle) * 0.76;
      tooth.rotation.z = angle;
      this.innerGearRing.add(tooth);
    }
    this.innerGearRing.position.z = 0.08;
    irisGroup.add(this.innerGearRing);

    // 3. Overlapping Curved Iris Aperture Blades (10 blades pointing towards center)
    this.irisApertureGroup = new THREE.Group();
    const bladeShape = new THREE.Shape();
    bladeShape.moveTo(0, 0);
    bladeShape.lineTo(0.24, 0.12);
    bladeShape.lineTo(0.36, -0.05);
    bladeShape.lineTo(0.12, -0.15);
    bladeShape.closePath();

    const bladeGeo = new THREE.ShapeGeometry(bladeShape);
    const bladeMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.95,
      roughness: 0.15,
      side: THREE.DoubleSide,
    });
    this.metallicMaterials.push(bladeMat);

    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.position.x = Math.cos(angle) * 0.48;
      blade.position.y = Math.sin(angle) * 0.48;
      blade.rotation.z = angle + 0.4;
      this.irisApertureGroup.add(blade);
    }
    this.irisApertureGroup.position.z = 0.09;
    irisGroup.add(this.irisApertureGroup);

    this.layerIrisGears.add(irisGroup);
  }

  // ==========================================
  // LAYER 4: CENTRAL CORE PLASMA & VOLUMETRIC EMITTER
  // ==========================================
  private buildCentralCore() {
    const coreGroup = new THREE.Group();

    // 1. Innermost Blinding Energy Center (Super-hot white core sphere)
    const coreSphereGeo = new THREE.SphereGeometry(0.22, 32, 32);
    const coreSphereMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
    });
    const coreSphere = new THREE.Mesh(coreSphereGeo, coreSphereMat);
    coreSphere.position.z = 0.12;
    coreGroup.add(coreSphere);

    // 2. High-Energy Pulsing Plasma Cylinder / Disk
    const plasmaGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.08, 32);
    const plasmaMat = new THREE.MeshBasicMaterial({
      color: this.config.theme.emissiveHex,
      transparent: true,
      opacity: 0.85,
    });
    this.emissiveMaterials.push(plasmaMat);
    this.corePlasmaMesh = new THREE.Mesh(plasmaGeo, plasmaMat);
    this.corePlasmaMesh.rotation.x = Math.PI / 2;
    this.corePlasmaMesh.position.z = 0.1;
    coreGroup.add(this.corePlasmaMesh);

    // 3. Concentric Inner Halo Emitter Ring
    const haloGeo = new THREE.TorusGeometry(0.48, 0.04, 16, 48);
    const haloMat = new THREE.MeshBasicMaterial({
      color: this.config.theme.glowHex,
      transparent: true,
      opacity: 0.9,
    });
    this.emissiveMaterials.push(haloMat);
    this.coreInnerGlowMesh = new THREE.Mesh(haloGeo, haloMat);
    this.coreInnerGlowMesh.position.z = 0.11;
    coreGroup.add(this.coreInnerGlowMesh);

    // 4. Iconic Triangular Aperture Trim (Iron Man Mk VI / Mk 50 tribute)
    const triGroup = new THREE.Group();
    const triPts = [
      new THREE.Vector3(0, 0.28, 0.14),
      new THREE.Vector3(0.24, -0.16, 0.14),
      new THREE.Vector3(-0.24, -0.16, 0.14),
      new THREE.Vector3(0, 0.28, 0.14),
    ];
    const triGeo = new THREE.BufferGeometry().setFromPoints(triPts);
    const triMat = new THREE.LineBasicMaterial({
      color: this.config.theme.emissiveHex,
      linewidth: 2,
    });
    const triLine = new THREE.Line(triGeo, triMat);
    triGroup.add(triLine);

    // Inverted inner triangle for complex sacred energy geometry
    const invTriPts = [
      new THREE.Vector3(0, -0.28, 0.14),
      new THREE.Vector3(0.24, 0.16, 0.14),
      new THREE.Vector3(-0.24, 0.16, 0.14),
      new THREE.Vector3(0, -0.28, 0.14),
    ];
    const invTriGeo = new THREE.BufferGeometry().setFromPoints(invTriPts);
    const invTriLine = new THREE.Line(invTriGeo, triMat);
    triGroup.add(invTriLine);
    coreGroup.add(triGroup);

    // 5. Volumetric Radial Light Shafts / Rays (Billboard spokes radiating from core)
    const raysGeo = new THREE.PlaneGeometry(3.2, 3.2);
    // Create radial starburst texture programmatically via canvas
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(256, 256, 10, 256, 256, 256);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    grad.addColorStop(0.2, 'rgba(0, 240, 255, 0.6)');
    grad.addColorStop(0.6, 'rgba(0, 119, 255, 0.15)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Draw sharp ray lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 3;
    for (let r = 0; r < 12; r++) {
      const a = (r / 12) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(256, 256);
      ctx.lineTo(256 + Math.cos(a) * 250, 256 + Math.sin(a) * 250);
      ctx.stroke();
    }

    const raysTexture = new THREE.CanvasTexture(canvas);
    const raysMat = new THREE.MeshBasicMaterial({
      map: raysTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      opacity: 0.65,
      depthWrite: false,
    });
    this.volumetricRaysMesh = new THREE.Mesh(raysGeo, raysMat);
    this.volumetricRaysMesh.position.z = 0.05;
    coreGroup.add(this.volumetricRaysMesh);

    this.layerCoreEmitter.add(coreGroup);
  }

  // ==========================================
  // LAYER 5: FRONT PROTECTIVE QUARTZ GLASS
  // ==========================================
  private buildFrontGlass() {
    const glassGroup = new THREE.Group();

    // 1. Outer Torus Glass Cover Ring protecting the coils
    const glassRingGeo = new THREE.TorusGeometry(1.28, 0.14, 24, 64);
    const glassRingMat = new THREE.MeshPhysicalMaterial({
      color: 0xc8e6f5,
      transmission: 0.88,
      opacity: 0.7,
      transparent: true,
      roughness: 0.08,
      ior: 1.52,
      metalness: 0.05,
      reflectivity: 0.9,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
    });
    this.glassMaterials.push(glassRingMat);
    const glassRing = new THREE.Mesh(glassRingGeo, glassRingMat);
    glassRing.position.z = 0.16;
    glassGroup.add(glassRing);

    // 2. Stepped Beveled Central Crystal Dome
    const domeGeo = new THREE.CylinderGeometry(0.55, 0.6, 0.06, 32);
    const domeMat = new THREE.MeshPhysicalMaterial({
      color: 0xddf4ff,
      transmission: 0.92,
      opacity: 0.65,
      transparent: true,
      roughness: 0.05,
      ior: 1.55,
      clearcoat: 1.0,
    });
    this.glassMaterials.push(domeMat);
    const domeMesh = new THREE.Mesh(domeGeo, domeMat);
    domeMesh.rotation.x = Math.PI / 2;
    domeMesh.position.z = 0.22;
    glassGroup.add(domeMesh);

    this.layerFrontGlass.add(glassGroup);
  }

  // ==========================================
  // 3D HOLOGRAPHIC BLUEPRINT RINGS
  // ==========================================
  private buildHologramRings() {
    // 3D holographic coordinate circles with dashed lines and rotation
    const holoRing1Geo = new THREE.RingGeometry(2.0, 2.015, 64);
    const holoRing1Mat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
    });
    const holoRing1 = new THREE.Mesh(holoRing1Geo, holoRing1Mat);
    holoRing1.position.z = 0.08;
    this.hologramRingsGroup.add(holoRing1);

    const holoRing2Geo = new THREE.RingGeometry(2.35, 2.37, 64);
    const holoRing2Mat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });
    const holoRing2 = new THREE.Mesh(holoRing2Geo, holoRing2Mat);
    holoRing2.position.z = -0.05;
    this.hologramRingsGroup.add(holoRing2);

    // Faint crosshair axes
    const crossGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-2.6, 0, 0),
      new THREE.Vector3(2.6, 0, 0),
      new THREE.Vector3(0, -2.6, 0),
      new THREE.Vector3(0, 2.6, 0),
    ]);
    const crossMat = new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.25,
    });
    const crossLines = new THREE.LineSegments(crossGeo, crossMat);
    this.hologramRingsGroup.add(crossLines);
  }

  // ==========================================
  // DANCING ELECTRIC ARCS / LIGHTNING
  // ==========================================
  private buildElectricArcs() {
    const arcCount = 4;
    const arcMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      linewidth: 2,
      transparent: true,
      opacity: 0.85,
    });

    for (let i = 0; i < arcCount; i++) {
      const points = [];
      for (let p = 0; p < 8; p++) {
        points.push(new THREE.Vector3(0, 0, 0.12));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geo, arcMat);
      this.electricArcLines.push(line);
      this.rootGroup.add(line);
    }
  }

  // ==========================================
  // PARTICLE SYSTEMS (Ambient + Vortex)
  // ==========================================
  private buildParticleSystems() {
    // 1. Ambient Floating Plasma Motes (1,200 particles)
    const ambientCount = 1200;
    const ambientGeo = new THREE.BufferGeometry();
    const ambientPos = new Float32Array(ambientCount * 3);
    const ambientVel = new Float32Array(ambientCount * 3);

    for (let i = 0; i < ambientCount; i++) {
      ambientPos[i * 3] = (Math.random() - 0.5) * 8.0;
      ambientPos[i * 3 + 1] = (Math.random() - 0.5) * 8.0;
      ambientPos[i * 3 + 2] = (Math.random() - 0.5) * 6.0;

      ambientVel[i * 3] = (Math.random() - 0.5) * 0.005;
      ambientVel[i * 3 + 1] = (Math.random() - 0.5) * 0.005;
      ambientVel[i * 3 + 2] = (Math.random() - 0.5) * 0.005;
    }

    ambientGeo.setAttribute('position', new THREE.BufferAttribute(ambientPos, 3));
    ambientGeo.setAttribute('velocity', new THREE.BufferAttribute(ambientVel, 3));

    const pCanvas = document.createElement('canvas');
    pCanvas.width = 64;
    pCanvas.height = 64;
    const pCtx = pCanvas.getContext('2d')!;
    const pGrad = pCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
    pGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    pGrad.addColorStop(0.3, 'rgba(0, 240, 255, 0.8)');
    pGrad.addColorStop(0.8, 'rgba(0, 119, 255, 0.2)');
    pGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    pCtx.fillStyle = pGrad;
    pCtx.fillRect(0, 0, 64, 64);
    const pTexture = new THREE.CanvasTexture(pCanvas);

    const ambientMat = new THREE.PointsMaterial({
      size: 0.07,
      map: pTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: 0x00f0ff,
    });
    this.ambientParticles = new THREE.Points(ambientGeo, ambientMat);
    this.scene.add(this.ambientParticles);

    // 2. Core Vortex Particles (600 particles spiraling inward)
    const vortexCount = 600;
    const vortexGeo = new THREE.BufferGeometry();
    const vortexPos = new Float32Array(vortexCount * 3);
    const vortexMeta = new Float32Array(vortexCount * 3); // radius, angle, speed

    for (let i = 0; i < vortexCount; i++) {
      const radius = 0.35 + Math.random() * 1.6;
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 1.5;

      vortexPos[i * 3] = Math.cos(angle) * radius;
      vortexPos[i * 3 + 1] = Math.sin(angle) * radius;
      vortexPos[i * 3 + 2] = (Math.random() - 0.5) * 0.4 + 0.1;

      vortexMeta[i * 3] = radius;
      vortexMeta[i * 3 + 1] = angle;
      vortexMeta[i * 3 + 2] = speed;
    }

    vortexGeo.setAttribute('position', new THREE.BufferAttribute(vortexPos, 3));
    vortexGeo.setAttribute('meta', new THREE.BufferAttribute(vortexMeta, 3));

    const vortexMat = new THREE.PointsMaterial({
      size: 0.055,
      map: pTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: 0x38bdf8,
    });
    this.vortexParticles = new THREE.Points(vortexGeo, vortexMat);
    this.rootGroup.add(this.vortexParticles);
  }

  // ==========================================
  // EXPANDING SHOCKWAVE PULSE MESHES
  // ==========================================
  private buildShockwaves() {
    for (let i = 0; i < 3; i++) {
      const waveGeo = new THREE.RingGeometry(0.3, 0.38, 64);
      const waveMat = new THREE.MeshBasicMaterial({
        color: this.config.theme.emissiveHex,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      });
      const wave = new THREE.Mesh(waveGeo, waveMat);
      wave.position.z = 0.14;
      this.shockwaveMeshes.push(wave);
      this.rootGroup.add(wave);
    }
  }

  // ==========================================
  // CONFIG & THEME UPDATERS
  // ==========================================
  public applyTheme(theme: ReactorTheme) {
    this.config.theme = theme;

    this.corePointLight.color.setHex(theme.emissiveHex);

    // Update emissive materials
    for (const mat of this.emissiveMaterials) {
      mat.color.setHex(theme.emissiveHex);
    }

    // Update plasma mesh
    if (this.corePlasmaMesh) {
      (this.corePlasmaMesh.material as THREE.MeshBasicMaterial).color.setHex(theme.emissiveHex);
    }
    if (this.coreInnerGlowMesh) {
      (this.coreInnerGlowMesh.material as THREE.MeshBasicMaterial).color.setHex(theme.glowHex);
    }

    // Update particles
    if (this.ambientParticles) {
      (this.ambientParticles.material as THREE.PointsMaterial).color.setHex(theme.emissiveHex);
    }
    if (this.vortexParticles) {
      (this.vortexParticles.material as THREE.PointsMaterial).color.setHex(theme.glowHex);
    }
  }

  public setPowerBoost(boost: boolean) {
    this.config.powerBoost = boost;
    if (boost) {
      // Trigger shockwave pulse animation
      this.triggerShockwaveBurst();
    }
  }

  public setHologramMode(enabled: boolean) {
    this.config.hologramMode = enabled;

    const allMats = [
      ...this.metallicMaterials,
      ...this.copperMaterials,
      ...this.glassMaterials,
    ];

    for (const mat of allMats) {
      if (enabled) {
        if (!this.wireframeBackup.has(mat)) {
          this.wireframeBackup.set(mat, mat.wireframe);
        }
        mat.wireframe = true;
        if ('color' in mat) {
          (mat as THREE.MeshStandardMaterial).color.setHex(0x00f0ff);
        }
        mat.transparent = true;
        mat.opacity = 0.6;
      } else {
        const prev = this.wireframeBackup.get(mat) || false;
        mat.wireframe = prev;
        mat.transparent = false;
        mat.opacity = 1.0;
        // Restore specific colors
        if (this.copperMaterials.includes(mat as THREE.MeshStandardMaterial)) {
          (mat as THREE.MeshStandardMaterial).color.setHex(0xd97736);
        } else if (this.metallicMaterials.includes(mat as THREE.MeshStandardMaterial)) {
          (mat as THREE.MeshStandardMaterial).color.setHex(0x1e2530);
        } else if (this.glassMaterials.includes(mat as THREE.MeshPhysicalMaterial)) {
          (mat as THREE.MeshPhysicalMaterial).transparent = true;
          (mat as THREE.MeshPhysicalMaterial).opacity = 0.7;
          (mat as THREE.MeshPhysicalMaterial).color.setHex(0xc8e6f5);
        }
      }
    }
  }

  public setExplodedView(exploded: boolean) {
    this.config.explodedView = exploded;
    if (exploded) {
      this.targetExplodedZ = {
        glass: 1.4,
        chassis: 0.8,
        coils: 0.35,
        iris: -0.25,
        core: -0.7,
        rear: -1.3,
      };
    } else {
      this.targetExplodedZ = {
        glass: 0,
        chassis: 0,
        coils: 0,
        iris: 0,
        core: 0,
        rear: 0,
      };
    }
  }

  public setAutoRotate(auto: boolean) {
    this.config.autoRotate = auto;
    this.controls.autoRotate = auto;
  }

  public resetView() {
    this.camera.position.set(0, 0, 4.4);
    this.camera.lookAt(0, 0, 0);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  public triggerShockwaveBurst() {
    for (let i = 0; i < this.shockwaveMeshes.length; i++) {
      const wave = this.shockwaveMeshes[i];
      wave.scale.set(0.5, 0.5, 0.5);
      (wave.material as THREE.MeshBasicMaterial).opacity = 0.9;
    }
  }

  public startCinematicSequence() {
    this.isStartingUp = true;
    this.startupTime = 0;

    // Start with camera far back in darkness
    this.camera.position.set(0, 0, 7.8);
    this.corePointLight.intensity = 0.1;
    this.ambientLight.intensity = 0.1;

    // Temporarily disperse layers in Z space
    this.currentExplodedZ = {
      glass: 2.2,
      chassis: 1.4,
      coils: 0.8,
      iris: -0.6,
      core: -1.2,
      rear: -1.8,
    };
    this.targetExplodedZ = {
      glass: 0,
      chassis: 0,
      coils: 0,
      iris: 0,
      core: 0,
      rear: 0,
    };
  }

  // ==========================================
  // INTERACTION HANDLERS
  // ==========================================
  private onResize = () => {
    if (!this.container || this.isDestroyed) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private onMouseMove = (e: MouseEvent) => {
    this.mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
  };

  private onTouchMove = (e: TouchEvent) => {
    if (e.touches.length > 0) {
      this.mouse.targetX = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
      this.mouse.targetY = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
    }
  };

  // ==========================================
  // MAIN ANIMATION LOOP
  // ==========================================
  private animate = () => {
    if (this.isDestroyed) return;
    this.animFrameId = requestAnimationFrame(this.animate);

    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();

    // 1. Smooth Mouse Parallax Lerp
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    // Subtle gentle tilt follow when not dragging
    if (!this.isUserInteracting) {
      this.rootGroup.rotation.y = this.mouse.x * 0.12;
      this.rootGroup.rotation.x = -this.mouse.y * 0.12;
    }

    // 2. Handle Cinematic Startup Sequence
    if (this.isStartingUp) {
      this.startupTime += delta;
      const progress = Math.min(this.startupTime / this.startupDuration, 1.0);

      // Camera flies in smoothly
      this.camera.position.z = THREE.MathUtils.lerp(7.8, 4.4, Math.sin((progress * Math.PI) / 2));

      // Light levels ramp up
      this.corePointLight.intensity = THREE.MathUtils.lerp(0.1, 3.5, progress);
      this.ambientLight.intensity = THREE.MathUtils.lerp(0.1, 1.2, progress);

      // Coil sequential lighting
      const activeCoils = Math.floor(progress * 14);
      for (let i = 0; i < this.coilGlowMeshes.length; i++) {
        const coilMat = this.coilGlowMeshes[i].material as THREE.MeshBasicMaterial;
        coilMat.opacity = i <= activeCoils ? 0.9 : 0.08;
      }

      // Final shockwave at 85% progress
      if (progress >= 0.85 && progress - delta / this.startupDuration < 0.85) {
        this.triggerShockwaveBurst();
      }

      if (progress >= 1.0) {
        this.isStartingUp = false;
        if (this.config.onStartupComplete) {
          this.config.onStartupComplete();
        }
      }
    }

    // 3. Smooth Exploded View Interpolation
    const lerpSpeed = 0.08;
    this.currentExplodedZ.glass += (this.targetExplodedZ.glass - this.currentExplodedZ.glass) * lerpSpeed;
    this.currentExplodedZ.chassis += (this.targetExplodedZ.chassis - this.currentExplodedZ.chassis) * lerpSpeed;
    this.currentExplodedZ.coils += (this.targetExplodedZ.coils - this.currentExplodedZ.coils) * lerpSpeed;
    this.currentExplodedZ.iris += (this.targetExplodedZ.iris - this.currentExplodedZ.iris) * lerpSpeed;
    this.currentExplodedZ.core += (this.targetExplodedZ.core - this.currentExplodedZ.core) * lerpSpeed;
    this.currentExplodedZ.rear += (this.targetExplodedZ.rear - this.currentExplodedZ.rear) * lerpSpeed;

    this.layerFrontGlass.position.z = this.currentExplodedZ.glass;
    this.layerOuterChassis.position.z = this.currentExplodedZ.chassis;
    this.layerCoilSegments.position.z = this.currentExplodedZ.coils;
    this.layerIrisGears.position.z = this.currentExplodedZ.iris;
    this.layerCoreEmitter.position.z = this.currentExplodedZ.core;
    this.layerRearHeatsink.position.z = this.currentExplodedZ.rear;

    // 4. Rotational Speeds & Power Boost Multiplier
    const speedMult = this.config.powerBoost ? 2.8 : 1.0;
    const pulseMult = this.config.powerBoost ? 1.7 : 1.0;

    // Outer ring slow clockwise spin
    if (this.outerRingMesh) {
      this.outerRingMesh.rotation.z += 0.003 * speedMult;
    }

    // Middle counter-rotating ring
    if (this.middleCounterRing) {
      this.middleCounterRing.rotation.z -= 0.006 * speedMult;
    }

    // Inner gear ring fine mechanical rhythm
    if (this.innerGearRing) {
      this.innerGearRing.rotation.z += 0.012 * speedMult;
    }

    // Iris blade aperture breathing / pulsing
    if (this.irisApertureGroup) {
      const irisPulse = 1.0 + Math.sin(time * 3 * pulseMult) * 0.035;
      this.irisApertureGroup.scale.set(irisPulse, irisPulse, 1.0);
    }

    // Volumetric Rays rotation and pulse
    if (this.volumetricRaysMesh) {
      this.volumetricRaysMesh.rotation.z += 0.004 * speedMult;
      const rayOpacity = 0.5 + Math.sin(time * 4 * pulseMult) * 0.25;
      (this.volumetricRaysMesh.material as THREE.MeshBasicMaterial).opacity = rayOpacity * (this.config.powerBoost ? 1.4 : 0.8);
    }

    // 5. Central Core Natural Energy Pulse
    const corePulse = 1.0 + Math.sin(time * 5 * pulseMult) * 0.08 + Math.cos(time * 11) * 0.03;
    if (this.corePlasmaMesh) {
      this.corePlasmaMesh.scale.set(corePulse, corePulse, 1.0);
      (this.corePlasmaMesh.material as THREE.MeshBasicMaterial).opacity = 0.75 + Math.sin(time * 6) * 0.2;
    }
    if (this.coreInnerGlowMesh) {
      this.coreInnerGlowMesh.scale.set(corePulse * 1.03, corePulse * 1.03, 1.0);
    }

    // Dynamic point light flicker & intensity
    const lightBase = this.config.powerBoost ? 5.5 : 3.5;
    this.corePointLight.intensity = lightBase + Math.sin(time * 8 * pulseMult) * 0.8 + (Math.random() - 0.5) * 0.2;

    // 6. Animate Dancing Electric Arcs between core and coils
    for (let a = 0; a < this.electricArcLines.length; a++) {
      const line = this.electricArcLines[a];
      const targetAngle = (a / this.electricArcLines.length) * Math.PI * 2 + time * 0.8;
      const targetRadius = 1.15;
      const targetX = Math.cos(targetAngle) * targetRadius;
      const targetY = Math.sin(targetAngle) * targetRadius;

      const positions = line.geometry.attributes.position.array as Float32Array;
      const segCount = positions.length / 3;

      for (let s = 0; s < segCount; s++) {
        const t = s / (segCount - 1);
        const jitter = Math.sin(s * 15 + time * 20) * 0.06 * (1.0 - Math.abs(t - 0.5) * 2);

        positions[s * 3] = targetX * t + (Math.random() - 0.5) * jitter;
        positions[s * 3 + 1] = targetY * t + (Math.random() - 0.5) * jitter;
        positions[s * 3 + 2] = 0.12 + Math.sin(s + time * 10) * 0.03;
      }
      line.geometry.attributes.position.needsUpdate = true;
      (line.material as THREE.LineBasicMaterial).opacity = 0.5 + Math.random() * 0.5;
    }

    // 7. Ambient Particle Movement
    if (this.ambientParticles) {
      const pos = this.ambientParticles.geometry.attributes.position.array as Float32Array;
      const vel = this.ambientParticles.geometry.attributes.velocity.array as Float32Array;
      const count = pos.length / 3;

      for (let i = 0; i < count; i++) {
        pos[i * 3] += vel[i * 3] * speedMult;
        pos[i * 3 + 1] += vel[i * 3 + 1] * speedMult;
        pos[i * 3 + 2] += vel[i * 3 + 2] * speedMult;

        // Wrap boundaries
        if (Math.abs(pos[i * 3]) > 4.0) pos[i * 3] *= -0.95;
        if (Math.abs(pos[i * 3 + 1]) > 4.0) pos[i * 3 + 1] *= -0.95;
        if (Math.abs(pos[i * 3 + 2]) > 3.0) pos[i * 3 + 2] *= -0.95;
      }
      this.ambientParticles.geometry.attributes.position.needsUpdate = true;
    }

    // 8. Vortex Particle Swirl (spiraling into the core)
    if (this.vortexParticles) {
      const vPos = this.vortexParticles.geometry.attributes.position.array as Float32Array;
      const vMeta = this.vortexParticles.geometry.attributes.meta.array as Float32Array;
      const vCount = vPos.length / 3;

      for (let i = 0; i < vCount; i++) {
        let r = vMeta[i * 3];
        let angle = vMeta[i * 3 + 1];
        const spd = vMeta[i * 3 + 2] * speedMult;

        // Inward spiral velocity
        r -= 0.003 * spd;
        angle += (0.02 / Math.max(r, 0.2)) * spd;

        // Reset when particle enters center
        if (r < 0.25) {
          r = 1.6 + Math.random() * 0.3;
        }

        vMeta[i * 3] = r;
        vMeta[i * 3 + 1] = angle;

        vPos[i * 3] = Math.cos(angle) * r;
        vPos[i * 3 + 1] = Math.sin(angle) * r;
      }
      this.vortexParticles.geometry.attributes.position.needsUpdate = true;
    }

    // 9. Shockwave Ripple Expansion
    for (let w = 0; w < this.shockwaveMeshes.length; w++) {
      const wave = this.shockwaveMeshes[w];
      const mat = wave.material as THREE.MeshBasicMaterial;
      if (mat.opacity > 0.01) {
        wave.scale.x += 0.035 * speedMult;
        wave.scale.y += 0.035 * speedMult;
        mat.opacity -= 0.02 * speedMult;
      } else if (this.config.powerBoost && Math.random() < 0.03) {
        // Continuous periodic pulses during boost
        wave.scale.set(0.6, 0.6, 0.6);
        mat.opacity = 0.8;
      }
    }

    // 10. Hologram Ring Rotation
    if (this.hologramRingsGroup) {
      this.hologramRingsGroup.rotation.z += 0.005;
    }

    // 11. Update OrbitControls and Render Scene
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  // ==========================================
  // CLEANUP / DISPOSE
  // ==========================================
  public dispose() {
    this.isDestroyed = true;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('touchmove', this.onTouchMove);

    this.controls.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement && this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
