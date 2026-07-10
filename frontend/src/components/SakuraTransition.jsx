// Анимация перехода в тренировочный режим: падающие лепестки сакуры (Canvas) +
// цветок, текст и полоса загрузки (Framer Motion). Длится ~3.8 сек, затем вызывает onComplete.
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const PETAL_COUNT = 55;   // количество лепестков
const DURATION = 3800;    // длительность анимации в миллисекундах
const COLORS = ['#FFB7C5', '#FFC0CB', '#FFD1DC', '#FFAEC9', '#FF91A4', '#ffd6e0']; // оттенки сакуры

// Случайное число в диапазоне [min, max)
const rand = (min, max) => Math.random() * (max - min) + min;

// Создаёт один лепесток со случайными параметрами (позиция, размер, скорость, цвет и т.д.)
const makePetal = (w, h) => ({
  x: rand(0, w),                 // позиция по горизонтали
  y: rand(-180, -10),            // стартует выше экрана
  size: rand(10, 24),            // размер
  speedX: rand(-0.8, 0.8),       // горизонтальный дрейф
  speedY: rand(1.6, 3.6),        // скорость падения
  rotation: rand(0, Math.PI * 2),// начальный поворот
  rotationSpeed: rand(-0.03, 0.03),
  opacity: rand(0.55, 0.92),
  color: COLORS[Math.floor(rand(0, COLORS.length))],
  wave: rand(0, Math.PI * 2),    // фаза покачивания
  waveAmp: rand(0.4, 0.9),       // амплитуда покачивания
});

const SakuraTransition = ({ onComplete }) => {
  const canvasRef = useRef(null);   // ссылка на <canvas>
  const animRef = useRef(null);     // id анимационного кадра (для остановки)
  const petalsRef = useRef([]);     // массив лепестков
  const startRef = useRef(null);    // момент старта анимации

  // По истечении DURATION вызываем onComplete (там включается тренировочный режим)
  useEffect(() => {
    const t = setTimeout(onComplete, DURATION);
    return () => clearTimeout(t); // очистка таймера при размонтировании
  }, [onComplete]);

  // Основной цикл рисования лепестков на Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    // Создаём начальный набор лепестков
    petalsRef.current = Array.from({ length: PETAL_COUNT }, () => makePetal(W, H));
    startRef.current = performance.now();

    // Розовый радиальный градиент для фона
    const bgGrad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.75);
    bgGrad.addColorStop(0, 'rgba(255, 228, 234, 1)');
    bgGrad.addColorStop(0.5, 'rgba(255, 183, 197, 1)');
    bgGrad.addColorStop(1, 'rgba(255, 139, 171, 1)');

    // Функция одного кадра анимации
    const loop = (now) => {
      const elapsed = now - startRef.current;
      const t = Math.min(elapsed / DURATION, 1); // прогресс от 0 до 1

      // Плавная огибающая прозрачности: медленное появление, удержание, мягкое исчезновение
      const env = t < 0.12
        ? t / 0.12
        : t < 0.78
          ? 1
          : 1 - (t - 0.78) / 0.22;

      ctx.clearRect(0, 0, W, H); // очистить кадр

      // Рисуем фон с текущей прозрачностью
      ctx.globalAlpha = env * 0.94;
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;

      const time = now * 0.0006;
      // Рисуем и сдвигаем каждый лепесток
      petalsRef.current.forEach((p, i) => {
        ctx.save();
        ctx.globalAlpha = p.opacity * env;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        // Тело лепестка — эллипс
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * 0.42, p.size * 0.68, 0, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        // Тонкая прожилка по центру
        ctx.beginPath();
        ctx.moveTo(0, -p.size * 0.58);
        ctx.lineTo(0, p.size * 0.58);
        ctx.strokeStyle = 'rgba(255,255,255,0.45)';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        ctx.restore();

        // Обновляем позицию: падение вниз + покачивание по синусоиде
        p.x += p.speedX + Math.sin(time + p.wave + i * 0.25) * p.waveAmp;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;

        // Если лепесток ушёл за низ экрана — пересоздаём его сверху
        if (p.y > H + 30) {
          Object.assign(p, makePetal(W, H));
          p.y = rand(-140, -10);
        }
      });

      // Запрашиваем следующий кадр, пока анимация не закончилась
      if (t < 1) animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current); // остановить при размонтировании
  }, []);

  const dur = DURATION / 1000; // длительность в секундах для framer-motion

  return (
    // Полупрозрачный оверлей на весь экран поверх всего интерфейса
    <div style={{ position: 'fixed', inset: 0, zIndex: 9997, pointerEvents: 'all' }}>

      {/* Холст с падающими лепестками */}
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />

      {/* Центральный блок: цветок + текст (центрируется через flexbox) */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28,
      }}>

        {/* Цветок ✦ — анимация появления/исчезновения с поворотом (Framer Motion) */}
        <motion.div
          initial={{ scale: 0, opacity: 0, rotate: -12 }}
          animate={{ scale: [0, 1.45, 1.2, 0], opacity: [0, 1, 1, 0], rotate: [-12, 4, -2, 6] }}
          transition={{ duration: dur, times: [0, 0.22, 0.68, 1], ease: 'easeInOut' }}
          style={{ fontSize: 110, lineHeight: 1, filter: 'drop-shadow(0 4px 20px rgba(160,50,90,0.3))' }}
        >
          ✦
        </motion.div>

        {/* Текст «РЕЖИМ ТРЕНИРОВКИ» */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: [0, 1, 1, 0], y: [18, 0, 0, -12] }}
          transition={{ duration: dur, times: [0, 0.25, 0.72, 1] }}
          style={{ textAlign: 'center' }}
        >
          <div style={{ fontSize: 22, fontWeight: 800, color: '#a02850', letterSpacing: 3 }}>
            РЕЖИМ ТРЕНИРОВКИ
          </div>
          <div style={{ fontSize: 13, color: '#c0506e', marginTop: 8, fontWeight: 500, letterSpacing: 0.5 }}>
            Данные изолированы — тренируйтесь свободно
          </div>
        </motion.div>

      </div>

      {/* Полоса загрузки внизу экрана */}
      <div style={{
        position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)',
        width: 220, zIndex: 2,
      }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ duration: dur, times: [0, 0.15, 0.78, 1] }}
        >
          <div style={{ fontSize: 11, color: '#c0506e', textAlign: 'center', marginBottom: 8, letterSpacing: 1, fontWeight: 600 }}>
            ЗАГРУЗКА
          </div>
          {/* Сама полоса: заполняется от 0% до 100% */}
          <div style={{ width: '100%', height: 3, background: 'rgba(160,50,80,0.2)', borderRadius: 4, overflow: 'hidden' }}>
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: dur * 0.82, delay: dur * 0.08, ease: 'easeInOut' }}
              style={{ height: '100%', background: 'linear-gradient(90deg, #FFB7C5, #ff8fab, #c9426a)', borderRadius: 4 }}
            />
          </div>
        </motion.div>
      </div>

    </div>
  );
};

export default SakuraTransition;
