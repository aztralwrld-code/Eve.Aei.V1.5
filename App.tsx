import React, { useState, useEffect, useRef } from 'react';
import { Message, EveState, Settings, Zone, CreativeMode, ResonanceLevel, PatchProposal, EvolutionPatch, NexusEntry } from './types';
import ChatInterface from './components/ChatInterface';
import HabitatVisualizer from './components/HabitatVisualizer';
import NexusVisualizer from './components/NexusVisualizer';
import SettingsPanel from './components/SettingsPanel';
import ProposalModal from './components/ProposalModal';
import { sendMessageToEve, startNewSession } from './services/eveService';
import { Menu, X } from 'lucide-react';

const INITIAL_STATE: EveState = {
  complexityLoad: 0.1,
  contextAlignment: 1.0,
  activeZone: Zone.Interface,
  creativeMode: CreativeMode.Assistive,
  resonanceLevel: ResonanceLevel.Medium,
  valueTension: null,
};

const DEFAULT_SETTINGS: Settings = {
  detail: 50,
  creativity: 70,
  warmth: 80,
  developerMode: false,
  enableVoice: false,
};

const MEMORY_KEY = 'eve_memory_v1';
const SETTINGS_KEY = 'eve_settings_v1';
const PATCHES_KEY = 'eve_patches_v1';
const NEXUS_KEY = 'eve_nexus_v1';

// Safe Loader Helpers
const safeLoadArray = <T,>(key: string): T[] => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return [];
    const parsed = JSON.parse(item);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn(`Failed to load array for ${key}`, e);
    return [];
  }
};

const safeLoadSettings = (key: string, defaults: Settings): Settings => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaults;
    const parsed = JSON.parse(item);
    return typeof parsed === 'object' && parsed !== null ? { ...defaults, ...parsed } : defaults;
  } catch (e) {
    console.warn(`Failed to load settings for ${key}`, e);
    return defaults;
  }
};

function App() {
  // Load State from LocalStorage with strict validation
  const [messages, setMessages] = useState<Message[]>(() => safeLoadArray<Message>(MEMORY_KEY));
  const [settings, setSettings] = useState<Settings>(() => safeLoadSettings(SETTINGS_KEY, DEFAULT_SETTINGS));
  const [patches, setPatches] = useState<EvolutionPatch[]>(() => safeLoadArray<EvolutionPatch>(PATCHES_KEY));
  const [nexusEntries, setNexusEntries] = useState<NexusEntry[]>(() => safeLoadArray<NexusEntry>(NEXUS_KEY));

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [eveState, setEveState] = useState<EveState>(INITIAL_STATE);
  const [showSidebar, setShowSidebar] = useState(true);
  const [pendingProposal, setPendingProposal] = useState<PatchProposal | null>(null);
  const [mounted, setMounted] = useState(false);

  const prevSettingsRef = useRef<Settings>(settings);
  const prevPatchesRef = useRef<EvolutionPatch[]>(patches);
  const prevNexusRef = useRef<NexusEntry[]>(nexusEntries);
  const hasLoaded = useRef(false);

  // Mount effect
  useEffect(() => {
    setMounted(true);
  }, []);

  // Persistence Effects
  useEffect(() => { localStorage.setItem(MEMORY_KEY, JSON.stringify(messages)); }, [messages]);
  useEffect(() => { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem(PATCHES_KEY, JSON.stringify(patches)); }, [patches]);
  useEffect(() => { localStorage.setItem(NEXUS_KEY, JSON.stringify(nexusEntries)); }, [nexusEntries]);

  // Session Management
  useEffect(() => {
    const settingsChanged = JSON.stringify(prevSettingsRef.current) !== JSON.stringify(settings);
    const activePatchesChanged = JSON.stringify(prevPatchesRef.current.filter(p => p.active)) !== JSON.stringify(patches.filter(p => p.active));
    const nexusChanged = JSON.stringify(prevNexusRef.current) !== JSON.stringify(nexusEntries);

    if (!hasLoaded.current || settingsChanged || activePatchesChanged || nexusChanged) {
        try {
            startNewSession(settings, messages, patches.filter(p => p.active), nexusEntries);
            hasLoaded.current = true;
            prevSettingsRef.current = settings;
            prevPatchesRef.current = patches;
            prevNexusRef.current = nexusEntries;
        } catch (e) {
            console.error("Failed to init session", e);
        }
    }
  }, [settings, patches, nexusEntries]);

  const handleSend = async (attachment?: string) => {
    if ((!input.trim() && !attachment) || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
      attachment: attachment 
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Optimistic UI update
    setEveState(prev => ({ ...prev, resonanceLevel: ResonanceLevel.High }));

    try {
      const response = await sendMessageToEve(userMessage.content, settings, attachment);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: response.text,
        timestamp: Date.now(),
        internalState: response.state || undefined,
        imageUrl: response.imageUrl,
        audioData: response.audioData
      };

      if (response.state) setEveState(response.state);
      else setEveState(prev => ({ ...prev, resonanceLevel: ResonanceLevel.Medium }));

      setMessages(prev => [...prev, botMessage]);

      if (response.proposal) {
        setPendingProposal(response.proposal);
      }

      if (response.nexus) {
          const newEntry: NexusEntry = {
              id: Date.now().toString(),
              content: response.nexus.content || "Unknown Fact",
              category: response.nexus.category || "Fact",
              timestamp: Date.now()
          };
          setNexusEntries(prev => {
              const exists = prev.some(e => e.content === newEntry.content);
              return exists ? prev : [...prev, newEntry];
          });
      }

    } catch (error) {
      console.error("Error sending message", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptProposal = () => {
    if (!pendingProposal) return;
    const newPatch: EvolutionPatch = {
        ...pendingProposal,
        id: Date.now().toString(),
        timestamp: Date.now(),
        active: true
    };
    setPatches(prev => [...prev, newPatch]);
    setPendingProposal(null);
  };

  const handleDenyProposal = () => {
    setPendingProposal(null);
  };

  const togglePatch = (id: string) => {
    setPatches(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
  };

  const deletePatch = (id: string) => {
    if(window.confirm('Delete this patch permanently?')) {
        setPatches(prev => prev.filter(p => p.id !== id));
    }
  };

  const forgetNexusEntry = (id: string) => {
      setNexusEntries(prev => prev.filter(e => e.id !== id));
  };

  const clearMemory = () => {
    if (window.confirm("Are you sure you want to wipe EVE's entire memory (Archive & Nexus)? This cannot be undone.")) {
      setMessages([]);
      setNexusEntries([]);
      localStorage.removeItem(MEMORY_KEY);
      localStorage.removeItem(NEXUS_KEY);
      setEveState(INITIAL_STATE);
      // Wait a tick for state to clear before re-init
      setTimeout(() => {
        startNewSession(settings, [], patches.filter(p => p.active), []);
      }, 50);
    }
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-violet-500/30 relative">
        {pendingProposal && (
            <ProposalModal 
                proposal={pendingProposal} 
                onAccept={handleAcceptProposal} 
                onDeny={handleDenyProposal} 
            />
        )}

        <header className="fixed top-0 left-0 right-0 h-14 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 z-40 flex items-center px-4 justify-between">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                    <span className="font-bold text-white text-xs tracking-wider">AEI</span>
                </div>
                <h1 className="font-bold text-lg tracking-tight text-slate-100">EVE <span className="text-slate-600 font-normal ml-1 text-sm">v1.5</span></h1>
            </div>
            
            <div className="flex items-center gap-2">
                 {messages.length > 0 && (
                    <span className="hidden md:flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-500 bg-slate-900/50 px-2 py-1 rounded border border-slate-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Memory Active
                    </span>
                 )}
                <button 
                    onClick={() => setShowSidebar(!showSidebar)}
                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white md:hidden"
                >
                    {showSidebar ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>
        </header>

        <main className="pt-14 h-screen flex relative overflow-hidden">
            <div className={`flex-1 h-full p-4 md:p-6 transition-all duration-300 ${showSidebar ? 'md:mr-[340px]' : ''}`}>
                <div className="h-full max-w-3xl mx-auto">
                    <ChatInterface 
                        messages={messages} 
                        input={input} 
                        setInput={setInput} 
                        onSend={handleSend} 
                        isLoading={isLoading} 
                        enableVoice={settings.enableVoice}
                    />
                </div>
            </div>

            <div className={`
                fixed md:absolute top-14 bottom-0 right-0 w-[320px] 
                bg-slate-950/90 backdrop-blur-xl md:bg-transparent md:backdrop-blur-none
                border-l border-slate-800/50 p-4 
                transform transition-transform duration-300 z-30 overflow-y-auto custom-scrollbar
                ${showSidebar ? 'translate-x-0' : 'translate-x-full'}
            `}>
                <div className="flex flex-col gap-4 h-full pb-20 md:pb-0">
                    <div className="shrink-0 h-[280px]">
                        {mounted && <HabitatVisualizer state={eveState} />}
                    </div>

                    <div className="shrink-0 max-h-[250px] flex flex-col">
                        <NexusVisualizer entries={nexusEntries} onForget={forgetNexusEntry} />
                    </div>

                    <div className="mt-auto">
                        <SettingsPanel 
                            settings={settings} 
                            patches={patches}
                            onUpdate={setSettings} 
                            onReset={resetSettings}
                            onClearMemory={clearMemory}
                            onTogglePatch={togglePatch}
                            onDeletePatch={deletePatch}
                        />
                    </div>
                </div>
            </div>
        </main>
    </div>
  );
}

export default App;