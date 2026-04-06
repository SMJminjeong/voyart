import type { TripInput, TripResult } from '../types/trip';

const MOCK_RESULT: TripResult = {
  destination: '교토, 일본',
  vibe: '고즈넉한 전통의 향기',
  aiMessage:
    '천 년의 시간이 멈춘 듯한 골목길, 황금빛 사원, 그리고 봄바람에 흩날리는 벚꽃잎. 당신의 감성과 꼭 닮은 도시, 교토로 떠나보세요.',
  days: [
    { day: 1, hint: '아라시야마 대나무 숲에서 이른 아침의 고요함을 느껴보세요.', locked: false },
    { day: 2, hint: '후시미이나리 신사의 수천 개 도리이 아래를 천천히 걸어보세요.', locked: false },
    { day: 3, hint: '기온 거리를 거닐며 마이코의 발걸음을 따라가 보세요.', locked: true },
    { day: 4, hint: '니시키 시장에서 교토 현지 식문화를 탐험해보세요.', locked: false },
  ],
  scores: {
    감성: 90,
    휴식: 70,
    활동성: 55,
    문화: 95,
    자연: 75,
    식도락: 80,
  },
};

function buildPrompt(input: TripInput): string {
  const start = new Date(input.startDate);
  const end = new Date(input.endDate);
  const nights = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const days = nights + 1;

  return `당신은 여행 큐레이터입니다. 사용자의 감성과 여행 조건에 맞는 최적의 여행지를 추천해주세요.

여행 조건:
- 출발지: ${input.departure}
- 여행 기간: ${input.startDate} ~ ${input.endDate} (${days}일간)
- 여행 인원: ${input.members}
- 현재 감성/무드: ${input.mood}

아래 JSON 형식으로만 응답하세요. 다른 텍스트는 절대 포함하지 마세요.

{
  "destination": "추천 여행지 (도시, 국가)",
  "vibe": "이 여행의 감성 키워드 (한 줄)",
  "aiMessage": "여행지를 추천하는 감성적인 메시지 (2~3문장)",
  "days": [
    { "day": 1, "hint": "1일차 여행 힌트", "locked": false },
    ...총 ${days}일치
  ],
  "scores": {
    "감성": 0~100,
    "휴식": 0~100,
    "활동성": 0~100,
    "문화": 0~100,
    "자연": 0~100,
    "식도락": 0~100
  }
}`;
}

function parseResponse(text: string): TripResult {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('API 응답에서 JSON을 찾을 수 없습니다.');
  }
  return JSON.parse(jsonMatch[0]) as TripResult;
}

export async function generateTrip(input: TripInput): Promise<TripResult> {
  if (import.meta.env.DEV) {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    return MOCK_RESULT;
  }

  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string;
  if (!apiKey) {
    throw new Error('VITE_ANTHROPIC_API_KEY 환경 변수가 설정되지 않았습니다.');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: buildPrompt(input),
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      `Anthropic API 오류 (${response.status}): ${(error as { error?: { message?: string } }).error?.message ?? response.statusText}`,
    );
  }

  const data = (await response.json()) as {
    content: Array<{ type: string; text: string }>;
  };

  const textBlock = data.content.find((block) => block.type === 'text');
  if (!textBlock) {
    throw new Error('API 응답에 텍스트 블록이 없습니다.');
  }

  return parseResponse(textBlock.text);
}
