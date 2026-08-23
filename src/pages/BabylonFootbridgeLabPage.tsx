import { useEffect, useRef, useState } from 'react';
import {
  AbstractMesh,
  ArcRotateCamera,
  Color3,
  Color4,
  DirectionalLight,
  DynamicTexture,
  Engine,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  Scene,
  ShadowGenerator,
  StandardMaterial,
  Texture,
  TransformNode,
  Vector3,
} from '@babylonjs/core';

const steps = [
  { title: 'Survey', detail: 'Measure the river and mark safe crossing points.' },
  { title: 'Pillars', detail: 'Place strong pillars in the water.' },
  { title: 'Beams', detail: 'Connect the pillars with long beams.' },
  { title: 'Planks', detail: 'Lay the bridge deck one plank at a time.' },
  { title: 'Rails & stairs', detail: 'Add side rails and aligned entry stairs.' },
  { title: 'Sprite test', detail: 'Watch the learner climb, cross, descend, and celebrate.' },
];

type MeshGroupName = 'survey' | 'supports' | 'beams' | 'planks' | 'rails' | 'stairs' | 'human';
type SceneNode = AbstractMesh | TransformNode;
type SpriteState = 'idle' | 'walk' | 'climb' | 'descend' | 'celebrate';

type SpriteRig = {
  root: TransformNode;
  plane: Mesh;
  shadow: Mesh;
  texture: DynamicTexture;
  currentFrameKey: string;
};

type BabylonLabParts = {
  engine: Engine;
  scene: Scene;
  groups: Record<MeshGroupName, SceneNode[]>;
  sprite: SpriteRig;
  currentLevel: number;
  walkTime: number;
};

function createMaterial(scene: Scene, name: string, color: string) {
  const material = new StandardMaterial(name, scene);
  material.diffuseColor = Color3.FromHexString(color);
  material.specularColor = new Color3(0.06, 0.06, 0.06);
  return material;
}

function createAlphaMaterial(scene: Scene, name: string, color: string, alpha: number) {
  const material = createMaterial(scene, name, color);
  material.alpha = alpha;
  return material;
}

function setGroupEnabled(nodes: SceneNode[], isEnabled: boolean) {
  nodes.forEach((node) => node.setEnabled(isEnabled));
}

function addBox(
  scene: Scene,
  name: string,
  size: { width: number; height: number; depth: number },
  position: Vector3,
  material: StandardMaterial,
  shadowGenerator?: ShadowGenerator,
) {
  const box = MeshBuilder.CreateBox(name, size, scene);
  box.position = position;
  box.material = material;
  box.receiveShadows = true;
  if (shadowGenerator) shadowGenerator.addShadowCaster(box);
  return box;
}

function addCylinder(
  scene: Scene,
  name: string,
  height: number,
  diameterTop: number,
  diameterBottom: number,
  position: Vector3,
  material: StandardMaterial,
  shadowGenerator?: ShadowGenerator,
) {
  const cylinder = MeshBuilder.CreateCylinder(name, { height, diameterTop, diameterBottom, tessellation: 20 }, scene);
  cylinder.position = position;
  cylinder.material = material;
  cylinder.receiveShadows = true;
  if (shadowGenerator) shadowGenerator.addShadowCaster(cylinder);
  return cylinder;
}

function createTree(scene: Scene, x: number, z: number, scale: number, trunk: StandardMaterial, leaves: StandardMaterial, shadows: ShadowGenerator) {
  const treeRoot = new TransformNode(`tree-${x}-${z}`, scene);
  treeRoot.position = new Vector3(x, 0, z);

  const trunkMesh = addCylinder(scene, 'tree-trunk', 0.86 * scale, 0.13 * scale, 0.22 * scale, new Vector3(0, 0.43 * scale, 0), trunk, shadows);
  trunkMesh.parent = treeRoot;

  const leafPositions: Array<[number, number, number, number]> = [
    [0, 1.02, 0, 0.8],
    [-0.28, 0.88, 0.12, 0.58],
    [0.3, 0.92, -0.1, 0.62],
    [0.05, 1.25, 0, 0.56],
  ];

  leafPositions.forEach(([lx, ly, lz, diameter], index) => {
    const leaf = MeshBuilder.CreateSphere(`leaf-${index}`, { diameter: diameter * scale, segments: 16 }, scene);
    leaf.position = new Vector3(lx * scale, ly * scale, lz * scale);
    leaf.scaling = new Vector3(1.08, 0.76, 1.04);
    leaf.material = leaves;
    leaf.parent = treeRoot;
    shadows.addShadowCaster(leaf);
  });

  return treeRoot;
}

function footYForBridgePath(x: number) {
  const ground = 0.28;
  const deck = 1.19;

  if (x < -3.25) {
    const t = Math.min(1, Math.max(0, (x + 4.65) / 1.4));
    return ground + (deck - ground) * t;
  }

  if (x > 3.25) {
    const t = Math.min(1, Math.max(0, (x - 3.25) / 1.4));
    return deck + (ground - deck) * t;
  }

  return deck;
}

function spriteStateForX(x: number, t: number): SpriteState {
  if (t < 0.04) return 'idle';
  if (t > 0.94) return 'celebrate';
  if (x < -3.25) return 'climb';
  if (x > 3.25) return 'descend';
  return 'walk';
}

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
}

function drawSpriteFrame(sprite: SpriteRig, state: SpriteState, frame: number) {
  const frameKey = `${state}-${frame}`;
  if (sprite.currentFrameKey === frameKey) return;
  sprite.currentFrameKey = frameKey;

  const texture = sprite.texture;
  const ctx = texture.getContext();
  const width = texture.getSize().width;
  const height = texture.getSize().height;

  ctx.clearRect(0, 0, width, height);
  ctx.save();
  ctx.translate(width / 2, 10);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const step = Math.sin(frame * Math.PI * 0.5);
  const opposite = Math.cos(frame * Math.PI * 0.5);
  const isCelebrate = state === 'celebrate';
  const isClimb = state === 'climb';
  const isDescend = state === 'descend';
  const tilt = isClimb ? -0.12 : isDescend ? 0.1 : 0;

  ctx.rotate(tilt);

  ctx.fillStyle = 'rgba(15,23,42,0.18)';
  ctx.beginPath();
  ctx.ellipse(0, 112, 34, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#111827';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(-12, 76);
  ctx.lineTo(-18 + step * 7, 98);
  ctx.lineTo(-15 + step * 14, 112);
  ctx.moveTo(12, 76);
  ctx.lineTo(18 - step * 7, 98);
  ctx.lineTo(15 - step * 14, 112);
  ctx.stroke();

  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-16 + step * 14, 114);
  ctx.lineTo(-3 + step * 14, 114);
  ctx.moveTo(10 - step * 14, 114);
  ctx.lineTo(23 - step * 14, 114);
  ctx.stroke();

  ctx.fillStyle = '#2563eb';
  drawRoundedRect(ctx, -20, 40, 40, 42, 12);

  ctx.fillStyle = '#f97316';
  drawRoundedRect(ctx, -17, 46, 34, 12, 6);

  ctx.strokeStyle = '#d8a172';
  ctx.lineWidth = 8;
  ctx.beginPath();
  if (isCelebrate) {
    ctx.moveTo(-18, 48);
    ctx.lineTo(-38, 20 - Math.abs(opposite) * 6);
    ctx.moveTo(18, 48);
    ctx.lineTo(38, 20 - Math.abs(opposite) * 6);
  } else {
    ctx.moveTo(-18, 52);
    ctx.lineTo(-34 - opposite * 5, 72 + step * 6);
    ctx.moveTo(18, 52);
    ctx.lineTo(34 + opposite * 5, 72 - step * 6);
  }
  ctx.stroke();

  ctx.fillStyle = '#d8a172';
  ctx.beginPath();
  ctx.arc(0, 27, 17, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#1f2937';
  ctx.beginPath();
  ctx.ellipse(0, 18, 18, 10, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#111827';
  ctx.beginPath();
  ctx.arc(-6, 28, 2.2, 0, Math.PI * 2);
  ctx.arc(7, 28, 2.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#7c2d12';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  if (state === 'celebrate') {
    ctx.arc(1, 35, 7, 0.1, Math.PI - 0.1);
  } else {
    ctx.arc(1, 36, 5, 0.2, Math.PI - 0.2);
  }
  ctx.stroke();

  if (state === 'climb') {
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('UP', 22, 22);
  }

  if (state === 'descend') {
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('DOWN', -55, 22);
  }

  if (state === 'celebrate') {
    ctx.fillStyle = '#facc15';
    for (let index = 0; index < 6; index += 1) {
      const angle = (index / 6) * Math.PI * 2 + frame * 0.35;
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * 44, 34 + Math.sin(angle) * 22, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
  texture.update();
}

function createSpriteLearner(scene: Scene): SpriteRig {
  const root = new TransformNode('sprite-learner-root', scene);
  const plane = MeshBuilder.CreatePlane('sprite-learner-plane', { width: 0.86, height: 1.38 }, scene);
  plane.position = new Vector3(0, 0.72, 0);
  plane.billboardMode = Mesh.BILLBOARDMODE_Y;
  plane.parent = root;

  const texture = new DynamicTexture('generated-sprite-learner-texture', { width: 160, height: 140 }, scene, false, Texture.NEAREST_SAMPLINGMODE);
  texture.hasAlpha = true;

  const material = new StandardMaterial('sprite-learner-material', scene);
  material.diffuseTexture = texture;
  material.useAlphaFromDiffuseTexture = true;
  material.emissiveColor = new Color3(1, 1, 1);
  material.backFaceCulling = false;
  plane.material = material;

  const shadowMaterial = createAlphaMaterial(scene, 'sprite-shadow-material', '#020617', 0.22);
  const shadow = MeshBuilder.CreateDisc('sprite-ground-shadow', { radius: 0.32, tessellation: 28 }, scene);
  shadow.rotation.x = Math.PI / 2;
  shadow.position = new Vector3(0, 0.02, 0);
  shadow.scaling.z = 0.45;
  shadow.material = shadowMaterial;
  shadow.parent = root;

  const sprite = { root, plane, shadow, texture, currentFrameKey: '' };
  drawSpriteFrame(sprite, 'idle', 0);
  return sprite;
}

function createBabylonScene(canvas: HTMLCanvasElement): BabylonLabParts {
  const engine = new Engine(canvas, true, { antialias: true, preserveDrawingBuffer: true, stencil: true });
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.72, 0.9, 0.98, 1);
  scene.ambientColor = new Color3(0.55, 0.62, 0.7);
  scene.fogMode = Scene.FOGMODE_EXP2;
  scene.fogDensity = 0.012;
  scene.fogColor = new Color3(0.76, 0.9, 0.98);

  const camera = new ArcRotateCamera('camera', -Math.PI / 2.14, Math.PI / 3.05, 9.15, new Vector3(0, 1.05, 0), scene);
  camera.attachControl(canvas, true);
  camera.lowerRadiusLimit = 7.1;
  camera.upperRadiusLimit = 12.5;
  camera.lowerBetaLimit = Math.PI / 4.8;
  camera.upperBetaLimit = Math.PI / 2.18;
  camera.wheelPrecision = 44;

  const hemi = new HemisphericLight('soft-sky', new Vector3(0, 1, 0), scene);
  hemi.intensity = 0.8;
  hemi.groundColor = new Color3(0.23, 0.42, 0.24);

  const sun = new DirectionalLight('sun', new Vector3(-0.45, -0.86, 0.28), scene);
  sun.position = new Vector3(5.4, 9, -4.2);
  sun.intensity = 2.05;
  const shadows = new ShadowGenerator(1536, sun);
  shadows.useBlurExponentialShadowMap = true;
  shadows.blurKernel = 18;

  const grass = createMaterial(scene, 'main-grass', '#58a54a');
  const bankGrass = createMaterial(scene, 'raised-bank-grass', '#347a3b');
  const water = createAlphaMaterial(scene, 'river-water', '#149ed8', 0.78);
  const foam = createAlphaMaterial(scene, 'river-foam', '#e0f8ff', 0.62);
  const riverbed = createMaterial(scene, 'riverbed', '#7a5a35');
  const stone = createMaterial(scene, 'stone', '#9ca3af');
  const concrete = createMaterial(scene, 'concrete', '#b9b7ad');
  const wood = createMaterial(scene, 'warm-wood', '#b8752a');
  const darkWood = createMaterial(scene, 'dark-wood', '#734415');
  const rail = createMaterial(scene, 'rail-wood', '#6d3f18');
  const marker = createMaterial(scene, 'survey-marker', '#facc15');
  const leaves = createMaterial(scene, 'tree-leaves', '#1f8f4d');
  const cloud = createAlphaMaterial(scene, 'soft-cloud', '#f8fafc', 0.82);

  const groups: Record<MeshGroupName, SceneNode[]> = {
    survey: [],
    supports: [],
    beams: [],
    planks: [],
    rails: [],
    stairs: [],
    human: [],
  };

  const waterObjects: Mesh[] = [];
  const foamLines: Mesh[] = [];

  const ground = addBox(scene, 'wide-ground', { width: 12.6, height: 0.12, depth: 8.5 }, new Vector3(0, -0.08, 0), grass, shadows);
  ground.receiveShadows = true;

  addBox(scene, 'riverbed', { width: 3.18, height: 0.06, depth: 8.7 }, new Vector3(0, 0.005, 0), riverbed);
  const waterMain = addBox(scene, 'moving-river', { width: 3.0, height: 0.04, depth: 8.55 }, new Vector3(0, 0.06, 0), water);
  waterObjects.push(waterMain);

  for (let z = -4.05; z <= 4.05; z += 0.56) {
    const ripple = addBox(scene, 'river-ripple', { width: 2.62, height: 0.018, depth: 0.035 }, new Vector3(0, 0.102, z), z > -0.1 && z < 0.1 ? foam : water);
    ripple.rotation.y = z * 0.2;
    ripple.alphaIndex = 1;
    foamLines.push(ripple);
  }

  addBox(scene, 'left-raised-bank', { width: 3.72, height: 0.32, depth: 3.12 }, new Vector3(-4.15, 0.11, 0), bankGrass, shadows);
  addBox(scene, 'right-raised-bank', { width: 3.72, height: 0.32, depth: 3.12 }, new Vector3(4.15, 0.11, 0), bankGrass, shadows);
  addBox(scene, 'left-path', { width: 2.42, height: 0.05, depth: 0.9 }, new Vector3(-5.13, 0.29, 0), concrete);
  addBox(scene, 'right-path', { width: 2.42, height: 0.05, depth: 0.9 }, new Vector3(5.13, 0.29, 0), concrete);

  for (const [x, z] of [[-5.15, -2.6], [-5.2, 2.55], [5.2, -2.55], [5.15, 2.58]] as Array<[number, number]>) {
    createTree(scene, x, z, x < 0 ? 0.92 : 1.02, darkWood, leaves, shadows);
  }

  for (const [x, y, z, scale] of [[-4.2, 4.1, -2.2, 0.9], [0.9, 4.45, 2.5, 0.68], [4.6, 3.9, -1.5, 0.76]] as Array<[number, number, number, number]>) {
    const root = new TransformNode(`cloud-${x}-${z}`, scene);
    for (const offset of [-0.35, 0, 0.34]) {
      const cloudBlob = MeshBuilder.CreateSphere('cloud-blob', { diameter: scale * (offset === 0 ? 0.78 : 0.58), segments: 12 }, scene);
      cloudBlob.position = new Vector3(x + offset * scale, y + Math.abs(offset) * 0.06, z);
      cloudBlob.scaling.y = 0.5;
      cloudBlob.material = cloud;
      cloudBlob.parent = root;
    }
  }

  for (const x of [-5.6, -4.95, 4.95, 5.6]) {
    const pole = addCylinder(scene, 'survey-pole', 0.88, 0.035, 0.035, new Vector3(x, 0.73, x < 0 ? -0.72 : 0.72), marker, shadows);
    const flag = addBox(scene, 'survey-flag', { width: 0.28, height: 0.16, depth: 0.025 }, new Vector3(x + 0.13, 1.1, x < 0 ? -0.72 : 0.72), marker, shadows);
    groups.survey.push(pole, flag);
  }

  for (const x of [-2.35, -1.15, 0, 1.15, 2.35]) {
    for (const z of [-0.58, 0.58]) {
      groups.supports.push(addCylinder(scene, 'support-pillar', 1.16, 0.2, 0.26, new Vector3(x, 0.58, z), stone, shadows));
    }
  }

  for (const z of [-0.64, 0.64]) {
    groups.beams.push(addBox(scene, 'main-beam', { width: 6.74, height: 0.18, depth: 0.18 }, new Vector3(0, 1.05, z), darkWood, shadows));
  }

  for (let index = 0; index < 10; index += 1) {
    const x = -3.05 + index * 0.68;
    const plank = addBox(scene, 'deck-plank', { width: 0.58, height: 0.16, depth: 1.48 }, new Vector3(x, 1.19, 0), index % 2 ? darkWood : wood, shadows);
    plank.rotation.z = 0.012 * (index % 2 ? 1 : -1);
    groups.planks.push(plank);
  }

  for (const z of [-0.88, 0.88]) {
    groups.rails.push(addBox(scene, 'top-rail', { width: 6.5, height: 0.12, depth: 0.12 }, new Vector3(0, 1.78, z), rail, shadows));
    groups.rails.push(addBox(scene, 'lower-rail', { width: 6.2, height: 0.09, depth: 0.09 }, new Vector3(0, 1.48, z), rail, shadows));
    for (let index = 0; index < 7; index += 1) {
      groups.rails.push(addBox(scene, 'rail-post', { width: 0.1, height: 0.72, depth: 0.1 }, new Vector3(-3 + index, 1.42, z), rail, shadows));
    }
  }

  const stepTops = [0.35, 0.55, 0.75, 0.95, 1.15];
  stepTops.forEach((top, index) => {
    groups.stairs.push(addBox(scene, 'left-step', { width: 0.34, height: top, depth: 1.38 }, new Vector3(-4.62 + index * 0.34, top / 2, 0), concrete, shadows));
    groups.stairs.push(addBox(scene, 'right-step', { width: 0.34, height: top, depth: 1.38 }, new Vector3(4.62 - index * 0.34, top / 2, 0), concrete, shadows));
  });
  groups.stairs.push(addBox(scene, 'left-landing', { width: 0.55, height: 0.18, depth: 1.5 }, new Vector3(-3.03, 1.09, 0), concrete, shadows));
  groups.stairs.push(addBox(scene, 'right-landing', { width: 0.55, height: 0.18, depth: 1.5 }, new Vector3(3.03, 1.09, 0), concrete, shadows));

  const sprite = createSpriteLearner(scene);
  sprite.root.position = new Vector3(-4.85, footYForBridgePath(-4.85), 0);
  groups.human.push(sprite.root, sprite.plane, sprite.shadow);

  const optionalGroups: MeshGroupName[] = ['survey', 'supports', 'beams', 'planks', 'rails', 'stairs', 'human'];
  optionalGroups.forEach((group) => setGroupEnabled(groups[group], false));

  const parts: BabylonLabParts = { engine, scene, groups, sprite, currentLevel: 0, walkTime: 0 };

  scene.onBeforeRenderObservable.add(() => {
    const delta = engine.getDeltaTime() / 1000;
    const now = performance.now() * 0.001;

    waterObjects.forEach((waterMesh) => {
      waterMesh.position.z = Math.sin(now * 1.45) * 0.045;
    });

    foamLines.forEach((line, index) => {
      line.position.z += delta * (0.25 + (index % 3) * 0.03);
      if (line.position.z > 4.1) line.position.z = -4.1;
      line.position.x = Math.sin(now * 2.1 + index) * 0.035;
    });

    if (parts.currentLevel < 6) return;

    parts.walkTime += delta;
    const totalDuration = 12.2;
    const cycleTime = parts.walkTime % totalDuration;
    const t = cycleTime / totalDuration;
    const x = -4.85 + t * 9.7;
    const state = spriteStateForX(x, t);
    const footY = footYForBridgePath(x);
    const frame = Math.floor(parts.walkTime * (state === 'celebrate' ? 5 : 8)) % 4;
    const bob = state === 'celebrate' ? Math.abs(Math.sin(parts.walkTime * 7)) * 0.035 : Math.abs(Math.sin(parts.walkTime * 8.5)) * 0.045;

    sprite.root.position.x = x;
    sprite.root.position.y = footY + bob;
    sprite.root.position.z = 0;
    sprite.shadow.scaling.x = state === 'climb' || state === 'descend' ? 0.84 : 1;
    sprite.shadow.scaling.z = state === 'celebrate' ? 0.65 : 0.45;
    drawSpriteFrame(sprite, state, frame);
  });

  engine.runRenderLoop(() => scene.render());
  return parts;
}

function applyBuildLevel(parts: BabylonLabParts | null, level: number) {
  if (!parts) return;
  const wasTesting = parts.currentLevel >= 6;
  parts.currentLevel = level;

  setGroupEnabled(parts.groups.survey, level >= 1);
  setGroupEnabled(parts.groups.supports, level >= 2);
  setGroupEnabled(parts.groups.beams, level >= 3);
  setGroupEnabled(parts.groups.planks, level >= 4);
  setGroupEnabled(parts.groups.rails, level >= 5);
  setGroupEnabled(parts.groups.stairs, level >= 5);
  setGroupEnabled(parts.groups.human, level >= 6);

  if (level >= 6 && !wasTesting) {
    parts.walkTime = 0;
    parts.sprite.root.position = new Vector3(-4.85, footYForBridgePath(-4.85), 0);
    drawSpriteFrame(parts.sprite, 'idle', 0);
  }
}

export default function BabylonFootbridgeLabPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const partsRef = useRef<BabylonLabParts | null>(null);
  const [buildLevel, setBuildLevel] = useState(0);
  const progress = Math.round((buildLevel / steps.length) * 100);
  const activeStep = steps[Math.min(buildLevel, steps.length - 1)];

  useEffect(() => {
    if (!canvasRef.current || partsRef.current) return;
    const parts = createBabylonScene(canvasRef.current);
    partsRef.current = parts;
    applyBuildLevel(parts, buildLevel);

    const onResize = () => parts.engine.resize();
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      parts.scene.dispose();
      parts.engine.dispose();
      partsRef.current = null;
    };
  }, []);

  useEffect(() => {
    applyBuildLevel(partsRef.current, buildLevel);
  }, [buildLevel]);

  const buildNext = () => setBuildLevel((level) => Math.min(steps.length, level + 1));
  const reset = () => setBuildLevel(0);

  return (
    <main className="babylon-lab-page">
      <section className="babylon-lab-hero card">
        <div>
          <span className="eyebrow">Separate Babylon.js experiment</span>
          <h1>Babylon Footbridge Sprite Lab</h1>
          <p>
            A child-friendly game sprite now climbs the left stairs, walks across the bridge, descends the right stairs,
            and celebrates on the other bank after the bridge is complete.
          </p>
        </div>
        <div className="babylon-lab-badge">BABYLON SPRITE V1 · CLIMB · CROSS · DESCEND</div>
      </section>

      <section className="babylon-lab-board card">
        <aside className="babylon-control-panel">
          <div className="babylon-score-row">
            <span>🪙 {buildLevel * 20}</span>
            <span>⭐ {buildLevel >= 6 ? 3 : buildLevel >= 5 ? 1 : 0}</span>
            <span>⚡ {buildLevel * 12} XP</span>
          </div>

          <div className="babylon-progress-track" aria-label={`Build progress ${progress}%`}>
            <span style={{ width: `${progress}%` }} />
          </div>

          <h2>{buildLevel >= steps.length ? 'Sprite crossing test running' : activeStep.title}</h2>
          <p>{buildLevel >= steps.length ? 'The learner now follows the full path: climb, cross, descend, then celebrate.' : activeStep.detail}</p>

          <div className="babylon-button-row">
            <button className="btn btn-primary" onClick={buildNext} disabled={buildLevel >= steps.length}>
              Correct answer → Build
            </button>
            <button className="btn btn-secondary" onClick={reset}>Reset</button>
          </div>

          <div className="babylon-note-card">
            <strong>Game sprite test</strong>
            <span>The human is now a lightweight 2D game character placed inside the 3D bridge world.</span>
          </div>
        </aside>

        <div className="babylon-canvas-wrap">
          <div className="babylon-scene-label">BABYLON SPRITE V1 · GAME CHARACTER WALK TEST</div>
          <canvas ref={canvasRef} className="babylon-canvas" aria-label="Babylon.js sprite footbridge scene" />
        </div>

        <aside className="babylon-step-panel">
          <h3>Build order</h3>
          {steps.map((step, index) => (
            <div className={`babylon-step ${index < buildLevel ? 'done' : index === buildLevel ? 'current' : ''}`} key={step.title}>
              <span>{index + 1}</span>
              <div>
                <strong>{step.title}</strong>
                <small>{step.detail}</small>
              </div>
            </div>
          ))}
        </aside>
      </section>
    </main>
  );
}
