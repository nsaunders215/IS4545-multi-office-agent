import React from 'react';
import {
  Sparkles,
  Play,
  RotateCw,
  HelpCircle,
  Sliders,
  Send,
  Loader2,
  Compass
} from 'lucide-react';
import { RunMode } from '../types';

interface ManagerQuestionBarProps {
  question: string;
  onQuestionChange: (q: string) => void;
  runMode: RunMode;
  onRunModeChange: (m: RunMode) => void;
  isRunning: boolean;
  onRunWorkflow: () => void;
  onResetWorkflow: () => void;
}

const PRESET_QUESTIONS = [
  'What should management fix first to improve patient experience, and which cases need human review?',
  'Which service lines have severe wait-time and communication bottlenecks impacting readmission?',
  'Are there significant health equity, language, or accessibility barriers facing older patients?',
  'What immediate operational quick wins can we deploy to increase follow-up and portal adoption?'
];

export const ManagerQuestionBar: React.FC<ManagerQuestionBarProps> = ({
  question,
  onQuestionChange,
  runMode,
  onRunModeChange,
  isRunning,
  onRunWorkflow,
  onResetWorkflow,
}) => {
  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 flex items-center justify-center flex-shrink-0">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Hospital Executive Inquiry
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Formulate your management question for Agent 4 Orchestrator and specialist analysis.
            </p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => onRunModeChange('auto')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              runMode === 'auto'
                ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Auto Run
          </button>
          <button
            type="button"
            onClick={() => onRunModeChange('step_by_step')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              runMode === 'step_by_step'
                ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Step-by-Step Review
          </button>
        </div>
      </div>

      {/* Main input & run button */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <input
            type="text"
            value={question}
            onChange={(e) => onQuestionChange(e.target.value)}
            placeholder="Type hospital management question..."
            className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-teal-500 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRunWorkflow}
            disabled={isRunning || !question.trim()}
            className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center gap-2 flex-1 sm:flex-initial"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Executing Agents...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>{runMode === 'auto' ? 'Execute Workflow (Auto)' : 'Start Step-by-Step'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onResetWorkflow}
            disabled={isRunning}
            title="Reset Workflow State"
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preset pills */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mr-1">
          Preset Inquiries:
        </span>
        {PRESET_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onQuestionChange(q)}
            className="px-2.5 py-1 text-[11px] rounded-lg border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:border-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors text-left"
          >
            {q.length > 55 ? `${q.substring(0, 55)}...` : q}
          </button>
        ))}
      </div>
    </div>
  );
};
