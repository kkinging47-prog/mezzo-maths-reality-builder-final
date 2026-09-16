using System.Collections.Generic;
using System.Linq;
using Mezzo.RealityBridge;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace Mezzo.EditorTools
{
    public static class PresentationFootbridgeBuilder
    {
        private const string ScenePath = "Assets/Scenes/FootbridgePresentation.unity";

        [MenuItem("Mezzo/Build Presentation Footbridge")]
        public static void BuildPresentation()
        {
            EnsureFolder("Assets/Scenes");
            Scene scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);

            GameObject world = new("WORLD_PRESENTATION");
            GameObject environment = NewChild(world, "Environment");
            GameObject bridgeRoot = NewChild(world, "Bridge");
            GameObject characterRoot = NewChild(world, "Character");
            GameObject systems = NewChild(world, "Systems");

            CreateEnvironment(environment.transform);

            GameObject surveyRoot = NewChild(bridgeRoot, "01_Survey");
            GameObject supportsRoot = NewChild(bridgeRoot, "02_FoundationsAndPillars");
            GameObject beamsRoot = NewChild(bridgeRoot, "03_Beams");
            GameObject deckRoot = NewChild(bridgeRoot, "04_DeckPlanks");
            GameObject railsRoot = NewChild(bridgeRoot, "05_RailsAndStairs");

            List<GameObject> survey = CreateSurvey(surveyRoot.transform);
            List<GameObject> supports = CreateSupports(supportsRoot.transform);
            List<GameObject> beams = CreateBeams(beamsRoot.transform);
            List<GameObject> planks = CreateDeck(deckRoot.transform);
            List<GameObject> rails = CreateRailsAndStairs(railsRoot.transform);

            GameObject learnerStart = new("LearnerStart");
            learnerStart.transform.SetParent(characterRoot.transform);
            learnerStart.transform.position = new Vector3(-7.0f, 0.35f, 0f);
            learnerStart.transform.rotation = Quaternion.Euler(0f, 90f, 0f);

            GameObject learner = CreateLearnerPlaceholder(characterRoot.transform);
            learner.transform.SetPositionAndRotation(learnerStart.transform.position, learnerStart.transform.rotation);

            BridgeStageController bridge = systems.AddComponent<BridgeStageController>();
            bridge.survey = Group("Survey", survey);
            bridge.foundationsAndPillars = Group("Foundations and Pillars", supports);
            bridge.beams = Group("Structural Beams", beams);
            bridge.deckPlanks = Group("Deck Planks", planks);
            bridge.railsAndStairs = Group("Rails and Stairs", rails);
            bridge.pieceDuration = 0.45f;
            bridge.delayBetweenPieces = 0.09f;
            bridge.riseDistance = 1.1f;

            CharacterMissionController character = systems.AddComponent<CharacterMissionController>();
            character.characterRoot = learner.transform;
            character.startPoint = learnerStart.transform;

            FootbridgeMissionDirector mission = systems.AddComponent<FootbridgeMissionDirector>();
            mission.bridge = bridge;
            mission.character = character;

            PresentationDemoController demo = systems.AddComponent<PresentationDemoController>();
            demo.mission = mission;
            demo.autoStart = false;
            demo.autoStageDelay = 2.5f;

            GameObject webBridge = new("ReactBridge");
            webBridge.transform.SetParent(systems.transform);
            ReactBridge reactBridge = webBridge.AddComponent<ReactBridge>();
            reactBridge.mission = mission;

            CreateLightingAndCamera(world.transform);

            EditorSceneManager.MarkSceneDirty(scene);
            EditorSceneManager.SaveScene(scene, ScenePath);
            Selection.activeGameObject = systems;

            Debug.Log("Presentation Footbridge created. Enter Play Mode: SPACE builds next stage, 1-6 jumps to a stage, R resets. Imported tree prefabs are auto-used when found under Assets/Tree_Packs.");
        }

        private static BridgeStageController.StageGroup Group(string label, List<GameObject> objects) => new()
        {
            label = label,
            objects = objects.ToArray()
        };

        private static void CreateEnvironment(Transform parent)
        {
            Material grass = Mat("Presentation_Grass", new Color(0.19f, 0.43f, 0.18f), 0.0f, 0.28f);
            Material earth = Mat("Presentation_Earth", new Color(0.28f, 0.17f, 0.09f), 0.0f, 0.18f);
            Material water = Mat("Presentation_Water", new Color(0.05f, 0.36f, 0.62f, 0.78f), 0.0f, 0.86f, true);
            Material path = Mat("Presentation_Path", new Color(0.45f, 0.42f, 0.36f), 0.0f, 0.24f);
            Material rock = Mat("Presentation_Rock", new Color(0.34f, 0.36f, 0.35f), 0.0f, 0.2f);

            Cube("GroundBase", new Vector3(0f, -0.38f, 0f), new Vector3(20f, 0.55f, 12f), earth, parent);
            Cube("LeftBank", new Vector3(-5.3f, 0.02f, 0f), new Vector3(7.4f, 0.35f, 10f), grass, parent);
            Cube("RightBank", new Vector3(5.3f, 0.02f, 0f), new Vector3(7.4f, 0.35f, 10f), grass, parent);
            Cube("RiverBed", new Vector3(0f, -0.27f, 0f), new Vector3(3.4f, 0.18f, 10.5f), earth, parent);
            Cube("RiverWater", new Vector3(0f, -0.08f, 0f), new Vector3(3.15f, 0.08f, 10.2f), water, parent);
            Cube("LeftApproach", new Vector3(-6.2f, 0.25f, 0f), new Vector3(2.8f, 0.08f, 1.2f), path, parent);
            Cube("RightApproach", new Vector3(6.2f, 0.25f, 0f), new Vector3(2.8f, 0.08f, 1.2f), path, parent);

            Vector3[] rocks =
            {
                new(-1.45f, 0.02f, -3.6f), new(1.35f, 0.0f, 3.0f), new(-1.2f, 0.01f, 2.7f),
                new(1.25f, 0.02f, -2.5f), new(-4.0f, 0.25f, 3.8f), new(4.3f, 0.22f, -3.7f)
            };
            for (int i = 0; i < rocks.Length; i++)
            {
                GameObject r = Sphere($"Rock_{i + 1:00}", rocks[i], 0.35f + 0.08f * (i % 3), rock, parent);
                r.transform.localScale = new Vector3(1.3f, 0.72f, 1f) * r.transform.localScale.x;
            }

            PlaceImportedTrees(parent);
        }

        private static void PlaceImportedTrees(Transform parent)
        {
            string[] searchFolders = AssetDatabase.IsValidFolder("Assets/Tree_Packs")
                ? new[] { "Assets/Tree_Packs" }
                : new[] { "Assets" };

            string[] guids = AssetDatabase.FindAssets("t:Prefab", searchFolders);
            List<GameObject> prefabs = guids
                .Select(AssetDatabase.GUIDToAssetPath)
                .Where(p => p.ToLowerInvariant().Contains("tree"))
                .Select(p => AssetDatabase.LoadAssetAtPath<GameObject>(p))
                .Where(p => p != null)
                .Take(6)
                .ToList();

            if (prefabs.Count == 0)
            {
                Debug.LogWarning("No imported tree prefabs found. The presentation scene will still build; add URP Tree Models and run this command again to auto-populate trees.");
                return;
            }

            Vector3[] positions =
            {
                new(-8.1f, 0.2f, -4.1f), new(-7.7f, 0.2f, 4.2f), new(-4.9f, 0.2f, -4.5f),
                new(8.1f, 0.2f, 4.0f), new(7.5f, 0.2f, -4.2f), new(4.9f, 0.2f, 4.6f),
                new(-8.8f, 0.2f, 0.9f), new(8.8f, 0.2f, -0.8f)
            };

            for (int i = 0; i < positions.Length; i++)
            {
                GameObject prefab = prefabs[i % prefabs.Count];
                GameObject instance = (GameObject)PrefabUtility.InstantiatePrefab(prefab);
                if (instance == null) continue;
                instance.name = $"PresentationTree_{i + 1:00}";
                instance.transform.SetParent(parent);
                instance.transform.position = positions[i];
                instance.transform.rotation = Quaternion.Euler(0f, (i * 47f) % 360f, 0f);
                float scale = 0.85f + 0.12f * (i % 3);
                instance.transform.localScale *= scale;
            }
        }

        private static List<GameObject> CreateSurvey(Transform parent)
        {
            Material yellow = Mat("SurveyYellow", new Color(1f, 0.72f, 0.02f), 0f, 0.3f);
            List<GameObject> items = new();
            foreach (float x in new[] { -3.7f, 3.7f })
            {
                foreach (float z in new[] { -0.95f, 0.95f })
                {
                    items.Add(Cylinder("SurveyMarker", new Vector3(x, 0.7f, z), new Vector3(0.06f, 0.65f, 0.06f), yellow, parent));
                }
            }
            return items;
        }

        private static List<GameObject> CreateSupports(Transform parent)
        {
            Material concrete = Mat("Concrete", new Color(0.46f, 0.48f, 0.48f), 0f, 0.2f);
            List<GameObject> items = new();
            foreach (float x in new[] { -2.45f, -0.8f, 0.8f, 2.45f })
            {
                foreach (float z in new[] { -0.62f, 0.62f })
                {
                    items.Add(Cylinder("Pillar", new Vector3(x, 0.48f, z), new Vector3(0.28f, 0.62f, 0.28f), concrete, parent));
                }
            }
            return items;
        }

        private static List<GameObject> CreateBeams(Transform parent)
        {
            Material timber = Mat("DarkTimber", new Color(0.22f, 0.085f, 0.025f), 0f, 0.24f);
            return new List<GameObject>
            {
                Cube("MainBeam_L", new Vector3(0f, 1.02f, -0.64f), new Vector3(6.9f, 0.23f, 0.2f), timber, parent),
                Cube("MainBeam_R", new Vector3(0f, 1.02f, 0.64f), new Vector3(6.9f, 0.23f, 0.2f), timber, parent),
                Cube("CrossBeam_A", new Vector3(-2.2f, 0.98f, 0f), new Vector3(0.22f, 0.18f, 1.58f), timber, parent),
                Cube("CrossBeam_B", new Vector3(0f, 0.98f, 0f), new Vector3(0.22f, 0.18f, 1.58f), timber, parent),
                Cube("CrossBeam_C", new Vector3(2.2f, 0.98f, 0f), new Vector3(0.22f, 0.18f, 1.58f), timber, parent)
            };
        }

        private static List<GameObject> CreateDeck(Transform parent)
        {
            Material wood = Mat("DeckWood", new Color(0.49f, 0.24f, 0.055f), 0f, 0.3f);
            List<GameObject> items = new();
            for (int i = 0; i < 16; i++)
            {
                float x = -3.25f + i * 0.435f;
                GameObject plank = Cube($"Plank_{i + 1:00}", new Vector3(x, 1.18f, 0f), new Vector3(0.39f, 0.15f, 1.58f), wood, parent);
                plank.transform.rotation = Quaternion.Euler(0f, 0f, (i % 2 == 0 ? 0.35f : -0.35f));
                items.Add(plank);
            }
            return items;
        }

        private static List<GameObject> CreateRailsAndStairs(Transform parent)
        {
            Material rail = Mat("RailWood", new Color(0.20f, 0.07f, 0.018f), 0f, 0.22f);
            Material step = Mat("StepConcrete", new Color(0.52f, 0.52f, 0.49f), 0f, 0.18f);
            List<GameObject> items = new();

            foreach (float z in new[] { -0.9f, 0.9f })
            {
                items.Add(Cube("TopRail", new Vector3(0f, 1.86f, z), new Vector3(6.65f, 0.11f, 0.11f), rail, parent));
                items.Add(Cube("MidRail", new Vector3(0f, 1.52f, z), new Vector3(6.4f, 0.08f, 0.08f), rail, parent));
                for (int i = 0; i < 8; i++)
                {
                    float x = -3.15f + i * 0.9f;
                    items.Add(Cube("RailPost", new Vector3(x, 1.5f, z), new Vector3(0.11f, 0.75f, 0.11f), rail, parent));
                }
            }

            for (int i = 0; i < 6; i++)
            {
                float top = 0.34f + i * 0.145f;
                float leftX = -4.82f + i * 0.29f;
                float rightX = 4.82f - i * 0.29f;
                items.Add(Cube($"LeftStep_{i + 1}", new Vector3(leftX, top / 2f, 0f), new Vector3(0.31f, top, 1.5f), step, parent));
                items.Add(Cube($"RightStep_{i + 1}", new Vector3(rightX, top / 2f, 0f), new Vector3(0.31f, top, 1.5f), step, parent));
            }
            return items;
        }

        private static GameObject CreateLearnerPlaceholder(Transform parent)
        {
            GameObject root = new("Learner_PLACEHOLDER_REPLACE_WITH_RIGGED_CHARACTER");
            root.transform.SetParent(parent);
            Material uniform = Mat("UniformBlue", new Color(0.04f, 0.24f, 0.62f), 0f, 0.26f);
            Material skin = Mat("Skin", new Color(0.34f, 0.17f, 0.09f), 0f, 0.3f);
            Cylinder("Body", new Vector3(0f, 0.92f, 0f), new Vector3(0.29f, 0.43f, 0.29f), uniform, root.transform);
            Sphere("Head", new Vector3(0f, 1.5f, 0f), 0.22f, skin, root.transform);
            return root;
        }

        private static void CreateLightingAndCamera(Transform parent)
        {
            RenderSettings.ambientMode = UnityEngine.Rendering.AmbientMode.Trilight;
            RenderSettings.ambientSkyColor = new Color(0.53f, 0.68f, 0.82f);
            RenderSettings.ambientEquatorColor = new Color(0.42f, 0.47f, 0.38f);
            RenderSettings.ambientGroundColor = new Color(0.18f, 0.16f, 0.12f);
            RenderSettings.fog = true;
            RenderSettings.fogColor = new Color(0.66f, 0.78f, 0.86f);
            RenderSettings.fogMode = FogMode.ExponentialSquared;
            RenderSettings.fogDensity = 0.008f;

            GameObject sunObj = new("Sun");
            sunObj.transform.SetParent(parent);
            sunObj.transform.rotation = Quaternion.Euler(45f, -35f, 0f);
            Light sun = sunObj.AddComponent<Light>();
            sun.type = LightType.Directional;
            sun.intensity = 1.35f;
            sun.color = new Color(1f, 0.93f, 0.82f);
            sun.shadows = LightShadows.Soft;

            GameObject camObj = new("PresentationCamera");
            camObj.transform.SetParent(parent);
            camObj.transform.position = new Vector3(-8.9f, 4.8f, -8.4f);
            camObj.transform.LookAt(new Vector3(0f, 1.0f, 0f));
            Camera cam = camObj.AddComponent<Camera>();
            cam.fieldOfView = 43f;
            camObj.tag = "MainCamera";
        }

        private static Material Mat(string name, Color color, float metallic, float smoothness, bool transparent = false)
        {
            Shader shader = Shader.Find("Universal Render Pipeline/Lit");
            if (shader == null) shader = Shader.Find("Standard");
            Material material = new(shader) { name = name, color = color };
            if (material.HasProperty("_Metallic")) material.SetFloat("_Metallic", metallic);
            if (material.HasProperty("_Smoothness")) material.SetFloat("_Smoothness", smoothness);
            if (transparent && material.HasProperty("_Surface"))
            {
                material.SetFloat("_Surface", 1f);
                material.SetOverrideTag("RenderType", "Transparent");
                material.renderQueue = 3000;
            }
            return material;
        }

        private static GameObject NewChild(GameObject parent, string name)
        {
            GameObject child = new(name);
            child.transform.SetParent(parent.transform);
            return child;
        }

        private static GameObject Cube(string name, Vector3 position, Vector3 scale, Material material, Transform parent)
        {
            GameObject go = GameObject.CreatePrimitive(PrimitiveType.Cube);
            go.name = name;
            go.transform.SetParent(parent);
            go.transform.position = position;
            go.transform.localScale = scale;
            go.GetComponent<Renderer>().sharedMaterial = material;
            return go;
        }

        private static GameObject Cylinder(string name, Vector3 position, Vector3 scale, Material material, Transform parent)
        {
            GameObject go = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            go.name = name;
            go.transform.SetParent(parent);
            go.transform.position = position;
            go.transform.localScale = scale;
            go.GetComponent<Renderer>().sharedMaterial = material;
            return go;
        }

        private static GameObject Sphere(string name, Vector3 position, float radius, Material material, Transform parent)
        {
            GameObject go = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            go.name = name;
            go.transform.SetParent(parent);
            go.transform.position = position;
            go.transform.localScale = Vector3.one * radius * 2f;
            go.GetComponent<Renderer>().sharedMaterial = material;
            return go;
        }

        private static void EnsureFolder(string path)
        {
            string[] parts = path.Split('/');
            string current = parts[0];
            for (int i = 1; i < parts.Length; i++)
            {
                string next = $"{current}/{parts[i]}";
                if (!AssetDatabase.IsValidFolder(next)) AssetDatabase.CreateFolder(current, parts[i]);
                current = next;
            }
        }
    }
}
