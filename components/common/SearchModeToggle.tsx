import React from 'react';

type SearchModeToggleProps = {
  mode: 'ai' | 'google';
  onModeChange: (mode: 'ai' | 'google') => void;
  disabled?: boolean;
  aiEnabled: boolean;
};

export const SearchModeToggle: React.FC<SearchModeToggleProps> = ({ mode, onModeChange, disabled, aiEnabled }) => {
  return (
    <div className="flex rounded-lg shadow-sm">
      <button
        onClick={() => onModeChange('ai')}
        disabled={disabled || !aiEnabled}
        className={`flex-1 px-4 py-2 text-sm font-semibold rounded-l-lg transition-colors ${
          mode === 'ai'
            ? 'bg-green-600 text-white'
            : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
        } disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed disabled:text-gray-500`}
        title={!aiEnabled ? 'AI機能は設定で無効になっているか、APIキーが設定されていません。' : ''}
      >
        AI検索
      </button>
      <button
        onClick={() => onModeChange('google')}
        disabled={disabled}
        className={`flex-1 px-4 py-2 text-sm font-semibold rounded-r-lg transition-colors ${
          mode === 'google'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
        }`}
      >
        Web検索
      </button>
    </div>
  );
};
