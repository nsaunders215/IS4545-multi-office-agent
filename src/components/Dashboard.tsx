import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  MessageSquare,
  ShieldAlert,
  Sparkles,
  PieChart,
  Activity,
  Users,
  Compass,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  Building2,
  Calendar,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import {
  CalculatedKPIs,
  AgentWorkflowState,
  PatientRecord
} from '../types';
import { AGENTS_INFO } from '../prompts/agentPrompts';

interface DashboardProps {
  kpis: CalculatedKPIs;
  workflowState: AgentWorkflowState;
  records: PatientRecord[];
  onInspectAgent: (key: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  kpis,
  workflowState,
  records,
  onInspectAgent,
}) => {
  const [copiedMessage, setCopiedMessage] = useState(false);

  const plan = workflowState.outputs.agent4_plan;
  const agent1 = workflowState.outputs.agent1;
  const agent2 = workflowState.outputs.agent2;
  const agent3 = workflowState.outputs.agent3;
  const agent6 = workflowState.outputs.agent6;
  const agent5 = workflowState.outputs.agent5;
  const decision = workflowState.outputs.agent4_decision;

  // Determine human review records:
  // Link complaints from Agent 3 where human_review_required === true back to records
  const humanReviewDistinctIds = new Set(
    (agent3?.complaints || [])
      .filter((c) => c.human_review_required)
      .map((c) => c.id)
  );

  // Also include records that have AI_Risk_Flag === 'Human Review Required'
  const humanReviewRecords = records.filter((r) => {
    // Check if r belongs to a distinct comment flagged by Agent 3
    const matchedDistinct = kpis.distinctComments.find((dc) => dc.comment === r.Comment);
    const flaggedByAgent3 = matchedDistinct && humanReviewDistinctIds.has(matchedDistinct.id);
    const flaggedByRecord = r.AI_Risk_Flag === 'Human Review Required' || r.AI_Risk_Flag === 'Bias Review';
    return flaggedByAgent3 || flaggedByRecord;
  });

  // Calculate theme counts from Agent 1
  const themeCounts: Record<string, number> = {};
  if (agent1?.comments) {
    agent1.comments.forEach((c) => {
      const distinct = kpis.distinctComments.find((dc) => dc.id === c.id);
      const count = distinct ? distinct.count : 1;
      themeCounts[c.theme] = (themeCounts[c.theme] || 0) + count;
    });
  }

  // Calculate severity level counts from Agent 3
  const severityCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
  if (agent3?.complaints) {
    agent3.complaints.forEach((c) => {
      const distinct = kpis.distinctComments.find((dc) => dc.id === c.id);
      const count = distinct ? distinct.count : 1;
      const lvl = c.severity_level || 1;
      severityCounts[lvl] = (severityCounts[lvl] || 0) + count;
    });
  }

  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  return (
    <div className="w-full space-y-6">
      {/* 1. TOP MAIN MANAGEMENT ALERT (Agent 4 Orchestrator) */}
      <div className="relative overflow-hidden rounded-2xl border border-teal-500/40 bg-gradient-to-r from-teal-500/15 via-teal-500/5 to-slate-50 dark:from-teal-950/60 dark:via-slate-900 dark:to-slate-900 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-4xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-teal-100 text-teal-800 dark:bg-teal-900/80 dark:text-teal-200 border border-teal-200 dark:border-teal-700">
                PRODUCED BY AGENT 4 ORCHESTRATOR
              </span>
              {decision?.priority && (
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  decision.priority === 'High'
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800 animate-pulse'
                    : decision.priority === 'Medium'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                }`}>
                  Priority Level: {decision.priority}
                </span>
              )}
            </div>

            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              {decision?.top_alert ||
                (workflowState.currentStep === 0
                  ? 'Ready to execute workflow. Click "Execute Workflow" above to begin evaluation.'
                  : 'Synthesizing multi-agent patient experience intelligence...')}
            </h2>

            {decision?.answer && (
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed pt-1">
                {decision.answer}
              </p>
            )}
          </div>

          {decision && (
            <button
              onClick={() => onInspectAgent('agent4_decision')}
              className="self-start md:self-center px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs flex-shrink-0"
            >
              <span>Inspect Full Decision</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. KPI CARDS (Calculated with JS, attributed clearly) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Satisfaction */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
              <span className="font-semibold uppercase tracking-wider">Patient Satisfaction</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                App JS Calc
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {kpis.avgSatisfaction.toFixed(2)}
              </span>
              <span className="text-xs text-slate-400">/ 5.00</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Cohort Size: {kpis.totalRecords} patients</span>
            <span className={`font-semibold ${kpis.avgSatisfaction >= 3.5 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {kpis.avgSatisfaction >= 3.5 ? 'Above Threshold' : 'Attention Needed'}
            </span>
          </div>
        </div>

        {/* Card 2: Communication Rating */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
              <span className="font-semibold uppercase tracking-wider">Communication Rating</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-mono">
                Agent 6 Scope
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {kpis.avgCommunication.toFixed(2)}
              </span>
              <span className="text-xs text-slate-400">/ 5.00</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Evaluated by Agent 6</span>
            <span className="font-semibold text-slate-600 dark:text-slate-300">
              {kpis.avgCommunication < 3.0 ? 'High Comm. Friction' : 'Moderate Quality'}
            </span>
          </div>
        </div>

        {/* Card 3: Follow-Up Compliance */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
              <span className="font-semibold uppercase tracking-wider">Follow-Up Compliance</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 font-mono">
                Agent 2 Metrics
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {kpis.followupComplianceRate}%
              </span>
              <span className="text-xs text-slate-400">rate</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Portal Usage: {kpis.portalUsageRate}%</span>
            <span className="font-semibold text-purple-600 dark:text-purple-400">
              {kpis.readmissionRiskCounts.High} High Readmission
            </span>
          </div>
        </div>

        {/* Card 4: Human-Review Cases */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
              <span className="font-semibold uppercase tracking-wider">Human-Review Cases</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-mono">
                Agent 3 & 4
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">
                {humanReviewRecords.length}
              </span>
              <span className="text-xs text-slate-400">
                ({((humanReviewRecords.length / (kpis.totalRecords || 1)) * 100).toFixed(0)}% of cohort)
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-rose-600 dark:text-rose-400 flex items-center justify-between font-medium">
            <span>Safety / Equity / Clinical</span>
            <span>Mandatory Oversight</span>
          </div>
        </div>
      </div>

      {/* 3. CHARTS GRID (Satisfaction by service line, comment themes Agent 1, severity levels Agent 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Chart 1: Satisfaction by Service Line */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Satisfaction by Service Line
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Average patient satisfaction score (1 to 5)
              </p>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              JS Calculated
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {Object.entries(kpis.satisfactionByServiceLine).map(([service, val]) => {
              const pct = (val.avgSat / 5) * 100;
              const isLow = val.avgSat < 2.5;
              return (
                <div key={service} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[170px]">
                      {service}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">({val.count} pts)</span>
                      <span className={`font-bold ${isLow ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
                        {val.avgSat.toFixed(2)}★
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isLow
                          ? 'bg-rose-500'
                          : val.avgSat >= 4.0
                          ? 'bg-emerald-500'
                          : 'bg-teal-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Main Comment Themes (Agent 1 Feedback) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Patient Comment Themes
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Extracted by Agent 1 Feedback Insight
              </p>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
              Agent 1
            </span>
          </div>

          {Object.keys(themeCounts).length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Run workflow to populate themes from Agent 1.
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              {Object.entries(themeCounts).map(([theme, count]) => {
                const totalComments = Object.values(themeCounts).reduce((a, b) => a + b, 0);
                const pct = ((count / (totalComments || 1)) * 100).toFixed(0);
                return (
                  <div key={theme} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                        {theme}
                      </span>
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                        <span>{count}</span>
                        <span className="text-[11px] text-slate-400 font-normal">({pct}%)</span>
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-500 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Chart 3: Severity Levels (Agent 3 Complaint Triage) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Complaint Severity Distribution
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Assessed by Agent 3 Complaint Triage (L1 to L4)
              </p>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
              Agent 3
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {[
              { lvl: 4, name: 'Level 4 — Critical', desc: 'Immediate patient safety / legal exposure', color: 'bg-rose-600', text: 'text-rose-600' },
              { lvl: 3, name: 'Level 3 — High', desc: 'Potential harm / medication / accessibility', color: 'bg-orange-500', text: 'text-orange-600' },
              { lvl: 2, name: 'Level 2 — Moderate', desc: 'Repeated friction / communication failure', color: 'bg-amber-500', text: 'text-amber-600' },
              { lvl: 1, name: 'Level 1 — Low', desc: 'Routine dissatisfaction / suggestion', color: 'bg-emerald-500', text: 'text-emerald-600' },
            ].map((item) => {
              const count = severityCounts[item.lvl] || 0;
              const totalComplaints = Object.values(severityCounts).reduce((a, b) => a + b, 0) || 1;
              const pct = ((count / totalComplaints) * 100).toFixed(0);

              return (
                <div key={item.lvl} className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-bold ${item.text}`}>
                      {item.name}
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {count} records ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. TABLE OF CASES THAT NEED HUMAN REVIEW */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Cases Flagged for Mandatory Human Review
                </h3>
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                  {humanReviewRecords.length} Cases
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Synthetic safety compliance: High-risk, ambiguous, or clinical safety flags require clinician/manager verification.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 self-start sm:self-auto">
            PRODUCED BY AGENTS 3 & 4
          </span>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto max-h-80">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold sticky top-0 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3 font-mono">Patient ID</th>
                  <th className="p-3">Service Line</th>
                  <th className="p-3">Persona</th>
                  <th className="p-3">Readmission Risk</th>
                  <th className="p-3">AI Flag</th>
                  <th className="p-3">Route Escalation</th>
                  <th className="p-3 min-w-[260px]">Patient Comment</th>
                  <th className="p-3 min-w-[200px]">Review Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {humanReviewRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-slate-400">
                      No cases currently require human intervention.
                    </td>
                  </tr>
                ) : (
                  humanReviewRecords.map((r) => {
                    const distinct = kpis.distinctComments.find((dc) => dc.comment === r.Comment);
                    const triageComplaint = agent3?.complaints?.find((c) => c.id === distinct?.id);

                    return (
                      <tr key={r.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/60 transition-colors">
                        <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                          {r.id}
                        </td>
                        <td className="p-3 font-medium">{r.Service_Line}</td>
                        <td className="p-3">{r.Patient_Persona}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            r.Readmission_Risk === 'High' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' : 'bg-slate-100 dark:bg-slate-800'
                          }`}>
                            {r.Readmission_Risk}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                            {r.AI_Risk_Flag}
                          </span>
                        </td>
                        <td className="p-3 font-medium text-blue-600 dark:text-blue-400">
                          {triageComplaint?.route_to || 'Quality & Safety Committee'}
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-300 italic">
                          "{r.Comment}"
                        </td>
                        <td className="p-3 text-rose-700 dark:text-rose-300 font-medium">
                          {triageComplaint?.human_review_reason || 'Flagged for patient safety or equity audit'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 5. AGENT 6 IMPROVED PATIENT MESSAGE & AGENT 2 EQUITY REVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Agent 6 Improved Message */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Patient Communication Revision
              </h3>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
              PRODUCED BY AGENT 6
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            For the highest communication risk, Agent 6 authored an empathetic, 6th-grade reading level patient-facing template (80 words or fewer):
          </p>

          <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/80 space-y-2 relative">
            <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed italic">
              "{agent6?.improved_patient_message || 'Awaiting Agent 6 execution...'}"
            </p>

            {agent6?.improved_patient_message && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => handleCopyMessage(agent6.improved_patient_message)}
                  className="px-3 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  {copiedMessage ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedMessage ? 'Copied' : 'Copy Message Template'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Agent 2 Healthcare Equity & Disparity Review */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Healthcare Equity & Vulnerable Populations
              </h3>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
              PRODUCED BY AGENT 2
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {agent2?.equity_concerns?.length ? (
              agent2.equity_concerns.map((eq, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-800/60">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-900 dark:text-purple-200">
                      Target Group: {eq.group}
                    </span>
                    <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
                      Equity Flag
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 mt-1">{eq.concern}</p>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5 italic">Evidence: {eq.evidence}</p>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-slate-400">
                Awaiting Agent 2 execution to evaluate disparities...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 6. BOTTOM: AGENT 4 THREE MANAGEMENT RECOMMENDATIONS */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Executive Action Roadmap: Management Recommendations
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Concrete management decisions with designated hospital owners and timeframes.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-1 rounded bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 self-start sm:self-auto">
            PRODUCED BY AGENT 4 (JOB 2)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(decision?.recommended_actions?.length ? decision.recommended_actions : [
            { action: 'Establish rapid EKG and chest tightness triage protocol to eliminate emergency hallway wait times.', owner: 'Emergency Department Medical Director', timeframe: 'Immediate (Within 48 Hours)' },
            { action: 'Deploy in-person interpreter service mandate for discharge consultations involving limited-English patients.', owner: 'Patient Advocacy & Nursing Leadership', timeframe: '30 Days' },
            { action: 'Revise outpatient medication discharge summaries into 6th-grade reading level with medication schedules.', owner: 'Director of Pharmacy & Care Coordination', timeframe: '60 Days' },
          ]).map((rec, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                    Priority Action #{idx + 1}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    {rec.timeframe}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                  {rec.action}
                </h4>
              </div>

              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700 text-[11px]">
                <span className="text-slate-500 dark:text-slate-400">Accountable Owner: </span>
                <span className="font-semibold text-slate-900 dark:text-slate-200 block mt-0.5">
                  {rec.owner}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
