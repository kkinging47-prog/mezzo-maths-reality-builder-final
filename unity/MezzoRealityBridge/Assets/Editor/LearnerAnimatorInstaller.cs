using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Mezzo.RealityBridge;
using UnityEditor;
using UnityEditor.Animations;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace Mezzo.EditorTools
{
    public static class LearnerAnimatorInstaller
    {
        private const string CharacterFolder = "Assets/Models/Character";
        private const string ControllerPath = "Assets/Animations/MezzoLearner.controller";

        [MenuItem("Mezzo/Install Rigged Learner & Crossing")]
        public static void Install()
        {
            if (EditorApplication.isPlaying)
            {
                Debug.LogWarning("Stop Play Mode before installing the learner.");
                return;
            }

            if (!AssetDatabase.IsValidFolder(CharacterFolder))
            {
                Debug.LogError($"Character folder not found: {CharacterFolder}");
                return;
            }

            GameObject characterPrefab = FindCharacterPrefab();
            AnimationClip idle = FindClip(new[] { "idle" });
            AnimationClip walk = FindClip(new[] { "walk" });
            AnimationClip celebrate = FindClip(new[] { "victory", "celebr", "cheer", "happy" });
            AnimationClip climb = FindClip(new[] { "stairsup", "stairs_up", "stairup", "stair_up", "climbstairs", "climb_stairs", "upstairs", "up_stairs" });
            AnimationClip descend = FindClip(new[] { "stairsdown", "stairs_down", "stairdown", "stair_down", "descendstairs", "descend_stairs", "downstairs", "down_stairs" });

            if (characterPrefab == null)
            {
                Debug.LogError("No rigged character FBX with a SkinnedMeshRenderer was found in Assets/Models/Character.");
                return;
            }

            if (idle == null || walk == null || celebrate == null)
            {
                Debug.LogError("Could not identify Idle, Walking, and Celebrate/Victory clips. Make sure the animation FBX filenames contain words such as Idle, Walking, Victory, Celebrate, Cheer, or Happy.");
                return;
            }

            EnsureFolder("Assets/Animations");
            if (AssetDatabase.LoadAssetAtPath<AnimatorController>(ControllerPath) != null)
            {
                AssetDatabase.DeleteAsset(ControllerPath);
            }

            AnimatorController controller = AnimatorController.CreateAnimatorControllerAtPath(ControllerPath);
            AnimatorStateMachine machine = controller.layers[0].stateMachine;
            AnimatorState idleState = machine.AddState("Idle");
            idleState.motion = idle;
            AnimatorState walkState = machine.AddState("Walk");
            walkState.motion = walk;
            AnimatorState celebrateState = machine.AddState("Celebrate");
            celebrateState.motion = celebrate;
            if (climb != null)
            {
                AnimatorState climbState = machine.AddState("ClimbStairs");
                climbState.motion = climb;
            }
            if (descend != null)
            {
                AnimatorState descendState = machine.AddState("DescendStairs");
                descendState.motion = descend;
            }
            machine.defaultState = idleState;

            GameObject characterRoot = GameObject.Find("WORLD_PRESENTATION/Character") ?? GameObject.Find("Character");
            if (characterRoot == null)
            {
                Debug.LogError("Presentation Character root was not found. Open FootbridgePresentation and run this command again.");
                return;
            }

            Transform learnerStart = characterRoot.transform.Find("LearnerStart");
            if (learnerStart == null)
            {
                GameObject start = new("LearnerStart");
                start.transform.SetParent(characterRoot.transform);
                start.transform.position = new Vector3(-7f, 0.35f, 0f);
                start.transform.rotation = Quaternion.Euler(0f, 90f, 0f);
                learnerStart = start.transform;
            }

            foreach (Transform child in characterRoot.transform.Cast<Transform>().ToList())
            {
                if (child == learnerStart) continue;
                if (child.name.Contains("PLACEHOLDER", StringComparison.OrdinalIgnoreCase) || child.name == "MezzoLearner")
                {
                    UnityEngine.Object.DestroyImmediate(child.gameObject);
                }
            }

            GameObject learner = (GameObject)PrefabUtility.InstantiatePrefab(characterPrefab);
            learner.name = "MezzoLearner";
            learner.transform.SetParent(characterRoot.transform);
            learner.transform.SetPositionAndRotation(learnerStart.position, learnerStart.rotation);
            NormalizeCharacterHeight(learner, 1.52f);

            Animator animator = learner.GetComponent<Animator>();
            if (animator == null) animator = learner.AddComponent<Animator>();
            animator.runtimeAnimatorController = controller;
            animator.applyRootMotion = false;
            animator.cullingMode = AnimatorCullingMode.AlwaysAnimate;

            LearnerCrossingMotor motor = learner.GetComponent<LearnerCrossingMotor>();
            if (motor == null) motor = learner.AddComponent<LearnerCrossingMotor>();
            motor.animator = animator;
            motor.characterRoot = learner.transform;
            motor.startPoint = learnerStart;
            motor.idleState = "Idle";
            motor.walkState = "Walk";
            motor.climbState = climb != null ? "ClimbStairs" : "";
            motor.descendState = descend != null ? "DescendStairs" : "";
            motor.celebrateState = "Celebrate";
            motor.approachSpeed = 1.35f;
            motor.stairSpeed = 1.05f;
            motor.deckSpeed = 1.45f;
            motor.exitSpeed = 1.30f;
            motor.deckY = 1.28f;
            motor.facingY = 90f;
            motor.stairCount = 6;
            motor.verticalSmoothing = 10f;

            GameObject systems = GameObject.Find("WORLD_PRESENTATION/Systems") ?? GameObject.Find("Systems");
            CharacterMissionController characterMission = systems != null ? systems.GetComponent<CharacterMissionController>() : null;
            if (characterMission == null)
            {
                Debug.LogError("CharacterMissionController was not found in the Presentation scene.");
                return;
            }

            characterMission.animator = animator;
            characterMission.characterRoot = learner.transform;
            characterMission.startPoint = learnerStart;
            characterMission.crossingTimeline = null;
            characterMission.crossingMotor = motor;

            EditorUtility.SetDirty(characterMission);
            EditorUtility.SetDirty(motor);
            EditorUtility.SetDirty(animator);
            EditorSceneManager.MarkSceneDirty(SceneManager.GetActiveScene());
            EditorSceneManager.SaveScene(SceneManager.GetActiveScene());
            AssetDatabase.SaveAssets();

            Selection.activeGameObject = learner;
            Debug.Log($"Rigged learner installed. Character: {characterPrefab.name}; Idle: {idle.name}; Walk: {walk.name}; Celebrate: {celebrate.name}; Climb: {(climb != null ? climb.name : "not installed")}; Descend: {(descend != null ? descend.name : "not installed")}.");
        }

        private static GameObject FindCharacterPrefab()
        {
            foreach (string guid in AssetDatabase.FindAssets("t:GameObject", new[] { CharacterFolder }))
            {
                string path = AssetDatabase.GUIDToAssetPath(guid);
                if (!path.EndsWith(".fbx", StringComparison.OrdinalIgnoreCase)) continue;
                if (Path.GetFileNameWithoutExtension(path).Contains("@")) continue;
                GameObject asset = AssetDatabase.LoadAssetAtPath<GameObject>(path);
                if (asset != null && asset.GetComponentInChildren<SkinnedMeshRenderer>(true) != null) return asset;
            }

            foreach (string guid in AssetDatabase.FindAssets("t:GameObject", new[] { CharacterFolder }))
            {
                string path = AssetDatabase.GUIDToAssetPath(guid);
                GameObject asset = AssetDatabase.LoadAssetAtPath<GameObject>(path);
                if (asset != null && asset.GetComponentInChildren<SkinnedMeshRenderer>(true) != null) return asset;
            }
            return null;
        }

        private static AnimationClip FindClip(string[] keywords)
        {
            string[] fbxGuids = AssetDatabase.FindAssets("t:Model", new[] { CharacterFolder });
            foreach (string guid in fbxGuids)
            {
                string path = AssetDatabase.GUIDToAssetPath(guid);
                string normalized = path.ToLowerInvariant().Replace(" ", "").Replace("-", "");
                if (!keywords.Any(k => normalized.Contains(k.Replace(" ", "").Replace("-", "")))) continue;
                AnimationClip clip = AssetDatabase.LoadAllAssetsAtPath(path)
                    .OfType<AnimationClip>()
                    .FirstOrDefault(c => !c.name.StartsWith("__preview__", StringComparison.OrdinalIgnoreCase));
                if (clip != null) return clip;
            }
            return null;
        }

        private static void NormalizeCharacterHeight(GameObject learner, float targetHeight)
        {
            Renderer[] renderers = learner.GetComponentsInChildren<Renderer>(true);
            if (renderers.Length == 0) return;
            Bounds bounds = renderers[0].bounds;
            for (int i = 1; i < renderers.Length; i++) bounds.Encapsulate(renderers[i].bounds);
            if (bounds.size.y < 0.01f) return;
            float factor = Mathf.Clamp(targetHeight / bounds.size.y, 0.05f, 20f);
            learner.transform.localScale *= factor;
        }

        private static void EnsureFolder(string path)
        {
            string[] pieces = path.Split('/');
            string current = pieces[0];
            for (int i = 1; i < pieces.Length; i++)
            {
                string next = $"{current}/{pieces[i]}";
                if (!AssetDatabase.IsValidFolder(next)) AssetDatabase.CreateFolder(current, pieces[i]);
                current = next;
            }
        }
    }
}
