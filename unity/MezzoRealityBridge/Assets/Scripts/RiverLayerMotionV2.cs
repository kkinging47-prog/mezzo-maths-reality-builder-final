using UnityEngine;

namespace Mezzo.RealityBridge
{
    [RequireComponent(typeof(Renderer))]
    public sealed class RiverLayerMotionV2 : MonoBehaviour
    {
        public Vector2 uvSpeed = new Vector2(0.004f, 0.08f);
        public float verticalRipple = 0.0015f;
        public float verticalRippleSpeed = 1.1f;
        public float phase;

        private Renderer _renderer;
        private Material _material;
        private Vector3 _startLocalPosition;

        private void Awake()
        {
            _renderer = GetComponent<Renderer>();
            _material = _renderer.material;
            _startLocalPosition = transform.localPosition;
        }

        private void Update()
        {
            float t = Time.time + phase;
            Vector2 offset = uvSpeed * t;

            if (_material != null)
            {
                if (_material.HasProperty("_BaseMap"))
                    _material.SetTextureOffset("_BaseMap", offset);
                else if (_material.HasProperty("_MainTex"))
                    _material.SetTextureOffset("_MainTex", offset);
            }

            Vector3 p = _startLocalPosition;
            p.y += Mathf.Sin(t * verticalRippleSpeed) * verticalRipple;
            transform.localPosition = p;
        }
    }

    public sealed class RiverEddyMotionV2 : MonoBehaviour
    {
        public float degreesPerSecond = 7f;
        public float pulseAmount = 0.035f;
        public float pulseSpeed = 1.25f;
        public float phase;

        private Vector3 _baseScale;

        private void Awake()
        {
            _baseScale = transform.localScale;
        }

        private void Update()
        {
            transform.Rotate(0f, degreesPerSecond * Time.deltaTime, 0f, Space.Self);
            float pulse = 1f + Mathf.Sin((Time.time + phase) * pulseSpeed) * pulseAmount;
            transform.localScale = _baseScale * pulse;
        }
    }
}
