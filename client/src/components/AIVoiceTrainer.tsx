import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Send, Loader2, Sparkles } from "lucide-react";
import { useVoiceRecorder } from "../../replit_integrations/audio/useVoiceRecorder";
import { useAIWorkoutAgent, useResetConversation } from "@/hooks/use-ai-workout-agent";
import { useAuth } from "@/hooks/use-auth";
import { useUserWorkoutSessions } from "@/hooks/use-user-workout-sessions";
import { useQueryClient } from "@tanstack/react-query";

interface AIVoiceTrainerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIVoiceTrainer({ isOpen, onClose }: AIVoiceTrainerProps) {
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split("T")[0]);
  const [aiResponse, setAiResponse] = useState<any>(null);
  type ConversationMessage = {
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
};

const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  
  const { state: recordingState, startRecording, stopRecording } = useVoiceRecorder();
  const { data: user } = useAuth();
  const userId = user?.id || 1;
  
  const aiMutation = useAIWorkoutAgent();
  const resetMutation = useResetConversation();
  const queryClient = useQueryClient();
  const { refetch: refetchWorkouts } = useUserWorkoutSessions();
  
  // TTS state
  const [isTTSEnabled, setIsTTSEnabled] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [ttsError, setTTSError] = useState<string | null>(null);

  // Auto-scroll to latest message
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [conversationHistory]);

  const handleVoiceRecord = async () => {
    if (recordingState === "recording") {
      const audioBlob = await stopRecording();
      setIsProcessing(true);
      
      try {
        // Convert audio to text using real STT API
        const transcript = await transcribeAudioWithGroq(audioBlob);
        setTranscript(transcript);
        
        // Add to conversation history
        const newMessage = {
          type: 'user' as const,
          content: transcript,
          timestamp: new Date()
        };
        setConversationHistory(prev => [...prev, newMessage]);
        
        // Send to AI agent
        const response = await aiMutation.mutateAsync({ 
          message: transcript, 
          targetDate 
        });
        
        setAiResponse(response);
        
        // Add AI response to conversation
        const aiMessage = {
          type: 'ai' as const,
          content: response.message,
          timestamp: new Date()
        };
        setConversationHistory(prev => [...prev, aiMessage]);
        
        // Refresh workouts if plan was generated
        if (response.completed && response.plan) {
          refetchWorkouts();
        }
        
        setTranscript("");
      } catch (error) {
        console.error("Voice processing error:", error);
        setAiResponse({
          message: "Sorry, I had trouble processing that. Let's try again! 🦁",
          error: true
        });
      } finally {
        setIsProcessing(false);
      }
    } else {
      startRecording();
    }
  };

  const handleTextSubmit = async () => {
    if (!transcript.trim()) return;
    
    setIsProcessing(true);
    
    try {
      const response = await aiMutation.mutateAsync({ 
        message: transcript, 
        targetDate 
      });
      
      setAiResponse(response);
      
      // Add messages to conversation
      const userMessage = {
        type: 'user' as const,
        content: transcript,
        timestamp: new Date()
      };
      const aiMessage = {
        type: 'ai' as const,
        content: response.message,
        timestamp: new Date()
      };
      setConversationHistory(prev => [...prev, userMessage, aiMessage]);
      
      // Play AI response using TTS if enabled
      if (isTTSEnabled && response.message) {
        playAIResponseAudio(response.message);
      }
      
      // Refresh workouts if plan was generated
      if (response.completed && response.plan) {
        refetchWorkouts();
      }
      
      setTranscript("");
    } catch (error) {
      console.error("Text submission error:", error);
      setAiResponse({
        message: "Let me try that again for you! 💪",
        error: true
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetConversation = async () => {
    try {
      await resetMutation.mutateAsync();
      setConversationHistory([]);
      setAiResponse(null);
      setTranscript("");
      setTTSError(null);
    } catch (error) {
      console.error("Reset error:", error);
    }
  };

  // TTS function for AI responses
  const playAIResponseAudio = async (text: string) => {
    if (!text.trim() || !isTTSEnabled) return;
    
    try {
      setIsPlaying(true);
      setTTSError(null);
      
      console.log('🔊 Requesting TTS for AI response...');
      
      const response = await fetch('/api/ai/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          voice: 'alloy' // Natural voice for AI responses
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.audio) {
        console.log(`✅ TTS audio generated (${data.audio.length} bytes)`);
        
        // Convert base64 to blob and play
        const audioBytes = Uint8Array.from(atob(data.audio), c => c.charCodeAt(0));
        const audioBlob = new Blob([audioBytes], { type: 'audio/mp3' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const audio = new Audio(audioUrl);
        audio.play();
        
        audio.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl);
        };
        
      } else {
        throw new Error('No audio received from TTS service');
      }

    } catch (error) {
      console.error('🔊 TTS Error:', error);
      setTTSError(error instanceof Error ? error.message : 'Failed to generate speech');
      setIsPlaying(false);
    }
  };

  // Real speech-to-text using Groq Whisper API
  async function transcribeAudioWithGroq(audioBlob: Blob): Promise<string> {
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        const base64Data = base64Audio.split(',')[1]; // Remove data URL prefix

        try {
          // Call our real STT endpoint
          const response = await fetch('/api/ai/speech-to-text', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              audio: base64Data,
              audioFormat: 'webm' // Browser records in WebM format
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();
          
          if (data.success && data.transcript) {
            console.log(`✅ Real STT transcription: "${data.transcript}"`);
            return data.transcript;
          } else if (data.warning) {
            console.warn('⚠️ STT warning:', data.warning);
            throw new Error('No speech detected in audio');
          } else {
            throw new Error('No transcript received from STT service');
          }

        } catch (apiError) {
          console.error('🎤 STT API error:', apiError);
          const errorMessage = apiError instanceof Error ? apiError.message : 'Failed to transcribe audio';
          throw new Error(errorMessage);
        }
      };

      reader.onerror = () => {
        console.error('🎤 Failed to read audio blob');
        throw new Error('Failed to process recorded audio');
      };

      reader.readAsDataURL(audioBlob);

    } catch (error) {
      console.error('🎤 Transcription error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Transcription failed';
      throw new Error(errorMessage);
    }
  }

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gray-900 rounded-2xl border border-primary/30 p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-full">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">AI Voice Trainer</h2>
                  <p className="text-gray-400 text-sm">Your personal trainer Kevin is here! 🦁</p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                ×
              </Button>
            </div>

            {/* Conversation History */}
            <div className="flex-1 overflow-y-auto mb-4 space-y-3">
              {conversationHistory.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-primary text-white ml-auto'
                        : 'bg-gray-800 text-white'
                    }`}
                  >
                    <div className="text-sm opacity-75 mb-1">
                      {message.type === 'user' ? 'You' : 'Kevin AI'}
                    </div>
                    <div className="text-sm">{message.content}</div>
                  </div>
                </motion.div>
              ))}
              
              {aiResponse && !conversationHistory.find(m => m.type === 'ai' && m.content === aiResponse.message) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="max-w-[80%] px-4 py-3 rounded-2xl bg-gradient-to-r from-primary/20 to-purple-600/20 text-white border border-primary/30">
                    <div className="text-sm opacity-75 mb-1">Kevin AI</div>
                    <div className="text-sm">{aiResponse.message}</div>
                    
                    {aiResponse.plan && (
                      <div className="mt-3 pt-3 border-t border-gray-700">
                        <div className="text-xs opacity-75 mb-2">Generated Workout Plan:</div>
                        <div className="space-y-1">
                          {aiResponse.plan.map((dayPlan: any, dayIndex: number) => (
                            <div key={dayIndex} className="text-xs bg-gray-800/50 rounded p-2">
                              <div className="font-semibold text-primary">{dayPlan.day}</div>
                              <div className="text-gray-300">
                                {dayPlan.workout.name} • {dayPlan.workout.bodyPart} • {dayPlan.workout.sets}×{dayPlan.workout.reps}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
              
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-800 text-white px-4 py-3 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Kevin is thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Controls */}
            <div className="border-t border-gray-700 pt-4 space-y-3">
              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Target Date (optional)
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Text Input */}
              <div>
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Type your message or use voice recording..."
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows={3}
                  disabled={isProcessing}
                />
              </div>

              {/* TTS Toggle */}
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-300">AI Voice:</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    isTTSEnabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-600/20 text-gray-400'
                  }`}>
                    {isTTSEnabled ? 'On' : 'Off'}
                  </span>
                  {isPlaying && (
                    <span className="text-xs text-primary animate-pulse">
                      🔊 Playing...
                    </span>
                  )}
                  {ttsError && (
                    <span className="text-xs text-red-400">
                      ⚠️ {ttsError}
                    </span>
                  )}
                </div>
                <Button
                  onClick={() => setIsTTSEnabled(!isTTSEnabled)}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  {isTTSEnabled ? 'Disable' : 'Enable'} Voice
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={handleTextSubmit}
                  disabled={!transcript.trim() || isProcessing}
                  className="flex-1"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
                
                <Button
                  onClick={handleVoiceRecord}
                  disabled={isProcessing}
                  variant={recordingState === "recording" ? "destructive" : "outline"}
                  className="flex-1"
                >
                  {recordingState === "recording" ? (
                    <>
                      <MicOff className="w-4 h-4 mr-2" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 mr-2" />
                      Start Voice
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={handleResetConversation}
                  disabled={isProcessing}
                  variant="ghost"
                  size="sm"
                >
                  Reset
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
