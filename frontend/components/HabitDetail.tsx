
import React, { useMemo } from 'react';
import { Habit, HabitLog } from '../types';
import { formatDate, getPastDates } from '../constants';
import { 
  Flame, 
  Calendar, 
  CheckCircle2, 
  TrendingUp, 
  Clock, 
  Target,
  BarChart,
  Zap,
  Trophy,
  Star
} from 'lucide-react';

interface HabitDetailProps {
  habit: Habit;
  logs: HabitLog;
  onToggle: (id: string, date: string) => void;
}

const HabitDetail: React.FC<HabitDetailProps> = ({ habit, logs, onToggle }) => {
  const last30Days = useMemo(() => getPastDates(30).reverse(), []);
  
  const stats = useMemo(() => {
    let completedCount = 0;
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Total completed
    Object.values(logs).forEach(dayLog => {
      if (dayLog[habit.id]) completedCount++;
    });

    // Calculate current streak
    const todayStr = formatDate(new Date());
    let d = new Date();
    while (true) {
        const dateStr = formatDate(d);
        if (logs[dateStr]?.[habit.id]) {
            currentStreak++;
            d.setDate(d.getDate() - 1);
        } else {
            if (dateStr === todayStr) {
                d.setDate(d.getDate() - 1);
                continue;
            }
            break;
        }
    }

    // Longest streak
    const pastYear = getPastDates(365);
    pastYear.forEach(date => {
        if (logs[date]?.[habit.id]) {
            tempStreak++;
            longestStreak = Math.max(longestStreak, tempStreak);
        } else {
            tempStreak = 0;
        }
    });

    return { completedCount, currentStreak, longestStreak };
  }, [habit.id, logs]);

  const xpRewards = [0, 10, 25, 45, 70, 100];
  const currentReward = xpRewards[habit.difficulty] || 15;

  const chartData = useMemo(() => {
    const status = last30Days.map(date => logs[date]?.[habit.id] ? 1 : 0);
    const smoothed = status.map((val, i) => {
      const window = status.slice(Math.max(0, i - 6), i + 1);
      const sum = window.reduce((a, b) => a + b, 0);
      return (sum / window.length) * 100;
    });
    return smoothed;
  }, [habit.id, logs, last30Days]);

  const width = 800;
  const height = 200;
  const padding = 20;
  const points = chartData.map((val, i) => {
    const x = (i / (chartData.length - 1)) * (width - padding * 2) + padding;
    const y = height - ((val / 100) * (height - padding * 2) + padding);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="space-y-8 pb-12">
      <div className="premium-card p-10 bg-gradient-to-br from-[#161b22] to-[#0d1117] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
            <Zap size={140} className="text-[#39d353]" />
        </div>
        <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-[#23863622] border border-[#23863644] text-[#39d353] text-[10px] font-black uppercase tracking-widest rounded-lg">
                    {habit.category}
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 bg-[#39d35311] text-[#39d353] text-[10px] font-black uppercase tracking-widest rounded-lg border border-[#39d35333]">
                    <Star size={10} fill="currentColor" /> Level {habit.difficulty} Intensity
                </span>
                {habit.reminderTime && (
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#8b949e] uppercase tracking-widest">
                        <Clock size={12} /> {habit.reminderTime}
                    </span>
                )}
            </div>
            <h2 className="text-5xl font-black font-heading text-white tracking-tighter">{habit.name}</h2>
            <div className="flex gap-8 pt-4">
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-[#8b949e] uppercase tracking-[0.2em] mb-1">XP Yield</span>
                    <span className="text-2xl font-black text-[#39d353]">{currentReward} XP <span className="text-xs opacity-50 text-white">per completion</span></span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-[#8b949e] uppercase tracking-[0.2em] mb-1">Total Hits</span>
                    <span className="text-2xl font-black text-white">{stats.completedCount}</span>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="premium-card p-8 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 mb-4">
                <Flame size={28} className="text-orange-500 fill-orange-500" />
            </div>
            <span className="text-3xl font-black text-white font-heading">{stats.currentStreak}</span>
            <span className="text-[10px] font-bold text-[#8b949e] uppercase tracking-[0.3em] mt-1">Current Streak</span>
        </div>
        <div className="premium-card p-8 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#58a6ff]/10 flex items-center justify-center border border-[#58a6ff]/20 mb-4">
                <Trophy size={28} className="text-[#58a6ff]" />
            </div>
            <span className="text-3xl font-black text-white font-heading">{stats.longestStreak}</span>
            <span className="text-[10px] font-bold text-[#8b949e] uppercase tracking-[0.3em] mt-1">All-Time Best</span>
        </div>
        <div className="premium-card p-8 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#39d353]/10 flex items-center justify-center border border-[#39d353]/20 mb-4">
                <Zap size={28} className="text-[#39d353]" />
            </div>
            <span className="text-3xl font-black text-white font-heading">{stats.completedCount * currentReward}</span>
            <span className="text-[10px] font-bold text-[#8b949e] uppercase tracking-[0.3em] mt-1">Lifetime XP Earned</span>
        </div>
      </div>

      <section className="premium-card p-10">
        <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-[#39d353]/10 rounded-xl">
                    <TrendingUp size={18} className="text-[#39d353]" />
                </div>
                <div>
                    <h3 className="text-lg font-bold font-heading text-white">Momentum Trend</h3>
                    <p className="text-[10px] font-bold text-[#8b949e] uppercase tracking-widest">7-Day Rolling Success Rate (%)</p>
                </div>
            </div>
        </div>
        <div className="relative h-[250px] w-full">
            <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="overflow-visible">
                {[0, 25, 50, 75, 100].map(val => (
                    <g key={val}>
                        <line x1={padding} y1={height - ((val / 100) * (height - padding * 2) + padding)} x2={width - padding} y2={height - ((val / 100) * (height - padding * 2) + padding)} stroke="#30363d" strokeWidth="1" strokeDasharray="4 4" />
                        <text x="0" y={height - ((val / 100) * (height - padding * 2) + padding) + 4} fill="#484f58" fontSize="10" className="font-mono font-bold">{val}%</text>
                    </g>
                ))}
                <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#39d353" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#39d353" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path d={`M ${padding},${height - padding} L ${points} L ${width - padding},${height - padding} Z`} fill="url(#lineGradient)" />
                <polyline fill="none" stroke="#39d353" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" points={points} className="drop-shadow-[0_0_8px_rgba(57,211,83,0.5)]" />
                {chartData.map((val, i) => {
                    const x = (i / (chartData.length - 1)) * (width - padding * 2) + padding;
                    const y = height - ((val / 100) * (height - padding * 2) + padding);
                    return <circle key={i} cx={x} cy={y} r="4" fill="#0d1117" stroke="#39d353" strokeWidth="2" />;
                })}
            </svg>
        </div>
      </section>
    </div>
  );
};

export default HabitDetail;
