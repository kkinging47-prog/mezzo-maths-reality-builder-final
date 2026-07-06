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
  Node,
  Scene,
  ShadowGenerator,
  StandardMaterial,
  TransformNode,
  Vector3,
} from '@babylonjs/core';
import '@babylonjs/loaders';

const steps = [
  { title: 'Survey', detail: 'Measure the river and mark safe crossing points.' },
  { title: 'Pillars', detail: 'Place strong pillars in the water.' },
  { title: 'Beams', detail: 'Connect the pillars with long beams.' },
  { title: 'Planks', detail: 'Lay the bridge deck one plank at a time.' },
  { title: 'Rails & stairs', detail: 'Add side rails and aligned entry stairs.' },
  { title: 'Human test', detail: 'Watch the learner climb, cross, and descend.' },
];

type MeshGroupName = 'survey' | 'supports' | 'beams' | 'planks' | 'rails' | 'stairs' | 'human';
type SceneNode = AbstractMesh | TransformNode;

type BirdRig = {
  root: TransformNode;
  leftWing: Mesh;
  rightWing: Mesh;
  speed: number;
  baseZ: number;
  offset: number;
};

type BabylonLabParts = {
  engine: Engine;
  scene: Scene;
  groups: Record<MeshGroupName, SceneNode[]>;
  humanRoot: TransformNode;
  leftUpperLeg: Mesh;
  rightUpperLeg: Mesh;
  leftLowerLeg: Mesh;
  rightLowerLeg: Mesh;
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
  const cylinder = MeshBuilder.CreateCylinder(name, { height, diameterTop, diameterBottom, tessellation: 22 }, scene);
  cylinder.position = position;
  cylinder.material = material;
  cylinder.receiveShadows = true;
  if (shadowGenerator) shadowGenerator.addShadowCaster(cylinder);
  return cylinder;
}

function createCloud(scene: Scene, x: number, y: number, z: number, scale: number, material: StandardMaterial) {
  const root = new TransformNode(`cloud-${x}-${z}`, scene);
  const blobs = [
    [-0.4, 0, 0, 0.68],
    [0, 0.08, 0.03, 0.9],
    [0.52, 0.03, -0.02, 0.72],
    [0.92, -0.04, 0, 0.5],
  ];

  blobs.forEach(([bx, by, bz, diameter], index) => {
    const cloudPart = MeshBuilder.CreateSphere(`cloud-blob-${index}`, { diameter: diameter * scale, segments: 16 }, scene);
    cloudPart.position = new Vector3(x + bx * scale, y + by * scale, z + bz * scale);
    cloudPart.scaling.y = 0.55;
    cloudPart.material = material;
    cloudPart.parent = root;
  });

  return root;
}

function createBird(scene: Scene, x: number, y: number, z: number, scale: number, material: StandardMaterial, shadows: ShadowGenerator, speed: number, offset: number): BirdRig {
  const root = new TransformNode(`bird-${x}-${z}`, scene);
  root.position = new Vector3(x, y, z);
  root.rotation.y = Math.PI / 2;

  const body = MeshBuilder.CreateSphere('bird-body', { diameter: 0.12 * scale, segments: 10 }, scene);
  body.scaling = new Vector3(1.4, 0.75, 0.75);
  body.material = material;
  body.parent = root;
  shadows.addShadowCaster(body);

  const leftWing = addBox(scene, 'bird-left-wing', { width: 0.42 * scale, height: 0.025 * scale, depth: 0.08 * scale }, new Vector3(-0.22 * scale, 0.03 * scale, 0), material, shadows);
  const rightWing = addBox(scene, 'bird-right-wing', { width: 0.42 * scale, height: 0.025 * scale, depth: 0.08 * scale }, new Vector3(0.22 * scale, 0.03 * scale, 0), material, shadows);
  leftWing.parent = root;
  rightWing.parent = root;

  return { root, leftWing, rightWing, speed, baseZ: z, offset };
}

function createFruitTree(
  scene: Scene,
  x: number,
  z: number,
  scale: number,
  trunk: StandardMaterial,
  leafMaterials: StandardMaterial[],
  fruit: StandardMaterial,
  shadows: ShadowGenerator,
) {
  const treeRoot = new TransformNode(`fruit-tree-${x}-${z}`, scene);
  treeRoot.position = new Vector3(x, 0, z);

  const trunkMesh = addCylinder(scene, 'fruit-tree-trunk', 0.92 * scale, 0.13 * scale, 0.24 * scale, new Vector3(0, 0.46 * scale, 0), trunk, shadows);
  trunkMesh.parent = treeRoot;

  const leafPositions: Array<[number, number, number, number]> = [
    [0, 1.12, 0, 0.82],
    [-0.34, 0.98, 0.1, 0.62],
    [0.36, 1.02, -0.05, 0.66],
    [0.05, 1.42, 0.02, 0.58],
    [-0.05, 0.82, -0.16, 0.52],
  ];

  leafPositions.forEach(([lx, ly, lz, diameter], index) => {
    const leaf = MeshBuilder.CreateSphere(`leaf-cluster-${index}`, { diameter: diameter * scale, segments: 18 }, scene);
    leaf.position = new Vector3(lx * scale, ly * scale, lz * scale);
    leaf.scaling = new Vector3(1.1, 0.78, 1.05);
    leaf.material = leafMaterials[index % leafMaterials.length];
    leaf.parent = treeRoot;
    shadows.addShadowCaster(leaf);
  });

  const fruitPositions: Array<[number, number, number]> = [
    [-0.27, 1.08, 0.36],
    [0.22, 1.16, -0.38],
    [0.42, 0.92, 0.18],
    [-0.08, 1.38, -0.28],
    [-0.45, 0.86, -0.08],
  ];

  fruitPositions.forEach(([fx, fy, fz], index) => {
    const fruitMesh = MeshBuilder.CreateSphere(`tree-fruit-${index}`, { diameter: 0.13 * scale, segments: 12 }, scene);
    fruitMesh.position = new Vector3(fx * scale, fy * scale, fz * scale);
    fruitMesh.material = fruit;
    fruitMesh.parent = treeRoot;
    shadows.addShadowCaster(fruitMesh);
  });

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
  scene.fogDensity = 0.014;
  scene.fogColor = new Color3(0.76, 0.9, 0.98);

  const camera = new ArcRotateCamera('camera', -Math.PI / 2.2, Math.PI / 3.05, 9.5, new Vector3(0, 1.05, 0), scene);
  camera.attachControl(canvas, true);
  camera.lowerRadiusLimit = 7.2;
  camera.upperRadiusLimit = 12.5;
  camera.lowerBetaLimit = Math.PI / 4.7;
  camera.upperBetaLimit = Math.PI / 2.18;
  camera.wheelPrecision = 42;

  const hemi = new HemisphericLight('soft-sky', new Vector3(0, 1, 0), scene);
  hemi.intensity = 0.76;
  hemi.groundColor = new Color3(0.24, 0.45, 0.28);

  const sun = new DirectionalLight('sun', new Vector3(-0.45, -0.86, 0.28), scene);
  sun.position = new Vector3(5, 9, -4);
  sun.intensity = 2.15;
  const shadows = new ShadowGenerator(2048, sun);
  shadows.useBlurExponentialShadowMap = true;
  shadows.blurKernel = 20;

  const grass = createMaterial(scene, 'realistic-grass', '#58a54a');
  const darkGrass = createMaterial(scene, 'dark-grass', '#347a3b');
  const water = createMaterial(scene, 'water-blue', '#149ed8', 0.32);
  water.alpha = 0.78;
  const foam = createMaterial(scene, 'water-foam', '#d8f7ff', 0.25);
  foam.alpha = 0.58;
  const riverbed = createMaterial(scene, 'riverbed', '#7a5a35');
  const stone = createMaterial(scene, 'stone', '#9ca3af');
  const concrete = createMaterial(scene, 'concrete', '#b9b7ad');
  const wood = createMaterial(scene, 'warm-wood', '#b8752a');
  const darkWood = createMaterial(scene, 'dark-wood', '#734415');
  const rail = createMaterial(scene, 'rail-wood', '#6d3f18');
  const marker = createMaterial(scene, 'survey-marker', '#facc15');
  const cloudMaterial = createMaterial(scene, 'cloud-white', '#f8fafc', 0.7);
  cloudMaterial.alpha = 0.82;
  const birdMaterial = createMaterial(scene, 'bird-dark', '#111827');
  const leafOne = createMaterial(scene, 'leaf-one', '#1f8f4d');
  const leafTwo = createMaterial(scene, 'leaf-two', '#2faa5b');
  const leafThree = createMaterial(scene, 'leaf-three', '#197a3e');
  const fruit = createMaterial(scene, 'orange-fruit', '#f97316');
  const skin = createMaterial(scene, 'skin', '#d8a172');
  const shirt = createMaterial(scene, 'shirt', '#2563eb');
  const trouser = createMaterial(scene, 'trouser', '#111827');
  const shoe = createMaterial(scene, 'shoe', '#0f172a');
  const hair = createMaterial(scene, 'hair', '#1f2937');

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
  const clouds: TransformNode[] = [];
  const birds: BirdRig[] = [];
  const trees: TransformNode[] = [];

  const ground = addBox(scene, 'wide-ground', { width: 12.5, height: 0.12, depth: 8.5 }, new Vector3(0, -0.08, 0), grass, shadows);
  ground.receiveShadows = true;

  addBox(scene, 'riverbed', { width: 3.25, height: 0.06, depth: 8.7 }, new Vector3(0, 0.005, 0), riverbed);
  const waterMain = addBox(scene, 'moving-river', { width: 3.0, height: 0.04, depth: 8.55 }, new Vector3(0, 0.06, 0), water);
  waterMain.receiveShadows = true;
  waterObjects.push(waterMain);

  for (let z = -4.05; z <= 4.05; z += 0.48) {
    const ripple = addBox(scene, 'animated-river-ripple', { width: 2.55, height: 0.018, depth: 0.035 }, new Vector3(0, 0.102, z), z % 0.96 === 0 ? foam : water, undefined);
    ripple.rotation.y = z * 0.2;
    ripple.alphaIndex = 1;
    foamLines.push(ripple);
  }

  addBox(scene, 'left-raised-bank', { width: 3.7, height: 0.32, depth: 3.1 }, new Vector3(-4.15, 0.11, 0), darkGrass, shadows);
  addBox(scene, 'right-raised-bank', { width: 3.7, height: 0.32, depth: 3.1 }, new Vector3(4.15, 0.11, 0), darkGrass, shadows);
  addBox(scene, 'left-path', { width: 2.4, height: 0.045, depth: 0.9 }, new Vector3(-5.15, 0.29, 0), concrete);
  addBox(scene, 'right-path', { width: 2.4, height: 0.045, depth: 0.9 }, new Vector3(5.15, 0.29, 0), concrete);

  clouds.push(
    createCloud(scene, -4.7, 4.25, -2.4, 0.92, cloudMaterial),
    createCloud(scene, 0.6, 4.55, 2.7, 0.72, cloudMaterial),
    createCloud(scene, 4.5, 3.95, -1.6, 0.78, cloudMaterial),
  );

  birds.push(
    createBird(scene, -5.2, 3.65, -2.9, 1, birdMaterial, shadows, 1.1, 0),
    createBird(scene, -7.2, 3.25, 1.9, 0.82, birdMaterial, shadows, 0.85, 1.4),
    createBird(scene, 4.8, 3.45, 3.1, 0.76, birdMaterial, shadows, 0.95, 2.5),
  );

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

  trees.push(
    createFruitTree(scene, -5.2, -2.6, 0.95, darkWood, [leafOne, leafTwo, leafThree], fruit, shadows),
    createFruitTree(scene, 5.15, 2.55, 1.05, darkWood, [leafTwo, leafThree, leafOne], fruit, shadows),
    createFruitTree(scene, -5.1, 2.6, 0.72, darkWood, [leafThree, leafOne, leafTwo], fruit, shadows),
    createFruitTree(scene, 5.35, -2.45, 0.82, darkWood, [leafOne, leafThree, leafTwo], fruit, shadows),
  );

  const humanRoot = new TransformNode('human-root', scene);
  humanRoot.position = new Vector3(-4.8, 0.18, 0);
  humanRoot.rotation.y = Math.PI / 2;

  const body = MeshBuilder.CreateCapsule('human-body', { height: 0.68, radius: 0.18, tessellation: 18 }, scene);
  body.position = new Vector3(0, 0.78, 0);
  body.scaling = new Vector3(0.86, 1, 0.72);
  body.material = shirt;
  body.parent = humanRoot;
  shadows.addShadowCaster(body);

  const neck = addCylinder(scene, 'human-neck', 0.11, 0.08, 0.08, new Vector3(0, 1.13, 0), skin, shadows);
  neck.parent = humanRoot;
  const head = MeshBuilder.CreateSphere('human-head', { diameter: 0.29, segments: 20 }, scene);
  head.position = new Vector3(0, 1.28, 0);
  head.scaling = new Vector3(0.92, 1.05, 0.9);
  head.material = skin;
  shadows.addShadowCaster(head);
  head.parent = humanRoot;
  const hairCap = MeshBuilder.CreateSphere('human-hair', { diameter: 0.31, segments: 16 }, scene);
  hairCap.position = new Vector3(0, 1.41, -0.01);
  hairCap.scaling = new Vector3(1, 0.45, 0.95);
  hairCap.material = hair;
  shadows.addShadowCaster(hairCap);
  hairCap.parent = humanRoot;
  const nose = addBox(scene, 'human-nose', { width: 0.035, height: 0.05, depth: 0.07 }, new Vector3(0, 1.27, 0.15), skin, shadows);
  nose.parent = humanRoot;

  const leftUpperLeg = addCylinder(scene, 'left-upper-leg', 0.36, 0.075, 0.085, new Vector3(-0.09, 0.47, 0), trouser, shadows);
  const rightUpperLeg = addCylinder(scene, 'right-upper-leg', 0.36, 0.075, 0.085, new Vector3(0.09, 0.47, 0), trouser, shadows);
  const leftLowerLeg = addCylinder(scene, 'left-lower-leg', 0.36, 0.065, 0.075, new Vector3(-0.09, 0.19, 0), trouser, shadows);
  const rightLowerLeg = addCylinder(scene, 'right-lower-leg', 0.36, 0.065, 0.075, new Vector3(0.09, 0.19, 0), trouser, shadows);
  const leftShoe = addBox(scene, 'left-shoe', { width: 0.14, height: 0.07, depth: 0.25 }, new Vector3(-0.09, 0.04, 0.08), shoe, shadows);
  const rightShoe = addBox(scene, 'right-shoe', { width: 0.14, height: 0.07, depth: 0.25 }, new Vector3(0.09, 0.04, 0.08), shoe, shadows);
  [leftUpperLeg, rightUpperLeg, leftLowerLeg, rightLowerLeg, leftShoe, rightShoe].forEach((part) => {
    part.parent = humanRoot;
  });

  const leftArm = addCylinder(scene, 'left-arm', 0.5, 0.055, 0.065, new Vector3(-0.27, 0.78, 0), skin, shadows);
  const rightArm = addCylinder(scene, 'right-arm', 0.5, 0.055, 0.065, new Vector3(0.27, 0.78, 0), skin, shadows);
  leftArm.parent = humanRoot;
  rightArm.parent = humanRoot;
  const backpack = addBox(scene, 'human-backpack', { width: 0.27, height: 0.36, depth: 0.12 }, new Vector3(0, 0.8, -0.18), createMaterial(scene, 'backpack', '#f59e0b'), shadows);
  backpack.parent = humanRoot;
  const shadow = addBox(scene, 'human-soft-shadow', { width: 0.54, height: 0.012, depth: 0.32 }, new Vector3(0, 0.015, 0), createMaterial(scene, 'human-shadow', '#000000'));
  shadow.material!.alpha = 0.22;
  shadow.parent = humanRoot;

  groups.human.push(humanRoot, body, neck, head, hairCap, nose, leftUpperLeg, rightUpperLeg, leftLowerLeg, rightLowerLeg, leftShoe, rightShoe, leftArm, rightArm, backpack, shadow);
  setGroupEnabled(groups.human, false);

  const allOptionalGroups: MeshGroupName[] = ['survey', 'supports', 'beams', 'planks', 'rails', 'stairs', 'human'];
  allOptionalGroups.forEach((group) => setGroupEnabled(groups[group], false));

  let walkClock = 0;
  scene.onBeforeRenderObservable.add(() => {
    const delta = engine.getDeltaTime() / 1000;
    const time = performance.now() * 0.001;

    waterMain.position.z = Math.sin(time * 1.8) * 0.035;
    waterMain.scaling.x = 1 + Math.sin(time * 2.4) * 0.012;
    foamLines.forEach((line, index) => {
      line.position.z += delta * (0.55 + (index % 4) * 0.09);
      if (line.position.z > 4.25) line.position.z = -4.25;
      line.position.y = 0.105 + Math.sin(time * 2.5 + index) * 0.012;
      line.rotation.y = Math.sin(time + index) * 0.08;
    });

    clouds.forEach((cloud, index) => {
      cloud.position.x += delta * (0.08 + index * 0.025);
      cloud.position.y += Math.sin(time * 0.8 + index) * 0.0008;
      if (cloud.position.x > 3.6) cloud.position.x = -5.8;
    });

    birds.forEach((bird, index) => {
      bird.root.position.x += delta * bird.speed;
      bird.root.position.y += Math.sin(time * 2.1 + bird.offset) * 0.006;
      bird.root.position.z = bird.baseZ + Math.sin(time * 0.9 + index) * 0.35;
      if (bird.root.position.x > 6.5) bird.root.position.x = -6.8;
      const flap = Math.sin(time * 10 + bird.offset) * 0.75;
      bird.leftWing.rotation.z = flap;
      bird.rightWing.rotation.z = -flap;
    });

    trees.forEach((tree, index) => {
      tree.rotation.z = Math.sin(time * 1.35 + index) * 0.025;
      tree.rotation.x = Math.cos(time * 1.05 + index * 0.7) * 0.012;
    });

    if (!humanRoot.isEnabled()) return;
    walkClock += delta;
    const cycle = (walkClock % 12) / 12;
    const eased = cycle < 0.5 ? 2 * cycle * cycle : 1 - Math.pow(-2 * cycle + 2, 2) / 2;
    const x = -4.85 + eased * 9.7;
    const footY = footYForBridgePath(x);
    const walkPhase = walkClock * 8.5;
    const bob = Math.abs(Math.sin(walkPhase)) * 0.045;
    const onStairs = x < -3.25 || x > 3.25;
    humanRoot.position.x = x;
    humanRoot.position.y = footY + bob;
    humanRoot.position.z = 0;
    humanRoot.rotation.y = Math.PI / 2;
    humanRoot.rotation.z = onStairs ? (x < 0 ? -0.06 : 0.06) : 0;
    leftUpperLeg.rotation.z = Math.sin(walkPhase) * 0.44;
    rightUpperLeg.rotation.z = -Math.sin(walkPhase) * 0.44;
    leftLowerLeg.rotation.z = -Math.abs(Math.sin(walkPhase)) * 0.32;
    rightLowerLeg.rotation.z = -Math.abs(Math.sin(walkPhase + Math.PI)) * 0.32;
    leftArm.rotation.z = -Math.sin(walkPhase) * 0.52;
    rightArm.rotation.z = Math.sin(walkPhase) * 0.52;
    head.position.y = 1.28 + Math.sin(walkPhase * 0.5) * 0.015;
  });

  engine.runRenderLoop(() => scene.render());

  return { engine, scene, groups, humanRoot, leftUpperLeg, rightUpperLeg, leftLowerLeg, rightLowerLeg, leftArm, rightArm, head };
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
            This is the upgraded animated-reality prototype: flowing river, moving clouds, birds, swaying fruit trees,
            and an improved learner who climbs, crosses, and descends after the bridge is complete.
          </p>
        </div>
        <div className="babylon-lab-badge">BABYLON V2 · LIVING ENVIRONMENT</div>
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
            <strong>Real asset slots ready</strong>
            <span>Next upgrade: replace the prototype learner/tree shapes with licensed GLB models from Blender, Mixamo, Ready Player Me, or Sketchfab.</span>
          </div>
        </aside>

        <div className="babylon-canvas-wrap">
          <div className="babylon-scene-label">BABYLON V2 · FLOWING RIVER · CLOUDS · BIRDS · FRUIT TREES</div>
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
