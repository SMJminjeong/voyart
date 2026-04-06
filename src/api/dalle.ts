const VIBE_KEYWORD_MAP: Record<string, string> = {
  전통: 'traditional temple',
  고즈넉: 'peaceful ancient',
  감성: 'aesthetic mood',
  자연: 'nature landscape',
  바다: 'ocean beach',
  산: 'mountain scenery',
  도시: 'city skyline',
  야경: 'night city lights',
  숲: 'forest woods',
  꽃: 'flowers bloom',
  봄: 'spring cherry blossom',
  여름: 'summer tropical',
  가을: 'autumn foliage',
  겨울: 'winter snow',
  카페: 'cozy cafe',
  음식: 'food cuisine',
  문화: 'cultural heritage',
  휴식: 'relaxing resort',
  모험: 'adventure travel',
  낭만: 'romantic scenery',
  사막: 'desert dunes',
  유럽: 'europe architecture',
  일본: 'japan landscape',
  동남아: 'southeast asia tropical',
};

function vibeToKeywords(vibe: string): string {
  const matched: string[] = [];

  for (const [korean, english] of Object.entries(VIBE_KEYWORD_MAP)) {
    if (vibe.includes(korean)) {
      matched.push(english);
    }
  }

  return matched.length > 0 ? matched.slice(0, 3).join(',') : 'travel destination scenic';
}

export async function generateImage(vibe: string): Promise<string> {
  const keywords = vibeToKeywords(vibe);

  if (import.meta.env.DEV) {
    const encoded = encodeURIComponent(keywords);
    return `https://source.unsplash.com/800x600/?${encoded}`;
  }

  const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string;
  if (!apiKey) {
    throw new Error('VITE_OPENAI_API_KEY 환경 변수가 설정되지 않았습니다.');
  }

  const prompt = `A breathtaking travel destination photo representing the vibe: "${vibe}".
Cinematic, high quality photography, golden hour lighting, no text or watermarks.`;

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      `OpenAI API 오류 (${response.status}): ${(error as { error?: { message?: string } }).error?.message ?? response.statusText}`,
    );
  }

  const data = (await response.json()) as {
    data: Array<{ url: string }>;
  };

  const url = data.data[0]?.url;
  if (!url) {
    throw new Error('이미지 URL을 가져오지 못했습니다.');
  }

  return url;
}
