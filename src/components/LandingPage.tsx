import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Zap, Shield, Cpu, Globe, Gauge, Activity, Target, CheckCircle2, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';

type LandingPageProps = {
  onGetStarted: () => void;
};

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-[#050505] text-[#E4E3E0] selection:bg-emerald-500/30 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-center backdrop-blur-md border-b border-white/5">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Zap size={18} className="text-black fill-current" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase italic">Elevate<span className="text-emerald-500">.</span></span>
        </div>
        <div className="hidden md:flex items-center space-x-8 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
          <a href="#vision" className="hover:text-white transition-colors">Vision</a>
          <a href="#systems" className="hover:text-white transition-colors">Systems</a>
          <a href="#intelligence" className="hover:text-white transition-colors">Intelligence</a>
        </div>
        <button 
          onClick={onGetStarted}
          className="px-6 py-2 bg-white text-black text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-emerald-500 transition-all"
        >
          Initialize
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 blur-[100px] rounded-full glow-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/10 blur-[100px] rounded-full glow-pulse delay-700" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
          <div className="scanline-effect" />
        </div>

        <div className="relative z-10 text-center max-w-5xl px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ 
              duration: 1.2, 
              ease: [0.22, 1, 0.36, 1],
              staggerChildren: 0.2
            }}
          >
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="inline-flex items-center space-x-2 px-4 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-8"
            >
              <Activity size={12} className="text-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.3em]">Neural OS v4.0 Active</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="text-6xl md:text-9xl font-black tracking-tighter uppercase italic leading-[0.85] mb-8"
            >
              Upgrade Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">Human Operating System</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 font-medium leading-relaxed"
            >
              The world's first high-class personal operating system. Optimize your habits, automate your tasks, and elevate your intelligence with integrated neural-link AI.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6"
            >
              <button 
                onClick={onGetStarted}
                className="group relative px-10 py-5 bg-emerald-500 text-black font-black uppercase italic tracking-widest rounded-2xl overflow-hidden transition-all hover:scale-105 active:scale-95"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative flex items-center space-x-3">
                  <span>Start Optimization</span>
                  <ArrowRight size={20} />
                </span>
              </button>
              <button className="px-10 py-5 bg-white/5 border border-white/10 text-white font-black uppercase italic tracking-widest rounded-2xl hover:bg-white/10 transition-all">
                View Blueprint
              </button>
            </motion.div>
          </motion.div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-30">
          <ChevronDown size={32} />
        </div>
      </section>

      {/* Stats Section -> Features Highlight */}
      <section className="py-24 border-y border-white/5 bg-[#080808]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12">
          {[
            { label: 'Neural Memory', value: 'AI Sync' },
            { label: 'Habit Systems', value: 'Atomic' },
            { label: 'Cloud Storage', value: 'Secured' },
            { label: 'Device Sync', value: 'Instant' },
          ].map((stat, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <p className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-2 uppercase italic">{stat.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section id="intelligence" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-6">The Core Architecture</h2>
            <p className="text-gray-500 max-w-2xl mx-auto uppercase tracking-widest text-xs font-bold">Engineered for peak performance and total life control.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Target className="text-emerald-500" size={32} />,
                title: 'Precision Habits',
                desc: 'Atomic habit tracking with neural consistency scores. Build the systems that build you.'
              },
              {
                icon: <Zap className="text-blue-500" size={32} />,
                title: 'Task Automation',
                desc: 'Intelligent task management that prioritizes your most impactful moves automatically.'
              },
              {
                icon: <Bot className="text-purple-500" size={32} />,
                title: 'Neural AI Link',
                desc: 'A personal AI coach that remembers your history, goals, and behavior to provide surgical advice.'
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 0.5 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="p-10 bg-[#0A0A0A] border border-white/5 rounded-[40px] group hover:border-emerald-500/30 transition-all cursor-default"
              >
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-black uppercase italic tracking-tight mb-4">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed font-medium">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-32 px-6 bg-gradient-to-b from-transparent to-emerald-500/5">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-16 bg-[#0A0A0A] border border-emerald-500/20 rounded-[60px] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
            <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-8">Ready to Elevate?</h2>
            <p className="text-xl text-gray-400 mb-12">Join the elite circle of operatives optimizing their reality.</p>
            <button 
              onClick={onGetStarted}
              className="px-12 py-6 bg-white text-black font-black uppercase italic tracking-widest rounded-2xl hover:bg-emerald-500 transition-all hover:scale-105"
            >
              Initialize System Access
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-600">© 2026 ELEVATE NEURAL SYSTEMS // ALL RIGHTS RESERVED</p>
      </footer>
    </div>
  );
};

const Bot = ({ className, size }: { className?: string, size?: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M12 8V4H8" />
    <rect width="16" height="12" x="4" y="8" rx="2" />
    <path d="M2 14h2" />
    <path d="M20 14h2" />
    <path d="M15 13v2" />
    <path d="M9 13v2" />
  </svg>
);
