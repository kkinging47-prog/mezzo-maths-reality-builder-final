using System.Collections.Generic;
using Mezzo.RealityBridge;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace Mezzo.EditorTools
{
    public static class FootbridgeSceneBuilder
    {
        private const string ScenePath = "Assets/Scenes/FootbridgeMission.unity";

        [MenuItem("Mezzo/Build Footbridge Demo Scaffold")]
        public static void BuildScene()
        {
            EnsureFolder("Assets/Scenes");
            EnsureFolder("Assets/Models");
            EnsureFolder("Assets/Models/Bridge");
            EnsureFolder("Assets/Models/Character");
            EnsureFolder("Assets/Models/Environment");
            EnsureFolder("Assets/Animations");
            EnsureFolder("Assets/Audio");
            EnsureFolder("Assets/Materials");
            EnsureFolder("Assets/Textures");
            EnsureFolder("Assets/Effects");

            Scene scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);

            GameObject world = new("WORLD");
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
            List<GameObject> railsAndStairs = CreateRailsAndStairs(railsRoot.transform);

            GameObject learnerStart = new("LearnerStart");
            learnerStart.transform.SetParent(characterRoot.transform);
            learnerStart.transform.position = new Vector3(-6.0f, 0.32f, 0f);
            learnerStart.transform.rotation = Quaternion.Euler(0f, 90f, 0f);

            GameObject learnerPlaceholder = CreateLearnerPlaceholder(characterRoot.transform);
            learnerPlaceholder.transform.position = learnerStart.transform.position;
            learnerPlaceholder.transform.rotation = learnerStart.transform.rotation;

            BridgeStageController bridge = systems.AddComponent<BridgeStageController>();
            bridge.survey = Group("Survey", survey);
            bridge.foundationsAndPillars = Group("Foundations and Pillars", supports);
            bridge.beams = Group("Structural Beams", beams);
            bridge.deckPlanks = Group("Deck Planks", planks);
            bridge.railsAndStairs = Group("Rails and Stairs", railsAndStairs);

            CharacterMissionController character = systems.AddComponent<CharacterMissionController>();
            character.characterRoot = learnerPlaceholder.transform;
            character.startPoint = learnerStart.transform;

            FootbridgeMissionDirector mission = systems.AddComponent<FootbridgeMissionDirector>();
            mission.bridge = bridge;
            mission.character = character;

            GameObject webBridgeObject = new("ReactBridge");
            webBridgeObject.transform.SetParent(systems.transform);
            ReactBridge reactBridge = webBridgeObject.AddComponent<ReactBridge>();
            reactBridge.mission = mission;

            CreateLightingAndCamera(world.transform);

            EditorSceneManager.MarkSceneDirty(scene);
            EditorSceneManager.SaveScene(scene, ScenePath);
            Selection.activeGameObject = systems;

            Debug.Log("Mezzo Footbridge scaffold created. Replace placeholder bridge and learner assets, then add the final Timeline and animations.");
        }

        private static BridgeStageController.StageGroup Group(string label, List<GameObject> objects)
        {
            return new BridgeStageController.StageGroup
            {
                label = label,
                objects = objects.ToArray()
            };
        }

        private static void CreateEnvironment(Transform parent)
        {
            Material grass = Material("Scaffold_Grass", new Color(0.18f, 0.48f, 0.22f));
            Material water = Material("Scaffold_Water", new Color(0.05f, 0.45f, 0.72f));
            Material concrete = Material("Scaffold_Concrete", new Color(0.55f, 0.55f, 0.52f));

            Cube("LeftBank", new Vector3(-4.8f, 0.05f, 0f), new Vector3(6.4f, 0.3f, 8f), grass, parent);
            Cube("RightBank", new Vector3(4.8f, 0.05f, 0f), new Vector3(6.4f, 0.3f, 8f), grass, parent);
            Cube("River", new Vector3(0f, -0.06f, 0f), new Vector3(3.2f, 0.12f, 8f), water, parent);
            Cube("LeftApproach", new Vector3(-5.2f, 0.23f, 0f), new Vector3(2.2f, 0.12f, 1.35f), concrete, parent);
            Cube("RightApproach", new Vector3(5.2f, 0.23f, 0f), new Vector3(2.2f, 0.12f, 1.35f), concrete, parent);
        }

        private static List<GameObject> CreateSurvey(Transform parent)
        {
            Material yellow = Material("Scaffold_Survey", new Color(1f, 0.78f, 0.05f));
            List<GameObject> items = new();
            foreach (float x in new[] { -3.5f, 3.5f })
            {
                foreach (float z in new[] { -0.95f, 0.95f })
                {
                    items.Add(Cylinder("SurveyMarker", new Vector3(x, 0.55f, z), new Vector3(0.07f, 0.55f, 0.07f), yellow, parent));
                }
            }
            return items;
        }

        private static List<GameObject> CreateSupports(Transform parent)
        {
            Material stone = Material("Scaffold_Stone", new Color(0.47f, 0.49f, 0.5f));
            List<GameObject> items = new();
            foreach (float x in new[] { -2.25f, -0.75f, 0.75f, 2.25f })
            {
                foreach (float z in new[] { -0.62f, 0.62f })
                {
                    items.Add(Cylinder("Pillar", new Vector3(x, 0.52f, z), new Vector3(0.28f, 0.62f, 0.28f), stone, parent));
                }
            }
            return items;
        }

        private static List<GameObject> CreateBeams(Transform parent)
        {
            Material darkWood = Material("Scaffold_DarkWood", new Color(0.26f, 0.11f, 0.035f));
            return new List<GameObject>
            {
                Cube("Beam_Left", new Vector3(0f, 1.02f, -0.62f), new Vector3(6.7f, 0.2f, 0.18f), darkWood, parent),
                Cube("Beam_Right", new Vector3(0f, 1.02f, 0.62f), new Vector3(6.7f, 0.2f, 0.18f), darkWood, parent)
            };
        }

        private static List<GameObject> CreateDeck(Transform parent)
        {
            Material wood = Material("Scaffold_Wood", new Color(0.56f, 0.3f, 0.08f));
            List<GameObject> items = new();
            for (int i = 0; i < 12; i++)
            {
                float x = -3.05f + i * 0.555f;
                items.Add(Cube($"Plank_{i + 1:00}", new Vector3(x, 1.16f, 0f), new Vector3(0.5f, 0.16f, 1.55f), wood, parent));
            }
            return items;
        }

        private static List<GameObject> CreateRailsAndStairs(Transform parent)
        {
            Material rail = Material("Scaffold_Rail", new Color(0.32f, 0.13f, 0.035f));
            Material concrete = Material("Scaffold_Step", new Color(0.57f, 0.56f, 0.52f));
            List<GameObject> items = new();

            foreach (float z in new[] { -0.88f, 0.88f })
            {
                items.Add(Cube("TopRail", new Vector3(0f, 1.8f, z), new Vector3(6.45f, 0.11f, 0.11f), rail, parent));
                for (int i = 0; i < 7; i++)
                {
                    float x = -3f + i;
                    items.Add(Cube("RailPost", new Vector3(x, 1.48f, z), new Vector3(0.1f, 0.7f, 0.1f), rail, parent));
                }
            }

            for (int i = 0; i < 5; i++)
            {
                float top = 0.36f + i * 0.2f;
                float leftX = -4.65f + i * 0.34f;
                float rightX = 4.65f - i * 0.34f;
                items.Add(Cube($"LeftStep_{i + 1}", new Vector3(leftX, top / 2f, 0f), new Vector3(0.36f, top, 1.5f), concrete, parent));
                items.Add(Cube($"RightStep_{i + 1}", new Vector3(rightX, top / 2f, 0f), new Vector3(0.36f, top, 1.5f), concrete, parent));
            }

            return items;
        }

        private static GameObject CreateLearnerPlaceholder(Transform parent)
        {
            GameObject root = new("Learner_PLACEHOLDER_REPLACE_ME");
            root.transform.SetParent(parent);
            Material uniform = Material("Scaffold_Uniform", new Color(0.06f, 0.3f, 0.72f));
            Material skin = Material("Scaffold_Skin", new Color(0.34f, 0.16f, 0.08f));

            GameObject body = Cylinder("Body", new Vector3(0f, 0.9f, 0f), new Vector3(0.28f, 0.42f, 0.28f), uniform, root.transform);
            GameObject head = Sphere("Head", new Vector3(0f, 1.48f, 0f), 0.22f, skin, root.transform);
            body.name = "Body_PLACEHOLDER";
            head.name = "Head_PLACEHOLDER";
            return root;
        }

        private static void CreateLightingAndCamera(Transform parent)
        {
            GameObject sunObject = new("Sun");
            sunObject.transform.SetParent(parent);
            sunObject.transform.rotation = Quaternion.Euler(48f, -32f, 0f);
            Light sun = sunObject.AddComponent<Light>();
            sun.type = LightType.Directional;
            sun.intensity = 1.25f;
            sun.shadows = LightShadows.Soft;

            GameObject cameraObject = new("PresentationCamera");
            cameraObject.transform.SetParent(parent);
            cameraObject.transform.position = new Vector3(-7.6f, 4.6f, -7.4f);
            cameraObject.transform.LookAt(new Vector3(0f, 1f, 0f));
            Camera camera = cameraObject.AddComponent<Camera>();
            camera.fieldOfView = 46f;
            cameraObject.tag = "MainCamera";
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

        private static Material Material(string name, Color color)
        {
            Material material = new(Shader.Find("Universal Render Pipeline/Lit"));
            material.name = name;
            material.color = color;
            return material;
        }

        private static void EnsureFolder(string path)
        {
            string[] pieces = path.Split('/');
            string current = pieces[0];

            for (int i = 1; i < pieces.Length; i++)
            {
                string next = $"{current}/{pieces[i]}";
                if (!AssetDatabase.IsValidFolder(next))
                {
                    AssetDatabase.CreateFolder(current, pieces[i]);
                }
                current = next;
            }
        }
    }
}
