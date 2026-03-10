import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'logo' | 'name' | 'exit'>('logo');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('name'), 900);
    const t2 = setTimeout(() => setPhase('exit'), 2400);
    const t3 = setTimeout(() => onComplete(), 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== 'exit' ? (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #0f0c29 50%, #0a0a0a 100%)' }}
        >
          {/* Background orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full"
              style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)', filter: 'blur(60px)' }}
            />
            <motion.div
              animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full"
              style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)', filter: 'blur(60px)' }}
            />
          </div>

          {/* Logo */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative mb-8"
          >
            {/* Arc Icon */}
            <svg width="90" height="90" viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="splashArc" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: '#34d399' }} />
                  <stop offset="50%" style={{ stopColor: '#06b6d4' }} />
                  <stop offset="100%" style={{ stopColor: '#818cf8' }} />
                </linearGradient>
                <linearGradient id="splashBg" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#1a1a2e' }} />
                  <stop offset="100%" style={{ stopColor: '#16213e' }} />
                </linearGradient>
              </defs>
              <rect width="180" height="180" rx="40" fill="url(#splashBg)" />
              <path d="M 40 130 A 65 65 0 1 1 140 130" fill="none" stroke="url(#splashArc)" strokeWidth="10" strokeLinecap="round" opacity="0.3" />
              <path d="M 55 125 A 47 47 0 1 1 125 125" fill="none" stroke="url(#splashArc)" strokeWidth="8" strokeLinecap="round" opacity="0.8" />
              <polygon points="90,16 98,32 82,32" fill="#818cf8" />
            </svg>

            {/* Glow ring */}
            <motion.div
              animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 rounded-[22px]"
              style={{ boxShadow: '0 0 40px 10px rgba(99,102,241,0.3)' }}
            />
          </motion.div>

          {/* ELEVATE text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-center"
          >
            <h1
              className="font-black tracking-[0.3em] text-3xl"
              style={{
                background: 'linear-gradient(90deg, #818cf8, #06b6d4, #34d399)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              ELEVATE
            </h1>
          </motion.div>

          {/* "by Pranto Rahman" */}
          <AnimatePresence>
            {phase === 'name' && (
              <motion.div
                key="byline"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="mt-4 text-center"
              >
                <span className="text-white/30 text-xs tracking-widest uppercase">crafted by</span>
                <motion.p
                  initial={{ opacity: 0, letterSpacing: '0.1em' }}
                  animate={{ opacity: 1, letterSpacing: '0.25em' }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-white/70 text-sm font-light tracking-[0.25em] mt-1"
                >
                  Pranto Rahman
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading bar */}
          <motion.div
            className="absolute bottom-12 w-32 h-[2px] rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          >
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 2.2, ease: 'easeInOut' }}
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #6366f1, #06b6d4)' }}
            />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
