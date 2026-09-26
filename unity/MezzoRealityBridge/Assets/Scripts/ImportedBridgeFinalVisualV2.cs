using UnityEngine;

namespace Mezzo.RealityBridge
{
    public sealed class ImportedBridgeFinalVisualV2 : MonoBehaviour
    {
        public BridgeStageController stageController;
        public GameObject importedBridge;
        public Renderer[] oldBridgeRenderers;

        private bool lastState;
        private bool initialized;

        private void Awake()
        {
            SetDetailed(false, true);
        }

        private void LateUpdate()
        {
            if (stageController == null || importedBridge == null) return;
            bool showDetailed = stageController.CurrentStage >= 5 && !stageController.IsBusy;
            SetDetailed(showDetailed, false);
        }

        private void SetDetailed(bool detailed, bool force)
        {
            if (!force && initialized && detailed == lastState) return;

            initialized = true;
            lastState = detailed;

            if (importedBridge != null)
                importedBridge.SetActive(detailed);

            if (oldBridgeRenderers == null) return;

            foreach (Renderer r in oldBridgeRenderers)
            {
                if (r != null) r.enabled = !detailed;
            }
        }
    }
}
