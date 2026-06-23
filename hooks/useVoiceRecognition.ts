import { useState, useEffect, useRef } from 'react';

export const useVoiceRecognition = ({ onResult }: { onResult: (text: string) => void }) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const isActiveRef = useRef(false);
  const silenceTimeoutRef = useRef<any>(null);
  const restartTimeoutRef = useRef<any>(null);
  const lastDispatchedIndexRef = useRef(-1);
  const onResultRef = useRef(onResult);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      isActiveRef.current = false;
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
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

  const stopListeningFully = () => {
    isActiveRef.current = false;
    setIsListening(false);
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
  };

  const resetSilenceTimer = () => {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }
    silenceTimeoutRef.current = setTimeout(() => {
      console.log("10 seconds of silence detected. Stopping voice recognition.");
      stopListeningFully();
    }, 10000); // 10 seconds
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      safeAlert("お使いのブラウザは音声入力をサポートしていません。Google ChromeやSafariなど、対応したブラウザをご利用ください。");
      return;
    }

    if (isActiveRef.current) {
      stopListeningFully();
      return;
    }

    isActiveRef.current = true;
    setIsListening(true);
    lastDispatchedIndexRef.current = -1;
    resetSilenceTimer();

    const initiateRecognition = () => {
      if (!isActiveRef.current) return;

      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'ja-JP';
        recognition.interimResults = true;
        recognition.continuous = true;

        recognition.onstart = () => {
          resetSilenceTimer();
        };

        // Reset silence timer on sound/speech detection
        recognition.onsoundstart = () => resetSilenceTimer();
        recognition.onspeechstart = () => resetSilenceTimer();

        recognition.onresult = (event: any) => {
          resetSilenceTimer();
          
          if (event.results) {
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              if (event.results[i].isFinal && i > lastDispatchedIndexRef.current) {
                const transcript = event.results[i][0].transcript;
                if (transcript && transcript.trim()) {
                  onResultRef.current(transcript.trim());
                }
                lastDispatchedIndexRef.current = i;
              }
            }
          }
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error inside instance:", event.error, event.message);
          
          // Ignore 'no-speech' error to keep session alive according to our 10s silence rule
          if (event.error === 'no-speech') {
            return;
          }

          // Ignore aborted errors
          if (event.error === 'aborted') {
            return;
          }

          // Other errors are terminal
          isActiveRef.current = false;
          let errorMessage = '音声認識中に不明なエラーが発生しました。';
          switch(event.error) {
            case 'network':
              errorMessage = '音声認識に失敗しました。ネットワーク接続を確認して、もう一度お試しください。';
              break;
            case 'audio-capture':
              errorMessage = 'マイクを認識できません。マイクの接続、あるいはブラウザの権限設定を確認してください。';
              break;
            case 'not-allowed':
              errorMessage = 'マイクの使用が許可されていません。ブラウザ、またはiOSの「設定」アプリ→「Safari(またはお使いのブラウザ)」→「マイク」からアクセス権限を許可してください。';
              break;
            case 'service-not-allowed':
              errorMessage = '音声認識サービスへのアクセスが制限されています。Safariのプライバシー設定等をご確認ください。';
              break;
            case 'language-not-supported':
              errorMessage = '指定された言語はお使いのブラウザでは音声認識に対応していません。';
              break;
          }
          
          safeAlert(errorMessage);
          stopListeningFully();
        };

        recognition.onend = () => {
          // Auto-restart if session is supposed to remain active
          if (isActiveRef.current) {
            console.log("Speech recognition ended unexpectedly. Restarting automatically...");
            restartTimeoutRef.current = setTimeout(() => {
              if (isActiveRef.current) {
                // When restarting, reset dispatched index tracker for the fresh instance
                lastDispatchedIndexRef.current = -1;
                initiateRecognition();
              }
            }, 300);
          } else {
            setIsListening(false);
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err) {
        console.error("Could not start SpeechRecognition instance:", err);
        isActiveRef.current = false;
        setIsListening(false);
      }
    };

    initiateRecognition();
  };

  return { isListening, startListening };
};

