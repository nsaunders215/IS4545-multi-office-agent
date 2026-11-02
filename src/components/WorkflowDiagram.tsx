import React from 'react';
import { motion } from 'motion/react';
import {
  Compass,
  MessageSquareText,
  Activity,
  AlertTriangle,
  Sparkles,
  PieChart,
  CheckCircle2,
  Clock,
  Loader2,
  AlertCircle,
  Eye,
  RotateCw,
  ArrowDown,
  ArrowUp,
  FastForward,
  Info
} from 'lucide-react';
import { AgentKey, AgentStatus, AgentWorkflowState } from '../types';
import { AGENTS_INFO } from '../prompts/agentPrompts';

interface WorkflowDiagramProps {
  workflowState: AgentWorkflowState;
  selectedAgent: AgentKey | null;
  onSelectAgent: (agentKey: AgentKey) => void;
  onRetryAgent?: (agentKey: AgentKey) => void;
  onToggleSpecialist?: (agentKey: AgentKey) => void;
  canEditPlan?: boolean;
}

export const WorkflowDiagram: React.FC<WorkflowDiagramProps> = ({
  workflowState,
  selectedAgent,
  onSelectAgent,
  onRetryAgent,
  onToggleSpecialist,
  canEditPlan = false,
}) => {
  const getStatusBadge = (status: AgentStatus) => {
    switch (status) {
      case 'running':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Running
          </span>
        );
      case 'waiting_review':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
            <Clock className="w-3.5 h-3.5" />
            Review Needed
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completed
          </span>
        );
      case 'skipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-slate-500/10 text-slate-500 dark:text-slate-400 border border-slate-500/20">
            <FastForward className="w-3.5 h-3.5" />
            Skipped
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
            <AlertCircle className="w-3.5 h-3.5" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-slate-200/70 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
            <Clock className="w-3.5 h-3.5" />
            Pending
          </span>
        );
    }
  };

  const getAgentIcon = (key: AgentKey) => {
    switch (key) {
      case 'agent4_plan':
        return <Compass className="w-5 h-5 text-teal-600 dark:text-teal-400" />;
      case 'agent1':
        return <MessageSquareText className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'agent2':
        return <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      case 'agent3':
        return <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />;
      case 'agent6':
        return <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case 'agent5':
        return <PieChart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'agent4_decision':
        return <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />;
    }
  };

  // Determine active flow state for arrows
  const isPlanCompleted = workflowState.statuses.agent4_plan === 'completed';
  const isStep2Running =
    workflowState.statuses.agent1 === 'running' ||
    workflowState.statuses.agent2 === 'running' ||
    workflowState.statuses.agent3 === 'running' ||
    workflowState.statuses.agent6 === 'running';
  const isStep2Done =
    ['completed', 'skipped'].includes(workflowState.statuses.agent1) &&
    ['completed', 'skipped'].includes(workflowState.statuses.agent2) &&
    ['completed', 'skipped'].includes(workflowState.statuses.agent3) &&
    ['completed', 'skipped'].includes(workflowState.statuses.agent6);
  const isAgent5Running = workflowState.statuses.agent5 === 'running';
  const isAgent5Done = workflowState.statuses.agent5 === 'completed';
  const isAgent4DecRunning = workflowState.statuses.agent4_decision === 'running';
  const isAgent4DecDone = workflowState.statuses.agent4_decision === 'completed';

  const specialistKeys: AgentKey[] = ['agent1', 'agent2', 'agent3', 'agent6'];

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Hospital Multi-Agent Workflow Engine
            </h2>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              6 Specialized Agents
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time interactive execution graph. Click any agent box to inspect prompts, inputs, and JSON outputs.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
            <span>Running</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
            <span>Skipped</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span>Failed</span>
          </div>
        </div>
      </div>

      {/* Interactive Workflow Diagram Canvas */}
      <div className="relative mt-6 px-2 py-4">

        {/* LEVEL 1: TOP TIER - AGENT 4 ORCHESTRATOR (PLANNING) */}
        <div className="flex justify-center">
          <div className="w-full max-w-xl">
            <div
              onClick={() => onSelectAgent('agent4_plan')}
              className={`group cursor-pointer relative p-4 rounded-xl border transition-all duration-200 ${
                selectedAgent === 'agent4_plan'
                  ? 'ring-2 ring-teal-500 bg-teal-50/70 dark:bg-teal-950/40 border-teal-500 shadow-md'
                  : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 hover:border-teal-400 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/60 border border-teal-200 dark:border-teal-700/60 flex items-center justify-center flex-shrink-0">
                    {getAgentIcon('agent4_plan')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200">
                        Agent 4
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Orchestrator — Job 1: Planning
                      </h3>
                      <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center">
                        #1
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      Reads the manager's inquiry and selects required specialist agents with explicit rationale.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  {getStatusBadge(workflowState.statuses.agent4_plan)}
                  <span className="text-[11px] text-teal-600 dark:text-teal-400 font-medium flex items-center gap-1 group-hover:underline">
                    <Eye className="w-3 h-3" /> View Data
                  </span>
                </div>
              </div>

              {workflowState.outputs.agent4_plan?.goal && (
                <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-750 text-xs bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Goal: </span>
                  <span className="text-slate-600 dark:text-slate-400 italic">
                    "{workflowState.outputs.agent4_plan.goal}"
                  </span>
                </div>
              )}

              {workflowState.errors.agent4_plan && (
                <div className="mt-2 text-xs text-rose-600 dark:text-rose-400 flex items-center justify-between">
                  <span>Error: {workflowState.errors.agent4_plan}</span>
                  {onRetryAgent && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRetryAgent('agent4_plan');
                      }}
                      className="px-2 py-1 text-xs rounded bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-200 hover:bg-rose-200 font-medium flex items-center gap-1"
                    >
                      <RotateCw className="w-3 h-3" /> Retry
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* DYNAMIC CONNECTOR ARROW: AGENT 4 DOWN TO SPECIALISTS */}
        <div className="relative py-4 flex flex-col items-center">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-600 dark:text-slate-400 shadow-xs z-10">
            <ArrowDown className={`w-3.5 h-3.5 ${isPlanCompleted || isStep2Running ? 'text-teal-600 dark:text-teal-400 animate-bounce' : 'text-slate-400'}`} />
            <span>Workflow Step 2: Parallel Specialist Fan-Out (Distinct Comments & Aggregates)</span>
          </div>
          {/* Animated SVG connecting pipeline */}
          <svg className="w-full h-8 absolute top-0 left-0 pointer-events-none" preserveAspectRatio="none">
            <line
              x1="50%"
              y1="0"
              x2="50%"
              y2="100%"
              stroke={isPlanCompleted ? '#0d9488' : '#94a3b8'}
              strokeWidth="2"
              strokeDasharray={isStep2Running ? '4 4' : 'none'}
              className={isStep2Running ? 'animate-pulse' : ''}
            />
          </svg>
        </div>

        {/* LEVEL 2: MIDDLE TIER - SPECIALISTS 1, 2, 3, 6 RUNNING IN PARALLEL */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {specialistKeys.map((key) => {
            const info = AGENTS_INFO[key];
            const status = workflowState.statuses[key];
            const isSelected = selectedAgent === key;
            const error = workflowState.errors[key];

            // Check if plan assigned task
            const planAgent = workflowState.outputs.agent4_plan?.agents.find(
              (a) => a.agent.toLowerCase().includes(info.code.toLowerCase())
            );

            return (
              <div
                key={key}
                onClick={() => onSelectAgent(key)}
                className={`group cursor-pointer relative p-3.5 rounded-xl border flex flex-col justify-between transition-all duration-200 ${
                  isSelected
                    ? `ring-2 ring-teal-500 ${info.accentClass} shadow-md`
                    : status === 'skipped'
                    ? 'bg-slate-50 dark:bg-slate-900/40 border-dashed border-slate-300 dark:border-slate-750 opacity-75'
                    : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 hover:border-slate-400 hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700/60 flex items-center justify-center flex-shrink-0">
                        {getAgentIcon(key)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-mono font-bold px-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                            {info.code}
                          </span>
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {info.name}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                          Parallel #2
                        </span>
                      </div>
                    </div>
                    {getStatusBadge(status)}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2.5 line-clamp-2">
                    {info.shortDesc}
                  </p>

                  {/* Task from plan if available */}
                  {planAgent?.task && (
                    <div className="mt-2 text-[11px] p-2 rounded bg-slate-100/70 dark:bg-slate-900/70 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-750">
                      <span className="font-semibold text-slate-900 dark:text-white">Assigned: </span>
                      {planAgent.task}
                    </div>
                  )}

                  {/* If user can edit during review step */}
                  {canEditPlan && onToggleSpecialist && (
                    <div className="mt-2 flex items-center justify-between text-xs pt-1.5 border-t border-slate-200 dark:border-slate-700">
                      <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
                        <input
                          type="checkbox"
                          checked={status !== 'skipped'}
                          onChange={(e) => {
                            e.stopPropagation();
                            onToggleSpecialist(key);
                          }}
                          className="rounded text-teal-600 focus:ring-teal-500"
                        />
                        <span>Enable Agent</span>
                      </label>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-750 flex items-center justify-between">
                  <span className="text-[11px] text-teal-600 dark:text-teal-400 font-medium flex items-center gap-1 group-hover:underline">
                    <Eye className="w-3 h-3" /> Inspect Card / JSON
                  </span>

                  {error && onRetryAgent && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRetryAgent(key);
                      }}
                      className="px-2 py-0.5 text-xs rounded bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-200 font-medium flex items-center gap-1"
                    >
                      <RotateCw className="w-3 h-3" /> Retry
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* DYNAMIC CONNECTOR ARROW: SPECIALISTS DOWN TO AGENT 5 */}
        <div className="relative py-4 flex flex-col items-center">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-600 dark:text-slate-400 shadow-xs z-10">
            <ArrowDown className={`w-3.5 h-3.5 ${isStep2Done || isAgent5Running ? 'text-emerald-600 dark:text-emerald-400 animate-bounce' : 'text-slate-400'}`} />
            <span>Workflow Step 3: Synthesis of Specialist Findings & Hospital KPIs</span>
          </div>
          <svg className="w-full h-8 absolute top-0 left-0 pointer-events-none" preserveAspectRatio="none">
            <line
              x1="50%"
              y1="0"
              x2="50%"
              y2="100%"
              stroke={isStep2Done ? '#10b981' : '#94a3b8'}
              strokeWidth="2"
              strokeDasharray={isAgent5Running ? '4 4' : 'none'}
              className={isAgent5Running ? 'animate-pulse' : ''}
            />
          </svg>
        </div>

        {/* LEVEL 3: BOTTOM TIER - AGENT 5 HEALTHCARE ANALYTICS */}
        <div className="flex justify-center">
          <div className="w-full max-w-xl">
            <div
              onClick={() => onSelectAgent('agent5')}
              className={`group cursor-pointer relative p-4 rounded-xl border transition-all duration-200 ${
                selectedAgent === 'agent5'
                  ? 'ring-2 ring-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-500 shadow-md'
                  : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 hover:border-emerald-400 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-700/60 flex items-center justify-center flex-shrink-0">
                    {getAgentIcon('agent5')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                        Agent 5
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Healthcare Analytics Agent
                      </h3>
                      <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center">
                        #3
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      Integrates all specialist results with statistical KPIs into executive dashboard insights.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  {getStatusBadge(workflowState.statuses.agent5)}
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 group-hover:underline">
                    <Eye className="w-3 h-3" /> View Data
                  </span>
                </div>
              </div>

              {workflowState.outputs.agent5?.headline && (
                <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-750 text-xs bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg">
                  <span className="font-semibold text-emerald-700 dark:text-emerald-300">Executive Headline: </span>
                  <span className="text-slate-700 dark:text-slate-300">
                    "{workflowState.outputs.agent5.headline}"
                  </span>
                </div>
              )}

              {workflowState.errors.agent5 && (
                <div className="mt-2 text-xs text-rose-600 dark:text-rose-400 flex items-center justify-between">
                  <span>Error: {workflowState.errors.agent5}</span>
                  {onRetryAgent && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRetryAgent('agent5');
                      }}
                      className="px-2 py-1 text-xs rounded bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-200 font-medium flex items-center gap-1"
                    >
                      <RotateCw className="w-3 h-3" /> Retry
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RETURN LOOP: AGENT 5 BACK TO AGENT 4 FINAL DECISION */}
        <div className="mt-6 pt-4 border-t border-dashed border-slate-200 dark:border-slate-750">
          <div className="flex items-center justify-between mb-3 px-2">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isAgent4DecRunning ? 'bg-teal-400' : 'bg-transparent'}`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isAgent4DecDone ? 'bg-emerald-500' : isAgent4DecRunning ? 'bg-teal-500' : 'bg-slate-400'}`}></span>
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Loopback: Analytics Result Fed Back to Orchestrator (Job 2)
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-teal-600 dark:text-teal-400 font-medium">
              <ArrowUp className="w-3.5 h-3.5" />
              <span>Agent 5 Findings → Final Decision</span>
            </div>
          </div>

          <div className="w-full">
            <div
              onClick={() => onSelectAgent('agent4_decision')}
              className={`group cursor-pointer relative p-4 rounded-xl border transition-all duration-200 ${
                selectedAgent === 'agent4_decision'
                  ? 'ring-2 ring-teal-500 bg-teal-50/70 dark:bg-teal-950/40 border-teal-500 shadow-md'
                  : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 hover:border-teal-400 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/60 border border-teal-200 dark:border-teal-700/60 flex items-center justify-center flex-shrink-0">
                    {getAgentIcon('agent4_decision')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200">
                        Agent 4
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Orchestrator — Job 2: Final Management Decision
                      </h3>
                      <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center">
                        #4
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      Synthesizes analytics, human review cases, and delivers actionable management decisions.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  {getStatusBadge(workflowState.statuses.agent4_decision)}
                  <span className="text-[11px] text-teal-600 dark:text-teal-400 font-medium flex items-center gap-1 group-hover:underline">
                    <Eye className="w-3 h-3" /> View Decision
                  </span>
                </div>
              </div>

              {workflowState.outputs.agent4_decision?.top_alert && (
                <div className="mt-3 p-3 rounded-lg bg-teal-500/10 border border-teal-500/30">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
                      Top Management Alert:
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      workflowState.outputs.agent4_decision.priority === 'High'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : workflowState.outputs.agent4_decision.priority === 'Medium'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>
                      Priority: {workflowState.outputs.agent4_decision.priority}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-1">
                    {workflowState.outputs.agent4_decision.top_alert}
                  </p>
                </div>
              )}

              {workflowState.errors.agent4_decision && (
                <div className="mt-2 text-xs text-rose-600 dark:text-rose-400 flex items-center justify-between">
                  <span>Error: {workflowState.errors.agent4_decision}</span>
                  {onRetryAgent && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRetryAgent('agent4_decision');
                      }}
                      className="px-2 py-1 text-xs rounded bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-200 font-medium flex items-center gap-1"
                    >
                      <RotateCw className="w-3 h-3" /> Retry
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
