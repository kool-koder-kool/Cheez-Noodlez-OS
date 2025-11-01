/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {BSOD} from './components/BSOD';
import {GeneratedContent} from './components/GeneratedContent';
import {Icon} from './components/Icon';
import {Taskbar} from './components/Taskbar';
import {Window} from './components/Window';
import {APP_DEFINITIONS_CONFIG, INITIAL_MAX_HISTORY_LENGTH} from './constants';
import {generateImage, streamAppContent} from './services/geminiService';
import {AppDefinition, InteractionData} from './types';

const DesktopView: React.FC<{
  onAppOpen: (app: AppDefinition) => void;
  iconPositions: Record<string, {x: number; y: number}>;
  onIconMove: (appId: string, pos: {x: number; y: number}) => void;
  boundsRef: React.RefObject<HTMLElement>;
  hiddenIconIds: string[];
}> = ({onAppOpen, iconPositions, onIconMove, boundsRef, hiddenIconIds}) => (
  <div className="w-full h-full relative">
    {APP_DEFINITIONS_CONFIG.filter((app) => !hiddenIconIds.includes(app.id)).map(
      (app) => (
        <Icon
          key={app.id}
          app={app}
          onInteract={() => onAppOpen(app)}
          position={iconPositions[app.id]}
          onMove={(pos) => onIconMove(app.id, pos)}
          boundsRef={boundsRef}
        />
      ),
    )}
  </div>
);

const App: React.FC = () => {
  const [activeApp, setActiveApp] = useState<AppDefinition | null>(null);
  const [llmContent, setLlmContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [wallpaperError, setWallpaperError] = useState<string | null>(null);
  const [interactionHistory, setInteractionHistory] = useState<
    InteractionData[]
  >([]);
  const [currentMaxHistoryLength, setCurrentMaxHistoryLength] =
    useState<number>(INITIAL_MAX_HISTORY_LENGTH);

  // State for draggable icons
  const [iconPositions, setIconPositions] = useState<
    Record<string, {x: number; y: number}>
  >({});
  const desktopRef = useRef<HTMLElement>(null);
  const [wallpaperUrl, setWallpaperUrl] = useState<string | null>(null);
  const [isGeneratingWallpaper, setIsGeneratingWallpaper] =
    useState<boolean>(false);
  const isGeneratingWallpaperRef = useRef(isGeneratingWallpaper);
  isGeneratingWallpaperRef.current = isGeneratingWallpaper;

  const [isAutoWallpaperEnabled, setIsAutoWallpaperEnabled] =
    useState<boolean>(false);
  const wallpaperIntervalRef = useRef<number | null>(null);

  const [showBSOD, setShowBSOD] = useState<boolean>(false);
  const [hiddenIconIds, setHiddenIconIds] = useState<string[]>([]);

  // Effect to set initial icon positions in a grid
  useEffect(() => {
    if (
      desktopRef.current &&
      Object.keys(iconPositions).length === 0 &&
      APP_DEFINITIONS_CONFIG.length > 0
    ) {
      const newPositions: Record<string, {x: number; y: number}> = {};
      const PADDING = 24;
      const GAP_X = 24;
      const GAP_Y = 8;
      const ICON_WIDTH = 112; // w-28
      const ICON_HEIGHT = 128; // h-32

      let currentX = PADDING;
      let currentY = PADDING;

      APP_DEFINITIONS_CONFIG.forEach((app) => {
        if (
          desktopRef.current &&
          currentY + ICON_HEIGHT > desktopRef.current.offsetHeight
        ) {
          currentY = PADDING;
          currentX += ICON_WIDTH + GAP_X;
        }
        newPositions[app.id] = {x: currentX, y: currentY};
        currentY += ICON_HEIGHT + GAP_Y;
      });
      setIconPositions(newPositions);
    }
  }, [iconPositions]);

  const handleIconPositionChange = (
    appId: string,
    pos: {x: number; y: number},
  ) => {
    setIconPositions((prev) => ({
      ...prev,
      [appId]: pos,
    }));
  };

  // Statefulness feature state
  const [isStatefulnessEnabled, setIsStatefulnessEnabled] =
    useState<boolean>(false);
  const [appContentCache, setAppContentCache] = useState<
    Record<string, string>
  >({});
  const [currentAppPath, setCurrentAppPath] = useState<string[]>([]); // For UI graph statefulness

  const handleCloseAppView = useCallback(() => {
    setActiveApp(null);
    setLlmContent('');
    setError(null);
    setInteractionHistory([]);
    setCurrentAppPath([]);
  }, []);

  const triggerRandomGlitch = useCallback(() => {
    // Simulate "deleting" files by hiding icons just before the crash
    const iconsToHide = APP_DEFINITIONS_CONFIG.map((app) => app.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 4) + 2); // Hide 2 to 5 icons
    setHiddenIconIds(iconsToHide);

    // Trigger the BSOD permanently
    setShowBSOD(true);

    // The BSOD will now stay forever, effectively ending the session.
    // The user will need to refresh the page to restart.
  }, []);

  const internalHandleLlmRequest = useCallback(
    async (historyForLlm: InteractionData[], maxHistoryLength: number) => {
      if (historyForLlm.length === 0) {
        setError('No interaction data to process.');
        return;
      }

      setIsLoading(true);
      setError(null);

      let accumulatedContent = '';
      try {
        const stream = streamAppContent(historyForLlm, maxHistoryLength);
        for await (const chunk of stream) {
          accumulatedContent += chunk;
          setLlmContent((prev) => prev + chunk);
        }
      } catch (e: any) {
        setError('Failed to stream content from the API.');
        console.error(e);
        accumulatedContent = `<div class="p-4 text-red-600 bg-red-100 rounded-md">Error loading content.</div>`;
        setLlmContent(accumulatedContent);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Effect to cache content when loading finishes and statefulness is enabled
  useEffect(() => {
    if (
      !isLoading &&
      currentAppPath.length > 0 &&
      isStatefulnessEnabled &&
      llmContent
    ) {
      const cacheKey = currentAppPath.join('__');
      if (appContentCache[cacheKey] !== llmContent) {
        setAppContentCache((prevCache) => ({
          ...prevCache,
          [cacheKey]: llmContent,
        }));
      }
    }
  }, [
    llmContent,
    isLoading,
    currentAppPath,
    isStatefulnessEnabled,
    appContentCache,
  ]);

  const handleInteraction = useCallback(
    async (interactionData: InteractionData) => {
      if (interactionData.id === 'app_close_button') {
        handleCloseAppView();
        return;
      }

      // Check for glitch-triggering interactions
      if (interactionData.id.startsWith('access_unstable_file')) {
        triggerRandomGlitch();
        return; // Stop further processing after triggering the glitch
      }

      const newHistory = [
        interactionData,
        ...interactionHistory.slice(0, currentMaxHistoryLength - 1),
      ];
      setInteractionHistory(newHistory);

      const newPath = activeApp
        ? [...currentAppPath, interactionData.id]
        : [interactionData.id];
      setCurrentAppPath(newPath);
      const cacheKey = newPath.join('__');

      setLlmContent('');
      setError(null);

      if (isStatefulnessEnabled && appContentCache[cacheKey]) {
        setLlmContent(appContentCache[cacheKey]);
        setIsLoading(false);
      } else {
        internalHandleLlmRequest(newHistory, currentMaxHistoryLength);
      }
    },
    [
      interactionHistory,
      internalHandleLlmRequest,
      activeApp,
      currentMaxHistoryLength,
      currentAppPath,
      isStatefulnessEnabled,
      appContentCache,
      triggerRandomGlitch,
      handleCloseAppView,
    ],
  );

  const handleAppOpen = (app: AppDefinition) => {
    const initialInteraction: InteractionData = {
      id: app.id,
      type: 'app_open',
      elementText: app.name,
      elementType: 'icon',
      appContext: app.id,
    };

    const newHistory = [initialInteraction];
    setInteractionHistory(newHistory);

    const appPath = [app.id];
    setCurrentAppPath(appPath);
    const cacheKey = appPath.join('__');

    setActiveApp(app);
    setLlmContent('');
    setError(null);

    if (isStatefulnessEnabled && appContentCache[cacheKey]) {
      setLlmContent(appContentCache[cacheKey]);
      setIsLoading(false);
    } else {
      internalHandleLlmRequest(newHistory, currentMaxHistoryLength);
    }
  };

  const handleUpdateHistoryLength = (newLength: number) => {
    setCurrentMaxHistoryLength(newLength);
    setInteractionHistory((prev) => prev.slice(0, newLength));
  };

  const handleSetStatefulness = (enabled: boolean) => {
    setIsStatefulnessEnabled(enabled);
    if (!enabled) {
      setAppContentCache({});
    }
  };

  const getTimeBasedPrompt = useCallback(() => {
    const hour = new Date().getHours();
    let timeOfDay = '';
    if (hour < 5) timeOfDay = 'deep night sky';
    else if (hour < 12) timeOfDay = 'crisp morning sunrise';
    else if (hour < 17) timeOfDay = 'bright afternoon';
    else if (hour < 21) timeOfDay = 'warm evening sunset';
    else timeOfDay = 'starry night';
    return `A beautiful, serene desktop wallpaper of a landscape, capturing the mood of a peaceful ${timeOfDay}. Digital art.`;
  }, []);

  const handleGenerateWallpaper = useCallback(
    async (prompt: string) => {
      if (isGeneratingWallpaperRef.current) {
        console.log('Wallpaper generation already in progress. Skipping.');
        return;
      }
      setIsGeneratingWallpaper(true);
      setWallpaperError(null);
      try {
        const base64Image = await generateImage(prompt);
        setWallpaperUrl(`data:image/png;base64,${base64Image}`);
      } catch (e: any) {
        console.error('Failed to generate wallpaper:', e);
        setWallpaperError('Failed to generate wallpaper. Please try again.');
      } finally {
        setIsGeneratingWallpaper(false);
      }
    },
    [], // Dependencies are stable setters or refs
  );

  // Effect to generate initial wallpaper on load
  useEffect(() => {
    handleGenerateWallpaper(getTimeBasedPrompt());
  }, [handleGenerateWallpaper, getTimeBasedPrompt]);

  // Effect for periodic wallpaper updates
  useEffect(() => {
    const cleanup = () => {
      if (wallpaperIntervalRef.current) {
        clearInterval(wallpaperIntervalRef.current);
        wallpaperIntervalRef.current = null;
      }
    };

    if (isAutoWallpaperEnabled) {
      // Set an interval to generate wallpaper every 5 minutes (300000 ms)
      wallpaperIntervalRef.current = window.setInterval(() => {
        handleGenerateWallpaper(getTimeBasedPrompt());
      }, 300000);
    }

    return cleanup;
  }, [isAutoWallpaperEnabled, handleGenerateWallpaper, getTimeBasedPrompt]);

  const handleSetAutoWallpaper = (enabled: boolean) => {
    setIsAutoWallpaperEnabled(enabled);
  };

  const handleMasterClose = () => {
    if (activeApp) {
      handleCloseAppView();
    }
  };

  const quickLaunchIds = [
    'my_computer',
    'documents',
    'file_explorer',
    'web_browser_app',
  ];
  const quickLaunchApps = APP_DEFINITIONS_CONFIG.filter((app) =>
    quickLaunchIds.includes(app.id),
  );

  return (
    <div className="w-screen h-screen flex flex-col">
      {showBSOD && <BSOD />}
      <main
        className="flex-grow"
        ref={desktopRef}
        style={{
          backgroundImage: wallpaperUrl ? `url(${wallpaperUrl})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          visibility: showBSOD ? 'hidden' : 'visible', // Hide main content during BSOD
        }}>
        {activeApp ? (
          <div className="w-full h-full flex items-center justify-center">
            <Window
              title={activeApp.name}
              onClose={handleMasterClose}
              isAppOpen={!!activeApp}
              appId={activeApp?.id}
              onExitToDesktop={handleCloseAppView}>
              <>
                {isLoading && llmContent.length === 0 && (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                )}
                {error && (
                  <div className="p-4 text-red-600 bg-red-100 rounded-md">
                    {error}
                  </div>
                )}
                {(!isLoading || llmContent) && (
                  <GeneratedContent
                    htmlContent={llmContent}
                    onInteract={handleInteraction}
                    appContext={activeApp.id}
                    isLoading={isLoading}
                  />
                )}
              </>
            </Window>
          </div>
        ) : (
          <DesktopView
            onAppOpen={handleAppOpen}
            iconPositions={iconPositions}
            onIconMove={handleIconPositionChange}
            boundsRef={desktopRef}
            hiddenIconIds={hiddenIconIds}
          />
        )}
      </main>

      <Taskbar
        quickLaunchApps={quickLaunchApps}
        onAppOpen={handleAppOpen}
        currentLength={currentMaxHistoryLength}
        onUpdateHistoryLength={handleUpdateHistoryLength}
        isStatefulnessEnabled={isStatefulnessEnabled}
        onSetStatefulness={handleSetStatefulness}
        onGenerateWallpaper={handleGenerateWallpaper}
        isGeneratingWallpaper={isGeneratingWallpaper}
        wallpaperError={wallpaperError}
        isAutoWallpaperEnabled={isAutoWallpaperEnabled}
        onSetAutoWallpaper={handleSetAutoWallpaper}
        style={{visibility: showBSOD ? 'hidden' : 'visible'}} // Hide taskbar during BSOD
      />
    </div>
  );
};

export default App;