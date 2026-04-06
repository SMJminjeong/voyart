import { useState } from 'react';
import { generateTrip } from '../api/claude';
import { generateImage } from '../api/dalle';
import { useTripStore } from '../store/tripStore';
import type { TripInput, TripResult } from '../types/trip';

interface UseTripGenerateReturn {
  generate: (input: TripInput) => Promise<void>;
  loading: boolean;
  error: string | null;
  imageUrl: string | null;
}

export function useTripGenerate(): UseTripGenerateReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const { setTripInput, setTripResult } = useTripStore();

  const generate = async (input: TripInput) => {
    setLoading(true);
    setError(null);
    setImageUrl(null);
    setTripInput(input);

    let result: TripResult;

    try {
      result = await generateTrip(input);
      setTripResult(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : '여행 생성 중 오류가 발생했습니다.';
      setError(message);
      setLoading(false);
      return;
    }

    try {
      const url = await generateImage(result.vibe);
      setImageUrl(url);
    } catch (err) {
      // 이미지 생성 실패는 여행 결과에 영향을 주지 않으므로 경고만 출력
      console.warn('이미지 생성 실패:', err instanceof Error ? err.message : err);
    }

    setLoading(false);
  };

  return { generate, loading, error, imageUrl };
}
