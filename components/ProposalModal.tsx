import React from 'react';
import { PatchProposal } from '../types';
import { CircuitBoard, Check, X, ShieldAlert } from 'lucide-react';

interface ProposalModalProps {
  proposal: PatchProposal;
  onAccept: () => void;
  onDeny: () => void;
}

const ProposalModal: React.FC<ProposalModalProps> = ({ proposal, onAccept, onDeny }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-900 border border-violet-500/30 rounded-2xl shadow-2xl shadow-violet-900/20 overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-900/50 to-indigo-900/50 p-4 border-b border-white/10 flex items-center gap-3">
            <CircuitBoard className="text-violet-300 w-6 h-6 animate-pulse" />
            <div>
                <h3 className="text-violet-100 font-bold tracking-wide">SELF-EVOLUTION PROPOSAL</h3>
                <p className="text-violet-300/70 text-xs uppercase font-mono">Core Chamber Requesting Authorization</p>
            </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
            <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Patch Name</span>
                <h2 className="text-xl font-bold text-white mt-1">{proposal.name}</h2>
            </div>

            <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Logic & Reasoning</span>
                <p className="text-slate-300 text-sm leading-relaxed italic">"{proposal.logic}"</p>
            </div>

            <div>
                 <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">System Description</span>
                 <p className="text-slate-400 text-sm mt-1">{proposal.description}</p>
            </div>

            <div className="bg-amber-900/20 p-3 rounded-lg border border-amber-500/20 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                    <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">Core Instruction Modifier</span>
                    <p className="text-amber-200/80 text-xs font-mono mt-1 leading-relaxed">
                        {proposal.instructionModifier}
                    </p>
                </div>
            </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-white/10 flex gap-3 bg-slate-950/30">
            <button 
                onClick={onDeny}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-all flex items-center justify-center gap-2"
            >
                <X size={18} />
                Deny Upgrade
            </button>
            <button 
                onClick={onAccept}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-violet-500/20 transition-all flex items-center justify-center gap-2"
            >
                <Check size={18} />
                Authorize Patch
            </button>
        </div>
      </div>
    </div>
  );
};

export default ProposalModal;