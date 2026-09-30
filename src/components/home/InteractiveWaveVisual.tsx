import React, { useRef, useEffect, useState } from 'react';

export const InteractiveWaveVisual: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth * 2);
    let height = (canvas.height = canvas.offsetHeight * 2);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth * 2;
      height = canvas.height = canvas.offsetHeight * 2;
    };
    window.addEventListener('resize', handleResize);

    let step = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      step += 0.015;

      const lines = [
        { color: 'rgba(37, 99, 235, 0.45)', speed: 1.0, freq: 0.003, amp: 45, offset: 0 },
        { color: 'rgba(249, 115, 22, 0.35)', speed: 0.8, freq: 0.0025, amp: 35, offset: 2 },
        { color: 'rgba(59, 130, 246, 0.3)', speed: 1.2, freq: 0.004, amp: 55, offset: 4 },
        { color: 'rgba(16, 185, 129, 0.25)', speed: 0.6, freq: 0.002, amp: 25, offset: 1 }
      ];

      lines.forEach((line) => {
        ctx.beginPath();
        ctx.strokeStyle = line.color;
        ctx.lineWidth = 2.5;

        for (let x = 0; x <= width; x += 8) {
          const distanceToMouse = Math.abs(x - mousePos.x * width);
          const mouseFactor = Math.max(0, 1 - distanceToMouse / (width * 0.4));
          const interactiveBoost = mouseFactor * 30 * Math.sin(step * 3);

          const y =
            height / 2 +
            Math.sin(x * line.freq + step * line.speed + line.offset) * line.amp +
            Math.cos(x * 0.001 - step * 0.5) * 20 +
            interactiveBoost;

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      });

      // Draw floating nodes along central wave
      for (let i = 0; i < 6; i++) {
        const x = (width * 0.15) + (i * width * 0.14);
        const y =
          height / 2 +
          Math.sin(x * 0.003 + step + i) * 45 +
          Math.cos(x * 0.001 - step * 0.5) * 20;

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = i % 2 === 0 ? '#3b82f6' : '#f97316';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, 9, 0, Math.PI * 2);
        ctx.strokeStyle = i % 2 === 0 ? 'rgba(59, 130, 246, 0.25)' : 'rgba(249, 115, 22, 0.25)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mousePos]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height
    });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden bg-gradient-to-b from-stone-100/60 to-transparent dark:from-stone-900/60 dark:to-transparent border border-stone-200/80 dark:border-stone-800/80 flex items-center justify-center p-4"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Floating interactive thought nodes / snippets */}
      <div className="absolute top-6 left-6 max-w-[210px] p-3 rounded-xl bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border border-stone-200/90 dark:border-stone-800/90 shadow-md text-xs transform -rotate-1 hover:rotate-0 transition-transform duration-200 pointer-events-auto">
        <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mb-0.5">
          Philosophy · 4 min
        </div>
        <div className="font-serif font-semibold text-stone-900 dark:text-stone-100 leading-snug">
          "Void is not emptiness; void is room to breathe."
        </div>
      </div>

      <div className="absolute bottom-8 right-6 max-w-[230px] p-3 rounded-xl bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border border-stone-200/90 dark:border-stone-800/90 shadow-md text-xs transform rotate-2 hover:rotate-0 transition-transform duration-200 pointer-events-auto">
        <div className="text-[10px] text-orange-600 dark:text-orange-400 font-semibold mb-0.5">
          Software Craft · 6 min
        </div>
        <div className="font-serif font-semibold text-stone-900 dark:text-stone-100 leading-snug">
          "Elegance is the deliberate mastery of complexity."
        </div>
      </div>

      <div className="relative text-center z-10 pointer-events-none select-none">
        <div className="text-[11px] uppercase tracking-widest text-stone-400 dark:text-stone-500 font-semibold mb-1">
          Interactive Thought Flow
        </div>
        <div className="text-xs font-serif italic text-stone-600 dark:text-stone-400">
          Move your cursor to perturb the wave
        </div>
      </div>
    </div>
  );
};
