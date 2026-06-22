import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppSettings, ApiCallHandler } from './types';
import { updateGeminiApiKey } from './services/geminiService';
import { SETTINGS_KEY, SETTINGS_OBJECT_STORE_NAME } from './lib/constants';
import { idbGet, idbSet } from './lib/indexedDB';

// Import pages
import LoginPage from './pages/LoginPage';
import ToolsPage from './pages/ToolsPage';
import RecipeSearchPage from './pages/RecipeSearchPage';
import VegetableSearchPage from './pages/VegetableSearchPage';
import PestSearchPage from './pages/PestSearchPage';
import TermSearchPage from './pages/TermSearchPage';
import PlantDiagnosisPage from './pages/PlantDiagnosisPage';
import PlantingRecommendationSearchPage from './pages/PlantingRecommendationSearchPage';
import SettingsPage from './pages/SettingsPage';

// Import components
import { PageHeader } from './components/PageHeader';
import { HamburgerMenu } from './components/HamburgerMenu';
import { Toast, UpdateAvailableToast } from './components/common/Toast';
import { ConfirmationModal, ConfirmationModalProps, ShareModal, AccessPermissionGuideModal } from './components/modals';
import { ToolsIcon, CameraIcon, SettingsIcon, HomeIcon } from './components/Icons';

export const App = () => {
  const [page, setPage] = useState<'LOGIN' | 'TOOLS' | 'RECIPE_SEARCH' | 'VEGETABLE_SEARCH' | 'PEST_SEARCH' | 'TERM_SEARCH' | 'PLANT_DIAGNOSIS' | 'PLANTING_RECOMMENDATION_SEARCH' | 'SETTINGS'>('PLANT_DIAGNOSIS');
  const [pageParams, setPageParams] = useState<any>({});
  const [settings, setSettings] = useState<AppSettings>(() => {
    const defaultSettings: AppSettings = {
      teamName: '障がい者雇用支援アプリ',
      startOfWeek: 'monday',
      enableAiFeatures: true,
      geminiApiKey: '',
      enablePumiceWash: false,
      weatherLocation: 'tokyo,JP',
      darkModeContrast: 'normal',
      tenkiJpUrl: 'https://tenki.jp/forecast/3/16/4410/13101/3hours.html',
      dailyQuoteTheme: '思いやりと合理的配慮',
      searchMode: 'google',
      appUrl: 'https://ai-crop-diagnosis1.vercel.app/',
    };
    try {
      const backup = localStorage.getItem('settings_backup');
      if (backup) {
        const parsed = JSON.parse(backup);
        parsed.appUrl = 'https://ai-crop-diagnosis1.vercel.app/';
        return { ...defaultSettings, ...parsed };
      }
    } catch (e) {
      console.warn("Failed to pre-load settings from localStorage:", e);
    }
    return defaultSettings;
  });
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAccessGuideOpen, setIsAccessGuideOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('PLANT_DIAGNOSIS');
  const [confirmationModal, setConfirmationModal] = useState<Omit<ConfirmationModalProps, 'isOpen'> & { isOpen: boolean }>({ isOpen: false, title: '', message: '', onConfirm: () => {}, onCancel: () => {}, confirmText: '' });
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateDismissed, setUpdateDismissed] = useState(false);
  const waitingWorkerRef = useRef<ServiceWorker | null>(null);

  const applyUpdate = useCallback(() => {
    let reloaded = false;
    const triggerReload = () => {
      if (!reloaded) {
        reloaded = true;
        window.location.reload();
      }
    };

    if (waitingWorkerRef.current) {
      waitingWorkerRef.current.addEventListener('statechange', (event: any) => {
        if (event.target && event.target.state === 'activated') {
          triggerReload();
        }
      });
      waitingWorkerRef.current.postMessage({ type: 'SKIP_WAITING' });
      
      // Fallback: If other open clients/tabs prevent immediate activation (staying in waiting),
      // we force a reload after 800ms so the user doesn't get stuck with a non-responsive dialog.
      setTimeout(() => {
        triggerReload();
      }, 800);
    } else {
      triggerReload();
    }
  }, []);

  const checkForUpdate = useCallback(() => {
    navigator.serviceWorker.getRegistration().then(reg => {
      if (reg) {
        reg.update().catch(err => {
          console.error("Update check failed:", err);
        });
      }
    });
  }, []);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(reg => {
        if (!reg) return;

        const onUpdateFound = () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                waitingWorkerRef.current = newWorker;
                setUpdateAvailable(true);
              }
            });
          }
        };

        reg.addEventListener('updatefound', onUpdateFound);
        
        if (reg.waiting) {
            waitingWorkerRef.current = reg.waiting;
            setUpdateAvailable(true);
        }
        
        return () => {
          reg.removeEventListener('updatefound', onUpdateFound);
        };
      });
    }
  }, []);

  useEffect(() => {
    const requestPersistentStorage = async () => {
        if (navigator.storage && navigator.storage.persist) {
            try {
                const isPersisted = await navigator.storage.persisted();
                if (!isPersisted) {
                    const persisted = await navigator.storage.persist();
                    if (persisted) {
                        console.log('ストレージの永続化に成功しました。');
                    } else {
                        console.warn('ストレージの永続化に失敗しました。');
                    }
                }
            } catch (error) {
                console.error('永続ストレージのリクエスト中にエラーが発生しました:', error);
            }
        }
    };
    
    const loadData = async () => {
      try {
        let savedSettings = await idbGet(SETTINGS_OBJECT_STORE_NAME, SETTINGS_KEY);
        
        // Fallback to localStorage backup if IndexedDB fails or is empty, to safeguard during sw cache updates
        if (!savedSettings) {
          try {
            const backupStr = localStorage.getItem('settings_backup');
            if (backupStr) {
              savedSettings = JSON.parse(backupStr);
              // Restore to IDB
              await idbSet(SETTINGS_OBJECT_STORE_NAME, SETTINGS_KEY, savedSettings);
            }
          } catch (e) {
            console.warn("Failed to retrieve localStorage backup:", e);
          }
        }

        if (savedSettings) {
          if (!savedSettings.searchMode) {
            savedSettings.searchMode = (savedSettings.enableAiFeatures && savedSettings.geminiApiKey) ? 'ai' : 'google';
          }
          if (!savedSettings.tenkiJpUrl || savedSettings.tenkiJpUrl.trim() === '') {
            savedSettings.tenkiJpUrl = 'https://tenki.jp/forecast/5/26/5110/23100/3hours.html';
          }
          savedSettings.appUrl = 'https://ai-crop-diagnosis1.vercel.app/';
          setSettings(prev => ({ ...prev, ...savedSettings }));
          if (savedSettings.geminiApiKey) {
              updateGeminiApiKey(savedSettings.geminiApiKey);
          }
          
          // Keep localStorage backup perfectly in sync
          try {
            localStorage.setItem('settings_backup', JSON.stringify(savedSettings));
          } catch (e) {}
        }
        setIsLoggedIn(true);
      } catch (error) {
        console.error("Failed to load settings from IndexedDB", error);
        setIsLoggedIn(true);
      } finally {
        setIsLoading(false);
        const hasSeenGuide = localStorage.getItem('hasSeenPermissionGuide_v1');
        if (!hasSeenGuide) {
          setIsAccessGuideOpen(true);
        }
      }
    };

    loadData();
    requestPersistentStorage();
  }, []);

  const handleSettingsChange = useCallback(async (newSettings: AppSettings) => {
    // Fill default if user cleared the weather forecast URL
    if (!newSettings.tenkiJpUrl || newSettings.tenkiJpUrl.trim() === '') {
      newSettings.tenkiJpUrl = 'https://tenki.jp/forecast/5/26/5110/23100/3hours.html';
    }
    // Always enforce the Vercel shared URL
    newSettings.appUrl = 'https://ai-crop-diagnosis1.vercel.app/';

    if (newSettings.geminiApiKey !== settings.geminiApiKey) {
      updateGeminiApiKey(newSettings.geminiApiKey || '');
    }
    setSettings(newSettings);
    
    // Save dual backup to both IndexedDB AND localStorage to guarantee zero loss during SW reloads
    try {
      await idbSet(SETTINGS_OBJECT_STORE_NAME, SETTINGS_KEY, newSettings);
    } catch (error) {
      console.error("Failed to save settings to IndexedDB", error);
    }
    try {
      localStorage.setItem('settings_backup', JSON.stringify(newSettings));
    } catch (error) {
      console.error("Failed to save backup to localStorage", error);
    }
  }, [settings.geminiApiKey]);
  
  useEffect(() => {
    const isHighContrast = settings.darkModeContrast === 'high';
    const root = document.documentElement;
    root.classList.toggle('dark-high-contrast', isHighContrast);
  }, [settings.darkModeContrast]);

  useEffect(() => {
    // 1. If the index.html script already caught the install prompt, retrieve it.
    // @ts-ignore
    if (window.deferredPrompt) {
      // @ts-ignore
      setDeferredPrompt(window.deferredPrompt);
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // @ts-ignore
      window.deferredPrompt = e;
    };

    // 2. Listen to custom event fired by early-capture script in index.html
    const handleGlobalPromptAvailable = (e: any) => {
      if (e.detail) {
        setDeferredPrompt(e.detail);
      }
    };

    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setDeferredPrompt(null);
      // @ts-ignore
      window.deferredPrompt = null;
      showToast('本格アプリ(PWA)としてのインストールが完了しました！');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('pwa-prompt-available', handleGlobalPromptAvailable);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Support standalone mode detection (iOS or Android already installed)
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    if (isInStandaloneMode) {
      setIsAppInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('pwa-prompt-available', handleGlobalPromptAvailable);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallApp = async () => {
    // Try to fall back to window.deferredPrompt if state is not set yet
    // @ts-ignore
    const promptEvent = deferredPrompt || window.deferredPrompt;
    if (!promptEvent) {
      showToast('インストーラーを準備中、または既にインストールされています');
      return;
    }
    try {
      await promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      console.log(`User choice for PWA installation: ${outcome}`);
    } catch (err) {
      console.error('PWA install prompt error:', err);
    } finally {
      setDeferredPrompt(null);
      // @ts-ignore
      window.deferredPrompt = null;
    }
  };

  const handleCloseAccessGuide = () => {
    localStorage.setItem('hasSeenPermissionGuide_v1', 'true');
    setIsAccessGuideOpen(false);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 1500);
  };

  const handleApiCall: ApiCallHandler = useCallback(async (apiCall) => {
    try {
      const result = await apiCall();
      return result;
    } catch (error: any) {
        console.error("API Call failed:", error);
        throw error;
    }
  }, []);

  const changePage = (newPage: string, params?: any) => {
    window.scrollTo(0, 0);
    setPage(newPage as any);
    if (params) setPageParams(params);
    setActiveTab(newPage);
  };

  const onBack = () => {
    let targetPage = 'PLANT_DIAGNOSIS';
    if (['RECIPE_SEARCH', 'VEGETABLE_SEARCH', 'PEST_SEARCH', 'TERM_SEARCH', 'PLANTING_RECOMMENDATION_SEARCH'].includes(page)) {
      targetPage = 'TOOLS';
    }
    changePage(targetPage);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    changePage('PLANT_DIAGNOSIS');
  };
  
  const handleLogout = () => {
      setConfirmationModal({
          isOpen: true,
          title: 'ログアウト',
          message: '本当にログアウトしますか？',
          confirmText: 'ログアウト',
          onConfirm: () => {
              setIsLoggedIn(false);
              // @ts-ignore
              setPage('LOGIN');
              setConfirmationModal(s => ({...s, isOpen: false}));
          },
          onCancel: () => setConfirmationModal(s => ({...s, isOpen: false})),
      });
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const pages: { [key: string]: { comp: React.ReactNode, title: string, showBack: boolean } } = {
    TOOLS: { comp: <ToolsPage setPage={changePage} />, title: 'サポートツール一覧', showBack: true },
    RECIPE_SEARCH: { comp: <RecipeSearchPage />, title: '専門相談窓口・福祉サービス利用ガイド', showBack: true },
    VEGETABLE_SEARCH: { comp: <VegetableSearchPage />, title: '緊急対応マニュアル', showBack: true },
    PEST_SEARCH: { comp: <PestSearchPage settings={settings} onSettingsChange={handleSettingsChange} handleApiCall={handleApiCall} pageParams={pageParams} />, title: '合理的配慮・雇用法・虐待防止検索', showBack: true },
    TERM_SEARCH: { comp: <TermSearchPage settings={settings} onSettingsChange={handleSettingsChange} handleApiCall={handleApiCall} pageParams={pageParams} />, title: '障がい者福祉用語辞典', showBack: true },
    PLANT_DIAGNOSIS: { comp: <PlantDiagnosisPage setPage={changePage} settings={settings} onSettingsChange={handleSettingsChange} handleApiCall={handleApiCall} records={[]} pageParams={pageParams} />, title: '障がい者雇用支援アプリ', showBack: false },
    PLANTING_RECOMMENDATION_SEARCH: { comp: <PlantingRecommendationSearchPage />, title: '障がい特性・合理的配慮解説', showBack: true },
    SETTINGS: { comp: <SettingsPage settings={settings} onSettingsChange={handleSettingsChange} onLogout={handleLogout} deferredPrompt={deferredPrompt} isAppInstalled={isAppInstalled} onInstallApp={handleInstallApp} />, title: '設定情報', showBack: false },
  };

  const currentPage = pages[page] || pages.PLANT_DIAGNOSIS;

  return (
    <div className="bg-orange-50/10 dark:bg-gray-900 min-h-screen font-sans">
      <PageHeader
        title={currentPage.title}
        onBack={currentPage.showBack ? onBack : undefined}
        onMenuClick={() => setIsMenuOpen(true)}
      />
      <main className="pb-24">
        {isLoading ? <div className="text-center p-8">データを読み込み中...</div> : currentPage.comp}
      </main>

      <div className="fixed bottom-0 left-0 right-0 h-12 z-20">
        <nav className="w-full h-full bg-[#fdf5ed] dark:bg-gray-800 shadow-t-lg border-t dark:border-gray-700 flex justify-around items-center">
          <button onClick={() => changePage('TOOLS')} className={`flex flex-col items-center justify-center w-full h-full transition-colors ${['TOOLS', 'RECIPE_SEARCH', 'VEGETABLE_SEARCH', 'PEST_SEARCH', 'TERM_SEARCH', 'PLANTING_RECOMMENDATION_SEARCH'].includes(page) ? 'text-orange-600 dark:text-orange-400' : 'text-gray-500 dark:text-gray-400'}`}>
            <ToolsIcon className="h-5 w-5" />
            <span className="text-[10px] font-bold">ツール</span>
          </button>
          
          <div className="w-full h-full col-span-1"></div>

          <button onClick={() => changePage('SETTINGS')} className={`flex flex-col items-center justify-center w-full h-full transition-colors ${page === 'SETTINGS' ? 'text-orange-600 dark:text-orange-400' : 'text-gray-500 dark:text-gray-400'}`}>
            <SettingsIcon className="h-5 w-5" />
            <span className="text-[10px] font-bold">設定</span>
          </button>
        </nav>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-30 flex justify-center items-end pointer-events-none" style={{ width: '20%'}}>
           <button
              onClick={() => changePage('PLANT_DIAGNOSIS')}
              className={`w-14 h-14 bg-[#fdf5ed] dark:bg-gray-800 border-2 dark:border-gray-650 rounded-full shadow-lg flex items-center justify-center transition-transform pointer-events-auto ${activeTab === 'PLANT_DIAGNOSIS' ? 'text-orange-600 dark:text-orange-400 border-orange-500' : 'text-gray-600 dark:text-gray-400 border-stone-200 dark:border-gray-700'}`}
              aria-label="音声相談窓口"
          >
              <HomeIcon className="h-7 w-7" />
          </button>
        </div>
      </div>
      
      {toastMessage && <Toast message={toastMessage} />}
      {updateAvailable && !updateDismissed && (
        <UpdateAvailableToast onUpdate={applyUpdate} onDismiss={() => setUpdateDismissed(true)} />
      )}

      <HamburgerMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        setPage={changePage}
        activePage={page}
        onLogout={handleLogout}
        updateAvailable={updateAvailable}
        onUpdate={applyUpdate}
        onCheckForUpdate={checkForUpdate}
        showToast={showToast}
        onShareClick={() => setIsShareModalOpen(true)}
      />

      <ConfirmationModal 
        isOpen={confirmationModal.isOpen}
        {...confirmationModal}
      />
      
      <ShareModal 
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        appUrl={settings.appUrl}
      />

      <AccessPermissionGuideModal
        isOpen={isAccessGuideOpen}
        onClose={handleCloseAccessGuide}
      />
    </div>
  );
};
