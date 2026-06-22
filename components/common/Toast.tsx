import React from 'react';
import { RefreshIcon } from '../Icons';

export const Toast: React.FC<{ message: string }> = ({ message }) => (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-75 text-white text-lg font-semibold py-4 px-8 rounded-xl shadow-lg z-50 fade-in">
      {message}
    </div>
);

export const UpdateAvailableToast: React.FC<{ onUpdate: () => void; onDismiss: () => void }> = ({ onUpdate, onDismiss }) => (
  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-stone-900/95 dark:bg-zinc-900/95 backdrop-blur-md text-white py-4 px-5 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.35)] border border-lime-500/30 z-[100] animate-bounce-short flex flex-col sm:flex-row items-center gap-4 max-w-[92%] w-[420px] transition-all duration-300">
    <div className="flex items-center gap-3 flex-1">
      <div className="relative flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-lime-500/15 border border-lime-500/40 text-lime-400 animate-pulse">
        <SparklesIcon className="h-5 w-5" />
      </div>
      <div>
        <p className="font-bold text-sm tracking-wide text-stone-100 flex items-center gap-1.5">
          <span>アップデートが届きました！</span>
        </p>
        <p className="text-[11px] text-stone-350 dark:text-stone-400 mt-0.5 leading-normal">
          タップして最新の作物診断と改善機能に更新
        </p>
      </div>
    </div>
    
    <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 border-stone-800/60 pt-3 sm:pt-0">
      <button
        onClick={onDismiss}
        className="px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-350 hover:text-white hover:bg-stone-800/75 transition-all active:scale-95 duration-150"
      >
        後で
      </button>
      <button
        onClick={onUpdate}
        className="flex-1 sm:flex-none bg-gradient-to-r from-lime-500 to-emerald-600 hover:from-lime-400 hover:to-emerald-500 font-bold py-2 px-4.5 rounded-xl text-xs text-stone-950 shadow-[0_4px_12px_rgba(132,204,22,0.25)] hover:shadow-[0_4px_20px_rgba(132,204,22,0.4)] transition-all flex items-center justify-center gap-1.5 active:scale-[0.97] duration-150 text-white"
      >
        <RefreshIcon className="h-3.5 w-3.5 animate-spin-slow" />
        <span>今すぐ更新</span>
      </button>
    </div>
  </div>
);

// High-quality Sparkles Icon helper inside Toast file to prevent adding extra imports or potential missing exports if defined elsewhere.
const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5.5z"/>
    <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z"/>
  </svg>
);