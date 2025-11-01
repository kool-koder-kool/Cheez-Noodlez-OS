/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */
import React, {useRef} from 'react';
import {AppDefinition} from '../types';

interface IconProps {
  app: AppDefinition;
  onInteract: () => void;
  position?: {x: number; y: number};
  onMove: (pos: {x: number; y: number}) => void;
  boundsRef: React.RefObject<HTMLElement>;
}

export const Icon: React.FC<IconProps> = ({
  app,
  onInteract,
  position,
  onMove,
  boundsRef,
}) => {
  const iconRef = useRef<HTMLDivElement>(null);
  const hasMovedRef = useRef(false);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!iconRef.current || !boundsRef.current) return;

    // Prevent default behaviors like text selection
    e.preventDefault();
    hasMovedRef.current = false;

    const startPos = {x: e.clientX, y: e.clientY};
    const iconRect = iconRef.current.getBoundingClientRect();
    const offset = {
      x: e.clientX - iconRect.left,
      y: e.clientY - iconRect.top,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const distance = Math.sqrt(
        Math.pow(moveEvent.clientX - startPos.x, 2) +
          Math.pow(moveEvent.clientY - startPos.y, 2),
      );

      // Only register as a "move" if dragged beyond a threshold
      if (distance > 5) {
        hasMovedRef.current = true;
      }

      if (boundsRef.current) {
        const boundsRect = boundsRef.current.getBoundingClientRect();
        let newX = moveEvent.clientX - offset.x - boundsRect.left;
        let newY = moveEvent.clientY - offset.y - boundsRect.top;

        // Constrain the icon within the parent bounds
        newX = Math.max(0, Math.min(newX, boundsRect.width - iconRect.width));
        newY = Math.max(
          0,
          Math.min(newY, boundsRect.height - iconRect.height),
        );

        onMove({x: newX, y: newY});
      }
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp, {once: true});
  };

  const handleClick = () => {
    // If the mouse hasn't moved significantly, treat it as a click
    if (!hasMovedRef.current) {
      onInteract();
    }
  };

  return (
    <div
      ref={iconRef}
      style={{
        position: 'absolute',
        left: `${position?.x ?? 0}px`,
        top: `${position?.y ?? 0}px`,
        touchAction: 'none', // Prevents scrolling on touch devices
        visibility: position ? 'visible' : 'hidden', // Hide until positioned
      }}
      className="w-28 h-32 flex flex-col items-center justify-start text-center p-2 cursor-pointer select-none rounded-lg transition-colors hover:bg-blue-400/30 focus-within:bg-blue-400/50 focus-within:outline-none focus-within:ring-1 focus-within:ring-blue-500 border border-transparent focus-within:border-blue-500"
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      role="button"
      aria-label={`Open ${app.name}`}>
      <div className="text-6xl mb-2 drop-shadow-md">{app.icon}</div>
      <div className="text-sm text-white font-semibold break-words max-w-full leading-tight shadow-black [text-shadow:_1px_1px_2px_rgb(0_0_0_/_80%)]">
        {app.name}
      </div>
    </div>
  );
};
