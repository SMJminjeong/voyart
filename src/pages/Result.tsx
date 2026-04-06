import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTimeBackground } from '../hooks/useTimeBackground';
import { useTripStore } from '../store/tripStore';
import RadarChart from '../components/common/RadarChart';
import FloatingChat from '../components/common/FloatingChat';
import type { DayHint } from '../types/trip';

/* ─────────────────────── 서브 컴포넌트 ─────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-white/35 text-xs tracking-[0.25em] uppercase mb-3">{children}</p>
  );
}

function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-white/8 border border-white/12 backdrop-blur-xl ${className}`}>
      {children}
    </div>
  );
}

function DayCard({ hint }: { hint: DayHint }) {
  return (
    <div
      className={`
        relative rounded-xl px-4 py-3.5 border backdrop-blur-md
        transition-all duration-200
        ${hint.locked
          ? 'bg-white/4 border-white/8'
          : 'bg-white/10 border-white/18 hover:bg-white/14'
        }
      `}
    >
      <div className="flex items-start gap-3">
        <span
          className={`
            flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center
            text-xs font-semibold mt-0.5
            ${hint.locked ? 'bg-white/8 text-white/30' : 'bg-white/18 text-white/80'}
          `}
        >
          {hint.day}
        </span>
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm leading-relaxed ${hint.locked ? 'text-white/25 blur-[3px] select-none' : 'text-white/75'}`}
          >
            {hint.locked ? '전체 코스를 보려면 잠금을 해제하세요.' : hint.hint}
          </p>
        </div>
        {hint.locked && (
          <span className="flex-shrink-0 text-white/20 text-base mt-0.5">🔒</span>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────── Result ──────────────────────────── */

export default function Result() {
  const navigate = useNavigate();
  const { gradient } = useTimeBackground();
  const { tripResult, tripInput } = useTripStore();

  // 스토어에 데이터가 없으면 Input으로 리다이렉트
  useEffect(() => {
    if (!tripResult) navigate('/input', { replace: true });
  }, [tripResult, navigate]);

  if (!tripResult) return null;

  const { destination, vibe, aiMessage, days, scores } = tripResult;

  const bookingUrl = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(destination)}`;
  const flightKeyword = `${tripInput?.departure ?? ''} ${destination} 항공권`;
  const flightUrl = `https://www.google.com/search?q=${encodeURIComponent(flightKeyword)}`;

  return (
    <div
      className="relative min-h-screen w-full"
      style={{ background: gradient }}
    >
      {/* 상단 페이드 오버레이 */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/20 to-transparent pointer-events-none z-10" />

      {/* 스크롤 컨테이너 */}
      <div className="relative z-20 max-w-lg mx-auto px-4 py-12 flex flex-col gap-7">

        {/* 뒤로가기 */}
        <button
          onClick={() => navigate('/input')}
          className="self-start text-white/35 text-xs tracking-[0.25em] uppercase hover:text-white/60 transition-colors"
        >
          ← 다시 만들기
        </button>

        {/* ── 1. 여행지 메인 카드 ── */}
        <GlassCard className="overflow-hidden">
          <div className="px-6 pt-6 pb-5">
            <p className="text-white/40 text-xs tracking-widest uppercase mb-1">Your Destination</p>
            <h1 className="text-white/92 text-3xl font-bold tracking-wide leading-tight mb-1">
              {destination}
            </h1>
            <p className="text-white/55 text-sm font-light italic mb-4">{vibe}</p>
            <p className="text-white/70 text-sm leading-relaxed">{aiMessage}</p>
          </div>

          {/* 여행 메타 정보 */}
          {tripInput && (
            <div className="flex divide-x divide-white/8 border-t border-white/8">
              {[
                { label: '출발지', value: tripInput.departure },
                { label: '기간', value: `${tripInput.startDate} ~ ${tripInput.endDate}` },
                { label: '인원', value: tripInput.members },
              ].map(({ label, value }) => (
                <div key={label} className="flex-1 px-4 py-3">
                  <p className="text-white/30 text-xs mb-0.5">{label}</p>
                  <p className="text-white/65 text-xs font-medium truncate">{value}</p>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* ── 2. AI 생성 이미지 ── */}
        <section>
          <SectionLabel>Vibe Image</SectionLabel>
          <div className="relative rounded-2xl overflow-hidden border border-white/12 bg-white/5 aspect-video">
            {/* 실제 구현 시 useTripGenerate의 imageUrl prop을 받아야 하므로
                현재는 Unsplash placeholder를 사용 */}
            <img
              src={`https://source.unsplash.com/800x450/?${encodeURIComponent(vibe)}`}
              alt={vibe}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            <p className="absolute bottom-3 right-3 text-white/40 text-xs">AI Generated</p>
          </div>
        </section>

        {/* ── 3. 감성 레이더 차트 ── */}
        <section>
          <SectionLabel>Travel Style</SectionLabel>
          <GlassCard className="flex flex-col items-center py-5">
            <RadarChart scores={scores} size={240} />
            {/* 점수 범례 */}
            <div className="grid grid-cols-3 gap-x-6 gap-y-1.5 mt-4 px-6 w-full">
              {(Object.entries(scores) as [string, number][]).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-white/40 text-xs">{key}</span>
                  <span className="text-white/65 text-xs font-medium">{val}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </section>

        {/* ── 4. Day별 힌트 카드 ── */}
        <section>
          <SectionLabel>Day by Day</SectionLabel>
          <div className="flex flex-col gap-2.5">
            {days.map((hint) => (
              <DayCard key={hint.day} hint={hint} />
            ))}
          </div>
        </section>

        {/* ── 5. 교통 + 숙박 버튼 ── */}
        <section>
          <SectionLabel>Book Your Trip</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            <a
              href={flightUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="
                flex flex-col items-center gap-2 py-5 rounded-2xl
                bg-white/8 hover:bg-white/15 border border-white/12 hover:border-white/25
                backdrop-blur-xl transition-all duration-200 group
              "
            >
              <span className="text-2xl">✈️</span>
              <span className="text-white/70 group-hover:text-white/90 text-xs font-medium tracking-wide transition-colors">
                항공권 검색
              </span>
              <span className="text-white/25 text-xs">Google Flights</span>
            </a>
            <a
              href={bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="
                flex flex-col items-center gap-2 py-5 rounded-2xl
                bg-white/8 hover:bg-white/15 border border-white/12 hover:border-white/25
                backdrop-blur-xl transition-all duration-200 group
              "
            >
              <span className="text-2xl">🏨</span>
              <span className="text-white/70 group-hover:text-white/90 text-xs font-medium tracking-wide transition-colors">
                숙소 예약
              </span>
              <span className="text-white/25 text-xs">Booking.com</span>
            </a>
          </div>
        </section>

        {/* ── 6. 하단 액션 ── */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/input')}
            className="
              flex-1 py-3.5 rounded-2xl
              bg-white/6 hover:bg-white/12 border border-white/10 hover:border-white/20
              text-white/50 hover:text-white/75 text-xs tracking-widest uppercase
              transition-all duration-200
            "
          >
            다시 생성
          </button>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: `VOYART — ${destination}`, text: aiMessage });
              }
            }}
            className="
              flex-1 py-3.5 rounded-2xl
              bg-white/10 hover:bg-white/18 border border-white/18 hover:border-white/30
              text-white/70 hover:text-white/90 text-xs tracking-widest uppercase
              transition-all duration-200
            "
          >
            공유하기 ↗
          </button>
        </div>

        <p className="text-center text-white/20 text-xs tracking-widest pb-4">
          VOYART · AI Travel Curator
        </p>
      </div>

      {/* 플로팅 채팅 */}
      <FloatingChat />
    </div>
  );
}
