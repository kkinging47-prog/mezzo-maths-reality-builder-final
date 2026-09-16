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
        public string celebrateState = "Celebrate";

        [Header("Crossing")]
        public float walkSpeed = 1.45f;
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

        public bool IsPlaying { get; private set; }
        public event Action Completed;

        private void Awake()
        {
            if (characterRoot == null)
            {
                characterRoot = transform;
            }

            if (animator == null)
            {
                animator = GetComponentInChildren<Animator>();
            }

            if (animator != null)
            {
                animator.applyRootMotion = false;
            }
        }

        private void Update()
        {
            if (!IsPlaying || characterRoot == null)
            {
                return;
            }

            Vector3 position = characterRoot.position;
            position.x = Mathf.MoveTowards(position.x, finishX, walkSpeed * Time.deltaTime);
            position.y = FootHeight(position.x);
            position.z = pathZ;
            characterRoot.position = position;
            characterRoot.rotation = Quaternion.Euler(0f, facingY, 0f);

            if (position.x >= finishX - 0.01f)
            {
                IsPlaying = false;
                CrossFade(celebrateState, 0.18f);
                Completed?.Invoke();
            }
        }

        public void PlayCrossing()
        {
            if (IsPlaying || characterRoot == null)
            {
                return;
            }

            IsPlaying = true;
            CrossFade(walkState, 0.15f);
        }

        public void ResetMotor()
        {
            IsPlaying = false;

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

            CrossFade(idleState, 0.1f);
        }

        public void PlayCelebration()
        {
            CrossFade(celebrateState, 0.15f);
        }

        private float FootHeight(float x)
        {
            if (x <= leftStairStartX)
            {
                return bankY;
            }

            if (x < leftDeckX)
            {
                float t = Mathf.InverseLerp(leftStairStartX, leftDeckX, x);
                return Mathf.Lerp(bankY, deckY, t);
            }

            if (x <= rightDeckX)
            {
                return deckY;
            }

            if (x < rightStairEndX)
            {
                float t = Mathf.InverseLerp(rightDeckX, rightStairEndX, x);
                return Mathf.Lerp(deckY, bankY, t);
            }

            return bankY;
        }

        private void CrossFade(string stateName, float duration)
        {
            if (animator == null || string.IsNullOrWhiteSpace(stateName))
            {
                return;
            }

            animator.CrossFadeInFixedTime(stateName, duration, 0);
        }
    }
}
