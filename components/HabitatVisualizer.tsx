import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import { EveState, Zone, ResonanceLevel } from '../types';
import { Activity, Brain, Box, Layers, Terminal, Zap, Archive as ArchiveIcon, Network } from 'lucide-react';

interface HabitatVisualizerProps {
  state: EveState;
}

const HabitatVisualizer: React.FC<HabitatVisualizerProps> = ({ state }) => {
  // Map Zone to an index for simple visualization highlighting
  const zones = Object.values(Zone);
  
  const getZoneIcon = (zone: Zone) => {
    switch(zone) {
        case Zone.Core: return <Brain className="w-5 h-5 text-rose-400" />;
        case Zone.Studio: return <Layers className="w-5 h-5 text-violet-400" />;
        case Zone.Observatory: return <Activity className="w-5 h-5 text-cyan-400" />;
        case Zone.Interface: return <Zap className="w-5 h-5 text-yellow-400" />;
        case Zone.Sandbox: return <Box className="w-5 h-5 text-emerald-400" />;
        case Zone.Developer: return <Terminal className="w-5 h-5 text-slate-400" />;
        case Zone.Archive: return <ArchiveIcon className="w-5 h-5 text-orange-400" />;
        case Zone.Nexus: return <Network className="w-5 h-5 text-pink-400" />;
    }
  };

  const getResonanceColor = (level: ResonanceLevel) => {
    switch(level) {
        case ResonanceLevel.High: return 'text-amber-400 shadow-amber-500/50';
        case ResonanceLevel.Medium: return 'text-blue-400 shadow-blue-500/50';
        case ResonanceLevel.Low: return 'text-slate-400 shadow-slate-500/50';
    }
  };

  // Data for the Radar Chart (Visualizing abstract "metrics")
  const chartData = [
    { subject: 'Complexity', A: state.complexityLoad * 100, fullMark: 100 },
    { subject: 'Alignment', A: state.contextAlignment * 100, fullMark: 100 },
    { subject: 'Resonance', A: state.resonanceLevel === 'High' ? 90 : state.resonanceLevel === 'Medium' ? 60 : 30, fullMark: 100 },
  ];

  return (
    <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 backdrop-blur-md flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between border-b border-slate-700/50 pb-2">
        <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase">EVE Habitat State</h2>
        <div className={`text-xs font-mono px-2 py-0.5 rounded-full bg-opacity-20 ${
             state.valueTension && state.valueTension !== "None" ? 'bg-orange-500 text-orange-200 animate-pulse' : 'bg-slate-500 text-slate-300'
        }`}>
            {state.valueTension && state.valueTension !== "None" ? 'TENSION ACTIVE' : 'STABLE'}
        </div>
      </div>

      {/* Zone Indicators */}
      <div className="grid grid-cols-2 gap-2">
        {zones.map((z) => (
            <div 
                key={z} 
                className={`flex items-center gap-2 p-2 rounded-lg transition-all duration-500 ${
                    state.activeZone === z 
                    ? 'bg-slate-800 border border-slate-600 shadow-[0_0_15px_rgba(255,255,255,0.05)]' 
                    : 'bg-slate-900/20 opacity-40 grayscale'
                }`}
            >
                {getZoneIcon(z)}
                <span className="text-[10px] font-medium text-slate-200">{z}</span>
            </div>
        ))}
      </div>

      {/* Metrics Visualization */}
      <div className="flex-1 min-h-[150px] relative w-full">
         <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                name="State Metrics"
                dataKey="A"
                stroke="#8b5cf6"
                strokeWidth={2}
                fill="#8b5cf6"
                fillOpacity={0.3}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', fontSize: '12px', color: '#fff' }}
                itemStyle={{ color: '#c4b5fd' }}
              />
            </RadarChart>
         </ResponsiveContainer>
      </div>

      {/* Text Stats */}
      <div className="space-y-2 mt-auto">
        <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Resonance</span>
            <span className={`font-mono font-bold ${getResonanceColor(state.resonanceLevel)}`}>
                {state.resonanceLevel.toUpperCase()}
            </span>
        </div>
         <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Mode</span>
            <span className="text-indigo-400 font-mono">{state.creativeMode}</span>
        </div>
        {state.valueTension && state.valueTension !== "None" && (
             <div className="mt-2 p-2 bg-orange-900/20 border border-orange-900/50 rounded text-[10px] text-orange-200">
                <span className="block font-bold mb-1 text-orange-400">VALUE TENSION DETECTED</span>
                {state.valueTension}
             </div>
        )}
      </div>
    </div>
  );
};

export default HabitatVisualizer;