import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { format, subDays } from 'date-fns';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Target, Zap, Globe, Quote, Calendar, CheckCircle2, Cpu, Activity, X, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { quotes } from '../constants/quotes';
import { motion, AnimatePresence } from 'motion/react';
import { eachDayOfInterval, startOfYear, endOfYear } from 'date-fns';

// Ninja shadow fight background animation
const NinjaBackground: React.FC = () => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    const canvas = document.getElementById('ninja-bg') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let W = 0, H = 0, ground = 0, animId = 0;

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      ground = H * 0.78;
    }
    resize();
    window.addEventListener('resize', resize);

    const particles: any[] = [];
    function spawnParticles(x: number, y: number, color: string, count = 6) {
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = 2 + Math.random() * 4;
        particles.push({ x, y, vx: Math.cos(a)*s, vy: Math.sin(a)*s - 2, life: 1, decay: 0.04 + Math.random()*0.04, size: 2 + Math.random()*3, color });
      }
    }

    function drawFighter(x: number, y: number, facingRight: boolean, state: string, frame: number, headbandColor: string) {
      ctx.save();
      ctx.translate(x, y);
      if (!facingRight) ctx.scale(-1, 1);

      const shadow = 'rgba(30,30,30,0.95)';
      ctx.strokeStyle = shadow; ctx.fillStyle = shadow;
      ctx.lineWidth = 3.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 8;

      const t = frame * 0.12;
      let fLeg = 0.2, bLeg = -0.2, fArm = -0.3, bArm = 0.4, lean = 0, kb = 0;

      if (state === 'run') {
        const s = Math.sin(t * 2);
        fLeg = s * 0.65; bLeg = -s * 0.65;
        fArm = -s * 0.5; bArm = s * 0.5;
        lean = 0.18; kb = Math.abs(s) * 0.4;
      } else if (state === 'attack1') { fArm = -1.5; bArm = 0.7; fLeg = 0.3; lean = 0.3; }
      else if (state === 'attack2') { fLeg = -1.3; bLeg = -0.1; fArm = -0.8; lean = 0.2; }
      else if (state === 'attack3') { fArm = -1.8 + Math.sin(t*4)*0.4; bArm = 1.2; lean = 0.35; }
      else if (state === 'jump') { fLeg = -0.5; bLeg = 0.5; fArm = -1.0; bArm = -0.4; kb = 0.5; }
      else if (state === 'idle') { lean = Math.sin(t * 0.5) * 0.04; }

      const hR = 13, bodyH = 34, legH = 38, armL = 26;
      const shY = -bodyH - hR*2 + 4, hipY = -legH + 4;

      // Back limbs (darker)
      ctx.globalAlpha = 0.45;
      // Back leg
      ctx.beginPath(); ctx.moveTo(0, hipY);
      const bkx = Math.sin(bLeg)*legH*0.5, bky = hipY + Math.cos(Math.abs(bLeg))*legH*0.5 + kb*10;
      ctx.lineTo(bkx, bky); ctx.lineTo(bkx + Math.sin(bLeg+kb)*legH*0.45, bky + legH*0.5); ctx.stroke();
      // Back arm
      ctx.beginPath(); ctx.moveTo(0, shY);
      const baex = Math.sin(bArm)*armL*0.5, baey = shY + Math.cos(Math.abs(bArm))*armL*0.5;
      ctx.lineTo(baex, baey); ctx.lineTo(baex + Math.sin(bArm*0.7)*armL*0.5, baey + armL*0.45); ctx.stroke();
      ctx.globalAlpha = 1;

      // Body
      const bx = Math.sin(lean)*5;
      ctx.beginPath(); ctx.moveTo(0, hipY); ctx.lineTo(bx, shY); ctx.stroke();
      // Head
      ctx.beginPath(); ctx.arc(bx, shY - hR, hR, 0, Math.PI*2); ctx.fill();
      // Headband
      ctx.beginPath(); ctx.arc(bx, shY - hR, hR + 1, Math.PI*0.75, Math.PI*0.25);
      ctx.strokeStyle = headbandColor; ctx.lineWidth = 3.5;
      ctx.shadowColor = headbandColor; ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.strokeStyle = shadow; ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 8; ctx.lineWidth = 3.5;

      // Front leg
      ctx.beginPath(); ctx.moveTo(0, hipY);
      const fkx = Math.sin(fLeg)*legH*0.5, fky = hipY + Math.cos(Math.abs(fLeg))*legH*0.5 + kb*8;
      ctx.lineTo(fkx, fky); ctx.lineTo(fkx + Math.sin(fLeg+kb*0.5)*legH*0.45, fky + legH*0.5); ctx.stroke();

      // Front arm
      ctx.beginPath(); ctx.moveTo(bx, shY);
      const faex = bx + Math.sin(fArm)*armL*0.5, faey = shY + Math.cos(Math.abs(fArm))*armL*0.5;
      ctx.lineTo(faex, faey);
      const fahx = faex + Math.sin(fArm*0.8)*armL*0.5, fahy = faey + armL*0.5;
      ctx.lineTo(fahx, fahy); ctx.stroke();

      // Sword on attack
      if (state.startsWith('attack') || state === 'run') {
        const sa = fArm - 0.3;
        ctx.beginPath(); ctx.moveTo(fahx, fahy);
        ctx.lineTo(fahx + Math.sin(sa)*42, fahy - Math.cos(sa)*18);
        ctx.strokeStyle = headbandColor.replace('0.9', '0.7');
        ctx.shadowColor = headbandColor; ctx.shadowBlur = 18; ctx.lineWidth = 2;
        ctx.stroke();
        // Trail
        if (state === 'attack1' || state === 'attack3') {
          ctx.beginPath(); ctx.moveTo(fahx, fahy);
          ctx.lineTo(fahx + Math.sin(sa+0.5)*34, fahy - Math.cos(sa+0.5)*14);
          ctx.strokeStyle = headbandColor.replace('0.9', '0.15');
          ctx.lineWidth = 9; ctx.stroke();
        }
      }
      ctx.restore();
    }

    // Simple fighter AI
    type FState = { x: number; y: number; vy: number; state: string; timer: number; frame: number; isLeft: boolean; headband: string; };

    const fighters: FState[] = [
      { x: W * 0.3, y: ground, vy: 0, state: 'idle', timer: 60, frame: 0, isLeft: true, headband: 'rgba(100,180,255,0.9)' },
      { x: W * 0.7, y: ground, vy: 0, state: 'idle', timer: 80, frame: 0, isLeft: false, headband: 'rgba(255,80,80,0.9)' }
    ];

    function updateFighter(f: FState, opp: FState) {
      f.frame++;
      f.timer--;
      if (f.y < ground) { f.vy += 1.1; f.y += f.vy; if (f.y >= ground) { f.y = ground; f.vy = 0; if (f.state === 'jump') f.state = 'idle'; } }
      if (f.timer > 0) return;
      const dist = Math.abs(f.x - opp.x);
      const r = Math.random();
      if (dist < 140) {
        if (r < 0.45) { f.state = 'attack1'; f.timer = 24; spawnParticles((f.x+opp.x)/2, ground-65, f.headband, 5); }
        else if (r < 0.75) { f.state = 'attack2'; f.timer = 28; }
        else { f.state = 'attack3'; f.timer = 30; spawnParticles((f.x+opp.x)/2, ground-65, f.headband, 4); }
      } else if (dist < 250) {
        if (r < 0.35) { f.state = 'jump'; f.timer = 36; f.vy = -17; }
        else { f.state = 'attack1'; f.timer = 22; }
      } else {
        f.state = 'run'; f.timer = 20;
        f.x += f.isLeft ? 28 : -28;
        f.x = Math.max(80, Math.min(W - 80, f.x));
      }
    }

    let last = 0;
    function loop(ts: number) {
      ctx.clearRect(0, 0, W, H);

      for (let i = 0; i < 2; i++) {
        updateFighter(fighters[i], fighters[1-i]);
      }

      // Ground shadows
      fighters.forEach(f => {
        ctx.save(); ctx.globalAlpha = 0.3;
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath(); ctx.ellipse(f.x, ground + 3, 30, 7, 0, 0, Math.PI*2); ctx.fill();
        ctx.restore();
      });

      drawFighter(fighters[0].x, fighters[0].y, true, fighters[0].state, fighters[0].frame, fighters[0].headband);
      drawFighter(fighters[1].x, fighters[1].y, false, fighters[1].state, fighters[1].frame, fighters[1].headband);

      // Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy; p.vy += 0.25; p.life -= p.decay;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        ctx.save(); ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color; ctx.shadowColor = p.color; ctx.shadowBlur = 6;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI*2); ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(loop);
    }
    animId = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  return null;
};

export const Dashboard: React.FC = () => {
  const { habits, tasks, userProfile, setActiveTab } = useAppContext();
  const [showWhyModal, setShowWhyModal] = useState(false);

  // Goal alignment score — how well do today's tasks match user goals?
  const getGoalAlignment = () => {
    const todayTasks = tasks.filter(t => t.date === format(new Date(), 'yyyy-MM-dd'));
    if (!userProfile?.goals || todayTasks.length === 0) return null;
    const goals = userProfile.goals.toLowerCase();
    const keywords = goals.split(/[\s,\.]+/).filter(w => w.length > 3);
    const matched = todayTasks.filter(t =>
      keywords.some(k => t.name.toLowerCase().includes(k))
    ).length;
    return Math.round((matched / todayTasks.length) * 100);
  };
  const goalAlignment = getGoalAlignment();
  const [showYearly, setShowYearly] = useState(false);

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const todayTasks = tasks.filter(t => t.date === todayStr);
  const completedTodayTasks = todayTasks.filter(t => t.completed).length;
  const taskProgress = todayTasks.length > 0 ? Math.round((completedTodayTasks / todayTasks.length) * 100) : 0;
  const activeHabits = habits.length;
  const habitCompletionsToday = habits.filter(h => h.logs[todayStr]).length;
  const habitProgress = activeHabits > 0 ? Math.round((habitCompletionsToday / activeHabits) * 100) : 0;
  const completedTotalTasks = tasks.filter(t => t.completed).length;
  const totalTaskProgress = tasks.length > 0 ? Math.round((completedTotalTasks / tasks.length) * 100) : 0;
  const totalHabitLogs = habits.reduce((acc, h) => acc + Object.keys(h.logs).length, 0);
  const totalHabitProgress = habits.length > 0 ? Math.min(100, Math.round((totalHabitLogs / (habits.length * 30)) * 100)) : 0;
  const overallProgress = Math.round((totalTaskProgress + totalHabitProgress) / 2);

  const getDaysActive = () => {
    const allDates = [...tasks.map(t => t.date), ...habits.flatMap(h => Object.keys(h.logs))].sort();
    if (allDates.length === 0) return 1;
    return Math.ceil(Math.abs(new Date().getTime() - new Date(allDates[0]).getTime()) / 86400000) || 1;
  };

  const hash = Array.from(format(today, 'yyyyMMdd')).reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const dailyQuote = quotes[hash % quotes.length];

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(today, 6 - i);
    const dateStr = format(d, 'yyyy-MM-dd');
    return {
      name: format(d, 'EEE'),
      habits: habits.filter(h => h.logs[dateStr]).length,
      tasks: tasks.filter(t => t.date === dateStr && t.completed).length,
    };
  });

  const yearlyData = eachDayOfInterval({ start: startOfYear(today), end: endOfYear(today) }).map(day => {
    const dStr = format(day, 'yyyy-MM-dd');
    const total = habits.filter(h => h.logs[dStr]).length + tasks.filter(t => t.date === dStr && t.completed).length;
    return { date: day, intensity: total === 0 ? 0 : total < 2 ? 1 : total < 4 ? 2 : total < 6 ? 3 : 4 };
  });

  const GaugeCard = ({ label, value, color, icon: Icon, sub }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-4 flex items-center gap-3"
    >
      <div className="relative w-14 h-14 flex-shrink-0">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1a1a1a" strokeWidth="3.5" />
          <circle cx="18" cy="18" r="15.9" fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round"
            strokeDasharray={`${value} 100`} style={{ transition: 'stroke-dasharray 0.8s ease' }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-black text-white">{value}%</span>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{label}</p>
        <p className="text-white font-bold text-sm mt-0.5 truncate">{sub}</p>
      </div>
      <Icon size={16} style={{ color }} className="flex-shrink-0 opacity-50" />
    </motion.div>
  );

  return (
    <div className="h-full overflow-y-auto bg-[#050505] text-[#E4E3E0] relative">
      {/* Ninja fight background canvas */}
      <canvas id="ninja-bg" className="fixed pointer-events-none" style={{ top: 0, left: 0, width: '100%', height: '100%', opacity: 0.18, zIndex: 0 }} />
      <NinjaBackground />
      <div className="relative z-10">
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-4 pb-8">

        {/* Header */}
        <motion.header initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between pt-1">
          <div>
            <div className="flex items-center gap-1.5 text-emerald-500 mb-1">
              <Activity size={11} className="animate-pulse" />
              <span className="text-[9px] font-bold uppercase tracking-[0.2em]">System Online</span>
            </div>
            <h2 className="text-xl md:text-4xl font-black tracking-tighter text-white uppercase italic leading-none">
              {userProfile?.name || 'OPERATIVE'}<span className="text-emerald-500">.</span>
            </h2>
            <p className="text-gray-600 text-[9px] font-bold uppercase tracking-widest mt-1">{format(today, 'eeee · dd.MM.yyyy')}</p>
          </div>
          <div className="flex gap-3 text-right">
            <div>
              <p className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">Efficiency</p>
              <p className="text-xl md:text-2xl font-black text-white">{overallProgress}%</p>
            </div>
            <div className="w-px bg-white/10" />
            <div>
              <p className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">Days</p>
              <p className="text-xl md:text-2xl font-black text-white">{getDaysActive()}</p>
            </div>
          </div>
        </motion.header>

        {/* 3 Gauge Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <GaugeCard label="Daily Tasks" value={taskProgress} color="#10b981" icon={Target} sub={`${completedTodayTasks}/${todayTasks.length} done`} />
          <GaugeCard label="Habits Today" value={habitProgress} color="#3b82f6" icon={Zap} sub={`${habitCompletionsToday}/${activeHabits} logged`} />
          <GaugeCard label="Overall" value={overallProgress} color="#8b5cf6" icon={Globe} sub={`${completedTotalTasks + totalHabitLogs} actions`} />
        </div>

        {/* Chart + Quote */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-[#0A0A0A] border border-white/5 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-black text-white text-sm uppercase italic">{showYearly ? 'Yearly Matrix' : 'Weekly Performance'}</h3>
                <p className="text-[9px] text-gray-600 uppercase tracking-widest">Activity visualization</p>
              </div>
              <button onClick={() => setShowYearly(!showYearly)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all">
                <Calendar size={11} className="text-emerald-500" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">{showYearly ? 'Weekly' : 'Yearly'}</span>
              </button>
            </div>
            <div className="h-44 md:h-56">
              {showYearly ? (
                <div className="h-full flex flex-col justify-center">
                  <div className="overflow-x-auto pb-2">
                    <div className="grid grid-flow-col grid-rows-7 gap-[3px]" style={{ width: 'max-content' }}>
                      {yearlyData.map((day, i) => (
                        <div key={i} title={`${format(day.date, 'MMM dd')}: ${day.intensity}`}
                          className={cn("w-2.5 h-2.5 rounded-sm",
                            day.intensity === 0 && "bg-white/5",
                            day.intensity === 1 && "bg-emerald-500/20",
                            day.intensity === 2 && "bg-emerald-500/40",
                            day.intensity === 3 && "bg-emerald-500/70",
                            day.intensity === 4 && "bg-emerald-500")} />
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between mt-2 text-[8px] font-bold text-gray-600 uppercase">
                    {['Jan','Mar','May','Jul','Sep','Nov','Dec'].map(m => <span key={m}>{m}</span>)}
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={last7Days} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#4b5563', fontSize: 9, fontWeight: 800 }} dy={6} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#4b5563', fontSize: 9 }} />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                      contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#0a0a0a', color: '#fff', fontSize: '11px' }} />
                    <Bar dataKey="habits" fill="#10b981" radius={[4, 4, 0, 0]} barSize={14} />
                    <Bar dataKey="tasks" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={14} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            {!showYearly && (
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Habits</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /><span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Tasks</span></div>
              </div>
            )}
          </div>

          {/* Quote */}
          <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <h3 className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-3">Daily Directive</h3>
              <Quote className="text-emerald-500 opacity-20 mb-2" size={20} />
              <p className="text-sm font-medium italic leading-relaxed text-gray-300">"{dailyQuote.text}"</p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-500 mt-2">— {dailyQuote.author}</p>
            </div>
            <div className="mt-4 space-y-2">
              {[
                { label: 'Goal Clarity', val: userProfile?.goals ? 100 : 0, text: userProfile?.goals ? 'Set' : 'Pending', color: 'bg-emerald-500' },
                { label: 'Task Quality', val: totalTaskProgress, text: `${totalTaskProgress}%`, color: 'bg-blue-500' },
              ].map(item => (
                <div key={item.label} className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[8px] font-bold uppercase tracking-widest text-gray-500">{item.label}</span>
                    <span className="text-[9px] font-bold text-white">{item.text}</span>
                  </div>
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} transition-all`} style={{ width: `${item.val}%` }} />
                  </div>
                </div>
              ))}

              {/* Goal Alignment */}
              {goalAlignment !== null && (
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[8px] font-bold uppercase tracking-widest text-gray-500">Goal Alignment</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold ${goalAlignment >= 60 ? 'text-emerald-400' : goalAlignment >= 30 ? 'text-amber-400' : 'text-red-400'}`}>{goalAlignment}%</span>
                      {goalAlignment < 80 && (
                        <button onClick={() => setShowWhyModal(true)}
                          className="text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full hover:bg-amber-500/30 transition-all">
                          Why?
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full transition-all ${goalAlignment >= 60 ? 'bg-emerald-500' : goalAlignment >= 30 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${goalAlignment}%` }} />
                  </div>
                </div>
              )}
            </div>

            {/* Why Modal */}
            <AnimatePresence>
              {showWhyModal && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                  onClick={() => setShowWhyModal(false)}>
                  <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
                    className="bg-[#141414] border border-white/10 rounded-2xl p-5 max-w-sm w-full"
                    onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <AlertCircle size={16} className="text-amber-400" />
                        <h3 className="font-bold text-white text-sm">Goal Alignment</h3>
                      </div>
                      <button onClick={() => setShowWhyModal(false)} className="text-gray-500 hover:text-white"><X size={16} /></button>
                    </div>
                    <p className="text-gray-400 text-xs leading-relaxed mb-4">
                      Your goal: <span className="text-white font-medium">"{userProfile?.goals}"</span>
                      <br /><br />
                      Some of today's tasks don't seem directly connected to this goal. Your AI companion can help you figure out which tasks actually move the needle.
                    </p>
                    <button onClick={() => { setShowWhyModal(false); setActiveTab('ai'); }}
                      className="w-full py-2.5 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-colors">
                      Ask AI → Why doesn't this match?
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Habits grid */}
        <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-black text-white text-sm uppercase italic">Active Habits</h3>
            <button onClick={() => setActiveTab('habits')} className="text-[9px] font-bold uppercase tracking-widest text-emerald-500 hover:text-emerald-400 transition-colors">View All →</button>
          </div>
          {habits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 opacity-30">
              <Cpu size={32} className="mb-2" />
              <p className="text-xs font-bold uppercase tracking-widest">No Active Habits</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {habits.map(habit => (
                <div key={habit.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-base flex-shrink-0">{habit.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-white truncate">{habit.name}</div>
                    <div className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">{habit.category}</div>
                  </div>
                  <div className={cn("w-5 h-5 rounded-full flex items-center justify-center border-2 flex-shrink-0 transition-all",
                    habit.logs[todayStr] ? "bg-emerald-500 border-emerald-500 text-white" : "border-white/10 text-transparent")}>
                    <CheckCircle2 size={10} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
      </div>
    </div>
  );
};
