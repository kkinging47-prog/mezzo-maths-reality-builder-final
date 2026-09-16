using System.Collections.Generic;
using System.Linq;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace Mezzo.EditorTools
{
    public static class PresentationVisibilityFix
    {
        [MenuItem("Mezzo/Fix Presentation Camera & Trees")]
        public static void FixVisibility()
        {
            if (EditorApplication.isPlaying)
            {
                Debug.LogWarning("Stop Play Mode before running Mezzo > Fix Presentation Camera & Trees.");
                return;
            }

            Scene scene = SceneManager.GetActiveScene();
            if (!scene.IsValid())
            {
                Debug.LogError("No active Unity scene was found.");
                return;
            }

            List<GameObject> trees = scene.GetRootGameObjects()
                .SelectMany(root => root.GetComponentsInChildren<Transform>(true))
                .Where(t => t.name.StartsWith("PresentationTree_"))
                .Select(t => t.gameObject)
                .Distinct()
                .OrderBy(go => go.name)
                .ToList();

            Vector3[] safeTreePositions =
            {
                new(-8.8f, 0.2f, 4.7f),
                new(-6.3f, 0.2f, 5.1f),
                new(-9.2f, 0.2f, 2.2f),
                new(-7.4f, 0.2f, 3.3f),
                new(8.8f, 0.2f, 4.7f),
                new(6.3f, 0.2f, 5.1f),
                new(9.2f, 0.2f, 2.2f),
                new(7.4f, 0.2f, 3.3f)
            };

            for (int i = 0; i < trees.Count; i++)
            {
                GameObject tree = trees[i];
                tree.transform.position = safeTreePositions[i % safeTreePositions.Length];
                tree.transform.rotation = Quaternion.Euler(0f, (i * 47f) % 360f, 0f);
                NormalizeTreeHeight(tree, 3.8f + 0.35f * (i % 4));
            }

            GameObject cameraObject = GameObject.Find("PresentationCamera");
            Camera camera = cameraObject != null ? cameraObject.GetComponent<Camera>() : Camera.main;
            if (camera != null)
            {
                camera.transform.position = new Vector3(-8.8f, 5.6f, -11.8f);
                camera.transform.LookAt(new Vector3(0f, 1.05f, 0f));
                camera.fieldOfView = 40f;
                camera.nearClipPlane = 0.1f;
                camera.farClipPlane = 150f;
            }
            else
            {
                Debug.LogWarning("PresentationCamera was not found. Tree visibility was fixed, but the camera could not be adjusted.");
            }

            EditorSceneManager.MarkSceneDirty(scene);
            EditorSceneManager.SaveScene(scene);

            Debug.Log($"Presentation visibility fixed: {trees.Count} trees moved/resized and camera reframed. The bridge sightline is now clear.");
        }

        private static void NormalizeTreeHeight(GameObject tree, float targetHeight)
        {
            Renderer[] renderers = tree.GetComponentsInChildren<Renderer>(true);
            if (renderers.Length == 0)
            {
                tree.transform.localScale = Vector3.one * 0.65f;
                return;
            }

            Bounds bounds = renderers[0].bounds;
            for (int i = 1; i < renderers.Length; i++)
            {
                bounds.Encapsulate(renderers[i].bounds);
            }

            if (bounds.size.y < 0.01f)
            {
                return;
            }

            float factor = Mathf.Clamp(targetHeight / bounds.size.y, 0.08f, 2.5f);
            tree.transform.localScale *= factor;
        }
    }
}
