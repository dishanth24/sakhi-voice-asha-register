import React, { useEffect, useRef } from 'react';

export default function Waveform({ active = false, color = '#0D6B6E' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.strokeStyle = color;
      ctx.lineCap = 'round';

      const bars = 24;
      const spacing = width / bars;

      for (let i = 0; i < bars; i++) {
        const x = i * spacing + spacing / 2;
        let barHeight = 4; // idle baseline

        if (active) {
          const wave = Math.sin(phase + i * 0.4) * Math.cos(phase * 0.7 + i * 0.2);
          barHeight = Math.max(6, Math.abs(wave) * (height * 0.8));
        }

        ctx.moveTo(x, centerY - barHeight / 2);
        ctx.lineTo(x, centerY + barHeight / 2);
      }

      ctx.stroke();
      phase += 0.12;
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationId);
  }, [active, color]);

  return (
    <canvas
      ref={canvasRef}
      width={220}
      height={36}
      className="w-full max-w-[220px] h-9 opacity-85"
    />
  );
}
