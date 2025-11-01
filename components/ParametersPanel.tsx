/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */
import React, {useEffect, useState} from 'react';

interface ParametersPanelProps {
  currentLength: number;
  onUpdateHistoryLength: (newLength: number) => void;
  onClosePanel: () => void;
  isStatefulnessEnabled: boolean;
  onSetStatefulness: (enabled: boolean) => void;
  onGenerateWallpaper: (prompt: string) => void;
  isGeneratingWallpaper: boolean;
  wallpaperError: string | null;
}

export const ParametersPanel: React.FC<ParametersPanelProps> = ({
  currentLength,
  onUpdateHistoryLength,
  onClosePanel,
  isStatefulnessEnabled,
  onSetStatefulness,
  onGenerateWallpaper,
  isGeneratingWallpaper,
  wallpaperError,
}) => {
  // Local state for pending changes
  const [localHistoryLengthInput, setLocalHistoryLengthInput] =
    useState<string>(currentLength.toString());
  const [localStatefulnessChecked, setLocalStatefulnessChecked] =
    useState<boolean>(isStatefulnessEnabled);
  const [localWallpaperPrompt, setLocalWallpaperPrompt] = useState('');

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 5) return 'deep night sky';
    if (hour < 12) return 'crisp morning sunrise';
    if (hour < 17) return 'bright afternoon';
    if (hour < 21) return 'warm evening sunset';
    return 'starry night';
  };

  // Update local state if props change (e.g., panel re-opened)
  useEffect(() => {
    setLocalHistoryLengthInput(currentLength.toString());
    setLocalStatefulnessChecked(isStatefulnessEnabled);
    // Set default prompt only when the panel is opened
    setLocalWallpaperPrompt(
      `A beautiful, serene desktop wallpaper of a landscape, capturing the mood of a peaceful ${getTimeBasedGreeting()}. Digital art.`,
    );
  }, [currentLength, isStatefulnessEnabled]);

  const handleHistoryLengthInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setLocalHistoryLengthInput(event.target.value);
  };

  const handleStatefulnessCheckboxChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setLocalStatefulnessChecked(event.target.checked);
  };

  const handleWallpaperPromptChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setLocalWallpaperPrompt(event.target.value);
  };

  const handleGenerateClick = () => {
    if (localWallpaperPrompt.trim()) {
      onGenerateWallpaper(localWallpaperPrompt);
    }
  };

  const handleApplyAndClose = () => {
    // Apply history length
    const newLength = parseInt(localHistoryLengthInput, 10);
    if (!isNaN(newLength) && newLength >= 0 && newLength <= 10) {
      onUpdateHistoryLength(newLength);
    } else {
      alert('Please enter a number between 0 and 10 for history length.');
      setLocalHistoryLengthInput(currentLength.toString());
      return;
    }

    if (localStatefulnessChecked !== isStatefulnessEnabled) {
      onSetStatefulness(localStatefulnessChecked);
    }

    onClosePanel();
  };

  const handleCancel = () => {
    setLocalHistoryLengthInput(currentLength.toString());
    setLocalStatefulnessChecked(isStatefulnessEnabled);
    onClosePanel();
  };

  return (
    <div className="p-6 bg-[#F0F0F0] h-full flex flex-col items-start pt-8 font-sans overflow-y-auto">
      {/* Interaction History Row */}
      <div className="w-full max-w-md mb-6">
        <div className="llm-row items-center">
          <label
            htmlFor="maxHistoryLengthInput"
            className="llm-label whitespace-nowrap mr-3 flex-shrink-0"
            style={{minWidth: '150px'}}>
            Max History Length:
          </label>
          <input
            type="number"
            id="maxHistoryLengthInput"
            value={localHistoryLengthInput}
            onChange={handleHistoryLengthInputChange}
            min="0"
            max="10"
            className="llm-input flex-grow"
            aria-describedby="historyLengthHelpText"
          />
        </div>
      </div>

      {/* Statefulness Row */}
      <div className="w-full max-w-md mb-4">
        <div className="llm-row items-center">
          <label
            htmlFor="statefulnessCheckbox"
            className="llm-label whitespace-nowrap mr-3 flex-shrink-0"
            style={{minWidth: '150px'}}>
            Enable Statefulness:
          </label>
          <input
            type="checkbox"
            id="statefulnessCheckbox"
            checked={localStatefulnessChecked}
            onChange={handleStatefulnessCheckboxChange}
            className="h-4 w-4 text-blue-600 border-gray-400 rounded-sm focus:ring-blue-500 cursor-pointer"
            aria-describedby="statefulnessHelpText"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 w-full max-w-md flex justify-start gap-3">
        <button
          onClick={handleApplyAndClose}
          className="llm-button"
          aria-label="Save settings and close">
          Save Settings
        </button>
        <button
          onClick={handleCancel}
          className="llm-button"
          aria-label="Close parameters panel without applying current changes">
          Cancel
        </button>
      </div>

      <hr className="w-full max-w-md border-t border-gray-300 my-8" />

      {/* Wallpaper Generation Section */}
      <div className="w-full max-w-md mb-6">
        <h3 className="llm-title !text-base !font-bold !text-black !mb-2">
          Desktop Wallpaper
        </h3>
        <label htmlFor="wallpaperPromptInput" className="llm-label mb-2 block">
          Describe the wallpaper you'd like to create:
        </label>
        <textarea
          id="wallpaperPromptInput"
          value={localWallpaperPrompt}
          onChange={handleWallpaperPromptChange}
          className="llm-textarea w-full"
          rows={3}
          aria-describedby="wallpaperHelpText"
        />
        <p id="wallpaperHelpText" className="text-xs text-gray-500 mt-1 mx-2">
          A prompt is suggested based on the current time of day. Feel free to
          customize it.
        </p>
        <div className="mt-3">
          <button
            onClick={handleGenerateClick}
            className="llm-button"
            disabled={isGeneratingWallpaper || !localWallpaperPrompt.trim()}
            aria-label="Generate a new wallpaper based on the description">
            {isGeneratingWallpaper ? 'Generating...' : 'Generate Wallpaper'}
          </button>
          {wallpaperError && (
            <p className="text-sm text-red-600 mt-2">{wallpaperError}</p>
          )}
        </div>
      </div>
    </div>
  );
};
