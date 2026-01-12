
import React, { useMemo, useState, useEffect } from 'react';
import { HabitLog, DayData } from '../types';
import { GH_COLORS, formatDate } from '../constants';

interface HeatmapProps {
  logs: HabitLog;
  totalHabits: number;
}

const Heatmap: React.FC<HeatmapProps> = ({ logs, totalHabits }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    const handleResize = () => checkMobile();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const data = useMemo(() => {
    const days: DayData[] = [];
    const today = new Date();
    const daysToShow = isMobile ? 182 : 364;
    
    for (let i = daysToShow; i >= 0; i--) {
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
  }, [logs, totalHabits, isMobile]);

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

  const gap = isMobile ? 2 : 4;
  const cellSize = isMobile ? 10 : 12;

  return (
    <div className="space-y-6 w-full">
      <div className="overflow-x-auto pb-4 scrollbar-hide w-full">
        {/* Month Labels */}
        <div className="flex mb-4 h-6">
          <div style={{ width: isMobile ? '40px' : '50px' }} />
          <div className="flex gap-px" style={{ gap: `${gap}px` }}>
            {weeks.map((week, wIdx) => {
              const matchingLabel = monthLabels.find(l => l.weekIndex === wIdx);
              return (
                <div key={`label-${wIdx}`} style={{ width: `${cellSize}px` }}>
                  {matchingLabel && (
                    <div className="text-[7px] lg:text-[9px] font-bold text-[#8b949e] uppercase tracking-widest">
                      {matchingLabel.name}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Grid */}
        <div className="flex gap-px" style={{ gap: `${gap}px` }}>
          {/* Day Labels (M/W/F) */}
          <div className="flex flex-col justify-between" style={{ width: isMobile ? '40px' : '50px' }}>
            <div className="text-[7px] text-[#30363d] font-black uppercase">M</div>
            <div className="text-[7px] text-[#30363d] font-black uppercase">W</div>
            <div className="text-[7px] text-[#30363d] font-black uppercase">F</div>
          </div>

          {/* Heatmap Cells */}
          <div className="flex gap-px" style={{ gap: `${gap}px` }}>
            {weeks.map((week, wIdx) => (
              <div key={`week-${wIdx}`} className="flex flex-col gap-px" style={{ gap: `${gap}px` }}>
                {week.map((day) => (
                  <div
                    key={day.date}
                    className="rounded transition-all hover:scale-125 hover:z-20 cursor-pointer shadow-sm relative group"
                    style={{
                      width: `${cellSize}px`,
                      height: `${cellSize}px`,
                      backgroundColor: getColor(day.level),
                      boxShadow: day.level > 2 ? `0 0 10px ${getColor(day.level)}44` : 'none',
                    }}
                  >
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#21262d] text-white text-[7px] lg:text-[9px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-30 border border-[#30363d]">
                      {day.date}: {day.count} habit(s)
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 lg:gap-3 text-[7px] lg:text-[9px] text-[#8b949e] font-bold uppercase tracking-[0.2em]">
        <span className="opacity-50">Base Flow</span>
        <div className="flex gap-px" style={{ gap: `${gap}px` }}>
          {[0, 1, 2, 3, 4].map(l => (
            <div
              key={l}
              className="rounded"
              style={{
                width: `${cellSize}px`,
                height: `${cellSize}px`,
                backgroundColor: getColor(l),
              }}
            />
          ))}
        </div>
        <span className="opacity-50">Peak Performance</span>
      </div>
    </div>
  );
};

export default Heatmap;
