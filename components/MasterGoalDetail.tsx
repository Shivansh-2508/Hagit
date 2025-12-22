
import React, { useMemo } from 'react';
import { Habit, HabitLog, UserStats } from '../types';
import { formatDate, getPastDates } from '../constants';
import { 
  TrendingUp, 
  Target, 
  Zap, 
  Trophy, 
  Activity, 
  BarChart3,
  Calendar,
  Flame,
  Award,
  Check,
  Star
} from 'lucide-react';

interface MasterGoalDetailProps {
  habits: Habit[];
  logs: HabitLog;
  stats: UserStats;
}

const MasterGoalDetail: React.FC<MasterGoalDetailProps> = ({ habits, logs, stats }) => {
  const last30Days = useMemo(() => getPastDates(30).reverse(), []);

  const performanceData = useMemo(() => {
    return last30Days.map(date => {
      const dayLogs = logs[date] || {};
      const completed = Object.values(dayLogs).filter(v => v).length;
      const total = habits.length;
      const rate = total > 0 ? (completed / total) * 100 : 0;
      return { date, rate, completed, total };
    });
  }, [habits, logs, last30Days]);

  const globalStats = useMemo(() => {
    const totalPossiblePoints = Object.keys(logs).length * habits.length;
    let totalCompleted = 0;
    Object.values(logs).forEach(dayLog => {
      totalCompleted += Object.values(dayLog).filter(v => v).length;
    });

    const averageRate = totalPossiblePoints > 0 ? Math.round((totalCompleted / totalPossiblePoints) * 100) : 0;
    
    let bestDayRate = 0;
    performanceData.forEach(d => {
        bestDayRate = Math.max(bestDayRate, d.rate);
    });

    const avgDifficulty = habits.length > 0 
        ? (habits.reduce((acc, h) => acc + h.difficulty, 0) / habits.length).toFixed(1)
        : "0.0";

    return { averageRate, totalCompleted, bestDayRate, avgDifficulty };
  }, [logs, habits, performanceData]);

  const width = 800;
  const height = 250;
  const padding = 40;
  const points = performanceData.map((val, i) => {
    const x = (i / (performanceData.length - 1)) * (width - padding * 2) + padding;
    const y = height - ((val.rate / 100) * (height - padding * 2) + padding);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="space-y-8 pb-12">
      <div className="premium-card p-10 bg-gradient-to-br from-[#1c2128] to-[#0d1117] relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-5">
            <Target size={240} className="text-[#39d353]" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#39d353]/10 flex items-center justify-center border border-[#39d353]/20">
                        <Award size={22} className="text-[#39d353]" />
                    </div>
                    <h2 className="text-4xl font-black font-heading text-white tracking-tighter">Elite Flow Performance</h2>
                </div>
                <p className="text-[#8b949e] max-w-lg leading-relaxed">
                    A panoramic view of your global consistency. Higher intensity routines yield legendary XP rewards.
                </p>
            </div>
            <div className="flex gap-12 bg-[#0d1117]/50 p-8 rounded-[24px] border border-[#30363d]">
                <div className="text-center">
                    <span className="block text-[10px] font-bold text-[#8b949e] uppercase tracking-widest mb-1">Total Flow XP</span>
                    <span className="text-3xl font-black text-white font-mono">{stats.totalXp}</span>
                </div>
                <div className="text-center">
                    <span className="block text-[10px] font-bold text-[#8b949e] uppercase tracking-widest mb-1">Intensity Lv.</span>
                    <span className="text-3xl font-black text-[#39d353] flex items-center gap-1">
                        <Star size={20} fill="currentColor" /> {globalStats.avgDifficulty}
                    </span>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="premium-card p-6 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#39d353]/10 flex items-center justify-center mb-3">
                <Activity size={24} className="text-[#39d353]" />
            </div>
            <span className="text-2xl font-black text-white">{globalStats.totalCompleted}</span>
            <span className="text-[10px] font-bold text-[#8b949e] uppercase tracking-widest mt-1">Global Hits</span>
        </div>
        <div className="premium-card p-6 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-3">
                <Zap size={24} className="text-orange-500 fill-orange-500" />
            </div>
            <span className="text-2xl font-black text-white">{Math.round(globalStats.bestDayRate)}%</span>
            <span className="text-[10px] font-bold text-[#8b949e] uppercase tracking-widest mt-1">Peak Day</span>
        </div>
        <div className="premium-card p-6 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#58a6ff]/10 flex items-center justify-center mb-3">
                <BarChart3 size={24} className="text-[#58a6ff]" />
            </div>
            <span className="text-2xl font-black text-white">{habits.length}</span>
            <span className="text-[10px] font-bold text-[#8b949e] uppercase tracking-widest mt-1">Rituals Tracked</span>
        </div>
        <div className="premium-card p-6 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-3">
                <Calendar size={24} className="text-purple-500" />
            </div>
            <span className="text-2xl font-black text-white">{Object.keys(logs).length}</span>
            <span className="text-[10px] font-bold text-[#8b949e] uppercase tracking-widest mt-1">Days Logged</span>
        </div>
      </div>

      <section className="premium-card p-10">
        <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-[#238636] to-[#39d353] rounded-2xl shadow-lg shadow-[#39d353]/20">
                    <TrendingUp size={20} className="text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-bold font-heading text-white">Global Momentum Trajectory</h3>
                    <p className="text-[11px] font-bold text-[#8b949e] uppercase tracking-[0.2em]">30-Day Aggregate Completion Density</p>
                </div>
            </div>
        </div>
        <div className="relative h-[300px] w-full">
            <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="overflow-visible">
                {[0, 25, 50, 75, 100].map(val => (
                    <g key={val}>
                        <line x1={padding} y1={height - ((val / 100) * (height - padding * 2) + padding)} x2={width - padding} y2={height - ((val / 100) * (height - padding * 2) + padding)} stroke="#30363d" strokeWidth="1" strokeDasharray="4 4" />
                        <text x="0" y={height - ((val / 100) * (height - padding * 2) + padding) + 4} fill="#484f58" fontSize="10" className="font-mono font-bold">{val}%</text>
                    </g>
                ))}
                <path d={`M ${padding},${height - padding} L ${points} L ${width - padding},${height - padding} Z`} fill="url(#masterGradient)" />
                <polyline fill="none" stroke="#39d353" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" points={points} className="drop-shadow-[0_0_12px_rgba(57,211,83,0.6)]" />
            </svg>
        </div>
      </section>
    </div>
  );
};

export default MasterGoalDetail;
