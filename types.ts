
export interface Habit {
  id: string;
  name: string;
  category: string;
  createdAt: number;
  color: 'green' | 'blue' | 'purple' | 'orange';
  reminderTime?: string; // HH:mm format
  difficulty: number; // 1 to 5 scale
}

export interface HabitLog {
  [date: string]: {
    [habitId: string]: boolean;
  };
}

export interface UserStats {
  streakFreezes: number;
  totalXp: number;
}

export interface DayData {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface AIInsight {
  analysis: string;
  suggestions: string[];
  motivationalQuote: string;
}
