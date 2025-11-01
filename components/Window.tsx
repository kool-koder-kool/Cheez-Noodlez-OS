/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */
import React from 'react';

interface WindowProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  isAppOpen: boolean;
  appId?: string | null;
  onExitToDesktop: () => void;
}

const MenuItem: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}> = ({children, onClick, className}) => (
  <span
    className={`px-2 py-1 cursor-pointer hover:bg-blue-500 hover:text-white rounded-sm ${className}`}
    onClick={onClick}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') onClick?.();
    }}
    tabIndex={0}
    role="button">
    {children}
  </span>
);

const WindowControlButton: React.FC<{
  symbol: string;
  ariaLabel: string;
  onClick?: () => void;
  className?: string;
}> = ({symbol, ariaLabel, onClick, className}) => (
  <button
    onClick={onClick}
    aria-label={ariaLabel}
    className={`w-8 h-6 flex items-center justify-center text-xs font-bold text-gray-800 bg-gray-200 border-b border-gray-400 transition-colors ${className}`}>
    {symbol}
  </button>
);

export const Window: React.FC<WindowProps> = ({
  title,
  children,
  onClose,
  isAppOpen,
  appId,
  onExitToDesktop,
}) => {
  const isFullScreenApp =
    appId === 'web_browser_app' ||
    appId === 'travel_app' ||
    appId === 'cheez_noodlez_search' ||
    appId === 'cheez_noodlez_arcade';

  // Default window size
  let windowSizeClasses = 'w-[800px] h-[600px]';
  if (
    appId === 'cheez_noodlez_search' ||
    appId === 'cheez_noodlez_arcade'
  ) {
    // The Cheez Noodlez iframe is 850x600.
    // We size the window so the content area fits the iframe perfectly (no padding).
    // Total window width = 850px content + 2px border = 852px
    // Total window height = 600px content + 58px chrome (title/menu bars, border) = 658px
    windowSizeClasses = 'w-[852px] h-[658px]';
  }

  return (
    <div
      className={`${windowSizeClasses} border border-gray-500 rounded-lg shadow-2xl flex flex-col font-sans bg-[#F0F0F0] overflow-hidden`}>
      {/* Title Bar - Aero style */}
      <div
        className="text-black py-1 px-2 text-sm flex justify-between items-center select-none cursor-default rounded-t-md flex-shrink-0"
        style={{
          background:
            'linear-gradient(to bottom, rgba(255,255,255,0.9) 0%, rgba(200,220,255,0.8) 100%)',
          borderBottom: '1px solid rgba(0,0,0,0.2)',
        }}>
        <span className="font-semibold drop-shadow-sm">{title}</span>
        <div className="flex items-center">
          <WindowControlButton
            symbol="─"
            ariaLabel="Minimize"
            className="hover:bg-gray-300"
          />
          <WindowControlButton
            symbol="□"
            ariaLabel="Maximize"
            className="hover:bg-gray-300"
          />
          <WindowControlButton
            symbol="✕"
            ariaLabel="Close"
            onClick={onClose}
            className="hover:bg-red-500 hover:text-white"
          />
        </div>
      </div>

      {/* Menu Bar */}
      <div className="bg-[#F0F0F0] py-1 px-2 border-b border-gray-300 select-none flex gap-1 flex-shrink-0 text-sm text-black items-center shadow-inner">
        {isAppOpen && (
          <MenuItem onClick={onExitToDesktop} className="ml-auto">
            Exit to Desktop
          </MenuItem>
        )}
      </div>

      {/* Content */}
      <div
        className={`flex-grow overflow-y-auto bg-white ${isFullScreenApp ? '' : 'p-1'}`}>
        {children}
      </div>
    </div>
  );
};