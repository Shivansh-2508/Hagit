
import React, { useState } from 'react';
import { auth } from '../services/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { Zap, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

const AuthGateway: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#0d1117]">
      <div className="mb-10 text-center animate-in fade-in zoom-in duration-700">
        <div className="bg-[#39d353] w-16 h-16 rounded-3xl flex items-center justify-center shadow-2xl shadow-[#39d353]/30 mx-auto mb-6">
          <Zap className="text-white fill-white" size={32} />
        </div>
        <h1 className="text-4xl font-black font-heading text-white tracking-tighter uppercase italic">HabitFlow</h1>
        <p className="text-[#8b949e] mt-2 font-medium">Precision Tracking for Peak Performance</p>
      </div>

      <div className="w-full max-w-sm premium-card p-10 space-y-8 animate-in slide-in-from-bottom-8 duration-700">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">{isLogin ? 'Sign In' : 'Join the Elite'}</h2>
          <p className="text-sm text-[#8b949e]">Enter your credentials to continue your journey.</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#8b949e] uppercase tracking-widest ml-1">Email Protocol</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#30363d] group-focus-within:text-[#58a6ff] transition-colors" size={18} />
              <input 
                type="email" 
                required 
                className="auth-input pl-12" 
                placeholder="commander@habitflow.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#8b949e] uppercase tracking-widest ml-1">Secure Uplink</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#30363d] group-focus-within:text-[#58a6ff] transition-colors" size={18} />
              <input 
                type="password" 
                required 
                className="auth-input pl-12" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-xs text-red-400 bg-red-400/10 p-3 rounded-lg border border-red-400/20">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-white text-black py-3.5 rounded-xl text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-[#c9d1d9] transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : (
              <>
                {isLogin ? 'Initialize System' : 'Create Profile'}
                <ArrowRight size={14} strokeWidth={3} />
              </>
            )}
          </button>
        </form>

        <div className="pt-6 border-t border-[#30363d] text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-xs font-bold text-[#8b949e] hover:text-[#58a6ff] transition-colors uppercase tracking-widest"
          >
            {isLogin ? "Need an account? Sign up" : "Already registered? Log in"}
          </button>
        </div>
      </div>
      
      <p className="mt-12 text-[10px] text-[#30363d] font-bold uppercase tracking-[0.4em]">Encrypted Session v2.5.0</p>
    </div>
  );
};

export default AuthGateway;
