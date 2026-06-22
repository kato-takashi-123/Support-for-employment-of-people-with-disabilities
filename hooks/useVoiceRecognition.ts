import { useState, useEffect, useRef } from 'react';

export const useVoiceRecognition = ({ onResult }: { onResult: (text: string) => void }) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'ja-JP';
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      setIsListening(false);
    };
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error, event.message);
      let errorMessage = '音声認識中に不明なエラーが発生しました。';
      switch(event.error) {
          case 'network':
              errorMessage = '音声認識に失敗しました。ネットワーク接続を確認して、もう一度お試しください。';
              break;
          case 'no-speech':
              errorMessage = '音声が検出されませんでした。はっきりと話してみてください。';
              break;
          case 'audio-capture':
              errorMessage = 'マイクを認識できません。マイクの接続やアクセスコードを確認してください。';
              break;
          case 'not-allowed':
              errorMessage = 'マイクの使用が許可されていません。ブラウザの設定でこのサイトのマイクアクセスを許可してください。';
              break;
          case 'aborted':
              errorMessage = '音声入力が中止されました。もう一度お試しください。';
              break;
          case 'service-not-allowed':
              errorMessage = '音声認識サービスへのアクセスが許可されていません。ブラウザの設定やプライバシー設定を確認してください。';
              break;
          case 'language-not-supported':
              errorMessage = '指定された言語はお使いのブラウザでは音声認識に対応していません。';
              break;
      }
      alert(errorMessage);
      setIsListening(false);
    };
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognitionRef.current = recognition;
  }, [onResult]);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("お使いのブラウザは音声入力をサポートしていません。Google ChromeやSafariなど、対応したブラウザをご利用ください。");
      return;
    }
    
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Could not start recognition", err);
        alert("音声認識の開始に失敗しました。マイクの使用許可や設定を確認してください。");
      }
    }
  };

  return { isListening, startListening };
};
