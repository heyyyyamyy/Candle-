import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { BrandingConfig } from '../types';
import { Sparkles, Eye, Flame, Layers, Camera, Download, ChevronUp, ChevronDown, Check, Palette } from 'lucide-react';

interface ThreeCustomizerProps {
  initialConfig?: Partial<BrandingConfig>;
  onSaveConfig?: (config: BrandingConfig) => void;
  productName?: string;
  defaultMode?: 'candle' | 'hamper';
}

export const ThreeCustomizer: React.FC<ThreeCustomizerProps> = ({
  initialConfig,
  onSaveConfig,
  productName = 'Artisan Soy Candle & Corporate Crate',
  defaultMode = 'candle',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [modelType, setModelType] = useState<'candle' | 'hamper'>(defaultMode);
  const [vesselFinish, setVesselFinish] = useState<BrandingConfig['vesselFinish']>(
    initialConfig?.vesselFinish || 'amber-glass'
  );
  const [lidFinish, setLidFinish] = useState<BrandingConfig['lidFinish']>(
    initialConfig?.lidFinish || 'bamboo'
  );
  const [companyName, setCompanyName] = useState(initialConfig?.companyName || 'ACME GLOBAL');
  const [engravingText, setEngravingText] = useState(initialConfig?.engravingText || 'EST. 2026 • ANNUAL SUMMIT');
  const [scentChoice, setScentChoice] = useState(initialConfig?.scentChoice || 'Amber & Smoked Fig');
  const [giftCardMessage, setGiftCardMessage] = useState(
    initialConfig?.giftCardMessage || 'In appreciation of your exceptional dedication and excellence.'
  );
  const [isFlameLit, setIsFlameLit] = useState(true);
  const [explodedAmount, setExplodedAmount] = useState(0);
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'finish' | 'branding' | 'view'>('branding');

  // Internal references to 3D objects for dynamic property updates without rebuilding scene
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const candleGroupRef = useRef<THREE.Group | null>(null);
  const hamperGroupRef = useRef<THREE.Group | null>(null);
  const flameMeshRef = useRef<THREE.Mesh | null>(null);
  const flameLightRef = useRef<THREE.PointLight | null>(null);
  const labelTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const lidEngravingTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const cardTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const vesselMaterialRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const lidMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const lidMeshRef = useRef<THREE.Mesh | null>(null);
  const hamperLidRef = useRef<THREE.Group | null>(null);

  // Generate dynamic canvas texture for corporate logo label
  const createLabelTexture = useCallback((brand: string, sub: string, scent: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Background paper / parchment texture
    ctx.fillStyle = '#f7f5f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Elegant gold border line
    ctx.strokeStyle = '#c5a059';
    ctx.lineWidth = 6;
    ctx.strokeRect(32, 32, canvas.width - 64, canvas.height - 64);
    ctx.lineWidth = 2;
    ctx.strokeRect(44, 44, canvas.width - 88, canvas.height - 88);

    // Decorative corner flourishes
    ctx.fillStyle = '#c5a059';
    ctx.fillRect(52, 52, 12, 12);
    ctx.fillRect(canvas.width - 64, 52, 12, 12);
    ctx.fillRect(52, canvas.height - 64, 12, 12);
    ctx.fillRect(canvas.width - 64, canvas.height - 64, 12, 12);

    // Corporate Brand Header
    ctx.fillStyle = '#1c1b18';
    ctx.textAlign = 'center';
    ctx.font = 'bold 54px "Cinzel", "Times New Roman", serif';
    ctx.letterSpacing = '6px';
    ctx.fillText(brand.toUpperCase() || 'LUMINA & OAK', canvas.width / 2, 150);

    // Subtle divider
    ctx.strokeStyle = '#c5a059';
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 120, 180);
    ctx.lineTo(canvas.width / 2 + 120, 180);
    ctx.stroke();

    // Scent name
    ctx.fillStyle = '#4a443d';
    ctx.font = 'italic 34px "Georgia", serif';
    ctx.fillText(scent, canvas.width / 2, 240);

    // Custom corporate engraving / dedication
    ctx.fillStyle = '#7a7065';
    ctx.font = '600 24px "Montserrat", sans-serif';
    ctx.letterSpacing = '2px';
    ctx.fillText(sub.toUpperCase() || 'BESPOKE CORPORATE COLLECTION', canvas.width / 2, 320);

    // Bottom spec
    ctx.fillStyle = '#9e9488';
    ctx.font = '20px sans-serif';
    ctx.fillText('100% PURE BOTANICAL SOY • HAND-POURED • 65 HR BURN', canvas.width / 2, 420);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }, []);

  // Generate dynamic wood lid laser engraving texture
  const createLidEngravingTexture = useCallback((brand: string, text: string, woodType: 'bamboo' | 'walnut' | 'brass') => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Wood base color
    if (woodType === 'bamboo') {
      ctx.fillStyle = '#d6b88b';
    } else if (woodType === 'walnut') {
      ctx.fillStyle = '#4a3325';
    } else {
      ctx.fillStyle = '#d4af37';
    }
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle concentric wood rings
    ctx.strokeStyle = woodType === 'walnut' ? 'rgba(30, 20, 15, 0.15)' : 'rgba(120, 80, 40, 0.08)';
    ctx.lineWidth = 4;
    for (let r = 80; r < 500; r += 28) {
      ctx.beginPath();
      ctx.arc(512, 512, r + (Math.sin(r) * 6), 0, Math.PI * 2);
      ctx.stroke();
    }

    // Circular laser etched border
    ctx.strokeStyle = woodType === 'walnut' ? '#22150d' : (woodType === 'brass' ? '#785f1c' : '#573d26');
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(512, 512, 440, 0, Math.PI * 2);
    ctx.stroke();

    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(512, 512, 420, 0, Math.PI * 2);
    ctx.stroke();

    // Laser burned branding text
    ctx.fillStyle = woodType === 'walnut' ? '#1a0f09' : (woodType === 'brass' ? '#5a4614' : '#4d321d');
    ctx.textAlign = 'center';
    ctx.font = 'bold 56px "Cinzel", "Times New Roman", serif';
    ctx.letterSpacing = '8px';
    ctx.fillText(brand.toUpperCase() || 'CORPORATE GIFT', 512, 490);

    ctx.font = '600 32px sans-serif';
    ctx.letterSpacing = '4px';
    ctx.fillText(text.toUpperCase() || 'SPECIAL EDITION', 512, 570);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }, []);

  // Generate luxury gift card texture
  const createGiftCardTexture = useCallback((msg: string, brand: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 640;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Fine cotton heavy cardstock
    ctx.fillStyle = '#faf8f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Gilded foil border
    ctx.strokeStyle = '#c5a059';
    ctx.lineWidth = 8;
    ctx.strokeRect(36, 36, canvas.width - 72, canvas.height - 72);

    // Foil corporate emblem
    ctx.fillStyle = '#c5a059';
    ctx.font = 'bold 36px "Cinzel", serif';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '4px';
    ctx.fillText(brand.toUpperCase() || 'EXECUTIVE SUITE', canvas.width / 2, 130);

    // Message text
    ctx.fillStyle = '#2d2926';
    ctx.font = 'italic 32px "Georgia", serif';
    ctx.textAlign = 'center';

    // Word wrap
    const words = msg.split(' ');
    let line = '';
    let y = 240;
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > 800 && i > 0) {
        ctx.fillText(line, canvas.width / 2, y);
        line = words[i] + ' ';
        y += 46;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, canvas.width / 2, y);

    // Signature line
    ctx.fillStyle = '#8c827a';
    ctx.font = '22px sans-serif';
    ctx.fillText('With Gratitude & Highest Regards', canvas.width / 2, y + 80);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }, []);

  // Update materials when finish changes
  useEffect(() => {
    if (!vesselMaterialRef.current) return;
    const mat = vesselMaterialRef.current;

    switch (vesselFinish) {
      case 'amber-glass':
        mat.color.setHex(0x9a5b28);
        mat.roughness = 0.12;
        mat.metalness = 0.1;
        mat.transmission = 0.6;
        mat.transparent = true;
        mat.opacity = 0.92;
        break;
      case 'matte-noir':
        mat.color.setHex(0x18181b);
        mat.roughness = 0.65;
        mat.metalness = 0.25;
        mat.transmission = 0;
        mat.transparent = false;
        mat.opacity = 1.0;
        break;
      case 'alabaster-white':
        mat.color.setHex(0xf4f4f5);
        mat.roughness = 0.35;
        mat.metalness = 0.05;
        mat.transmission = 0.45;
        mat.transparent = true;
        mat.opacity = 0.95;
        break;
      case 'emerald-forest':
        mat.color.setHex(0x0e3b2e);
        mat.roughness = 0.25;
        mat.metalness = 0.3;
        mat.transmission = 0.5;
        mat.transparent = true;
        mat.opacity = 0.94;
        break;
      case 'rose-copper':
        mat.color.setHex(0xb87333);
        mat.roughness = 0.18;
        mat.metalness = 0.9;
        mat.transmission = 0;
        mat.transparent = false;
        mat.opacity = 1.0;
        break;
    }
    mat.needsUpdate = true;
  }, [vesselFinish]);

  // Update lid material when lidFinish changes
  useEffect(() => {
    if (!lidMaterialRef.current) return;
    const mat = lidMaterialRef.current;
    if (lidFinish === 'bamboo') {
      mat.color.setHex(0xd6b88b);
      mat.roughness = 0.65;
      mat.metalness = 0.05;
    } else if (lidFinish === 'walnut') {
      mat.color.setHex(0x4a3325);
      mat.roughness = 0.55;
      mat.metalness = 0.08;
    } else {
      mat.color.setHex(0xd4af37);
      mat.roughness = 0.22;
      mat.metalness = 0.9;
    }
    mat.needsUpdate = true;
  }, [lidFinish]);

  // Update textures on branding text changes
  useEffect(() => {
    if (labelTextureRef.current) {
      const newTex = createLabelTexture(companyName, engravingText, scentChoice);
      if (newTex) {
        labelTextureRef.current.image = newTex.image;
        labelTextureRef.current.needsUpdate = true;
      }
    }
    if (lidEngravingTextureRef.current) {
      const newLidTex = createLidEngravingTexture(companyName, engravingText, lidFinish);
      if (newLidTex) {
        lidEngravingTextureRef.current.image = newLidTex.image;
        lidEngravingTextureRef.current.needsUpdate = true;
      }
    }
    if (cardTextureRef.current) {
      const newCardTex = createGiftCardTexture(giftCardMessage, companyName);
      if (newCardTex) {
        cardTextureRef.current.image = newCardTex.image;
        cardTextureRef.current.needsUpdate = true;
      }
    }
  }, [companyName, engravingText, scentChoice, lidFinish, giftCardMessage, createLabelTexture, createLidEngravingTexture, createGiftCardTexture]);

  // Handle exploded view slider
  useEffect(() => {
    if (lidMeshRef.current) {
      // Move candle lid up as exploded slider increases
      lidMeshRef.current.position.y = 2.15 + (explodedAmount * 1.8);
    }
    if (hamperLidRef.current) {
      // Slide hamper crate lid outward and up
      hamperLidRef.current.position.y = 1.3 + (explodedAmount * 2.2);
      hamperLidRef.current.position.z = -(explodedAmount * 1.5);
    }
  }, [explodedAmount]);

  // Toggle model visibility
  useEffect(() => {
    if (candleGroupRef.current) {
      candleGroupRef.current.visible = modelType === 'candle';
    }
    if (hamperGroupRef.current) {
      hamperGroupRef.current.visible = modelType === 'hamper';
    }
  }, [modelType]);

  // Toggle flame
  useEffect(() => {
    if (flameMeshRef.current) {
      flameMeshRef.current.visible = isFlameLit;
    }
    if (flameLightRef.current) {
      flameLightRef.current.intensity = isFlameLit ? 2.5 : 0;
    }
  }, [isFlameLit]);

  // Mount 3D Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Detect software WebGL safely
    const isSoftwareGl = (() => {
      const probeCanvas = document.createElement('canvas');
      const gl = probeCanvas.getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 650;

    // 2. Setup WebGLRenderer with ACES Filmic Tone Mapping
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Scene and Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xf6f4ef);
    scene.fog = new THREE.FogExp2(0xf6f4ef, 0.035);

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50);
    camera.position.set(4.8, 3.8, 6.2);
    cameraRef.current = camera;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.05; // allow looking slightly from below
    controls.minDistance = 2.5;
    controls.maxDistance = 14;
    controls.target.set(0, 0.8, 0);
    controlsRef.current = controls;

    // 4. Studio Environment Lighting (RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. Studio 3-Point Lighting Rig
    const keyLight = new THREE.DirectionalLight(0xfff5ea, 3.2);
    keyLight.position.set(5, 8, 4);
    keyLight.castShadow = !isSoftwareGl;
    if (keyLight.shadow) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const fillLight = new THREE.HemisphereLight(0xe8f0fe, 0x1a1816, 1.4);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffd8a8, 1.8);
    rimLight.position.set(-5, 4, -4);
    scene.add(rimLight);

    // Soft Ground Radial Contact Shadow Disc
    const shadowGeo = new THREE.PlaneGeometry(7, 7);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(128, 128, 10, 128, 128, 120);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0.65)');
      grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.25)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 256, 256);
    }
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.01;
    scene.add(shadowMesh);

    // ==========================================
    // 6. PROCEDURAL MODEL A: LUXURY SOY CANDLE
    // Assembled as a THREE.Group of 8 distinct parts
    // ==========================================
    const candleGroup = new THREE.Group();
    candleGroupRef.current = candleGroup;

    // Part 1: Outer Glass Jar (heavy glass base + wall)
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x9a5b28,
      roughness: 0.12,
      metalness: 0.1,
      transmission: 0.6,
      transparent: true,
      opacity: 0.92,
      ior: 1.52,
    });
    vesselMaterialRef.current = glassMat;

    const jarGeo = new THREE.CylinderGeometry(1.2, 1.15, 2.3, 48, 1, true);
    const jarMesh = new THREE.Mesh(jarGeo, glassMat);
    jarMesh.position.y = 1.15;
    jarMesh.castShadow = !isSoftwareGl;
    candleGroup.add(jarMesh);

    // Part 2: Heavy Solid Base Disc
    const baseGeo = new THREE.CylinderGeometry(1.15, 1.15, 0.25, 48);
    const baseMesh = new THREE.Mesh(baseGeo, glassMat);
    baseMesh.position.y = 0.125;
    candleGroup.add(baseMesh);

    // Part 3: Brushed Metallic Accent Rim / Collar
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.2,
      metalness: 0.92,
    });
    const rimGeo = new THREE.TorusGeometry(1.2, 0.045, 16, 48);
    rimGeo.rotateX(Math.PI / 2);
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.position.y = 2.3;
    candleGroup.add(rimMesh);

    // Part 4: Poured Soy Candle Wax Core
    const waxMat = new THREE.MeshStandardMaterial({
      color: 0xfffae8,
      roughness: 0.45,
      metalness: 0.02,
    });
    const waxGeo = new THREE.CylinderGeometry(1.12, 1.08, 1.85, 36);
    const waxMesh = new THREE.Mesh(waxGeo, waxMat);
    waxMesh.position.y = 1.05;
    candleGroup.add(waxMesh);

    // Part 5: Braided Cotton Wick
    const wickMat = new THREE.MeshStandardMaterial({
      color: 0x221a14,
      roughness: 0.9,
    });
    const wickGeo = new THREE.CylinderGeometry(0.028, 0.028, 0.45, 12);
    const wickMesh = new THREE.Mesh(wickGeo, wickMat);
    wickMesh.position.y = 2.05;
    candleGroup.add(wickMesh);

    // Part 6: Animated Glowing Flame
    const flameGeo = new THREE.ConeGeometry(0.09, 0.35, 16);
    flameGeo.translate(0, 0.175, 0);
    const flameMat = new THREE.MeshBasicMaterial({
      color: 0xffb732,
    });
    const flameMesh = new THREE.Mesh(flameGeo, flameMat);
    flameMesh.position.y = 2.18;
    candleGroup.add(flameMesh);
    flameMeshRef.current = flameMesh;

    // Point Light for candlelight flicker
    const flameLight = new THREE.PointLight(0xff9d28, 2.5, 6, 2);
    flameLight.position.set(0, 2.35, 0);
    candleGroup.add(flameLight);
    flameLightRef.current = flameLight;

    // Part 7: Dynamic Corporate Logo Printed Label (Curved Decal on Vessel)
    const labelTex = createLabelTexture(companyName, engravingText, scentChoice);
    labelTextureRef.current = labelTex;
    const labelMat = new THREE.MeshBasicMaterial({
      map: labelTex,
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });
    // Arc segment cylinder for decal with high radial resolution to prevent chord clipping
    const labelGeo = new THREE.CylinderGeometry(1.218, 1.168, 1.35, 96, 1, true, -Math.PI / 3, (2 * Math.PI) / 3);
    const labelMesh = new THREE.Mesh(labelGeo, labelMat);
    labelMesh.position.y = 1.15;
    candleGroup.add(labelMesh);

    // Part 8: Turned Wooden Lid with Custom Laser Engraving
    const lidMat = new THREE.MeshStandardMaterial({
      color: 0xd6b88b,
      roughness: 0.65,
      metalness: 0.05,
    });
    lidMaterialRef.current = lidMat;

    const lidEngraveTex = createLidEngravingTexture(companyName, engravingText, 'bamboo');
    lidEngravingTextureRef.current = lidEngraveTex;
    const lidTopMat = new THREE.MeshStandardMaterial({
      map: lidEngraveTex,
      roughness: 0.6,
      metalness: 0.05,
    });

    const lidMaterials = [
      lidMat, // side
      lidTopMat, // top with laser engraving
      lidMat, // bottom
    ];

    const lidGeo = new THREE.CylinderGeometry(1.28, 1.28, 0.22, 48);
    const lidMesh = new THREE.Mesh(lidGeo, lidMaterials);
    lidMesh.position.y = 2.41;
    lidMesh.castShadow = !isSoftwareGl;
    candleGroup.add(lidMesh);
    lidMeshRef.current = lidMesh;

    scene.add(candleGroup);

    // ==========================================
    // 7. PROCEDURAL MODEL B: CORPORATE LUXURY GIFT HAMPER
    // Assembled as a composite 9-part wooden crate with nestled items
    // ==========================================
    const hamperGroup = new THREE.Group();
    hamperGroupRef.current = hamperGroup;
    hamperGroup.visible = modelType === 'hamper';

    // Part B1: Wooden Hamper Crate Outer Box
    const crateMat = new THREE.MeshStandardMaterial({
      color: 0x2b221d,
      roughness: 0.75,
      metalness: 0.05,
    });
    const crateGeo = new THREE.BoxGeometry(4.8, 1.4, 3.4);
    const crateMesh = new THREE.Mesh(crateGeo, crateMat);
    crateMesh.position.y = 0.7;
    crateMesh.castShadow = !isSoftwareGl;
    hamperGroup.add(crateMesh);

    // Part B2: Interior Recessed Nest (Crinkle shredded filler bedding)
    const fillerMat = new THREE.MeshStandardMaterial({
      color: 0xd6c8ab,
      roughness: 0.95,
      metalness: 0,
    });
    const fillerGeo = new THREE.BoxGeometry(4.4, 0.45, 3.0);
    const fillerMesh = new THREE.Mesh(fillerGeo, fillerMat);
    fillerMesh.position.y = 1.05;
    hamperGroup.add(fillerMesh);

    // Part B3: Nestled Mini Artisan Candle
    const miniCandleMat = new THREE.MeshStandardMaterial({
      color: 0x9a5b28,
      roughness: 0.2,
      metalness: 0.1,
    });
    const miniCandleGeo = new THREE.CylinderGeometry(0.7, 0.65, 1.1, 24);
    const miniCandle = new THREE.Mesh(miniCandleGeo, miniCandleMat);
    miniCandle.position.set(-1.2, 1.4, 0.3);
    hamperGroup.add(miniCandle);

    // Part B4: Artisan Apothecary Match Bottle (amber glass + cork)
    const matchBottleMat = new THREE.MeshPhysicalMaterial({
      color: 0x5a3318,
      roughness: 0.2,
      transmission: 0.4,
      transparent: true,
      opacity: 0.9,
    });
    const matchBottleGeo = new THREE.CylinderGeometry(0.28, 0.28, 1.2, 18);
    const matchBottle = new THREE.Mesh(matchBottleGeo, matchBottleMat);
    matchBottle.position.set(-1.2, 1.4, -0.8);
    hamperGroup.add(matchBottle);

    const corkMat = new THREE.MeshStandardMaterial({ color: 0xba9b72, roughness: 0.9 });
    const corkGeo = new THREE.CylinderGeometry(0.22, 0.24, 0.25, 16);
    const cork = new THREE.Mesh(corkGeo, corkMat);
    cork.position.set(-1.2, 2.05, -0.8);
    hamperGroup.add(cork);

    // Part B5: Artisan Gold Tea / Confection Tin
    const goldTinMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.25,
      metalness: 0.88,
    });
    const tinGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.75, 24);
    const goldTin = new THREE.Mesh(tinGeo, goldTinMat);
    goldTin.position.set(0.6, 1.35, -0.6);
    hamperGroup.add(goldTin);

    // Part B6: Bespoke Embossed Corporate Greeting Card
    const cardTex = createGiftCardTexture(giftCardMessage, companyName);
    cardTextureRef.current = cardTex;
    const cardMat = new THREE.MeshStandardMaterial({
      map: cardTex,
      roughness: 0.5,
    });
    const cardGeo = new THREE.PlaneGeometry(1.6, 1.0);
    const cardMesh = new THREE.Mesh(cardGeo, cardMat);
    cardMesh.rotation.x = -Math.PI / 2 + 0.18;
    cardMesh.rotation.z = -0.15;
    cardMesh.position.set(0.7, 1.35, 0.6);
    hamperGroup.add(cardMesh);

    // Part B7: Sliding Wooden Crate Lid with Engraved Corporate Crest
    const hamperLidGroup = new THREE.Group();
    hamperLidRef.current = hamperLidGroup;

    const hamperLidGeo = new THREE.BoxGeometry(4.85, 0.12, 3.45);
    const lidWoodMat = new THREE.MeshStandardMaterial({
      color: 0x3d3029,
      roughness: 0.7,
      metalness: 0.05,
    });
    const hamperLidMesh = new THREE.Mesh(hamperLidGeo, lidWoodMat);
    hamperLidGroup.add(hamperLidMesh);

    // Top laser branding plaque
    const plaqueMat = new THREE.MeshStandardMaterial({
      map: lidEngraveTex,
      roughness: 0.55,
      metalness: 0.1,
    });
    const plaqueGeo = new THREE.PlaneGeometry(3.2, 2.0);
    const plaqueMesh = new THREE.Mesh(plaqueGeo, plaqueMat);
    plaqueMesh.rotation.x = -Math.PI / 2;
    plaqueMesh.position.y = 0.065;
    hamperLidGroup.add(plaqueMesh);

    hamperLidGroup.position.set(0, 1.45, 0);
    hamperGroup.add(hamperLidGroup);

    scene.add(hamperGroup);

    // 8. Animation & Render Loop (Lossless 60fps with Software GL pacing)
    let animationFrameId = 0;
    let clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          animationFrameId = window.setTimeout(poll, 6);
        } else {
          if (sync) gl.deleteSync(sync);
          animationFrameId = window.setTimeout(cb, 60);
        }
      };
      animationFrameId = window.setTimeout(poll, 6);
    }

    const animate = () => {
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Gentle natural flame flickering and light oscillation
      if (flameMeshRef.current && isFlameLit) {
        const flicker = 1.0 + Math.sin(time * 14) * 0.08 + Math.cos(time * 22) * 0.05;
        flameMeshRef.current.scale.set(flicker, 1.0 + Math.sin(time * 18) * 0.12, flicker);
        if (flameLightRef.current) {
          flameLightRef.current.intensity = 2.2 + Math.sin(time * 20) * 0.6;
        }
      }

      controls.update();
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(animate);
      } else {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animate();

    // 9. Resize listener
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight || 650;
      cameraRef.current.aspect = newWidth / newHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (isSoftwareGl) {
        clearTimeout(animationFrameId);
      } else {
        cancelAnimationFrame(animationFrameId);
      }
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Preset Camera Angles
  const setCameraPreset = (view: 'hero' | 'top' | 'close' | 'front') => {
    if (!cameraRef.current || !controlsRef.current) return;
    const cam = cameraRef.current;
    const ctrl = controlsRef.current;

    switch (view) {
      case 'hero':
        cam.position.set(4.8, 3.8, 6.2);
        ctrl.target.set(0, 0.8, 0);
        break;
      case 'top':
        cam.position.set(0.1, 7.5, 0.2);
        ctrl.target.set(0, 1.0, 0);
        break;
      case 'close':
        cam.position.set(2.0, 2.2, 2.5);
        ctrl.target.set(0, 1.6, 0);
        break;
      case 'front':
        cam.position.set(0, 1.5, 5.0);
        ctrl.target.set(0, 1.2, 0);
        break;
    }
    ctrl.update();
  };

  // Capture High-Res Snapshot
  const captureSnapshot = () => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
    rendererRef.current.render(sceneRef.current, cameraRef.current);
    const dataUrl = rendererRef.current.domElement.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${companyName.replace(/\s+/g, '_')}_corporate_spec_3d.png`;
    link.href = dataUrl;
    link.click();
  };

  const handleApplyToCart = () => {
    if (onSaveConfig) {
      onSaveConfig({
        companyName,
        logoText: companyName,
        engravingText,
        vesselFinish,
        lidFinish,
        scentChoice,
        giftCardMessage,
        ribbonColor: 'champagne',
      });
    }
  };

  return (
    <div className="relative w-full h-[660px] bg-[#f6f4ef] rounded-2xl overflow-hidden border border-stone-200 shadow-xs flex flex-col select-none">
      {/* Top Header Spec Badge */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2.5">
        <div className="bg-white/95 text-stone-800 border border-stone-200 px-3.5 py-1.5 rounded-xl text-xs shadow-xs flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span className="font-semibold tracking-wide uppercase text-amber-800 text-[11px]">
            3D Studio
          </span>
          <span className="text-stone-300">•</span>
          <span className="text-stone-600 font-medium">{productName}</span>
        </div>

        {/* Model Switcher Pill */}
        <div className="bg-white/95 border border-stone-200 p-1 rounded-xl flex items-center gap-1 shadow-xs">
          <button
            onClick={() => setModelType('candle')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              modelType === 'candle'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Artisan Candle
          </button>
          <button
            onClick={() => setModelType('hamper')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              modelType === 'hamper'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Gift Crate Hamper
          </button>
        </div>
      </div>

      {/* Top Right Quick Actions */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button
          onClick={() => setIsFlameLit(!isFlameLit)}
          title="Toggle Soy Wick Flame"
          className={`p-2 rounded-xl border text-xs font-medium transition flex items-center gap-1.5 shadow-xs ${
            isFlameLit
              ? 'bg-amber-50 border-amber-300 text-amber-800'
              : 'bg-white/95 border-stone-200 text-stone-500 hover:text-stone-800'
          }`}
        >
          <Flame className="w-4 h-4 text-amber-600" />
          <span className="hidden sm:inline">{isFlameLit ? 'Flame On' : 'Unlit'}</span>
        </button>

        <button
          onClick={captureSnapshot}
          title="Download 3D Mockup Snapshot"
          className="p-2 bg-white/95 border border-stone-200 hover:border-amber-400 rounded-xl text-stone-700 hover:text-amber-800 transition text-xs flex items-center gap-1.5 shadow-xs"
        >
          <Download className="w-4 h-4 text-stone-500" />
          <span className="hidden sm:inline">Export PNG</span>
        </button>
      </div>

      {/* Main 3D Canvas Mount Point */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Collapsible Ergonomic Bottom Control Dock (<=15% viewport footprint) */}
      <div
        className={`absolute bottom-3 left-1/2 -translate-x-1/2 w-[95%] max-w-4xl z-20 transition-all duration-300 ease-in-out ${
          isDockCollapsed ? 'translate-y-[calc(100%-36px)]' : 'translate-y-0'
        }`}
      >
        {/* Toggle Collapse Pill */}
        <div className="flex justify-center mb-1">
          <button
            onClick={() => setIsDockCollapsed(!isDockCollapsed)}
            className="bg-white border border-stone-200 hover:border-amber-400 text-stone-700 px-3.5 py-1 rounded-full text-xs font-medium shadow-xs flex items-center gap-1.5 transition"
          >
            {isDockCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-amber-600" />
                <span>Show Customizer Controls</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                <span>Hide Controls (Full View)</span>
              </>
            )}
          </button>
        </div>

        {/* Dock Container: Solid surfaces (NO backdrop-filter over WebGL) */}
        <div className="bg-white/98 border border-stone-200 rounded-2xl p-3.5 shadow-xl text-stone-900">
          {/* Navigation Tabs */}
          <div className="flex items-center justify-between border-b border-stone-100 pb-2.5 mb-3">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveTab('branding')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold tracking-wide transition flex items-center gap-1.5 ${
                  activeTab === 'branding'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Branding &amp; Logo
              </button>

              <button
                onClick={() => setActiveTab('finish')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold tracking-wide transition flex items-center gap-1.5 ${
                  activeTab === 'finish'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                Finishes &amp; Scent
              </button>

              <button
                onClick={() => setActiveTab('view')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold tracking-wide transition flex items-center gap-1.5 ${
                  activeTab === 'view'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                Exploded &amp; Angles
              </button>
            </div>

            <button
              onClick={handleApplyToCart}
              className="bg-stone-900 hover:bg-amber-700 text-white font-semibold px-4 py-1.5 rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              Apply to Bulk Order
            </button>
          </div>

          {/* Tab 1: Corporate Branding Inputs */}
          {activeTab === 'branding' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">
                  Company Name / Logo Text
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  maxLength={40}
                  className="w-full bg-stone-50 border border-stone-200 focus:border-amber-600 rounded-lg px-2.5 py-1.5 text-xs text-stone-900 outline-none"
                  placeholder="e.g. Acme Corp"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">
                  Lid Laser Engraving
                </label>
                <input
                  type="text"
                  value={engravingText}
                  onChange={(e) => setEngravingText(e.target.value)}
                  maxLength={50}
                  className="w-full bg-stone-50 border border-stone-200 focus:border-amber-600 rounded-lg px-2.5 py-1.5 text-xs text-stone-900 outline-none"
                  placeholder="e.g. Annual Summit 2026"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">
                  Card Message
                </label>
                <input
                  type="text"
                  value={giftCardMessage}
                  onChange={(e) => setGiftCardMessage(e.target.value)}
                  maxLength={90}
                  className="w-full bg-stone-50 border border-stone-200 focus:border-amber-600 rounded-lg px-2.5 py-1.5 text-xs text-stone-900 outline-none"
                  placeholder="e.g. In appreciation of your dedication..."
                />
              </div>
            </div>
          )}

          {/* Tab 2: Materials & Finishes */}
          {activeTab === 'finish' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Vessel Finish */}
              <div>
                <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
                  Vessel Glass Finish
                </label>
                <div className="flex items-center gap-2">
                  {[
                    { id: 'amber-glass', label: 'Amber', color: '#9a5b28' },
                    { id: 'matte-noir', label: 'Noir', color: '#18181b' },
                    { id: 'alabaster-white', label: 'Alabaster', color: '#f4f4f5' },
                    { id: 'emerald-forest', label: 'Forest', color: '#0e3b2e' },
                    { id: 'rose-copper', label: 'Copper', color: '#b87333' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setVesselFinish(f.id as any)}
                      title={f.label}
                      className={`w-7 h-7 rounded-full border-2 transition relative flex items-center justify-center ${
                        vesselFinish === f.id
                          ? 'border-amber-600 scale-110 shadow-xs'
                          : 'border-stone-300 hover:border-stone-400'
                      }`}
                      style={{ backgroundColor: f.color }}
                    >
                      {vesselFinish === f.id && <Check className="w-3.5 h-3.5 text-white drop-shadow" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lid Material */}
              <div>
                <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
                  Lid / Crate Finish
                </label>
                <div className="flex items-center gap-1.5">
                  {[
                    { id: 'bamboo', label: 'Bamboo' },
                    { id: 'walnut', label: 'Walnut' },
                    { id: 'brass', label: 'Brass' },
                  ].map((l) => (
                    <button
                      key={l.id}
                      onClick={() => setLidFinish(l.id as any)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                        lidFinish === l.id
                          ? 'bg-amber-100 border-amber-300 text-amber-900 font-semibold'
                          : 'bg-stone-50 border-stone-200 text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fragrance Selection */}
              <div>
                <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">
                  Signature Fragrance
                </label>
                <select
                  value={scentChoice}
                  onChange={(e) => setScentChoice(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 outline-none"
                >
                  <option value="Amber & Smoked Fig">Amber & Smoked Fig</option>
                  <option value="Noir Vetiver & Oud">Noir Vetiver & Oud</option>
                  <option value="Alabaster Jasmine & Cedar">Alabaster Jasmine & Cedar</option>
                  <option value="French Lavender & Sage">French Lavender & Sage</option>
                  <option value="Cypress & Balsam Fir">Cypress & Balsam Fir</option>
                </select>
              </div>
            </div>
          )}

          {/* Tab 3: Exploded View & Camera Angles */}
          {activeTab === 'view' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-amber-700" />
                    Exploded Architecture View ({Math.round(explodedAmount * 100)}%)
                  </label>
                  <span className="text-[10px] text-stone-400">Separates Lid &amp; Jar</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={explodedAmount}
                  onChange={(e) => setExplodedAmount(parseFloat(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer h-1.5 bg-stone-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
                  Camera Perspectives
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCameraPreset('hero')}
                    className="px-2.5 py-1 bg-stone-100 border border-stone-200 hover:border-amber-400 rounded-lg text-xs text-stone-700 transition"
                  >
                    Hero 3/4
                  </button>
                  <button
                    onClick={() => setCameraPreset('front')}
                    className="px-2.5 py-1 bg-stone-100 border border-stone-200 hover:border-amber-400 rounded-lg text-xs text-stone-700 transition"
                  >
                    Front Label
                  </button>
                  <button
                    onClick={() => setCameraPreset('top')}
                    className="px-2.5 py-1 bg-stone-100 border border-stone-200 hover:border-amber-400 rounded-lg text-xs text-stone-700 transition"
                  >
                    Top Engraving
                  </button>
                  <button
                    onClick={() => setCameraPreset('close')}
                    className="px-2.5 py-1 bg-stone-100 border border-stone-200 hover:border-amber-400 rounded-lg text-xs text-stone-700 transition"
                  >
                    Close-Up
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
