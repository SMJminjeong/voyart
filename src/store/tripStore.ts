import { create } from 'zustand';
import type { TripInput, TripResult } from '../types/trip';

interface TripStore {
  tripInput: TripInput | null;
  tripResult: TripResult | null;
  setTripInput: (input: TripInput) => void;
  setTripResult: (result: TripResult) => void;
  reset: () => void;
}

export const useTripStore = create<TripStore>((set) => ({
  tripInput: null,
  tripResult: null,
  setTripInput: (input) => set({ tripInput: input }),
  setTripResult: (result) => set({ tripResult: result }),
  reset: () => set({ tripInput: null, tripResult: null }),
}));