import React, { useState, useCallback, useRef, useEffect } from 'react';
import { PlantDiagnosis, AppSettings } from '../types';
import { diagnosePlantHealth, extractTextFromImage } from '../services/geminiService';
import { resizeImage, createThumbnail } from '../lib/utils';
import { FormattedContent } from '../components/common/FormattedContent';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import {
  CameraIcon, ImageIcon, ObservationIcon, LeafIcon, PestControlIcon,
  FertilizingIcon, WateringIcon, WeatherIcon, VegetableSearchIcon,
  CopyIcon, CheckIcon, CloseIcon, CalendarIcon, ChevronLeftIcon, ChevronRightIcon, TrashIcon
} from '../components/Icons';
import { ApiCallHandler } from '../types';

type PageProps = {
  handleApiCall: ApiCallHandler;
  pageParams?: any;
  setPage: (page: string, params?: any) => void;
  settings: AppSettings;
  onSettingsChange: (newSettings: AppSettings) => void;
};

const PlantDiagnosisPage: React.FC<PageProps> = ({ handleApiCall, pageParams, settings, onSettingsChange, setPage }) => {
  const isIOS = typeof window !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [result, setResult] = useState<PlantDiagnosis | null>(null);
  const [inputMode, setInputMode] = useState<'camera' | 'gallery'>('camera');
  const [concernText, setConcernText] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [isCopied, setIsCopied] = useState(false);
  const stopDiagnoseRef = useRef(false);

  // --- LOCAL HISTORY STORAGE & CALENDAR ENGINE ---
  interface LocalConsultation {
    id: string;
    timestamp: string;
    date: string; // YYYY-MM-DD
    question: string;
    imageBase64: string | null;
    answer: PlantDiagnosis;
  }

  const getLocalDateString = (dateObj: Date): string => {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const filterPastThreeMonths = (list: LocalConsultation[]): LocalConsultation[] => {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return list.filter(item => new Date(item.timestamp) >= threeMonthsAgo);
  };

  const [activeSubTab, setActiveSubTab] = useState<'consult' | 'history'>('consult');
  const [historyList, setHistoryList] = useState<LocalConsultation[]>([]);
  const [selectedHistoryDate, setSelectedHistoryDate] = useState<string | null>(null);
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);

  // Calendar Year/Month Navigation
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth()); // 0-indexed

  // Load history from localStorage on active tab change
  const loadHistory = useCallback(() => {
    try {
      const raw = localStorage.getItem('consultation_history_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        const filtered = filterPastThreeMonths(parsed);
        setHistoryList(filtered);
        if (filtered.length !== parsed.length) {
          localStorage.setItem('consultation_history_v1', JSON.stringify(filtered));
        }
      }
    } catch (e) {
      console.error("Failed to load history:", e);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory, activeSubTab]);

  const saveConsultationToStorage = async (question: string, imgBase64: string | null, advice: PlantDiagnosis) => {
    try {
      const raw = localStorage.getItem('consultation_history_v1');
      let currentHistory: LocalConsultation[] = raw ? JSON.parse(raw) : [];
      
      currentHistory = filterPastThreeMonths(currentHistory);
      
      // 保存用に画像を極小サムネイル（表示領域に合わせた最大160x160px、JPEG画質0.55、約5~10KB程度）に超軽量化
      let savedImg: string | null = null;
      if (imgBase64) {
        try {
          savedImg = await createThumbnail(imgBase64, 160, 160);
        } catch (thumbError) {
          console.error("Thumbnail conversion failed, fallback to original image size", thumbError);
          savedImg = imgBase64;
        }
      }

      const newEntry: LocalConsultation = {
        id: Math.random().toString(36).substring(2, 11),
        timestamp: new Date().toISOString(),
        date: getLocalDateString(new Date()),
        question,
        imageBase64: savedImg,
        answer: advice
      };
      
      currentHistory.unshift(newEntry);
      
      // localStorageの容量制限（約5MB）に安全に対処するための堅牢な保存ループ
      let savedSuccessfully = false;
      let attempt = 0;
      while (!savedSuccessfully && attempt < 10) {
        try {
          localStorage.setItem('consultation_history_v1', JSON.stringify(currentHistory));
          savedSuccessfully = true;
        } catch (quotaError: any) {
          attempt++;
          if (quotaError.name === 'QuotaExceededError' || quotaError.code === 22) {
            console.warn(`localStorage full. Attempt ${attempt}: stripping old images to make room...`);
            // 1件だけでなく、古い順に3件ずつまとめて画像のBase64を破棄して容量を確保する
            let strippedCount = 0;
            for (let i = currentHistory.length - 1; i >= 0; i--) {
              if (currentHistory[i].imageBase64) {
                currentHistory[i].imageBase64 = null;
                strippedCount++;
                if (strippedCount >= 3) break;
              }
            }
            // 画像を全て削ってもなおエラーが出る極端な場合は、最古のエントリー自体を削除して枠を空ける
            if (strippedCount === 0 && currentHistory.length > 1) {
              currentHistory.pop();
            }
          } else {
            throw quotaError;
          }
        }
      }
      setHistoryList(currentHistory);
    } catch (err) {
      console.error("Failed to save consultation:", err);
    }
  };

  const deleteHistoryEntry = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("この相談履歴を削除してもよろしいですか？")) return;
    try {
      const updated = historyList.filter(item => item.id !== id);
      localStorage.setItem('consultation_history_v1', JSON.stringify(updated));
      setHistoryList(updated);
      if (expandedHistoryId === id) setExpandedHistoryId(null);
    } catch (err) {
      console.error(err);
    }
  };

  // --- CALENDAR GRID LOGIC ---
  const startDayOfWeek = settings?.startOfWeek || 'monday';

  const totalDaysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayIndex = new Date(calYear, calMonth, 1).getDay();

  let offsetDays = 0;
  if (startDayOfWeek === 'sunday') {
    offsetDays = firstDayIndex;
  } else {
    offsetDays = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
  }

  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < offsetDays; i++) {
    calendarCells.push(null);
  }
  for (let day = 1; day <= totalDaysInMonth; day++) {
    calendarCells.push(day);
  }

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < calendarCells.length; i += 7) {
    weeks.push(calendarCells.slice(i, i + 7));
  }

  const prevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear(prev => prev - 1);
    } else {
      setCalMonth(prev => prev - 1);
    }
    setSelectedHistoryDate(null);
  };

  const nextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear(prev => prev + 1);
    } else {
      setCalMonth(prev => prev + 1);
    }
    setSelectedHistoryDate(null);
  };

  const resetToToday = () => {
    const today = new Date();
    setCalYear(today.getFullYear());
    setCalMonth(today.getMonth());
    setSelectedHistoryDate(getLocalDateString(today));
  };

  const getHistoryCountForDay = (day: number) => {
    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return historyList.filter(item => item.date === dateStr).length;
  };

  const filteredHistory = historyList.filter(item => {
    const q = historySearchQuery.trim().toLowerCase();
    if (!q) return true;
    
    return (
      item.question.toLowerCase().includes(q) ||
      (item.answer.plantName && item.answer.plantName.toLowerCase().includes(q)) ||
      (item.answer.overallHealth && item.answer.overallHealth.toLowerCase().includes(q)) ||
      (item.answer.pestAndDisease?.details && item.answer.pestAndDisease.details.toLowerCase().includes(q)) ||
      (item.answer.pestAndDisease?.countermeasures && item.answer.pestAndDisease.countermeasures.toLowerCase().includes(q)) ||
      (item.answer.fertilizer?.recommendation && item.answer.fertilizer.recommendation.toLowerCase().includes(q)) ||
      (item.answer.watering?.recommendation && item.answer.watering.recommendation.toLowerCase().includes(q)) ||
      (item.answer.environment?.recommendation && item.answer.environment.recommendation.toLowerCase().includes(q))
    );
  });
  // --- END OF LOCAL HISTORY ENGINE ---

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
    try {
        // スマホのメモリ不足（クラッシュ）を強力に防止し、通信時間を極限まで短縮するため、
        // 30万画素（約640x480相当）に制限します。これにより転送サイズが95%以上削減され爆速になります。
        const resized = await resizeImage(file, 300000);
        setImageBase64(resized);
    } catch(e) {
        console.error("Image resize failed", e);
        alert("画像の読み取りに失敗しました。スマホの電波状態の良い場所で、もう一度やり直してください。");
    }
  };

  // Explicit manual trigger for OCR to save precious API quota
  const handleRunOcr = async () => {
    if (!imageBase64) return;
    setOcrLoading(true);
    try {
        const mimeType = imageBase64.match(/data:(.*);/)?.[1] || 'image/jpeg';
        const data = imageBase64.split(',')[1];
        
        const text = await handleApiCall(() => extractTextFromImage(mimeType, data));
        if (text && text !== "テキストが見つかりませんでした") {
          setConcernText(prev => prev + (prev ? '\n' : '') + `【画像内メモの読み取り】:\n${text}`);
        } else {
          alert("画像からテキストが検出されませんでした。");
        }
    } catch(e: any) {
        console.error("OCR failed", e);
        alert(e?.message || "手書き文字起こしに失敗しました。APIの上限、またはネットワーク接続を確認してください。");
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
      setError("相談内容を入力するか、参考メモ画像を配置してください。");
      return;
    }
    stopDiagnoseRef.current = false;
    setIsLoading(true);
    setResult(null);
    setError(null);
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
        await saveConsultationToStorage(concernText, imageBase64, advice);
      }
    } catch (e: any) {
      console.error(e);
      if (!stopDiagnoseRef.current) {
        setError(e?.message || "AIへの相談中に一時的なエラーが発生したか、通信がタイムアウトしました。画像のファイルサイズは自動で極限まで軽量化されていますので、スマホの電波状態の良い場所でもう一度「相談する」ボタンをタップしてお試しください。");
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

  const listToRender = selectedHistoryDate 
    ? historyList.filter(item => item.date === selectedHistoryDate)
    : filteredHistory;

  const renderHistoryList = () => {
    if (listToRender.length === 0) {
      return (
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl border-2 border-orange-150 text-gray-500 font-bold">
          {selectedHistoryDate 
            ? `📅 ${selectedHistoryDate} の相談履歴はありません。`
            : historySearchQuery 
            ? "🔍 検索条件に一致する履歴が見つかりませんでした。"
            : "📅 まだ相談履歴がありません。新規相談からAIに相談してみましょう！"
          }
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <h4 className="text-xs sm:text-sm font-black text-gray-800 dark:text-gray-300 pl-1">
          {selectedHistoryDate 
            ? `📅 ${selectedHistoryDate} の相談履歴 (${listToRender.length}件)`
            : historySearchQuery 
            ? `🔍 検索結果 (${listToRender.length}件)`
            : `📋 直近の相談履歴 (過去3ヶ月・全${listToRender.length}件)`
          }
        </h4>
        
        {listToRender.map(item => {
          const isExpanded = expandedHistoryId === item.id;
          let formattedTime = "";
          try {
            formattedTime = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          } catch(e) {
            formattedTime = "";
          }

          return (
            <div 
              key={item.id}
              className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-orange-200 dark:border-gray-700 shadow-sm overflow-hidden transition-all duration-300"
            >
              <div 
                onClick={() => setExpandedHistoryId(isExpanded ? null : item.id)}
                className="p-4 cursor-pointer hover:bg-orange-50/30 dark:hover:bg-gray-750 flex items-start justify-between gap-3 select-none"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono text-gray-400">
                    <span>📅 {item.date} {formattedTime}</span>
                    <span className="px-1.5 py-0.5 bg-orange-100 dark:bg-gray-700 text-orange-950 dark:text-orange-300 rounded font-extrabold text-[9px]">
                      {item.answer.overallHealth}
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-black text-gray-900 dark:text-white line-clamp-2">
                    {item.answer.plantName}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-300 line-clamp-2 font-medium">
                    問: {item.question}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 pt-1">
                  <button
                    onClick={(e) => deleteHistoryEntry(item.id, e)}
                    className="p-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg dark:bg-red-950/30 dark:text-red-300"
                    title="履歴を削除"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                  <span className="text-gray-400 font-black text-xs">
                    {isExpanded ? '▲' : '▼'}
                  </span>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-orange-100 dark:border-gray-700 bg-orange-50/10 dark:bg-gray-900/10 p-4 space-y-4 animate-fadeIn">
                  <div className="flex justify-end">
                    <button 
                      onClick={() => {
                        const textToCopy = `【相談概要】: ${item.answer.plantName}\n`
                          + `【対応優先度】: ${item.answer.overallHealth}\n\n`
                          + `【1. 障がい特性の状況分析】\n${item.answer.pestAndDisease.details}\n`
                          + `【2. 合理的配慮に基づく具体的アプローチ】\n${item.answer.pestAndDisease.countermeasures}\n\n`
                          + `【3. 農場長（指導員）の心構えと言葉かけ】\n${item.answer.fertilizer.recommendation}\n\n`
                          + `【4. サポート密度（見守り頻度）】\n状況: ${item.answer.watering.status}\n推奨: ${item.answer.watering.recommendation}\n\n`
                          + `【5. 働く環境の物理的調整】\n${item.answer.environment.recommendation}\n\n`
                          + `※注意事項：本結果は一般的な支援アドバイスです。最終的には就労スタッフ個人の意思や適性を考慮して適宜調整してください。`;
                        navigator.clipboard.writeText(textToCopy).then(() => {
                          alert("クリップボードにコピーしました！");
                        });
                      }} 
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-orange-100 dark:bg-gray-700 rounded-lg text-xs font-extrabold text-orange-950 dark:text-orange-200 border border-orange-300 shadow-sm"
                    >
                      <CopyIcon className="h-3.5 w-3.5 text-orange-700" />
                      <span>結果をコピー</span>
                    </button>
                  </div>

                  <div className="space-y-1 p-3 bg-white dark:bg-gray-800 rounded-xl border border-orange-150">
                    <h5 className="text-[11px] font-black text-orange-850">❓ 相談内容の入力</h5>
                    <p className="text-xs sm:text-sm text-gray-800 dark:text-gray-200 font-bold whitespace-pre-wrap">
                      {item.question}
                    </p>
                    {item.imageBase64 && (
                      <div className="mt-2 max-h-36 overflow-hidden rounded-lg border border-orange-100">
                        <img src={item.imageBase64} alt="相談メモ画像" className="object-contain max-h-36 w-auto" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="bg-white dark:bg-gray-850 p-4 rounded-xl border border-orange-200 shadow-xs space-y-1.5">
                      <h5 className="text-xs font-black text-orange-950 flex items-center gap-1.5">
                        <div className="h-5 w-5 flex-shrink-0 text-orange-700 flex items-center justify-center">
                          <LeafIcon className="h-full w-full" />
                        </div>
                        <span>サポート推奨レベル・緊迫度</span>
                      </h5>
                      <p className="text-xs text-gray-700 dark:text-gray-300 font-bold">{item.answer.overallHealth}</p>
                    </div>

                    <div className="bg-white dark:bg-gray-850 p-4 rounded-xl border border-orange-200 shadow-xs space-y-1.5">
                      <h5 className="text-xs font-black text-orange-950 flex items-center gap-1.5">
                        <div className="h-5 w-5 flex-shrink-0 text-orange-700 flex items-center justify-center">
                          <PestControlIcon className="h-full w-full" />
                        </div>
                        <span>障がい特性から見た状況分析</span>
                      </h5>
                      <div className="text-xs text-gray-700 dark:text-gray-300 font-bold whitespace-pre-wrap leading-relaxed">
                        <FormattedContent content={item.answer.pestAndDisease.details} />
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-850 p-4 rounded-xl border border-orange-200 shadow-xs space-y-1.5">
                      <h5 className="text-xs font-black text-orange-950 flex items-center gap-1.5">
                        <div className="h-5 w-5 flex-shrink-0 text-orange-700 flex items-center justify-center">
                          <WateringIcon className="h-full w-full" />
                        </div>
                        <span>合理的配慮に基づく具体的指示と工夫</span>
                      </h5>
                      <div className="text-xs text-gray-700 dark:text-gray-300 font-bold whitespace-pre-wrap leading-relaxed">
                        <FormattedContent content={item.answer.pestAndDisease.countermeasures} />
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-850 p-4 rounded-xl border border-orange-200 shadow-xs space-y-1.5">
                      <h5 className="text-xs font-black text-orange-950 flex items-center gap-1.5">
                        <div className="h-5 w-5 flex-shrink-0 text-orange-700 flex items-center justify-center">
                          <FertilizingIcon className="h-full w-full" />
                        </div>
                        <span>農場長の心構えと対話のアドバイス</span>
                      </h5>
                      <div className="text-xs text-gray-700 dark:text-gray-300 font-bold whitespace-pre-wrap leading-relaxed">
                        <FormattedContent content={item.answer.fertilizer.recommendation} />
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-850 p-4 rounded-xl border border-orange-200 shadow-xs space-y-1.5">
                      <h5 className="text-xs font-black text-orange-950 flex items-center gap-1.5">
                        <div className="h-5 w-5 flex-shrink-0 text-orange-700 flex items-center justify-center">
                          <WeatherIcon className="h-full w-full" />
                        </div>
                        <span>支援指示・対話のバランス状態 ({item.answer.watering.status})</span>
                      </h5>
                      <div className="text-xs text-gray-700 dark:text-gray-300 font-bold whitespace-pre-wrap leading-relaxed">
                        <FormattedContent content={item.answer.watering.recommendation} />
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-850 p-4 rounded-xl border border-orange-200 shadow-xs space-y-1.5">
                      <h5 className="text-xs font-black text-orange-950 flex items-center gap-1.5">
                        <div className="h-5 w-5 flex-shrink-0 text-orange-700 flex items-center justify-center">
                          <WeatherIcon className="h-full w-full" />
                        </div>
                        <span>働く作業環境の物理的調整・配慮</span>
                      </h5>
                      <div className="text-xs text-gray-700 dark:text-gray-300 font-bold whitespace-pre-wrap leading-relaxed">
                        <FormattedContent content={item.answer.environment.recommendation} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <input type="file" accept="image/*" capture={isIOS ? undefined : "environment"} ref={cameraInputRef} onChange={handleCameraCapture} className="hidden" />
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

        {/* Sub-Tab Selector */}
        <div className="flex bg-white dark:bg-gray-800 p-1 rounded-2xl border-2 border-orange-200 dark:border-gray-700 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveSubTab('consult')}
            className={`flex-1 py-3 text-xs sm:text-sm font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeSubTab === 'consult'
                ? 'bg-orange-700 text-white shadow-sm font-black'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <span>💬 新規相談窓口</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('history')}
            className={`flex-1 py-3 text-xs sm:text-sm font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeSubTab === 'history'
                ? 'bg-orange-700 text-white shadow-sm font-black'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <span>📅 過去の相談履歴</span>
          </button>
        </div>

        {activeSubTab === 'consult' ? (
          <>
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
                      ? 'bg-red-600 text-white animate-pulse border-2 border-red-400 shadow-md' 
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
                  <span className="text-xs sm:text-sm font-extrabold text-gray-955 dark:text-gray-100">指示書やメモの写真を追加（任意）</span>
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
                    <div className="flex items-center gap-2 text-gray-955 dark:text-gray-100 font-extrabold text-sm sm:text-base">
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
                {imageBase64 && !ocrLoading && (
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={handleRunOcr}
                      className="text-xs font-extrabold bg-orange-50 hover:bg-orange-100 dark:bg-gray-750 text-orange-950 dark:text-orange-200 px-3 py-2 rounded-lg border border-orange-250 dark:border-gray-650 flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      📝 画像から文字を自動書き起こし（任意）
                    </button>
                  </div>
                )}
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
                  className="w-full bg-orange-700 hover:bg-orange-850 text-white font-extrabold py-3.5 px-4 rounded-xl disabled:bg-gray-300 disabled:text-gray-500 flex items-center justify-center gap-2 text-sm sm:text-base shadow-md transition-all animate-none active:scale-[0.99]"
                >
                  <ObservationIcon className="h-6 w-6" />
                  <span>AIに支援アドバイスをもらう</span>
              </button>

              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-955/30 text-red-950 dark:text-red-300 rounded-xl border-2 border-red-200 text-xs sm:text-sm font-bold space-y-2">
                  <p className="font-extrabold flex items-center gap-2">
                    <span>⚠️ エラーが発生しました</span>
                  </p>
                  <p className="leading-relaxed">{error}</p>
                  <p className="font-bold text-[11px] text-gray-800 dark:text-gray-300">
                    ※解決方法：APIキーが未設定、または無効である可能性があります。「設定」メニューから正しいGemini APIキーを入力して設定を保存してください。
                  </p>
                </div>
              )}
              
              {isLoading && (
                <div className="mt-2 flex items-center justify-center gap-4 text-center p-3 bg-gray-100 dark:bg-gray-700 rounded-xl">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-700"></div>
                    <span className="font-extrabold text-gray-955 dark:text-gray-200 text-sm">合理的配慮アドバイスを生成中...</span>
                    <button onClick={handleStopDiagnose} className="bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 rounded-full p-1 hover:bg-red-200">
                        <CloseIcon className="h-4 w-4" />
                    </button>
                </div>
              )}
            </div>
            
            {/* Result Area */}
            {result && (
              <div className="space-y-4 fade-in relative pt-4 animate-fadeIn">
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
                      <p className="leading-relaxed text-sm sm:text-base text-gray-955 dark:text-gray-100 font-bold"><FormattedContent content={result.pestAndDisease.details} /></p>
                    </div>
                </AdviceBlock>

                {/* 4. 合い特性に基づく具体的アプローチ */}
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

                {/* Disclaimer card */}
                <div className="p-4 bg-red-100 dark:bg-red-955/20 text-gray-955 dark:text-gray-100 rounded-2xl text-xs sm:text-sm leading-relaxed border-2 border-red-400 font-bold">
                  <p className="font-black text-red-950 dark:text-red-400 mb-1.5 text-sm sm:text-base">⚠️ 支援上の免責・注意事項</p>
                  <p className="leading-relaxed">AIによるアドバイスは就労支援や合理的配慮における標準的な解釈や過去の良好例に基づく一般的な推奨事項です。就労スタッフには一人ひとり独自の個別特性があり、その日の体調、環境への適応度、本日の意思が絶えず優先されるべきです。本アドバイスを画一的に適用せず、必ず本人の意向確認やトライアルを重ねながら対応を調整していただくようお勧めいたします。また、開発者は本アプリの使用によって生じたいかなる結果や損害に対しても一切の責任を負いません。</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4 animate-fadeIn">
            {/* Search Bar */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border-2 border-orange-200 dark:border-gray-700 space-y-3 shadow-sm">
              <div className="relative">
                <input
                  type="text"
                  value={historySearchQuery}
                  onChange={e => {
                    setHistorySearchQuery(e.target.value);
                    setSelectedHistoryDate(null);
                  }}
                  placeholder="🔎 過去の相談内容・アドバイス結果を検索..."
                  className="w-full text-xs sm:text-sm p-3 pl-10 border border-orange-350 dark:border-gray-650 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-bold"
                />
                <span className="absolute left-3.5 top-3.5 text-gray-400">🔍</span>
                {historySearchQuery && (
                  <button
                    onClick={() => setHistorySearchQuery('')}
                    className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 font-bold text-xs"
                  >
                    消去
                  </button>
                )}
              </div>
            </div>

            {/* Calendar UI (shown only when NOT searching) */}
            {!historySearchQuery && (
              <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border-2 border-orange-200 dark:border-gray-700 shadow-sm space-y-4">
                <div className="flex items-center justify-between px-1">
                  <button 
                    onClick={prevMonth}
                    className="p-1.5 hover:bg-orange-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 font-black"
                    type="button"
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-gray-100">
                      📅 {calYear}年 {calMonth + 1}月
                    </h3>
                    <button
                      onClick={resetToToday}
                      className="text-[10px] font-black text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/50 px-2 py-0.5 rounded-full hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-all active:scale-[0.95]"
                      type="button"
                    >
                      今日
                    </button>
                  </div>
                  <button 
                    onClick={nextMonth}
                    className="p-1.5 hover:bg-orange-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 font-black"
                    type="button"
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="grid grid-cols-7 text-center text-xs font-black text-gray-500 dark:text-gray-400 pb-1 border-b">
                  {startDayOfWeek === 'monday' 
                    ? ['月', '火', '水', '木', '金', '土', '日'].map(d => <div key={d}>{d}</div>)
                    : ['日', '月', '火', '水', '木', '金', '土'].map(d => <div key={d}>{d}</div>)
                  }
                </div>

                <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center">
                  {weeks.map((week, wIdx) => (
                    <React.Fragment key={wIdx}>
                      {week.map((day, dIdx) => {
                        if (day === null) {
                          return <div key={`empty-${dIdx}`} />;
                        }

                        const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const count = getHistoryCountForDay(day);
                        const isSelected = selectedHistoryDate === dateStr;
                        const isToday = getLocalDateString(new Date()) === dateStr;

                        return (
                          <button
                            key={`day-${day}`}
                            type="button"
                            onClick={() => setSelectedHistoryDate(isSelected ? null : dateStr)}
                            className={`relative py-2 rounded-xl text-xs sm:text-sm font-extrabold flex flex-col items-center justify-center transition-all ${
                              isSelected 
                                ? 'bg-orange-700 text-white shadow-md scale-105' 
                                : isToday
                                ? 'bg-orange-100 text-orange-950 border border-orange-400 dark:bg-gray-700 dark:text-orange-250'
                                : 'text-gray-800 dark:text-gray-200 hover:bg-orange-50/50 dark:hover:bg-gray-700/50'
                            }`}
                          >
                            <span>{day}</span>
                            {count > 0 && (
                              <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-orange-600'}`} />
                            )}
                          </button>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}

            {/* List area */}
            {renderHistoryList()}
          </div>
        )}
      </div>
    </>
  );
};

export default PlantDiagnosisPage;
