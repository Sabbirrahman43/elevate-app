import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, ArrowRight, Loader2, Sparkles, ShieldCheck, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Logo } from './Logo';

type LoginProps = {
  onBack?: () => void;
};

export const Login: React.FC<LoginProps> = ({ onBack }) => {
  const { login, signup, loginWithGoogle } = useAppContext();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google login failed');
    }
  };

  React.useEffect(() => {
    setServerStatus('online');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
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
    <div className="min-h-screen bg-[#F5F5F5] dark:bg-[#0A0A0A] flex items-center justify-center p-4 transition-colors duration-300">
      <div className="max-w-md w-full relative">
        {onBack && (
          <button 
            onClick={onBack}
            className="absolute -top-16 left-0 p-3 rounded-2xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 text-gray-400 hover:text-emerald-500 transition-all hover:scale-105"
            title="Back to Vision"
          >
            <ArrowRight className="rotate-180" size={20} />
          </button>
        )}
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-6"
          >
            <Logo size={80} />
          </motion.div>
          <h1 className="text-5xl font-black tracking-tighter dark:text-white mb-2 uppercase italic">Elevate<span className="text-emerald-500">.</span></h1>
          <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-4">Neural Link // System Access</p>
          
          <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest">
            {serverStatus === 'checking' && <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" />}
            {serverStatus === 'online' && <CheckCircle2 size={14} className="text-emerald-500" />}
            {serverStatus === 'offline' && <AlertCircle size={14} className="text-red-500" />}
            <span className={serverStatus === 'online' ? 'text-emerald-500' : serverStatus === 'offline' ? 'text-red-500' : 'text-gray-400'}>
              System {serverStatus}
            </span>
          </div>
        </div>

        <motion.div 
          layout
          className="bg-white dark:bg-[#141414] p-8 rounded-[32px] shadow-xl border border-black/5 dark:border-white/5 transition-colors"
        >
          <div className="flex p-1 bg-gray-100 dark:bg-white/5 rounded-2xl mb-8">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${isLogin ? 'bg-white dark:bg-[#1A1A1A] shadow-sm text-emerald-500' : 'text-gray-400'}`}
            >
              Login
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${!isLogin ? 'bg-white dark:bg-[#1A1A1A] shadow-sm text-emerald-500' : 'text-gray-400'}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 ml-1">Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-14 pl-12 pr-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      placeholder="John Doe"
                    />
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 ml-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  placeholder="name@example.com"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 ml-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  placeholder="••••••••"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              </div>
            </div>

            {error && (
              <motion.p 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="text-red-500 text-xs font-medium text-center"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-emerald-500 text-white rounded-2xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center space-x-2 mt-4"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  <span>{isLogin ? 'Login' : 'Create Account'}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-black/5 dark:border-white/5"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                <span className="bg-white dark:bg-[#141414] px-4 text-gray-400 font-bold">Secure Access</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full h-14 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 font-bold rounded-2xl transition-all flex items-center justify-center space-x-3 text-xs uppercase tracking-widest"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </form>
        </motion.div>

        <div className="mt-8 flex items-center justify-center space-x-6 text-gray-400">
          <div className="flex items-center space-x-2">
            <ShieldCheck size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Secure Data</span>
          </div>
          <div className="flex items-center space-x-2">
            <Zap size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">AI Powered</span>
          </div>
        </div>
      </div>
    </div>
  );
};
