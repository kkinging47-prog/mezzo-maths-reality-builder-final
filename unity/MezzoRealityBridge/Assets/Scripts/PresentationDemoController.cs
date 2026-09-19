using UnityEngine;

namespace Mezzo.RealityBridge
{
    public sealed class PresentationDemoController : MonoBehaviour
    {
        public FootbridgeMissionDirector mission;
        public bool autoStart = false;
        public float autoStageDelay = 2.4f;

        private float _timer;

        private void Start()
        {
            if (mission != null)
            {
                mission.ResetMission();
            }
        }

        private void Update()
        {
            if (mission == null)
            {
                return;
            }

            if (Input.GetKeyDown(KeyCode.R))
            {
                mission.ResetMission();
            }

            if (Input.GetKeyDown(KeyCode.Space) && !mission.IsBusy)
            {
                mission.BuildNextStage();
            }

            for (int i = 1; i <= 6; i++)
            {
                if (Input.GetKeyDown(KeyCode.Alpha0 + i) && !mission.IsBusy)
                {
                    mission.BuildStage(i);
                }
            }

            if (!autoStart || mission.IsBusy || mission.CurrentStage >= 5)
            {
                return;
            }

            _timer += Time.deltaTime;
            if (_timer >= autoStageDelay)
            {
                _timer = 0f;
                mission.BuildNextStage();
            }
        }
    }
}
