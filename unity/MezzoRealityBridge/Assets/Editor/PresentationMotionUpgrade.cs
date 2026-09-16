using Mezzo.RealityBridge;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace Mezzo.EditorTools
{
    public static class PresentationMotionUpgrade
    {
        [MenuItem("Mezzo/Upgrade Learner Motion & Camera")]
        public static void Upgrade()
        {
            if (EditorApplication.isPlaying)
            {
                Debug.LogWarning("Stop Play Mode before running the motion upgrade.");
                return;
            }

            GameObject learner = GameObject.Find("MezzoLearner");
            if (learner == null)
            {
                Debug.LogError("MezzoLearner was not found. Run Mezzo > Install Rigged Learner Crossing first.");
                return;
            }

            LearnerCrossingMotor motor = learner.GetComponent<LearnerCrossingMotor>();
            if (motor == null)
            {
                Debug.LogError("LearnerCrossingMotor was not found on MezzoLearner.");
                return;
            }

            motor.approachSpeed = 1.35f;
            motor.stairSpeed = 1.05f;
            motor.deckSpeed = 1.45f;
            motor.exitSpeed = 1.30f;
            motor.stairCount = 6;
            motor.verticalSmoothing = 10f;
            motor.leftStairStartX = -4.82f;
            motor.leftDeckX = -3.25f;
            motor.rightDeckX = 3.25f;
            motor.rightStairEndX = 4.82f;
            motor.finishX = 7.0f;
            motor.deckY = 1.28f;
            motor.facingY = 90f;

            GameObject cameraObject = GameObject.Find("PresentationCamera");
            if (cameraObject == null && Camera.main != null)
                cameraObject = Camera.main.gameObject;

            if (cameraObject == null)
            {
                Debug.LogError("Presentation camera was not found.");
                return;
            }

            PresentationCameraFollow follow = cameraObject.GetComponent<PresentationCameraFollow>();
            if (follow == null)
                follow = cameraObject.AddComponent<PresentationCameraFollow>();

            follow.learner = learner.transform;
            follow.motor = motor;
            follow.widePosition = new Vector3(-8.8f, 5.6f, -11.8f);
            follow.wideLookAt = new Vector3(0f, 1.05f, 0f);
            follow.followOffset = new Vector3(-4.2f, 2.9f, -5.8f);
            follow.lookOffset = new Vector3(0.7f, 1.1f, 0f);
            follow.finishPosition = new Vector3(7.8f, 3.0f, -5.0f);
            follow.finishLookAt = new Vector3(6.4f, 1.2f, 0f);
            follow.moveSmoothness = 3.0f;
            follow.rotateSmoothness = 5.0f;

            EditorUtility.SetDirty(motor);
            EditorUtility.SetDirty(follow);
            EditorSceneManager.MarkSceneDirty(SceneManager.GetActiveScene());
            EditorSceneManager.SaveScene(SceneManager.GetActiveScene());

            Debug.Log("Learner motion and cinematic follow camera upgraded. Build stages 1-5, then stage 6 to test the refined crossing.");
        }
    }
}
