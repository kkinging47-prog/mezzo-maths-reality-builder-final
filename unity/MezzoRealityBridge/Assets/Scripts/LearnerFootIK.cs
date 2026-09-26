using UnityEngine;

namespace Mezzo.RealityBridge
{
    [RequireComponent(typeof(Animator))]
    public sealed class LearnerFootIK : MonoBehaviour
    {
        [Header("References")]
        public Animator animator;
        public LearnerCrossingMotor motor;
        public Transform characterRoot;

        [Header("Foot Grounding")]
        [Range(0f, 1f)] public float ikWeight = 1f;
        public float rayStartHeight = 0.65f;
        public float rayDistance = 1.6f;
        public float footSurfaceOffset = 0.025f;
        public float positionSmoothness = 18f;
        public float rotationSmoothness = 16f;

        [Header("Pelvis")]
        [Range(0f, 1f)] public float pelvisWeight = 0.55f;
        public float pelvisSmoothness = 12f;
        public float maxPelvisAdjustment = 0.16f;

        private Vector3 _leftPosition;
        private Vector3 _rightPosition;
        private Quaternion _leftRotation = Quaternion.identity;
        private Quaternion _rightRotation = Quaternion.identity;
        private bool _leftValid;
        private bool _rightValid;
        private float _pelvisOffset;

        private void Awake()
        {
            if (animator == null) animator = GetComponent<Animator>();
            if (characterRoot == null) characterRoot = transform;
            if (motor == null) motor = GetComponent<LearnerCrossingMotor>();
        }

        private void OnAnimatorIK(int layerIndex)
        {
            if (animator == null || !animator.isHuman) return;

            float activeWeight = motor == null || motor.IsPlaying ? ikWeight : ikWeight * 0.75f;

            SolveFoot(AvatarIKGoal.LeftFoot, HumanBodyBones.LeftFoot, ref _leftPosition, ref _leftRotation, ref _leftValid);
            SolveFoot(AvatarIKGoal.RightFoot, HumanBodyBones.RightFoot, ref _rightPosition, ref _rightRotation, ref _rightValid);

            ApplyFoot(AvatarIKGoal.LeftFoot, _leftPosition, _leftRotation, _leftValid, activeWeight);
            ApplyFoot(AvatarIKGoal.RightFoot, _rightPosition, _rightRotation, _rightValid, activeWeight);
            ApplyPelvis(activeWeight);
        }

        private void SolveFoot(
            AvatarIKGoal goal,
            HumanBodyBones bone,
            ref Vector3 smoothedPosition,
            ref Quaternion smoothedRotation,
            ref bool valid)
        {
            Transform foot = animator.GetBoneTransform(bone);
            if (foot == null)
            {
                valid = false;
                return;
            }

            Vector3 origin = foot.position + Vector3.up * rayStartHeight;
            RaycastHit[] hits = Physics.RaycastAll(origin, Vector3.down, rayDistance, ~0, QueryTriggerInteraction.Ignore);

            bool found = false;
            RaycastHit best = default;
            float bestDistance = float.MaxValue;

            foreach (RaycastHit hit in hits)
            {
                if (characterRoot != null && hit.transform.IsChildOf(characterRoot)) continue;
                if (hit.distance >= bestDistance) continue;
                best = hit;
                bestDistance = hit.distance;
                found = true;
            }

            if (!found)
            {
                valid = false;
                return;
            }

            Vector3 targetPosition = best.point + best.normal * footSurfaceOffset;
            Vector3 forward = characterRoot != null ? characterRoot.forward : transform.forward;
            Vector3 planarForward = Vector3.ProjectOnPlane(forward, best.normal).normalized;
            if (planarForward.sqrMagnitude < 0.001f) planarForward = Vector3.ProjectOnPlane(transform.forward, best.normal).normalized;
            Quaternion targetRotation = Quaternion.LookRotation(planarForward, best.normal);

            float posT = 1f - Mathf.Exp(-positionSmoothness * Time.deltaTime);
            float rotT = 1f - Mathf.Exp(-rotationSmoothness * Time.deltaTime);

            if (!valid)
            {
                smoothedPosition = targetPosition;
                smoothedRotation = targetRotation;
            }
            else
            {
                smoothedPosition = Vector3.Lerp(smoothedPosition, targetPosition, posT);
                smoothedRotation = Quaternion.Slerp(smoothedRotation, targetRotation, rotT);
            }

            valid = true;
        }

        private void ApplyFoot(AvatarIKGoal goal, Vector3 position, Quaternion rotation, bool valid, float weight)
        {
            float applied = valid ? weight : 0f;
            animator.SetIKPositionWeight(goal, applied);
            animator.SetIKRotationWeight(goal, applied);
            if (!valid) return;

            animator.SetIKPosition(goal, position);
            animator.SetIKRotation(goal, rotation);
        }

        private void ApplyPelvis(float activeWeight)
        {
            if (!_leftValid && !_rightValid) return;

            float animatedLeftY = animator.GetIKPosition(AvatarIKGoal.LeftFoot).y;
            float animatedRightY = animator.GetIKPosition(AvatarIKGoal.RightFoot).y;

            float leftDelta = _leftValid ? _leftPosition.y - animatedLeftY : 0f;
            float rightDelta = _rightValid ? _rightPosition.y - animatedRightY : 0f;
            float desired = 0f;

            if (_leftValid && _rightValid) desired = Mathf.Min(leftDelta, rightDelta);
            else if (_leftValid) desired = leftDelta;
            else desired = rightDelta;

            desired = Mathf.Clamp(desired, -maxPelvisAdjustment, maxPelvisAdjustment) * pelvisWeight * activeWeight;
            float t = 1f - Mathf.Exp(-pelvisSmoothness * Time.deltaTime);
            _pelvisOffset = Mathf.Lerp(_pelvisOffset, desired, t);

            Vector3 body = animator.bodyPosition;
            body.y += _pelvisOffset;
            animator.bodyPosition = body;
        }
    }
}
