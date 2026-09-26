using Mezzo.RealityBridge;
using UnityEditor;
using UnityEditor.Animations;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace Mezzo.EditorTools
{
    public static class FootIKInstaller
    {
        [MenuItem("Mezzo/Install Foot IK Polish")]
        public static void Install()
        {
            if (EditorApplication.isPlaying)
            {
                Debug.LogWarning("Stop Play Mode before installing foot IK.");
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

            if (!animator.isHuman)
            {
                Debug.LogError("MezzoLearner is not using a Humanoid avatar. Set the character Rig to Humanoid first.");
                return;
            }

            AnimatorController controller = animator.runtimeAnimatorController as AnimatorController;
            if (controller == null)
            {
                Debug.LogError("MezzoLearner is not using an editable AnimatorController.");
                return;
            }

            AnimatorControllerLayer[] layers = controller.layers;
            if (layers.Length > 0)
            {
                layers[0].iKPass = true;
                controller.layers = layers;
            }

            LearnerFootIK footIK = learner.GetComponent<LearnerFootIK>();
            if (footIK == null) footIK = learner.AddComponent<LearnerFootIK>();

            footIK.animator = animator;
            footIK.motor = motor;
            footIK.characterRoot = learner.transform;
            footIK.ikWeight = 1f;
            footIK.rayStartHeight = 0.65f;
            footIK.rayDistance = 1.6f;
            footIK.footSurfaceOffset = 0.025f;
            footIK.positionSmoothness = 18f;
            footIK.rotationSmoothness = 16f;
            footIK.pelvisWeight = 0.55f;
            footIK.pelvisSmoothness = 12f;
            footIK.maxPelvisAdjustment = 0.16f;

            EditorUtility.SetDirty(controller);
            EditorUtility.SetDirty(footIK);
            EditorSceneManager.MarkSceneDirty(SceneManager.GetActiveScene());
            EditorSceneManager.SaveScene(SceneManager.GetActiveScene());
            AssetDatabase.SaveAssets();

            Debug.Log("Foot IK polish installed. The learner's feet will now ground to the real bridge, stairs and approaches, with pelvis compensation.");
        }
    }
}
