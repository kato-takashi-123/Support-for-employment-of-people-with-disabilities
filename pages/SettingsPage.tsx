import React, { useState } from 'react';
import { AppSettings } from '../types';
import { LogoutIcon, ExternalLinkIcon, CloudDownloadIcon } from '../components/Icons';
import { SearchModeToggle } from '../components/common/SearchModeToggle';
import { AiInfoModal } from '../components/modals';

type SettingsPageProps = {
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
  onLogout: () => void;
  deferredPrompt: any;
  isAppInstalled: boolean;
  onInstallApp: () => void;
};

const SettingsPage: React.FC<SettingsPageProps> = ({ 
  settings, 
  onSettingsChange, 
  onLogout,
  deferredPrompt,
  isAppInstalled,
  onInstallApp
}) => {
  const [isGeminiHelpOpen, setIsGeminiHelpOpen] = useState(false);
  const [guideTab, setGuideTab] = useState<'ios' | 'android'>('ios');
  const [installTypeTab, setInstallTypeTab] = useState<'pwa' | 'shortcut'>('pwa');
  
  const handlePartialSettingsChange = (newPartialSettings: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...newPartialSettings };

    const canUseAiNow = newSettings.enableAiFeatures && !!newSettings.geminiApiKey;
    const couldUseAiBefore = settings.enableAiFeatures && !!settings.geminiApiKey;

    if (canUseAiNow && !couldUseAiBefore) {
        newSettings.searchMode = 'ai';
    } else if (!canUseAiNow && couldUseAiBefore) {
        newSettings.searchMode = 'google';
    }
    
    onSettingsChange(newSettings);
  };
  
  return (
    <>
    <AiInfoModal
      isOpen={isGeminiHelpOpen}
      onClose={() => setIsGeminiHelpOpen(false)}
      title="Gemini APIキーの取得方法"
    >
      <div className="space-y-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
        <p>Gemini APIは、Google AI Studioから無料で取得できる個人アカウント用APIキーを設定することで、すぐにAI相談機能が利用可能になります。</p>
        <ol className="list-decimal list-outside pl-5 space-y-2 font-light">
            <li>
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="font-bold text-orange-600 dark:text-orange-400 underline hover:text-orange-850">Google AI Studio</a>にアクセスし、お持ちのGoogleアカウントでログインします。
            </li>
            <li>「Get API key（またはキー作成）」ボタンをクリックします。</li>
            <li>「Create API key」を選択し、新しいプロジェクトに紐付けられたAPIキーを作成します。</li>
            <li>生成されたキー文字列（AIza...で始まるもの）をコピーし、このアプリの設定画面にある「Gemini APIキー」の欄に貼り付けてください。</li>
        </ol>
        <a 
          href="https://aistudio.google.com/app/apikey" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="inline-flex items-center justify-center gap-2 w-full bg-orange-600 text-white font-bold py-2.5 px-4 rounded-xl hover:bg-orange-700 transition-colors mt-4 text-xs"
        >
          <ExternalLinkIcon className="h-4.5 w-4.5" />
          <span>Google AI Studioを開く</span>
        </a>
      </div>
    </AiInfoModal>
    
    <div className="p-4 space-y-6 max-w-xl mx-auto pb-12">
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">共通システム設定</h3>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-orange-100 dark:border-gray-700 shadow-sm space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-750 dark:text-gray-300">アプリ共有URL / リンク</label>
            <input
              type="url"
              value={settings.appUrl || ''}
              onChange={e => handlePartialSettingsChange({ appUrl: e.target.value })}
              className="mt-1 w-full p-2.5 text-xs border border-orange-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:outline-orange-400"
              placeholder="https://..."
            />
            <p className="text-[10px] text-gray-400 mt-1">
              他の農場員や支援職員と、相談マニュアル画面をQRコード等で共有するためのURLです。
            </p>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">AI相談機能設定</h3>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-orange-100 dark:border-gray-700 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-orange-50">
            <label htmlFor="enable-ai" className="text-xs font-bold text-gray-750 dark:text-gray-300">AIアドバイス機能を有効にする</label>
            <input 
              type="checkbox" 
              id="enable-ai" 
              checked={settings.enableAiFeatures} 
              onChange={e => handlePartialSettingsChange({ enableAiFeatures: e.target.checked })} 
              className="h-6 w-11 rounded-full bg-gray-200 checked:bg-orange-600 focus:ring-0" 
            />
          </div>
           <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-750 dark:text-gray-300">検索・応答優先モード</label>
            <div className="mt-1">
                <SearchModeToggle
                    mode={settings.searchMode}
                    onModeChange={(mode) => handlePartialSettingsChange({ searchMode: mode })}
                    aiEnabled={settings.enableAiFeatures && !!settings.geminiApiKey}
                />
            </div>
            {(!settings.enableAiFeatures || !settings.geminiApiKey) && (
                <p className="text-[10px] text-gray-500 mt-1 leading-normal">
                  AI相談・検索を利用するには、上のAI機能を有効にし、
                  <button onClick={() => setIsGeminiHelpOpen(true)} className="text-orange-600 dark:text-orange-400 underline font-semibold mx-1">
                    Gemini APIキーを設定
                  </button>
                  してください。（未設定時は安全なGoogle通常検索へ自動的にフォールバックします）
                </p>
            )}
          </div>
          {settings.enableAiFeatures && (
            <div className="space-y-3 pt-3 border-t border-orange-50">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] font-bold text-gray-750 dark:text-gray-300">Gemini APIキー (個人キー)</label>
                  <button
                    onClick={() => setIsGeminiHelpOpen(true)}
                    className="text-[10px] text-orange-600 hover:underline font-bold"
                  >
                    💡 キーの取得方法
                  </button>
                </div>
                <input
                  type="password"
                  value={settings.geminiApiKey || ''}
                  onChange={(e) => handlePartialSettingsChange({ geminiApiKey: e.target.value })}
                  placeholder="AIzaSy..."
                  className="w-full text-xs p-2.5 border border-orange-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-orange-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-750 dark:text-gray-300 mb-1">相談用推奨LLMモデル</label>
                <select
                  value={settings.preferredModel || 'gemini-2.5-flash'}
                  onChange={(e) => handlePartialSettingsChange({ preferredModel: e.target.value })}
                  className="w-full text-xs p-2.5 border border-orange-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-850 dark:text-gray-100 focus:outline-orange-400 bg-none"
                >
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash (超高速レスポンス・推奨)</option>
                  <option value="gemini-2.5-pro">Gemini 2.5 Pro (超高精度合理的配慮分析重視)</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">ホーム画面追加・インストール (PWA)</h3>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-orange-100 dark:border-gray-700 shadow-sm space-y-4">
          <p className="text-[11px] text-gray-500 leading-normal font-light">
            本支援アプリは「PWAウェブアプリ」に対応しており、ホーム画面から単体のスマートフォン型本格アプリとして立ち上げることができます。
          </p>

          {/* 取りこみ選択タブ */}
          <div className="grid grid-cols-2 gap-2 bg-orange-50/50 p-1 rounded-xl">
            <button
              onClick={() => setInstallTypeTab('pwa')}
              className={`py-2 px-3 text-[10px] font-bold rounded-lg transition-all flex flex-col items-center justify-center gap-0.5 ${
                installTypeTab === 'pwa'
                  ? 'bg-orange-650 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="flex items-center gap-1">📱 本格アプリとして登録</span>
              <span className={`text-[9px] opacity-90 ${installTypeTab === 'pwa' ? 'text-orange-50' : 'text-gray-400'}`}>
                (全画面・オフライン対応)
              </span>
            </button>
            <button
              onClick={() => setInstallTypeTab('shortcut')}
              className={`py-2 px-3 text-[10px] font-bold rounded-lg transition-all flex flex-col items-center justify-center gap-0.5 ${
                installTypeTab === 'shortcut'
                  ? 'bg-orange-650 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="flex items-center gap-1">📁 ショートカットを追加</span>
              <span className={`text-[9px] opacity-90 ${installTypeTab === 'shortcut' ? 'text-orange-50' : 'text-gray-400'}`}>
                (ブラウザお気に入り起動)
              </span>
            </button>
          </div>

          <div className="bg-orange-50/30 p-3 rounded-lg border border-orange-100/50">
            {installTypeTab === 'pwa' ? (
              <p className="text-[10px] text-orange-900 leading-relaxed font-light">
                ✨ <strong>本格アプリ (PWA) の魅力：</strong><br />
                アドレスバーのない<strong>単体のアプリ画面</strong>で起動。端末キャッシュにマニュアル情報が保存され、<strong>電波の届きにくい畑地帯</strong>でも即座に起動し救急対応フロー等を確認可能です。
              </p>
            ) : (
              <p className="text-[10px] text-gray-600 leading-relaxed font-light">
                📁 <strong>ショートカット(お気に入り) の特徴：</strong><br />
                通常のウェブページとして開くため、ブックマーク感覚で気軽にホームからアクセスできますが、オフラインの場所では作動しない場合があります。
              </p>
            )}
          </div>

          {/* Install prompts */}
          {installTypeTab === 'pwa' && deferredPrompt ? (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
                <h4 className="text-xs font-bold text-orange-850">
                  Android(Chrome) 登録準備完了
                </h4>
              </div>
              <p className="text-[10px] text-gray-500">
                お使いの端末はダイレクト追加可能です。下のボタンから1タップで「障がい者雇用支援アプリ」をホーム画面へ配置できます！
              </p>
              <button
                onClick={onInstallApp}
                className="w-full py-2 px-4 bg-orange-650 hover:bg-orange-700 text-white font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 text-xs"
              >
                <CloudDownloadIcon className="h-4 w-4" />
                <span>アプリ(PWA)としてホームに登録</span>
              </button>
            </div>
          ) : installTypeTab === 'pwa' && isAppInstalled ? (
            <div className="p-3 bg-orange-50/20 border border-orange-100 rounded-xl text-center">
              <p className="text-[10px] font-bold text-orange-700">
                🎉 すでに本格アプリ(PWA規格)として動作中です
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">
                ホームに配置された当アプリのアプリアイコンからお使いいただくと、電波のない現場でも極めて快適に動作します。
              </p>
            </div>
          ) : null}

          {/* OS step guides */}
          <div className="border-t border-orange-100 pt-3.5 space-y-3">
            <h4 className="text-xs font-bold text-gray-750">お使いの端末別の登録方法手順</h4>
            
            <div className="flex bg-orange-50/30 p-1 rounded-lg">
              <button
                onClick={() => setGuideTab('ios')}
                className={`flex-1 py-1 text-xs font-bold rounded-md transition-all ${
                  guideTab === 'ios'
                    ? 'bg-white text-orange-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                iPhone / iPad (Safari)
              </button>
              <button
                onClick={() => setGuideTab('android')}
                className={`flex-1 py-1 text-xs font-bold rounded-md transition-all ${
                  guideTab === 'android'
                    ? 'bg-white text-orange-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Android / パソコン(Chrome)
              </button>
            </div>

            {guideTab === 'ios' ? (
              <div className="space-y-2.5 text-xs text-gray-600 bg-stone-50/50 p-3 rounded-lg leading-relaxed font-light">
                {installTypeTab === 'pwa' ? (
                  <>
                    <p className="font-bold text-orange-850 border-b pb-1">
                      iOS(Safari)は共有メニューから簡単に本格アプリ化できます！
                    </p>
                    <div className="flex items-start gap-1.5">
                      <span className="w-4 h-4 bg-orange-100 text-orange-800 rounded font-bold flex items-center justify-center text-[9px] mt-0.5">1</span>
                      <p>Safariの最下部にある<strong>「共有アイコン（四角から矢印が飛び出たボタン）」</strong>をタップします。</p>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="w-4 h-4 bg-orange-100 text-orange-800 rounded font-bold flex items-center justify-center text-[9px] mt-0.5">2</span>
                      <p>一覧から<strong>「ホーム画面に追加」</strong>をタップします。</p>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="w-4 h-4 bg-orange-100 text-orange-800 rounded font-bold flex items-center justify-center text-[9px] mt-0.5">3</span>
                      <p>右上の<strong>「追加」</strong>をタップすると配備完了。アイコンをタップして完全全画面のサポートデスクを開始できます。</p>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-[10px] text-gray-500">※iOS(Safari)はホーム画面追加時に自動的に完全なPWAとして認識して保存されるため、こちらが最適手順です。</p>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-2.5 text-xs text-gray-600 bg-stone-50/50 p-3 rounded-lg leading-relaxed font-light">
                {installTypeTab === 'pwa' ? (
                  <>
                    <p className="font-bold text-orange-850 border-b pb-1">
                      AndroidのChromeでアプリ(PWA)として登録する手順：
                    </p>
                    <div className="flex items-start gap-1.5">
                      <span className="w-4 h-4 bg-orange-100 text-orange-800 rounded font-bold flex items-center justify-center text-[9px] mt-0.5">1</span>
                      <p>Chrome右上メニューの<strong>「３点リーダーアイコン（⋮）」</strong>をタップします。</p>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="w-4 h-4 bg-orange-100 text-orange-800 rounded font-bold flex items-center justify-center text-[9px] mt-0.5">2</span>
                      <p>メニュー一覧より、必ず<strong className="text-orange-700 bg-orange-50 px-1 rounded border border-orange-100">「アプリをインストール」</strong>を選んでタップしてください。（「ホーム画面に追加」はお気に入りと見なされるため避けてください）</p>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="w-4 h-4 bg-orange-100 text-orange-800 rounded font-bold flex items-center justify-center text-[9px] mt-0.5">3</span>
                      <p>ポップアップ確認時に<strong>「インストール」</strong>をタップすると、アプリ一覧に完全登録されます。</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-1.5 font-light">
                      <span className="w-4 h-4 bg-orange-100 text-orange-800 rounded font-bold flex items-center justify-center text-[9px] mt-0.5">1</span>
                      <p>Chromeメニュー（縦の⋮）から<strong>「ホーム画面に追加」</strong>を押し許可・登録してください。</p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">表示補助 (アクセシビリティ) 設定</h3>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-orange-100 dark:border-gray-700 shadow-sm space-y-4">
           <div>
            <label className="block text-xs font-bold text-gray-750 dark:text-gray-300">ダークモードのコントラスト強化</label>
            <div className="mt-2 flex rounded-lg shadow-sm">
              <button
                onClick={() => handlePartialSettingsChange({ darkModeContrast: 'normal' })}
                className={`flex-1 px-4 py-2 text-xs rounded-l-lg transition-colors ${settings.darkModeContrast === 'normal' ? 'bg-orange-600 text-white font-bold' : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700'}`}
              >
                通常表示
              </button>
              <button
                onClick={() => handlePartialSettingsChange({ darkModeContrast: 'high' })}
                className={`flex-1 px-4 py-2 text-xs rounded-r-lg transition-colors ${settings.darkModeContrast === 'high' ? 'bg-orange-600 text-white font-bold' : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700'}`}
              >
                高コントラスト（視覚補助）
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4">
         <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 font-bold py-3 px-4 rounded-xl transition-colors border border-red-100 text-xs shadow-sm">
            <LogoutIcon className="h-4.5 w-4.5"/>
            <span>システム・ログアウト</span>
          </button>
      </div>
    </div>
    </>
  );
};

export default SettingsPage;
