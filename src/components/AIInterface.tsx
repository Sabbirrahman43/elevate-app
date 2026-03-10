import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { GoogleGenAI, Modality, Type, FunctionDeclaration } from "@google/genai";
import { Send, Bot, User, Volume2, Mic, Brain, Trash2, Plus, Info, Heart, Edit2, RotateCcw, Search, Calendar, MessageCircle, Copy, Check, Paperclip, X, Loader2, Image as ImageIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

type Message = { id: string; role: 'user' | 'assistant'; content: string; timestamp: Date; };

// Typewriter hook — reveals text char by char
const useTypewriter = (text: string, active: boolean, speed = 8) => {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!active) { setDisplayed(text); setDone(true); return; }
    setDisplayed('');
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { setDone(true); clearInterval(interval); }
    }, speed);
    return () => clearInterval(interval);
  }, [text, active]);
  return { displayed, done };
};

const TypewriterMessage = ({ content, isNew }: { content: string; isNew: boolean }) => {
  const { displayed } = useTypewriter(content, isNew, 6);
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0.5">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayed}</ReactMarkdown>
    </div>
  );
};

export const AIInterface: React.FC = () => {
  const { habits, tasks, aiMemory, aiSettings, userProfile, chatHistory, setChatHistory, clearChatHistory, addMemory, deleteMemory, updateAISettings, addTask, deleteTask, toggleTask, addHabit, deleteHabit, toggleHabitLog, incrementMessageCount } = useAppContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showMemory, setShowMemory] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);
  const [isGeneratingVoice, setIsGeneratingVoice] = useState<string | null>(null);
  const [autoPlay, setAutoPlay] = useState(() => localStorage.getItem('elevate_autoplay') === 'true');
  const [bgImage, setBgImage] = useState<string | null>(() => localStorage.getItem('elevate_ai_bg') || null);
  const [bgType, setBgType] = useState<'image' | 'video'>(() => (localStorage.getItem('elevate_ai_bg_type') as any) || 'image');
  const [latestAiId, setLatestAiId] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editInput, setEditInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<{ name: string, content: string } | null>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SR) {
      recognitionRef.current = new SR();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.onresult = (e: any) => { setInput(p => p + (p ? ' ' : '') + e.results[0][0].transcript); setIsListening(false); };
      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  useEffect(() => {
    if (chatHistory.length > 0) {
      setMessages(chatHistory.map(m => ({ ...m, timestamp: new Date(m.timestamp) })));
    } else {
      setMessages([{
        id: 'welcome-msg', role: 'assistant',
        content: `Hello! I'm **${aiSettings.name}**, your **${aiSettings.persona}**.\n\n**To get started:**\n- Go to **Settings** → add your **Gemini API Key** (free at aistudio.google.com)\n- Fill in your **Profile** so I know your goals\n- Ask me to add habits or tasks directly here\n- Use 🎙️ for voice input\n\nHow can I help you today?`,
        timestamp: new Date()
      }]);
    }
  }, [chatHistory, aiSettings.name, aiSettings.persona]);

  useEffect(() => {
    if (messages.length > 0) {
      const h = messages.map(m => ({ ...m, timestamp: m.timestamp.toISOString() }));
      if (JSON.stringify(h) !== JSON.stringify(chatHistory)) setChatHistory(h);
    }
  }, [messages, setChatHistory]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  // Auto-play voice when new AI message arrives
  useEffect(() => {
    if (autoPlay && latestAiId && aiSettings.apiKey) {
      const msg = messages.find(m => m.id === latestAiId);
      if (msg) speak(msg.content, msg.id);
    }
  }, [latestAiId, autoPlay]);

  const generateSystemInstruction = () => {
    const habitsList = habits.map(h => `- ${h.name} (ID: ${h.id})`).join('\n');
    const tasksList = tasks.map(t => `- ${t.name} (ID: ${t.id}, Date: ${t.date}, Done: ${t.completed})`).join('\n');
    const memoryList = aiMemory.map(m => `- ${m.content}`).join('\n');
    let userCtx = `Name: ${userProfile?.name || 'User'}\n`;
    if (userProfile?.about) userCtx += `About: ${userProfile.about}\n`;
    if (userProfile?.goals) userCtx += `Goals: ${userProfile.goals}\n`;
    return `You are ${aiSettings.name}, a highly intelligent and emotionally aware ${aiSettings.persona}.
Mode: ${aiSettings.mode.toUpperCase()}
Behavior: ${aiSettings.behavior}
USER: ${userCtx}
HABITS:\n${habitsList || 'None'}
TASKS:\n${tasksList || 'None'}
MEMORY:\n${memoryList || 'None'}
Today: ${format(new Date(), 'yyyy-MM-dd')}
RULES:
- Be natural, warm, human. Never say "As an AI".
- Use clean Markdown: bold for emphasis, bullets for lists.
- Keep responses concise unless depth is needed.
- You can manage tasks and habits using tools.
- Prioritize mental wellbeing.`;
  };

  const handleSend = async (overrideInput?: string, resendFromIndex?: number) => {
    const messageText = overrideInput || input;
    if (!messageText.trim() && !attachedFile) return;
    if (!aiSettings.apiKey) return;
    let newMessages = [...messages];
    if (resendFromIndex !== undefined) newMessages = newMessages.slice(0, resendFromIndex);
    const fullContent = attachedFile ? `[File: ${attachedFile.name}]\n${attachedFile.content}\n\nUser: ${messageText}` : messageText;
    const userMessage: Message = { id: `u-${Date.now()}`, role: 'user', content: fullContent, timestamp: new Date() };
    const updatedMessages = [...newMessages, userMessage];
    setMessages(updatedMessages);
    setInput(''); setAttachedFile(null); setEditingMessageId(null); setIsLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: aiSettings.apiKey });
      const toolDeclarations: FunctionDeclaration[] = [
        { name: "addTask", description: "Add a task", parameters: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, date: { type: Type.STRING } }, required: ["name", "date"] } },
        { name: "deleteTask", description: "Delete a task", parameters: { type: Type.OBJECT, properties: { id: { type: Type.STRING } }, required: ["id"] } },
        { name: "toggleTask", description: "Toggle task", parameters: { type: Type.OBJECT, properties: { id: { type: Type.STRING } }, required: ["id"] } },
        { name: "addHabit", description: "Add a habit", parameters: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, category: { type: Type.STRING }, icon: { type: Type.STRING } }, required: ["name", "category", "icon"] } },
        { name: "deleteHabit", description: "Delete a habit", parameters: { type: Type.OBJECT, properties: { id: { type: Type.STRING } }, required: ["id"] } },
        { name: "toggleHabitLog", description: "Log habit for date", parameters: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, date: { type: Type.STRING } }, required: ["id", "date"] } },
      ];
      const response = await ai.models.generateContent({
        model: aiSettings.model || "gemini-1.5-flash",
        contents: updatedMessages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
        config: { systemInstruction: generateSystemInstruction(), tools: [{ functionDeclarations: toolDeclarations }] }
      });
      const functionCalls = response.functionCalls;
      if (functionCalls) {
        for (const call of functionCalls) {
          const { name, args } = call;
          if (name === 'addTask') addTask(args.name as string, args.date as string);
          if (name === 'deleteTask') deleteTask(args.id as string);
          if (name === 'toggleTask') toggleTask(args.id as string);
          if (name === 'addHabit') addHabit(args.name as string, args.category as string, args.icon as string);
          if (name === 'deleteHabit') deleteHabit(args.id as string);
          if (name === 'toggleHabitLog') toggleHabitLog(args.id as string, args.date as string);
        }
      }
      const aiContent = response.text || (functionCalls ? "Done! ✅" : "Couldn't process that. Please try again.");
      const newId = `a-${Date.now()}`;
      setMessages(prev => [...prev, { id: newId, role: 'assistant', content: aiContent, timestamp: new Date() }]);
      setLatestAiId(newId);
      incrementMessageCount();
      if (aiContent.length > 100 || messageText.includes('remember')) {
        addMemory(`User: "${messageText.substring(0, 60)}..." → AI: "${aiContent.substring(0, 60)}..."`, 'auto');
      }
    } catch (error: any) {
      setMessages(prev => [...prev, { id: `err-${Date.now()}`, role: 'assistant', content: `⚠️ ${error.message || "Failed to connect. Check your API key in Settings."}`, timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const stopSpeaking = () => {
    audioSourceRef.current?.stop();
    audioSourceRef.current = null;
    setIsSpeaking(null);
    setIsGeneratingVoice(null);
  };

  const speak = async (text: string, msgId: string) => {
    if (isSpeaking === msgId) { stopSpeaking(); return; }
    if (!aiSettings.apiKey) return;
    stopSpeaking();
    setIsGeneratingVoice(msgId);
    // Strip markdown for cleaner TTS
    const cleanText = text.replace(/[#*`_~\[\]()>]/g, '').replace(/\n+/g, ' ').substring(0, 800);
    try {
      const ai = new GoogleGenAI({ apiKey: aiSettings.apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: cleanText }] }],
        config: { responseModalities: [Modality.AUDIO], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: aiSettings.voice || 'Zephyr' } } } },
      });
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const bytes = Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0));
        if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        const ctx = audioContextRef.current;
        let audioBuffer: AudioBuffer;
        try { audioBuffer = await ctx.decodeAudioData(bytes.buffer.slice(0)); }
        catch {
          const pcm = new Int16Array(bytes.buffer);
          const f32 = new Float32Array(pcm.length);
          for (let i = 0; i < pcm.length; i++) f32[i] = pcm[i] / 32768;
          audioBuffer = ctx.createBuffer(1, f32.length, 24000);
          audioBuffer.getChannelData(0).set(f32);
        }
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.onended = () => { setIsSpeaking(null); audioSourceRef.current = null; };
        audioSourceRef.current = source;
        setIsGeneratingVoice(null);
        setIsSpeaking(msgId);
        source.start(0);
      } else { setIsGeneratingVoice(null); }
    } catch { setIsGeneratingVoice(null); }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try { await navigator.clipboard.writeText(text); setCopiedId(id); setTimeout(() => setCopiedId(null), 2000); } catch {}
  };

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith('video/');
    const reader = new FileReader();
    reader.onload = ev => {
      const url = ev.target?.result as string;
      setBgImage(url);
      setBgType(isVideo ? 'video' : 'image');
      localStorage.setItem('elevate_ai_bg', url);
      localStorage.setItem('elevate_ai_bg_type', isVideo ? 'video' : 'image');
    };
    reader.readAsDataURL(file);
  };

  const removeBg = () => { setBgImage(null); localStorage.removeItem('elevate_ai_bg'); localStorage.removeItem('elevate_ai_bg_type'); };

  const toggleAutoPlay = () => {
    const next = !autoPlay;
    setAutoPlay(next);
    localStorage.setItem('elevate_autoplay', String(next));
  };

  const modes = [
    { id: 'chat', icon: MessageCircle, label: 'Chat' },
    { id: 'research', icon: Search, label: 'Research' },
    { id: 'supporter', icon: Heart, label: 'Support' },
    { id: 'planner', icon: Calendar, label: 'Planner' },
  ] as const;

  return (
    <div className="flex h-full transition-colors relative">
      {/* Background */}
      {bgImage && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          {bgType === 'video' ? (
            <video src={bgImage} autoPlay loop muted playsInline className="w-full h-full object-cover" />
          ) : (
            <img src={bgImage} alt="" className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Header */}
        <header className={cn("border-b px-3 md:px-6 py-2 md:py-3 flex items-center justify-between gap-2 z-10 transition-colors",
          bgImage ? "bg-black/40 border-white/10 backdrop-blur-md" : "bg-white dark:bg-[#141414] border-black/5 dark:border-white/5")}>
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 overflow-hidden flex-shrink-0">
              {aiSettings.avatar ? <img src={aiSettings.avatar} alt="" className="w-full h-full object-cover" /> : <Bot size={18} />}
            </div>
            <div className="min-w-0">
              <h2 className={cn("font-bold text-sm truncate", bgImage && "text-white")}>{aiSettings.name}</h2>
              <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />{aiSettings.mode}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <div className={cn("flex p-0.5 rounded-xl overflow-x-auto no-scrollbar max-w-[140px] sm:max-w-none", bgImage ? "bg-white/10" : "bg-gray-100 dark:bg-white/5")}>
              {modes.map(mode => (
                <button key={mode.id} onClick={() => updateAISettings({ mode: mode.id })}
                  className={cn("flex items-center gap-1 px-2 py-1.5 rounded-lg transition-all text-[9px] font-bold uppercase tracking-widest flex-shrink-0",
                    aiSettings.mode === mode.id ? "bg-white dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-sm" : cn("text-gray-400", bgImage && "text-white/50"))}>
                  <mode.icon size={11} /><span className="hidden sm:inline">{mode.label}</span>
                </button>
              ))}
            </div>

            {/* Auto-play toggle */}
            <button onClick={toggleAutoPlay} title={autoPlay ? "Auto-play ON" : "Auto-play OFF"}
              className={cn("p-1.5 rounded-xl transition-all text-xs font-bold", autoPlay ? "bg-emerald-500 text-white" : cn("text-gray-400", bgImage ? "bg-white/10 hover:bg-white/20" : "bg-gray-100 dark:bg-white/5"))}>
              <Volume2 size={15} />
            </button>

            {/* Background image button */}
            <input type="file" ref={bgInputRef} onChange={handleBgUpload} className="hidden" accept="image/*,video/*" />
            <button onClick={() => bgImage ? removeBg() : bgInputRef.current?.click()} title={bgImage ? "Remove background" : "Set background image"}
              className={cn("p-1.5 rounded-xl transition-all", bgImage ? "bg-purple-500 text-white" : cn("text-gray-400", bgImage ? "bg-white/10" : "bg-gray-100 dark:bg-white/5"))}>
              <ImageIcon size={15} />
            </button>

            <button onClick={() => { if (confirm("Clear chat?")) clearChatHistory(); }}
              className={cn("p-1.5 rounded-xl transition-all text-gray-400 hover:text-red-500", bgImage ? "bg-white/10 hover:bg-red-500/20" : "bg-gray-100 dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-500/10")}>
              <Trash2 size={15} />
            </button>
            <button onClick={() => setShowMemory(!showMemory)}
              className={cn("p-1.5 rounded-xl transition-all", showMemory ? "bg-emerald-500 text-white" : cn("text-gray-400", bgImage ? "bg-white/10" : "bg-gray-100 dark:bg-white/5"))}>
              <Brain size={15} />
            </button>
          </div>
        </header>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4 scroll-smooth pb-28">
          {messages.map((msg, i) => (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} key={msg.id}
              className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-[88%] md:max-w-[80%] flex gap-2 md:gap-3", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                <div className={cn("w-7 h-7 md:w-8 md:h-8 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden",
                  msg.role === 'user' ? "bg-[#141414] dark:bg-white text-white dark:text-black" : "bg-white dark:bg-[#141414] text-emerald-500 border border-black/5 dark:border-white/5",
                  bgImage && msg.role === 'assistant' && "bg-white/20 backdrop-blur-sm border-white/20")}>
                  {msg.role === 'user'
                    ? (userProfile?.avatar ? <img src={userProfile.avatar} alt="" className="w-full h-full object-cover" /> : <User size={14} />)
                    : (aiSettings.avatar ? <img src={aiSettings.avatar} alt="" className="w-full h-full object-cover" /> : <Bot size={14} />)}
                </div>
                <div className="space-y-1 group min-w-0">
                  <div className={cn("px-3 py-2.5 md:px-4 md:py-3 rounded-2xl text-sm leading-relaxed relative",
                    msg.role === 'user'
                      ? cn("rounded-tr-sm", bgImage ? "bg-emerald-500/80 text-white backdrop-blur-sm" : "bg-[#141414] dark:bg-white text-white dark:text-black")
                      : cn("rounded-tl-sm border", bgImage ? "bg-black/40 text-white border-white/10 backdrop-blur-md" : "bg-white dark:bg-[#141414] text-gray-800 dark:text-gray-200 border-black/5 dark:border-white/5"))}>
                    {editingMessageId === msg.id ? (
                      <div className="space-y-3">
                        <textarea value={editInput} onChange={e => setEditInput(e.target.value)}
                          className="w-full bg-transparent border-none focus:ring-0 text-inherit resize-none min-h-[80px] text-sm" autoFocus />
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setEditingMessageId(null)} className="text-[10px] font-bold uppercase px-3 py-1.5 rounded-lg opacity-60">Cancel</button>
                          <button onClick={() => { setMessages(prev => [...prev.slice(0, i)]); handleSend(editInput); setEditingMessageId(null); }}
                            className="text-[10px] font-bold uppercase px-3 py-1.5 bg-emerald-500 text-white rounded-lg">Resend</button>
                        </div>
                      </div>
                    ) : msg.role === 'assistant' ? (
                      <TypewriterMessage content={msg.content} isNew={msg.id === latestAiId} />
                    ) : (
                      <p>{msg.content}</p>
                    )}
                  </div>
                  <div className={cn("flex items-center gap-2 px-1 text-[9px] font-bold uppercase tracking-widest", bgImage ? "text-white/40" : "text-gray-400")}>
                    <span>{format(msg.timestamp, 'HH:mm')}</span>
                    <button onClick={() => copyToClipboard(msg.content, msg.id)} className="hover:text-emerald-500 transition-colors">
                      {copiedId === msg.id ? <Check size={10} /> : <Copy size={10} />}
                    </button>
                    {msg.role === 'assistant' && i > 0 && (
                      <>
                        <button onClick={() => speak(msg.content, msg.id)}
                          className={cn("hover:text-emerald-400 transition-colors flex items-center gap-1", isSpeaking === msg.id && "text-emerald-400")}>
                          {isGeneratingVoice === msg.id ? <Loader2 size={10} className="animate-spin" /> : isSpeaking === msg.id ? <X size={10} /> : <Volume2 size={10} />}
                          {isGeneratingVoice === msg.id && <span>loading...</span>}
                        </button>
                        <button onClick={() => { setMessages(prev => [...prev.slice(0, i)]); handleSend(messages[i-1]?.content); }}
                          className="hover:text-emerald-400 transition-colors"><RotateCcw size={10} /></button>
                      </>
                    )}
                    {msg.role === 'user' && !editingMessageId && (
                      <button onClick={() => { setEditingMessageId(msg.id); setEditInput(msg.content); }} className="hover:text-emerald-400 transition-colors"><Edit2 size={10} /></button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className={cn("px-4 py-3 rounded-2xl rounded-tl-sm border flex items-center gap-1.5",
                bgImage ? "bg-black/40 border-white/10 backdrop-blur-md" : "bg-white dark:bg-[#141414] border-black/5 dark:border-white/5")}>
                {[0, 0.15, 0.3].map((d, i) => <div key={i} className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: `${d}s` }} />)}
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className={cn("p-3 md:p-4 border-t transition-colors relative z-10",
          bgImage ? "bg-black/40 border-white/10 backdrop-blur-md" : "bg-white dark:bg-[#141414] border-black/5 dark:border-white/5")}>
          {!aiSettings.apiKey && (
            <div className="mb-2 p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <Info size={14} /><p className="text-xs font-medium">Add your Gemini API Key in Settings to enable AI.</p>
            </div>
          )}
          {attachedFile && (
            <div className="mb-2 p-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2"><Paperclip size={13} className="text-emerald-500" /><span className="text-xs font-bold text-emerald-600 truncate max-w-[180px]">{attachedFile.name}</span></div>
              <button onClick={() => setAttachedFile(null)} className="text-emerald-400 hover:text-emerald-600"><X size={14} /></button>
            </div>
          )}
          <div className="relative">
            <textarea ref={textareaRef} value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder={`Message ${aiSettings.name}...`} rows={1}
              className={cn("w-full min-h-[48px] max-h-[160px] py-3 pl-4 pr-24 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm resize-none overflow-y-auto transition-all border",
                bgImage ? "bg-white/10 border-white/20 text-white placeholder-white/40 backdrop-blur-sm" : "bg-gray-50 dark:bg-white/5 border-black/5 dark:border-white/5")} />
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <input type="file" ref={fileInputRef} onChange={e => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = ev => setAttachedFile({ name: f.name, content: ev.target?.result as string }); r.readAsText(f); }} className="hidden" accept=".txt,.js,.ts,.tsx,.json,.md" />
              <button onClick={() => fileInputRef.current?.click()} className={cn("p-1.5 transition-colors", bgImage ? "text-white/50 hover:text-white" : "text-gray-400 hover:text-emerald-500")}><Paperclip size={17} /></button>
              <button onClick={() => { if (isListening) { recognitionRef.current?.stop(); } else { try { recognitionRef.current?.start(); setIsListening(true); } catch {} } }}
                className={cn("p-1.5 rounded-xl transition-all", isListening ? "bg-red-500 text-white animate-pulse" : cn(bgImage ? "text-white/50 hover:text-white" : "text-gray-400 hover:text-emerald-500"))}>
                <Mic size={17} />
              </button>
              <button onClick={() => handleSend()} disabled={(!input.trim() && !attachedFile) || !aiSettings.apiKey || isLoading}
                className="p-1.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 disabled:opacity-40 transition-all shadow-lg shadow-emerald-500/20">
                <Send size={17} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Memory Sidebar */}
      <AnimatePresence>
        {showMemory && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowMemory(false)} className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm" />
            <motion.div key="mem" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              className="fixed lg:relative inset-y-0 right-0 w-full sm:w-80 bg-white dark:bg-[#141414] border-l border-black/5 dark:border-white/5 flex flex-col z-50">
              <header className="p-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2"><Brain className="text-emerald-500" size={18} /><h3 className="font-bold">AI Memory</h3></div>
                <div className="flex gap-1">
                  <button onClick={() => addMemory("New memory...")} className="p-1.5 bg-gray-100 dark:bg-white/5 rounded-lg"><Plus size={16} /></button>
                  <button onClick={() => setShowMemory(false)} className="p-1.5 lg:hidden bg-gray-100 dark:bg-white/5 rounded-lg"><X size={16} /></button>
                </div>
              </header>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {aiMemory.length === 0 ? (
                  <div className="text-center py-16 opacity-30"><Brain size={40} className="mx-auto mb-3" /><p className="text-sm font-bold">No memories yet</p></div>
                ) : aiMemory.map(m => (
                  <div key={m.id} className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 group">
                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{m.content}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">{format(new Date(m.date), 'MMM d')} · {m.type}</span>
                      <button onClick={() => deleteMemory(m.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all"><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
