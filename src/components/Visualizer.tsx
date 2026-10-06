import React, { useEffect, useRef } from 'react';

interface VisualizerProps {
  analyserNode: AnalyserNode | null;
  isPlaying: boolean;
  themeColor?: string; // e.g. '#06b6d4' or '#ef4444' or '#a855f7'
  mode?: 'bars' | 'wave' | 'pulse';
}

export const Visualizer: React.FC<VisualizerProps> = ({
  analyserNode,
  isPlaying,
  themeColor = '#06b6d4',
  mode = 'wave',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let pulseRadius = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Subtle background grid
      ctx.fillStyle = 'rgba(10, 15, 29, 0.4)';
      ctx.fillRect(0, 0, width, height);

      if (!analyserNode || !isPlaying) {
        // Idle line
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.3)';
        ctx.lineWidth = 2;
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();

        // Idle glow dots
        const t = Date.now() * 0.002;
        for (let i = 0; i < 8; i++) {
          const x = (width / 9) * (i + 1);
          const y = height / 2 + Math.sin(t + i * 0.8) * 3;
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fillStyle = themeColor;
          ctx.globalAlpha = 0.4;
          ctx.fill();
          ctx.globalAlpha = 1.0;
        }

        animationFrameId.current = requestAnimationFrame(render);
        return;
      }

      if (mode === 'wave') {
        const bufferLength = analyserNode.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserNode.getByteTimeDomainData(dataArray);

        ctx.lineWidth = 3;
        ctx.strokeStyle = themeColor;
        ctx.shadowBlur = 14;
        ctx.shadowColor = themeColor;
        ctx.beginPath();

        const sliceWidth = (width * 1.0) / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        ctx.lineTo(width, height / 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else if (mode === 'bars') {
        const bufferLength = analyserNode.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserNode.getByteFrequencyData(dataArray);

        const barCount = 48;
        const step = Math.floor(bufferLength / barCount);
        const barWidth = width / barCount - 2;

        for (let i = 0; i < barCount; i++) {
          let sum = 0;
          for (let j = 0; j < step; j++) {
            sum += dataArray[i * step + j] || 0;
          }
          const avg = sum / step;
          const barHeight = (avg / 255) * (height - 8);

          const x = i * (barWidth + 2);
          const y = height - barHeight;

          const grad = ctx.createLinearGradient(0, height, 0, y);
          grad.addColorStop(0, `${themeColor}44`);
          grad.addColorStop(1, themeColor);

          ctx.fillStyle = grad;
          ctx.shadowBlur = avg > 120 ? 8 : 0;
          ctx.shadowColor = themeColor;
          ctx.fillRect(x, y, barWidth, barHeight);
          ctx.shadowBlur = 0;

          // Peak cap
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x, Math.max(0, y - 2), barWidth, 2);
        }
      } else {
        // Pulse mode
        const bufferLength = analyserNode.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserNode.getByteFrequencyData(dataArray);

        let energy = 0;
        for (let i = 0; i < 32; i++) {
          energy += dataArray[i];
        }
        energy = energy / 32 / 255;

        pulseRadius = pulseRadius * 0.85 + energy * (height * 0.4) * 0.15;
        const centerX = width / 2;
        const centerY = height / 2;

        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, Math.max(10, pulseRadius * 2), 0, Math.PI * 2);
        ctx.strokeStyle = themeColor;
        ctx.lineWidth = 4;
        ctx.shadowBlur = 20;
        ctx.shadowColor = themeColor;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(centerX, centerY, Math.max(5, pulseRadius), 0, Math.PI * 2);
        ctx.fillStyle = `${themeColor}33`;
        ctx.fill();
        ctx.restore();
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [analyserNode, isPlaying, themeColor, mode]);

  return (
    <div className="relative w-full h-24 bg-slate-950/80 rounded-xl overflow-hidden border border-slate-800 shadow-inner">
      <canvas
        ref={canvasRef}
        width={800}
        height={100}
        className="w-full h-full block"
      />
    </div>
  );
};
