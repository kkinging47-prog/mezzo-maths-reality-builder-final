using UnityEngine;

namespace Mezzo.RealityBridge
{
    public sealed class PresentationCameraFollow : MonoBehaviour
    {
        public Transform learner;
        public LearnerCrossingMotor motor;

        [Header("Wide Shot")]
        public Vector3 widePosition = new(-8.8f, 5.6f, -11.8f);
        public Vector3 wideLookAt = new(0f, 1.05f, 0f);

        [Header("Crossing Shot")]
        public Vector3 followOffset = new(-4.2f, 2.9f, -5.8f);
        public Vector3 lookOffset = new(0.7f, 1.1f, 0f);

        [Header("Finish Shot")]
        public Vector3 finishPosition = new(7.8f, 3.0f, -5.0f);
        public Vector3 finishLookAt = new(6.4f, 1.2f, 0f);

        public float moveSmoothness = 3.0f;
        public float rotateSmoothness = 5.0f;

        private bool _wasPlaying;
        private float _finishTimer;

        private void LateUpdate()
        {
            if (learner == null || motor == null)
            {
                MoveTowards(widePosition, wideLookAt);
                return;
            }

            if (motor.IsPlaying)
            {
                _wasPlaying = true;
                _finishTimer = 0f;
                Vector3 desired = learner.position + followOffset;
                Vector3 target = learner.position + lookOffset;
                MoveTowards(desired, target);
                return;
            }

            if (_wasPlaying)
            {
                _finishTimer += Time.deltaTime;
                MoveTowards(finishPosition, finishLookAt);
                if (_finishTimer >= 3.5f)
                {
                    _wasPlaying = false;
                }
                return;
            }

            MoveTowards(widePosition, wideLookAt);
        }

        private void MoveTowards(Vector3 position, Vector3 lookAt)
        {
            float moveT = 1f - Mathf.Exp(-moveSmoothness * Time.deltaTime);
            float rotateT = 1f - Mathf.Exp(-rotateSmoothness * Time.deltaTime);
            transform.position = Vector3.Lerp(transform.position, position, moveT);
            Quaternion desiredRotation = Quaternion.LookRotation((lookAt - transform.position).normalized, Vector3.up);
            transform.rotation = Quaternion.Slerp(transform.rotation, desiredRotation, rotateT);
        }
    }
}
