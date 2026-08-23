# Babylon Footbridge Reality Assets

This folder is reserved for realistic GLB/GLTF assets used by the Babylon.js experiment.

Recommended file names:

```text
public/assets/babylon/human-walk-climb.glb
public/assets/babylon/fruit-tree.glb
public/assets/babylon/birds.glb
public/assets/babylon/footbridge-parts.glb
public/assets/babylon/river-rocks.glb
public/assets/babylon/clouds.glb
```

Best asset requirements:

1. Human model
   - Format: `.glb`
   - Low-poly or mobile optimized
   - Rigged humanoid skeleton
   - Animations needed: idle, walk, climb up stairs, walk across, climb down stairs
   - Source options: Blender export, Mixamo, Ready Player Me, licensed Sketchfab model

2. Trees
   - Fruit tree with leaves and visible fruits
   - Low-poly but natural looking
   - Separate leaves/fruit meshes are preferred so wind motion can be applied

3. Birds
   - Small flying bird with flapping animation, or simple GLB bird mesh

4. Bridge
   - Separate parts are best: pillars, beams, planks, railings, stairs
   - This allows the app to reveal the bridge step by step after correct answers

Important license note:
Only use models that are free for commercial/educational use or models created for Mezzo Maths. Keep attribution notes beside the file when needed.
