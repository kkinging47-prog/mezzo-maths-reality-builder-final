using System;
using System.Collections.Generic;
using System.Linq;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace Mezzo.EditorTools
{
    public static class ImportedBridgeGalleryBuilder
    {
        private const string SearchRoot = "Assets/EmaceArt";
        private const string ScenePath = "Assets/Scenes/BridgeAssetGallery.unity";

        [MenuItem("Mezzo/Bridge Pack/Create Imported Bridge Gallery")]
        public static void CreateGallery()
        {
            if (EditorApplication.isPlaying)
            {
                Debug.LogWarning("Stop Play Mode before creating the bridge gallery.");
                return;
            }

            if (!AssetDatabase.IsValidFolder(SearchRoot))
            {
                Debug.LogError($"Could not find {SearchRoot}. Confirm the Roadside Tales package is imported.");
                return;
            }

            if (!EditorSceneManager.SaveCurrentModifiedScenesIfUserWantsTo())
            {
                return;
            }

            List<(GameObject prefab, string path)> candidates = FindBridgePrefabs();
            if (candidates.Count == 0)
            {
                Debug.LogError("No bridge prefabs were found under Assets/EmaceArt.");
                return;
            }

            Scene scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
            scene.name = "BridgeAssetGallery";

            CreateEnvironment();

            const int columns = 4;
            const float xSpacing = 7.5f;
            const float zSpacing = 7.2f;

            for (int i = 0; i < candidates.Count; i++)
            {
                int col = i % columns;
                int row = i / columns;
                Vector3 cell = new Vector3((col - 1.5f) * xSpacing, 0f, row * zSpacing);
                CreateCandidate(candidates[i].prefab, candidates[i].path, i + 1, cell);
            }

            PositionCamera(candidates.Count, columns, zSpacing);

            EditorSceneManager.SaveScene(scene, ScenePath);
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();

            Debug.Log($"Bridge gallery created with {candidates.Count} prefab candidates. Scene: {ScenePath}");
        }

        private static List<(GameObject prefab, string path)> FindBridgePrefabs()
        {
            var all = new List<(GameObject prefab, string path)>();
            foreach (string guid in AssetDatabase.FindAssets("t:Prefab", new[] { SearchRoot }))
            {
                string path = AssetDatabase.GUIDToAssetPath(guid);
                GameObject prefab = AssetDatabase.LoadAssetAtPath<GameObject>(path);
                if (prefab == null || prefab.GetComponentInChildren<Renderer>(true) == null)
                    continue;

                string combined = (prefab.name + " " + path).ToLowerInvariant();
                if (combined.Contains("bridge"))
                    all.Add((prefab, path));
            }

            if (all.Count == 0)
            {
                foreach (string guid in AssetDatabase.FindAssets("t:Prefab", new[] { SearchRoot }))
                {
                    string path = AssetDatabase.GUIDToAssetPath(guid);
                    GameObject prefab = AssetDatabase.LoadAssetAtPath<GameObject>(path);
                    if (prefab != null && prefab.GetComponentInChildren<Renderer>(true) != null)
                        all.Add((prefab, path));
                }
            }

            return all
                .OrderBy(x => x.prefab.name, StringComparer.OrdinalIgnoreCase)
                .Take(32)
                .ToList();
        }

        private static void CreateCandidate(GameObject prefab, string path, int index, Vector3 cell)
        {
            GameObject holder = new GameObject($"{index:00}_{prefab.name}");
            holder.transform.position = cell;

            GameObject instance = (GameObject)PrefabUtility.InstantiatePrefab(prefab);
            instance.transform.SetParent(holder.transform, false);
            instance.name = "BridgePreview";
            instance.transform.localPosition = Vector3.zero;
            instance.transform.localRotation = Quaternion.identity;
            instance.transform.localScale = Vector3.one;

            Bounds bounds = CalculateBounds(instance);
            if (bounds.size.z > bounds.size.x * 1.15f)
            {
                instance.transform.localRotation = Quaternion.Euler(0f, 90f, 0f);
                bounds = CalculateBounds(instance);
            }

            float horizontalLength = Mathf.Max(bounds.size.x, bounds.size.z);
            if (horizontalLength > 0.01f)
            {
                float scale = 5.4f / horizontalLength;
                instance.transform.localScale *= scale;
                bounds = CalculateBounds(instance);
            }

            Vector3 move = instance.transform.position;
            move.x += cell.x - bounds.center.x;
            move.z += cell.z - bounds.center.z;
            move.y += 0.08f - bounds.min.y;
            instance.transform.position = move;

            GameObject pad = GameObject.CreatePrimitive(PrimitiveType.Cube);
            pad.name = "DisplayPad";
            pad.transform.SetParent(holder.transform);
            pad.transform.position = cell + new Vector3(0f, -0.04f, 0f);
            pad.transform.localScale = new Vector3(6.2f, 0.08f, 4.8f);
            Renderer padRenderer = pad.GetComponent<Renderer>();
            if (padRenderer != null)
                padRenderer.sharedMaterial = CreatePadMaterial();

            GameObject labelObj = new GameObject("Label");
            labelObj.transform.SetParent(holder.transform);
            labelObj.transform.position = cell + new Vector3(0f, 2.5f, -2.35f);
            labelObj.transform.rotation = Quaternion.Euler(90f, 0f, 0f);
            TextMesh label = labelObj.AddComponent<TextMesh>();
            label.text = $"{index:00}  {prefab.name}\n{path}";
            label.fontSize = 34;
            label.characterSize = 0.08f;
            label.anchor = TextAnchor.MiddleCenter;
            label.alignment = TextAlignment.Center;
            label.color = Color.black;
        }

        private static void CreateEnvironment()
        {
            GameObject floor = GameObject.CreatePrimitive(PrimitiveType.Plane);
            floor.name = "GalleryGround";
            floor.transform.position = new Vector3(0f, -0.1f, 18f);
            floor.transform.localScale = new Vector3(5.5f, 1f, 5.5f);
            Renderer floorRenderer = floor.GetComponent<Renderer>();
            if (floorRenderer != null)
                floorRenderer.sharedMaterial = CreateGroundMaterial();

            GameObject sunObj = new GameObject("GallerySun");
            Light sun = sunObj.AddComponent<Light>();
            sun.type = LightType.Directional;
            sun.intensity = 1.25f;
            sun.color = new Color(1f, 0.94f, 0.86f);
            sun.shadows = LightShadows.Soft;
            sunObj.transform.rotation = Quaternion.Euler(48f, -35f, 0f);

            RenderSettings.ambientMode = UnityEngine.Rendering.AmbientMode.Trilight;
            RenderSettings.ambientSkyColor = new Color(0.64f, 0.75f, 0.88f);
            RenderSettings.ambientEquatorColor = new Color(0.50f, 0.54f, 0.55f);
            RenderSettings.ambientGroundColor = new Color(0.22f, 0.20f, 0.17f);
        }

        private static void PositionCamera(int count, int columns, float rowSpacing)
        {
            int rows = Mathf.CeilToInt(count / (float)columns);
            float centerZ = Mathf.Max(0f, (rows - 1) * rowSpacing * 0.5f);

            GameObject cameraObj = new GameObject("GalleryCamera");
            Camera cam = cameraObj.AddComponent<Camera>();
            cameraObj.tag = "MainCamera";
            cam.fieldOfView = 43f;
            cam.nearClipPlane = 0.1f;
            cam.farClipPlane = 200f;

            cameraObj.transform.position = new Vector3(0f, 19f + rows * 1.2f, centerZ - 17f);
            Vector3 lookAt = new Vector3(0f, 0.7f, centerZ);
            cameraObj.transform.rotation = Quaternion.LookRotation(lookAt - cameraObj.transform.position, Vector3.up);
        }

        private static Bounds CalculateBounds(GameObject root)
        {
            Renderer[] renderers = root.GetComponentsInChildren<Renderer>(true);
            if (renderers.Length == 0)
                return new Bounds(root.transform.position, Vector3.one);

            Bounds b = renderers[0].bounds;
            for (int i = 1; i < renderers.Length; i++)
                b.Encapsulate(renderers[i].bounds);

            return b;
        }

        private static Material _padMaterial;
        private static Material _groundMaterial;

        private static Material CreatePadMaterial()
        {
            if (_padMaterial != null) return _padMaterial;
            Shader shader = Shader.Find("Universal Render Pipeline/Lit") ?? Shader.Find("Standard");
            _padMaterial = new Material(shader) { name = "GalleryPadMaterial" };
            SetColor(_padMaterial, new Color(0.62f, 0.62f, 0.60f));
            return _padMaterial;
        }

        private static Material CreateGroundMaterial()
        {
            if (_groundMaterial != null) return _groundMaterial;
            Shader shader = Shader.Find("Universal Render Pipeline/Lit") ?? Shader.Find("Standard");
            _groundMaterial = new Material(shader) { name = "GalleryGroundMaterial" };
            SetColor(_groundMaterial, new Color(0.26f, 0.42f, 0.22f));
            return _groundMaterial;
        }

        private static void SetColor(Material material, Color color)
        {
            if (material.HasProperty("_BaseColor")) material.SetColor("_BaseColor", color);
            else if (material.HasProperty("_Color")) material.SetColor("_Color", color);
        }
    }
}
