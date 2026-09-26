using System;
using System.Runtime.InteropServices;
using UnityEngine;

namespace Mezzo.RealityBridge
{
    public sealed class ReactBridge : MonoBehaviour
    {
        [Serializable]
        private sealed class StageCommand
        {
            public int stage;
        }

        [Serializable]
        private sealed class UnityEventPayload
        {
            public string type;
            public int stage;
            public string message;
        }

        public FootbridgeMissionDirector mission;

#if UNITY_WEBGL && !UNITY_EDITOR
        [DllImport("__Internal")]
        private static extern void MezzoSendEvent(string json);
#endif

        private void OnEnable()
        {
            if (mission == null)
            {
                return;
            }

            mission.MissionStageCompleted += HandleStageCompleted;
            mission.MissionCompleted += HandleMissionCompleted;
        }

        private void OnDisable()
        {
            if (mission == null)
            {
                return;
            }

            mission.MissionStageCompleted -= HandleStageCompleted;
            mission.MissionCompleted -= HandleMissionCompleted;
        }

        // Called from JavaScript:
        // unityInstance.SendMessage('ReactBridge', 'BuildStageFromWeb', '{"stage":3}')
        public void BuildStageFromWeb(string json)
        {
            if (mission == null)
            {
                return;
            }

            StageCommand command = JsonUtility.FromJson<StageCommand>(json);
            mission.BuildStage(command.stage);
        }

        public void ResetFromWeb()
        {
            mission?.ResetMission();
            SendEvent("mission-reset", 0, "Footbridge mission reset.");
        }

        private void HandleStageCompleted(int stage)
        {
            SendEvent("stage-completed", stage, $"Footbridge stage {stage} completed.");
        }

        private void HandleMissionCompleted()
        {
            SendEvent("mission-completed", 6, "Learner crossed the bridge safely.");
        }

        private static void SendEvent(string type, int stage, string message)
        {
            string json = JsonUtility.ToJson(new UnityEventPayload
            {
                type = type,
                stage = stage,
                message = message
            });

#if UNITY_WEBGL && !UNITY_EDITOR
            MezzoSendEvent(json);
#else
            Debug.Log($"[ReactBridge] {json}");
#endif
        }
    }
}
