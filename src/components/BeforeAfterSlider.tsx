/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';

interface BeforeAfterSliderProps {
  before: string;
  after: string;
}

export default function BeforeAfterSlider({ before, after }: BeforeAfterSliderProps) {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.max(0, Math.min(100, x)));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative overflow-hidden rounded-[16px] h-64 cursor-ew-resize select-none border border-[#EDE0CC]"
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
    >
      {/* After image is background */}
      <img src={after} alt="After" className="absolute inset-0 w-full h-full object-cover" />
      
      {/* Before image is width-clipped foreground */}
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPos}%` }}>
        <img src={before} alt="Before" className="absolute inset-0 w-full h-full object-cover max-w-none" style={{ width: containerRef.current?.getBoundingClientRect().width || '100%' }} />
      </div>

      {/* Divider slider line */}
      <div className="absolute top-0 bottom-0 w-1 bg-[#FF9A3C] pointer-events-none" style={{ left: `${sliderPos}%` }}>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#FF9A3C] text-white flex items-center justify-center shadow-lg font-bold">
          ↔
        </div>
      </div>
      
      <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded uppercase font-semibold">
        Before / पहले
      </div>
      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded uppercase font-semibold">
        After / बाद में
      </div>
    </div>
  );
}
