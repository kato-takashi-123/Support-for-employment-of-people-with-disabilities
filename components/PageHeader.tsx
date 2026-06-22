import React from 'react';
import { BackIcon, HamburgerIcon } from './Icons';

export const PageHeader: React.FC<{ title: string; onBack?: () => void; onMenuClick?: () => void; }> = ({ title, onBack, onMenuClick }) => (
    <header className="bg-cyan-100 dark:bg-gray-800 shadow-sm sticky top-0 z-20 px-4 flex items-center justify-between h-14 relative">
        <div className="w-12 flex items-center">
            {onBack && (
                <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-cyan-200 dark:hover:bg-gray-700 transition-colors" aria-label="戻る">
                    <BackIcon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                </button>
            )}
        </div>
        <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold text-gray-900 dark:text-gray-100 text-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap max-w-[65%] overflow-hidden text-ellipsis">{title}</h1>
        <div className="w-12 flex items-center justify-end">
            {onMenuClick && (
                <button onClick={onMenuClick} className="p-2 -mr-2 rounded-full hover:bg-cyan-200 dark:hover:bg-gray-700 transition-colors" aria-label="メニューを表示">
                    <HamburgerIcon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                </button>
            )}
        </div>
    </header>
);
