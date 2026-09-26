# Mezzo Reality Bridge — Unity 6 Presentation Demo

This folder is a standalone Unity project scaffold for the presentation-quality Footbridge Mission. It is intentionally isolated from the React production app.

## Target

- Unity 6 LTS / Editor 6000.0.x
- Universal Render Pipeline (URP 17)
- Cinemachine 3
- Timeline
- Animation Rigging
- Web build target for later React embedding

## Presentation goal

Create one polished vertical slice:

1. River and two banks are visible.
2. The bridge is built in six stages.
3. A properly rigged learner approaches the bridge.
4. The learner climbs the left stairs with correct foot placement.
5. The learner walks across the deck.
6. The learner descends the right stairs.
7. The learner celebrates.
8. Camera, sound, water, lighting and particles make the sequence feel like a small educational game.

## First open

1. Install Unity Hub and Unity 6 LTS.
2. Add the Web build support module for the editor version you install.
3. In Unity Hub choose **Add/Open project from disk**.
4. Select this folder: `unity/MezzoRealityBridge`.
5. Let Unity restore packages.
6. In Unity choose **Mezzo → Build Footbridge Demo Scaffold**.
7. Open `Assets/Scenes/FootbridgeMission.unity` if it is not already open.

The scaffold generator creates the scene hierarchy, banks, river, bridge stage roots, cameras, lighting, a temporary learner placeholder and the runtime controllers. Replace the temporary meshes with presentation-quality assets before the final presentation.

## Real asset slots

Put final assets in these locations:

- `Assets/Models/Bridge/`
- `Assets/Models/Character/`
- `Assets/Models/Environment/`
- `Assets/Animations/`
- `Assets/Audio/`
- `Assets/Materials/`
- `Assets/Textures/`
- `Assets/Effects/`

See `Docs/ASSET_CHECKLIST.md` for the exact deliverables.

## Build stages

The runtime stage controller uses these stage numbers:

- 0 — reset
- 1 — survey
- 2 — foundations and pillars
- 3 — structural beams
- 4 — deck planks
- 5 — rails and stairs
- 6 — human crossing test

## React integration later

The final web build is designed so the React app can call:

```js
unityInstance.SendMessage('ReactBridge', 'BuildStageFromWeb', JSON.stringify({ stage: 3 }));
```

Unity posts completion messages back to the webpage through `Assets/Plugins/WebGL/MezzoBridge.jslib`.

Do not merge this experiment into the production app until the Unity scene has been tested and approved.
