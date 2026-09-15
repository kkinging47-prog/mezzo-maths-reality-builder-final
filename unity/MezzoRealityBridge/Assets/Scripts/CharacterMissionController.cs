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

            ResetCharacter();
        }

        private void OnDestroy()
        {
            if (crossingTimeline != null)
            {
                crossingTimeline.stopped -= HandleTimelineStopped;
            }
        }

        public void PlayCrossing()
        {
            if (IsCrossing || crossingTimeline == null)
            {
                return;
            }

            IsCrossing = true;
            CrossingStarted?.Invoke();
            crossingTimeline.time = 0;
            crossingTimeline.Play();
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
    }
}
