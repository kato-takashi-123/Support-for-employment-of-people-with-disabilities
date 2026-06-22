import React from 'react';
import { VegetableBasketIcon } from '../components/Icons';

const LoginPage: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-lime-50 dark:bg-gray-900 p-4 select-none">
      <div className="text-center mb-8">
        <VegetableBasketIcon className="h-20 w-20 text-green-600 mx-auto" />
        <h1 className="text-4xl font-bold text-green-800 dark:text-green-300 mt-4">AI作物診断くん</h1>
        <p className="text-green-700 dark:text-green-400 mt-2">AIであなたの作物の状態を診断・サポート</p>
      </div>
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-lime-100 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-center text-gray-700 dark:text-gray-200">ようこそ！</h2>
        <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-2">作物の状態をすぐにAIで診断しましょう。</p>
        <div className="mt-8">
          <button
            onClick={onLogin}
            className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors duration-300 text-lg shadow-md"
          >
            アプリをはじめる
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;