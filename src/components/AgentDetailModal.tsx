import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  RotateCw,
  Terminal,
  Code2,
  FileText,
  AlertTriangle,
  Sparkles,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { AgentKey, AgentStatus, AgentWorkflowState } from '../types';
import { AGENTS_INFO } from '../prompts/agentPrompts';

interface AgentDetailModalProps {
  agentKey: AgentKey | null;
  onClose: () => void;
  workflowState: AgentWorkflowState;
  onRetryAgent?: (key: AgentKey) => void;
}

export const AgentDetailModal: React.FC<AgentDetailModalProps> = ({
  agentKey,
  onClose,
  workflowState,
  onRetryAgent,
}) => {
  if (!agentKey) return null;

  const info = AGENTS_INFO[agentKey];
  const status: AgentStatus = workflowState.statuses[agentKey];
  const inputData = workflowState.inputs[agentKey];
  const outputData: any = workflowState.outputs[agentKey];
  const error = workflowState.errors[agentKey];

  const [activeTab, setActiveTab] = useState<'card' | 'input' | 'json'>('card');
  const [copied, setCopied] = useState(false);

  const handleCopy = (content: any) => {
    navigator.clipboard.writeText(typeof content === 'string' ? content : JSON.stringify(content, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-start gap-3.5">
            <div className={`p-2.5 rounded-xl border ${info.accentClass}`}>
              <span className="font-mono text-sm font-bold">{info.code}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {info.title}
                </h3>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  Step #{info.number}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                {info.role}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {error && onRetryAgent && (
              <button
                onClick={() => onRetryAgent(agentKey)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-950 dark:text-rose-300 flex items-center gap-1.5 transition-colors"
              >
                <RotateCw className="w-3.5 h-3.5" />
                Retry Agent
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 pt-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('card')}
              className={`px-3 py-2 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
                activeTab === 'card'
                  ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Easy-to-Read Card
            </button>
            <button
              onClick={() => setActiveTab('input')}
              className={`px-3 py-2 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
                activeTab === 'input'
                  ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              Data Received ({inputData ? 'Available' : 'Pending'})
            </button>
            <button
              onClick={() => setActiveTab('json')}
              className={`px-3 py-2 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
                activeTab === 'json'
                  ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              Show JSON Result
            </button>
          </div>

          <button
            onClick={() => handleCopy(activeTab === 'input' ? inputData : outputData)}
            className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors py-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Data'}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-800 dark:text-slate-200 space-y-4">
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
              <div className="flex items-center gap-2 font-bold mb-1">
                <AlertTriangle className="w-4 h-4" />
                Execution Failed
              </div>
              <p>{error}</p>
            </div>
          )}

          {/* TAB 1: CARD VIEW */}
          {activeTab === 'card' && (
            <div>
              {!outputData ? (
                <div className="py-12 text-center text-slate-400 dark:text-slate-500">
                  <p className="text-sm">No results available yet for this agent.</p>
                  <p className="text-xs mt-1">Status: <span className="font-semibold capitalize">{status}</span></p>
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  {/* AGENT 4 PLAN */}
                  {agentKey === 'agent4_plan' && (
                    <div className="space-y-4">
                      <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800">
                        <div className="font-bold text-teal-800 dark:text-teal-200 text-sm mb-1">Stated Goal:</div>
                        <p className="text-slate-700 dark:text-slate-300 font-medium">"{outputData.goal}"</p>
                      </div>

                      <div className="space-y-2">
                        <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">Specialist Delegations:</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {outputData.agents?.map((ag: any, idx: number) => (
                            <div
                              key={idx}
                              className={`p-3 rounded-xl border ${
                                ag.run
                                  ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                                  : 'bg-slate-50 dark:bg-slate-900/40 border-dashed border-slate-300 dark:border-slate-800 opacity-70'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="font-bold text-slate-900 dark:text-white">{ag.agent}</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  ag.run ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                }`}>
                                  {ag.run ? 'Run Active' : 'Skipped'}
                                </span>
                              </div>
                              <p className="text-slate-600 dark:text-slate-300">
                                <span className="font-semibold text-slate-800 dark:text-slate-200">Task: </span>
                                {ag.task || 'N/A'}
                              </p>
                              {ag.reason && (
                                <p className="text-slate-500 dark:text-slate-400 mt-1 italic">
                                  Reason: {ag.reason}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* AGENT 1 FEEDBACK INSIGHT */}
                  {agentKey === 'agent1' && (
                    <div className="space-y-4">
                      {outputData.summary && (
                        <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
                          <span className="font-bold text-blue-800 dark:text-blue-200">Executive Summary: </span>
                          <span className="text-slate-700 dark:text-slate-300">{outputData.summary}</span>
                        </div>
                      )}

                      <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">Comment Theme Breakdown ({outputData.comments?.length || 0} distinct comments analyzed):</div>
                      <div className="space-y-3">
                        {outputData.comments?.map((item: any, idx: number) => (
                          <div key={idx} className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-xs">
                                  {item.id}
                                </span>
                                <span className="font-semibold text-slate-900 dark:text-white text-xs">
                                  Theme: {item.theme}
                                </span>
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                item.sentiment === 'Positive'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : item.sentiment === 'Negative'
                                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              }`}>
                                Sentiment: {item.sentiment}
                              </span>
                            </div>

                            <p className="text-slate-600 dark:text-slate-300">
                              <span className="font-semibold text-slate-800 dark:text-slate-200">Reasoning: </span>
                              {item.reasoning}
                            </p>
                            <p className="text-slate-600 dark:text-slate-300">
                              <span className="font-semibold text-slate-800 dark:text-slate-200">Operational Issue: </span>
                              {item.operational_issue}
                            </p>
                            {item.risk_or_bias_concern && (
                              <p className="text-rose-600 dark:text-rose-400">
                                <span className="font-semibold">Risk / Bias Concern: </span>
                                {item.risk_or_bias_concern}
                              </p>
                            )}
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 text-teal-700 dark:text-teal-300 font-medium">
                              <span className="font-semibold">Recommended Action: </span>
                              {item.recommended_action}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AGENT 2 EXPERIENCE MONITORING */}
                  {agentKey === 'agent2' && (
                    <div className="space-y-4">
                      {/* Risk Assessment Grid */}
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-2">Organizational Risk Assessment:</div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {Object.entries(outputData.risk || {}).map(([key, val]) => (
                            <div key={key} className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                              <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 block font-bold">
                                {key.replace('_', ' ')}
                              </span>
                              <span className={`inline-block mt-1 px-2.5 py-0.5 rounded text-xs font-bold ${
                                val === 'High'
                                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                  : val === 'Moderate'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              }`}>
                                {String(val)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Patterns */}
                      <div className="space-y-2">
                        <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">Identified Patterns & Evidence:</div>
                        {outputData.patterns?.map((p: any, idx: number) => (
                          <div key={idx} className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60">
                            <span className="font-bold text-purple-900 dark:text-purple-200">{p.pattern}</span>
                            <p className="text-slate-600 dark:text-slate-300 mt-1">{p.evidence}</p>
                          </div>
                        ))}
                      </div>

                      {/* Equity Concerns */}
                      {outputData.equity_concerns?.length > 0 && (
                        <div className="space-y-2">
                          <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">Healthcare Equity & Accessibility Review:</div>
                          {outputData.equity_concerns.map((eq: any, idx: number) => (
                            <div key={idx} className="p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60">
                              <span className="font-bold text-rose-900 dark:text-rose-200">Group: {eq.group}</span>
                              <p className="text-slate-700 dark:text-slate-300 mt-0.5"><span className="font-medium">Concern:</span> {eq.concern}</p>
                              <p className="text-slate-500 dark:text-slate-400 mt-0.5 italic">Evidence: {eq.evidence}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Recommendation */}
                      {outputData.recommendation && (
                        <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800">
                          <span className="font-bold text-teal-900 dark:text-teal-200">Managerial Recommendation: </span>
                          <span className="text-slate-800 dark:text-slate-200">{outputData.recommendation}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* AGENT 3 COMPLAINT TRIAGE */}
                  {agentKey === 'agent3' && (
                    <div className="space-y-4">
                      {outputData.summary && (
                        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
                          <span className="font-bold text-rose-900 dark:text-rose-200">Triage Summary: </span>
                          <span className="text-slate-700 dark:text-slate-300">{outputData.summary}</span>
                        </div>
                      )}

                      <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">Triage & Escalation Classification:</div>
                      <div className="space-y-3">
                        {outputData.complaints?.map((item: any, idx: number) => (
                          <div key={idx} className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-xs">
                                  {item.id}
                                </span>
                                <span className="font-bold text-slate-900 dark:text-white">
                                  Category: {item.primary_category}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                  item.severity_level >= 3
                                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                    : item.severity_level === 2
                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                }`}>
                                  Level {item.severity_level} Severity
                                </span>
                                {item.human_review_required && (
                                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 flex items-center gap-1">
                                    <ShieldAlert className="w-3 h-3" />
                                    Human Review
                                  </span>
                                )}
                              </div>
                            </div>

                            <p className="text-slate-600 dark:text-slate-300">
                              <span className="font-semibold text-slate-800 dark:text-slate-200">Severity Reasoning: </span>
                              {item.severity_reasoning}
                            </p>

                            <div className="flex flex-wrap items-center gap-2 pt-1">
                              <span className="font-semibold text-slate-800 dark:text-slate-200">Route To: </span>
                              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-medium">
                                {item.route_to}
                              </span>
                            </div>

                            {item.human_review_required && item.human_review_reason && (
                              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800">
                                <span className="font-bold">Human Review Justification: </span>
                                {item.human_review_reason}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AGENT 6 COMMUNICATION EVALUATOR */}
                  {agentKey === 'agent6' && (
                    <div className="space-y-4">
                      {/* Improved Patient Message */}
                      {outputData.improved_patient_message && (
                        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5 text-xs">
                              <Sparkles className="w-4 h-4 text-amber-600" />
                              Improved Patient Message (6th-Grade Reading Level)
                            </span>
                            <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900 px-2 py-0.5 rounded">
                              Max 80 Words
                            </span>
                          </div>
                          <p className="text-slate-800 dark:text-slate-200 font-medium text-xs leading-relaxed italic bg-white dark:bg-slate-900/60 p-3 rounded-lg border border-amber-200/60 dark:border-amber-900/60">
                            "{outputData.improved_patient_message}"
                          </p>
                        </div>
                      )}

                      {/* Executive Summary */}
                      {outputData.executive_summary && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            <span className="font-bold text-slate-800 dark:text-slate-200">Overall Quality: </span>
                            <span className="text-slate-600 dark:text-slate-300">{outputData.executive_summary.overall_quality}</span>
                          </div>
                          <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            <span className="font-bold text-rose-700 dark:text-rose-400">Highest Risk: </span>
                            <span className="text-slate-600 dark:text-slate-300">{outputData.executive_summary.highest_risk}</span>
                          </div>
                          <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            <span className="font-bold text-emerald-700 dark:text-emerald-400">Major Strengths: </span>
                            <span className="text-slate-600 dark:text-slate-300">{outputData.executive_summary.major_strengths}</span>
                          </div>
                          <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            <span className="font-bold text-amber-700 dark:text-amber-400">Most Important Improvement: </span>
                            <span className="text-slate-600 dark:text-slate-300">{outputData.executive_summary.most_important_improvement}</span>
                          </div>
                        </div>
                      )}

                      <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">Communication Quality Evaluations:</div>
                      <div className="space-y-3">
                        {outputData.evaluations?.map((item: any, idx: number) => (
                          <div key={idx} className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 dark:text-white">
                                {item.id} — Purpose: {item.purpose}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                item.risk === 'High'
                                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                  : item.risk === 'Moderate'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              }`}>
                                Risk: {item.risk}
                              </span>
                            </div>

                            {/* Dimension scores */}
                            <div className="grid grid-cols-5 gap-1 text-[11px] text-center pt-1">
                              {Object.entries(item.scores || {}).map(([dim, score]) => (
                                <div key={dim} className="p-1.5 rounded bg-slate-100 dark:bg-slate-700/60">
                                  <span className="block capitalize font-medium text-slate-500 dark:text-slate-400 truncate">
                                    {dim.replace('_', ' ')}
                                  </span>
                                  <span className="font-bold text-slate-900 dark:text-white">
                                    {String(score)}
                                  </span>
                                </div>
                              ))}
                            </div>

                            <p className="text-slate-600 dark:text-slate-300">
                              <span className="font-semibold text-slate-800 dark:text-slate-200">Health Literacy Concern: </span>
                              {item.health_literacy_concern}
                            </p>

                            <p className="text-slate-600 dark:text-slate-300">
                              <span className="font-semibold text-slate-800 dark:text-slate-200">Risk Reason: </span>
                              {item.risk_reason}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AGENT 5 HEALTHCARE ANALYTICS */}
                  {agentKey === 'agent5' && (
                    <div className="space-y-4">
                      {outputData.headline && (
                        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                          <span className="font-bold text-emerald-900 dark:text-emerald-200 text-sm block mb-1">
                            Executive Overview Headline:
                          </span>
                          <span className="text-slate-800 dark:text-slate-200 font-medium">"{outputData.headline}"</span>
                        </div>
                      )}

                      {/* Top Priorities & Quick Wins */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                          <span className="font-bold text-slate-900 dark:text-white block">Top 5 Organizational Priorities:</span>
                          <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-300">
                            {outputData.top_priorities?.map((p: string, idx: number) => (
                              <li key={idx}>{p}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                          <span className="font-bold text-teal-700 dark:text-teal-300 block">Quick Wins (&lt; 3 Months):</span>
                          <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-300">
                            {outputData.quick_wins?.map((w: string, idx: number) => (
                              <li key={idx}>{w}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Hidden Organizational Problems */}
                      {outputData.hidden_problems?.length > 0 && (
                        <div className="space-y-2">
                          <span className="font-bold text-slate-900 dark:text-white block">Hidden Organizational Problems:</span>
                          {outputData.hidden_problems.map((hp: any, idx: number) => (
                            <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                              <span className="font-bold text-rose-700 dark:text-rose-400">{hp.problem}</span>
                              <p className="text-slate-600 dark:text-slate-300 mt-0.5">{hp.evidence}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* AGENT 4 FINAL DECISION */}
                  {agentKey === 'agent4_decision' && (
                    <div className="space-y-4">
                      {/* Top alert banner */}
                      <div className="p-4 rounded-xl bg-teal-500/15 border border-teal-500/30">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-teal-800 dark:text-teal-200 uppercase tracking-wide text-xs">
                            Top Alert:
                          </span>
                          <span className="px-2 py-0.5 rounded text-xs font-bold bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200">
                            Priority: {outputData.priority}
                          </span>
                        </div>
                        <p className="text-slate-900 dark:text-white font-semibold text-sm">
                          {outputData.top_alert}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                        <span className="font-bold text-slate-900 dark:text-white block">Direct Answer to Question:</span>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                          {outputData.answer}
                        </p>
                        {outputData.priority_reason && (
                          <p className="text-slate-500 dark:text-slate-400 italic pt-1 border-t border-slate-100 dark:border-slate-700">
                            Priority Rationale: {outputData.priority_reason}
                          </p>
                        )}
                      </div>

                      {/* Recommended actions */}
                      <div className="space-y-2">
                        <span className="font-bold text-slate-900 dark:text-white block">Recommended Management Actions:</span>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {outputData.recommended_actions?.map((act: any, idx: number) => (
                            <div key={idx} className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                              <div>
                                <span className="font-bold text-teal-700 dark:text-teal-300 block mb-1">
                                  Action #{idx + 1}
                                </span>
                                <p className="text-slate-700 dark:text-slate-300">{act.action}</p>
                              </div>
                              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400">
                                <span className="font-semibold">Owner: </span>{act.owner}
                                <span className="block font-semibold mt-0.5">Timeframe: {act.timeframe}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Human review list */}
                      {outputData.human_review?.length > 0 && (
                        <div className="space-y-2">
                          <span className="font-bold text-rose-700 dark:text-rose-400 block">Determined Human Review Items:</span>
                          <div className="space-y-1.5">
                            {outputData.human_review.map((hr: any, idx: number) => (
                              <div key={idx} className="p-2.5 rounded-lg bg-rose-50/60 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
                                <span className="font-bold text-rose-900 dark:text-rose-200">{hr.item}: </span>
                                <span className="text-slate-700 dark:text-slate-300">{hr.reason}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: INPUT DATA */}
          {activeTab === 'input' && (
            <div className="space-y-2">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Payload sent to agent prompt (strictly minimal columns & JS computed aggregates):
              </div>
              <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto max-h-[55vh]">
                {JSON.stringify(inputData ?? { notice: 'No input generated yet' }, null, 2)}
              </pre>
            </div>
          )}

          {/* TAB 3: RAW JSON */}
          {activeTab === 'json' && (
            <div className="space-y-2">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Raw JSON returned by {info.code}:
              </div>
              <pre className="p-4 rounded-xl bg-slate-900 text-emerald-300 font-mono text-xs overflow-x-auto max-h-[55vh]">
                {JSON.stringify(outputData ?? { notice: 'No JSON output yet' }, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <span>Status:</span>
            <span className="font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">{status}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 font-semibold text-slate-800 dark:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
