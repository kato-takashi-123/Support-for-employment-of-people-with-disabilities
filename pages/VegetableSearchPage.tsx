import React, { useState, useEffect, useRef } from 'react';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { MicrophoneIcon, CloseIcon } from '../components/Icons';

type EmergencyTopic = 'heatstroke' | 'cpr' | 'epilepsy' | 'stretcher';

const VegetableSearchPage: React.FC = () => {
  const [activeTopic, setActiveTopic] = useState<EmergencyTopic>('heatstroke');
  const [timerActive, setTimerActive] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [memoText, setMemoText] = useState('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Voice recognition for hands-free dictation during emergencies
  const { isListening, startListening } = useVoiceRecognition({
    onResult: (text: string) => {
      setMemoText(prev => prev + (prev ? ' ' : '') + text);
    }
  });

  // Timer stopwatch logic
  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive]);

  const handleResetTimer = () => {
    setTimerActive(false);
    setElapsedSeconds(0);
  };

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const topics = [
    { id: 'heatstroke', title: '🥵 熱中症の予防と対応' },
    { id: 'cpr', title: '🩻 心肺蘇生とAED' },
    { id: 'epilepsy', title: '🧠 てんかん発作対応' },
    { id: 'stretcher', title: '🪵 担架の使い方' },
  ];

  return (
    <div className="p-4 space-y-4 max-w-xl mx-auto pb-12">
      {/* Absolute Header Alert & Legal Disclaimer with Extreme Contrast for Safety */}
      <div className="bg-red-100 dark:bg-red-950/40 p-5 rounded-2xl border-2 border-red-500 space-y-2">
        <p className="font-extrabold text-red-950 dark:text-red-400 flex items-center gap-1.5 text-base sm:text-lg">
          <span>⚠️ 救命最優先：マニュアル注意事項</span>
        </p>
        <p className="text-sm sm:text-base text-gray-950 dark:text-gray-100 leading-relaxed font-extrabold">
          本マニュアルは救命対応の基礎手順を視覚的に整理したものであり、実際の医療指導ではありません。急変時は迷わずただちに119番通報を行い、周囲に助けを求めてください。人命救助を最優先で行うものとします。
        </p>
      </div>

      {/* Topics Selector Grid - Large Buttons with Bold Font */}
      <div className="grid grid-cols-2 gap-2">
        {topics.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTopic(t.id as EmergencyTopic)}
            className={`p-3.5 rounded-xl border-2 text-sm sm:text-base font-extrabold transition-all text-center ${
              activeTopic === t.id
                ? 'bg-orange-700 text-white border-transparent shadow-md font-extrabold'
                : 'bg-white text-gray-950 border-orange-200 hover:bg-orange-50 dark:bg-gray-700 dark:text-white dark:border-gray-650'
            }`}
          >
            {t.title}
          </button>
        ))}
      </div>

      {/* Interactive Emergency Flowcharts with High Contrast and Heavy Weights */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-md border-2 border-orange-200 dark:border-gray-750 space-y-4">
        {activeTopic === 'heatstroke' && (
          <div className="space-y-3">
            <h3 className="font-extrabold text-orange-950 dark:text-orange-200 text-base sm:text-lg border-b-2 border-orange-200 pb-1.5 flex items-center gap-2">
              <span>🥵</span> <span>熱中症の応急手順（最優先）</span>
            </h3>
            
            {/* Step 1 */}
            <div className="p-4 bg-orange-50 dark:bg-gray-950/30 rounded-xl border-2 border-orange-200 flex items-start gap-3">
              <span className="w-8 h-8 bg-orange-700 text-white text-base font-extrabold rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
              <div>
                <p className="font-extrabold text-sm sm:text-base text-gray-950 dark:text-white mb-1">① 意識と会話のレベルを迅速に確認</p>
                <p className="text-sm sm:text-base text-gray-950 dark:text-gray-100 leading-relaxed font-bold">声をかけて適切な返答ができるか。はっきりした受け答えができるかを確認します。</p>
              </div>
            </div>
            <div className="text-center text-orange-650 font-extrabold text-xl">&#x2193;</div>

            {/* Step 2 */}
            <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-xl border-2 border-red-200 flex items-start gap-3">
              <span className="w-8 h-8 bg-red-650 text-white text-base font-extrabold rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
              <div>
                <p className="font-extrabold text-sm sm:text-base text-red-950 dark:text-red-300 mb-1">② 意識・返答が怪しい場合</p>
                <p className="text-sm sm:text-base text-red-900 dark:text-red-400 leading-relaxed font-extrabold bg-red-100 dark:bg-red-900/30 px-3 py-1.5 rounded-lg border border-red-200">
                  即座に119番通報！救急隊を待つ間に体を冷やす応急処置を開始します。
                </p>
              </div>
            </div>
            <div className="text-center text-orange-650 font-extrabold text-xl">&#x2193;</div>

            {/* Step 3 */}
            <div className="p-4 bg-orange-50 dark:bg-gray-950/30 rounded-xl border-2 border-orange-200 flex items-start gap-3">
              <span className="w-8 h-8 bg-orange-700 text-white text-base font-extrabold rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
              <div>
                <p className="font-extrabold text-sm sm:text-base text-gray-950 dark:text-white mb-1">③ 自力で会話可能な場合の応急処置</p>
                <ul className="text-sm sm:text-base text-gray-950 dark:text-gray-150 space-y-2 list-disc list-outside pl-5 mt-1.5 font-bold">
                  <li><strong>涼しい場所：</strong>すぐに風通しの良い日陰やエアコンの効いた車内・室内へ。</li>
                  <li><strong>衣類を緩める：</strong>襟元、ベルトを極力緩めて体に風を当てます。</li>
                  <li><strong>急冷処置：</strong>冷たいペットボトル等を太い血管が通る「首・両脇・両太もも付け根」に当てて冷やします。</li>
                  <li><strong>水分・塩分補給：</strong>自力で飲める場合にのみ、スポーツドリンク等を与えます。（半昏睡時は窒息・誤嚥防止で絶対に飲ませないこと！）</li>
                </ul>
              </div>
            </div>
            <div className="text-center text-orange-650 font-extrabold text-xl">&#x2193;</div>

            {/* Step 4 */}
            <div className="p-4 bg-green-50/70 dark:bg-green-950/20 rounded-xl border-2 border-green-300 flex items-start gap-3">
              <span className="w-8 h-8 bg-green-600 text-white text-base font-extrabold rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
              <div>
                <p className="font-extrabold text-sm sm:text-base text-gray-955 dark:text-white mb-1">④ 経過観察と病院搬送</p>
                <p className="text-sm sm:text-base text-gray-950 dark:text-gray-100 leading-relaxed font-bold">30分経っても症状が改善しない、または吐き戻してしまう（嘔吐）場合は直ちに病院へ搬送してください。</p>
              </div>
            </div>
          </div>
        )}

        {activeTopic === 'cpr' && (
          <div className="space-y-3">
            <h3 className="font-extrabold text-orange-950 dark:text-orange-200 text-base sm:text-lg border-b-2 border-orange-200 pb-1.5 flex items-center gap-2">
              <span>🩻</span> <span>心肺蘇生(CPR)とAEDの迅速フロー</span>
            </h3>

            {/* Step 1 */}
            <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-xl border-2 border-red-200 flex items-start gap-3">
              <span className="w-8 h-8 bg-red-650 text-white text-base font-extrabold rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
              <div>
                <p className="font-extrabold text-sm sm:text-base text-red-900 dark:text-red-400 mb-1">① 周囲の安全確認 ＆ 役割・応援要請</p>
                <p className="text-sm sm:text-base text-gray-950 dark:text-gray-100 font-bold leading-relaxed">「誰か来てください！」「あなたは119番を、あなたはそこのAEDを持ってきてください！」と具体的に指差して指示します。</p>
              </div>
            </div>
            <div className="text-center text-orange-650 font-extrabold text-xl">&#x2193;</div>

            {/* Step 2 */}
            <div className="p-4 bg-orange-50 dark:bg-gray-950/30 rounded-xl border-2 border-orange-200 flex items-start gap-3">
              <span className="w-8 h-8 bg-orange-700 text-white text-base font-extrabold rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
              <div>
                <p className="font-extrabold text-sm sm:text-base text-gray-955 dark:text-white mb-1">② 10秒以内での呼吸有無の確認</p>
                <p className="text-sm sm:text-base text-gray-950 dark:text-gray-150 font-bold leading-relaxed">胸と腹部の動きを目視します。あえぐような変な呼吸（死戦期呼吸）は、呼吸なしとみなして即座に胸骨圧迫へ移行します。</p>
              </div>
            </div>
            <div className="text-center text-orange-650 font-extrabold text-xl">&#x2193;</div>

            {/* Step 3 */}
            <div className="p-4 bg-orange-50 dark:bg-gray-950/30 rounded-xl border-2 border-orange-300 flex items-start gap-3">
              <span className="w-8 h-8 bg-orange-700 text-white text-base font-extrabold rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
              <div>
                <p className="font-extrabold text-sm sm:text-base text-gray-955 dark:text-white mb-1">③ 全力で胸骨圧迫の開始（絶え間なく）</p>
                <p className="text-sm sm:text-base text-gray-950 dark:text-gray-150 font-bold leading-relaxed">
                  胸の真ん中を、<strong>強さ5cm沈むように</strong>、<strong>1分間に100〜120回のテンポ（アンパンマンの曲のスピード）</strong>で、しっかり絶え間なく30回強く押します（可能な場合は人工呼吸2回を交互に）。
                </p>
              </div>
            </div>
            <div className="text-center text-orange-650 font-extrabold text-xl">&#x2193;</div>

            {/* Step 4 */}
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl border-2 border-blue-200 flex items-start gap-3">
              <span className="w-8 h-8 bg-blue-600 text-white text-base font-extrabold rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
              <div>
                <p className="font-extrabold text-sm sm:text-base text-gray-955 dark:text-white mb-1">④ AEDの併用とガイド実行</p>
                <p className="text-sm sm:text-base text-gray-950 dark:text-gray-150 font-bold leading-relaxed">
                  AEDが到着したら電源を入れ、アナウンスの指示（貼り付け・体から離れて放電ボタン押下など）に完全に従います。放電直後に再度胸骨圧迫を直ちに再開してください。
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTopic === 'epilepsy' && (
          <div className="space-y-3">
            <h3 className="font-extrabold text-orange-950 dark:text-orange-200 text-base sm:text-lg border-b-2 border-orange-200 pb-1.5 flex items-center gap-2">
              <span>🧠</span> <span>てんかん発作への対処フロー</span>
            </h3>

            {/* Step 1 */}
            <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-xl border-2 border-red-200 flex items-start gap-3">
              <span className="w-8 h-8 bg-red-600 text-white text-base font-extrabold rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
              <div>
                <p className="font-extrabold text-sm sm:text-base text-red-900 dark:text-red-400 mb-1">① 落ち着いて対応。口には絶対に物を挟まない！</p>
                <p className="text-sm sm:text-base text-red-950 dark:text-red-400 leading-relaxed font-extrabold bg-red-100/50 p-2.5 rounded-lg border-2 border-red-200">
                  ⚠️ 口腔内にハサミや割り箸などを押し込むのは窒息を招くため絶対に禁止です！口は閉じさせてそのままにしてください。
                </p>
              </div>
            </div>
            <div className="text-center text-orange-650 font-extrabold text-xl">&#x2193;</div>

            {/* Step 2 */}
            <div className="p-4 bg-orange-50 dark:bg-gray-950/30 rounded-xl border-2 border-orange-200 flex items-start gap-3">
              <span className="w-8 h-8 bg-orange-700 text-white text-base font-extrabold rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
              <div>
                <p className="font-extrabold text-sm sm:text-base text-gray-955 dark:text-white mb-1">② 周囲の危険物撤去 ＆ 頭の保護</p>
                <p className="text-sm sm:text-base text-gray-950 dark:text-gray-150 font-bold leading-relaxed">周囲の農具、石材、カゴ等に本人が当たるのを防ぐため周囲を空けます。頭の下に柔らかい上着やタオルなどをそっと敷きます。</p>
              </div>
            </div>
            <div className="text-center text-orange-650 font-extrabold text-xl">&#x2193;</div>

            {/* Step 3 */}
            <div className="p-4 bg-orange-50 dark:bg-gray-950/30 rounded-xl border-2 border-orange-200 flex items-start gap-3">
              <span className="w-8 h-8 bg-orange-700 text-white text-base font-extrabold rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
              <div>
                <p className="font-extrabold text-sm sm:text-base text-gray-955 dark:text-white mb-1">③ 側臥位（横向き）で気道を確保</p>
                <p className="text-sm sm:text-base text-gray-950 dark:text-gray-150 font-bold leading-relaxed">体や顔をそっと「横向き（回復体位）」にして、唾液や泡が喉に詰まらず、自然に口の外へ流れるようにします。発作開始時刻を時計・タイマーで正確に計りましょう。</p>
              </div>
            </div>
            <div className="text-center text-orange-650 font-extrabold text-xl">&#x2193;</div>

            {/* Step 4 */}
            <div className="p-4 bg-green-50/70 dark:bg-green-950/20 rounded-xl border-2 border-green-300 flex items-start gap-3">
              <span className="w-8 h-8 bg-green-600 text-white text-base font-extrabold rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
              <div>
                <p className="font-extrabold text-sm sm:text-base text-gray-955 dark:text-white mb-1">④ 救急要請（119番）の判断基準</p>
                <p className="text-sm sm:text-base text-gray-950 dark:text-gray-150 font-bold leading-relaxed">
                  一般的には2〜3分で発作が治まりますが、<strong>「発作が5分以上継続する」「連続して何度も起こる」「自発呼吸が戻らない」「意識が20分以上戻らない」</strong>場合は速やかに救急車（119番）を要請してください。
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTopic === 'stretcher' && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-orange-950 dark:text-orange-200 text-base sm:text-lg border-b-2 border-orange-200 pb-1.5 flex items-center gap-2">
              <span>🪵</span> <span>簡易担架の作成・搬送ステップ</span>
            </h3>

            {/* Step 1 */}
            <div className="p-4 bg-orange-50 dark:bg-gray-950/30 rounded-xl border-2 border-orange-200 flex items-start gap-3">
              <span className="w-8 h-8 bg-orange-700 text-white text-base font-extrabold rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
              <div>
                <p className="font-extrabold text-sm sm:text-base text-gray-955 dark:text-white mb-1">① 簡易担架の自作法（毛布と棒2本）</p>
                <p className="text-sm sm:text-base text-gray-950 dark:text-gray-150 font-bold leading-relaxed">太く頑丈な支柱や丸太2本と、大きめの毛布1枚を用意します。毛布の端折り返しにより、乗せる人の体重摩擦のみで強固に固定される構造を作ります。</p>
              </div>
            </div>
            <div className="text-center text-orange-650 font-extrabold text-xl">&#x2193;</div>

            {/* Step 2 */}
            <div className="p-4 bg-orange-50 dark:bg-gray-950/30 rounded-xl border-2 border-orange-200 flex items-start gap-3">
              <span className="w-8 h-8 bg-orange-700 text-white text-base font-extrabold rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
              <div>
                <p className="font-extrabold text-sm sm:text-base text-gray-955 dark:text-white mb-1">② 複数人で息を合わせて転がし乗せます</p>
                <p className="text-sm sm:text-base text-gray-950 dark:text-gray-150 font-bold leading-relaxed">頭部・脊椎等の曲がり・ねじれを防ぐため、全員で声をかけながら、板を平らに保つイメージで慎重に体を丸ごと転がすようにして担架へ移します。</p>
              </div>
            </div>
            <div className="text-center text-orange-650 font-extrabold text-xl">&#x2193;</div>

            {/* Step 3 */}
            <div className="p-4 bg-orange-50 dark:bg-gray-950/30 rounded-xl border-2 border-orange-300 flex items-start gap-3">
              <span className="w-8 h-8 bg-orange-700 text-white text-base font-extrabold rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
              <div>
                <p className="font-extrabold text-sm sm:text-base text-gray-955 dark:text-white mb-1">③ 搬送方向：原則は足元を進行方向にする</p>
                <p className="text-sm sm:text-base text-gray-950 dark:text-gray-150 font-bold leading-relaxed">
                  搬送時は<strong>「足を前にして進む」</strong>ことを基本とします。これは倒れた人の目線において先が見えない恐怖感をなくし、後ろで運ぶ指導員が本人の「呼吸・表情・顔色の急変」をいつでも見守り観察できるためです。
                  ※ただし、急な坂を上る、段差を越える際は、頭部を高く保ち落下の危険を防ぐため「頭が先」になります。
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Auxiliary Tool 1: Emergency Stopwatch Timer Helper */}
      <div className="bg-orange-700 text-white p-5 rounded-2xl shadow-md border-2 border-orange-850 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-extrabold text-sm sm:text-base">⏱️ 救急時間計測ストップウォッチ</h4>
          <span className="text-lg bg-orange-950 border-2 border-orange-600 px-3 py-1 rounded-lg font-mono font-extrabold">{formatTime(elapsedSeconds)}</span>
        </div>
        <p className="text-sm font-bold text-orange-50 leading-relaxed">発作の長さや、救急隊が来るまでの処置時間を正確に記録・メモして医師に素早くバトンタッチするために活用してください。</p>
        <div className="flex gap-2">
          <button
            onClick={() => setTimerActive(!timerActive)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-extrabold transition-all active:scale-95 ${
              timerActive ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-white text-orange-700 hover:bg-orange-50'
            }`}
          >
            {timerActive ? '⏱️ タイマーを一時停止' : '▶️ 測定スタート'}
          </button>
          <button
            onClick={handleResetTimer}
            className="px-5 py-2.5 bg-orange-950 hover:bg-orange-900 border border-orange-500 rounded-xl text-sm font-extrabold"
          >
            リセット
          </button>
        </div>
      </div>

      {/* Auxiliary Tool 2: Voice Dictation Memo Pad */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-md border-2 border-orange-200 dark:border-gray-700 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-extrabold text-sm sm:text-base text-gray-950 dark:text-gray-100">🗒 救命記録手帳・緊急メモ (音声入力可)</h4>
          <button
            type="button"
            onClick={startListening}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold transition-all ${
              isListening ? 'bg-red-600 text-white animate-pulse' : 'bg-orange-100 text-orange-950 hover:bg-orange-200'
            }`}
          >
            <MicrophoneIcon className="w-4 h-4" />
            <span>{isListening ? '音声収録中...' : '声を吹き込む'}</span>
          </button>
        </div>
        <p className="text-sm text-gray-950 dark:text-gray-100 font-bold leading-relaxed">
          事故発生時の正確な行動時間や応急記録を残しておけます。引き継ぎ時の冷静な連携に役立ちます。
        </p>
        <textarea
          value={memoText}
          onChange={e => setMemoText(e.target.value)}
          placeholder="【記入例】14:10 除草作業中に顔が赤くへたり込む。14:12 日陰に移動。14:15 首に冷たいペットボトルを当て冷却。意識あり、119番連絡済み"
          className="w-full text-sm sm:text-base p-3.5 border-2 border-orange-200 dark:border-gray-600 dark:bg-gray-700 rounded-xl min-h-[110px] focus:outline-orange-500 font-bold text-gray-950 dark:text-gray-100"
        />
        {memoText && (
          <button
            onClick={() => setMemoText('')}
            className="text-sm font-extrabold text-red-700 dark:text-red-400 underline hover:text-red-900"
          >
            メモをクリア
          </button>
        )}
      </div>
    </div>
  );
};

export default VegetableSearchPage;
