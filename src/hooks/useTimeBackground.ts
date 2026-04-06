import { useState, useEffect } from 'react';

export type TimeOfDay = 'dawn' | 'morning' | 'afternoon' | 'sunset' | 'night';

export interface TimeBackground {
  timeOfDay: TimeOfDay;
  gradient: string;
}

const GRADIENTS: Record<TimeOfDay, string> = {
  dawn:      'linear-gradient(to bottom, #1a1a2e 0%, #e07b54 50%, #f5c27a 100%)',
  morning:   'linear-gradient(to bottom, #87ceeb 0%, #b8e4f9 60%, #e8f4fd 100%)',
  afternoon: 'linear-gradient(to bottom, #2980b9 0%, #6dd5fa 60%, #ffffff 100%)',
  sunset:    'linear-gradient(to bottom, #0f2027 0%, #e96c4c 40%, #f9a86c 100%)',
  night:     'linear-gradient(to bottom, #0a0a1a 0%, #1a1a3e 50%, #2d2d6b 100%)',
};

function getTimeOfDay(hour: number): TimeOfDay {
  if (hour >= 5 && hour < 8)   return 'dawn';
  if (hour >= 8 && hour < 12)  return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 20) return 'sunset';
  return 'night';
}

function getBackground(): TimeBackground {
  const hour = new Date().getHours();
  const timeOfDay = getTimeOfDay(hour);
  return { timeOfDay, gradient: GRADIENTS[timeOfDay] };
}

export function useTimeBackground(): TimeBackground {
  const [background, setBackground] = useState<TimeBackground>(getBackground);

  useEffect(() => {
    const interval = setInterval(() => {
      setBackground(getBackground());
    }, 60_000);

    return () => clearInterval(interval);
  }, []);

  return background;
}
