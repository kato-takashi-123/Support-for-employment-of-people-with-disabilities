import React, { useState, useCallback } from 'react';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { MicrophoneIcon } from '../components/Icons';
import { ApiCallHandler, AppSettings } from '../types';

type PageProps = {
  handleApiCall: ApiCallHandler;
  settings: AppSettings;
  onSettingsChange: (newSettings: AppSettings) => void;
  pageParams: any;
};

const MAIN_WELFARE_TERMS = [
  '合理的配慮（ごうりてきはいりょ）', '就労移行支援',
  '就労継続支援A型', '就労継続支援B型',
  'ジョブコーチ', '発達障がい特性',
  '特例子会社', 'てんかん対応',
  '感覚過敏（かんかくかびん）', '自閉スペクトラム症（ASD）',
  '注意欠陥・多動性（ADHD）', '高次脳機能障がい',
  'パニック（不安障がい）', '障がい者手帳の種類',
  '就労定着支援サービス', '職場定着へのアプローチ',
  'スモールステップ', '視覚構造化（イラスト化）'
];

const TermSearchPage: React.FC<PageProps> = ({ settings }) => {
  const [query, setQuery] = useState('');
  const [searchedTerm, setSearchedTerm] = useState<string | null>(null);

  const { isListening, startListening } = useVoiceRecognition({
    onResult: (text: string) => {
      setQuery(prev => prev + (prev ? ' ' : '') + text);
    }
  });

  const handleSearch = useCallback((searchTerm?: string) => {
    const termToSearch = (searchTerm || query).split('（')[0].trim();
    if (!termToSearch) return;

    setQuery(termToSearch);
    setSearchedTerm(termToSearch);

    // Fallback or direct web search
    const searchQuery = encodeURIComponent(`${termToSearch} 障がい者福祉 用語`);
    const searchUrl = `https://www.google.com/search?q=${searchQuery}`;
    
    try {
      window.open(searchUrl, '_blank', 'noopener,noreferrer');
    } catch (e) {
      console.error("Popup blocked", e);
    }
  }, [query]);

  const handleTermClick = (term: string) => {
    const mainTerm = term.split('（')[0].trim();
    setQuery(mainTerm);
    handleSearch(mainTerm);
  };

  return (
    <>
      <div className="p-4 space-y-4 max-w-xl mx-auto pb-12">
        {/* Search Block - Extremely Bold and High Contrast */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-md border-2 border-orange-200 dark:border-gray-700 space-y-3">
          <h3 className="font-extrabold text-gray-955 dark:text-gray-100 flex items-center justify-between flex-wrap gap-2 text-base sm:text-lg">
            <span className="flex items-center gap-2">📚 障がい者福祉用語辞典</span>
            <span className="text-xs sm:text-sm bg-orange-700 text-white px-3 py-1 rounded font-extrabold">
              Web検索
            </span>
          </h3>
          <p className="text-sm sm:text-base text-gray-950 dark:text-gray-100 leading-relaxed font-bold">
            障がい者福祉、雇用支援、合理的配慮にまつわる仕組みや専門用語を、外部のWeb検索（Google検索）を利用して詳しく検索・解説します。
          </p>
          
          <div className="flex gap-2">
            <div className="relative flex-grow">
              <input 
                type="text" 
                value={query} 
                onChange={e => setQuery(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && handleSearch()} 
                placeholder={isListening ? "マイクから聞き取り中..." : "例: 合理的配慮"} 
                className="w-full p-3 text-sm sm:text-base border-2 border-orange-300 dark:border-gray-600 dark:bg-gray-700 rounded-xl pr-12 focus:outline-orange-500 font-bold dark:text-white" 
                disabled={isListening} 
              />
              <button 
                onClick={startListening} 
                className={`absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-full ${isListening ? 'bg-red-600 text-white animate-pulse' : 'text-orange-700 hover:bg-orange-100 dark:hover:bg-gray-650'}`}
              >
                <MicrophoneIcon className="h-5 w-5" />
              </button>
            </div>
            
            <button 
              onClick={() => handleSearch()} 
              disabled={!query.trim()} 
              className="bg-orange-700 hover:bg-orange-850 text-white font-extrabold py-3 px-5 rounded-xl text-sm sm:text-base shadow-md disabled:bg-gray-300 disabled:text-gray-500 transition-colors"
            >
              検索
            </button>
          </div>
        </div>
        
        {searchedTerm && (
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-md border-2 border-orange-200 dark:border-gray-700 fade-in space-y-4">
            <h2 className="text-base sm:text-lg font-extrabold text-orange-950 dark:text-orange-200 border-b-2 border-orange-200 pb-2 flex items-center gap-2">
              <span>🔍</span>
              <span>「{searchedTerm}」の検索結果</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-955 dark:text-gray-200 font-bold leading-relaxed">
              ブラウザの別タブでGoogleのWeb検索結果が開きます。ポップアップがブロックされた場合や自動で開かない場合は、以下のボタンをタップしてください。
            </p>
            <a 
              href={`https://www.google.com/search?q=${encodeURIComponent(`${searchedTerm} 障がい者福祉 用語`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-orange-100 hover:bg-orange-200 dark:bg-gray-750 text-orange-950 dark:text-orange-200 border-2 border-orange-300 dark:border-gray-600 font-black py-4 px-4 rounded-xl flex items-center justify-center gap-2 text-sm sm:text-base shadow-sm transition-colors text-center"
            >
              🌐 「{searchedTerm}」をGoogleでWeb検索する
            </a>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-md border-2 border-orange-200 dark:border-gray-700 fade-in space-y-3">
          <h3 className="font-extrabold text-orange-950 dark:text-orange-200 text-sm sm:text-base">💡 よく検索される福祉・支援キーワード</h3>
          <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
            {MAIN_WELFARE_TERMS.map((term, index) => (
              <button
                key={index}
                onClick={() => handleTermClick(term)}
                className="px-3.5 py-2.5 bg-orange-50 text-orange-950 dark:bg-gray-700 dark:text-orange-300 rounded-xl border-2 border-orange-200 hover:bg-orange-100 dark:hover:bg-gray-650 font-extrabold transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default TermSearchPage;
