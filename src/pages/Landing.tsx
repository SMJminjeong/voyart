import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTimeBackground } from '../hooks/useTimeBackground';

/* ───────────────────────────── 별 캔버스 ───────────────────────────── */

interface Star {
  x: number;
  y: number;
  r: number;
  alpha: number;
  speed: number;
  phase: number;
}

function initStars(canvas: HTMLCanvasElement): Star[] {
  return Array.from({ length: 180 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.6 + 0.3,
    alpha: Math.random() * 0.6 + 0.2,
    speed: Math.random() * 0.4 + 0.1,
    phase: Math.random() * Math.PI * 2,
  }));
}

function drawStars(ctx: CanvasRenderingContext2D, stars: Star[], t: number) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  stars.forEach((star) => {
    const alpha = star.alpha * (0.6 + 0.4 * Math.sin(t * star.speed + star.phase));

    // 큰 별 빛 번짐 (glow)
    if (star.r > 1.4) {
      const glow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.r * 6);
      glow.addColorStop(0, `rgba(255,255,255,${alpha * 0.6})`);
      glow.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r * 6, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();
    }

    // 별 본체
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fill();
  });
}

function StarCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const stars = initStars(canvas);
    let animId: number;
    let start: number | null = null;

    const tick = (ts: number) => {
      if (!start) start = ts;
      const t = (ts - start) / 1000;
      drawStars(ctx, stars, t);
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}

/* ───────────────────────── 특징 카드 데이터 ───────────────────────── */

const FEATURES = [
  {
    icon: '🎨',
    title: '감성 코스',
    desc: '무드와 취향을 입력하면\nAI가 나만의 여행 루트를\n설계해 드려요.',
  },
  {
    icon: '🖼️',
    title: '감성 그림',
    desc: '여행의 분위기를 담은\n아트워크 이미지를\n자동으로 생성해요.',
  },
  {
    icon: '🔗',
    title: '부킹 연결',
    desc: '마음에 드는 코스는\n숙소·항공 예약까지\n바로 이어드려요.',
  },
];

/* ───────────────────────────── Landing ────────────────────────────── */

export default function Landing() {
  const navigate = useNavigate();
  const { gradient } = useTimeBackground();

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center"
      style={{ background: gradient }}
    >
      {/* 별 캔버스 */}
      <StarCanvas />

      {/* 콘텐츠 */}
      <div className="relative z-10 flex flex-col items-center px-6 py-16 w-full max-w-2xl mx-auto gap-10">

        {/* VOYART 로고 */}
        <div className="flex flex-col items-center gap-2">
          <h1
            className="text-7xl sm:text-8xl font-black tracking-widest select-none"
            style={{
              color: 'rgba(255,255,255,0.08)',
              WebkitTextStroke: '1.5px rgba(255,255,255,0.55)',
              textShadow: `
                0 0 30px rgba(255,255,255,0.25),
                0 0 80px rgba(255,255,255,0.12),
                0 2px 4px rgba(0,0,0,0.3)
              `,
              letterSpacing: '0.22em',
            }}
          >
            VOYART
          </h1>
          <p className="text-white/45 text-xs tracking-[0.3em] uppercase font-light">
            AI Travel Curator
          </p>
        </div>

        {/* 캐치카피 + CTA */}
        <div className="flex flex-col items-center gap-5 text-center">
          <p className="text-white/80 text-lg sm:text-xl font-light leading-relaxed tracking-wide">
            감성을 담아,<br />세상 어딘가로 떠나볼까요
          </p>
          <button
            onClick={() => navigate('/input')}
            className="
              group flex items-center gap-2
              px-7 py-3.5 rounded-full
              bg-white/12 hover:bg-white/22
              border border-white/25 hover:border-white/45
              backdrop-blur-md
              text-white/90 hover:text-white
              text-sm font-medium tracking-widest uppercase
              transition-all duration-300
              shadow-lg hover:shadow-white/10
            "
          >
            내 감성으로 여행 만들기
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </button>
        </div>

        {/* 특징 카드 3개 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          {FEATURES.map(({ icon, title, desc }) => (
            <div
              key={title}
              className="
                flex flex-col items-center gap-3
                px-5 py-6 rounded-2xl text-center
                bg-white/8 hover:bg-white/14
                border border-white/15 hover:border-white/25
                backdrop-blur-lg
                transition-all duration-300
                cursor-default
              "
            >
              <span className="text-3xl">{icon}</span>
              <span className="text-white/90 text-sm font-semibold tracking-wide">
                {title}
              </span>
              <p className="text-white/50 text-xs leading-relaxed whitespace-pre-line">
                {desc}
              </p>
            </div>
          ))}
        </div>

        {/* 하단 서명 */}
        <p className="text-white/25 text-xs tracking-widest">
          Powered by Claude · DALL·E 3
        </p>
      </div>
    </div>
  );
}
