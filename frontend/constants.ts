
export const GH_COLORS = {
  bg: '#0d1117',
  secondary: '#161b22',
  tertiary: '#21262d',
  border: '#30363d',
  text: '#c9d1d9',
  muted: '#8b949e',
  green: {
    0: '#161b22',
    1: '#0e4429',
    2: '#006d32',
    3: '#26a641',
    4: '#39d353',
  }
};

export const CATEGORIES = [
  'Health',
  'Productivity',
  'Mindset',
  'Learning',
  'Social',
  'Other'
];

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const getPastDates = (days: number): string[] => {
  const dates = [];
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(formatDate(d));
  }
  return dates;
};
