/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */
import React from 'react';

const QrCodeSvg: React.FC = () => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 40 40"
    xmlns="http://www.w3.org/2000/svg"
    className="fill-current text-black">
    <path d="M0 0h12v12H0z M4 4h4v4H4z M16 0h4v4h-4z M20 0h4v4h-4z M28 0h12v12H28z m4 4h4v4h-4z M0 16h4v4H0z M8 16h4v4H8z M12 16h4v4h-4z M16 16h4v4h-4z M20 16h4v4h-4z M24 16h4v4h-4z M32 16h4v4h-4z M36 16h4v4h-4z M0 20h4v4H0z M12 20h4v4h-4z M20 20h4v4h-4z M28 20h4v4h-4z M36 20h4v4h-4z M0 28h12v12H0z m4 4h4v4h-4z M16 28h4v4h-4z M20 28h4v4h-4z M24 28h4v4h-4z M28 28h4v4h-4z M32 28h4v4h-4z M36 28h4v4h-4z M20 32h4v4h-4z M28 32h4v4h-4z M36 32h4v4h-4z M20 36h4v4h-4z M24 36h4v4h-4z M32 36h4v4h-4z" />
  </svg>
);

export const BSOD: React.FC = () => {
  return (
    <div className="fixed top-0 left-0 w-screen h-screen bg-black text-white font-sans flex items-center justify-center p-8 z-50 select-none">
      <div className="w-full max-w-3xl text-left">
        <div className="text-9xl font-light mb-8">:(</div>
        <p className="text-2xl mb-6 leading-tight">
          Your PC ran into a problem and needs to restart. We're just
          <br />
          collecting some error info, and then we'll restart for you.
        </p>

        <p className="text-xl mb-12">
          <span className="animate-pulse">0</span>% complete
        </p>

        <div className="flex items-center gap-6">
          <div className="w-28 h-28 bg-white p-1 flex-shrink-0">
            <QrCodeSvg />
          </div>
          <div>
            <p className="text-base">
              For more information about this issue and possible fixes, visit
              <br />
              https://www.windows.com/stopcode
            </p>
            <p className="text-base mt-4">
              If you call a support person, give them this info:
              <br />
              Stop code: UNSTABLE_MEMORY_CORRUPTION
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
