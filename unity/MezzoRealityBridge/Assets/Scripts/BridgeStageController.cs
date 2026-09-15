using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace Mezzo.RealityBridge
{
    public sealed class BridgeStageController : MonoBehaviour
    {
        [Serializable]
        public sealed class StageGroup
        {
            public string label;
            public GameObject[] objects;
        }

        [Header("Stage Groups")]
        public StageGroup survey;
        public StageGroup foundationsAndPillars;
        public StageGroup beams;
        public StageGroup deckPlanks;
        public StageGroup railsAndStairs;

        [Header("Animation")]
        [Min(0.05f)] public float pieceDuration = 0.38f;
        [Min(0f)] public float delayBetweenPieces = 0.08f;
        [Min(0.05f)] public float riseDistance = 0.8f;

        public int CurrentStage { get; private set; }
        public bool IsBusy { get; private set; }

        public event Action<int> StageStarted;
        public event Action<int> StageCompleted;

        private readonly Dictionary<Transform, Vector3> _finalPositions = new();
        private Coroutine _activeRoutine;

        private void Awake()
        {
            CacheFinalTransforms();
            ResetBridgeImmediate();
        }

        public void ResetBridgeImmediate()
        {
            if (_activeRoutine != null)
            {
                StopCoroutine(_activeRoutine);
                _activeRoutine = null;
            }

            IsBusy = false;
            CurrentStage = 0;
            SetGroupVisible(survey, false);
            SetGroupVisible(foundationsAndPillars, false);
            SetGroupVisible(beams, false);
            SetGroupVisible(deckPlanks, false);
            SetGroupVisible(railsAndStairs, false);
        }

        public void BuildStage(int stage)
        {
            stage = Mathf.Clamp(stage, 0, 5);
            if (IsBusy || stage <= CurrentStage)
            {
                return;
            }

            if (_activeRoutine != null)
            {
                StopCoroutine(_activeRoutine);
            }

            _activeRoutine = StartCoroutine(BuildToStage(stage));
        }

        public void BuildNextStage()
        {
            BuildStage(CurrentStage + 1);
        }

        private IEnumerator BuildToStage(int targetStage)
        {
            IsBusy = true;

            for (int stage = CurrentStage + 1; stage <= targetStage; stage++)
            {
                StageStarted?.Invoke(stage);
                yield return AnimateStage(GetStage(stage));
                CurrentStage = stage;
                StageCompleted?.Invoke(stage);
            }

            IsBusy = false;
            _activeRoutine = null;
        }

        private IEnumerator AnimateStage(StageGroup stage)
        {
            if (stage?.objects == null)
            {
                yield break;
            }

            foreach (GameObject item in stage.objects)
            {
                if (item == null)
                {
                    continue;
                }

                Transform t = item.transform;
                Vector3 finalPosition = _finalPositions.TryGetValue(t, out Vector3 cached)
                    ? cached
                    : t.localPosition;

                Vector3 startPosition = finalPosition + Vector3.down * riseDistance;
                Vector3 finalScale = t.localScale;

                t.localPosition = startPosition;
                t.localScale = finalScale * 0.92f;
                item.SetActive(true);

                float elapsed = 0f;
                while (elapsed < pieceDuration)
                {
                    elapsed += Time.deltaTime;
                    float p = Mathf.Clamp01(elapsed / pieceDuration);
                    float eased = 1f - Mathf.Pow(1f - p, 3f);
                    t.localPosition = Vector3.LerpUnclamped(startPosition, finalPosition, eased);
                    t.localScale = Vector3.LerpUnclamped(finalScale * 0.92f, finalScale, eased);
                    yield return null;
                }

                t.localPosition = finalPosition;
                t.localScale = finalScale;

                if (delayBetweenPieces > 0f)
                {
                    yield return new WaitForSeconds(delayBetweenPieces);
                }
            }
        }

        private void CacheFinalTransforms()
        {
            CacheGroup(survey);
            CacheGroup(foundationsAndPillars);
            CacheGroup(beams);
            CacheGroup(deckPlanks);
            CacheGroup(railsAndStairs);
        }

        private void CacheGroup(StageGroup stage)
        {
            if (stage?.objects == null)
            {
                return;
            }

            foreach (GameObject item in stage.objects)
            {
                if (item != null)
                {
                    _finalPositions[item.transform] = item.transform.localPosition;
                }
            }
        }

        private static void SetGroupVisible(StageGroup stage, bool visible)
        {
            if (stage?.objects == null)
            {
                return;
            }

            foreach (GameObject item in stage.objects)
            {
                if (item != null)
                {
                    item.SetActive(visible);
                }
            }
        }

        private StageGroup GetStage(int stage)
        {
            return stage switch
            {
                1 => survey,
                2 => foundationsAndPillars,
                3 => beams,
                4 => deckPlanks,
                5 => railsAndStairs,
                _ => null
            };
        }
    }
}
