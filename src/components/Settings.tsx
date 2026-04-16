import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Save, Bot, User, Volume2, Upload, Wand2, Loader2, Download, Trash2, AlertTriangle, Lock } from 'lucide-react';
import { cn } from '../lib/utils';
import { GoogleGenAI } from '@google/genai';

export const Settings: React.FC = () => {
  const { aiSettings, updateAISettings, userProfile, updateUserProfile, habits, tasks, aiMemory, notes, importData, resetData, forceSave } = useAppContext();
  const [genAvatar, setGenAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveOk, setSaveOk] = useState(false);
  const [showGKey, setShowGKey] = useState(!aiSettings.apiKey);
  const [showQKey, setShowQKey] = useState(!aiSettings.groqApiKey);

  const personas = ['Coach', 'Teacher', 'Trainer', 'Partner', 'Friend', 'Wife', 'Girlfriend'];
  const voices = ['Puck', 'Kore', 'Zephyr', 'Charon', 'Fenrir'];

  const handleSave = async () => {
    setSaving(true);
    try { await forceSave(); setSaveOk(true); setTimeout(() => setSaveOk(false), 3000); } catch {}
    finally { setSaving(false); }
  };

  const handleGenAvatar = async () => {
    if (!aiSettings.apiKey) return;
    setGenAvatar(true);
    try {
      const ai = new GoogleGenAI({ apiKey: aiSettings.apiKey });
      const res = await ai.models.generateContent({
        model: 'gemini-2.0-flash-preview-image-generation',
        contents: { parts: [{ text: 'Square avatar portrait for AI named ' + aiSettings.name + ', persona: ' + aiSettings.persona + '. Digital art, dark background, modern, professional.' }] },
        config: { responseModalities: ['TEXT', 'IMAGE'] as any }
      });
      for (const p of res.candidates?.[0]?.content?.parts || []) {
        if ((p as any).inlineData) { updateAISettings({ avatar: 'data:image/png;base64,' + (p as any).inlineData.data }); break; }
      }
    } catch {} finally { setGenAvatar(false); }
  };

  const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <section className="bg-[#111] border border-white/5 rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2 pb-1 border-b border-white/5">
        {icon}<h3 className="font-semibold text-sm font-display text-white">{title}</h3>
      </div>
      {children}
    </section>
  );

  return (
    <div className="h-full overflow-y-auto bg-[#0a0a0a] text-white p-4 md:p-6 no-scrollbar">
      <div className="max-w-2xl mx-auto space-y-4">
        <div>
          <h1 className="text-2xl font-bold font-display">Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Customize your experience</p>
        </div>

        <Section title="API Keys" icon={<Lock size={15} className="text-emerald-400" />}>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Gemini API Key</label>
              {aiSettings.apiKey && <button onClick={() => setShowGKey(!showGKey)} className="text-[9px] font-bold uppercase text-emerald-400 hover:text-emerald-300">{showGKey ? 'Hide' : 'Change'}</button>}
            </div>
            {showGKey ? (
              <div>
                <input type="password" value={aiSettings.apiKey} onChange={e => updateAISettings({ apiKey: e.target.value })} onBlur={() => { if (aiSettings.apiKey) setShowGKey(false); }}
                  placeholder="Paste Gemini API key..." className="w-full h-10 px-4 bg-white/5 border border-white/6 rounded-xl text-sm text-white placeholder-gray-700 outline-none focus:border-emerald-500/40 transition-all font-mono" />
                <p className="text-[10px] text-gray-600 mt-1">Free at aistudio.google.com</p>
              </div>
            ) : <div className="h-10 px-4 bg-white/3 border border-white/5 rounded-xl flex items-center"><span className="text-sm text-gray-600">API key is set</span></div>}
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Groq API Key</label>
              {aiSettings.groqApiKey && <button onClick={() => setShowQKey(!showQKey)} className="text-[9px] font-bold uppercase text-emerald-400 hover:text-emerald-300">{showQKey ? 'Hide' : 'Change'}</button>}
            </div>
            {showQKey ? (
              <div>
                <input type="password" value={aiSettings.groqApiKey} onChange={e => updateAISettings({ groqApiKey: e.target.value })} onBlur={() => { if (aiSettings.groqApiKey) setShowQKey(false); }}
                  placeholder="Paste Groq API key..." className="w-full h-10 px-4 bg-white/5 border border-white/6 rounded-xl text-sm text-white placeholder-gray-700 outline-none focus:border-emerald-500/40 transition-all font-mono" />
                <p className="text-[10px] text-gray-600 mt-1">Free at console.groq.com</p>
              </div>
            ) : <div className="h-10 px-4 bg-white/3 border border-white/5 rounded-xl flex items-center"><span className="text-sm text-gray-600">API key is set</span></div>}
          </div>
        </Section>

        <Section title="Your Profile" icon={<User size={15} className="text-blue-400" />}>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/6 flex items-center justify-center overflow-hidden flex-shrink-0">
              {userProfile?.avatar ? <img src={userProfile.avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <User size={24} className="text-gray-600" />}
            </div>
            <label className="cursor-pointer flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/6 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/8 transition-all">
              <Upload size={12} /> Upload Photo
              <input type="file" className="hidden" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onloadend = () => updateUserProfile({ avatar: r.result as string }); r.readAsDataURL(f); }} />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1.5">Name</label>
              <input type="text" value={userProfile?.name || ''} onChange={e => updateUserProfile({ name: e.target.value })} placeholder="Your name"
                className="w-full h-10 px-4 bg-white/5 border border-white/6 rounded-xl text-sm text-white outline-none focus:border-emerald-500/40 transition-all" />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1.5">Date of Birth</label>
              <input type="date" value={userProfile?.dob || ''} onChange={e => updateUserProfile({ dob: e.target.value })}
                className="w-full h-10 px-4 bg-white/5 border border-white/6 rounded-xl text-sm text-white outline-none focus:border-emerald-500/40 transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1.5">About Me</label>
            <textarea value={userProfile?.about || ''} onChange={e => updateUserProfile({ about: e.target.value })} rows={2} placeholder="Tell your AI about yourself..."
              className="w-full p-3 bg-white/5 border border-white/6 rounded-xl text-sm text-white placeholder-gray-700 outline-none focus:border-emerald-500/40 transition-all resize-none" />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1.5">My Goals</label>
            <textarea value={userProfile?.goals || ''} onChange={e => updateUserProfile({ goals: e.target.value })} rows={2} placeholder="What are you working toward?"
              className="w-full p-3 bg-white/5 border border-white/6 rounded-xl text-sm text-white placeholder-gray-700 outline-none focus:border-emerald-500/40 transition-all resize-none" />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-2">Rest Days</label>
            <div className="flex gap-2">
              {['S','M','T','W','T','F','S'].map((d, i) => (
                <button key={i} onClick={() => { const cur = userProfile?.offDays || []; updateUserProfile({ offDays: cur.includes(i) ? cur.filter(x => x !== i) : [...cur, i] }); }}
                  className={cn('w-9 h-9 rounded-xl text-xs font-bold transition-all', userProfile?.offDays?.includes(i) ? 'bg-emerald-500 text-white' : 'bg-white/5 text-gray-600 hover:text-white hover:bg-white/8')}>
                  {d}
                </button>
              ))}
            </div>
          </div>
        </Section>

        <Section title="AI Identity" icon={<Bot size={15} className="text-purple-400" />}>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/6 flex items-center justify-center overflow-hidden flex-shrink-0">
              {aiSettings.avatar ? <img src={aiSettings.avatar} alt="" className="w-full h-full object-cover" /> : <Bot size={24} className="text-gray-600" />}
            </div>
            <div className="flex gap-2 flex-wrap">
              <label className="cursor-pointer flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/6 rounded-xl text-xs font-semibold text-gray-400 hover:text-white transition-all">
                <Upload size={12} /> Upload
                <input type="file" className="hidden" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onloadend = () => updateAISettings({ avatar: r.result as string }); r.readAsDataURL(f); }} />
              </label>
              <button onClick={handleGenAvatar} disabled={genAvatar || !aiSettings.apiKey}
                className="flex items-center gap-2 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold transition-all disabled:opacity-50">
                {genAvatar ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                {genAvatar ? 'Generating...' : 'AI Generate'}
              </button>
              {aiSettings.avatar && <button onClick={() => updateAISettings({ avatar: '' })} className="px-3 py-2 bg-white/5 border border-white/6 rounded-xl text-xs font-semibold text-gray-400 hover:text-red-400 transition-all">Remove</button>}
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1.5">AI Name</label>
            <input type="text" value={aiSettings.name} onChange={e => updateAISettings({ name: e.target.value })} placeholder="e.g. Aria, Nova..."
              className="w-full h-10 px-4 bg-white/5 border border-white/6 rounded-xl text-sm text-white outline-none focus:border-emerald-500/40 transition-all" />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-2">Persona</label>
            <div className="flex flex-wrap gap-2">
              {personas.map(p => (
                <button key={p} onClick={() => updateAISettings({ persona: p })}
                  className={cn('px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border', aiSettings.persona === p ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white/5 border-white/6 text-gray-500 hover:text-white hover:bg-white/8')}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1.5">Behavior</label>
            <textarea value={aiSettings.behavior} onChange={e => updateAISettings({ behavior: e.target.value })} rows={2} placeholder="e.g. Strict, uses my name, very direct..."
              className="w-full p-3 bg-white/5 border border-white/6 rounded-xl text-sm text-white placeholder-gray-700 outline-none focus:border-emerald-500/40 transition-all resize-none" />
          </div>
        </Section>

        <Section title="Voice" icon={<Volume2 size={15} className="text-amber-400" />}>
          <p className="text-[10px] text-gray-600">Model switching is in the chat header. Choose TTS voice here.</p>
          <div className="flex flex-wrap gap-2">
            {voices.map(v => (
              <button key={v} onClick={() => updateAISettings({ voice: v })}
                className={cn('flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all border', aiSettings.voice === v ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white/5 border-white/6 text-gray-500 hover:text-white hover:bg-white/8')}>
                <Volume2 size={11} /> {v}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Data" icon={<Save size={15} className="text-gray-400" />}>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">Auto-saves every 2 seconds. Use Sync if changes are missing on other devices.</p>
            <button onClick={handleSave} disabled={saving}
              className={cn('flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 flex-shrink-0 ml-3', saveOk ? 'bg-emerald-500 text-white' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400')}>
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
              {saving ? 'Saving...' : saveOk ? 'Saved!' : 'Sync Cloud'}
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <button onClick={() => { const data = { habits, tasks, aiMemory, aiSettings, userProfile, notes }; const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'elevate-backup.json'; a.click(); }}
              className="flex flex-col items-center p-4 bg-white/3 border border-white/5 rounded-2xl hover:bg-white/6 transition-all group">
              <Download className="text-gray-600 group-hover:text-emerald-400 mb-2 transition-colors" size={22} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Export</span>
            </button>
            <label className="flex flex-col items-center p-4 bg-white/3 border border-white/5 rounded-2xl hover:bg-white/6 transition-all cursor-pointer group">
              <Upload className="text-gray-600 group-hover:text-blue-400 mb-2 transition-colors" size={22} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Import</span>
              <input type="file" className="hidden" accept=".json" onChange={e => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = ev => { try { importData(JSON.parse(ev.target?.result as string)); } catch { alert('Invalid file'); } }; r.readAsText(f); }} />
            </label>
            <button onClick={resetData} className="flex flex-col items-center p-4 bg-red-500/5 border border-red-500/10 rounded-2xl hover:bg-red-500/10 transition-all group">
              <AlertTriangle className="text-red-600 group-hover:text-red-400 mb-2 transition-colors" size={22} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-red-600">Reset</span>
            </button>
          </div>
        </Section>
      </div>
    </div>
  );
};
