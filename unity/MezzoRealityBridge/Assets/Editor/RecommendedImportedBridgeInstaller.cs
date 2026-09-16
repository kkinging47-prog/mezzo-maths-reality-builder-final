using System;
using System.Collections.Generic;
using System.Linq;
using Mezzo.RealityBridge;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace Mezzo.EditorTools
{
    public static class RecommendedImportedBridgeInstaller
    {
        private const string SearchRoot = "Assets/EmaceArt";
        private const float TargetDeckLength = 6.55f;
        private const float TargetDeckY = 1.28f;

        private sealed class Candidate
        {
            public GameObject prefab;
            public string path;
            public float score;
        }

        [MenuItem("Mezzo/Bridge Pack/Use Recommended Imported Bridge")]
        public static void Install()
        {
            if (EditorApplication.isPlaying)
            {
                Debug.LogWarning("Stop Play Mode before installing the imported bridge.");
                return;
            }

            if (!AssetDatabase.IsValidFolder(SearchRoot))
            {
                Debug.LogError("Assets/EmaceArt was not found. Import the Roadside Tales bridge pack first.");
                return;
            }

            GameObject world = GameObject.Find("WORLD_PRESENTATION");
            GameObject oldBridgeRoot = GameObject.Find("WORLD_PRESENTATION/Bridge") ?? GameObject.Find("Bridge");
            BridgeStageController stageController = UnityEngine.Object.FindObjectsByType<BridgeStageController>(
                FindObjectsInactive.Include, FindObjectsSortMode.None).FirstOrDefault();

            if (world == null || oldBridgeRoot == null || stageController == null)
            {
                Debug.LogError("Open FootbridgePresentation first. WORLD_PRESENTATION, Bridge, or BridgeStageController is missing.");
                return;
            }

            Renderer[] oldRenderersToHide = oldBridgeRoot
                .GetComponentsInChildren<Renderer>(true)
                .Where(r => !ShouldKeepVisible(r.gameObject.name))
                .ToArray();

            Candidate best = FindRecommendedCandidate();
            if (best == null || best.prefab == null)
            {
                Debug.LogError("No suitable imported bridge prefab could be found under Assets/EmaceArt.");
                return;
            }

            GameObject existing = GameObject.Find("ImportedDetailedBridge");
            if (existing != null)
            {
                UnityEngine.Object.DestroyImmediate(existing);
            }

            GameObject imported = (GameObject)PrefabUtility.InstantiatePrefab(best.prefab);
            imported.name = "ImportedDetailedBridge";
            imported.transform.SetParent(world.transform, true);
            imported.transform.position = Vector3.zero;
            imported.transform.rotation = Quaternion.identity;
            imported.transform.localScale = Vector3.one;

            AlignAlongX(imported);
            ScaleToLength(imported, TargetDeckLength);
            CenterXZ(imported);
            AlignDeckHeight(imported, TargetDeckY);

            foreach (Renderer renderer in imported.GetComponentsInChildren<Renderer>(true))
            {
                renderer.shadowCastingMode = UnityEngine.Rendering.ShadowCastingMode.On;
                renderer.receiveShadows = true;
            }

            GameObject controllerObject = GameObject.Find("ImportedBridgeVisualController");
            if (controllerObject == null)
            {
                controllerObject = new GameObject("ImportedBridgeVisualController");
                controllerObject.transform.SetParent(world.transform);
            }

            ImportedBridgeFinalVisual visual = controllerObject.GetComponent<ImportedBridgeFinalVisual>();
            if (visual == null)
            {
                visual = controllerObject.AddComponent<ImportedBridgeFinalVisual>();
            }

            visual.stageController = stageController;
            visual.importedBridge = imported;
            visual.oldBridgeRenderers = oldRenderersToHide;

            imported.SetActive(false);

            EditorUtility.SetDirty(visual);
            EditorSceneManager.MarkSceneDirty(SceneManager.GetActiveScene());
            EditorSceneManager.SaveScene(SceneManager.GetActiveScene());
            AssetDatabase.SaveAssets();

            Selection.activeGameObject = imported;
            Debug.Log($"Recommended imported bridge installed: {best.prefab.name} ({best.path}). It will replace the simple central bridge visually after stage 5 while keeping the existing stairs/supports for stage 6.");
        }

        private static Candidate FindRecommendedCandidate()
        {
            Candidate best = null;

            foreach (string guid in AssetDatabase.FindAssets("t:Prefab", new[] { SearchRoot }))
            {
                string path = AssetDatabase.GUIDToAssetPath(guid);
                GameObject prefab = AssetDatabase.LoadAssetAtPath<GameObject>(path);
                if (prefab == null || prefab.GetComponentInChildren<Renderer>(true) == null)
                {
                    continue;
                }

                float score = ScoreCandidate(prefab, path);
                if (best == null || score > best.score)
                {
                    best = new Candidate { prefab = prefab, path = path, score = score };
                }
            }

            return best;
        }

        private static float ScoreCandidate(GameObject prefab, string path)
        {
            string combined = (prefab.name + " " + path).ToLowerInvariant();
            float score = 0f;

            if (combined.Contains("bridge")) score += 25f;
            if (combined.Contains("wood")) score += 12f;
            if (combined.Contains("wooden")) score += 10f;
            if (combined.Contains("rail")) score += 10f;
            if (combined.Contains("walk")) score += 5f;

            string[] reject = { "rope", "susp", "hanging", "broken", "destroy", "wreck", "ruin" };
            foreach (string keyword in reject)
            {
                if (combined.Contains(keyword)) score -= 60f;
            }

            string hierarchyNames = string.Join(" ", prefab.GetComponentsInChildren<Transform>(true).Select(t => t.name.ToLowerInvariant()));
            if (hierarchyNames.Contains("rail") || hierarchyNames.Contains("fence") || hierarchyNames.Contains("guard")) score += 18f;
            if (hierarchyNames.Contains("rope") || hierarchyNames.Contains("cable")) score -= 35f;

            int rendererCount = prefab.GetComponentsInChildren<Renderer>(true).Length;
            int colliderCount = prefab.GetComponentsInChildren<Collider>(true).Length;
            score += Mathf.Min(rendererCount, 24) * 0.7f;
            score += Mathf.Min(colliderCount, 10) * 0.8f;

            GameObject temp = (GameObject)PrefabUtility.InstantiatePrefab(prefab);
            temp.name = "__BridgeCandidateTemp";
            temp.transform.position = new Vector3(10000f, 0f, 10000f);

            Bounds b = GetBounds(temp);
            float length = Mathf.Max(b.size.x, b.size.z);
            float width = Mathf.Max(0.01f, Mathf.Min(b.size.x, b.size.z));
            float ratio = length / width;

            if (ratio >= 1.8f && ratio <= 7f) score += 25f;
            else if (ratio < 1.25f) score -= 20f;

            if (length > 0.01f)
            {
                float relativeHeight = b.size.y / length;
                if (relativeHeight < 0.38f) score += 15f;
                else if (relativeHeight > 0.75f) score -= 20f;
            }

            UnityEngine.Object.DestroyImmediate(temp);
            return score;
        }

        private static void AlignAlongX(GameObject imported)
        {
            Bounds b = GetBounds(imported);
            if (b.size.z > b.size.x)
            {
                imported.transform.rotation = Quaternion.Euler(0f, 90f, 0f);
            }
        }

        private static void ScaleToLength(GameObject imported, float targetLength)
        {
            Bounds b = GetBounds(imported);
            float length = Mathf.Max(0.01f, b.size.x);
            float factor = targetLength / length;
            imported.transform.localScale *= factor;
        }

        private static void CenterXZ(GameObject imported)
        {
            Bounds b = GetBounds(imported);
            imported.transform.position += new Vector3(-b.center.x, 0f, -b.center.z);
        }

        private static void AlignDeckHeight(GameObject imported, float targetY)
        {
            Physics.SyncTransforms();

            float surfaceY;
            if (TryFindDeckSurfaceByRaycast(imported, out float rayY))
            {
                surfaceY = rayY;
            }
            else
            {
                Bounds b = GetBounds(imported);
                surfaceY = b.min.y + b.size.y * 0.12f;
            }

            imported.transform.position += Vector3.up * (targetY - surfaceY);
        }

        private static bool TryFindDeckSurfaceByRaycast(GameObject imported, out float y)
        {
            y = 0f;
            Physics.SyncTransforms();

            RaycastHit[] hits = Physics.RaycastAll(
                new Vector3(0f, 20f, 0f),
                Vector3.down,
                40f,
                ~0,
                QueryTriggerInteraction.Ignore);

            foreach (RaycastHit hit in hits.OrderBy(h => h.distance))
            {
                if (hit.transform == imported.transform || hit.transform.IsChildOf(imported.transform))
                {
                    y = hit.point.y;
                    return true;
                }
            }

            return false;
        }

        private static Bounds GetBounds(GameObject root)
        {
            Renderer[] renderers = root.GetComponentsInChildren<Renderer>(true);
            if (renderers.Length == 0)
            {
                return new Bounds(root.transform.position, Vector3.one);
            }

            Bounds b = renderers[0].bounds;
            for (int i = 1; i < renderers.Length; i++)
            {
                b.Encapsulate(renderers[i].bounds);
            }

            return b;
        }

        private static bool ShouldKeepVisible(string objectName)
        {
            string n = (objectName ?? string.Empty).ToLowerInvariant();
            return n.Contains("step") ||
                   n.Contains("stair") ||
                   n.Contains("pillar") ||
                   n.Contains("foundation") ||
                   n.Contains("footing") ||
                   n.Contains("support");
        }
    }
}
