import React, { useState, useCallback, useRef, useEffect } from 'react';
import { PestInfo, AppSettings } from '../types';
import { searchPestInfo } from '../services/geminiService';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { resizeImage } from '../lib/utils';
import { FormattedContent } from '../components/common/FormattedContent';
import { ImageSourceModal } from '../components/modals';
import { CameraIcon, MicrophoneIcon, CloseIcon, CopyIcon, CheckIcon, PestSearchIcon, ExternalLinkIcon } from '../components/Icons';
import { ApiCallHandler } from '../types';

type PageProps = {
  handleApiCall: ApiCallHandler;
  settings: AppSettings;
  onSettingsChange: (newSettings: AppSettings) => void;
  pageParams: any;
};

const PestSearchPage: React.FC<PageProps> = ({ handleApiCall, settings }) => {
  const isIOS = typeof window !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
  const [query, setQuery] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PestInfo | null>(null);
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const shouldAutoSearch = useRef(false);
  const [isCopied, setIsCopied] = useState(false);
  const stopSearchRef = useRef(false);
  
  const { isListening, startListening } = useVoiceRecognition({ onResult: setQuery });

  const handleImageSelected = async (file: File | null, autoSearch: boolean) => {
    if (!file) return;
    setImageBase64(null);
    setResult(null);
    try {
        const resized = await resizeImage(file, 800000);
        setImageBase64(resized);
        if (autoSearch) {
            shouldAutoSearch.current = true;
        }
    } catch(e) {
        console.error("Image resize failed", e);
        alert("画像の処理に失敗しました。");
    }
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageSelected(e.target.files?.[0] || null, true);
    if (e.target) e.target.value = '';
  };

  const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageSelected(e.target.files?.[0] || null, false);
    if (e.target) e.target.value = '';
  };
  
  const handleSourceSelect = (source: 'camera' | 'gallery') => {
      if (source === 'camera') {
        cameraInputRef.current?.click();
      } else {
        galleryInputRef.current?.click();
      }
      setIsSourceModalOpen(false);
  };
  
  const handleStopSearch = () => {
    stopSearchRef.current = true;
    setIsLoading(false);
  };

  const handleSearch = useCallback(async () => {
    if (!query.trim() && !imageBase64) return;

    stopSearchRef.current = false;
    setIsLoading(true);
    setResult(null);
    const aiEnabled = settings.enableAiFeatures && !!settings.geminiApiKey;

    try {
      if (settings.searchMode === 'ai' && aiEnabled) {
        try {
          const imagePart = imageBase64 ? { mimeType: 'image/jpeg', data: imageBase64.split(',')[1] } : undefined;
          const info = await handleApiCall(() => searchPestInfo(query, imagePart));
          if (stopSearchRef.current) return;

          if (info) {
            setResult(info);
            return;
          }
        } catch (aiError) {
          console.warn("AI search failed, falling back to web search", aiError);
          if (stopSearchRef.current) return;
        }
      }
      
      // Web search fallback
      if (query.trim()) {
        const searchQuery = encodeURIComponent(`${query} 障害者雇用促進法 合理的配慮`);
        const searchUrl = `https://www.google.com/search?q=${searchQuery}`;
        window.open(searchUrl, '_blank', 'noopener,noreferrer');
      } else {
        alert("外部検索では、テキストでのキーワード入力のみ承ることができます。");
      }

    } catch (e) {
      console.error("Search failed:", e);
      if (!stopSearchRef.current) {
        alert("法律検索に失敗しました。");
      }
    } finally {
      setIsLoading(false);
    }
  }, [query, imageBase64, handleApiCall, settings]);

  useEffect(() => {
    if (imageBase64 && shouldAutoSearch.current) {
        handleSearch();
        shouldAutoSearch.current = false;
    }
  }, [imageBase64, handleSearch]);

  const handleCopy = useCallback(() => {
    if (!result) return;
    
    const textToCopy = `${result.pestName}\n\n`
      + `【概要】\n`
      + `要旨: ${result.summary.characteristics}\n`
      + `背景・必要性: ${result.summary.causes}\n`
      + `要求される義務: ${result.summary.countermeasures}\n\n`
      + `【詳細解説】\n`
      + `対象規定: ${result.details.characteristics}\n`
      + `おちいりやすい不適切事例: ${result.details.causes}\n`
      + `農場長の実践アプローチ: ${result.details.countermeasures}`;

    navigator.clipboard.writeText(textToCopy).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  }, [result]);

  const SummaryCard: React.FC<{title: string; content: string}> = ({title, content}) => (
    <div className="bg-orange-100 dark:bg-gray-900/60 p-4 rounded-xl border-2 border-orange-200 dark:border-gray-700">
      <h4 className="font-extrabold text-orange-950 dark:text-orange-200 text-sm sm:text-base">{title}</h4>
      <p className="text-gray-950 dark:text-gray-100 text-xs sm:text-sm mt-1.5 leading-relaxed font-bold">{content}</p>
    </div>
  );
  
  const isAiSearchEnabled = settings.enableAiFeatures && !!settings.geminiApiKey;
  
  return (
    <>
      <ImageSourceModal
        isOpen={isSourceModalOpen}
        onClose={() => setIsSourceModalOpen(false)}
        onSelect={handleSourceSelect}
      />
      <input type="file" accept="image/*" capture={isIOS ? undefined : "environment"} ref={cameraInputRef} onChange={handleCameraCapture} className="hidden" />
      <input type="file" accept="image/*" ref={galleryInputRef} onChange={handleGallerySelect} className="hidden" />

      <div className="p-4 space-y-4 max-w-xl mx-auto pb-12">
        {/* Search Block */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-md border-2 border-orange-200 dark:border-gray-700 space-y-3">
          <h3 className="font-extrabold text-gray-950 dark:text-gray-100 text-base sm:text-lg flex items-center gap-2">
            <span>⚖️ 雇用関連法・虐待防止法 検索</span>
            <span className="text-xs bg-orange-700 text-white dark:bg-orange-800 px-2.5 py-1 rounded font-extrabold">
              {settings.searchMode === 'ai' && isAiSearchEnabled ? 'AI検索' : 'Web検索'}
            </span>
          </h3>
          <p className="text-sm text-gray-950 dark:text-gray-100 leading-relaxed font-bold">
            「障がい者雇用促進法（合理的配慮の提供義務）」や「障がい者虐待防止法」についての規定、現場で厳守させたいルールを検索・解説します。
          </p>

          {/* Secure camera disclaimer */}
          <div className="text-xs sm:text-sm text-orange-950 dark:text-orange-300 bg-orange-100 p-3 rounded-xl border-2 border-orange-300 font-extrabold">
            ⚠️ <strong>人物の撮影は絶対禁止：</strong>手書きの指導規約やメモなどのテキスト部分のみを撮影・アップして検索してください。
          </div>

          <div className="relative">
            <textarea 
              value={query} 
              onChange={e => setQuery(e.target.value)} 
              rows={2} 
              placeholder={isListening ? "マイクから聞き取る準備ができています..." : "検索キーワードを入力 (例: 合理的配慮の免責, 虐待防止)"} 
              className="w-full p-3 text-sm sm:text-base border-2 border-orange-300 dark:border-gray-600 dark:bg-gray-700 rounded-xl pr-20 focus:outline-orange-500 font-bold" 
              disabled={isLoading || isListening} 
            />
             <div className="absolute right-2 top-2 flex items-center gap-1">
                <button 
                  onClick={() => setIsSourceModalOpen(true)} 
                  disabled={isLoading || settings.searchMode !== 'ai' || !isAiSearchEnabled} 
                  className="p-1.5 rounded-full text-orange-700 hover:bg-orange-100 dark:hover:bg-gray-600 disabled:opacity-50"
                  title="マニュアルプリントを撮影して検索"
                >
                  <CameraIcon className="h-5.5 w-5.5" />
                </button>
                <button 
                  onClick={startListening} 
                  disabled={isLoading} 
                  className={`p-1.5 rounded-full ${isListening ? 'bg-red-600 text-white animate-pulse' : 'text-orange-700 hover:bg-orange-100 dark:hover:bg-gray-600'}`}
                >
                  <MicrophoneIcon className="h-5.5 w-5.5" />
                </button>
            </div>
          </div>
          
          <button 
            onClick={handleSearch} 
            disabled={isLoading || (!query.trim() && !imageBase64)} 
            className="w-full bg-orange-700 hover:bg-orange-850 text-white font-extrabold py-3 px-4 rounded-xl text-sm sm:text-base transition-all shadow-md disabled:bg-gray-300 disabled:text-gray-500"
          >
            法規・対応策を検索する
          </button>

          {imageBase64 && (
            <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-orange-300 mt-2">
              <img src={imageBase64} alt="upload preview" className="w-full h-full object-cover" />
              <button onClick={() => setImageBase64(null)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1">
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {isLoading && (
            <div className="flex items-center justify-center gap-4 text-center p-3 bg-gray-100 dark:bg-gray-700 rounded-xl">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-700"></div>
                <span className="font-extrabold text-gray-950 dark:text-gray-200 text-sm">AI法規アドバイザーが情報を整理中...</span>
                <button onClick={handleStopSearch} className="bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 rounded-full p-1 hover:bg-red-200">
                    <CloseIcon className="h-4 w-4" />
                </button>
            </div>
        )}
        
        {/* Default content if no result */}
        {!isLoading && !result && (
            <div className="space-y-4 fade-in">
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-md border-2 border-orange-200 dark:border-gray-700 space-y-3">
                    <h3 className="font-extrabold text-base text-orange-950 dark:text-orange-200 mb-2 border-b-2 border-orange-200 pb-1.5">⚖️ 障がい者雇用促進法（合理的配慮）</h3>
                    <p className="text-sm text-gray-950 dark:text-gray-100 leading-relaxed font-bold">
                      すべての事業主に対して、障がいのあるスタッフから「仕事の支障を改善してほしい」といった要望が出された場合、過重な負担とならない範囲で<strong>合理的配慮を義務的かつ誠実に提供すること</strong>が定められています。
                    </p>
                    <ul className="space-y-2.5 text-xs sm:text-sm text-gray-955 dark:text-gray-100 list-disc list-outside pl-5 leading-relaxed font-bold">
                        <li>
                            <strong>お互いの対話（プロセス）を欠かさない：</strong>一方的な決めつけ（配慮できない等）をせず、本人と面談を行い調整案を検討し続ける必要があります。
                        </li>
                        <li>
                            <strong>情報提示の工夫：</strong>音声での確認、写真や動画を挟んだ手順マニュアル、作業手順のイラスト図解等は合理的配慮の最たる代表例です。
                        </li>
                    </ul>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-md border-2 border-orange-200 dark:border-gray-700 space-y-3">
                    <h3 className="font-extrabold text-base text-orange-950 dark:text-orange-200 mb-2 border-b-2 border-orange-200 pb-1.5">🚫 障がい者虐待防止法（不適切な関わりを防ぐ）</h3>
                    <p className="text-sm text-gray-950 dark:text-gray-100 leading-relaxed font-bold">
                      職場（農場など）での障がい者への虐待を防止・早期発見するための法律です。現場管理者・農場長は労働福祉における虐待を防止する義務があります。
                    </p>
                    <div className="space-y-2.5 text-xs sm:text-sm text-gray-955 dark:text-gray-100">
                        <p className="font-extrabold text-orange-950 dark:text-orange-300">⚠️ 不適切行為に相当する主な５大区分：</p>
                        <ol className="list-decimal list-outside pl-5 space-y-2 leading-relaxed font-bold">
                            <li>
                                <strong>身体的：</strong>たたく、叩きつける、行動を力づくで制限する行為。
                            </li>
                            <li>
                                <strong>性的：</strong>わいせつな言葉を言う、相手の体に拒否されているのに触る行為。
                            </li>
                            <li>
                                <strong>心理的：</strong>怒鳴りつける、侮辱する、無視をする、他のメンバーの前で見せしめにする行為。
                            </li>
                            <li>
                                <strong>放置（ネグレクト）：</strong>活躍能力があるのに仕事を全く与えずに放置する、水分補給や休息を適度にとらせない行為。
                            </li>
                            <li>
                                <strong>経済的：</strong>最低賃金を不当に下回って働かせる、手当や給与を強制的に管理・搾取する行為。
                            </li>
                        </ol>
                    </div>
                </div>
            </div>
        )}

        {/* AI Result Card */}
        {result && (
          <div className="space-y-4 fade-in relative">
            <button onClick={handleCopy} className="absolute top-0 right-0 z-10 p-2.5 bg-orange-100 dark:bg-gray-700 rounded-full hover:bg-orange-200 transition-colors" title="結果をコピー">
                {isCopied ? <CheckIcon className="h-5 w-5 text-green-700" /> : <CopyIcon className="h-5 w-5 text-orange-700" />}
            </button>
            <h2 className="text-base sm:text-lg font-extrabold text-orange-950 dark:text-orange-200 border-b-2 border-orange-300 pb-1">{result.pestName}</h2>
            
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-md border-2 border-orange-200 dark:border-gray-700 space-y-3">
              <h3 className="text-sm sm:text-base font-extrabold text-gray-950 dark:text-gray-100 mb-1 flex items-center gap-1.5">
                <span>📋</span> <span>法理概要とポイント</span>
              </h3>
              <SummaryCard title="概要" content={result.summary.characteristics} />
              <SummaryCard title="規定された根拠・保護背景" content={result.summary.causes} />
              <SummaryCard title="農場での遵守義務・推奨行動" content={result.summary.countermeasures} />
            </div>

            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-md border-2 border-orange-200 dark:border-gray-700 space-y-3 leading-relaxed text-sm sm:text-base">
              <h3 className="text-sm sm:text-base font-extrabold text-orange-950 dark:text-white mb-1 border-b-2 border-orange-200 pb-1 flex items-center gap-1.5 font-extrabold">
                <span>🔍</span> <span>詳細実務指針</span>
              </h3>
              <p><strong className="font-extrabold text-gray-950 dark:text-gray-100">対象要件・詳細解説:</strong></p>
              <p className="text-gray-950 dark:text-gray-200 bg-orange-50/50 p-3 rounded-lg font-bold border-2 border-orange-100"><FormattedContent content={result.details.characteristics} /></p>
              
              <p className="mt-4"><strong className="font-extrabold text-red-800 dark:text-red-400">おちいりやすい違反・不適切行動の具体例:</strong></p>
              <p className="text-gray-950 dark:text-gray-200 font-bold bg-red-50/40 p-3 rounded-lg border-2 border-red-100"><FormattedContent content={result.details.causes} /></p>
              
              <p className="mt-4"><strong className="font-extrabold text-emerald-800 dark:text-emerald-400 font-extrabold">農場長向けのコンプライアンス対策・具体的チェックポイント:</strong></p>
              <p className="text-gray-950 dark:text-gray-200 bg-emerald-50/20 p-4 rounded-lg border-2 border-emerald-200 font-bold"><FormattedContent content={result.details.countermeasures} /></p>
            </div>

            {/* Legal caveat */}
            <div className="p-4 bg-gray-100 dark:bg-gray-800 text-gray-950 dark:text-gray-200 rounded-xl text-xs sm:text-sm leading-relaxed border-2 border-gray-300 font-bold">
              <p className="font-extrabold text-red-850 dark:text-red-400 mb-1">⚖️ 注意：本AI情報の限界と法解釈について</p>
              <p>当アプリが提供する法規の解説・アドバイスは、AIによる一般的な事例に基づくシュミレーションです。いかなる法解釈の正当性も保証するものではなく、法的アドバイスに代わるものではありません。会社としての労働条件や規則改定、判断にあたっては、必ず最寄りの労働局、公共職業安定所（ハローワーク）、または弁護士や社会保険労務士などへ事前にご相談下さいますようお願い申し上げます。</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PestSearchPage;
