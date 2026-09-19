# Footbridge Reality Demo V1 — Presentation Specification

## Purpose

Create a 45–70 second presentation-quality educational game sequence that demonstrates how a learner's correct mathematics answers progressively build a safe footbridge and then test it with a realistic human crossing.

This document defines the visual target. It is not a civil-engineering construction specification.

## Demo bridge geometry

- Crossing direction: left bank to right bank
- River runs perpendicular under the bridge
- Clear deck span: approximately 6.5 m
- Deck width: approximately 1.55 m
- Deck top: approximately 1.16 m above water/riverbed reference
- Five approach steps on each side
- Handrails on both sides
- Four structural support rows in the water for the presentation model
- Twelve visible deck planks for clear progressive construction

## Build sequence

### Stage 1 — Survey

Visuals:
- Survey markers appear on both banks.
- Camera moves slightly lower and closer to the river.
- A subtle measuring-line effect can run across the crossing.

Audio:
- Soft UI confirmation.
- Light survey/marker placement sound.

### Stage 2 — Foundations and pillars

Visuals:
- Pillars rise/are lowered into position in pairs.
- Water splash particles at contact.
- Small camera shake/impact only when a pillar seats.

Audio:
- Low construction impact.
- Water splash.

### Stage 3 — Structural beams

Visuals:
- Two long primary beams move into position.
- Optional crane/rope presentation animation.
- Beams settle onto supports with a short dust/impact effect.

Audio:
- Timber/structural placement sound.

### Stage 4 — Deck planks

Visuals:
- Planks install one after another from the near side toward the far side.
- Each plank should visibly lock into the bridge rather than simply appear.
- Camera follows the construction direction.

Audio:
- Wood placement/hammer cues kept light and child-friendly.

### Stage 5 — Rails and stairs

Visuals:
- Rail posts appear first, then horizontal rails.
- Both stair flights assemble from ground to deck.
- Final safety inspection glow/outline for less than one second.

Audio:
- Finishing/build complete cue.

### Stage 6 — Human crossing test

Sequence:
1. Learner is idle on the left bank.
2. Learner looks toward the completed bridge.
3. Learner walks toward the stairs.
4. Learner naturally shortens stride before the first step.
5. Learner climbs the stairs with feet planted on individual steps.
6. Learner transitions from climb to level walking.
7. Learner walks across the deck.
8. Halfway across, camera briefly reveals the moving river below.
9. Learner reaches the far stairs.
10. Learner descends naturally.
11. Learner walks several steps onto the right bank.
12. Learner turns partly toward camera and celebrates.

Critical animation quality:
- Use a rigged humanoid character.
- Use root-motion animation for locomotion wherever practical.
- Use Animation Rigging / Two Bone IK or equivalent foot-placement solution for the stairs.
- No sliding feet.
- No floating above the steps.
- No feet passing through geometry.
- No abrupt animation-state transitions.

## Camera shot plan

### Shot A — Establishing
Duration: 4–6 seconds
- Three-quarter aerial view.
- Shows both banks and the river.
- Bridge location centered.

### Shot B — Construction detail
Duration: stages 1–3
- Medium view at near-bank height.
- Camera gently dollies toward active construction.

### Shot C — Deck build
Duration: stage 4
- Elevated side angle.
- Camera follows planks as they install.

### Shot D — Finishing
Duration: stage 5
- Wider reveal.
- Small orbit to show rails and stairs aligned.

### Shot E — Human approach
- Behind-and-side follow camera.
- Framing must show both learner and first stair.

### Shot F — Crossing
- Smooth tracking camera on the outside of the bridge.
- Midway through, briefly reveal river below without disorienting the viewer.

### Shot G — Finish
- Camera moves ahead of learner as they descend.
- Learner exits onto bank.
- Camera rotates to a front three-quarter angle for celebration.

Use Cinemachine for camera blends and Timeline to choreograph the final presentation.

## Environment target

Required:
- Natural-looking moving water.
- Grass banks with subtle variation.
- Rocks near river edges, never blocking the bridge path.
- Trees placed away from the crossing line.
- Soft wind movement if asset permits.
- Bright daytime lighting suitable for children.
- Soft realistic shadows.
- Mild ambient occlusion.
- Reflection/highlight on water.
- Light mist only if it improves depth.

Avoid:
- Dark cinematic grading.
- Excess bloom.
- Overly saturated neon colours.
- Visual clutter on the walkway.
- Floating coins or reward objects inside the 3D crossing path.

## Learner character target

Presentation character should be:
- African school-age learner.
- Friendly and age-appropriate proportions.
- School or Mezzo-branded casual educational outfit.
- Fully humanoid-rigged.
- Facial expression at least neutral + happy/celebration.
- Optimized for web delivery.

Preferred animation sources:
- Mixamo for base idle/walk/celebrate.
- DeepMotion or Rokoko video mocap for the exact climb-cross-descend performance.

## Audio

Minimum audio layers:
- Continuous river ambience.
- Light outdoor ambience/birds.
- Different footsteps for grass, concrete stairs and wood deck.
- Construction placement effects.
- Short success cue at the final celebration.

Audio should support the educational sequence, not overpower narration or a live presenter.

## Performance target

Presentation laptop target:
- 60 fps preferred.
- 30 fps absolute minimum during the full sequence.

Web target:
- Keep first-load size reasonable by compressing textures and animation clips.
- Prefer 1K/2K textures for hero assets rather than unnecessary 4K maps.
- Use LODs for trees/environment if needed.
- Bake/static-light where appropriate and keep only essential real-time shadows.

## React integration contract

React sends:

```js
unityInstance.SendMessage(
  'ReactBridge',
  'BuildStageFromWeb',
  JSON.stringify({ stage: 1 })
);
```

Stage values:
- 0 reset
- 1 survey
- 2 foundations/pillars
- 3 beams
- 4 planks
- 5 rails/stairs
- 6 human test

Unity sends browser events:

```js
{
  source: 'mezzo-unity',
  payload: {
    type: 'stage-completed',
    stage: 4,
    message: 'Footbridge stage 4 completed.'
  }
}
```

## Acceptance criteria for the presentation version

The demo is approved only when:
- The bridge geometry is visually coherent from all presentation camera angles.
- Both stair flights meet the deck correctly.
- Construction is visibly staged and animated.
- The learner climbs each stair naturally.
- The learner walks across without sliding.
- The learner descends naturally.
- Camera transitions are smooth.
- Water and environment are visibly alive.
- Audio supports every major action.
- The complete sequence can be replayed reliably.
- A presenter can trigger each stage without touching Unity Editor.
