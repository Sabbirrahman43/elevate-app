import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Target, Brain, CheckSquare, Sparkles, X } from 'lucide-react';

interface OnboardingProps {
  userName: string;
  onComplete: () => void;
}

const steps = [
  {
    icon: Target,
    color: '#34d399',
    title: 'Track Your Habits',
    desc: 'Build streaks. Log daily habits. Watch your consistency grow over time on the Habits board.',
  },
  {
    icon: CheckSquare,
    color: '#06b6d4',
    title: 'Daily Tasks',
    desc: 'Assign tasks to specific days. Link them to habits. Keep your days structured and focused.',
  },
  {
    icon: Brain,
    color: '#818cf8',
    title: 'Your AI Companion',
    desc: 'Go to Settings → add your Gemini API key (free at aistudio.google.com). Your AI stays private — your key, your data.',
  },
  {
    icon: Sparkles,
    color: '#f59e0b',
    title: "You're ready.",
    desc: "Your data is saved to the cloud. Access Elevate from any device. Let's build something great.",
  },
];

export const Onboarding: React.FC<OnboardingProps> = ({ userName, onComplete }) => {
  const [step, setStep] = useState(0);
  const current = steps[step];
  const Icon = current.icon;
  const isLast = step === steps.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-sm bg-[#141414] border border-white/10 rounded-3xl p-8 text-center overflow-hidden"
      >
        {/* Skip */}
        <button
          onClick={onComplete}
          className="absolute top-4 right-4 p-2 rounded-xl text-white/30 hover:text-white/60 transition-colors"
        >
          <X size={16} />
        </button>

        {/* Background glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full opacity-10 pointer-events-none"
          style={{ background: `radial-gradient(circle, ${current.color} 0%, transparent 70%)`, filter: 'blur(30px)' }}
        />

        {/* Step 0 greeting */}
        {step === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-white/40 text-xs tracking-widest uppercase mb-4"
          >
            Welcome, {userName || 'there'} 👋
          </motion.p>
        )}

        {/* Icon */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
            style={{ background: `${current.color}20`, border: `1px solid ${current.color}40` }}
          >
            <Icon size={28} style={{ color: current.color }} />
          </motion.div>
        </AnimatePresence>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step + 'text'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-white text-xl font-bold mb-3">{current.title}</h2>
            <p className="text-white/50 text-sm leading-relaxed">{current.desc}</p>
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8 mb-6">
          {steps.map((_, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === step ? '24px' : '6px',
                background: i === step ? current.color : 'rgba(255,255,255,0.15)',
              }}
            />
          ))}
        </div>

        {/* Button */}
        <button
          onClick={() => isLast ? onComplete() : setStep(s => s + 1)}
          className="w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90 active:scale-95"
          style={{ background: `linear-gradient(135deg, ${current.color}, ${current.color}99)`, color: '#0a0a0a' }}
        >
          {isLast ? "Let's go" : 'Next'}
          <ArrowRight size={16} />
        </button>
      </motion.div>
    </motion.div>
  );
};
