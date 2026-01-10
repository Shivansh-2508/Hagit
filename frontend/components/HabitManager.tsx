
import React, { useState } from 'react';
import { Habit } from '../types';
import { CATEGORIES } from '../constants';
import { Plus, Trash2, Bell, Hash, Clock, Star } from 'lucide-react';

interface HabitManagerProps {
  habits: Habit[];
  onAdd: (name: string, category: string, difficulty: number, reminderTime?: string) => void;
  onRemove: (id: string) => void;
}

const HabitManager: React.FC<HabitManagerProps> = ({ habits, onAdd, onRemove }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [reminderTime, setReminderTime] = useState('');
  const [difficulty, setDifficulty] = useState(3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd(name.trim(), category, difficulty, reminderTime || undefined);
      setName('');
      setReminderTime('');
      setDifficulty(3);
    }
  };

  const getDifficultyLabel = (val: number) => {
    switch (val) {
      case 1: return "Easy (10 XP)";
      case 2: return "Medium (25 XP)";
      case 3: return "Hard (45 XP)";
      case 4: return "Elite (70 XP)";
      case 5: return "Legendary (100 XP)";
      default: return "";
    }
  };

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-white tracking-tight font-heading">Refine Your Flow</h3>
        <p className="text-sm text-[#8b949e]">Structure your routine for maximum growth.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-[#8b949e] uppercase tracking-[0.2em] ml-1">Habit Identification</label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#30363d] group-focus-within:text-[#39d353] transition-colors">
                <Hash size={18} />
            </div>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Deep Work Session"
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-2xl pl-12 pr-4 py-4 text-sm focus:border-[#39d353] focus:ring-4 focus:ring-[#39d35311] outline-none text-white transition-all placeholder:text-[#30363d]"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#8b949e] uppercase tracking-[0.2em] ml-1">Domain</label>
              <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-2xl px-4 py-4 text-sm focus:border-[#39d353] outline-none text-white appearance-none transition-all"
              >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#8b949e] uppercase tracking-[0.2em] ml-1">Schedule</label>
              <div className="relative">
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-2xl px-4 py-4 text-sm focus:border-[#39d353] outline-none text-white transition-all color-scheme-dark"
                />
              </div>
            </div>
        </div>

        <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-bold text-[#8b949e] uppercase tracking-[0.2em]">Intensity Scale</label>
                <span className="text-[10px] font-bold text-[#39d353] uppercase tracking-widest">{getDifficultyLabel(difficulty)}</span>
            </div>
            <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((val) => (
                    <button
                        key={val}
                        type="button"
                        onClick={() => setDifficulty(val)}
                        className={`flex-1 py-3 rounded-xl border transition-all flex flex-col items-center gap-1 ${
                            difficulty === val 
                            ? 'bg-[#39d35311] border-[#39d353] text-[#39d353]' 
                            : 'bg-[#0d1117] border-[#30363d] text-[#484f58] hover:border-[#484f58]'
                        }`}
                    >
                        <Star size={14} fill={difficulty >= val ? 'currentColor' : 'none'} />
                        <span className="text-[10px] font-black">{val}</span>
                    </button>
                ))}
            </div>
        </div>

        <button 
          type="submit" 
          disabled={!name.trim()}
          className="w-full bg-gradient-to-r from-[#2ea043] to-[#39d353] text-white py-4 rounded-2xl text-[11px] font-bold uppercase tracking-[0.3em] hover:brightness-110 active:scale-95 transition-all disabled:opacity-30 shadow-xl shadow-[#39d35322]"
        >
          Add To Routine
        </button>
      </form>

      <div className="space-y-6">
        <div className="flex items-center justify-between px-1">
            <h4 className="text-[10px] font-bold text-[#8b949e] uppercase tracking-[0.3em]">Active Routine Stack</h4>
            <span className="text-[10px] font-bold text-white bg-[#30363d] px-2 py-0.5 rounded-lg">{habits.length}</span>
        </div>
        
        <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
          {habits.map(habit => (
            <div key={habit.id} className="flex items-center justify-between p-4 bg-[#0d1117] border border-[#30363d] rounded-2xl group hover:border-[#484f58] transition-all">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 rounded-full bg-[#39d353]" />
                <div>
                    <p className="font-bold text-sm text-white">{habit.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                       <span className="text-[9px] font-bold text-[#8b949e] uppercase tracking-widest">{habit.category}</span>
                       <span className="text-[9px] font-bold text-[#39d353] flex items-center gap-0.5 uppercase tracking-widest">
                            <Star size={8} fill="currentColor" /> Lvl {habit.difficulty}
                       </span>
                    </div>
                </div>
              </div>
              <button 
                onClick={() => onRemove(habit.id)} 
                className="p-2.5 text-[#30363d] hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                title="Remove Habit"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HabitManager;
