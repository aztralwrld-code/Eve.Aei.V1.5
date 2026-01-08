import React, { useRef, useEffect, useState } from 'react';
import { Message, EveState, Zone } from '../types';
import { Send, Sparkles, User, Bot, Loader2, ImageIcon, Mic, ImagePlus, X, Camera } from 'lucide-react';

interface ChatInterfaceProps {
  messages: Message[];
  input: string;
  setInput: (val: string) => void;
  onSend: (attachment?: string) => void;
  isLoading: boolean;
  enableVoice?: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, input, setInput, onSend, isLoading, enableVoice = false }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastSpokenRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, selectedImage, showCamera]);

  // Audio Playback Logic
  useEffect(() => {
    if (!enableVoice) {
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        return;
    }

    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'model' && lastMessage.audioData && lastMessage.id !== lastSpokenRef.current) {
        lastSpokenRef.current = lastMessage.id;
        playAudio(lastMessage.audioData);
    }
  }, [messages, enableVoice]);

  const playAudio = async (base64Audio: string) => {
    try {
        // Safe creation of AudioContext using system defaults
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            audioContextRef.current = new AudioContextClass();
        }

        const ctx = audioContextRef.current;
        if (ctx.state === 'suspended') {
            await ctx.resume();
        }

        const binaryString = atob(base64Audio);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        
        const float32Data = new Float32Array(bytes.length / 2);
        const dataView = new DataView(bytes.buffer);
        
        for (let i = 0; i < float32Data.length; i++) {
            float32Data[i] = dataView.getInt16(i * 2, true) / 32768.0; 
        }

        // Create buffer with the generated rate (24k) - the context (e.g. 48k) will resample
        const buffer = ctx.createBuffer(1, float32Data.length, 24000);
        buffer.getChannelData(0).set(float32Data);

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
    } catch (e) {
        console.error("Audio playback error", e);
    }
  };

  // Camera Logic
  useEffect(() => {
      let stream: MediaStream | null = null;
      if (showCamera) {
          navigator.mediaDevices.getUserMedia({ video: true })
            .then(s => {
                stream = s;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            })
            .catch(err => {
                console.error("Camera access denied", err);
                setShowCamera(false);
            });
      }

      return () => {
          if (stream) {
              stream.getTracks().forEach(track => track.stop());
          }
      };
  }, [showCamera]);

  const capturePhoto = () => {
      if (videoRef.current) {
          const canvas = document.createElement('canvas');
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
              ctx.drawImage(videoRef.current, 0, 0);
              const dataUrl = canvas.toDataURL('image/jpeg');
              setSelectedImage(dataUrl);
              setShowCamera(false);
          }
      }
  };

  // Speech Recognition
  const toggleListening = () => {
    if (isListening) {
        setIsListening(false);
        return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-GB'; 

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInput(input + (input ? ' ' : '') + transcript);
        };
        recognition.start();
    } else {
        alert("Speech recognition is not supported in this browser.");
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setSelectedImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleClearImage = () => {
      setSelectedImage(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSendClick = () => {
      onSend(selectedImage || undefined);
      handleClearImage();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendClick();
    }
  };

  const getStateBadge = (state?: EveState) => {
    if (!state) return null;
    let color = "bg-slate-700 text-slate-300";
    if (state.activeZone === Zone.Studio) color = "bg-violet-900/50 text-violet-200 border-violet-700";
    if (state.activeZone === Zone.Core) color = "bg-rose-900/50 text-rose-200 border-rose-700";
    if (state.activeZone === Zone.Observatory) color = "bg-cyan-900/50 text-cyan-200 border-cyan-700";
    
    return (
        <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-transparent ${color} ml-2`}>
            {state.activeZone}
        </span>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-violet-600/10 blur-[100px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 blur-[100px] rounded-full mix-blend-screen" />
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 z-10 custom-scrollbar" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-600 space-y-4">
            <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center border border-slate-800">
                <Sparkles className="text-violet-500 animate-pulse" />
            </div>
            <p className="text-sm font-medium">EVE Online. Habitat Sync Complete.</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? 'order-1' : 'order-2'}`}>
              <div className="flex items-center gap-2 mb-1">
                 {msg.role === 'model' ? (
                     <>
                        <span className="text-xs font-bold text-violet-400 flex items-center">EVE {getStateBadge(msg.internalState)}</span>
                     </>
                 ) : (
                    <span className="text-xs font-bold text-slate-400 ml-auto">YOU</span>
                 )}
              </div>
              
              <div 
                className={`p-3.5 rounded-2xl text-sm md:text-base leading-relaxed whitespace-pre-wrap shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-slate-800 text-slate-100 rounded-tr-none' 
                    : 'bg-slate-900/80 border border-slate-800 text-slate-300 rounded-tl-none backdrop-blur-sm'
                }`}
              >
                {/* User uploaded image */}
                {msg.attachment && (
                    <div className="mb-3 rounded-lg overflow-hidden border border-slate-700">
                        <img src={msg.attachment} alt="Attachment" className="w-full h-auto object-cover max-h-[300px]" />
                    </div>
                )}

                {msg.content}
                
                {/* EVE generated image */}
                {msg.imageUrl && (
                    <div className="mt-3 rounded-lg overflow-hidden border border-violet-500/20 shadow-lg relative group">
                        <img src={msg.imageUrl} alt="Eve's Vision" className="w-full h-auto object-cover max-h-[400px]" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                             <ImageIcon size={14} className="text-violet-300" />
                             <span className="text-[10px] text-violet-100 font-medium">Generated Vision</span>
                        </div>
                    </div>
                )}
              </div>
            </div>
            
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mt-6 shrink-0 ${
                msg.role === 'user' ? 'bg-slate-800 ml-3 order-2' : 'bg-violet-900/20 mr-3 order-1'
            }`}>
                 {msg.role === 'user' ? <User size={14} className="text-slate-400" /> : <Bot size={14} className="text-violet-400" />}
            </div>
          </div>
        ))}

        {isLoading && (
            <div className="flex justify-start">
                 <div className="w-8 h-8 rounded-full bg-violet-900/20 flex items-center justify-center mr-3 mt-1">
                    <Bot size={14} className="text-violet-400" />
                 </div>
                 <div className="flex items-center gap-2 p-3 bg-slate-900/50 rounded-2xl rounded-tl-none border border-slate-800/50">
                     <Loader2 size={16} className="animate-spin text-violet-500" />
                     <span className="text-xs text-slate-500 font-mono animate-pulse">Processing in Core Chamber...</span>
                 </div>
            </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-950/80 backdrop-blur-md border-t border-slate-800 z-10 space-y-3">
        {/* Camera Preview */}
        {showCamera && (
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video shadow-2xl mb-2 max-h-[250px] mx-auto w-full max-w-sm">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                    <button onClick={capturePhoto} className="w-12 h-12 rounded-full border-4 border-white flex items-center justify-center bg-white/20 hover:bg-white/40 transition-all">
                        <div className="w-9 h-9 bg-white rounded-full"></div>
                    </button>
                    <button onClick={() => setShowCamera(false)} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full">
                        <X size={20} />
                    </button>
                </div>
            </div>
        )}

        {/* Attachment Preview */}
        {selectedImage && !showCamera && (
            <div className="relative inline-block">
                <div className="relative rounded-lg overflow-hidden border border-violet-500/50 w-16 h-16 group">
                    <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                        onClick={handleClearImage}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                        <X size={16} className="text-white" />
                    </button>
                </div>
            </div>
        )}

        <div className="relative flex items-center max-w-4xl mx-auto gap-2">
          {/* File Input */}
          <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className={`p-3 rounded-xl transition-colors ${selectedImage ? 'bg-violet-900/30 text-violet-400' : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
            title="Upload Image"
          >
            <ImagePlus size={20} />
          </button>

          {/* Camera Button */}
          <button 
            onClick={() => { setShowCamera(!showCamera); handleClearImage(); }}
            className={`p-3 rounded-xl transition-colors ${showCamera ? 'bg-violet-900/30 text-violet-400' : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
            title="Open Camera"
          >
            <Camera size={20} />
          </button>

           {/* Mic Input */}
           <button 
            onClick={toggleListening}
            className={`p-3 rounded-xl transition-all ${isListening ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-900/50' : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
            title="Voice Input"
          >
            <Mic size={20} />
          </button>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Listening..." : "Message EVE..."}
            rows={1}
            className="flex-1 bg-slate-900 border border-slate-800 text-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 resize-none overflow-hidden custom-scrollbar"
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
          <button
            onClick={handleSendClick}
            disabled={isLoading || (!input.trim() && !selectedImage)}
            className="p-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-600/20"
          >
            <Send size={20} />
          </button>
        </div>
        <div className="text-center">
           <p className="text-[10px] text-slate-600">EVE can make mistakes. Value tensions are simulated.</p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;