using System;
using UnityEngine;

namespace Mezzo.RealityBridge
{
    public sealed class LearnerCrossingMotor : MonoBehaviour
    {
        [Header("References")]
        public Animator animator;
        public Transform characterRoot;
        public Transform startPoint;

        [Header("Animator States")]
        public string idleState = "Idle";
        public string walkState = "Walk";
        public string climbState = "";
        public string descendState = "";
        public string celebrateState = "Celebrate";

        [Header("Crossing")]
        public float approachSpeed = 1.35f;
        public float stairSpeed = 1.05f;
        public float deckSpeed = 1.45f;
        public float exitSpeed = 1.30f;
        public float startX = -7.0f;
        public float leftStairStartX = -4.82f;
        public float leftDeckX = -3.25f;
        public float rightDeckX = 3.25f;
        public float rightStairEndX = 4.82f;
        public float finishX = 7.0f;
        public float bankY = 0.35f;
        public float deckY = 1.28f;
        public float pathZ = 0f;
        public float facingY = 90f;
        public int stairCount = 6;
        public float verticalSmoothing = 10f;

        public bool IsPlaying { get; private set; }
        public event Action Completed;
        public event Action CrossingStarted;

        private string _activeState = "";

        private void Awake()
        {
            if (characterRoot == null) characterRoot = transform;
            if (animator == null) animator = GetComponentInChildren<Animator>();
            if (animator != null) animator.applyRootMotion = false;
        }

        private void Update()
        {
            if (!IsPlaying || characterRoot == null) return;

            float speed = CurrentSpeed(characterRoot.position.x);
            Vector3 position = characterRoot.position;
            position.x = Mathf.MoveTowards(position.x, finishX, speed * Time.deltaTime);

            float targetY = FootHeight(position.x);
            position.y = Mathf.Lerp(position.y, targetY, 1f - Mathf.Exp(-verticalSmoothing * Time.deltaTime));
            position.z = pathZ;
            characterRoot.position = position;
            characterRoot.rotation = Quaternion.Slerp(
                characterRoot.rotation,
                Quaternion.Euler(0f, facingY, 0f),
                1f - Mathf.Exp(-10f * Time.deltaTime));

            UpdateAnimationForPosition(position.x);

            if (position.x >= finishX - 0.01f)
            {
                characterRoot.position = new Vector3(finishX, bankY, pathZ);
                IsPlaying = false;
                CrossFade(celebrateState, 0.20f);
                Completed?.Invoke();
            }
        }

        public void PlayCrossing()
        {
            if (IsPlaying || characterRoot == null) return;
            IsPlaying = true;
            CrossingStarted?.Invoke();
            CrossFade(walkState, 0.15f);
        }

        public void ResetMotor()
        {
            IsPlaying = false;
            _activeState = "";

            if (characterRoot != null)
            {
                if (startPoint != null)
                {
                    characterRoot.SetPositionAndRotation(startPoint.position, startPoint.rotation);
                    startX = startPoint.position.x;
                    bankY = startPoint.position.y;
                    pathZ = startPoint.position.z;
                }
                else
                {
                    characterRoot.position = new Vector3(startX, bankY, pathZ);
                    characterRoot.rotation = Quaternion.Euler(0f, facingY, 0f);
                }
            }

            CrossFade(idleState, 0.10f);
        }

        public void PlayCelebration() => CrossFade(celebrateState, 0.15f);

        private float CurrentSpeed(float x)
        {
            if (x < leftStairStartX) return approachSpeed;
            if (x < leftDeckX) return stairSpeed;
            if (x <= rightDeckX) return deckSpeed;
            if (x < rightStairEndX) return stairSpeed;
            return exitSpeed;
        }

        private void UpdateAnimationForPosition(float x)
        {
            if (x >= leftStairStartX && x < leftDeckX && !string.IsNullOrWhiteSpace(climbState))
            {
                CrossFade(climbState, 0.12f);
                return;
            }

            if (x > rightDeckX && x < rightStairEndX && !string.IsNullOrWhiteSpace(descendState))
            {
                CrossFade(descendState, 0.12f);
                return;
            }

            CrossFade(walkState, 0.12f);
        }

        private float FootHeight(float x)
        {
            if (x <= leftStairStartX) return bankY;

            if (x < leftDeckX)
            {
                float t = Mathf.InverseLerp(leftStairStartX, leftDeckX, x);
                return SteppedHeight(bankY, deckY, t, stairCount);
            }

            if (x <= rightDeckX) return deckY;

            if (x < rightStairEndX)
            {
                float t = Mathf.InverseLerp(rightDeckX, rightStairEndX, x);
                return SteppedHeight(deckY, bankY, t, stairCount);
            }

            return bankY;
        }

        private static float SteppedHeight(float from, float to, float t, int steps)
        {
            steps = Mathf.Max(1, steps);
            t = Mathf.Clamp01(t);
            float scaled = t * steps;
            int index = Mathf.Min(Mathf.FloorToInt(scaled), steps - 1);
            float local = scaled - index;
            local = local * local * (3f - 2f * local);
            float stepT = (index + local) / steps;
            return Mathf.Lerp(from, to, stepT);
        }

        private void CrossFade(string stateName, float duration)
        {
            if (animator == null || string.IsNullOrWhiteSpace(stateName)) return;
            if (_activeState == stateName) return;
            _activeState = stateName;
            animator.CrossFadeInFixedTime(stateName, duration, 0);
        }
    }
}
