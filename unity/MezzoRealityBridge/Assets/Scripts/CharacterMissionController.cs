using System;
using UnityEngine;
using UnityEngine.Playables;

namespace Mezzo.RealityBridge
{
    public sealed class CharacterMissionController : MonoBehaviour
    {
        [Header("Character")]
        public Animator animator;
        public Transform characterRoot;
        public Transform startPoint;
        public LearnerCrossingMotor crossingMotor;

        [Header("Presentation Sequence")]
        public PlayableDirector crossingTimeline;

        [Header("Animator Parameters")]
        public string idleTrigger = "Idle";
        public string celebrateTrigger = "Celebrate";

        public bool IsCrossing { get; private set; }

        public event Action CrossingStarted;
        public event Action CrossingCompleted;

        private void Awake()
        {
            if (crossingTimeline != null)
            {
                crossingTimeline.stopped += HandleTimelineStopped;
            }

            if (crossingMotor != null)
            {
                crossingMotor.Completed += HandleMotorCompleted;
            }

            ResetCharacter();
        }

        private void OnDestroy()
        {
            if (crossingTimeline != null)
            {
                crossingTimeline.stopped -= HandleTimelineStopped;
            }

            if (crossingMotor != null)
            {
                crossingMotor.Completed -= HandleMotorCompleted;
            }
        }

        public void PlayCrossing()
        {
            if (IsCrossing)
            {
                return;
            }

            if (crossingTimeline != null)
            {
                IsCrossing = true;
                CrossingStarted?.Invoke();
                crossingTimeline.time = 0;
                crossingTimeline.Play();
                return;
            }

            if (crossingMotor != null)
            {
                IsCrossing = true;
                CrossingStarted?.Invoke();
                crossingMotor.PlayCrossing();
            }
        }

        public void ResetCharacter()
        {
            IsCrossing = false;

            if (crossingTimeline != null)
            {
                crossingTimeline.Stop();
                crossingTimeline.time = 0;
                crossingTimeline.Evaluate();
            }

            if (crossingMotor != null)
            {
                crossingMotor.ResetMotor();
                return;
            }

            if (characterRoot != null && startPoint != null)
            {
                characterRoot.SetPositionAndRotation(startPoint.position, startPoint.rotation);
            }

            if (animator != null && !string.IsNullOrWhiteSpace(idleTrigger))
            {
                animator.ResetTrigger(celebrateTrigger);
                animator.SetTrigger(idleTrigger);
            }
        }

        public void TriggerCelebration()
        {
            if (crossingMotor != null)
            {
                crossingMotor.PlayCelebration();
                return;
            }

            if (animator != null && !string.IsNullOrWhiteSpace(celebrateTrigger))
            {
                animator.SetTrigger(celebrateTrigger);
            }
        }

        private void HandleTimelineStopped(PlayableDirector director)
        {
            if (!IsCrossing)
            {
                return;
            }

            IsCrossing = false;
            TriggerCelebration();
            CrossingCompleted?.Invoke();
        }

        private void HandleMotorCompleted()
        {
            if (!IsCrossing)
            {
                return;
            }

            IsCrossing = false;
            TriggerCelebration();
            CrossingCompleted?.Invoke();
        }
    }
}
