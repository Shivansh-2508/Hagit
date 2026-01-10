
import React, { useMemo } from 'react';
import { HabitLog, DayData } from '../types';
import { GH_COLORS, formatDate } from '../constants';

interface HeatmapProps {
  logs: HabitLog;
  totalHabits: number;
}

const Heatmap: React.FC<HeatmapProps> = ({ logs, totalHabits }) => {
  const data = useMemo(() => {
    const days: DayData[] = [];
    const today = new Date();
    
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = formatDate(date);
      
      const dayLogs = logs[dateStr] || {};
      const completedCount = Object.values(dayLogs).filter(v => v).length;
      
      let level: 0 | 1 | 2 | 3 | 4 = 0;
      if (totalHabits > 0) {
        const percentage = completedCount / totalHabits;
        if (percentage >= 0.8) level = 4;
        else if (percentage >= 0.5) level = 3;
        else if (percentage >= 0.2) level = 2;
        else if (percentage > 0) level = 1;
      }

      days.push({ date: dateStr, count: completedCount, level });
    }
    return days;
  }, [logs, totalHabits]);

  const getColor = (level: number) => {
    switch(level) {
      case 1: return GH_COLORS.green[1];
      case 2: return GH_COLORS.green[2];
      case 3: return GH_COLORS.green[3];
      case 4: return GH_COLORS.green[4];
      default: return GH_COLORS.green[0];
    }
  };

  const weeks = useMemo(() => {
    const result = [];
    for (let i = 0; i < data.length; i += 7) {
      result.push(data.slice(i, i + 7));
    }
    return result;
  }, [data]);

  const monthLabels = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const labels: { name: string, weekIndex: number }[] = [];
    let lastMonth = -1;
    
    weeks.forEach((week, i) => {
      const d = new Date(week[0].date);
      const m = d.getMonth();
      if (m !== lastMonth) {
        labels.push({ name: months[m], weekIndex: i });
        lastMonth = m;
      }
    });
    return labels;
  }, [weeks]);

  return (
    <div className="space-y-6">
      <div className="heatmap-container overflow-x-auto pb-4 scrollbar-hide">
        <div className="min-w-max">
            <div className="flex text-[9px] text-[#8b949e] h-4 relative font-bold uppercase tracking-[0.1em]">
                {monthLabels.map((m, idx) => (
                    <span key={idx} className="absolute" style={{ left: `${m.weekIndex * 15}px` }}>{m.name}</span>
                ))}
            </div>
            <div className="flex gap-[4px] mt-2">
              <div className="flex flex-col gap-[4px] pr-4 text-[8px] text-[#30363d] justify-between h-[105px] pt-1 font-black uppercase tracking-tighter">
                <span>Mon</span>
                <span>Wed</span>
                <span>Fri</span>
              </div>
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-[4px]">
                  {week.map((day) => (
                    <div
                      key={day.date}
                      className="w-[12px] h-[12px] rounded-[3px] transition-all hover:scale-[1.4] hover:z-20 cursor-pointer shadow-sm relative group"
                      style={{ 
                        backgroundColor: getColor(day.level),
                        boxShadow: day.level > 2 ? `0 0 10px ${getColor(day.level)}44` : 'none'
                      }}
                    >
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#21262d] text-white text-[9px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-30 border border-[#30363d]">
                            {day.date}: {day.count} ritual(s)
                        </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-3 text-[9px] text-[#8b949e] font-bold uppercase tracking-[0.2em]">
        <span className="opacity-50">Base Flow</span>
        <div className="flex gap-[4px]">
          {[0, 1, 2, 3, 4].map(l => (
            <div 
                key={l} 
                className="w-[12px] h-[12px] rounded-[3px]" 
                style={{ backgroundColor: getColor(l as any) }} 
            />
          ))}
        </div>
        <span className="opacity-50">Peak Performance</span>
      </div>
    </div>
  );
};

export default Heatmap;
