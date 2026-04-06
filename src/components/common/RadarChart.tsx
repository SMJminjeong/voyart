import type { RadarScores } from '../../types/trip';

interface RadarChartProps {
  scores: RadarScores;
  size?: number;
}

const CATEGORIES: (keyof RadarScores)[] = ['감성', '휴식', '활동성', '문화', '자연', '식도락'];
const LEVELS = [20, 40, 60, 80, 100];

function toRadians(deg: number) {
  return (deg * Math.PI) / 180;
}

// 정육각형: 꼭짓점이 위를 향하도록 -90도 오프셋
function getPoint(angle: number, radius: number, cx: number, cy: number) {
  const rad = toRadians(angle - 90);
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
}

function pointsToPolygon(points: { x: number; y: number }[]) {
  return points.map((p) => `${p.x},${p.y}`).join(' ');
}

export default function RadarChart({ scores, size = 260 }: RadarChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = size * 0.36;
  const labelRadius = size * 0.47;
  const angleStep = 360 / CATEGORIES.length;

  // 그리드 레벨별 육각형 꼭짓점
  const gridPolygons = LEVELS.map((level) => {
    const r = (level / 100) * maxRadius;
    const pts = CATEGORIES.map((_, i) => getPoint(i * angleStep, r, cx, cy));
    return pointsToPolygon(pts);
  });

  // 축선 (중심 → 각 꼭짓점)
  const axes = CATEGORIES.map((_, i) => {
    const outer = getPoint(i * angleStep, maxRadius, cx, cy);
    return { x1: cx, y1: cy, x2: outer.x, y2: outer.y };
  });

  // 데이터 폴리곤
  const dataPoints = CATEGORIES.map((key, i) => {
    const r = (scores[key] / 100) * maxRadius;
    return getPoint(i * angleStep, r, cx, cy);
  });

  // 레이블 위치
  const labels = CATEGORIES.map((key, i) => {
    const pt = getPoint(i * angleStep, labelRadius, cx, cy);
    return { key, x: pt.x, y: pt.y };
  });

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-label="여행 스타일 레이더 차트"
    >
      {/* 그리드 육각형 */}
      {gridPolygons.map((pts, i) => (
        <polygon
          key={i}
          points={pts}
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={1}
        />
      ))}

      {/* 축선 */}
      {axes.map((axis, i) => (
        <line
          key={i}
          x1={axis.x1}
          y1={axis.y1}
          x2={axis.x2}
          y2={axis.y2}
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={1}
        />
      ))}

      {/* 데이터 폴리곤 (채우기) */}
      <polygon
        points={pointsToPolygon(dataPoints)}
        fill="rgba(255,255,255,0.15)"
        stroke="rgba(255,255,255,0.7)"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />

      {/* 데이터 꼭짓점 점 */}
      {dataPoints.map((pt, i) => (
        <circle
          key={i}
          cx={pt.x}
          cy={pt.y}
          r={3}
          fill="white"
          opacity={0.85}
        />
      ))}

      {/* 레이블 */}
      {labels.map(({ key, x, y }) => (
        <text
          key={key}
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={10.5}
          fontWeight="500"
          fill="rgba(255,255,255,0.9)"
        >
          {key}
        </text>
      ))}
    </svg>
  );
}
