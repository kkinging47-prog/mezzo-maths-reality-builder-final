using UnityEngine;

namespace Mezzo.RealityBridge
{
    public sealed class ImportedBridgeFinalVisual : MonoBehaviour
    {
        public BridgeStageController stageController;
        public GameObject importedBridge;
        public Renderer[] oldBridgeRenderers;

        private bool _lastDetailedState;
        private bool _initialized;

        private void Awake()
        {
            ApplyState(false, true);
        }

        private void LateUpdate()
        {
            if (stageController == null || importedBridge == null)
            {
                return;
            }

            bool detailed = stageController.CurrentStage >= 5 && !stageController.IsBusy;
            ApplyState(detailed, false);
        }

        private void ApplyState(bool detailed, bool force)
        {
            if (!force && _initialized && detailed == _lastDetailedState)
            {
                return;
            }

            _initialized = true;
            _lastDetailedState = detailed;

            if (importedBridge != null)
            {
                importedBridge.SetActive(detailed);
            }

            if (oldBridgeRenderers == null)
            {
                return;
            }

            foreach (Renderer renderer in oldBridgeRenderers)
            {
                if (renderer != null)
                {
                    renderer.enabled = !detailed;
                }
            }
        }
    }
}
