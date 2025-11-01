/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */
import React, {useEffect, useRef, useState} from 'react';
import {AppDefinition} from '../types';

// Define the props for the popup panel
interface ParametersPopupProps {
  currentLength: number;
  onUpdateHistoryLength: (newLength: number) => void;
  isStatefulnessEnabled: boolean;
  onSetStatefulness: (enabled: boolean) => void;
  onGenerateWallpaper: (prompt: string) => void;
  isGeneratingWallpaper: boolean;
  wallpaperError: string | null;
  onClose: () => void;
  isAutoWallpaperEnabled: boolean;
  onSetAutoWallpaper: (enabled: boolean) => void;
}

// Create a new component for the Parameters Popup
const ParametersPopup: React.FC<ParametersPopupProps> = ({
  currentLength,
  onUpdateHistoryLength,
  isStatefulnessEnabled,
  onSetStatefulness,
  onGenerateWallpaper,
  isGeneratingWallpaper,
  wallpaperError,
  onClose,
  isAutoWallpaperEnabled,
  onSetAutoWallpaper,
}) => {
  const [localHistoryLengthInput, setLocalHistoryLengthInput] =
    useState<string>(currentLength.toString());
  const [localStatefulnessChecked, setLocalStatefulnessChecked] =
    useState<boolean>(isStatefulnessEnabled);
  const [localWallpaperPrompt, setLocalWallpaperPrompt] = useState('');
  const [localAutoWallpaperChecked, setLocalAutoWallpaperChecked] =
    useState<boolean>(isAutoWallpaperEnabled);

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 5) return 'deep night sky';
    if (hour < 12) return 'crisp morning sunrise';
    if (hour < 17) return 'bright afternoon';
    if (hour < 21) return 'warm evening sunset';
    return 'starry night';
  };

  useEffect(() => {
    setLocalHistoryLengthInput(currentLength.toString());
    setLocalStatefulnessChecked(isStatefulnessEnabled);
    setLocalAutoWallpaperChecked(isAutoWallpaperEnabled);
    setLocalWallpaperPrompt(
      `A beautiful, serene desktop wallpaper of a landscape, capturing the mood of a peaceful ${getTimeBasedGreeting()}. Digital art.`,
    );
  }, [currentLength, isStatefulnessEnabled, isAutoWallpaperEnabled]);

  const handleApplyAndClose = () => {
    const newLength = parseInt(localHistoryLengthInput, 10);
    if (!isNaN(newLength) && newLength >= 0 && newLength <= 10) {
      onUpdateHistoryLength(newLength);
    } else {
      alert('Please enter a number between 0 and 10 for history length.');
      return;
    }
    if (localStatefulnessChecked !== isStatefulnessEnabled) {
      onSetStatefulness(localStatefulnessChecked);
    }
    if (localAutoWallpaperChecked !== isAutoWallpaperEnabled) {
      onSetAutoWallpaper(localAutoWallpaperChecked);
    }
    onClose();
  };

  const handleGenerateClick = () => {
    if (localWallpaperPrompt.trim()) {
      onGenerateWallpaper(localWallpaperPrompt);
    }
  };

  return (
    <div className="absolute bottom-full right-0 mb-2 w-[420px] bg-[#F0F0F0] border border-gray-500 rounded-lg shadow-2xl p-4 flex flex-col gap-4 font-sans text-sm z-50">
      <div className="w-full">
        <label
          htmlFor="maxHistoryLengthInput"
          className="llm-label whitespace-nowrap mr-3">
          Max History Length:
        </label>
        <input
          type="number"
          id="maxHistoryLengthInput"
          value={localHistoryLengthInput}
          onChange={(e) => setLocalHistoryLengthInput(e.target.value)}
          min="0"
          max="10"
          className="llm-input !m-0 !w-20"
        />
      </div>
      <div className="w-full flex items-center">
        <label
          htmlFor="statefulnessCheckbox"
          className="llm-label whitespace-nowrap mr-3">
          Enable Statefulness:
        </label>
        <input
          type="checkbox"
          id="statefulnessCheckbox"
          checked={localStatefulnessChecked}
          onChange={(e) => setLocalStatefulnessChecked(e.target.checked)}
          className="h-4 w-4 text-blue-600 border-gray-400 rounded-sm focus:ring-blue-500 cursor-pointer"
        />
      </div>
      <hr className="w-full border-t border-gray-300 my-2" />
      <div>
        <h3 className="llm-title !text-sm !font-bold !text-black !mb-2 !m-0">
          Desktop Wallpaper
        </h3>
        <label
          htmlFor="wallpaperPromptInput"
          className="llm-label mb-2 block">
          Describe a new wallpaper:
        </label>
        <textarea
          id="wallpaperPromptInput"
          value={localWallpaperPrompt}
          onChange={(e) => setLocalWallpaperPrompt(e.target.value)}
          className="llm-textarea !m-0 w-full"
          rows={3}
        />
        <div className="mt-3">
          <button
            onClick={handleGenerateClick}
            className="llm-button"
            disabled={isGeneratingWallpaper || !localWallpaperPrompt.trim()}>
            {isGeneratingWallpaper ? 'Generating...' : 'Generate'}
          </button>
          {wallpaperError && (
            <p className="text-sm text-red-600 mt-2">{wallpaperError}</p>
          )}
        </div>
        <div className="mt-2 flex items-center">
          <input
            type="checkbox"
            id="autoWallpaperCheckbox"
            checked={localAutoWallpaperChecked}
            onChange={(e) => setLocalAutoWallpaperChecked(e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-400 rounded-sm focus:ring-blue-500 cursor-pointer mr-2"
            aria-describedby="autoWallpaperHelpText"
          />
          <label htmlFor="autoWallpaperCheckbox" className="llm-label">
            Refresh wallpaper periodically (every 5 mins)
          </label>
        </div>
      </div>
      <hr className="w-full border-t border-gray-300 my-2" />
      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="llm-button">
          Cancel
        </button>
        <button onClick={handleApplyAndClose} className="llm-button">
          Apply & Close
        </button>
      </div>
    </div>
  );
};

// Update TaskbarProps to include parameters functionality
interface TaskbarProps {
  quickLaunchApps: AppDefinition[];
  onAppOpen: (app: AppDefinition) => void;
  currentLength: number;
  onUpdateHistoryLength: (newLength: number) => void;
  isStatefulnessEnabled: boolean;
  onSetStatefulness: (enabled: boolean) => void;
  onGenerateWallpaper: (prompt: string) => void;
  isGeneratingWallpaper: boolean;
  wallpaperError: string | null;
  style?: React.CSSProperties; // Add style prop
  isAutoWallpaperEnabled: boolean;
  onSetAutoWallpaper: (enabled: boolean) => void;
}

export const Taskbar: React.FC<TaskbarProps> = (props) => {
  const {quickLaunchApps, onAppOpen, style} = props;
  const [time, setTime] = useState(
    new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
  );
  const [isParametersOpen, setIsParametersOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const settingsIconRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const timerId = setInterval(() => {
      setTime(
        new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      );
    }, 1000 * 30);
    return () => clearInterval(timerId);
  }, []);

  // Effect to handle clicks outside the popup to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isParametersOpen &&
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        settingsIconRef.current &&
        !settingsIconRef.current.contains(event.target as Node)
      ) {
        setIsParametersOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isParametersOpen]);

  return (
    <div className="taskbar relative" style={style}>
      <div className="flex items-center gap-2">
        <button className="start-button" aria-label="Start menu">
          <span className="text-2xl">🪟</span>
        </button>
        <div className="h-full border-l border-white/30"></div>
        {quickLaunchApps.map((app) => (
          <button
            key={app.id}
            onClick={() => onAppOpen(app)}
            className="taskbar-icon"
            aria-label={app.name}>
            {app.icon}
          </button>
        ))}
      </div>
      <div className="system-tray">
        <button
          ref={settingsIconRef}
          onClick={() => setIsParametersOpen((prev) => !prev)}
          className="taskbar-icon !w-7 !h-7 mr-2"
          aria-label="Open Settings">
          ⚙️
        </button>
        <span>{time}</span>
      </div>
      {isParametersOpen && (
        <div ref={popupRef}>
          <ParametersPopup {...props} onClose={() => setIsParametersOpen(false)} />
        </div>
      )}
    </div>
  );
};