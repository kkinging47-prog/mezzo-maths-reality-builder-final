using System;
using System.Linq;
using Mezzo.RealityBridge;
using UnityEditor;
using UnityEditor.Animations;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace Mezzo.EditorTools
{
    public static class StairAnimationInstaller
    {
        private const string CharacterFolder = "Assets/Models/Character";

        [MenuItem("Mezzo/Install Stair Animations")]
        public static void Install()
        {
            if (EditorApplication.isPlaying)
            {
                Debug.LogWarning("Stop Play Mode before installing stair animations.");
                return;
            }

            GameObject learner = GameObject.Find("MezzoLearner");
            if (learner == null)
            {
                Debug.LogError("MezzoLearner was not found. Open FootbridgePresentation first.");
                return;
            }

            Animator animator = learner.GetComponent<Animator>();
            LearnerCrossingMotor motor = learner.GetComponent<LearnerCrossingMotor>();
            if (animator == null || motor == null)
            {
                Debug.LogError("Animator or LearnerCrossingMotor is missing from MezzoLearner.");
                return;
            }

            AnimationClip climb = FindClip(new[] { "stairsup", "stairup", "climbstairs", "upstairs", "stepup" });
            AnimationClip descend = FindClip(new[] { "stairsdown", "stairdown", "descendstairs", "downstairs", "stepdown" });

            if (climb == null || descend == null)
            {
                Debug.LogError("Could not find both stair clips. Rename the FBX files so the filenames contain 'StairsUp' and 'StairsDown' (for example Ch17@StairsUp.fbx and Ch17@StairsDown.fbx), then run this command again.");
                return;
            }

            AnimatorController controller = animator.runtimeAnimatorController as AnimatorController;
            if (controller == null)
            {
                Debug.LogError("MezzoLearner is not using an editable AnimatorController.");
                return;
            }

            AnimatorStateMachine machine = controller.layers[0].stateMachine;
            SetOrCreateState(machine, "ClimbStairs", climb);
            SetOrCreateState(machine, "DescendStairs", descend);

            motor.climbState = "ClimbStairs";
            motor.descendState = "DescendStairs";
            motor.stairSpeed = 1.0f;

            EditorUtility.SetDirty(controller);
            EditorUtility.SetDirty(motor);
            EditorSceneManager.MarkSceneDirty(SceneManager.GetActiveScene());
            EditorSceneManager.SaveScene(SceneManager.GetActiveScene());
            AssetDatabase.SaveAssets();

            Debug.Log($"Stair animations installed: UP={climb.name}, DOWN={descend.name}. Stage 6 will now use dedicated stair motion.");
        }

        private static void SetOrCreateState(AnimatorStateMachine machine, string stateName, AnimationClip clip)
        {
            AnimatorState state = machine.states
                .Select(s => s.state)
                .FirstOrDefault(s => s.name == stateName);

            if (state == null) state = machine.AddState(stateName);
            state.motion = clip;
        }

        private static AnimationClip FindClip(string[] keywords)
        {
            foreach (string guid in AssetDatabase.FindAssets("t:Model", new[] { CharacterFolder }))
            {
                string path = AssetDatabase.GUIDToAssetPath(guid);
                string normalized = path.ToLowerInvariant().Replace(" ", "").Replace("-", "").Replace("_", "");
                if (!keywords.Any(k => normalized.Contains(k))) continue;

                AnimationClip clip = AssetDatabase.LoadAllAssetsAtPath(path)
                    .OfType<AnimationClip>()
                    .FirstOrDefault(c => !c.name.StartsWith("__preview__", StringComparison.OrdinalIgnoreCase));
                if (clip != null) return clip;
            }
            return null;
        }
    }
}
