using UnityEngine;

namespace Mezzo.RealityBridge
{
    [RequireComponent(typeof(Renderer))]
    public sealed class WaterSurfaceMotion : MonoBehaviour
    {
        public Vector2 scrollSpeed = new(0.018f, 0.007f);
        public float bobAmplitude = 0.015f;
        public float bobSpeed = 0.65f;

        private Renderer _renderer;
        private Material _material;
        private Vector3 _startPosition;

        private void Awake()
        {
            _renderer = GetComponent<Renderer>();
            _material = _renderer.material;
            _startPosition = transform.position;
        }

        private void Update()
        {
            if (_material != null)
            {
                Vector2 offset = scrollSpeed * Time.time;
                if (_material.HasProperty("_BaseMap"))
                {
                    _material.SetTextureOffset("_BaseMap", offset);
                }
                else if (_material.HasProperty("_MainTex"))
                {
                    _material.SetTextureOffset("_MainTex", offset);
                }
            }

            Vector3 p = _startPosition;
            p.y += Mathf.Sin(Time.time * bobSpeed) * bobAmplitude;
            transform.position = p;
        }
    }
}
