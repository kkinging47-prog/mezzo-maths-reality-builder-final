using UnityEngine;

namespace Mezzo.RealityBridge
{
    [RequireComponent(typeof(Renderer))]
    public sealed class RiverCurrentAnimator : MonoBehaviour
    {
        [Tooltip("UV movement per second. Positive Y makes the current travel along the river's Z direction on a Unity Plane.")]
        public Vector2 flowSpeed = new Vector2(0.01f, 0.085f);
        public float secondaryWave = 0.006f;
        public float waveSpeed = 1.2f;
        public float startPhase;

        private Renderer _renderer;
        private Material _material;
        private Vector3 _startPosition;

        private void Awake()
        {
            _renderer = GetComponent<Renderer>();
            _material = _renderer.material;
            _startPosition = transform.localPosition;
        }

        private void Update()
        {
            float t = Time.time + startPhase;
            Vector2 offset = flowSpeed * t;

            if (_material != null)
            {
                if (_material.HasProperty("_BaseMap"))
                    _material.SetTextureOffset("_BaseMap", offset);
                else if (_material.HasProperty("_MainTex"))
                    _material.SetTextureOffset("_MainTex", offset);
            }

            Vector3 p = _startPosition;
            p.y += Mathf.Sin(t * waveSpeed) * secondaryWave;
            transform.localPosition = p;
        }
    }
}
