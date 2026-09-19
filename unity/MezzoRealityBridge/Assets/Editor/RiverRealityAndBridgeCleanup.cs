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
    public static class RiverRealityAndBridgeCleanup
    {
        private const string TextureFolder = "Assets/Textures/RiverReality";
        private const string MaterialFolder = "Assets/Materials/RiverReality";

        [MenuItem("Mezzo/Environment/Upgrade River Reality + Remove Imported Bridge")]
        public static void Apply()
        {
            if (EditorApplication.isPlaying)
            {
                Debug.LogWarning("Stop Play Mode first.");
                return;
            }

            GameObject world = GameObject.Find("WORLD_PRESENTATION");
            GameObject river = GameObject.Find("WORLD_PRESENTATION/Environment/RiverWater") ?? GameObject.Find("RiverWater");
            GameObject bridgeRoot = GameObject.Find("WORLD_PRESENTATION/Bridge") ?? GameObject.Find("Bridge");

            if (world == null || river == null || bridgeRoot == null)
            {
                Debug.LogError("Open FootbridgePresentation first. WORLD_PRESENTATION, RiverWater, or Bridge is missing.");
                return;
            }

            CleanupImportedBridgeObjects(world);
            RestoreOriginalBridgeRenderers(bridgeRoot);
            CleanupPreviousRiverLayers(river);

            EnsureFolder(TextureFolder);
            EnsureFolder(MaterialFolder);

            Texture2D baseTex = BuildBaseTexture(TextureFolder + "/RiverBase.png");
            Texture2D currentTex = BuildCurrentTexture(TextureFolder + "/RiverCurrent.png", false);
            Texture2D highlightTex = BuildCurrentTexture(TextureFolder + "/RiverHighlights.png", true);
            Texture2D foamTex = BuildFoamTexture(TextureFolder + "/RiverFoam.png");
            Texture2D eddyTex = BuildEddyTexture(TextureFolder + "/RiverEddy.png");

            Material baseMat = MakeMaterial(MaterialFolder + "/RiverBase.mat", baseTex, new Color(0.06f, 0.34f, 0.49f, 1f), new Vector2(1.35f, 3.2f), false, 0.88f);
            Material currentMat = MakeMaterial(MaterialFolder + "/RiverCurrent.mat", currentTex, new Color(0.16f, 0.61f, 0.77f, 0.26f), new Vector2(2.4f, 5.5f), true, 0.84f);
            Material highlightMat = MakeMaterial(MaterialFolder + "/RiverHighlights.mat", highlightTex, new Color(0.78f, 0.96f, 1f, 0.16f), new Vector2(3.2f, 7.5f), true, 0.92f);
            Material foamMat = MakeMaterial(MaterialFolder + "/RiverFoam.mat", foamTex, new Color(0.92f, 0.98f, 1f, 0.23f), new Vector2(1.0f, 5.0f), true, 0.68f);
            Material eddyMat = MakeMaterial(MaterialFolder + "/RiverEddy.mat", eddyTex, new Color(0.92f, 0.98f, 1f, 0.18f), Vector2.one, true, 0.72f);

            Renderer baseRenderer = river.GetComponent<Renderer>();
            if (baseRenderer != null)
            {
                baseRenderer.sharedMaterial = baseMat;
                baseRenderer.shadowCastingMode = ShadowCastingMode.Off;
                baseRenderer.receiveShadows = false;
            }

            CreateFlowLayer(river.transform.parent, "RiverReality_Current", new Vector3(river.transform.position.x, -0.034f, river.transform.position.z), new Vector3(0.315f, 1f, 1.02f), currentMat, new Vector2(0.003f, 0.072f), 0.0016f, 1.0f, 0f);
            CreateFlowLayer(river.transform.parent, "RiverReality_Highlights", new Vector3(river.transform.position.x, -0.029f, river.transform.position.z), new Vector3(0.315f, 1f, 1.02f), highlightMat, new Vector2(-0.002f, 0.115f), 0.0012f, 1.35f, 1.6f);
            CreateShoreFoam(river.transform.parent, "RiverFoam_LeftBank", new Vector3(-1.48f, -0.024f, river.transform.position.z), foamMat, new Vector2(0.0f, 0.060f), 0.2f);
            CreateShoreFoam(river.transform.parent, "RiverFoam_RightBank", new Vector3(1.48f, -0.023f, river.transform.position.z), foamMat, new Vector2(0.0f, 0.066f), 1.1f);
            CreateEddy(river.transform.parent, "RiverEddy_A", new Vector3(-0.80f, -0.020f, -0.62f), new Vector3(0.44f, 1f, 0.30f), eddyMat, 6.5f, 0.0f);
            CreateEddy(river.transform.parent, "RiverEddy_B", new Vector3(0.80f, -0.019f, 0.62f), new Vector3(0.42f, 1f, 0.28f), eddyMat, -7.0f, 0.9f);
            CreateEddy(river.transform.parent, "RiverEddy_C", new Vector3(-0.80f, -0.018f, 0.62f), new Vector3(0.34f, 1f, 0.24f), eddyMat, 5.5f, 1.8f);

            EditorSceneManager.MarkSceneDirty(SceneManager.GetActiveScene());
            EditorSceneManager.SaveScene(SceneManager.GetActiveScene());
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();

            Debug.Log("River realism upgraded and imported bridge leftovers removed. Original bridge visuals restored.");
        }

        private static void CleanupImportedBridgeObjects(GameObject world)
        {
            string[] obviousNames = { "ImportedDetailedBridge", "ImportedRigidBridge", "ImportedBridgeVisualController", "ImportedBridgeVisualControllerV2", "ImportedBridgeWalkSurface" };
            foreach (string name in obviousNames)
            {
                GameObject go = GameObject.Find(name);
                if (go != null) UnityEngine.Object.DestroyImmediate(go);
            }

            HashSet<GameObject> rootsToDelete = new HashSet<GameObject>();
            foreach (Transform t in world.GetComponentsInChildren<Transform>(true))
            {
                if (t == null || t.gameObject == world) continue;
                GameObject source = PrefabUtility.GetCorrespondingObjectFromSource(t.gameObject);
                if (source == null) continue;
                string sourcePath = AssetDatabase.GetAssetPath(source);
                if (string.IsNullOrEmpty(sourcePath) || !sourcePath.StartsWith("Assets/EmaceArt", StringComparison.OrdinalIgnoreCase)) continue;
                GameObject root = PrefabUtility.GetOutermostPrefabInstanceRoot(t.gameObject);
                if (root != null && root.transform.IsChildOf(world.transform)) rootsToDelete.Add(root);
            }
            foreach (GameObject go in rootsToDelete)
                if (go != null) UnityEngine.Object.DestroyImmediate(go);

            MonoBehaviour[] behaviours = UnityEngine.Object.FindObjectsByType<MonoBehaviour>(FindObjectsInactive.Include, FindObjectsSortMode.None);
            foreach (MonoBehaviour behaviour in behaviours)
            {
                if (behaviour == null) continue;
                string typeName = behaviour.GetType().Name;
                if (typeName == "ImportedBridgeFinalVisual" || typeName == "ImportedBridgeFinalVisualV2")
                {
                    GameObject owner = behaviour.gameObject;
                    if (owner != null) UnityEngine.Object.DestroyImmediate(owner);
                }
            }
        }

        private static void RestoreOriginalBridgeRenderers(GameObject bridgeRoot)
        {
            foreach (Renderer renderer in bridgeRoot.GetComponentsInChildren<Renderer>(true)) renderer.enabled = true;
        }

        private static void CleanupPreviousRiverLayers(GameObject river)
        {
            WaterSurfaceMotion oldWaterMotion = river.GetComponent<WaterSurfaceMotion>();
            if (oldWaterMotion != null) UnityEngine.Object.DestroyImmediate(oldWaterMotion);

            string[] names = { "RiverCurrent_Main", "RiverCurrent_Highlights", "RiverReality_Current", "RiverReality_Highlights", "RiverFoam_LeftBank", "RiverFoam_RightBank", "RiverEddy_A", "RiverEddy_B", "RiverEddy_C" };
            foreach (string name in names)
            {
                GameObject go = GameObject.Find(name);
                if (go != null) UnityEngine.Object.DestroyImmediate(go);
            }
        }

        private static void CreateFlowLayer(Transform parent, string name, Vector3 position, Vector3 scale, Material material, Vector2 speed, float ripple, float rippleSpeed, float phase)
        {
            GameObject plane = CreatePlane(name, parent, position, scale, material);
            RiverLayerMotionV2 motion = plane.AddComponent<RiverLayerMotionV2>();
            motion.uvSpeed = speed;
            motion.verticalRipple = ripple;
            motion.verticalRippleSpeed = rippleSpeed;
            motion.phase = phase;
        }

        private static void CreateShoreFoam(Transform parent, string name, Vector3 position, Material material, Vector2 speed, float phase)
        {
            GameObject plane = CreatePlane(name, parent, position, new Vector3(0.022f, 1f, 1.01f), material);
            RiverLayerMotionV2 motion = plane.AddComponent<RiverLayerMotionV2>();
            motion.uvSpeed = speed;
            motion.verticalRipple = 0.0008f;
            motion.verticalRippleSpeed = 0.9f;
            motion.phase = phase;
        }

        private static void CreateEddy(Transform parent, string name, Vector3 position, Vector3 scale, Material material, float degrees, float phase)
        {
            GameObject plane = CreatePlane(name, parent, position, scale, material);
            RiverEddyMotionV2 motion = plane.AddComponent<RiverEddyMotionV2>();
            motion.degreesPerSecond = degrees;
            motion.pulseAmount = 0.025f;
            motion.pulseSpeed = 1.15f;
            motion.phase = phase;
        }

        private static GameObject CreatePlane(string name, Transform parent, Vector3 position, Vector3 scale, Material material)
        {
            GameObject plane = GameObject.CreatePrimitive(PrimitiveType.Plane);
            plane.name = name;
            plane.transform.SetParent(parent);
            plane.transform.position = position;
            plane.transform.rotation = Quaternion.identity;
            plane.transform.localScale = scale;
            Renderer r = plane.GetComponent<Renderer>();
            r.sharedMaterial = material;
            r.shadowCastingMode = ShadowCastingMode.Off;
            r.receiveShadows = false;
            Collider c = plane.GetComponent<Collider>();
            if (c != null) UnityEngine.Object.DestroyImmediate(c);
            return plane;
        }

        private static Material MakeMaterial(string path, Texture2D texture, Color color, Vector2 tiling, bool transparent, float smoothness)
        {
            Material mat = AssetDatabase.LoadAssetAtPath<Material>(path);
            Shader shader = Shader.Find("Universal Render Pipeline/Lit") ?? Shader.Find("Standard");
            if (mat == null)
            {
                mat = new Material(shader);
                AssetDatabase.CreateAsset(mat, path);
            }
            else mat.shader = shader;

            if (mat.HasProperty("_BaseMap"))
            {
                mat.SetTexture("_BaseMap", texture);
                mat.SetTextureScale("_BaseMap", tiling);
            }
            else
            {
                mat.mainTexture = texture;
                mat.mainTextureScale = tiling;
            }

            if (mat.HasProperty("_BaseColor")) mat.SetColor("_BaseColor", color);
            else mat.color = color;
            if (mat.HasProperty("_Metallic")) mat.SetFloat("_Metallic", 0f);
            if (mat.HasProperty("_Smoothness")) mat.SetFloat("_Smoothness", smoothness);

            if (transparent)
            {
                if (mat.HasProperty("_Surface")) mat.SetFloat("_Surface", 1f);
                if (mat.HasProperty("_Blend")) mat.SetFloat("_Blend", 0f);
                if (mat.HasProperty("_ZWrite")) mat.SetFloat("_ZWrite", 0f);
                if (mat.HasProperty("_SrcBlend")) mat.SetFloat("_SrcBlend", (float)BlendMode.SrcAlpha);
                if (mat.HasProperty("_DstBlend")) mat.SetFloat("_DstBlend", (float)BlendMode.OneMinusSrcAlpha);
                mat.SetOverrideTag("RenderType", "Transparent");
                mat.EnableKeyword("_SURFACE_TYPE_TRANSPARENT");
                mat.DisableKeyword("_ALPHATEST_ON");
                mat.renderQueue = (int)RenderQueue.Transparent;
            }
            else
            {
                if (mat.HasProperty("_Surface")) mat.SetFloat("_Surface", 0f);
                if (mat.HasProperty("_ZWrite")) mat.SetFloat("_ZWrite", 1f);
                mat.SetOverrideTag("RenderType", "Opaque");
                mat.DisableKeyword("_SURFACE_TYPE_TRANSPARENT");
                mat.renderQueue = (int)RenderQueue.Geometry;
            }
            EditorUtility.SetDirty(mat);
            return mat;
        }

        private static Texture2D BuildBaseTexture(string path)
        {
            const int size = 512;
            return BuildTexture(path, size, size, (x, y) =>
            {
                float fx = x / (float)size;
                float fy = y / (float)size;
                float broad = Mathf.PerlinNoise(fx * 4.2f, fy * 9.5f);
                float fine = Mathf.PerlinNoise(fx * 18f + 2.3f, fy * 27f + 7.1f);
                float v = broad * 0.7f + fine * 0.3f;
                Color a = new Color(0.035f, 0.20f, 0.30f, 1f);
                Color b = new Color(0.09f, 0.42f, 0.54f, 1f);
                return Color.Lerp(a, b, v);
            });
        }

        private static Texture2D BuildCurrentTexture(string path, bool highlight)
        {
            const int width = 256, height = 512;
            return BuildTexture(path, width, height, (x, y) =>
            {
                float fx = x / (float)width;
                float fy = y / (float)height;
                float n1 = Mathf.PerlinNoise(fx * 9f, fy * 34f);
                float n2 = Mathf.PerlinNoise(fx * 22f + 4f, fy * 10f + 3f);
                float wave = 0.5f + 0.5f * Mathf.Sin(fy * 46f + n1 * 6f + fx * 3.5f);
                if (highlight)
                {
                    float alpha = Mathf.Pow(Mathf.Clamp01((wave - 0.72f) * 4f), 2.3f) * (0.25f + n2 * 0.75f);
                    return new Color(1f, 1f, 1f, alpha);
                }
                float alphaCurrent = 0.18f + wave * 0.23f + n1 * 0.10f;
                return new Color(0.33f, 0.80f, 0.94f, alphaCurrent);
            });
        }

        private static Texture2D BuildFoamTexture(string path)
        {
            const int width = 128, height = 512;
            return BuildTexture(path, width, height, (x, y) =>
            {
                float fx = x / (float)width;
                float fy = y / (float)height;
                float n = Mathf.PerlinNoise(fx * 13f + 2f, fy * 31f);
                float streak = 0.5f + 0.5f * Mathf.Sin(fy * 54f + n * 8f);
                float center = 1f - Mathf.Abs(fx - 0.5f) * 2f;
                float alpha = Mathf.Pow(Mathf.Clamp01(streak - 0.55f), 2f) * Mathf.Pow(Mathf.Clamp01(center), 0.45f);
                return new Color(1f, 1f, 1f, alpha);
            });
        }

        private static Texture2D BuildEddyTexture(string path)
        {
            const int size = 256;
            return BuildTexture(path, size, size, (x, y) =>
            {
                float px = (x + 0.5f) / size * 2f - 1f;
                float py = (y + 0.5f) / size * 2f - 1f;
                float r = Mathf.Sqrt(px * px + py * py);
                float angle = Mathf.Atan2(py, px);
                float noise = Mathf.PerlinNoise((px + 1f) * 5f, (py + 1f) * 5f);
                float ring1 = 1f - Mathf.Clamp01(Mathf.Abs(r - 0.48f) / 0.07f);
                float ring2 = 1f - Mathf.Clamp01(Mathf.Abs(r - 0.70f) / 0.055f);
                float broken = 0.45f + 0.55f * Mathf.Sin(angle * 5f + noise * 6f);
                float alpha = Mathf.Clamp01((ring1 * 0.75f + ring2 * 0.45f) * Mathf.Clamp01(broken + 0.25f));
                return new Color(1f, 1f, 1f, alpha);
            });
        }

        private static Texture2D BuildTexture(string path, int width, int height, Func<int, int, Color> generator)
        {
            if (File.Exists(path)) AssetDatabase.DeleteAsset(path);
            Texture2D tex = new Texture2D(width, height, TextureFormat.RGBA32, false);
            Color[] pixels = new Color[width * height];
            for (int y = 0; y < height; y++)
                for (int x = 0; x < width; x++)
                    pixels[y * width + x] = generator(x, y);
            tex.SetPixels(pixels);
            tex.Apply();
            File.WriteAllBytes(path, tex.EncodeToPNG());
            UnityEngine.Object.DestroyImmediate(tex);
            AssetDatabase.ImportAsset(path, ImportAssetOptions.ForceUpdate);
            TextureImporter importer = AssetImporter.GetAtPath(path) as TextureImporter;
            if (importer != null)
            {
                importer.wrapMode = TextureWrapMode.Repeat;
                importer.filterMode = FilterMode.Bilinear;
                importer.mipmapEnabled = true;
                importer.alphaSource = TextureImporterAlphaSource.FromInput;
                importer.maxTextureSize = 512;
                importer.SaveAndReimport();
            }
            return AssetDatabase.LoadAssetAtPath<Texture2D>(path);
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
