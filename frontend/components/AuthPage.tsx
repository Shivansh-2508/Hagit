import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { LogIn, UserPlus, Zap, Loader2 } from 'lucide-react';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, name);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="bg-[#39d353] w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg shadow-[#39d353]/30 mx-auto mb-6">
            <Zap className="text-white fill-white" size={40} strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-black font-heading text-white tracking-tight uppercase italic">
            HabitFlow
          </h1>
          <p className="text-[#8b949e] text-sm mt-2">Track habits, build momentum</p>
        </div>

        {/* Auth Card */}
        <div className="premium-card p-8">
          <div className="flex items-center gap-2 mb-8 border-b border-[#30363d] pb-6">
            {isLogin ? <LogIn size={20} className="text-[#39d353]" /> : <UserPlus size={20} className="text-[#39d353]" />}
            <h2 className="text-2xl font-bold font-heading text-white">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-[#8b949e] text-xs font-bold uppercase tracking-widest mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39d353] transition-colors"
                  placeholder="John Doe"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label className="block text-[#8b949e] text-xs font-bold uppercase tracking-widest mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39d353] transition-colors"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-[#8b949e] text-xs font-bold uppercase tracking-widest mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39d353] transition-colors"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#39d353] hover:bg-[#2ea043] text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
                  <span>{isLogin ? 'Login' : 'Sign Up'}</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#30363d] text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-[#58a6ff] hover:text-[#79c0ff] text-sm font-medium transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
