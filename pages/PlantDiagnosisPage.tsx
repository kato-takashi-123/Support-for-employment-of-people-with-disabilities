import React, { useState, useCallback, useRef, useEffect } from 'react';
import { PlantDiagnosis, AppSettings } from '../types';
import { diagnosePlantHealth, extractTextFromImage } from '../services/geminiService';
import { resizeImage } from '../lib/utils';
import { FormattedContent } from '../components/common/FormattedContent';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import {
  CameraIcon, ImageIcon, ObservationIcon, LeafIcon, PestControlIcon,
  FertilizingIcon, WateringIcon, WeatherIcon, VegetableSearchIcon,
  CopyIcon, CheckIcon, CloseIcon
} from '../components/Icons';
import { ApiCallHandler } from '../types';

type PageProps = {
  handleApiCall: ApiCallHandler;
  pageParams?: any;
  setPage: (page: string, params?: any) => void;
  settings: AppSettings;
  onSettingsChange: (newSettings: AppSettings) => void;
};

const PlantDiagnosisPage: React.FC<PageProps> = ({ handleApiCall, pageParams }) => {
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [result, setResult] = useState<PlantDiagnosis | null>(null);
  const [inputMode, setInputMode] = useState<'camera' | 'gallery'>('camera');
  const [concernText, setConcernText] = useState('');
  
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [isCopied, setIsCopied] = useState(false);
  const stopDiagnoseRef = useRef(false);

  // Initialize voice recognition
  const { isListening, startListening } = useVoiceRecognition({
    onResult: (text: string) => {
      setConcernText(prev => prev + (prev ? ' ' : '') + text);
    }
  });

  // Photo / File select logic
  const handleImageSelected = async (file: File | null) => {
    if (!file) return;
    setImageBase64(null);
    setOcrLoading(true);
    try {
        const resized = await resizeImage(file, 800000);
        setImageBase64(resized);
        
        // Automate Memo OCR transcription to help the user
        const mimeType = resized.match(/data:(.*);/)?.[1] || 'image/jpeg';
        const data = resized.split(',')[1];
        
        const text = await handleApiCall(() => extractTextFromImage(mimeType, data));
        if (text && text !== "テキストが見つかりませんでした") {
          setConcernText(prev => prev + (prev ? '\n' : '') + `【画像内メモの読み取り】:\n${text}`);
        }
    } catch(e) {
        console.error("Image resize or OCR failed", e);
        alert("画像の読み取り、または手書き文字起こしに失敗しました。");
    } finally {
        setOcrLoading(false);
    }
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageSelected(e.target.files?.[0] || null);
    if (e.target) e.target.value = '';
  };

  const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageSelected(e.target.files?.[0] || null);
    if (e.target) e.target.value = '';
  };

  const handleStopDiagnose = () => {
    stopDiagnoseRef.current = true;
    setIsLoading(false);
  };

  const handleConsult = useCallback(async () => {
    if (!concernText.trim() && !imageBase64) {
      alert("相談内容を入力するか、参考メモ画像を配置してください。");
      return;
    }
    stopDiagnoseRef.current = false;
    setIsLoading(true);
    setResult(null);
    try {
      let imagePart: { mimeType: string; data: string } | null = null;
      if (imageBase64) {
        const mimeType = imageBase64.match(/data:(.*);/)?.[1] || 'image/jpeg';
        const data = imageBase64.split(',')[1];
        imagePart = { mimeType, data };
      }
      if (stopDiagnoseRef.current) return;
      const advice = await handleApiCall(() => diagnosePlantHealth(imagePart, concernText));
      if (stopDiagnoseRef.current) return;
      if (advice) {
        setResult(advice);
      }
    } catch (e) {
      console.error(e);
      if (!stopDiagnoseRef.current) {
        alert("AIへの相談中にエラーが発生しました。時間を置いてやり直してください。");
      }
    } finally {
      setIsLoading(false);
    }
  }, [imageBase64, concernText, handleApiCall]);

  const handleCopy = () => {
    if (!result) return;
    
    const textToCopy = `【相談概要】: ${result.plantName}\n`
      + `【対応優先度】: ${result.overallHealth}\n\n`
      + `【1. 障がい特性の状況分析】\n${result.pestAndDisease.details}\n`
      + `【2. 合理的配慮に基づく具体的アプローチ】\n${result.pestAndDisease.countermeasures}\n\n`
      + `【3. 農場長（指導員）の心構えと言葉かけ】\n${result.fertilizer.recommendation}\n\n`
      + `【4. サポート密度（見守り頻度）】\n状況: ${result.watering.status}\n推奨: ${result.watering.recommendation}\n\n`
      + `【5. 働く環境の物理的調整】\n${result.environment.recommendation}\n\n`
      + `※注意事項：本結果は一般的な支援アドバイスです。最終的には就労スタッフ個人の意思や適性を考慮して適宜調整してください。`;
      
    navigator.clipboard.writeText(textToCopy).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const AdviceBlock: React.FC<{ title: string; children: React.ReactNode; icon: React.FC<{className?: string}>; borderClass?: string; textClass?: string }> = ({ title, children, icon: Icon, borderClass = 'border-orange-350 dark:border-gray-650', textClass = 'text-orange-950' }) => (
      <div className={`bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-md border-2 ${borderClass}`}>
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 bg-orange-100 dark:bg-gray-700 rounded-lg">
            <Icon className="h-6 w-6 text-orange-700 dark:text-orange-300" />
          </div>
          <h3 className={`text-base sm:text-lg font-extrabold ${textClass} dark:text-orange-200`}>{title}</h3>
        </div>
        <div className="space-y-2 text-sm sm:text-base text-gray-950 dark:text-gray-100 font-bold pl-1 leading-relaxed">{children}</div>
      </div>
  );

  return (
    <>
      <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleCameraCapture} className="hidden" />
      <input type="file" accept="image/*" ref={galleryInputRef} onChange={handleGallerySelect} className="hidden" />
      
      <div className="p-4 space-y-4 max-w-xl mx-auto pb-12">
        {/* Welcome Block - High Contrast and Large Text */}
        <div className="bg-orange-700 text-white p-6 rounded-2xl shadow-md border-2 border-orange-850">
          <div className="space-y-2">
            <span className="bg-white/20 text-white text-xs sm:text-sm font-extrabold px-3 py-1 rounded-full border border-white/30">就労スタッフを支える頼れる相棒</span>
            <h2 className="text-xl sm:text-2xl font-black mt-2">農場長サポートAI相談窓口</h2>
            <p className="text-sm sm:text-base leading-relaxed font-bold text-orange-50">
              合理的配慮をベースに、知的、発達、精神障がいを持つ就労スタッフへのより良い接し方や作業の工夫を、AIにいつでも気軽に相談できます。
            </p>
          </div>
        </div>

        {/* Dynamic Consultation Form Card */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-md border-2 border-orange-200 dark:border-gray-700 space-y-4">
          <div className="space-y-1">
            <label className="block text-sm sm:text-base font-extrabold text-gray-950 dark:text-gray-100">相談・気になる状況の入力</label>
            <p className="text-xs sm:text-sm text-gray-900 dark:text-gray-200 font-bold">文字キーボード入力と、便利な音声入力の両方に対応しています。</p>
          </div>
          
          <div className="relative">
            <textarea
              value={concernText}
              onChange={e => setConcernText(e.target.value)}
              placeholder="（例）指示した作業をすぐに忘れてしまったり、途中でやめて作業場から外に出ていってしまいます。どのように声掛けして、作業環境を構造化すれば、仕事に集中できるようになるでしょうか？"
              className="w-full text-sm sm:text-base p-4 border-2 border-orange-300 dark:border-gray-650 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[140px] pb-14 font-bold"
            />
            {/* Voice Input Controller */}
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <button
                type="button"
                onClick={startListening}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs sm:text-sm font-extrabold transition-all ${
                  isListening 
                  ? 'bg-red-650 text-white animate-pulse border-2 border-red-400 shadow-md' 
                  : 'bg-orange-100 text-orange-950 hover:bg-orange-200 dark:bg-gray-650 dark:text-orange-200'
                }`}
                title="マイクに向かってお話しください"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <span>{isListening ? 'マイク音声録音中...' : '音声で入力する'}</span>
              </button>
            </div>
          </div>

          {/* Strict Security Photo Disclaimer */}
          <div className="bg-orange-100 p-4 rounded-xl border-2 border-orange-300 space-y-2">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-orange-950 font-extrabold">
              <span>⚠️ 人物撮影の禁止（個人情報の厳正な適正管理）</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-950 leading-relaxed font-bold">
              当アプリでの人物写真撮影や、就労スタッフを特定できる実名、顔写真のアップロードは<strong>固く禁止されています</strong>。手書き指示書や連絡ノート、メモなどの文字箇所のみを撮影・配置してください。
            </p>
          </div>

          {/* Image & Document Attachment Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs sm:text-sm font-extrabold text-gray-950 dark:text-gray-100">指示書やメモの写真を追加（任意）</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setInputMode('camera')}
                  className={`text-xs sm:text-sm px-3 py-1.5 rounded-md border-2 ${inputMode === 'camera' ? 'bg-orange-700 text-white border-transparent font-extrabold shadow-sm' : 'bg-gray-100 text-gray-950 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600'}`}
                >
                  カメラで撮影
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('gallery')}
                  className={`text-xs sm:text-sm px-3 py-1.5 rounded-md border-2 ${inputMode === 'gallery' ? 'bg-orange-700 text-white border-transparent font-extrabold shadow-sm' : 'bg-gray-100 text-gray-950 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600'}`}
                >
                  アルバムから選択
                </button>
              </div>
            </div>

            <div 
               className={`w-full ${imageBase64 ? 'h-36' : 'h-18'} border-2 border-dashed border-orange-300 dark:border-gray-600 rounded-xl flex flex-col items-center justify-center relative overflow-hidden cursor-pointer hover:bg-orange-50 dark:hover:bg-gray-750 transition-all`}
               onClick={() => { if (!imageBase64) { inputMode === 'camera' ? cameraInputRef.current?.click() : galleryInputRef.current?.click() } }}
            >
              {imageBase64 ? (
                <>
                  <img src={imageBase64} alt="相談補助メモ" className="h-full w-full object-contain rounded-xl" />
                  <button 
                    type="button" 
                    onClick={(e) => { e.stopPropagation(); setImageBase64(null); }} 
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1"
                  >
                    <CloseIcon className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2 text-gray-950 dark:text-gray-100 font-extrabold text-sm sm:text-base">
                  {inputMode === 'camera' ? (
                     <>
                       <CameraIcon className="w-5 h-5 text-orange-700 flex-shrink-0" />
                       <span>手書き指示書などを撮影する</span>
                     </>
                  ) : (
                     <>
                       <ImageIcon className="w-5 h-5 text-orange-700 flex-shrink-0" />
                       <span>メモ画像をフォルダから追加</span>
                     </>
                  )}
                </div>
              )}
            </div>
            {ocrLoading && (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-orange-700 dark:text-orange-400 font-extrabold animate-pulse justify-center">
                <span>🔍 画像の文字起こし（OCR解析中）...</span>
              </div>
            )}
          </div>

          {/* Action Trigger */}
          <button 
            type="button"
            onClick={handleConsult} 
            disabled={isLoading || (!concernText.trim() && !imageBase64)} 
            className="w-full bg-orange-700 hover:bg-orange-850 text-white font-extrabold py-3.5 px-4 rounded-xl disabled:bg-gray-300 disabled:text-gray-500 flex items-center justify-center gap-2 text-sm sm:text-base shadow-md transition-all"
          >
            <ObservationIcon className="h-6 w-6" />
            <span>AIに支援アドバイスをもらう</span>
          </button>
          
          {isLoading && (
            <div className="mt-2 flex items-center justify-center gap-4 text-center p-3 bg-gray-100 dark:bg-gray-700 rounded-xl">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-700"></div>
                <span className="font-extrabold text-gray-950 dark:text-gray-200 text-sm">合理的配慮アドバイスを生成中...</span>
                <button onClick={handleStopDiagnose} className="bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 rounded-full p-1 hover:bg-red-200">
                    <CloseIcon className="h-4 w-4" />
                </button>
            </div>
          )}
        </div>
        
        {/* Result Area */}
        {result && (
          <div className="space-y-4 fade-in relative pt-4">
            <div className="flex items-center justify-between flex-wrap gap-2 px-1">
              <span className="text-sm sm:text-base font-extrabold text-gray-955 dark:text-white">📄 AI雇用支援診断アドバイス結果</span>
              <button 
                onClick={handleCopy} 
                className="flex items-center gap-1.5 px-3 py-2 bg-orange-100 hover:bg-orange-200 dark:bg-gray-700 rounded-lg text-xs sm:text-sm font-extrabold text-orange-950 dark:text-orange-205 border-2 border-orange-300" 
                title="結果をコピー"
              >
                {isCopied ? <CheckIcon className="h-4 w-4 text-green-700 animate-bounce" /> : <CopyIcon className="h-4 w-4 text-orange-700" />}
                <span>{isCopied ? 'コピー完了' : '結果をクリップボードにコピー'}</span>
              </button>
            </div>

            {/* 1. 相談タイトルと対象の課題 */}
            <AdviceBlock title="相談概要の要約" icon={VegetableSearchIcon}>
              <p className="font-extrabold text-base sm:text-lg text-gray-950 dark:text-white">{result.plantName}</p>
            </AdviceBlock>
            
            {/* 2. 対応優先度・レベル */}
            <AdviceBlock title="サポート推奨レベル・緊迫度" icon={LeafIcon}>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-orange-100 dark:bg-orange-950 text-orange-950 dark:text-orange-300 text-sm sm:text-base font-extrabold rounded-lg border-2 border-orange-300">
                    {result.overallHealth}
                  </span>
                </div>
            </AdviceBlock>
            
            {/* 3. 障がい特性の状況分析 */}
            <AdviceBlock title="障がい特性から見た状況分析" icon={PestControlIcon}>
                <div className="bg-orange-50/40 dark:bg-gray-900/15 p-4 rounded-xl border-2 border-orange-200">
                  <p className="leading-relaxed text-sm sm:text-base text-gray-950 dark:text-gray-100 font-bold"><FormattedContent content={result.pestAndDisease.details} /></p>
                </div>
            </AdviceBlock>

            {/* 4. 合理的配慮に基づく具体的アプローチ */}
            <AdviceBlock title="合理的配慮に基づく具体的指示と工夫" icon={WateringIcon}>
                <div className="leading-relaxed text-sm sm:text-base text-gray-955 dark:text-gray-100 font-bold">
                  <FormattedContent content={result.pestAndDisease.countermeasures} />
                </div>
            </AdviceBlock>
            
            {/* 5. 農場長（サポートスタッフ）の心構えと言葉かけのコツ */}
            <AdviceBlock title="農場長の心構えと対話のアドバイス" icon={FertilizingIcon}>
                <div className="leading-relaxed text-sm sm:text-base text-gray-955 dark:text-gray-100 font-bold bg-stone-50/50 dark:bg-gray-900/10 p-4 rounded-xl border-2 border-stone-200">
                  <FormattedContent content={result.fertilizer.recommendation} />
                </div>
            </AdviceBlock>
            
            {/* 6. サポートのバランス */}
            <AdviceBlock title="支援指示・対話のバランス状態" icon={WeatherIcon}>
                <p className="font-extrabold text-sm sm:text-base mb-2 text-gray-955 dark:text-white">
                  現在のサポート強度判定: <span className="text-orange-700 font-black">{result.watering.status}</span>
                </p>
                <div className="leading-relaxed text-sm sm:text-base text-gray-955 dark:text-gray-100 font-bold">
                  <FormattedContent content={result.watering.recommendation} />
                </div>
            </AdviceBlock>
            
            {/* 7. 働く環境の物理的調整 */}
            <AdviceBlock title="働く作業環境の物理的調整・配慮" icon={WeatherIcon}>
                <div className="leading-relaxed text-sm sm:text-base text-gray-955 dark:text-gray-100 font-bold">
                  <FormattedContent content={result.environment.recommendation} />
                </div>
            </AdviceBlock>

            {/* Disclaimer disclaimer */}
            <div className="p-4 bg-red-100 dark:bg-red-955/20 text-gray-955 dark:text-gray-100 rounded-2xl text-xs sm:text-sm leading-relaxed border-2 border-red-400 font-bold">
              <p className="font-black text-red-950 dark:text-red-400 mb-1.5 text-sm sm:text-base">⚠️ 支援上の免責・注意事項</p>
              <p className="leading-relaxed">AIによるアドバイスは就労支援や合理的配慮における標準的な解釈や過去の良好例に基づく一般的な推奨事項です。就労スタッフには一人ひとり独自の個別特性があり、その日の体調、環境への適応度、本日の意思が絶えず優先されるべきです。本アドバイスを画一的に適用せず、必ず本人の意向確認やトライアルを重ねながら対応を調整していただくようお勧めいたします。また、開発者は本アプリの使用によって生じたいかなる結果や損害に対しても一切の責任を負いません。</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PlantDiagnosisPage;
