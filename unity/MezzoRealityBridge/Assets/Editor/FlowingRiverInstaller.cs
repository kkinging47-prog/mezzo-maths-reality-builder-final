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

            // The previous visual-polish pass bobbed the whole water body. Remove that now;
            // the river body stays fixed while only the surface currents move.
            WaterSurfaceMotion oldMotion = river.GetComponent<WaterSurfaceMotion>();
            if (oldMotion != null)
                Object.DestroyImmediate(oldMotion);

            EnsureFolder(TextureFolder);
            EnsureFolder(MaterialFolder);

            RemoveOldLayer("RiverCurrent_Main");
            RemoveOldLayer("RiverCurrent_Highlights");

            Texture2D mainTexture = BuildFlowTexture(TextureFolder + "/RiverCurrent_Main.png", false);
            Texture2D highlightTexture = BuildFlowTexture(TextureFolder + "/RiverCurrent_Highlights.png", true);

            Material mainMaterial = BuildWaterLayerMaterial(
                MaterialFolder + "/RiverCurrent_Main.mat",
                mainTexture,
                new Color(0.11f, 0.48f, 0.73f, 0.36f),
                new Vector2(2.2f, 4.5f));

            Material highlightMaterial = BuildWaterLayerMaterial(
                MaterialFolder + "/RiverCurrent_Highlights.mat",
                highlightTexture,
                new Color(0.76f, 0.95f, 1.00f, 0.23f),
                new Vector2(2.8f, 6.0f));

            GameObject main = CreateLayer(
                river.transform,
                "RiverCurrent_Main",
                -0.036f,
                mainMaterial,
                new Vector2(0.006f, 0.078f),
                0.0035f,
                1.0f,
                0f);

            GameObject highlights = CreateLayer(
                river.transform,
                "RiverCurrent_Highlights",
                -0.031f,
                highlightMaterial,
                new Vector2(-0.003f, 0.122f),
                0.0025f,
                1.35f,
                1.7f);

            Renderer baseRenderer = river.GetComponent<Renderer>();
            if (baseRenderer != null)
            {
                baseRenderer.shadowCastingMode = ShadowCastingMode.Off;
                baseRenderer.receiveShadows = false;
            }

            EditorUtility.SetDirty(river);
            EditorUtility.SetDirty(main);
            EditorUtility.SetDirty(highlights);
            EditorSceneManager.MarkSceneDirty(SceneManager.GetActiveScene());
            EditorSceneManager.SaveScene(SceneManager.GetActiveScene());
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();

            Debug.Log("Flowing river installed. Two transparent surface-current layers now travel downstream along the Z axis while the river body stays fixed.");
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

            // Unity Plane is 10 x 10. RiverWater in the presentation is 3.15 x 10.2.
            layer.transform.localScale = new Vector3(0.31f, 1f, 1.005f);

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
            // Rebuild every time so rerunning the command also refreshes an older version.
            if (File.Exists(path))
                AssetDatabase.DeleteAsset(path);

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
                        alpha = 0.24f + longWave * 0.24f + noise * 0.15f;
                    }

                    Color c = highlights
                        ? new Color(1f, 1f, 1f, alpha)
                        : new Color(0.24f + noise * 0.20f, 0.68f + longWave * 0.18f, 1f, alpha);

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

            // URP alpha-blended transparent surface.
            if (material.HasProperty("_Surface")) material.SetFloat("_Surface", 1f);
            if (material.HasProperty("_Blend")) material.SetFloat("_Blend", 0f);
            if (material.HasProperty("_ZWrite")) material.SetFloat("_ZWrite", 0f);
            if (material.HasProperty("_SrcBlend")) material.SetFloat("_SrcBlend", (float)BlendMode.SrcAlpha);
            if (material.HasProperty("_DstBlend")) material.SetFloat("_DstBlend", (float)BlendMode.OneMinusSrcAlpha);
            material.SetOverrideTag("RenderType", "Transparent");
            material.EnableKeyword("_SURFACE_TYPE_TRANSPARENT");
            material.DisableKeyword("_ALPHATEST_ON");
            material.renderQueue = (int)RenderQueue.Transparent;

            EditorUtility.SetDirty(material);
            return material;
        }

        private static void RemoveOldLayer(string name)
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
