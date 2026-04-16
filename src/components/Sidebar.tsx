import React, { useEffect, useRef } from 'react';
import { LayoutDashboard, CheckSquare, ListTodo, Bot, Settings, Shield, Moon, Sun, LogOut, BookOpen } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppContext } from '../context/AppContext';

const NinjaCanvas: React.FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = 256, H = 150, G = H - 12;
    canvas.width = W; canvas.height = H;
    type P = { x: number; y: number; vx: number; vy: number; life: number; r: number; color: string };
    const pts: P[] = [];
    const boom = (x: number, y: number) => {
      for (let i = 0; i < 6; i++) {
        const a = Math.random() * Math.PI * 2, s = 3 + Math.random() * 5;
        pts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 2, life: 1, r: 2 + Math.random() * 3, color: 'rgba(80,190,255,0.9)' });
      }
    };
    const drawF = (x: number, y: number, right: boolean, st: string, fr: number, hb: string) => {
      ctx.save(); ctx.translate(x, y); if (!right) ctx.scale(-1, 1);
      const t = fr * 0.2;
      let fL = 0, bL = 0, fA = 0, bA = 0, lean = 0, kb = 0;
      if (st === 'run') { const s = Math.sin(t * 3); fL = s * 0.8; bL = -s * 0.7; fA = -s * 0.5; bA = s * 0.4; lean = 0.2; }
      else if (st === 'a1') { fA = -1.8; bA = 0.8; fL = 0.4; lean = 0.35; }
      else if (st === 'a2') { fA = -2.2; fL = 0.5; lean = 0.4; }
      else if (st === 'jump') { fL = -0.6; bL = 0.6; fA = -1.0; kb = 0.6; }
      else if (st === 'hurt') { lean = -0.4; fA = 0.8; }
      ctx.strokeStyle = 'rgba(10,10,14,0.97)'; ctx.fillStyle = 'rgba(10,10,14,0.97)'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const hR = 9, bH = 23, lH = 27, aL = 17;
      const shY = -bH - hR * 2 + 3, hipY = -lH + 3;
      ctx.globalAlpha = 0.3;
      ctx.beginPath(); ctx.moveTo(0, hipY); ctx.lineTo(Math.sin(bL) * lH * 0.5, hipY + Math.cos(Math.abs(bL)) * lH * 0.5 + kb * 8); ctx.lineTo(Math.sin(bL) * lH * 0.9, hipY + lH * 0.95); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, shY); ctx.lineTo(Math.sin(bA) * aL * 0.5, shY + Math.cos(Math.abs(bA)) * aL * 0.5); ctx.lineTo(Math.sin(bA * 0.7) * aL * 0.9, shY + aL * 0.9); ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.beginPath(); ctx.moveTo(0, hipY); ctx.lineTo(Math.sin(lean) * 4, shY); ctx.stroke();
      ctx.beginPath(); ctx.arc(Math.sin(lean) * 4, shY - hR, hR, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(Math.sin(lean) * 4, shY - hR, hR + 1.5, Math.PI * 0.7, Math.PI * 0.3);
      ctx.strokeStyle = hb; ctx.lineWidth = 3; ctx.shadowColor = hb; ctx.shadowBlur = 14; ctx.stroke();
      ctx.strokeStyle = 'rgba(10,10,14,0.97)'; ctx.shadowBlur = 0; ctx.lineWidth = 3;
      const fkx = Math.sin(fL) * lH * 0.5, fky = hipY + Math.cos(Math.abs(fL)) * lH * 0.5 + kb * 6;
      ctx.beginPath(); ctx.moveTo(0, hipY); ctx.lineTo(fkx, fky); ctx.lineTo(fkx + Math.sin(fL * 0.8) * lH * 0.45, fky + lH * 0.48); ctx.stroke();
      const bx = Math.sin(lean) * 4;
      const faex = bx + Math.sin(fA) * aL * 0.5, faey = shY + Math.cos(Math.abs(fA)) * aL * 0.5;
      const fahx = faex + Math.sin(fA * 0.8) * aL * 0.48, fahy = faey + aL * 0.48;
      ctx.beginPath(); ctx.moveTo(bx, shY); ctx.lineTo(faex, faey); ctx.lineTo(fahx, fahy); ctx.stroke();
      if (st.startsWith('a')) {
        ctx.beginPath(); ctx.moveTo(fahx, fahy); ctx.lineTo(fahx + Math.sin(fA - 0.2) * 42, fahy - Math.cos(fA - 0.2) * 14);
        ctx.strokeStyle = 'rgba(150,220,255,0.9)'; ctx.shadowColor = hb; ctx.shadowBlur = 20; ctx.lineWidth = 2; ctx.stroke();
      }
      ctx.restore();
    };
    type F = { x: number; y: number; vy: number; st: string; t: number; fr: number; right: boolean; hb: string; kb: number };
    const hero: F = { x: 45, y: G, vy: 0, st: 'idle', t: 30, fr: 0, right: true, hb: 'rgba(80,190,255,0.95)', kb: 0 };
    const enemies: F[] = [
      { x: 200, y: G, vy: 0, st: 'idle', t: 40, fr: 0, right: false, hb: 'rgba(255,255,255,0.2)', kb: 0 },
      { x: 240, y: G, vy: 0, st: 'idle', t: 60, fr: 0, right: false, hb: 'rgba(255,255,255,0.15)', kb: 0 },
      { x: 170, y: G, vy: 0, st: 'idle', t: 50, fr: 0, right: false, hb: 'rgba(255,255,255,0.12)', kb: 0 },
    ];
    const upd = (f: F, tx: number, isHero: boolean) => {
      f.fr++; f.t--;
      if (f.kb !== 0) { f.x += f.kb; f.kb *= 0.6; if (Math.abs(f.kb) < 0.3) f.kb = 0; }
      if (f.y < G) { f.vy += 1.2; f.y += f.vy; if (f.y >= G) { f.y = G; f.vy = 0; if (f.st === 'jump') f.st = 'idle'; } }
      if (!isHero && f.x < 10) { f.x = 180 + Math.random() * 60; f.st = 'idle'; f.t = 30; }
      if (f.t > 0) return;
      const dist = Math.abs(f.x - tx); const r = Math.random();
      if (isHero) {
        if (dist < 65) {
          f.st = r < 0.5 ? 'a1' : 'a2'; f.t = 10 + Math.floor(r * 8);
          enemies.forEach(e => { if (Math.abs(e.x - f.x) < 75) { e.kb = 26; e.st = 'hurt'; e.t = 12; boom((f.x + e.x) / 2, G - 50); } });
        } else if (dist < 140) { f.st = 'jump'; f.t = 22; f.vy = -15; }
        else { f.st = 'run'; f.t = 8; f.x = Math.min(f.x + 40, W - 20); }
      } else {
        if (f.st === 'hurt') { f.st = 'idle'; f.t = 16; return; }
        if (dist < 80) { f.st = r < 0.45 ? 'a1' : 'idle'; f.t = 14; }
        else { f.st = 'run'; f.t = 10; f.x = Math.max(f.x - 35, tx + 55); }
      }
      f.x = Math.max(10, Math.min(W - 10, f.x));
    };
    let aid: number;
    const loop = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(255,255,255,0.025)'; ctx.fillRect(0, G + 1, W, 1);
      const near = enemies.reduce((a, b) => Math.abs(b.x - hero.x) < Math.abs(a.x - hero.x) ? b : a);
      upd(hero, near.x, true);
      enemies.forEach(e => upd(e, hero.x, false));
      enemies.forEach(e => drawF(e.x, e.y, e.right, e.st, e.fr, e.hb));
      drawF(hero.x, hero.y, hero.right, hero.st, hero.fr, hero.hb);
      for (let i = pts.length - 1; i >= 0; i--) {
        const p = pts[i]; p.x += p.vx; p.y += p.vy; p.vy += 0.3; p.life -= 0.05;
        if (p.life <= 0) { pts.splice(i, 1); continue; }
        ctx.save(); ctx.globalAlpha = p.life; ctx.fillStyle = p.color; ctx.shadowColor = p.color; ctx.shadowBlur = 6;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      }
      aid = requestAnimationFrame(loop);
    };
    aid = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(aid);
  }, []);
  return <canvas ref={ref} className="w-full opacity-80" />;
};

type Props = { activeTab: string; setActiveTab: (t: string) => void };
export const Sidebar: React.FC<Props> = ({ activeTab, setActiveTab }) => {
  const { userProfile, theme, setTheme, logout } = useAppContext();
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'habits', label: 'Habits', icon: CheckSquare },
    { id: 'tasks', label: 'Tasks', icon: ListTodo },
    { id: 'ai', label: 'Intelligence', icon: Bot },
    { id: 'notes', label: 'Notepad', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
    ...(userProfile?.email === 'prantorahman6900@gmail.com' ? [{ id: 'admin', label: 'Admin', icon: Shield }] : []),
  ];
  return (
    <div className="w-64 h-full flex flex-col bg-[#0d0d0d] border-r border-white/5">
      <div className="p-5 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#10b981" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
          <span className="font-bold text-white font-display">Elevate</span>
        </div>
        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-1.5 text-gray-600 hover:text-gray-300 transition-colors">
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto no-scrollbar">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={cn('w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium', activeTab === tab.id ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' : 'text-gray-500 hover:text-gray-200 hover:bg-white/4')}>
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </nav>
      <div className="mx-3 mb-2 rounded-xl overflow-hidden border border-white/4">
        <NinjaCanvas />
      </div>
      <div className="p-3 border-t border-white/5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center overflow-hidden flex-shrink-0">
          {userProfile?.avatar ? <img src={userProfile.avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <span className="text-emerald-400 font-bold text-sm">{(userProfile?.name || 'U').charAt(0).toUpperCase()}</span>}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-white truncate">{userProfile?.name || 'User'}</p>
          <p className="text-[10px] text-gray-600 truncate">{userProfile?.email || ''}</p>
        </div>
        <button onClick={logout} className="p-1.5 text-gray-600 hover:text-red-400 transition-colors"><LogOut size={14} /></button>
      </div>
    </div>
  );
};
