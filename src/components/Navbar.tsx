import React from 'react';
import {
  Activity,
  Sun,
  Moon,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  GitBranch
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { RunMode } from '../types';

interface NavbarProps {
  runMode: RunMode;
  onReset: () => void;
  isRunning: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ runMode, onReset, isRunning }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 dark:bg-teal-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20 flex-shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                Hospital Patient Experience Intelligence System
              </h1>
              <span className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                <ShieldCheck className="w-3 h-3" />
                Multi-Agent Team
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              Six specialized healthcare AI agents collaborating for executive decision support
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2.5">
          {/* Mode indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <GitBranch className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Mode: {runMode === 'auto' ? 'Auto Run' : 'Step-by-Step Review'}</span>
          </div>

          {/* Reset button */}
          <button
            onClick={onReset}
            disabled={isRunning}
            title="Reset All Agents"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark/light theme"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
