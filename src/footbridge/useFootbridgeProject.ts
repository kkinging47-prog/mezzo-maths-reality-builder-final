import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { decisionsForMission } from './decisionCatalog';
import { generateFootbridgeScenario } from './scenarioEngine';
import { clearFootbridgeState, createInitialFootbridgeState, loadFootbridgeState, nextMission, saveFootbridgeState } from './state';
import { DecisionRecord, FootbridgeProjectState, MissionId, MisconceptionTag } from './types';

function makeSeed() {
  const random = Math.floor(Math.random() * 0xffffffff);
  return ((Date.now() & 0xffffffff) ^ random) >>> 0;
}

export function useFootbridgeProject() {
  const [state, setState] = useState<FootbridgeProjectState>(() => {
    const saved = loadFootbridgeState();
    return saved ?? createInitialFootbridgeState(generateFootbridgeScenario(makeSeed(), 2));
  });
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [working, setWorking] = useState<Record<number, string>>({});
  const [feedback, setFeedback] = useState<Record<number, string>>({});

  useEffect(() => saveFootbridgeState(state), [state]);

  const completedCount = useMemo(
    () => Object.values(state.decisionRecords).filter((record) => record.completed).length,
    [state.decisionRecords],
  );
  const progressPercent = Math.round((completedCount / 30) * 100);

  function recordFor(id: number): DecisionRecord {
    return state.decisionRecords[id];
  }

  function setResponse(key: string | number, value: string) {
    setResponses((current) => ({ ...current, [String(key)]: value }));
  }

  function response(key: string | number) {
    return responses[String(key)] ?? '';
  }

  function setWorkingText(id: number, value: string) {
    setWorking((current) => ({ ...current, [id]: value }));
  }

  function setDecisionFeedback(id: number, message: string) {
    setFeedback((current) => ({ ...current, [id]: message }));
  }

  function recordAttempt(
    id: number,
    answer: string | number | boolean | null,
    correct: boolean,
    options: {
      misconceptionTag?: MisconceptionTag;
      notebookSection?: string;
      notebookEntry?: string;
      completeOnAttempt?: boolean;
    } = {},
  ) {
    setState((current) => {
      const previous = current.decisionRecords[id];
      const now = new Date().toISOString();
      const completeNow = correct || Boolean(options.completeOnAttempt);
      const attempt = {
        attemptNumber: previous.attempts.length + 1,
        answer,
        working: working[id] || undefined,
        correct,
        createdAt: now,
        hintLevelAtAttempt: previous.highestHintLevel,
        misconceptionTag: options.misconceptionTag,
      };
      const updatedRecord: DecisionRecord = {
        ...previous,
        completed: previous.completed || completeNow,
        firstStartedAt: previous.firstStartedAt ?? now,
        completedAt: completeNow ? previous.completedAt ?? now : previous.completedAt,
        attempts: [...previous.attempts, attempt],
        originalAnswer: previous.originalAnswer ?? answer,
        revisedAnswer: previous.attempts.length > 0 ? answer : previous.revisedAnswer,
      };
      const shouldWriteNotebook = Boolean(options.notebookSection && options.notebookEntry && completeNow && !previous.completed);
      const nextNotebook = shouldWriteNotebook
        ? {
            ...current.notebook,
            [options.notebookSection!]: [
              ...(current.notebook[options.notebookSection!] ?? []),
              options.notebookEntry!,
            ],
          }
        : current.notebook;
      const nextTags = options.misconceptionTag && !correct && !current.misconceptionTags.includes(options.misconceptionTag)
        ? [...current.misconceptionTags, options.misconceptionTag]
        : current.misconceptionTags;
      return {
        ...current,
        decisionRecords: { ...current.decisionRecords, [id]: updatedRecord },
        notebook: nextNotebook,
        misconceptionTags: nextTags,
        updatedAt: now,
      };
    });
  }

  function useHint(id: number) {
    setState((current) => {
      const previous = current.decisionRecords[id];
      const level = Math.min(4, previous.highestHintLevel + 1);
      return {
        ...current,
        decisionRecords: {
          ...current.decisionRecords,
          [id]: { ...previous, hintsUsed: previous.hintsUsed + 1, highestHintLevel: level },
        },
      };
    });
  }

  function missionComplete(missionId: MissionId) {
    return decisionsForMission(missionId).every((decision) => state.decisionRecords[decision.id]?.completed);
  }

  function unlockNextMission() {
    setState((current) => {
      const next = nextMission(current.currentMission);
      return {
        ...current,
        currentMission: next,
        highestUnlockedMission: Math.max(current.highestUnlockedMission, next) as MissionId,
      };
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function startNewScenario() {
    if (!window.confirm('Start a new community project? Your current local Footbridge project will be replaced.')) return;
    clearFootbridgeState();
    const fresh = createInitialFootbridgeState(generateFootbridgeScenario(makeSeed(), state.scenario.difficultyLevel));
    setState(fresh);
    setResponses({});
    setWorking({});
    setFeedback({});
  }

  function updateCalculatedQuantity(key: string, value: number) {
    setState((current) => ({
      ...current,
      calculatedQuantities: { ...current.calculatedQuantities, [key]: value },
    }));
  }

  return {
    state,
    setState: setState as Dispatch<SetStateAction<FootbridgeProjectState>>,
    responses,
    response,
    setResponse,
    working,
    setWorkingText,
    feedback,
    setDecisionFeedback,
    recordAttempt,
    recordFor,
    useHint,
    missionComplete,
    unlockNextMission,
    startNewScenario,
    updateCalculatedQuantity,
    completedCount,
    progressPercent,
  };
}

export type FootbridgeController = ReturnType<typeof useFootbridgeProject>;
