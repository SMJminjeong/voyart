import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTimeBackground } from '../hooks/useTimeBackground';
import { useTripGenerate } from '../hooks/useTripGenerate';
import type { TripInput } from '../types/trip';

const MOOD_TAGS = ['혼자', '감성', '가족', '휴양', '미식', '액티비티', '국내', '해외'];

function calcNights(start: string, end: string): string {
  if (!start || !end) return '';
  const diff = (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24);
  if (diff <= 0) return '';
  return `${diff}박 ${diff + 1}일`;
}

export default function Input() {
  const navigate = useNavigate();
  const { gradient } = useTimeBackground();
  const { generate, loading, error } = useTripGenerate();

  const [mood, setMood] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [departure, setDeparture] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [members, setMembers] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const nights = calcNights(startDate, endDate);
  const today = new Date().toISOString().split('T')[0];

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleImageRemove = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isValid = mood.trim().length > 0 && departure.trim().length > 0
    && startDate && endDate && members.trim().length > 0 && nights !== '';

  const handleGenerate = async () => {
    if (!isValid || loading) return;

    const fullMood = selectedTags.length > 0
      ? `${selectedTags.join(', ')} / ${mood.trim()}`
      : mood.trim();

    const input: TripInput = {
      mood: fullMood,
      image: image ?? undefined,
      departure: departure.trim(),
      startDate,
      endDate,
      members: members.trim(),
    };

    await generate(input);
    navigate('/result');
  };

  return (
    <div
      className="relative min-h-screen w-full flex flex-col items-center justify-center px-4 py-12"
      style={{ background: gradient }}
    >
      {/* 배경 노이즈 레이어 */}
      <div className="absolute inset-0 pointer-events-none opacity-20"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'200\' height=\'200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'1\'/%3E%3C/svg%3E")' }}
      />

      <div className="relative z-10 w-full max-w-lg flex flex-col gap-5">

        {/* 헤더 */}
        <div className="text-center mb-1">
          <button
            onClick={() => navigate('/')}
            className="text-white/35 text-xs tracking-[0.25em] uppercase hover:text-white/60 transition-colors"
          >
            ← VOYART
          </button>
          <h2 className="mt-3 text-white/85 text-2xl font-light tracking-widest">
            어떤 여행을 원하세요?
          </h2>
        </div>

        {/* 무드 textarea */}
        <div className="rounded-2xl bg-white/8 border border-white/15 backdrop-blur-xl overflow-hidden">
          <textarea
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            placeholder="지금 기분이나 원하는 여행 분위기를 자유롭게 써보세요&#10;예) 조용하고 예쁜 골목이 있는 유럽 도시, 혼자 사색하고 싶어"
            rows={4}
            className="
              w-full bg-transparent px-4 pt-4 pb-2
              text-white/80 placeholder-white/30
              text-sm leading-relaxed resize-none
              focus:outline-none
            "
          />
          {/* 빠른 선택 태그 */}
          <div className="flex flex-wrap gap-2 px-4 pb-4 pt-1">
            {MOOD_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`
                  px-3 py-1 rounded-full text-xs font-medium tracking-wide
                  border transition-all duration-200
                  ${selectedTags.includes(tag)
                    ? 'bg-white/25 border-white/40 text-white'
                    : 'bg-white/5 border-white/15 text-white/50 hover:bg-white/12 hover:text-white/75'
                  }
                `}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* 이미지 업로드 */}
        <div
          className="
            relative rounded-2xl border border-dashed border-white/20
            bg-white/5 backdrop-blur-xl overflow-hidden
            transition-colors hover:border-white/35 hover:bg-white/8
            cursor-pointer
          "
          onClick={() => !imagePreview && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />

          {imagePreview ? (
            <div className="flex items-center gap-3 px-4 py-3">
              <img
                src={imagePreview}
                alt="업로드된 이미지"
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-white/70 text-xs truncate">{image?.name}</p>
                <p className="text-white/35 text-xs mt-0.5">감성 분석에 활용됩니다</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleImageRemove(); }}
                className="text-white/30 hover:text-white/60 transition-colors text-lg leading-none flex-shrink-0"
              >
                ×
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 px-4 py-3.5">
              <span className="text-2xl opacity-50">📷</span>
              <div>
                <p className="text-white/50 text-xs font-medium">감성 이미지 추가 (선택)</p>
                <p className="text-white/30 text-xs mt-0.5">분위기를 담은 사진을 올려주세요</p>
              </div>
            </div>
          )}
        </div>

        {/* 여행 정보 한 줄 입력 */}
        <div className="rounded-2xl bg-white/8 border border-white/15 backdrop-blur-xl divide-y divide-white/8">

          {/* 출발지 */}
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="text-white/35 text-xs w-14 flex-shrink-0">출발지</span>
            <input
              type="text"
              value={departure}
              onChange={(e) => setDeparture(e.target.value)}
              placeholder="서울, 인천"
              className="flex-1 bg-transparent text-white/80 text-sm placeholder-white/25 focus:outline-none"
            />
          </div>

          {/* 출발일 / 귀국일 */}
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="text-white/35 text-xs w-14 flex-shrink-0">출발일</span>
            <input
              type="date"
              value={startDate}
              min={today}
              onChange={(e) => {
                setStartDate(e.target.value);
                if (endDate && e.target.value >= endDate) setEndDate('');
              }}
              className="
                flex-1 bg-transparent text-white/80 text-sm focus:outline-none
                [color-scheme:dark]
              "
            />
            <span className="text-white/20 text-xs">~</span>
            <input
              type="date"
              value={endDate}
              min={startDate || today}
              onChange={(e) => setEndDate(e.target.value)}
              className="
                flex-1 bg-transparent text-white/80 text-sm focus:outline-none
                [color-scheme:dark]
              "
            />
            {nights && (
              <span className="text-white/40 text-xs flex-shrink-0">{nights}</span>
            )}
          </div>

          {/* 인원 */}
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="text-white/35 text-xs w-14 flex-shrink-0">인원</span>
            <input
              type="text"
              value={members}
              onChange={(e) => setMembers(e.target.value)}
              placeholder="혼자, 2명, 가족 4명"
              className="flex-1 bg-transparent text-white/80 text-sm placeholder-white/25 focus:outline-none"
            />
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <p className="text-red-300/80 text-xs text-center px-2">{error}</p>
        )}

        {/* 생성 버튼 */}
        <button
          onClick={handleGenerate}
          disabled={!isValid || loading}
          className="
            w-full py-4 rounded-2xl
            bg-white/15 hover:bg-white/25
            border border-white/25 hover:border-white/40
            backdrop-blur-md
            text-white/90 hover:text-white
            text-sm font-medium tracking-widest uppercase
            transition-all duration-300
            disabled:opacity-30 disabled:cursor-not-allowed
            shadow-lg
          "
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white/80 rounded-full animate-spin" />
              여행을 만드는 중...
            </span>
          ) : (
            '✨ 나의 여행 만들기'
          )}
        </button>

      </div>
    </div>
  );
}
