import React, { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

interface HeartAnimationProps {
  triggerBurst?: boolean;
}

export const HeartAnimation: React.FC<HeartAnimationProps> = ({ triggerBurst }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Confetti Heart Burst trigger
  useEffect(() => {
    if (triggerBurst) {
      // Launch romantic heart and glitter confetti blast
      const duration = 4 * 1000;
      const animationEnd = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 7,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors: ['#e11d48', '#ec4899', '#f43f5e', '#fbbf24', '#f472b6'],
          shapes: ['circle'],
          scalar: 1.2
        });
        confetti({
          particleCount: 7,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors: ['#e11d48', '#ec4899', '#f43f5e', '#fbbf24', '#f472b6'],
          shapes: ['circle'],
          scalar: 1.2
        });

        if (Date.now() < animationEnd) {
          requestAnimationFrame(frame);
        }
      };

      frame();
    }
  }, [triggerBurst]);

  // Floating background ambient hearts canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Floating particle object interface
    interface FloatingElement {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      opacity: number;
      color: string;
      rotation: number;
      rotationSpeed: number;
      type: 'heart' | 'sunflower';
    }

    const colors = ['#f43f5e', '#ec4899', '#f472b6', '#fb7185', '#e11d48', '#fbbf24'];
    const elements: FloatingElement[] = [];

    // Create hearts
    for (let i = 0; i < 22; i++) {
      elements.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 14 + 10,
        speedY: Math.random() * 0.7 + 0.3,
        speedX: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.4 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        type: 'heart',
      });
    }

    // Create ambient sunflowers
    for (let i = 0; i < 14; i++) {
      elements.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 12 + 10,
        speedY: Math.random() * 0.6 + 0.25,
        speedX: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.45 + 0.25,
        color: '#F59E0B',
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.015,
        type: 'sunflower',
      });
    }

    function drawSunflower(x: number, y: number, size: number, opacity: number, rotation: number) {
      if (!ctx) return;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.globalAlpha = opacity;

      // Draw 10 golden petals
      ctx.fillStyle = '#F59E0B';
      const petalCount = 10;
      for (let p = 0; p < petalCount; p++) {
        const angle = (p * Math.PI * 2) / petalCount;
        ctx.save();
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.ellipse(0, -size * 0.9, size * 0.35, size * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw inner golden ring
      ctx.fillStyle = '#FBBF24';
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.6, 0, Math.PI * 2);
      ctx.fill();

      // Draw brown seed center
      ctx.fillStyle = '#78350F';
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.45, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    function drawHeart(x: number, y: number, size: number, color: string, opacity: number, rotation: number) {
      if (!ctx) return;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.globalAlpha = opacity;
      ctx.fillStyle = color;

      ctx.beginPath();
      const topCurveHeight = size * 0.3;
      ctx.moveTo(0, topCurveHeight);
      // top left curve
      ctx.bezierCurveTo(
        -size / 2, -size / 2,
        -size, topCurveHeight,
        0, size
      );
      // top right curve
      ctx.bezierCurveTo(
        size, topCurveHeight,
        size / 2, -size / 2,
        0, topCurveHeight
      );
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      elements.forEach((el) => {
        el.y -= el.speedY;
        el.x += Math.sin(el.y * 0.01) * el.speedX;
        el.rotation += el.rotationSpeed;

        if (el.y < -50) {
          el.y = height + 20;
          el.x = Math.random() * width;
        }

        if (el.type === 'sunflower') {
          drawSunflower(el.x, el.y, el.size, el.opacity, el.rotation);
        } else {
          drawHeart(el.x, el.y, el.size, el.color, el.opacity, el.rotation);
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
};
