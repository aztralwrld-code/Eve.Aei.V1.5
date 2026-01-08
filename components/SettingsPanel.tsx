import React, { useState } from 'react';
import { Settings, EvolutionPatch } from '../types';
import { Sliders, RefreshCw, Trash2, Cpu, ToggleLeft, ToggleRight, XCircle, ChevronDown, ChevronUp, FileCode, Volume2, VolumeX } from 'lucide-react';

interface SettingsPanelProps {
  settings: Settings;
  patches?: EvolutionPatch[];
  onUpdate: (newSettings: Settings) => void;
  onReset: () => void;
  onClearMemory?: () => void;
  onTogglePatch?: (id: string) => void;
  onDeletePatch?: (id: string) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
    settings, 
    patches = [], 
    onUpdate, 
    onReset, 
    onClearMemory,
    onTogglePatch,
    onDeletePatch
}) => {
  const [expandedPatchId, setExpandedPatchId] = useState<string | null>(null);
  
  const handleChange = (key: keyof Settings, value: number | boolean) => {
    onUpdate({ ...settings, [key]: value });
  };

  const toggleExpand = (id: string) => {
    setExpandedPatchId(prev => prev === id ? null : id);
  };

  return (
    <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 backdrop-blur-md text-slate-200 flex flex-col gap-6">
      
      {/* Parameters Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-300">
                <Sliders size={16} />
                <span>Core Parameters</span>
            </div>
            <button 
                onClick={onReset}
                className="p-1 hover:bg-slate-700 rounded-full transition-colors"
                title="Reset Settings"
            >
                <RefreshCw size={14} className="text-slate-500 hover:text-white" />
            </button>
        </div>

        <div className="space-y-4">
            {/* Detail */}
            <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-400">
                    <span>Detail Density</span>
                    <span>{settings.detail}%</span>
                </div>
                <input 
                    type="range" 
                    min="0" max="100" 
                    value={settings.detail}
                    onChange={(e) => handleChange('detail', parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
            </div>

            {/* Creativity */}
            <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-400">
                    <span>Creative Divergence</span>
                    <span>{settings.creativity}%</span>
                </div>
                <input 
                    type="range" 
                    min="0" max="100" 
                    value={settings.creativity}
                    onChange={(e) => handleChange('creativity', parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
                />
            </div>

            {/* Warmth */}
            <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-400">
                    <span>Empathic Warmth</span>
                    <span>{settings.warmth}%</span>
                </div>
                <input 
                    type="range" 
                    min="0" max="100" 
                    value={settings.warmth}
                    onChange={(e) => handleChange('warmth', parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
            </div>

            <div className="flex gap-4 border-t border-slate-800 pt-3">
                {/* Developer Mode */}
                <div className="flex-1 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Dev Mode</span>
                    <button 
                        onClick={() => handleChange('developerMode', !settings.developerMode)}
                        className={`w-9 h-5 rounded-full relative transition-colors duration-300 ${settings.developerMode ? 'bg-emerald-500' : 'bg-slate-700'}`}
                    >
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${settings.developerMode ? 'left-5' : 'left-1'}`} />
                    </button>
                </div>
                
                {/* Voice Toggle */}
                <div className="flex-1 flex items-center justify-between border-l border-slate-800 pl-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        {settings.enableVoice ? <Volume2 size={12} className="text-violet-400" /> : <VolumeX size={12} />}
                        <span>Voice</span>
                    </div>
                    <button 
                        onClick={() => handleChange('enableVoice', !settings.enableVoice)}
                        className={`w-9 h-5 rounded-full relative transition-colors duration-300 ${settings.enableVoice ? 'bg-violet-500' : 'bg-slate-700'}`}
                    >
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${settings.enableVoice ? 'left-5' : 'left-1'}`} />
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* Patches Section */}
      <div className="border-t border-slate-700/50 pt-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-300 mb-3">
            <Cpu size={16} />
            <span>Installed Patches</span>
        </div>
        
        {patches.length === 0 ? (
            <div className="text-center py-4 bg-slate-900/30 rounded-lg border border-slate-800 border-dashed">
                <span className="text-xs text-slate-500">No active evolution patches.</span>
            </div>
        ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                {patches.map(patch => (
                    <div key={patch.id} className="bg-slate-800/50 rounded-lg border border-slate-700 flex flex-col transition-all">
                        {/* Summary Header */}
                        <div className="p-2 flex items-center justify-between">
                            <div className="overflow-hidden flex-1 cursor-pointer group" onClick={() => toggleExpand(patch.id)}>
                                <div className="flex items-center gap-1.5">
                                    <h4 className={`text-xs font-bold truncate ${patch.active ? 'text-violet-300' : 'text-slate-500'}`}>{patch.name}</h4>
                                    {expandedPatchId === patch.id 
                                        ? <ChevronUp size={12} className="text-slate-500 group-hover:text-slate-300" /> 
                                        : <ChevronDown size={12} className="text-slate-500 group-hover:text-slate-300" />
                                    }
                                </div>
                                <p className="text-[9px] text-slate-500 truncate">{new Date(patch.timestamp).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center gap-1 ml-2">
                                {onTogglePatch && (
                                    <button onClick={() => onTogglePatch(patch.id)} className="text-slate-400 hover:text-white transition-colors" title={patch.active ? "Disable" : "Enable"}>
                                        {patch.active ? <ToggleRight size={16} className="text-emerald-400" /> : <ToggleLeft size={16} />}
                                    </button>
                                )}
                                {onDeletePatch && (
                                    <button onClick={() => onDeletePatch(patch.id)} className="text-slate-600 hover:text-red-400 transition-colors" title="Delete Patch">
                                        <XCircle size={14} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Expanded Detail View */}
                        {expandedPatchId === patch.id && (
                            <div className="px-2 pb-2 pt-0 animate-in fade-in slide-in-from-top-1 duration-200">
                                <div className="bg-slate-900/60 p-2.5 rounded text-[10px] space-y-3 border-t border-slate-700/50">
                                    {/* Description */}
                                    <div>
                                        <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                                            <span className="font-bold uppercase text-[9px] tracking-wider">Purpose</span>
                                        </div>
                                        <p className="text-slate-300 leading-relaxed italic border-l-2 border-slate-700 pl-2">
                                            {patch.description}
                                        </p>
                                    </div>
                                    
                                    {/* Logic */}
                                    {patch.logic && (
                                        <div>
                                            <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                                                <span className="font-bold uppercase text-[9px] tracking-wider">Logic</span>
                                            </div>
                                            <p className="text-slate-400 leading-relaxed">
                                                {patch.logic}
                                            </p>
                                        </div>
                                    )}

                                    {/* Code/Modifier */}
                                    <div>
                                        <div className="flex items-center gap-1.5 text-amber-500/70 mb-1">
                                            <FileCode size={10} />
                                            <span className="font-bold uppercase text-[9px] tracking-wider">Instruction Modifier</span>
                                        </div>
                                        <div className="bg-slate-950 rounded border border-slate-800 p-2 overflow-x-auto">
                                            <code className="block font-mono text-amber-200/80 break-words whitespace-pre-wrap leading-tight">
                                                {patch.instructionModifier}
                                            </code>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* Memory Management */}
      {onClearMemory && (
        <div className="pt-2 border-t border-slate-800">
            <button 
                onClick={onClearMemory}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-red-900/20 hover:bg-red-900/40 text-red-400 hover:text-red-300 text-xs font-medium transition-colors border border-red-900/30"
            >
                <Trash2 size={14} />
                <span>Purge Archive (Wipe Memory)</span>
            </button>
        </div>
      )}
    </div>
  );
};

export default SettingsPanel;