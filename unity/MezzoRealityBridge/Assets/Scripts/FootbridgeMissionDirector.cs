using System;
using UnityEngine;

namespace Mezzo.RealityBridge
{
    public sealed class FootbridgeMissionDirector : MonoBehaviour
    {
        public BridgeStageController bridge;
        public CharacterMissionController character;

        public int CurrentStage { get; private set; }
        public bool IsBusy => (bridge != null && bridge.IsBusy) || (character != null && character.IsCrossing);

        public event Action<int> MissionStageCompleted;
        public event Action MissionCompleted;

        private void OnEnable()
        {
            if (bridge != null)
            {
                bridge.StageCompleted += HandleBridgeStageCompleted;
            }

            if (character != null)
            {
                character.CrossingCompleted += HandleCrossingCompleted;
            }
        }

        private void OnDisable()
        {
            if (bridge != null)
            {
                bridge.StageCompleted -= HandleBridgeStageCompleted;
            }

            if (character != null)
            {
                character.CrossingCompleted -= HandleCrossingCompleted;
            }
        }

        public void ResetMission()
        {
            CurrentStage = 0;
            bridge?.ResetBridgeImmediate();
            character?.ResetCharacter();
        }

        public void BuildStage(int stage)
        {
            stage = Mathf.Clamp(stage, 0, 6);

            if (stage == 0)
            {
                ResetMission();
                return;
            }

            if (IsBusy || stage <= CurrentStage)
            {
                return;
            }

            if (stage <= 5)
            {
                bridge?.BuildStage(stage);
                return;
            }

            if (bridge != null && bridge.CurrentStage < 5)
            {
                bridge.BuildStage(5);
                return;
            }

            CurrentStage = 6;
            character?.PlayCrossing();
        }

        public void BuildNextStage()
        {
            BuildStage(CurrentStage + 1);
        }

        private void HandleBridgeStageCompleted(int stage)
        {
            CurrentStage = Mathf.Max(CurrentStage, stage);
            MissionStageCompleted?.Invoke(stage);
        }

        private void HandleCrossingCompleted()
        {
            CurrentStage = 6;
            MissionStageCompleted?.Invoke(6);
            MissionCompleted?.Invoke();
        }
    }
}
