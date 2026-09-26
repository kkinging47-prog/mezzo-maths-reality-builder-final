# Asset Checklist — Footbridge Reality Demo V1

The Unity scaffold can run with placeholders, but the presentation-quality version requires proper assets. Use this checklist before the final build.

## 1. Bridge model

Preferred format: FBX or GLB imported into Unity and converted to prefabs.

The bridge should be split into separate selectable objects:

- `Bridge_SurveyMarkers`
- `Bridge_Pillar_01...`
- `Bridge_Beam_Left`
- `Bridge_Beam_Right`
- `Bridge_Plank_01...`
- `Bridge_Rail_Posts_Left`
- `Bridge_Rail_Posts_Right`
- `Bridge_Rail_Top_Left`
- `Bridge_Rail_Top_Right`
- `Bridge_Stairs_Left`
- `Bridge_Stairs_Right`

Quality requirements:

- Correct scale in metres.
- Clean pivots.
- No overlapping stairs/deck.
- PBR materials.
- Wood albedo, normal and roughness maps.
- Concrete/stone texture for supports and stairs.
- Reasonable polygon count for a web build.

## 2. Learner character

Required:

- African school-age learner.
- Humanoid skeleton.
- Unity Humanoid Avatar compatible.
- Separate skinned mesh and rig.
- Natural proportions.
- School-friendly outfit.
- Optimized textures.

Preferred file name:

`Assets/Models/Character/MezzoLearner.fbx`

## 3. Character animations

Required clips:

- `Idle`
- `LookAtBridge`
- `WalkForward`
- `ApproachStairs`
- `ClimbStairs`
- `WalkBridge`
- `DescendStairs`
- `TurnToCamera`
- `Celebrate`

For the final crossing, prefer one motion-captured performance for approach → climb → cross → descend, then use Timeline to cut/blend camera shots around it.

Preferred sources:

- Mixamo: base idle/walk/celebrate.
- DeepMotion or Rokoko: exact stair-crossing performance from a recorded video.

## 4. Environment

Minimum:

- River/water material or water prefab.
- Grass/ground material.
- 4–8 optimized trees.
- Rocks.
- Riverbank plants/grass clumps.
- Skybox or procedural sky.
- Optional birds.

All environment objects must stay clear of the bridge route.

## 5. VFX

Required:

- Water splash when pillars are placed.
- Small dust/impact burst when beams seat.
- Light success particles on completion.

Avoid large arcade effects that reduce realism.

## 6. Audio

Required files:

- `River_Loop.wav`
- `Outdoor_Ambience.wav`
- `Footstep_Grass_01.wav`
- `Footstep_Concrete_01.wav`
- `Footstep_Wood_01.wav`
- `Pillar_Splash.wav`
- `Beam_Set.wav`
- `Plank_Set.wav`
- `Success_Sting.wav`

## 7. Timeline assets

Create:

- `Assets/Timelines/FootbridgeConstruction.playable`
- `Assets/Timelines/HumanCrossing.playable`

Human crossing Timeline should coordinate:

- Character animation.
- Root motion.
- Foot IK/Animation Rigging weights.
- Cinemachine camera blends.
- Footstep audio.
- River reveal shot.
- Celebration.

## 8. Camera assets

Create Cinemachine cameras for:

- Establishing wide.
- Construction close.
- Deck tracking.
- Approach follow.
- Bridge side tracking.
- Descend/front camera.
- Celebration camera.

## 9. Web optimization

Before a Web build:

- Compress textures.
- Remove unused animations.
- Reduce animation keyframes only after visual approval.
- Enable mesh compression where safe.
- Avoid unnecessary 4K textures.
- Check Web build memory use.
- Test on the exact presentation laptop and browser.

## Approval rule

Do not call the demo presentation-ready while any of these are still placeholders:

- Learner character.
- Crossing animation.
- Bridge geometry.
- Camera sequence.
- Water/environment.
- Sound.
