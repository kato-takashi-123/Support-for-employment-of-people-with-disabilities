import { useState, useEffect, useRef } from 'react';

export const useVoiceRecognition = ({ onResult }: { onResult: (text: string) => void }) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  const safeAlert = (message: string) => {
    try {
      alert(message);
    } catch (e) {
      console.warn("Alert blocked by context:", message, e);
    }
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      safeAlert("お使いのブラウザは音声入力をサポートしていません。Google ChromeやSafariなど、対応したブラウザをご利用ください。");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error("Error stopping recognition", e);
        }
      }
      setIsListening(false);
      return;
    }

    try {
      // Create a FRESH instance on every user click for seamless iOS Safari permission mapping and stability
      const recognition = new SpeechRecognition();
      recognition.lang = 'ja-JP';
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        if (event.results && event.results[0] && event.results[0][0]) {
          const transcript = event.results[0][0].transcript;
          onResult(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error, event.message);
        let errorMessage = '音声認識中に不明なエラーが発生しました。';
        switch(event.error) {
          case 'network':
            errorMessage = '音声認識に失敗しました。ネットワーク接続を確認して、もう一度お試しください。';
            break;
          case 'no-speech':
            errorMessage = '音声が検出されませんでした。マイクに向かってはっきりと話してみてください。';
            break;
          case 'audio-capture':
            errorMessage = 'マイクを認識できません。マイクの接続、あるいはブラウザの権限設定を確認してください。';
            break;
          case 'not-allowed':
             errorMessage = 'マイクの使用が許可されていません。ブラウザ、またはiOSの「設定」アプリ→「Safari(またはお使いのブラウザ)」→「マイク」からアクセス権限を許可してください。';
            break;
          case 'aborted':
            errorMessage = '音声入力が中止されました。もう一度お試しください。';
            break;
          case 'service-not-allowed':
            errorMessage = '音声認識サービスへのアクセスが制限されています。Safariのプライバシー設定等をご確認ください。';
            break;
          case 'language-not-supported':
            errorMessage = '指定された言語はお使いのブラウザでは音声認識に対応していません。';
            break;
        }
        
        console.warn("Speech Recognition Error Message:", errorMessage);
        safeAlert(errorMessage);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Could not initialize SpeechRecognition", err);
      safeAlert("音声認識の開始に失敗しました。マイクの使用許可や設定を確認してください。");
      setIsListening(false);
    }
  };

  return { isListening, startListening };
};

