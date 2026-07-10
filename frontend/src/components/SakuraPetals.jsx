import React, { useEffect, useRef } from 'react';

const PETAL_COUNT = 18;

const random = (min, max) => Math.random() * (max - min) + min;

const createPetal = (canvas) => ({
  x: random(0, canvas.width),
  y: random(-80, -10),
  size: random(8, 18),
  speedX: random(-1.2, 1.2),
  speedY: random(1.2, 2.8),
  rotation: random(0, Math.PI * 2),
  rotationSpeed: random(-0.03, 0.03),
  opacity: random(0.5, 0.9),
  color: [
    '#FFB7C5',
    '#FFC0CB',
    '#FFD1DC',
    '#FFAEC9',
    '#FF91A4',
  ][Math.floor(random(0, 5))],
});

const drawPetal = (ctx, petal) => {
  ctx.save();
  ctx.globalAlpha = petal.opacity;
  ctx.translate(petal.x, petal.y);
  ctx.rotate(petal.rotation);

  ctx.beginPath();
  ctx.ellipse(0, 0, petal.size * 0.45, petal.size * 0.65, 0, 0, Math.PI * 2);
  ctx.fillStyle = petal.color;
  ctx.fill();

  // Прожилка
  ctx.beginPath();
  ctx.moveTo(0, -petal.size * 0.55);
  ctx.lineTo(0, petal.size * 0.55);
  ctx.strokeStyle = 'rgba(255,255,255,0.45)';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  ctx.restore();
};

const SakuraPetals = () => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const petalsRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    petalsRef.current = Array.from({ length: PETAL_COUNT }, () => createPetal(canvas));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      petalsRef.current.forEach((petal, i) => {
        drawPetal(ctx, petal);

        petal.x += petal.speedX + Math.sin(Date.now() * 0.001 + i) * 0.4;
        petal.y += petal.speedY;
        petal.rotation += petal.rotationSpeed;

        if (petal.y > canvas.height + 20) {
          petalsRef.current[i] = createPetal(canvas);
          petalsRef.current[i].y = random(-80, -10);
        }
      });

      animRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
};

export default SakuraPetals;
