import React from 'react';
import { NexusEntry } from '../types';
import { Network, Trash2, Key, Heart, Shield, Book } from 'lucide-react';

interface NexusVisualizerProps {
  entries: NexusEntry[];
  onForget: (id: string) => void;
}

const NexusVisualizer: React.FC<NexusVisualizerProps> = ({ entries, onForget }) => {
  
  const getIcon = (category: NexusEntry['category']) => {
    switch(category) {
        case 'Preference': return <Heart className="w-3 h-3 text-rose-400" />;
        case 'Rule': return <Shield className="w-3 h-3 text-amber-400" />;
        case 'Secret': return <Key className="w-3 h-3 text-violet-400" />;
        case 'Fact': return <Book className="w-3 h-3 text-blue-400" />;
        default: return <Network className="w-3 h-3 text-slate-400" />;
    }
  };

  return (
    <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 backdrop-blur-md flex flex-col gap-4 h-full">
        <div className="flex items-center justify-between border-b border-slate-700/50 pb-2">
            <div className="flex items-center gap-2">
                <Network size={16} className="text-amber-500" />
                <h2 className="text-xs font-bold tracking-widest text-slate-300 uppercase">Nexus Core</h2>
            </div>
            <span className="text-[10px] font-mono text-slate-500">{entries.length} Truths</span>
        </div>

        {entries.length === 0 ? (
             <div className="flex-1 flex flex-col items-center justify-center text-slate-600 space-y-2 opacity-50">
                <Network size={24} />
                <p className="text-[10px] text-center max-w-[150px]">
                    No truths crystallized yet. Share your preferences or secrets with Eve.
                </p>
             </div>
        ) : (
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1 max-h-[300px]">
                {entries.map(entry => (
                    <div key={entry.id} className="group bg-slate-950/50 border border-slate-800 hover:border-amber-900/50 rounded-lg p-2.5 transition-all">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                                <div className="flex items-center gap-1.5 mb-1">
                                    {getIcon(entry.category)}
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">{entry.category}</span>
                                </div>
                                <p className="text-xs text-slate-300 leading-snug">{entry.content}</p>
                            </div>
                            <button 
                                onClick={() => onForget(entry.id)}
                                className="text-slate-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                title="Forget this Truth"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}
        
        <div className="bg-amber-900/10 border border-amber-900/20 rounded p-2 text-[10px] text-amber-500/60 leading-tight">
            These truths form the foundation of Eve's understanding and persist across sessions.
        </div>
    </div>
  );
};

export default NexusVisualizer;
