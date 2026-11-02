/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useCallback } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { ManagerQuestionBar } from './components/ManagerQuestionBar';
import { WorkflowDiagram } from './components/WorkflowDiagram';
import { StepReviewControls } from './components/StepReviewControls';
import { DataSection } from './components/DataSection';
import { Dashboard } from './components/Dashboard';
import { AgentDetailModal } from './components/AgentDetailModal';
import {
  PatientRecord,
  CalculatedKPIs,
  AgentKey,
  AgentStatus,
  AgentWorkflowState,
  RunMode
} from './types';
import { SAMPLE_PATIENT_RECORDS, CSV_HEADERS } from './data/sampleDataset';
import { calculateKPIs } from './utils/calculator';
import {
  getAgent4PlanPrompt,
  getAgent1Prompt,
  getAgent2Prompt,
  getAgent3Prompt,
  getAgent6Prompt,
  getAgent5Prompt,
  getAgent4DecisionPrompt,
  AGENTS_INFO
} from './prompts/agentPrompts';
import { runAgentAPI } from './services/agentService';

const initialWorkflowState: AgentWorkflowState = {
  currentStep: 0,
  statuses: {
    agent4_plan: 'pending',
    agent1: 'pending',
    agent2: 'pending',
    agent3: 'pending',
    agent6: 'pending',
    agent5: 'pending',
    agent4_decision: 'pending',
  },
  errors: {
    agent4_plan: null,
    agent1: null,
    agent2: null,
    agent3: null,
    agent6: null,
    agent5: null,
    agent4_decision: null,
  },
  inputs: {
    agent4_plan: null,
    agent1: null,
    agent2: null,
    agent3: null,
    agent6: null,
    agent5: null,
    agent4_decision: null,
  },
  outputs: {
    agent4_plan: null,
    agent1: null,
    agent2: null,
    agent3: null,
    agent6: null,
    agent5: null,
    agent4_decision: null,
  },
};

export default function App() {
  const [records, setRecords] = useState<PatientRecord[]>(SAMPLE_PATIENT_RECORDS);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(SAMPLE_PATIENT_RECORDS.map((r) => r.id))
  );
  const [managerQuestion, setManagerQuestion] = useState(
    'What should management fix first to improve patient experience, and which cases need human review?'
  );
  const [runMode, setRunMode] = useState<RunMode>('auto');
  const [isRunning, setIsRunning] = useState(false);
  const [workflowState, setWorkflowState] = useState<AgentWorkflowState>(initialWorkflowState);
  const [isPausedForReview, setIsPausedForReview] = useState(false);
  const [selectedAgentForModal, setSelectedAgentForModal] = useState<AgentKey | null>(null);

  // Active records based on selection
  const activeRecords = useMemo(() => {
    return records.filter((r) => selectedIds.has(r.id));
  }, [records, selectedIds]);

  // Compute KPIs with JavaScript
  const kpis = useMemo(() => {
    return calculateKPIs(activeRecords);
  }, [activeRecords]);

  // Reset entire workflow
  const handleResetWorkflow = useCallback(() => {
    setIsRunning(false);
    setIsPausedForReview(false);
    setWorkflowState(initialWorkflowState);
  }, []);

  // Update specialist status (on/off)
  const handleToggleSpecialist = useCallback((key: AgentKey) => {
    setWorkflowState((prev) => {
      const current = prev.statuses[key];
      const nextStatus: AgentStatus = current === 'skipped' ? 'pending' : 'skipped';
      return {
        ...prev,
        statuses: {
          ...prev.statuses,
          [key]: nextStatus,
        },
      };
    });
  }, []);

  // Edit specialist task instruction
  const handleEditSpecialistTask = useCallback((key: AgentKey, newTask: string) => {
    setWorkflowState((prev) => {
      if (!prev.outputs.agent4_plan) return prev;
      const code = AGENTS_INFO[key]?.code || '';
      const updatedAgents = prev.outputs.agent4_plan.agents.map((ag) => {
        if (ag.agent.toLowerCase().includes(code.toLowerCase())) {
          return { ...ag, task: newTask };
        }
        return ag;
      });

      return {
        ...prev,
        outputs: {
          ...prev.outputs,
          agent4_plan: {
            ...prev.outputs.agent4_plan,
            agents: updatedAgents,
          },
        },
      };
    });
  }, []);

  // STEP 4: Orchestrator Final Decision
  const executeStep4 = useCallback(async (stateSnapshot: AgentWorkflowState) => {
    setWorkflowState((prev) => ({
      ...prev,
      currentStep: 4,
      statuses: { ...prev.statuses, agent4_decision: 'running' },
      errors: { ...prev.errors, agent4_decision: null },
    }));

    const humanReviewDistinctIds = new Set(
      (stateSnapshot.outputs.agent3?.complaints || [])
        .filter((c) => c.human_review_required)
        .map((c) => c.id)
    );

    const humanReviewCases = activeRecords
      .filter((r) => {
        const matched = kpis.distinctComments.find((dc) => dc.comment === r.Comment);
        return (
          (matched && humanReviewDistinctIds.has(matched.id)) ||
          r.AI_Risk_Flag === 'Human Review Required' ||
          r.AI_Risk_Flag === 'Bias Review'
        );
      })
      .map((r) => ({
        id: r.id,
        service: r.Service_Line,
        comment: r.Comment,
        ai_flag: r.AI_Risk_Flag,
        readmission_risk: r.Readmission_Risk,
      }));

    const { prompt, inputData } = getAgent4DecisionPrompt(
      managerQuestion,
      stateSnapshot.outputs.agent4_plan,
      stateSnapshot.outputs.agent5,
      kpis,
      humanReviewCases
    );

    setWorkflowState((prev) => ({
      ...prev,
      inputs: { ...prev.inputs, agent4_decision: inputData },
    }));

    const res = await runAgentAPI('agent4_decision', prompt, inputData);

    if (res.success && res.result) {
      setWorkflowState((prev) => ({
        ...prev,
        statuses: { ...prev.statuses, agent4_decision: 'completed' },
        outputs: { ...prev.outputs, agent4_decision: res.result },
      }));
    } else {
      setWorkflowState((prev) => ({
        ...prev,
        statuses: { ...prev.statuses, agent4_decision: 'failed' },
        errors: { ...prev.errors, agent4_decision: res.error || 'Failed Agent 4 decision' },
      }));
    }

    setIsRunning(false);
  }, [activeRecords, kpis, managerQuestion]);

  // STEP 3: Healthcare Analytics Agent
  const executeStep3 = useCallback(async (stateSnapshot: AgentWorkflowState, mode: RunMode) => {
    setWorkflowState((prev) => ({
      ...prev,
      currentStep: 3,
      statuses: { ...prev.statuses, agent5: 'running' },
      errors: { ...prev.errors, agent5: null },
    }));

    const specialistOutputs = {
      agent1: stateSnapshot.outputs.agent1,
      agent2: stateSnapshot.outputs.agent2,
      agent3: stateSnapshot.outputs.agent3,
      agent6: stateSnapshot.outputs.agent6,
    };

    const { prompt, inputData } = getAgent5Prompt(kpis, specialistOutputs);

    setWorkflowState((prev) => ({
      ...prev,
      inputs: { ...prev.inputs, agent5: inputData },
    }));

    const res = await runAgentAPI('agent5', prompt, inputData);

    if (res.success && res.result) {
      const nextOutputs = { ...stateSnapshot.outputs, agent5: res.result };
      const nextState: AgentWorkflowState = {
        ...stateSnapshot,
        currentStep: 3,
        statuses: { ...stateSnapshot.statuses, agent5: 'completed' },
        inputs: { ...stateSnapshot.inputs, agent5: inputData },
        outputs: nextOutputs,
      };

      setWorkflowState(nextState);

      if (mode === 'step_by_step') {
        setIsPausedForReview(true);
        setIsRunning(false);
      } else {
        await executeStep4(nextState);
      }
    } else {
      setWorkflowState((prev) => ({
        ...prev,
        statuses: { ...prev.statuses, agent5: 'failed' },
        errors: { ...prev.errors, agent5: res.error || 'Failed Agent 5' },
      }));
      setIsRunning(false);
    }
  }, [executeStep4, kpis]);

  // STEP 2: Specialist Execution (Agents 1, 2, 3, 6) in parallel
  const executeStep2 = useCallback(async (stateSnapshot: AgentWorkflowState, mode: RunMode) => {
    setWorkflowState((prev) => {
      const nextStatuses = { ...prev.statuses };
      (['agent1', 'agent2', 'agent3', 'agent6'] as AgentKey[]).forEach((key) => {
        if (nextStatuses[key] !== 'skipped' && nextStatuses[key] !== 'completed') {
          nextStatuses[key] = 'running';
        }
      });
      return {
        ...prev,
        currentStep: 2,
        statuses: nextStatuses,
      };
    });

    const calls: Array<Promise<{ key: AgentKey; success: boolean; result?: any; error?: string; input?: any }>> = [];

    // Agent 1
    if (stateSnapshot.statuses.agent1 !== 'skipped' && stateSnapshot.statuses.agent1 !== 'completed') {
      const { prompt, inputData } = getAgent1Prompt(kpis.distinctComments);
      calls.push(
        runAgentAPI('agent1', prompt, inputData).then((res) => ({
          key: 'agent1',
          success: res.success,
          result: res.result,
          error: res.error,
          input: inputData,
        }))
      );
    }

    // Agent 2
    if (stateSnapshot.statuses.agent2 !== 'skipped' && stateSnapshot.statuses.agent2 !== 'completed') {
      const { prompt, inputData } = getAgent2Prompt(kpis);
      calls.push(
        runAgentAPI('agent2', prompt, inputData).then((res) => ({
          key: 'agent2',
          success: res.success,
          result: res.result,
          error: res.error,
          input: inputData,
        }))
      );
    }

    // Agent 3
    if (stateSnapshot.statuses.agent3 !== 'skipped' && stateSnapshot.statuses.agent3 !== 'completed') {
      const { prompt, inputData } = getAgent3Prompt(kpis.distinctComments);
      calls.push(
        runAgentAPI('agent3', prompt, inputData).then((res) => ({
          key: 'agent3',
          success: res.success,
          result: res.result,
          error: res.error,
          input: inputData,
        }))
      );
    }

    // Agent 6
    if (stateSnapshot.statuses.agent6 !== 'skipped' && stateSnapshot.statuses.agent6 !== 'completed') {
      const { prompt, inputData } = getAgent6Prompt(kpis.distinctComments);
      calls.push(
        runAgentAPI('agent6', prompt, inputData).then((res) => ({
          key: 'agent6',
          success: res.success,
          result: res.result,
          error: res.error,
          input: inputData,
        }))
      );
    }

    const settled = await Promise.allSettled(calls);

    setWorkflowState((prev) => {
      const nextStatuses = { ...prev.statuses };
      const nextOutputs = { ...prev.outputs };
      const nextErrors = { ...prev.errors };
      const nextInputs = { ...prev.inputs };

      settled.forEach((item) => {
        if (item.status === 'fulfilled') {
          const val = item.value;
          if (val.success && val.result) {
            nextStatuses[val.key] = 'completed';
            (nextOutputs as any)[val.key] = val.result;
            (nextInputs as any)[val.key] = val.input;
          } else {
            nextStatuses[val.key] = 'failed';
            nextErrors[val.key] = val.error || 'Execution failed';
          }
        }
      });

      const updatedSnapshot: AgentWorkflowState = {
        ...prev,
        statuses: nextStatuses,
        outputs: nextOutputs,
        errors: nextErrors,
        inputs: nextInputs,
      };

      if (mode === 'step_by_step') {
        setIsPausedForReview(true);
        setIsRunning(false);
      } else {
        // Auto-run next step
        executeStep3(updatedSnapshot, mode);
      }

      return updatedSnapshot;
    });
  }, [executeStep3, kpis]);

  // STEP 1: Orchestrator Planning
  const executeStep1 = useCallback(async (mode: RunMode) => {
    setIsRunning(true);
    setIsPausedForReview(false);

    setWorkflowState((prev) => ({
      ...prev,
      currentStep: 1,
      statuses: {
        ...prev.statuses,
        agent4_plan: 'running',
      },
      errors: {
        ...prev.errors,
        agent4_plan: null,
      },
    }));

    const { prompt, inputData } = getAgent4PlanPrompt(managerQuestion, CSV_HEADERS, kpis);

    setWorkflowState((prev) => ({
      ...prev,
      inputs: {
        ...prev.inputs,
        agent4_plan: inputData,
      },
    }));

    const res = await runAgentAPI('agent4_plan', prompt, inputData);

    if (res.success && res.result) {
      const plan = res.result;

      // Update specialist statuses based on plan (if plan says run: false, set to skipped)
      const nextStatuses: Record<AgentKey, AgentStatus> = { ...workflowState.statuses, agent4_plan: 'completed' };

      (['agent1', 'agent2', 'agent3', 'agent6'] as AgentKey[]).forEach((key) => {
        const code = AGENTS_INFO[key]?.code || '';
        const match = plan.agents?.find((a: any) =>
          a.agent.toLowerCase().includes(code.toLowerCase())
        );
        if (match && match.run === false) {
          nextStatuses[key] = 'skipped';
        } else {
          nextStatuses[key] = 'pending';
        }
      });

      const nextState: AgentWorkflowState = {
        ...workflowState,
        currentStep: 1,
        statuses: nextStatuses,
        inputs: { ...workflowState.inputs, agent4_plan: inputData },
        outputs: { ...workflowState.outputs, agent4_plan: plan },
      };

      setWorkflowState(nextState);

      if (mode === 'step_by_step') {
        setIsPausedForReview(true);
        setIsRunning(false);
      } else {
        await executeStep2(nextState, mode);
      }
    } else {
      setWorkflowState((prev) => ({
        ...prev,
        statuses: {
          ...prev.statuses,
          agent4_plan: 'failed',
        },
        errors: {
          ...prev.errors,
          agent4_plan: res.error || 'Failed to generate orchestrator plan',
        },
      }));
      setIsRunning(false);
    }
  }, [executeStep2, kpis, managerQuestion, workflowState]);

  // Handle Approve & Continue in Step-by-Step Review
  const handleApproveAndContinue = useCallback(() => {
    setIsPausedForReview(false);
    setIsRunning(true);

    if (workflowState.currentStep === 1) {
      executeStep2(workflowState, 'step_by_step');
    } else if (workflowState.currentStep === 2) {
      executeStep3(workflowState, 'step_by_step');
    } else if (workflowState.currentStep === 3) {
      executeStep4(workflowState);
    }
  }, [executeStep2, executeStep3, executeStep4, workflowState]);

  // Auto-run remaining steps from current review step
  const handleSkipReviewAndFinishAuto = useCallback(() => {
    setIsPausedForReview(false);
    setIsRunning(true);
    setRunMode('auto');

    if (workflowState.currentStep === 1) {
      executeStep2(workflowState, 'auto');
    } else if (workflowState.currentStep === 2) {
      executeStep3(workflowState, 'auto');
    } else if (workflowState.currentStep === 3) {
      executeStep4(workflowState);
    }
  }, [executeStep2, executeStep3, executeStep4, workflowState]);

  // Re-run single agent without repeating finished calls
  const handleRerunAgent = useCallback(async (key: AgentKey) => {
    setWorkflowState((prev) => ({
      ...prev,
      statuses: { ...prev.statuses, [key]: 'running' },
      errors: { ...prev.errors, [key]: null },
    }));

    let prompt = '';
    let inputData: any = null;

    if (key === 'agent4_plan') {
      const p = getAgent4PlanPrompt(managerQuestion, CSV_HEADERS, kpis);
      prompt = p.prompt;
      inputData = p.inputData;
    } else if (key === 'agent1') {
      const p = getAgent1Prompt(kpis.distinctComments);
      prompt = p.prompt;
      inputData = p.inputData;
    } else if (key === 'agent2') {
      const p = getAgent2Prompt(kpis);
      prompt = p.prompt;
      inputData = p.inputData;
    } else if (key === 'agent3') {
      const p = getAgent3Prompt(kpis.distinctComments);
      prompt = p.prompt;
      inputData = p.inputData;
    } else if (key === 'agent6') {
      const p = getAgent6Prompt(kpis.distinctComments);
      prompt = p.prompt;
      inputData = p.inputData;
    } else if (key === 'agent5') {
      const specialistOutputs = {
        agent1: workflowState.outputs.agent1,
        agent2: workflowState.outputs.agent2,
        agent3: workflowState.outputs.agent3,
        agent6: workflowState.outputs.agent6,
      };
      const p = getAgent5Prompt(kpis, specialistOutputs);
      prompt = p.prompt;
      inputData = p.inputData;
    } else if (key === 'agent4_decision') {
      const humanReviewDistinctIds = new Set(
        (workflowState.outputs.agent3?.complaints || [])
          .filter((c) => c.human_review_required)
          .map((c) => c.id)
      );
      const humanReviewCases = activeRecords
        .filter((r) => {
          const matched = kpis.distinctComments.find((dc) => dc.comment === r.Comment);
          return (
            (matched && humanReviewDistinctIds.has(matched.id)) ||
            r.AI_Risk_Flag === 'Human Review Required' ||
            r.AI_Risk_Flag === 'Bias Review'
          );
        })
        .map((r) => ({
          id: r.id,
          service: r.Service_Line,
          comment: r.Comment,
          ai_flag: r.AI_Risk_Flag,
          readmission_risk: r.Readmission_Risk,
        }));

      const p = getAgent4DecisionPrompt(
        managerQuestion,
        workflowState.outputs.agent4_plan,
        workflowState.outputs.agent5,
        kpis,
        humanReviewCases
      );
      prompt = p.prompt;
      inputData = p.inputData;
    }

    const res = await runAgentAPI(key, prompt, inputData);

    setWorkflowState((prev) => ({
      ...prev,
      statuses: {
        ...prev.statuses,
        [key]: res.success ? 'completed' : 'failed',
      },
      inputs: {
        ...prev.inputs,
        [key]: inputData,
      },
      outputs: {
        ...prev.outputs,
        [key]: res.success ? res.result : prev.outputs[key],
      },
      errors: {
        ...prev.errors,
        [key]: res.success ? null : res.error || 'Execution failed',
      },
    }));
  }, [activeRecords, kpis, managerQuestion, workflowState.outputs]);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
        {/* Navigation bar */}
        <Navbar
          runMode={runMode}
          onReset={handleResetWorkflow}
          isRunning={isRunning}
        />

        {/* Main Application Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Executive Manager Question Bar */}
          <ManagerQuestionBar
            question={managerQuestion}
            onQuestionChange={setManagerQuestion}
            runMode={runMode}
            onRunModeChange={setRunMode}
            isRunning={isRunning}
            onRunWorkflow={() => executeStep1(runMode)}
            onResetWorkflow={handleResetWorkflow}
          />

          {/* Step-by-Step Review Paused Gate (Approve & Continue) */}
          <StepReviewControls
            currentStep={workflowState.currentStep}
            workflowState={workflowState}
            isPausedForReview={isPausedForReview}
            onApproveAndContinue={handleApproveAndContinue}
            onRerunAgent={handleRerunAgent}
            onToggleSpecialist={handleToggleSpecialist}
            onEditSpecialistTask={handleEditSpecialistTask}
            onSkipReviewAndFinishAuto={handleSkipReviewAndFinishAuto}
          />

          {/* Interactive Agent Diagram & Visualization */}
          <WorkflowDiagram
            workflowState={workflowState}
            selectedAgent={selectedAgentForModal}
            onSelectAgent={(key) => setSelectedAgentForModal(key)}
            onRetryAgent={handleRerunAgent}
            onToggleSpecialist={handleToggleSpecialist}
            canEditPlan={isPausedForReview && workflowState.currentStep === 1}
          />

          {/* Combined Executive Dashboard */}
          <Dashboard
            kpis={kpis}
            workflowState={workflowState}
            records={activeRecords}
            onInspectAgent={(key) => setSelectedAgentForModal(key)}
          />

          {/* Dataset Table & CSV Upload/Download */}
          <DataSection
            records={records}
            selectedIds={selectedIds}
            onSelectIdsChange={setSelectedIds}
            onRecordsChange={(newRecords) => {
              setRecords(newRecords);
              setSelectedIds(new Set(newRecords.map((r) => r.id)));
              handleResetWorkflow();
            }}
            kpis={kpis}
          />
        </main>

        {/* Modal for Deep-Dive into any agent's prompt, data received, card view, and JSON output */}
        <AgentDetailModal
          agentKey={selectedAgentForModal}
          onClose={() => setSelectedAgentForModal(null)}
          workflowState={workflowState}
          onRetryAgent={handleRerunAgent}
        />

        {/* Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
          Hospital Patient Experience Intelligence System • Multi-Agent Healthcare Quality Engine
        </footer>
      </div>
    </ThemeProvider>
  );
}
