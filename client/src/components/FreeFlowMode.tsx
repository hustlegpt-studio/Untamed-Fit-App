import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, Minimize2, Volume2, Mic, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface FreeFlowModeProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Array<{ role: string; content: string }>;
  onSendMessage: (message: string) => void;
  isTyping: boolean;
  isRecording: boolean;
  isListening: boolean;
  onToggleRecording: () => void;
  input: string;
  onInputChange: (value: string) => void;
  personaInfo?: any;
  isAISpeaking?: boolean;
  isUserSpeaking?: boolean;
}

export default function FreeFlowMode({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  isTyping,
  isRecording,
  isListening,
  onToggleRecording,
  input,
  onInputChange,
  personaInfo,
  isAISpeaking = false,
  isUserSpeaking = false
}: FreeFlowModeProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [transcriptVolume, setTranscriptVolume] = useState(0.7);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll transcript
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen && inputRef.current && !isMinimized) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (input.trim() && !isListening) {
      onSendMessage(input);
      onInputChange('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (isFullscreen) {
        setIsFullscreen(false);
      } else if (isMinimized) {
        setIsMinimized(false);
      } else {
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm"
        onKeyDown={handleKeyPress}
      >
        {/* Main Free Flow Container */}
        <motion.div
          className={cn(
            "h-full flex flex-col",
            isFullscreen ? "p-4" : "p-8"
          )}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-white font-bold text-lg">Free Flow Mode</span>
              </div>
              {personaInfo && (
                <span className="text-green-400 text-sm">
                  Trainer KG ({personaInfo.currentName})
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {/* Volume Control */}
              <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full">
                <Volume2 className="w-4 h-4 text-white/80" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={transcriptVolume}
                  onChange={(e) => setTranscriptVolume(parseFloat(e.target.value))}
                  className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              {/* Control Buttons */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className={cn(
            "flex-1 flex gap-6",
            isMinimized && "hidden"
          )}>
            {/* Avatar Panel - Enhanced for Free Flow */}
            <div className="flex-shrink-0">
              <div className={cn(
                "relative w-32 h-32 rounded-2xl border-2 flex items-center justify-center transition-all duration-300",
                isAISpeaking 
                  ? "border-green-500 bg-green-500/10 shadow-green-500/30 shadow-2xl animate-pulse" 
                  : isUserSpeaking
                  ? "border-blue-500 bg-blue-500/10 shadow-blue-500/30 shadow-2xl animate-pulse"
                  : "border-green-500/50 bg-green-500/5 shadow-green-500/30 shadow-lg"
              )}>
                <img
                  src="/logo.png"
                  alt="Trainer KG"
                  className="w-24 h-24 object-contain"
                />
                
                {/* Speaking Indicator */}
                {(isAISpeaking || isUserSpeaking) && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl border-2 animate-pulse"
                    style={{
                      borderColor: isAISpeaking ? '#10b981' : '#3b82f6',
                      boxShadow: `0 0 20px ${isAISpeaking ? '#10b981' : '#3b82f6'}`
                    }}
                    initial={{ scale: 1, opacity: 0 }}
                    animate={{ scale: 1.2, opacity: 1 }}
                    exit={{ scale: 1, opacity: 0 }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  />
                )}
                
                {/* Status Indicator */}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <div className={cn(
                    'w-3 h-3 rounded-full border-2 border-white/80',
                    isAISpeaking ? 'bg-green-500 animate-pulse' : 
                    isUserSpeaking ? 'bg-blue-500 animate-pulse' : 
                    'bg-gray-500'
                  )} />
                </div>
              </div>
            </div>

            {/* Transcript Area */}
            <div className="flex-1 flex flex-col">
              <div className="flex-1 glass-panel rounded-2xl border-green-500/30 bg-green-500/5 overflow-hidden">
                <ScrollArea className="h-full p-6" ref={scrollRef}>
                  <div className="space-y-4">
                    <AnimatePresence initial={false}>
                      {messages.map((msg, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn(
                            "flex gap-3",
                            msg.role === "user" ? "justify-end" : "justify-start"
                          )}
                        >
                          <div className={cn(
                            "max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed",
                            msg.role === "user" 
                              ? "bg-green-500/20 text-green-100 border border-green-500/30 font-semibold" 
                              : "bg-white/10 text-white border border-white/20"
                          )}>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-bold uppercase tracking-wider opacity-70">
                                {msg.role === "user" ? "You" : "Trainer KG"}
                              </span>
                              {msg.role === "assistant" && personaInfo && (
                                <span className="text-xs opacity-60">
                                  ({personaInfo.currentName})
                                </span>
                              )}
                            </div>
                            <div className="text-base">{msg.content}</div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    
                    {/* Typing Indicator */}
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                      >
                        <div className="bg-white/10 border border-white/20 p-4 rounded-2xl flex gap-2">
                          <motion.div 
                            animate={{ opacity: [0, 1, 0] }} 
                            transition={{ repeat: Infinity, duration: 1 }} 
                            className="w-2 h-2 bg-green-500 rounded-full" 
                          />
                          <motion.div 
                            animate={{ opacity: [0, 1, 0] }} 
                            transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} 
                            className="w-2 h-2 bg-green-500 rounded-full" 
                          />
                          <motion.div 
                            animate={{ opacity: [0, 1, 0] }} 
                            transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} 
                            className="w-2 h-2 bg-green-500 rounded-full" 
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Input Area */}
              <div className="mt-4 glass-panel rounded-2xl border-green-500/30 bg-green-500/5 p-4">
                <form onSubmit={handleSend} className="flex gap-3">
                  <Button
                    type="button"
                    onClick={onToggleRecording}
                    className={cn(
                      "p-3 rounded-xl transition-all relative",
                      isRecording 
                        ? "bg-red-500/20 text-red-500 hover:bg-red-500/30 animate-pulse border border-red-500/50" 
                        : "bg-white/10 text-white/80 hover:bg-white/20 border border-white/20"
                    )}
                  >
                    <Mic className="w-5 h-5" />
                    {isRecording && (
                      <div className="absolute inset-0 rounded-xl border-2 border-red-500 animate-ping" />
                    )}
                  </Button>
                  
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => onInputChange(e.target.value)}
                    placeholder={isListening ? "Listening..." : "Speak your mind or type here..."}
                    className={cn(
                      "flex-1 bg-white/10 border-white/20 rounded-xl h-12 text-white placeholder-white/50",
                      isListening && "border-red-500/50 bg-red-500/5"
                    )}
                    disabled={isListening}
                  />
                  
                  <Button
                    type="submit"
                    disabled={!input.trim() || isListening}
                    className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/50 rounded-xl px-6"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </form>
                
                {/* Status Bar */}
                <div className="flex items-center justify-between mt-3 text-xs text-white/60">
                  <div className="flex items-center gap-4">
                    <span>Press ESC to exit</span>
                    {isListening && (
                      <div className="flex items-center gap-2 text-red-400">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        Recording...
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{messages.length} messages</span>
                    <span>•</span>
                    <span>Volume: {Math.round(transcriptVolume * 100)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Minimized State */}
          {isMinimized && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center h-full"
            >
              <div className="glass-panel rounded-2xl border-green-500/30 bg-green-500/5 p-6">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "relative w-20 h-20 rounded-2xl border-2 flex items-center justify-center transition-all duration-300",
                    isAISpeaking 
                      ? "border-green-500 bg-green-500/10 shadow-green-500/30 shadow-2xl animate-pulse" 
                      : isUserSpeaking
                      ? "border-blue-500 bg-blue-500/10 shadow-blue-500/30 shadow-2xl animate-pulse"
                      : "border-green-500/50 bg-green-500/5 shadow-green-500/30 shadow-lg"
                  )}>
                    <img
                      src="/logo.png"
                      alt="Trainer KG"
                      className="w-16 h-16 object-contain"
                    />
                    
                    {/* Minimized Status */}
                    <div className="absolute -top-1 -right-1">
                      <div className={cn(
                        'w-2 h-2 rounded-full',
                        isAISpeaking ? 'bg-green-500 animate-pulse' : 
                        isUserSpeaking ? 'bg-blue-500 animate-pulse' : 
                        'bg-gray-500'
                      )} />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-bold text-lg mb-2">Free Flow Active</p>
                    <p className="text-white/60 text-sm mb-4">
                      {messages.length} messages • {isTyping ? 'AI typing...' : 'Ready'}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => setIsMinimized(false)}
                        className="bg-green-500/20 text-green-400 hover:bg-green-500/30"
                      >
                        Expand
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={onClose}
                        className="border-white/20 text-white/80 hover:bg-white/10"
                      >
                        Exit
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
