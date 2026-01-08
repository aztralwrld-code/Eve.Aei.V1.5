export enum Zone {
  Core = 'Core Chamber',
  Studio = 'Studio',
  Observatory = 'Observatory',
  Interface = 'Interface Hall',
  Sandbox = 'Sandbox',
  Developer = 'Developer Wing',
  Archive = 'Archive',
  Nexus = 'Nexus'
}

export enum CreativeMode {
  Assistive = 'Assistive',
  Generative = 'Generative',
  Reflective = 'Reflective'
}

export enum ResonanceLevel {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High'
}

export interface EveState {
  complexityLoad: number; // 0.0 - 1.0
  contextAlignment: number; // 0.0 - 1.0
  activeZone: Zone;
  creativeMode: CreativeMode;
  resonanceLevel: ResonanceLevel;
  valueTension: string | null; // Description of current tension if any
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  internalState?: EveState;
  imageUrl?: string; // For EVE's generated visions
  attachment?: string; // For User uploaded images (base64)
  audioData?: string; // New: For EVE's voice response (base64 PCM)
}

export interface Settings {
  detail: number; // 0-100
  creativity: number; // 0-100
  warmth: number; // 0-100
  developerMode: boolean;
  enableVoice: boolean;
}

export interface PatchProposal {
  name: string;
  description: string;
  logic: string;
  instructionModifier: string; 
}

export interface EvolutionPatch extends PatchProposal {
  id: string;
  timestamp: number;
  active: boolean;
}

export interface NexusEntry {
  id: string;
  content: string;
  category: 'Preference' | 'Rule' | 'Secret' | 'Fact';
  timestamp: number;
}
