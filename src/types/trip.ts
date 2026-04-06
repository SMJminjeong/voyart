export interface TripInput {
  mood: string;
  image?: File;
  departure: string;
  startDate: string;
  endDate: string;
  members: string;
}

export interface DayHint {
  day: number;
  hint: string;
  locked: boolean;
}

export interface RadarScores {
  감성: number;
  휴식: number;
  활동성: number;
  문화: number;
  자연: number;
  식도락: number;
}

export interface TripResult {
  destination: string;
  vibe: string;
  aiMessage: string;
  days: DayHint[];
  scores: RadarScores;
}