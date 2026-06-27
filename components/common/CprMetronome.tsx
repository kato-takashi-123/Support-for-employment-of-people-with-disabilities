import React, { useState, useEffect, useRef } from 'react';

export const CprMetronome: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [bpm, setBpm] = useState(110); // Default to 110 (middle of 100-120)
  const [count, setCount] = useState(0); // 1 to 30 compressions count
  const [isBeating, setIsBeating] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Play standard beep
  const playBeep = (frequency: number, duration: number) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      osc.type = 'sine';

      // Gain envelope to make it click-free
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.005);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.error('AudioContext error:', e);
    }
  };

  useEffect(() => {
    if (!isActive) {
      setCount(0);
      setIsBeating(false);
      return;
    }

    const intervalMs = (60 / bpm) * 1000;

    // First beat immediately
    playBeep(800, 0.08);
    setCount(1);
    setIsBeating(true);
    const beatTimeout = setTimeout(() => setIsBeating(false), 120);

    const timer = setInterval(() => {
      setCount(prev => {
        const next = prev + 1;
        if (next === 30) {
          // Play a higher pitched beep to alert the end of 30 compressions
          playBeep(1200, 0.15);
        } else {
          playBeep(800, 0.08);
        }
        
        setIsBeating(true);
        // Reset beating animation state shortly after
        setTimeout(() => setIsBeating(false), 120);

        if (next > 30) {
          return 1;
        }
        return next;
      });
    }, intervalMs);

    return () => {
      clearInterval(timer);
      clearTimeout(beatTimeout);
    };
  }, [isActive, bpm]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const handleToggle = () => {
    // Resume audio context inside interaction
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    setIsActive(!isActive);
  };

  const handleBpmChange = (newBpm: number) => {
    setBpm(newBpm);
  };

  return (
    <div id="cpr-metronome-root" className="my-3 bg-red-50/50 dark:bg-red-950/10 border-2 border-red-200 dark:border-red-900/30 rounded-2xl p-4 shadow-inner space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-red-600 dark:text-red-400 animate-pulse text-lg">⏱️</span>
          <span className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-gray-100">
            胸骨圧迫メトロノーム
          </span>
        </div>
        <span className="text-xs font-black px-2 py-0.5 bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 rounded-full">
          推奨: 100〜120回/分
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        {/* Play & Beats Visual */}
        <div className="sm:col-span-6 flex items-center gap-3">
          <button
            id="cpr-metronome-toggle-btn"
            onClick={handleToggle}
            className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-extrabold text-sm transition-all shadow-md active:scale-95 ${
              isActive
                ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                : 'bg-orange-600 hover:bg-orange-700 text-white'
            }`}
          >
            {isActive ? (
              <>
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
                <span>停止する</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span>メトロノーム開始</span>
              </>
            )}
          </button>

          {/* Pulse Target Graphic */}
          <div className="flex items-center gap-2 pl-2">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-75 ${
                isBeating
                  ? 'bg-red-500 scale-125 shadow-[0_0_15px_rgba(239,68,68,0.7)]'
                  : 'bg-red-200 dark:bg-red-900/40 scale-100'
              }`}
            >
              <svg
                className={`w-5 h-5 transition-colors ${
                  isBeating ? 'text-white' : 'text-red-500 dark:text-red-400'
                }`}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            {isActive && (
              <div className="flex flex-col">
                <span className="text-xs font-black text-gray-500 dark:text-gray-400 leading-none">回数</span>
                <span className="text-xl font-black text-red-600 dark:text-red-400 leading-tight">
                  {count} <span className="text-xs font-bold text-gray-400">/ 30</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* BPM Quick Selectors */}
        <div className="sm:col-span-6 flex flex-wrap gap-2 items-center justify-end">
          <span className="text-xs font-black text-gray-650 dark:text-gray-400">テンポ設定:</span>
          <div className="flex gap-1 bg-white dark:bg-gray-800 p-1 rounded-xl border border-orange-200 dark:border-gray-700">
            {([100, 110, 120] as const).map(speed => (
              <button
                key={speed}
                onClick={() => handleBpmChange(speed)}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                  bpm === speed
                    ? 'bg-orange-100 dark:bg-gray-700 text-orange-950 dark:text-orange-200 border border-orange-300 dark:border-gray-600'
                    : 'text-gray-600 dark:text-gray-450 hover:bg-orange-50/50 dark:hover:bg-gray-800/50 border border-transparent'
                }`}
              >
                {speed === 100 && '100 (やや緩やか)'}
                {speed === 110 && '110 (おすすめ)'}
                {speed === 120 && '120 (快速)'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Guide Help Toast */}
      {isActive && (
        <div className="bg-white dark:bg-gray-800 border border-orange-200 dark:border-gray-700 p-2.5 rounded-xl text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-200 text-center animate-pulse">
          {count >= 28 ? (
            <span className="text-red-600 dark:text-red-400 font-extrabold">
              🚨 まもなく30回です！一旦手を止めて人工呼吸を2回行ってください！
            </span>
          ) : (
            <span>
              音とハートの点滅に合わせて、胸骨の真ん中を深く（約5cm）強く圧迫してください。
            </span>
          )}
        </div>
      )}
    </div>
  );
};
