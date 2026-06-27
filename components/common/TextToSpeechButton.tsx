import React, { useState, useEffect } from 'react';
import { VolumeIcon, MuteIcon } from '../Icons';

interface TextToSpeechButtonProps {
  content: string | string[];
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const TextToSpeechButton: React.FC<TextToSpeechButtonProps> = ({ content, className = '', size = 'md' }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Clean the text from markdown, bullets, emojis, etc. so it sounds smooth
  const getCleanText = (raw: string | string[]): string => {
    const text = Array.isArray(raw) ? raw.join('\n') : raw;
    return text
      .replace(/[・*-]\s*/g, '') // remove bullets
      .replace(/[#*`~_]/g, '')   // remove basic markdown characters
      .replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]/g, '') // remove emojis
      .replace(/https?:\/\/[^\s]+/g, '') // remove links
      .trim();
  };

  useEffect(() => {
    // If the component unmounts, stop the speaking for this instance if it was speaking
    return () => {
      if (isPlaying) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isPlaying]);

  // We can also poll/check if speaking to ensure we are in sync
  useEffect(() => {
    const handleSpeechState = () => {
      if (!window.speechSynthesis.speaking && isPlaying) {
        setIsPlaying(false);
      }
    };
    
    const interval = setInterval(handleSpeechState, 500);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      // Cancel any ongoing speech first
      window.speechSynthesis.cancel();

      const textToSpeak = getCleanText(content);
      if (!textToSpeak) return;

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'ja-JP';
      
      // Find a Japanese voice if available
      const voices = window.speechSynthesis.getVoices();
      const jaVoice = voices.find(voice => voice.lang.includes('ja'));
      if (jaVoice) {
        utterance.voice = jaVoice;
      }

      utterance.onend = () => {
        setIsPlaying(false);
      };

      utterance.onerror = () => {
        setIsPlaying(false);
      };

      setIsPlaying(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  if (!isSupported) return null;

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs rounded-lg',
    md: 'px-3 py-1.5 text-xs sm:text-sm rounded-xl',
    lg: 'px-4 py-2.5 text-sm sm:text-base rounded-2xl'
  };

  return (
    <button
      onClick={handleTogglePlay}
      className={`inline-flex items-center justify-center gap-1.5 font-bold transition-all ${
        isPlaying
          ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800'
          : 'bg-orange-50 text-orange-950 hover:bg-orange-100 dark:bg-gray-750 dark:text-orange-200 border-orange-200 dark:border-gray-650'
      } border shadow-xs active:scale-95 ${sizeClasses[size]} ${className}`}
      title={isPlaying ? '音声読み上げを停止' : '音声を読み上げる'}
    >
      {isPlaying ? (
        <>
          <MuteIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-pulse" />
          <span>読み上げ停止</span>
        </>
      ) : (
        <>
          <VolumeIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span>解説を聴く</span>
        </>
      )}
    </button>
  );
};
