using System.IO;
using Mezzo.RealityBridge;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.SceneManagement;

namespace Mezzo.EditorTools
{
    public static class FlowingRiverInstaller
    {
        private const string TextureFolder = "Assets/Textures/RiverFlow";
        private const string MaterialFolder = "Assets/Materials/RiverFlow";

        [MenuItem("Mezzo/Environment/Install Flowing River")]
        public static void Install()
        {
            if (EditorApplication.isPlaying)
            {
                Debug.LogWarning("Stop Play Mode before installing the flowing river.");
                return;
            }

            GameObject river = GameObject.Find("WORLD_PRESENTATION/Environment/RiverWater") ?? GameObject.Find("RiverWater");
            if (river == null)
            {
                Debug.LogError("RiverWater was not found. Open FootbridgePresentation first.");
                return;
            }

            EnsureFolder(TextureFolder);
            EnsureFolder(MaterialFolder);

            RemoveOldLayer(river.transform, "RiverCurrent_Main");
            RemoveOldLayer(river.transform, "RiverCurrent_Highlights");

            Texture2D mainTexture = BuildFlowTexture(TextureFolder + "/RiverCurrent_Main.png", false);
            Texture2D highlightTexture = BuildFlowTexture(TextureFolder + "/RiverCurrent_Highlights.png", true);

            Material mainMaterial = BuildWaterLayerMaterial(
                MaterialFolder + "/RiverCurrent_Main.mat",
                mainTexture,
                new Color(0.11f, 0.48f, 0.73f, 0.34f),
                new Vector2(2.2f, 4.5f));

            Material highlightMaterial = BuildWaterLayerMaterial(
                MaterialFolder + "/RiverCurrent_Highlights.mat",
                highlightTexture,
                new Color(0.70f, 0.92f, 1.00f, 0.20f),
                new Vector2(2.8f, 6.0f));

            GameObject main = CreateLayer(
                river.transform,
                "RiverCurrent_Main",
                -0.039f,
                mainMaterial,
                new Vector2(0.007f, 0.075f),
                0.004f,
                1.0f,
                0f);

            GameObject highlights = CreateLayer(
                river.transform,
                "RiverCurrent_Highlights",
                -0.034f,
                highlightMaterial,
                new Vector2(-0.004f, 0.115f),
                0.003f,
                1.35f,
                1.7f);

            // Keep the original water as the base body of the river.
            Renderer baseRenderer = river.GetComponent<Renderer>();
            if (baseRenderer != null)
            {
                baseRenderer.shadowCastingMode = ShadowCastingMode.Off;
                baseRenderer.receiveShadows = false;
            }

            EditorUtility.SetDirty(main);
            EditorUtility.SetDirty(highlights);
            EditorSceneManager.MarkSceneDirty(SceneManager.GetActiveScene());
            EditorSceneManager.SaveScene(SceneManager.GetActiveScene());
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();

            Debug.Log("Flowing river installed. Two current layers now move downstream along the river without moving the bridge or river body.");
        }

        private static GameObject CreateLayer(
            Transform river,
            string name,
            float worldY,
            Material material,
            Vector2 flowSpeed,
            float waveAmount,
            float waveSpeed,
            float phase)
        {
            GameObject layer = GameObject.CreatePrimitive(PrimitiveType.Plane);
            layer.name = name;
            layer.transform.SetParent(river.parent);
            layer.transform.position = new Vector3(river.position.x, worldY, river.position.z);
            layer.transform.rotation = Quaternion.identity;

            // Unity's Plane primitive is 10 x 10 units.
            Vector3 riverScale = river.transform.lossyScale;
            layer.transform.localScale = new Vector3(
                (3.10f / 10f),
                1f,
                (10.05f / 10f));

            Renderer renderer = layer.GetComponent<Renderer>();
            renderer.sharedMaterial = material;
            renderer.shadowCastingMode = ShadowCastingMode.Off;
            renderer.receiveShadows = false;

            Collider collider = layer.GetComponent<Collider>();
            if (collider != null)
                Object.DestroyImmediate(collider);

            RiverCurrentAnimator animator = layer.AddComponent<RiverCurrentAnimator>();
            animator.flowSpeed = flowSpeed;
            animator.secondaryWave = waveAmount;
            animator.waveSpeed = waveSpeed;
            animator.startPhase = phase;

            return layer;
        }

        private static Texture2D BuildFlowTexture(string path, bool highlights)
        {
            Texture2D existing = AssetDatabase.LoadAssetAtPath<Texture2D>(path);
            if (existing != null)
                return existing;

            const int width = 256;
            const int height = 512;
            Texture2D tex = new Texture2D(width, height, TextureFormat.RGBA32, false);
            Color[] pixels = new Color[width * height];

            for (int y = 0; y < height; y++)
            {
                float fy = y / (float)height;

                for (int x = 0; x < width; x++)
                {
                    float fx = x / (float)width;
                    float noise = Mathf.PerlinNoise(fx * 9.5f, fy * 28f);
                    float longWave = 0.5f + 0.5f * Mathf.Sin((fy * 34f) + noise * 5f + fx * 2f);
                    float sideVariation = Mathf.PerlinNoise(fx * 18f + 5f, fy * 6f);

                    float alpha;
                    if (highlights)
                    {
                        float streak = Mathf.Pow(Mathf.Clamp01((longWave - 0.66f) * 3.0f), 2.2f);
                        alpha = streak * (0.35f + sideVariation * 0.65f);
                    }
                    else
                    {
                        alpha = 0.30f + longWave * 0.28f + noise * 0.18f;
                    }

                    Color c = highlights
                        ? new Color(1f, 1f, 1f, alpha)
                        : new Color(0.30f + noise * 0.18f, 0.72f + longWave * 0.15f, 1f, alpha);

                    pixels[y * width + x] = c;
                }
            }

            tex.SetPixels(pixels);
            tex.Apply();
            File.WriteAllBytes(path, tex.EncodeToPNG());
            Object.DestroyImmediate(tex);

            AssetDatabase.ImportAsset(path, ImportAssetOptions.ForceUpdate);
            TextureImporter importer = AssetImporter.GetAtPath(path) as TextureImporter;
            if (importer != null)
            {
                importer.wrapMode = TextureWrapMode.Repeat;
                importer.filterMode = FilterMode.Bilinear;
                importer.mipmapEnabled = true;
                importer.alphaSource = TextureImporterAlphaSource.FromInput;
                importer.SaveAndReimport();
            }

            return AssetDatabase.LoadAssetAtPath<Texture2D>(path);
        }

        private static Material BuildWaterLayerMaterial(string path, Texture2D texture, Color tint, Vector2 tiling)
        {
            Material material = AssetDatabase.LoadAssetAtPath<Material>(path);
            Shader shader = Shader.Find("Universal Render Pipeline/Lit") ?? Shader.Find("Standard");

            if (material == null)
            {
                material = new Material(shader);
                AssetDatabase.CreateAsset(material, path);
            }
            else
            {
                material.shader = shader;
            }

            if (material.HasProperty("_BaseMap"))
            {
                material.SetTexture("_BaseMap", texture);
                material.SetTextureScale("_BaseMap", tiling);
            }
            else
            {
                material.mainTexture = texture;
                material.mainTextureScale = tiling;
            }

            if (material.HasProperty("_BaseColor"))
                material.SetColor("_BaseColor", tint);
            else
                material.color = tint;

            if (material.HasProperty("_Metallic")) material.SetFloat("_Metallic", 0f);
            if (material.HasProperty("_Smoothness")) material.SetFloat("_Smoothness", 0.78f);

            // URP transparent surface configuration.
            if (material.HasProperty("_Surface")) material.SetFloat("_Surface", 1f);
            if (material.HasProperty("_Blend")) material.SetFloat("_Blend", 0f);
            if (material.HasProperty("_ZWrite")) material.SetFloat("_ZWrite", 0f);
            material.SetOverrideTag("RenderType", "Transparent");
            material.EnableKeyword("_SURFACE_TYPE_TRANSPARENT");
            material.renderQueue = (int)RenderQueue.Transparent;

            EditorUtility.SetDirty(material);
            return material;
        }

        private static void RemoveOldLayer(Transform river, string name)
        {
            GameObject existing = GameObject.Find(name);
            if (existing != null)
                Object.DestroyImmediate(existing);
        }

        private static void EnsureFolder(string path)
        {
            string[] parts = path.Split('/');
            string current = parts[0];

            for (int i = 1; i < parts.Length; i++)
            {
                string next = current + "/" + parts[i];
                if (!AssetDatabase.IsValidFolder(next))
                    AssetDatabase.CreateFolder(current, parts[i]);
                current = next;
            }
        }
    }
}
