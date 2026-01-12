
import React from 'react';
import { Habit, HabitLog } from '../types';
import { CheckCircle2, Circle } from 'lucide-react';
import { formatDate } from '../constants';

interface DailyChecklistProps {
  habits: Habit[];
  logs: HabitLog;
  onToggle: (habitId: string, date: string) => void;
  selectedDate: string;
}

const getDifficultyColor = (difficulty: number) => {
  switch (difficulty) {
    case 1: return '#39d353'; // Green - Easy
    case 2: return '#58a6ff'; // Blue - Medium
    case 3: return '#d29922'; // Orange - Hard
    case 4: return '#f85149'; // Red - Elite
    case 5: return '#dd00ff'; // Purple - Legendary
    default: return '#39d353';
  }
};

const DailyChecklist: React.FC<DailyChecklistProps> = ({ habits, logs, onToggle, selectedDate }) => {
  const currentLogs = logs[selectedDate] || {};
  
  const completedCount = habits.filter(h => currentLogs[h.id]).length;
  const progress = habits.length > 0 ? (completedCount / habits.length) * 100 : 0;

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden shadow-lg">
      <div className="p-6 border-b border-[#30363d] bg-gradient-to-r from-[#161b22] to-[#1c2128]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#c9d1d9]">Focus List</h3>
            <p className="text-[10px] text-[#8b949e] uppercase tracking-widest font-bold">Daily Progress</p>
          </div>
          <div className="text-right">
             <span className="text-xl font-bold text-[#c9d1d9]">{completedCount}<span className="text-[#8b949e] font-normal text-sm">/{habits.length}</span></span>
          </div>
        </div>
        <div className="w-full bg-[#30363d] h-2 rounded-full overflow-hidden">
          <div 
            className="bg-gradient-to-r from-[#238636] to-[#39d353] h-full transition-all duration-700 ease-out" 
            style={{ width: `${progress}%` }} 
          />
        </div>
      </div>
      
      <div className="bg-[#0d1117]">
        {habits.map((habit, index) => {
          const isDone = currentLogs[habit.id];
          const diffColor = getDifficultyColor(habit.difficulty);
          return (
            <button
              key={habit.id}
              onClick={() => onToggle(habit.id, selectedDate)}
              className={`w-full flex items-center justify-between p-4 text-left border-b last:border-0 hover:bg-[#161b22] transition-all group ${isDone ? 'opacity-70' : ''}`}
              style={{borderColor: isDone ? 'rgb(48, 54, 61)' : diffColor + '33'}}
            >
              <div className="flex items-center gap-4">
                <div className={`transition-all transform ${isDone ? 'scale-110' : 'text-[#8b949e] group-hover:text-[#c9d1d9]'}`} style={{color: isDone ? diffColor : 'inherit'}}>
                  {isDone ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                </div>
                <div>
                  <span className={`text-sm font-semibold transition-all ${isDone ? 'line-through text-[#8b949e]' : 'text-[#c9d1d9]'}`}>
                    {habit.name}
                  </span>
                  <p className="text-[10px] text-[#8b949e]">{habit.category}</p>
                </div>
              </div>
              <div className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors`} style={{
                backgroundColor: isDone ? diffColor + '22' : '#161b22',
                color: isDone ? diffColor : '#8b949e',
                borderColor: isDone ? diffColor + '44' : '#30363d'
              }}>
                {isDone ? 'COMPLETED' : 'PENDING'}
              </div>
            </button>
          );
        })}
        {habits.length === 0 && (
          <div className="p-12 text-center space-y-2">
            <p className="text-sm text-[#8b949e]">Your checklist is empty.</p>
            <p className="text-xs text-[#58a6ff]">Add your first habit to start tracking progress.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyChecklist;
