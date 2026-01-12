
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Habit, HabitLog, AIInsight, UserStats } from './types';
import { formatDate, getPastDates } from './constants';
import { getHabitInsights } from './services/geminiService';
import { getUserData, updateAllUserData } from './services/dbService';
import { useAuth } from './components/context/AuthContext';
import AuthPage from './components/AuthPage';
import Heatmap from './components/Heatmap';
import HabitManager from './components/HabitManager';
import HabitDetail from './components/HabitDetail';
import MasterGoalDetail from './components/MasterGoalDetail';
import { 
  BarChart3, 
  Sparkles,
  Flame,
  Plus,
  Check,
  Zap,
  LayoutGrid,
  Loader2,
  X,
  Trophy,
  Calendar,
  ChevronRight,
  TrendingUp,
  Target,
  ArrowLeft,
  LogOut
} from 'lucide-react';

const App: React.FC = () => {
  const { user, token, logout, loading: authLoading } = useAuth();

  // If not authenticated, show login page
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] flex items-center justify-center">
        <div className="text-center">
          <div className="bg-[#39d353] w-16 h-16 rounded-3xl flex items-center justify-center shadow-lg shadow-[#39d353]/30 mx-auto mb-4 animate-pulse">
            <Zap className="text-white fill-white" size={32} strokeWidth={2.5} />
          </div>
          <p className="text-sm font-bold text-[#8b949e] uppercase tracking-widest">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !token) {
    return <AuthPage />;
  }

  return <HabitFlowApp />;
};

const HabitFlowApp: React.FC = () => {
  const { user, logout } = useAuth();
  
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog>({});
  const [stats, setStats] = useState<UserStats>({ streakFreezes: 0, totalXp: 0 });
  const [dataLoaded, setDataLoaded] = useState(false);

  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [showHabitManager, setShowHabitManager] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [popId, setPopId] = useState<string | null>(null);
  
  // Navigation State
  const [activeView, setActiveView] = useState<'dashboard' | 'detail' | 'master'>('dashboard');
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);

  // Load user data from database on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await getUserData();
        if (userData) {
          setHabits(userData.habits || []);
          setLogs(userData.logs || {});
          setStats(userData.stats || { streakFreezes: 0, totalXp: 0 });
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setDataLoaded(true);
      }
    };
    loadUserData();
  }, []); // Load once on mount


  
  // Keep backend alive (prevent Render free tier sleep)
  useEffect(() => {
    const wakeUpInterval = setInterval(async () => {
      try {
        // Ping your backend health endpoint
        const apiUrl = process.env.REACT_APP_API_URL || 'https://hagit.onrender.com';
        console.log('Backend wakeup call from:', apiUrl);
        const response = await fetch(`${apiUrl}/`, { method: 'GET' });
        const data = await response.json();
        console.log('Backend wakeup call:', data);
      } catch (err) {
        console.error('Failed to ping backend:', err);
      }
    }, 4 * 60 * 10); // Ping every 4 minutes to stay under 15-minute threshold

    return () => clearInterval(wakeUpInterval);
  }, []);

  // Save data to database when it changes (debounced)
  useEffect(() => {
    if (!dataLoaded) return; // Don't save until initial load is complete
    
    const saveTimer = setTimeout(async () => {
      try {
        await updateAllUserData(habits, logs, stats);
      } catch (error) {
        console.error('Failed to save user data:', error);
      }
    }, 500); // Debounce saves by 500ms
    
    return () => clearTimeout(saveTimer);
  }, [habits, logs, stats, dataLoaded]);

  const weekDates = useMemo(() => {
    const dates = [];
    for (let i = 0; i <= 6; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(formatDate(d));
    }
    return dates;
  }, []);

  const calculateXpReward = (difficulty: number) => {
    // 1=10, 2=25, 3=45, 4=70, 5=100
    const rewards = [0, 10, 25, 45, 70, 100];
    return rewards[difficulty] || 15;
  };

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

  const toggleHabit = (habitId: string, date: string) => {
    const habit = habits.find(h => h.id === habitId);
    const isNowDone = !logs[date]?.[habitId];
    
    if (isNowDone && habit) {
      setPopId(`${habitId}-${date}`);
      setTimeout(() => setPopId(null), 400);
      const xpReward = calculateXpReward(habit.difficulty);
      setStats(prev => ({ ...prev, totalXp: prev.totalXp + xpReward }));
    } else if (!isNowDone && habit) {
      const xpReward = calculateXpReward(habit.difficulty);
      setStats(prev => ({ ...prev, totalXp: Math.max(0, prev.totalXp - xpReward) }));
    }
    
    setLogs(prev => {
      const dayLogs = { ...(prev[date] || {}) };
      dayLogs[habitId] = !dayLogs[habitId];
      return { ...prev, [date]: dayLogs };
    });
  };

  const removeHabit = useCallback((id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
    if (selectedHabitId === id) {
        setActiveView('dashboard');
        setSelectedHabitId(null);
    }
  }, [selectedHabitId]);

  const editHabit = useCallback((id: string, name: string, category: string, difficulty: number, reminderTime?: string) => {
    setHabits(prev => prev.map(h => 
      h.id === id 
        ? { ...h, name, category, difficulty, reminderTime: reminderTime || h.reminderTime }
        : h
    ));
    setEditingHabit(null);
    setShowHabitManager(false);
  }, []);

  const calculateStreak = useCallback(() => {
    let streak = 0;
    const pastDates = getPastDates(365);
    for (const date of pastDates) {
      const dayLogs = logs[date] || {};
      const completed = Object.values(dayLogs).filter(v => v).length;
      if (completed > 0) {
        streak++;
      } else if (date !== formatDate(new Date())) {
        break;
      }
    }
    return streak;
  }, [logs]);

  const currentStreak = calculateStreak();
  const todayDate = formatDate(new Date());
  const completedToday = Object.values(logs[todayDate] || {}).filter(v => v).length;
  const todayProgress = habits.length ? Math.round((completedToday / habits.length) * 100) : 0;
  
  const xpPerLevel = 250;
  const flowLevel = Math.floor(stats.totalXp / xpPerLevel) + 1;
  const currentLevelXp = stats.totalXp % xpPerLevel;
  const levelProgress = (currentLevelXp / xpPerLevel) * 100;

  const handleHabitClick = (id: string) => {
      setSelectedHabitId(id);
      setActiveView('detail');
  };

  const selectedHabit = habits.find(h => h.id === selectedHabitId);

  // Show loading screen while data is being fetched
  if (!dataLoaded) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] flex items-center justify-center">
        <div className="text-center">
          <div className="bg-[#39d353] w-16 h-16 rounded-3xl flex items-center justify-center shadow-lg shadow-[#39d353]/30 mx-auto mb-4 animate-pulse">
            <Zap className="text-white fill-white" size={32} strokeWidth={2.5} />
          </div>
          <p className="text-sm font-bold text-[#8b949e] uppercase tracking-widest">Loading Your Habits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] pb-20 lg:pb-32">
      {/* Premium Navbar */}
      <header className="glass-nav sticky top-0 px-3 lg:px-6 py-3 lg:py-4 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 lg:gap-4 cursor-pointer flex-1 min-w-0" onClick={() => setActiveView('dashboard')}>
            <div className="bg-[#39d353] w-8 lg:w-10 h-8 lg:h-10 rounded-2xl flex items-center justify-center shadow-lg shadow-[#39d353]/30 flex-shrink-0">
              <Zap className="text-white fill-white lg:w-[22px] lg:h-[22px]" size={18} strokeWidth={2.5} />
            </div>
            <div className="hidden sm:block min-w-0">
                <span className="text-base lg:text-xl font-bold font-heading text-white tracking-tight uppercase italic leading-none block truncate">HabitFlow</span>
                <div className="flex items-center gap-1 lg:gap-2 mt-1 hidden lg:flex">
                    <div className="w-16 lg:w-20 h-1 bg-[#21262d] rounded-full overflow-hidden">
                        <div className="h-full bg-[#39d353]" style={{ width: `${levelProgress}%` }} />
                    </div>
                    <span className="text-[8px] lg:text-[9px] font-bold text-[#8b949e] uppercase tracking-widest whitespace-nowrap">Level {flowLevel}</span>
                </div>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
            <div className="hidden sm:flex items-center gap-2 bg-[#21262d]/50 border border-[#30363d] px-3 lg:px-4 py-1.5 lg:py-2 rounded-2xl">
              <Flame size={16} className="text-orange-500 fill-orange-500 flex-shrink-0" />
              <span className="text-xs lg:text-sm font-bold font-heading text-white whitespace-nowrap">{currentStreak}d</span>
            </div>
            
            <button 
                onClick={async () => { setLoadingAI(true); setInsight(await getHabitInsights(habits, logs)); setLoadingAI(false); }}
                className="w-8 lg:w-10 h-8 lg:h-10 flex items-center justify-center hover:bg-[#21262d] rounded-2xl border border-[#30363d] text-[#8b949e] hover:text-[#39d353] transition-all flex-shrink-0"
                title="AI Coach"
            >
              {loadingAI ? <Loader2 size={16} className="animate-spin lg:w-[18px] lg:h-[18px]" /> : <Sparkles size={16} className="lg:w-[18px] lg:h-[18px]" />}
            </button>
            
            <div className="flex items-center gap-2 px-3 lg:px-4 py-1.5 lg:py-2 rounded-2xl bg-[#21262d]/30 border border-[#30363d]/50">
              <div className="w-5 lg:w-6 h-5 lg:h-6 rounded-lg bg-gradient-to-br from-[#238636] to-[#39d353] border border-white/10 flex-shrink-0" />
              <span className="text-[10px] lg:text-xs font-bold text-white whitespace-nowrap truncate max-w-[80px] sm:max-w-[100px] lg:max-w-none">{user?.name || user?.email}</span>
            </div>
            
            <button 
                onClick={logout}
                className="w-8 lg:w-10 h-8 lg:h-10 flex items-center justify-center hover:bg-red-500/10 rounded-2xl border border-[#30363d] text-[#8b949e] hover:text-red-400 hover:border-red-500/30 transition-all flex-shrink-0"
                title="Logout"
            >
              <LogOut size={16} className="lg:w-[18px] lg:h-[18px]" />
            </button>
          </div>
        </div>
      </header>

      {activeView === 'dashboard' ? (
        <main className="max-w-6xl mx-auto px-6 mt-12 space-y-6 lg:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Dashboard Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6">
            <div 
              className="lg:col-span-2 premium-card p-4 lg:p-8 relative overflow-hidden group cursor-pointer hover:border-[#39d353]/50"
              onClick={() => setActiveView('master')}
            >
               <div 
                 className="absolute -right-20 -top-20 w-64 h-64 rounded-full blur-[100px] transition-all duration-1000 opacity-20"
                 style={{ backgroundColor: todayProgress > 0 ? '#39d353' : '#30363d' }}
               />
               <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className="space-y-1 lg:space-y-2">
                      <div className="flex items-center gap-1 lg:gap-2 text-[#39d353]">
                          <Target size={14} className="lg:w-[18px] lg:h-[18px]" />
                          <h3 className="text-[8px] lg:text-[10px] font-bold uppercase tracking-[0.3em]">Master Goal</h3>
                      </div>
                      <h2 className="text-lg lg:text-3xl font-bold font-heading text-white group-hover:text-[#39d353] transition-colors line-clamp-2">Focus. Momentum. Growth.</h2>
                      <p className="text-[10px] lg:text-sm text-[#8b949e] leading-relaxed hidden lg:block">You've completed <span className="text-white font-bold">{completedToday} of {habits.length}</span> daily rituals.</p>
                  </div>
                  <div className="mt-4 lg:mt-10">
                      <div className="flex items-end justify-between mb-2 lg:mb-3">
                          <span className="text-2xl lg:text-4xl font-black font-heading text-white">{todayProgress}<span className="text-sm lg:text-lg opacity-50 ml-1">%</span></span>
                          <span className="text-[8px] lg:text-[10px] font-bold text-[#39d353] uppercase tracking-widest flex items-center gap-0.5 lg:gap-1 hidden lg:flex">View Deep Analytics <ChevronRight size={12}/></span>
                      </div>
                      <div className="w-full min-w-0 bg-[#21262d] h-2 lg:h-3 rounded-2xl p-[3px] border border-[#30363d]">
                          <div 
                            className="h-full rounded-full bg-gradient-to-r from-[#238636] to-[#39d353] transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(57,211,83,0.4)]" 
                            style={{ width: `${todayProgress}%` }}
                          />
                      </div>
                  </div>
               </div>
            </div>
            <div className="premium-card p-4 lg:p-8 flex flex-col items-center justify-center text-center">
               <div className="relative w-16 lg:w-24 h-16 lg:h-24 bg-orange-500/10 rounded-3xl flex items-center justify-center mb-3 lg:mb-6 border border-orange-500/20">
                  <Flame size={28} className="lg:w-[48px] lg:h-[48px] text-[#ff9600] fill-[#ff9600] animate-pulse" />
               </div>
               <span className="text-3xl lg:text-6xl font-black font-heading text-white tracking-tighter">{currentStreak}</span>
               <span className="text-[9px] lg:text-[11px] font-bold uppercase tracking-[0.4em] text-[#8b949e] mt-2 lg:mt-4">Current Streak</span>
            </div>
          </div>

          {/* Routine Table */}
          <section className="premium-card overflow-hidden">
            <div className="p-6 lg:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#30363d]/50 bg-[#1c2128]/30">
              <h3 className="text-lg lg:text-xl font-bold font-heading text-white flex items-center gap-3">
                <Calendar size={18} className="text-[#58a6ff]" /> <span className="hidden sm:inline">The Routine</span><span className="sm:hidden">Routine</span>
              </h3>
              <button onClick={() => setShowHabitManager(true)} className="w-full sm:w-auto bg-white text-black px-6 py-2.5 rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-[#c9d1d9] transition-all flex items-center justify-center gap-2">
                  <Plus size={16} strokeWidth={3} /> <span className="hidden sm:inline">Manage Routine</span><span className="sm:hidden">Add</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-fit">
                <thead>
                  <tr className="bg-[#0d1117]/50">
                    <th className="p-4 lg:p-8 text-[10px] lg:text-[11px] font-bold text-[#8b949e] uppercase tracking-[0.2em]">Habit</th>
                    {weekDates.map((date, idx) => {
                      const isToday = date === formatDate(new Date());
                      return (
                      <th key={date} className={`p-2 lg:p-4 text-center ${idx === 0 ? 'border-l border-[#39d353]/30' : ''}`}>
                        <div className={`flex flex-col items-center text-[9px] lg:text-[10px] font-bold uppercase tracking-widest ${isToday ? 'text-[#39d353] bg-[#39d353]/10 rounded px-2 py-1' : 'text-[#8b949e]'}`}>
                          <span>{new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                          <span className="text-[8px] lg:text-[9px] mt-0.5 opacity-75">{new Date(date).getDate()}</span>
                        </div>
                      </th>
                    );})}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#30363d]/50">
                  {habits.map(habit => (
                    <tr key={habit.id} className="hover:bg-[#1c2128]/50 transition-colors group">
                      <td className="p-4 lg:p-8 cursor-pointer" onClick={() => handleHabitClick(habit.id)}>
                        <div className="flex items-center gap-2 lg:gap-4">
                          <div className="w-1.5 h-6 lg:h-8 rounded-full" style={{backgroundColor: getDifficultyColor(habit.difficulty)}} />
                          <div className="min-w-0">
                              <span className="text-sm lg:text-base font-bold text-white tracking-tight block hover:text-[#39d353] transition-colors truncate">{habit.name}</span>
                              <div className="flex items-center gap-1 lg:gap-2 mt-1 flex-wrap">
                                <span className="text-[8px] lg:text-[9px] font-bold text-[#8b949e] uppercase tracking-widest whitespace-nowrap">{habit.category}</span>
                                <span className="text-[8px] lg:text-[9px] font-bold uppercase whitespace-nowrap" style={{color: getDifficultyColor(habit.difficulty)}}>Lv{habit.difficulty}</span>
                              </div>
                          </div>
                        </div>
                      </td>
                      {weekDates.map((date, idx) => {
                        const isDone = logs[date]?.[habit.id];
                        return (
                          <td key={`${habit.id}-${date}`} className={`p-2 lg:p-4 text-center ${idx === 0 ? 'border-l border-[#39d353]/20' : ''}`}>
                            <button onClick={() => toggleHabit(habit.id, date)} className={`check-circle mx-auto ${isDone ? 'checked' : 'unchecked'} ${popId === `${habit.id}-${date}` ? 'animate-spring' : ''}`}>
                              <Check size={20} strokeWidth={3.5} />
                            </button>
                          </td>
                        );
                      })}
                      {/* <td className="p-2 lg:p-4 text-center">
                        <button 
                          onClick={() => {
                            setEditingHabit(habit);
                            setShowHabitManager(true);
                          }}
                          className="px-2 lg:px-3 py-1 lg:py-1.5 text-[8px] lg:text-[9px] font-bold uppercase tracking-widest text-[#39d353] hover:bg-[#39d353]/10 border border-[#39d353]/30 rounded-lg transition-all"
                          title="Edit Habit"
                        >
                          Edit
                        </button>
                      </td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="premium-card p-4 lg:p-10 w-full">
              <div className="w-full overflow-hidden">
                <Heatmap logs={logs} totalHabits={habits.length} />
              </div>
          </section>
        </main>
      ) : activeView === 'detail' ? (
        <main className="max-w-6xl mx-auto px-6 mt-12 animate-in fade-in slide-in-from-right-4 duration-500">
           <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8">
             <div className="flex items-center gap-4 flex-1">
               <button 
                 onClick={() => setActiveView('dashboard')}
                 className="p-3 bg-[#21262d] border border-[#30363d] rounded-2xl text-[#8b949e] hover:text-white transition-all flex-shrink-0"
               >
                 <ArrowLeft size={20} />
               </button>
               <div className="min-w-0">
                  <span className="text-[10px] font-bold text-[#39d353] uppercase tracking-[0.4em] block">Analytics Engine</span>
                  <h1 className="text-2xl lg:text-3xl font-bold font-heading text-white tracking-tight truncate">Performance Breakdown</h1>
               </div>
             </div>
             <button
               onClick={() => {
                 setEditingHabit(selectedHabit);
                 setShowHabitManager(true);
               }}
               className="w-full lg:w-auto px-4 py-2.5 bg-gradient-to-r from-[#2ea043] to-[#39d353] text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[#39d35322]"
               title="Edit Habit"
             >
               Edit Habit
             </button>
           </div>

           {selectedHabit && (
             <HabitDetail habit={selectedHabit} logs={logs} onToggle={toggleHabit} />
           )}
        </main>
      ) : (
        <main className="max-w-6xl mx-auto px-6 mt-12 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="flex items-center gap-4 mb-8">
            <button 
              onClick={() => setActiveView('dashboard')}
              className="p-3 bg-[#21262d] border border-[#30363d] rounded-2xl text-[#8b949e] hover:text-white transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <span className="text-[10px] font-bold text-[#39d353] uppercase tracking-[0.4em]">Global Operations</span>
              <h1 className="text-3xl font-bold font-heading text-white tracking-tight">Master Momentum</h1>
            </div>
          </div>
          <MasterGoalDetail habits={habits} logs={logs} stats={stats} />
        </main>
      )}

      {/* Footer HUD */}
      <footer className="fixed bottom-0 left-0 right-0 glass-nav p-3 lg:p-5 z-40 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-6 min-w-0">
                <div className="flex items-center gap-2 whitespace-nowrap">
                    <Flame size={14} className="text-orange-500 fill-orange-500 flex-shrink-0" />
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest font-heading text-white truncate">{currentStreak}d Streak</span>
                </div>
                <div className="flex items-center gap-2 whitespace-nowrap">
                    <Trophy size={14} className="text-[#39d353] flex-shrink-0" />
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest font-heading text-white truncate">{stats.totalXp} XP</span>
                </div>
            </div>
            <div className="text-[8px] lg:text-[10px] font-bold text-[#30363d] uppercase tracking-[0.3em] hidden lg:block whitespace-nowrap">HabitFlow Engine v2.3.0</div>
        </div>
      </footer>

      {/* Habit Manager Modal */}
      {showHabitManager && (
        <div className="fixed inset-0 z-[100] bg-[#0d1117ee] backdrop-blur-xl flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-[#161b22] border border-[#30363d] rounded-[32px] p-10 relative">
            <button 
              onClick={() => {
                setShowHabitManager(false);
                setEditingHabit(null);
              }} 
              className="absolute top-8 right-8 text-[#8b949e] hover:text-white p-2 bg-[#21262d] rounded-xl border border-[#30363d]"
            >
                <X size={20} />
            </button>
            <HabitManager 
              habits={habits} 
              editingHabit={editingHabit}
              onAdd={(name, cat, diff, time) => {
                setHabits([...habits, { id: crypto.randomUUID(), name, category: cat, difficulty: diff, createdAt: Date.now(), color: 'green', reminderTime: time }]);
                setShowHabitManager(false);
              }}
              onEdit={editHabit}
              onRemove={removeHabit}
              onEditCancel={() => {
                setEditingHabit(null);
                setShowHabitManager(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
