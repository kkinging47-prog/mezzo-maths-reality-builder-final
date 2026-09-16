using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Mezzo.RealityBridge;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.SceneManagement;

namespace Mezzo.EditorTools
{
    public static class PresentationVisualPolish
    {
        private const string TextureFolder = "Assets/Textures/PresentationGenerated";
        private const string MaterialFolder = "Assets/Materials/PresentationGenerated";
        private const string LearnerMaterialFolder = "Assets/Materials/LearnerGenerated";
        private const string CharacterFolder = "Assets/Models/Character";

        [MenuItem("Mezzo/Apply Visual Realism Polish")]
        public static void Apply()
        {
            if (EditorApplication.isPlaying)
            {
                Debug.LogWarning("Stop Play Mode before applying visual polish.");
                return;
            }

            EnsureFolder(TextureFolder);
            EnsureFolder(MaterialFolder);
            EnsureFolder(LearnerMaterialFolder);

            Texture2D woodTex = EnsureTexture("wood.png", GenerateWood);
            Texture2D grassTex = EnsureTexture("grass.png", GenerateGrass);
            Texture2D earthTex = EnsureTexture("earth.png", GenerateEarth);
            Texture2D concreteTex = EnsureTexture("concrete.png", GenerateConcrete);
            Texture2D waterTex = EnsureTexture("water.png", GenerateWater);

            Material wood = EnsureMaterial("Timber.mat", woodTex, new Color(0.52f, 0.24f, 0.07f), 0f, 0.28f, new Vector2(3.5f, 1.2f));
            Material concrete = EnsureMaterial("Concrete.mat", concreteTex, new Color(0.55f, 0.56f, 0.54f), 0f, 0.18f, new Vector2(2f, 2f));
            Material grass = EnsureMaterial("Grass.mat", grassTex, new Color(0.30f, 0.55f, 0.22f), 0f, 0.12f, new Vector2(6f, 6f));
            Material earth = EnsureMaterial("Earth.mat", earthTex, new Color(0.30f, 0.18f, 0.09f), 0f, 0.12f, new Vector2(5f, 5f));
            Material water = EnsureMaterial("Water.mat", waterTex, new Color(0.16f, 0.52f, 0.73f, 0.72f), 0f, 0.82f, new Vector2(4f, 5f), true);

            GameObject world = GameObject.Find("WORLD_PRESENTATION");
            if (world == null)
            {
                Debug.LogError("WORLD_PRESENTATION was not found. Open FootbridgePresentation first.");
                return;
            }

            foreach (Renderer r in world.GetComponentsInChildren<Renderer>(true))
            {
                string n = r.gameObject.name.ToLowerInvariant();
                if (n.Contains("plank") || n.Contains("beam") || n.Contains("rail") || n.Contains("post")) Assign(r, wood);
                else if (n.Contains("pillar") || n.Contains("step")) Assign(r, concrete);
                else if (n.Contains("leftbank") || n.Contains("rightbank")) Assign(r, grass);
                else if (n.Contains("groundbase") || n.Contains("riverbed")) Assign(r, earth);
                else if (n.Contains("riverwater"))
                {
                    Assign(r, water);
                    if (r.GetComponent<WaterSurfaceMotion>() == null) r.gameObject.AddComponent<WaterSurfaceMotion>();
                }

                r.shadowCastingMode = ShadowCastingMode.On;
                r.receiveShadows = true;
            }

            PolishLearner();
            PolishLightingAndCamera();
            AddBridgeDetails(world.transform);

            EditorSceneManager.MarkSceneDirty(SceneManager.GetActiveScene());
            EditorSceneManager.SaveScene(SceneManager.GetActiveScene());
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();

            Debug.Log("Visual realism polish applied: textured bridge/terrain/water, learner materials repaired where possible, stronger lighting, and added bridge hardware details.");
        }

        private static void PolishLearner()
        {
            GameObject learner = GameObject.Find("MezzoLearner");
            if (learner == null) return;

            List<Texture2D> colorTextures = AssetDatabase.FindAssets("t:Texture2D", new[] { CharacterFolder })
                .Select(AssetDatabase.GUIDToAssetPath)
                .Select(AssetDatabase.LoadAssetAtPath<Texture2D>)
                .Where(t => t != null && !IsUtilityTexture(t.name))
                .ToList();

            Texture2D singleAtlas = colorTextures.Count == 1 ? colorTextures[0] : null;
            Shader shader = Shader.Find("Universal Render Pipeline/Lit") ?? Shader.Find("Standard");

            foreach (Renderer renderer in learner.GetComponentsInChildren<Renderer>(true))
            {
                Material[] source = renderer.sharedMaterials;
                Material[] result = new Material[source.Length];

                for (int i = 0; i < source.Length; i++)
                {
                    Material old = source[i];
                    string label = Sanitize((old != null ? old.name : renderer.name) + "_" + i);
                    string path = $"{LearnerMaterialFolder}/{label}.mat";
                    Material mat = AssetDatabase.LoadAssetAtPath<Material>(path);
                    if (mat == null)
                    {
                        mat = new Material(shader);
                        AssetDatabase.CreateAsset(mat, path);
                    }
                    else mat.shader = shader;

                    Texture tex = old != null ? old.mainTexture : null;
                    if (tex == null) tex = FindBestTexture(colorTextures, old != null ? old.name : renderer.name) ?? singleAtlas;

                    Color fallback = old != null ? old.color : Color.white;
                    if (tex == null && IsAlmostWhiteOrGrey(fallback)) fallback = GuessFallbackColor((old != null ? old.name : "") + " " + renderer.name);

                    if (mat.HasProperty("_BaseMap")) mat.SetTexture("_BaseMap", tex);
                    else mat.mainTexture = tex;
                    if (mat.HasProperty("_BaseColor")) mat.SetColor("_BaseColor", fallback);
                    else mat.color = fallback;
                    if (mat.HasProperty("_Metallic")) mat.SetFloat("_Metallic", 0f);
                    if (mat.HasProperty("_Smoothness")) mat.SetFloat("_Smoothness", 0.32f);

                    EditorUtility.SetDirty(mat);
                    result[i] = mat;
                }

                renderer.sharedMaterials = result;
                renderer.shadowCastingMode = ShadowCastingMode.On;
                renderer.receiveShadows = true;
            }
        }

        private static void PolishLightingAndCamera()
        {
            Light sun = GameObject.Find("Sun")?.GetComponent<Light>();
            if (sun != null)
            {
                sun.intensity = 1.15f;
                sun.color = new Color(1f, 0.93f, 0.84f);
                sun.shadows = LightShadows.Soft;
            }

            GameObject fillObj = GameObject.Find("PresentationFillLight");
            if (fillObj == null)
            {
                fillObj = new GameObject("PresentationFillLight");
                Light fill = fillObj.AddComponent<Light>();
                fill.type = LightType.Directional;
                fill.intensity = 0.24f;
                fill.color = new Color(0.72f, 0.82f, 1f);
                fill.shadows = LightShadows.None;
                fillObj.transform.rotation = Quaternion.Euler(35f, 145f, 0f);
            }

            Camera cam = GameObject.Find("PresentationCamera")?.GetComponent<Camera>() ?? Camera.main;
            if (cam != null)
            {
                cam.fieldOfView = 42f;
                cam.nearClipPlane = 0.1f;
                cam.farClipPlane = 180f;
            }

            RenderSettings.fog = true;
            RenderSettings.fogDensity = 0.0045f;
            RenderSettings.fogColor = new Color(0.68f, 0.78f, 0.84f);
        }

        private static void AddBridgeDetails(Transform world)
        {
            Transform bridge = world.Find("Bridge");
            if (bridge == null) return;
            Transform old = bridge.Find("PresentationHardwareDetails");
            if (old != null) UnityEngine.Object.DestroyImmediate(old.gameObject);

            GameObject detailRoot = new("PresentationHardwareDetails");
            detailRoot.transform.SetParent(bridge);

            Material metal = EnsureMaterial("DarkMetal.mat", null, new Color(0.08f, 0.075f, 0.07f), 0.75f, 0.35f, Vector2.one);
            for (int i = 0; i < 8; i++)
            {
                float x = -3.15f + i * 0.9f;
                foreach (float z in new[] { -0.905f, 0.905f })
                {
                    GameObject bolt = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
                    bolt.name = "RailBolt";
                    bolt.transform.SetParent(detailRoot.transform);
                    bolt.transform.position = new Vector3(x, 1.50f, z);
                    bolt.transform.rotation = Quaternion.Euler(90f, 0f, 0f);
                    bolt.transform.localScale = new Vector3(0.055f, 0.025f, 0.055f);
                    Assign(bolt.GetComponent<Renderer>(), metal);
                }
            }
        }

        private static void Assign(Renderer r, Material m) { if (r != null && m != null) r.sharedMaterial = m; }

        private static Material EnsureMaterial(string file, Texture2D texture, Color color, float metallic, float smoothness, Vector2 tiling, bool transparent = false)
        {
            string path = $"{MaterialFolder}/{file}";
            Material mat = AssetDatabase.LoadAssetAtPath<Material>(path);
            Shader shader = Shader.Find("Universal Render Pipeline/Lit") ?? Shader.Find("Standard");
            if (mat == null) { mat = new Material(shader); AssetDatabase.CreateAsset(mat, path); }
            else mat.shader = shader;

            if (mat.HasProperty("_BaseMap")) { mat.SetTexture("_BaseMap", texture); mat.SetTextureScale("_BaseMap", tiling); }
            else { mat.mainTexture = texture; mat.mainTextureScale = tiling; }
            if (mat.HasProperty("_BaseColor")) mat.SetColor("_BaseColor", color); else mat.color = color;
            if (mat.HasProperty("_Metallic")) mat.SetFloat("_Metallic", metallic);
            if (mat.HasProperty("_Smoothness")) mat.SetFloat("_Smoothness", smoothness);

            if (transparent && mat.HasProperty("_Surface"))
            {
                mat.SetFloat("_Surface", 1f);
                mat.EnableKeyword("_SURFACE_TYPE_TRANSPARENT");
                mat.SetOverrideTag("RenderType", "Transparent");
                mat.renderQueue = 3000;
            }
            EditorUtility.SetDirty(mat);
            return mat;
        }

        private static Texture2D EnsureTexture(string file, Func<int, int, Color> generator)
        {
            string path = $"{TextureFolder}/{file}";
            Texture2D existing = AssetDatabase.LoadAssetAtPath<Texture2D>(path);
            if (existing != null) return existing;

            const int size = 512;
            Texture2D tex = new(size, size, TextureFormat.RGBA32, false);
            Color[] pixels = new Color[size * size];
            for (int y = 0; y < size; y++) for (int x = 0; x < size; x++) pixels[y * size + x] = generator(x, y);
            tex.SetPixels(pixels); tex.Apply();
            File.WriteAllBytes(path, tex.EncodeToPNG());
            UnityEngine.Object.DestroyImmediate(tex);
            AssetDatabase.ImportAsset(path, ImportAssetOptions.ForceUpdate);
            TextureImporter importer = AssetImporter.GetAtPath(path) as TextureImporter;
            if (importer != null)
            {
                importer.wrapMode = TextureWrapMode.Repeat;
                importer.filterMode = FilterMode.Bilinear;
                importer.maxTextureSize = 512;
                importer.SaveAndReimport();
            }
            return AssetDatabase.LoadAssetAtPath<Texture2D>(path);
        }

        private static Color GenerateWood(int x, int y)
        {
            float n = Mathf.PerlinNoise(x * 0.025f, y * 0.008f);
            float grain = 0.5f + 0.5f * Mathf.Sin(y * 0.10f + n * 7f);
            float v = 0.72f + 0.20f * grain + 0.08f * n;
            return new Color(0.43f * v, 0.20f * v, 0.055f * v, 1f);
        }
        private static Color GenerateGrass(int x, int y)
        {
            float n = Mathf.PerlinNoise(x * 0.035f, y * 0.035f);
            return Color.Lerp(new Color(0.12f, 0.29f, 0.08f), new Color(0.34f, 0.58f, 0.17f), n);
        }
        private static Color GenerateEarth(int x, int y)
        {
            float n = Mathf.PerlinNoise(x * 0.045f, y * 0.045f);
            return Color.Lerp(new Color(0.16f, 0.08f, 0.035f), new Color(0.37f, 0.21f, 0.085f), n);
        }
        private static Color GenerateConcrete(int x, int y)
        {
            float n = Mathf.PerlinNoise(x * 0.12f, y * 0.12f);
            float v = 0.47f + n * 0.18f;
            return new Color(v, v * 1.01f, v * 0.98f, 1f);
        }
        private static Color GenerateWater(int x, int y)
        {
            float a = Mathf.Sin((x + y * 0.35f) * 0.07f);
            float b = Mathf.Sin((x * 0.35f - y) * 0.05f);
            float wave = (a + b) * 0.5f;
            return Color.Lerp(new Color(0.055f, 0.30f, 0.48f, 0.72f), new Color(0.18f, 0.62f, 0.78f, 0.72f), 0.5f + wave * 0.5f);
        }

        private static Texture2D FindBestTexture(List<Texture2D> textures, string materialName)
        {
            string target = Normalize(materialName);
            Texture2D best = null;
            int score = 0;
            foreach (Texture2D t in textures)
            {
                string n = Normalize(t.name);
                int s = target.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries).Count(token => token.Length > 2 && n.Contains(token));
                if (s > score) { score = s; best = t; }
            }
            return best;
        }

        private static bool IsUtilityTexture(string name)
        {
            string n = name.ToLowerInvariant();
            return n.Contains("normal") || n.Contains("metal") || n.Contains("rough") || n.Contains("spec") || n.Contains("ao") || n.Contains("occlusion");
        }

        private static bool IsAlmostWhiteOrGrey(Color c)
        {
            float spread = Mathf.Max(c.r, Mathf.Max(c.g, c.b)) - Mathf.Min(c.r, Mathf.Min(c.g, c.b));
            return (c.r + c.g + c.b) / 3f > 0.62f && spread < 0.12f;
        }

        private static Color GuessFallbackColor(string label)
        {
            string n = label.ToLowerInvariant();
            if (n.Contains("skin") || n.Contains("face") || n.Contains("head")) return new Color(0.34f, 0.17f, 0.09f);
            if (n.Contains("hair")) return new Color(0.035f, 0.025f, 0.02f);
            if (n.Contains("eye")) return new Color(0.12f, 0.07f, 0.035f);
            if (n.Contains("shoe") || n.Contains("boot")) return new Color(0.055f, 0.055f, 0.06f);
            if (n.Contains("pant") || n.Contains("trouser") || n.Contains("short")) return new Color(0.055f, 0.10f, 0.22f);
            if (n.Contains("shirt") || n.Contains("top") || n.Contains("uniform") || n.Contains("cloth")) return new Color(0.06f, 0.28f, 0.62f);
            return new Color(0.22f, 0.34f, 0.52f);
        }

        private static string Normalize(string s) => (s ?? "").ToLowerInvariant().Replace("_", " ").Replace("-", " ");
        private static string Sanitize(string s)
        {
            foreach (char c in Path.GetInvalidFileNameChars()) s = s.Replace(c, '_');
            return s.Replace('/', '_').Replace('\\', '_');
        }
        private static void EnsureFolder(string path)
        {
            string[] parts = path.Split('/');
            string current = parts[0];
            for (int i = 1; i < parts.Length; i++)
            {
                string next = current + "/" + parts[i];
                if (!AssetDatabase.IsValidFolder(next)) AssetDatabase.CreateFolder(current, parts[i]);
                current = next;
            }
        }
    }
}
