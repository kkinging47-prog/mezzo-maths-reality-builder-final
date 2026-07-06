import { useEffect, useRef, useState } from 'react';
import {
  AbstractMesh,
  ArcRotateCamera,
  Color3,
  Color4,
  DirectionalLight,
  Engine,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  Scene,
  ShadowGenerator,
  StandardMaterial,
  TransformNode,
  Vector3,
} from '@babylonjs/core';

const steps = [
  { title: 'Survey', detail: 'Measure the river and mark safe crossing points.' },
  { title: 'Pillars', detail: 'Place strong pillars in the water.' },
  { title: 'Beams', detail: 'Connect the pillars with long beams.' },
  { title: 'Planks', detail: 'Lay the bridge deck one plank at a time.' },
  { title: 'Rails & stairs', detail: 'Add side rails and aligned entry stairs.' },
  { title: 'Human test', detail: 'Watch the learner climb, cross, and descend.' },
];

type MeshGroupName = 'survey' | 'supports' | 'beams' | 'planks' | 'rails' | 'stairs' | 'human';

type BabylonLabParts = {
  engine: Engine;
  scene: Scene;
  groups: Record<MeshGroupName, AbstractMesh[]>;
  humanRoot: TransformNode;
  leftLeg: Mesh;
  rightLeg: Mesh;
  leftArm: Mesh;
  rightArm: Mesh;
  head: Mesh;
};

function createMaterial(scene: Scene, name: string, color: string, rough = 0.85) {
  const material = new StandardMaterial(name, scene);
  material.diffuseColor = Color3.FromHexString(color);
  material.specularColor = new Color3(0.08, 0.08, 0.08);
  material.roughness = rough;
  return material;
}

function setGroupEnabled(meshes: AbstractMesh[], isEnabled: boolean) {
  meshes.forEach((mesh) => mesh.setEnabled(isEnabled));
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
  const cylinder = MeshBuilder.CreateCylinder(name, { height, diameterTop, diameterBottom, tessellation: 18 }, scene);
  cylinder.position = position;
  cylinder.material = material;
  cylinder.receiveShadows = true;
  if (shadowGenerator) shadowGenerator.addShadowCaster(cylinder);
  return cylinder;
}

function createTree(scene: Scene, x: number, z: number, scale: number, trunk: StandardMaterial, leaves: StandardMaterial, shadows: ShadowGenerator) {
  const treeRoot = new TransformNode(`tree-${x}-${z}`, scene);
  const trunkMesh = addCylinder(scene, 'trunk', 0.8 * scale, 0.16 * scale, 0.22 * scale, new Vector3(x, 0.45 * scale, z), trunk, shadows);
  const leafOne = MeshBuilder.CreateSphere('leaf-cluster', { diameter: 0.85 * scale, segments: 16 }, scene);
  leafOne.position = new Vector3(x, 0.95 * scale, z);
  leafOne.scaling = new Vector3(1.1, 0.85, 1.05);
  leafOne.material = leaves;
  shadows.addShadowCaster(leafOne);
  const leafTwo = MeshBuilder.CreateSphere('leaf-top', { diameter: 0.62 * scale, segments: 16 }, scene);
  leafTwo.position = new Vector3(x + 0.12 * scale, 1.28 * scale, z - 0.08 * scale);
  leafTwo.scaling = new Vector3(1, 0.9, 1);
  leafTwo.material = leaves;
  shadows.addShadowCaster(leafTwo);
  trunkMesh.parent = treeRoot;
  leafOne.parent = treeRoot;
  leafTwo.parent = treeRoot;
  return treeRoot;
}

function footYForBridgePath(x: number) {
  const ground = 0.1;
  const deck = 1.16;
  if (x < -3.25) {
    const t = Math.min(1, Math.max(0, (x + 4.75) / 1.5));
    return ground + (deck - ground) * t;
  }
  if (x > 3.25) {
    const t = Math.min(1, Math.max(0, (x - 3.25) / 1.5));
    return deck + (ground - deck) * t;
  }
  return deck;
}

function createBabylonScene(canvas: HTMLCanvasElement): BabylonLabParts {
  const engine = new Engine(canvas, true, { antialias: true, preserveDrawingBuffer: true, stencil: true });
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.7, 0.88, 0.98, 1);
  scene.ambientColor = new Color3(0.52, 0.62, 0.72);
  scene.fogMode = Scene.FOGMODE_EXP2;
  scene.fogDensity = 0.018;
  scene.fogColor = new Color3(0.76, 0.9, 0.98);

  const camera = new ArcRotateCamera('camera', -Math.PI / 2.25, Math.PI / 3.1, 10.2, new Vector3(0, 0.95, 0), scene);
  camera.attachControl(canvas, true);
  camera.lowerRadiusLimit = 7.5;
  camera.upperRadiusLimit = 13;
  camera.lowerBetaLimit = Math.PI / 4.5;
  camera.upperBetaLimit = Math.PI / 2.2;
  camera.wheelPrecision = 42;

  const hemi = new HemisphericLight('soft-sky', new Vector3(0, 1, 0), scene);
  hemi.intensity = 0.72;
  hemi.groundColor = new Color3(0.25, 0.45, 0.25);

  const sun = new DirectionalLight('sun', new Vector3(-0.45, -0.86, 0.28), scene);
  sun.position = new Vector3(5, 9, -4);
  sun.intensity = 2.1;
  const shadows = new ShadowGenerator(2048, sun);
  shadows.useBlurExponentialShadowMap = true;
  shadows.blurKernel = 20;

  const grass = createMaterial(scene, 'realistic-grass', '#58a54a');
  const darkGrass = createMaterial(scene, 'dark-grass', '#347a3b');
  const water = createMaterial(scene, 'water-blue', '#1ca3dd', 0.35);
  water.alpha = 0.82;
  const riverbed = createMaterial(scene, 'riverbed', '#7a5a35');
  const stone = createMaterial(scene, 'stone', '#9ca3af');
  const concrete = createMaterial(scene, 'concrete', '#b9b7ad');
  const wood = createMaterial(scene, 'warm-wood', '#b8752a');
  const darkWood = createMaterial(scene, 'dark-wood', '#734415');
  const rail = createMaterial(scene, 'rail-wood', '#6d3f18');
  const marker = createMaterial(scene, 'survey-marker', '#facc15');
  const skin = createMaterial(scene, 'skin', '#d8a172');
  const shirt = createMaterial(scene, 'shirt', '#2563eb');
  const trouser = createMaterial(scene, 'trouser', '#111827');
  const shoe = createMaterial(scene, 'shoe', '#0f172a');
  const hair = createMaterial(scene, 'hair', '#1f2937');

  const groups: Record<MeshGroupName, AbstractMesh[]> = {
    survey: [],
    supports: [],
    beams: [],
    planks: [],
    rails: [],
    stairs: [],
    human: [],
  };

  const ground = addBox(scene, 'wide-ground', { width: 12.5, height: 0.12, depth: 8.5 }, new Vector3(0, -0.08, 0), grass, shadows);
  ground.receiveShadows = true;

  addBox(scene, 'riverbed', { width: 3.25, height: 0.06, depth: 8.7 }, new Vector3(0, 0.005, 0), riverbed);
  const waterMain = addBox(scene, 'moving-river', { width: 3.0, height: 0.04, depth: 8.55 }, new Vector3(0, 0.06, 0), water);
  waterMain.receiveShadows = true;

  for (let z = -3.6; z <= 3.6; z += 0.9) {
    const ripple = addBox(scene, 'river-ripple', { width: 2.65, height: 0.018, depth: 0.035 }, new Vector3(0, 0.095, z), water);
    ripple.rotation.y = z * 0.18;
    ripple.alphaIndex = 1;
  }

  addBox(scene, 'left-raised-bank', { width: 3.7, height: 0.32, depth: 3.1 }, new Vector3(-4.15, 0.11, 0), darkGrass, shadows);
  addBox(scene, 'right-raised-bank', { width: 3.7, height: 0.32, depth: 3.1 }, new Vector3(4.15, 0.11, 0), darkGrass, shadows);
  addBox(scene, 'left-path', { width: 2.4, height: 0.045, depth: 0.9 }, new Vector3(-5.15, 0.29, 0), concrete);
  addBox(scene, 'right-path', { width: 2.4, height: 0.045, depth: 0.9 }, new Vector3(5.15, 0.29, 0), concrete);

  for (const x of [-5.7, -5.15, -4.55, 4.55, 5.15, 5.7]) {
    const surveyPole = addCylinder(scene, 'survey-pole', 0.9, 0.035, 0.035, new Vector3(x, 0.72, x < 0 ? -0.82 : 0.82), marker, shadows);
    const flag = addBox(scene, 'survey-flag', { width: 0.28, height: 0.16, depth: 0.025 }, new Vector3(x + 0.14, 1.12, x < 0 ? -0.82 : 0.82), marker, shadows);
    groups.survey.push(surveyPole, flag);
  }

  for (const x of [-2.35, -1.15, 0, 1.15, 2.35]) {
    for (const z of [-0.58, 0.58]) {
      const pillar = addCylinder(scene, 'support-pillar', 1.16, 0.2, 0.26, new Vector3(x, 0.58, z), stone, shadows);
      groups.supports.push(pillar);
    }
  }

  for (const z of [-0.64, 0.64]) {
    const beam = addBox(scene, 'long-support-beam', { width: 6.7, height: 0.18, depth: 0.18 }, new Vector3(0, 1.05, z), darkWood, shadows);
    groups.beams.push(beam);
  }

  for (let index = 0; index < 10; index += 1) {
    const x = -3.05 + index * 0.68;
    const plank = addBox(scene, 'deck-plank', { width: 0.58, height: 0.16, depth: 1.48 }, new Vector3(x, 1.18, 0), index % 2 ? darkWood : wood, shadows);
    plank.rotation.z = 0.015 * (index % 2 ? 1 : -1);
    groups.planks.push(plank);
  }

  for (const z of [-0.88, 0.88]) {
    const topRail = addBox(scene, 'top-rail', { width: 6.5, height: 0.12, depth: 0.12 }, new Vector3(0, 1.78, z), rail, shadows);
    const lowerRail = addBox(scene, 'lower-rail', { width: 6.2, height: 0.09, depth: 0.09 }, new Vector3(0, 1.48, z), rail, shadows);
    groups.rails.push(topRail, lowerRail);
    for (let index = 0; index < 7; index += 1) {
      const x = -3 + index * 1.0;
      const post = addBox(scene, 'rail-post', { width: 0.1, height: 0.72, depth: 0.1 }, new Vector3(x, 1.42, z), rail, shadows);
      groups.rails.push(post);
    }
  }

  const stepTops = [0.34, 0.54, 0.74, 0.94, 1.14];
  stepTops.forEach((top, index) => {
    const leftX = -4.62 + index * 0.34;
    const rightX = 4.62 - index * 0.34;
    const leftStep = addBox(scene, 'left-real-step', { width: 0.34, height: top, depth: 1.38 }, new Vector3(leftX, top / 2, 0), concrete, shadows);
    const rightStep = addBox(scene, 'right-real-step', { width: 0.34, height: top, depth: 1.38 }, new Vector3(rightX, top / 2, 0), concrete, shadows);
    groups.stairs.push(leftStep, rightStep);
  });
  const leftLanding = addBox(scene, 'left-landing', { width: 0.55, height: 0.18, depth: 1.5 }, new Vector3(-3.03, 1.08, 0), concrete, shadows);
  const rightLanding = addBox(scene, 'right-landing', { width: 0.55, height: 0.18, depth: 1.5 }, new Vector3(3.03, 1.08, 0), concrete, shadows);
  groups.stairs.push(leftLanding, rightLanding);

  const rockPositions: Array<[number, number, number, number]> = [
    [-1.9, -2.8, 0.32, 0.2],
    [1.85, -2.4, 0.28, 0.22],
    [-1.75, 2.6, 0.24, 0.18],
    [1.9, 2.9, 0.3, 0.2],
    [-0.55, 3.25, 0.18, 0.15],
    [0.62, -3.22, 0.2, 0.15],
  ];
  rockPositions.forEach(([x, z, width, height], i) => {
    const rock = MeshBuilder.CreateSphere(`river-rock-${i}`, { diameter: 1, segments: 12 }, scene);
    rock.position = new Vector3(x, 0.14, z);
    rock.scaling = new Vector3(width, height, width * 0.72);
    rock.material = stone;
    shadows.addShadowCaster(rock);
  });

  createTree(scene, -5.2, -2.6, 0.95, darkWood, createMaterial(scene, 'leaf-one', '#1f8f4d'), shadows);
  createTree(scene, 5.15, 2.55, 1.05, darkWood, createMaterial(scene, 'leaf-two', '#257c47'), shadows);
  createTree(scene, -5.1, 2.6, 0.72, darkWood, createMaterial(scene, 'leaf-three', '#2faa5b'), shadows);
  createTree(scene, 5.35, -2.45, 0.82, darkWood, createMaterial(scene, 'leaf-four', '#208246'), shadows);

  const humanRoot = new TransformNode('human-root', scene);
  humanRoot.position = new Vector3(-4.8, 0.18, 0);
  humanRoot.rotation.y = Math.PI / 2;

  const body = addCylinder(scene, 'human-body', 0.58, 0.24, 0.28, new Vector3(0, 0.76, 0), shirt, shadows);
  body.parent = humanRoot;
  const head = MeshBuilder.CreateSphere('human-head', { diameter: 0.28, segments: 18 }, scene);
  head.position = new Vector3(0, 1.22, 0);
  head.material = skin;
  shadows.addShadowCaster(head);
  head.parent = humanRoot;
  const hairCap = MeshBuilder.CreateSphere('human-hair', { diameter: 0.3, segments: 14 }, scene);
  hairCap.position = new Vector3(0, 1.34, -0.01);
  hairCap.scaling = new Vector3(1, 0.42, 0.95);
  hairCap.material = hair;
  shadows.addShadowCaster(hairCap);
  hairCap.parent = humanRoot;
  const leftLeg = addCylinder(scene, 'left-leg', 0.48, 0.08, 0.09, new Vector3(-0.08, 0.34, 0), trouser, shadows);
  const rightLeg = addCylinder(scene, 'right-leg', 0.48, 0.08, 0.09, new Vector3(0.08, 0.34, 0), trouser, shadows);
  leftLeg.parent = humanRoot;
  rightLeg.parent = humanRoot;
  const leftShoe = addBox(scene, 'left-shoe', { width: 0.14, height: 0.07, depth: 0.24 }, new Vector3(-0.08, 0.08, 0.08), shoe, shadows);
  const rightShoe = addBox(scene, 'right-shoe', { width: 0.14, height: 0.07, depth: 0.24 }, new Vector3(0.08, 0.08, 0.08), shoe, shadows);
  leftShoe.parent = humanRoot;
  rightShoe.parent = humanRoot;
  const leftArm = addCylinder(scene, 'left-arm', 0.46, 0.055, 0.065, new Vector3(-0.27, 0.78, 0), skin, shadows);
  const rightArm = addCylinder(scene, 'right-arm', 0.46, 0.055, 0.065, new Vector3(0.27, 0.78, 0), skin, shadows);
  leftArm.parent = humanRoot;
  rightArm.parent = humanRoot;
  const shadow = addBox(scene, 'human-soft-shadow', { width: 0.5, height: 0.012, depth: 0.3 }, new Vector3(0, 0.02, 0), createMaterial(scene, 'human-shadow', '#000000'));
  shadow.material!.alpha = 0.2;
  shadow.parent = humanRoot;

  groups.human.push(humanRoot, body, head, hairCap, leftLeg, rightLeg, leftShoe, rightShoe, leftArm, rightArm, shadow);
  setGroupEnabled(groups.human, false);

  const allOptionalGroups: MeshGroupName[] = ['survey', 'supports', 'beams', 'planks', 'rails', 'stairs', 'human'];
  allOptionalGroups.forEach((group) => setGroupEnabled(groups[group], false));

  let walkClock = 0;
  scene.onBeforeRenderObservable.add(() => {
    const delta = engine.getDeltaTime() / 1000;

    waterMain.position.z = Math.sin(performance.now() * 0.0014) * 0.045;

    if (!humanRoot.isEnabled()) return;
    walkClock += delta;
    const cycle = (walkClock % 10.5) / 10.5;
    const eased = cycle < 0.5 ? 2 * cycle * cycle : 1 - Math.pow(-2 * cycle + 2, 2) / 2;
    const x = -4.85 + eased * 9.7;
    const footY = footYForBridgePath(x);
    const walkPhase = walkClock * 8.5;
    const bob = Math.abs(Math.sin(walkPhase)) * 0.055;
    humanRoot.position.x = x;
    humanRoot.position.y = footY + bob;
    humanRoot.position.z = 0;
    humanRoot.rotation.y = Math.PI / 2;
    leftLeg.rotation.z = Math.sin(walkPhase) * 0.42;
    rightLeg.rotation.z = -Math.sin(walkPhase) * 0.42;
    leftArm.rotation.z = -Math.sin(walkPhase) * 0.5;
    rightArm.rotation.z = Math.sin(walkPhase) * 0.5;
    head.position.y = 1.22 + Math.sin(walkPhase * 0.5) * 0.018;
  });

  engine.runRenderLoop(() => scene.render());

  return { engine, scene, groups, humanRoot, leftLeg, rightLeg, leftArm, rightArm, head };
}

function applyBuildLevel(parts: BabylonLabParts | null, level: number) {
  if (!parts) return;
  setGroupEnabled(parts.groups.survey, level >= 1);
  setGroupEnabled(parts.groups.supports, level >= 2);
  setGroupEnabled(parts.groups.beams, level >= 3);
  setGroupEnabled(parts.groups.planks, level >= 4);
  setGroupEnabled(parts.groups.rails, level >= 5);
  setGroupEnabled(parts.groups.stairs, level >= 5);
  setGroupEnabled(parts.groups.human, level >= 6);

  if (level >= 6) {
    parts.humanRoot.position = new Vector3(-4.85, 0.18, 0);
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
          <h1>Babylon Footbridge Reality Lab</h1>
          <p>
            This is a new safe test branch for a more realistic bridge mission: aligned stairs, river crossing, real build order,
            and a human who climbs, walks across, and descends after the bridge is complete.
          </p>
        </div>
        <div className="babylon-lab-badge">BABYLON V1 · REAL CROSSING TEST</div>
      </section>

      <section className="babylon-lab-board card">
        <aside className="babylon-control-panel">
          <div className="babylon-score-row">
            <span>🪙 {buildLevel * 20}</span>
            <span>⭐ {buildLevel >= 6 ? 3 : buildLevel >= 5 ? 1 : 0}</span>
            <span>⚡ {buildLevel * 12} XP</span>
          </div>

          <div className="babylon-progress-track">
            <span style={{ width: `${progress}%` }} />
          </div>

          <h2>{buildLevel >= steps.length ? 'Bridge ready for real-life test' : activeStep.title}</h2>
          <p>{buildLevel >= steps.length ? 'Watch the learner climb up, cross safely, and descend to the other bank.' : activeStep.detail}</p>

          <div className="babylon-button-row">
            <button className="btn btn-primary" onClick={buildNext} disabled={buildLevel >= steps.length}>
              Correct answer → Build
            </button>
            <button className="btn btn-secondary" onClick={reset}>Reset</button>
          </div>

          <div className="babylon-note-card">
            <strong>Reality goal</strong>
            <span>The scene must teach the child that every correct answer physically improves the bridge.</span>
          </div>
        </aside>

        <div className="babylon-canvas-wrap">
          <div className="babylon-scene-label">BABYLON V1 · STAIRS · BRIDGE · HUMAN WALK TEST</div>
          <canvas ref={canvasRef} className="babylon-canvas" aria-label="Babylon.js footbridge scene" />
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
