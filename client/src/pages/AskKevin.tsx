import React, { useState, useRef, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, User, Sparkles, Zap, Mic, Bot, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { WorkoutPreview } from "@/components/WorkoutPreview";
import { StopWatchBox } from "@/components/StopWatchBox";
import AvatarPanel from "@/components/AvatarPanel";
import FreeFlowMode from "@/components/FreeFlowMode";
import { WORKOUTS } from "@/utils/workoutData";
import { isStartPhrase, getRandomQuote } from "@/utils/startPhrases";
import { analyzeUserGoal, getTrainerResponse, getUserFitnessProfile } from "@/utils/aiTrainerLogic";
import { TrendSummaryCard, StrengthTrendSummary, ConsistencyTrendSummary } from "@/components/TrendSummaryCard";
import { recommendWorkout } from "@/utils/workoutEngine";
import { getCurrentUserProfile } from "@/utils/auth";

export default function AskKevin() {
  const [messages, setMessages] = useState<any[]>([
    {
      role: "assistant",
      content: "Hey! I'm KG - your personal fitness coach! I'm here to help you crush your fitness goals. What are we working on today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();
  const [dailyLimit] = useState(5);
  const [usedCount, setUsedCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentWorkout, setCurrentWorkout] = useState<any>(null);
  const [stopwatchActive, setStopwatchActive] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [personaInfo, setPersonaInfo] = useState<any>(null);
  const [profileConfirmed, setProfileConfirmed] = useState(false);
  
  // Voice chat states
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  
  // Avatar panel states
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  
  // Free Flow Mode states
  const [isFreeFlowMode, setIsFreeFlowMode] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Initialize speech recognition
  useEffect(() => {
    const initializeSpeechRecognition = () => {
      // Check for browser support
      const SpeechRecognition = (window as any).SpeechRecognition || 
                               (window as any).webkitSpeechRecognition ||
                               (window as any).mozSpeechRecognition ||
                               (window as any).msSpeechRecognition;
      
      if (!SpeechRecognition) {
        console.warn('Speech recognition not supported in this browser');
        toast({
          title: "Voice Chat Not Supported",
          description: "Your browser doesn't support voice recognition. Try Chrome, Edge, or Firefox.",
          variant: "destructive"
        });
        return;
      }

      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;
      
      recognition.onstart = () => {
        console.log('🎤 Speech recognition started');
        setIsListening(true);
        setIsRecording(true);
        setIsUserSpeaking(true);
      };
      
      recognition.onresult = (event: any) => {
        console.log('🎤 Speech recognition result:', event);
        let transcript = '';
        let isFinal = false;
        
        try {
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
              transcript = result[0].transcript;
              isFinal = true;
              console.log('🎤 Final transcript:', transcript);
            } else if (transcript === '') {
              transcript = result[0].transcript; // Use interim results
              console.log('🎤 Interim transcript:', transcript);
            }
          }
        } catch (error) {
          console.error('🎤 Error processing speech result:', error);
        }
        
        if (transcript) {
          setInput(transcript);
        }
      };
      
      recognition.onerror = (event: any) => {
        console.error('🎤 Speech recognition error:', event.error);
        setIsListening(false);
        setIsRecording(false);
        setIsUserSpeaking(false);
        
        let errorMessage = 'Voice recognition failed';
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please speak clearly and try again.';
            break;
          case 'audio-capture':
            errorMessage = 'Microphone not available. Please check your microphone permissions.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone permission denied. Please allow microphone access and refresh.';
            break;
          case 'network':
            errorMessage = 'Network error. Please check your internet connection.';
            break;
          case 'service-not-allowed':
            errorMessage = 'Speech recognition service not allowed by browser.';
            break;
          default:
            errorMessage = 'Voice recognition failed. Please try again.';
        }
        
        toast({
          title: "Voice Error",
          description: errorMessage,
          variant: "destructive"
        });
      };
      
      recognition.onend = () => {
        console.log('🎤 Speech recognition ended');
        setIsListening(false);
        setIsRecording(false);
        setIsUserSpeaking(false);
      };
      
      recognitionRef.current = recognition;
      console.log('🎤 Speech recognition initialized successfully');
    };

    // Delay initialization to ensure DOM is ready
    const timer = setTimeout(initializeSpeechRecognition, 2000);
    
    return () => {
      clearTimeout(timer);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
          console.log('🎤 Speech recognition cleaned up');
        } catch (error) {
          console.log('🎤 Speech recognition cleanup error:', error);
        }
      }
    };
  }, [toast]);

  // Load persona info on component mount
  useEffect(() => {
    const loadPersonaInfo = async () => {
      try {
        const response = await fetch('/api/kevin-free/persona');
        const data = await response.json();
        if (data.success) {
          setPersonaInfo(data.persona);
        }
      } catch (error) {
        console.error('Failed to load persona info:', error);
      }
    };

    const loadProfileStatus = async () => {
      try {
        // Get current user profile from client-side auth
        const userProfile = getCurrentUserProfile();
        const profileData = userProfile?.profile || {};
        
        // Pass profile data to backend
        const response = await fetch(`/api/kevin-free/profile?profile=${encodeURIComponent(JSON.stringify(profileData))}`);
        const data = await response.json();
        if (data.success) {
          setUserProfile(data.profile.profile);
          setProfileConfirmed(data.profile.isConfirmed);
        }
      } catch (error) {
        console.error('Failed to load profile status:', error);
      }
    };

    loadPersonaInfo();
    loadProfileStatus();
  }, []);

  // Voice chat handlers
  const startRecording = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Voice Chat Not Ready",
        description: "Voice recognition is still initializing. Please wait a moment.",
        variant: "destructive"
      });
      return;
    }

    if (isListening) {
      console.log('Already listening');
      return;
    }

    try {
      console.log('Starting speech recognition...');
      recognitionRef.current.start();
    } catch (error) {
      console.error('Failed to start recognition:', error);
      toast({
        title: "Voice Error",
        description: "Failed to start voice recognition. Please try again.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (!recognitionRef.current || !isListening) {
      return;
    }

    try {
      console.log('Stopping speech recognition...');
      recognitionRef.current.stop();
    } catch (error) {
      console.error('Failed to stop recognition:', error);
    }
  };

  const toggleRecording = () => {
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    
    // Stop recording if active
    if (isListening) {
      stopRecording();
    }
    
    if (usedCount >= dailyLimit) {
      toast({
        title: "Daily Limit Reached",
        description: "Upgrade to PRO for unlimited questions with Kevin!",
        variant: "destructive"
      });
      return;
    }

    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    const userInput = input;
    setInput("");
    setIsTyping(true);
    setIsAISpeaking(true); // AI is about to speak
    setUsedCount(prev => prev + 1);

    try {
      // Call the new free-only AI API
      const response = await fetch('/api/kevin-free/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userInput,
          conversationHistory: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'API returned failure');
      }

      const assistantMsg = { 
        role: "assistant", 
        content: data.response || "I'm here to help you crush your fitness goals!"
      };
      setMessages(prev => [...prev, assistantMsg]);

      // Update persona info if changed
      if (data.personaName && personaInfo?.currentName !== data.personaName) {
        setPersonaInfo(prev => ({ ...prev, currentName: data.personaName }));
      }

      // Update profile confirmation status
      if (data.needsProfileConfirmation && !profileConfirmed) {
        setProfileConfirmed(true);
      }

      // Show toast for profile updates
      if (data.profileUpdated) {
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully!",
          duration: 3000
        });
      }

      // Check if user wants to start a workout (keep existing logic for workout features)
      const userWantsToStart = isStartPhrase(userInput);
      if (userWantsToStart) {
        const quote = getRandomQuote();
        const randomWorkout = WORKOUTS[Math.floor(Math.random() * WORKOUTS.length)];
        setCurrentWorkout(randomWorkout);
        setStopwatchActive(true);
      }

    } catch (error) {
      console.error('AI API Error:', error);
      
      // Show user-friendly error message
      toast({
        title: "AI Service Error",
        description: "Having trouble connecting to the AI. Using backup mode.",
        variant: "destructive"
      });
      
      // Fallback to existing mock logic if AI fails
      setTimeout(() => {
        let responseContent = "That's a solid question! When it comes to fitness, you gotta focus on the 'Mindset Marathon'. Don't just train your muscles, train your will. Keep pushing!";
        
        const userWantsToStart = isStartPhrase(userInput);
        const analysis = analyzeUserGoal(userInput);
        
        if (userWantsToStart) {
          const quote = getRandomQuote();
          responseContent = `${quote}\n\nAlright, let's get to work! I'm setting the stopwatch now. Show me what you got!`;
          const randomWorkout = WORKOUTS[Math.floor(Math.random() * WORKOUTS.length)];
          setCurrentWorkout(randomWorkout);
          setStopwatchActive(true);
        } else if (analysis.detected) {
          // Use the new progress-aware trainer response
          const profile = getCurrentUserProfile();
          const userEmail = profile?.email || 'user@example.com';
          
          // Handle async trainer response
          getTrainerResponse(analysis, userEmail).then(trainerResponse => {
            let finalResponse = trainerResponse;
            
            // Check if it's a traditional workout request
            if (trainerResponse.includes("Before I recommend a workout, let me check your body type and goals.")) {
              const userProfile = getUserFitnessProfile();
              setUserProfile(userProfile);
              
              if (analysis.bodyPart) {
                const recommended = recommendWorkout(analysis.bodyPart, {
                  bodyType: userProfile.bodyType,
                  goals: userProfile.goals,
                  experienceLevel: userProfile.experience
                });
                
                if (recommended) {
                  setCurrentWorkout(recommended);
                  finalResponse = `${trainerResponse}\n\nAlright, based on your profile, I've got a ${recommended.name} workout that fits your body type and experience level. Want me to show it?`;
                } else {
                  finalResponse = `${trainerResponse}\n\nAlright, based on your profile, I've got a workout that fits your body type and experience level. Want me to show it?`;
                }
              } else {
                finalResponse = `${trainerResponse}\n\nAlright, based on your profile, I've got a workout that fits your body type and experience level. Want me to show it?`;
              }
            }
            
            // Add progress dashboard link for progress-related responses
            if (analysis.intent && (analysis.intent === 'progress_review' || analysis.intent === 'exercise_history' || analysis.intent === 'consistency_check' || analysis.intent === 'trend_analysis')) {
              finalResponse += '\n\n📊 **Want to see your full progress dashboard?** [Click here to view detailed charts and analytics](/progress-dashboard)';
            }
            
            const assistantMsg = { 
              role: "assistant", 
              content: finalResponse
            };
            setMessages(prev => [...prev, assistantMsg]);
          }).catch(error => {
            console.error('Error in progress-aware trainer response:', error);
            // Fallback to basic response
            const assistantMsg = { 
              role: "assistant", 
              content: "I'm here to help you crush your fitness goals! What specific aspect would you like to focus on?"
            };
            setMessages(prev => [...prev, assistantMsg]);
          });
          
          // Don't set responseContent here since we're handling it async
          return;
        }
        
        const assistantMsg = { 
          role: "assistant", 
          content: responseContent
        };
        setMessages(prev => [...prev, assistantMsg]);
      }, 1000);
    }
    
    setIsTyping(false);
    setIsAISpeaking(false); // AI finished speaking
  };

  return (
    <Layout>
      <header className="mb-6 pt-4 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <img src="/logo.png" alt="Untamed Fit" className="h-12 w-12 object-contain" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display text-white uppercase">
            COACHING FROM <span className="text-primary text-glow">KG</span>
          </h1>
          <p className="text-silver mt-2 uppercase tracking-widest text-xs">Trainer Kevin • 24/7 Motivation</p>
        </div>
        <div className="glass-panel px-4 py-2 rounded-full border-primary/20 flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-bold text-white tracking-widest uppercase">{usedCount}/{dailyLimit} FREE</span>
          {personaInfo && (
            <span className="text-[8px] text-primary/60 ml-2">
              ({personaInfo.currentName})
            </span>
          )}
        </div>
        <Button
          onClick={() => setIsFreeFlowMode(true)}
          className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/50 rounded-full px-4 py-2 flex items-center gap-2"
        >
          <Maximize2 className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Free Flow</span>
        </Button>
      </header>

      <div className="glass-panel rounded-3xl flex flex-col h-[calc(100vh-320px)] min-h-[400px] overflow-hidden border border-white/5 shadow-2xl">
        <ScrollArea className="flex-1 p-6" ref={scrollRef}>
          <div className="space-y-6">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div className={cn("flex gap-3 max-w-[85%]", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0 overflow-hidden",
                      msg.role === "user" ? "bg-white/10" : "bg-primary/20 border border-primary/30"
                    )}>
                      {msg.role === "user" ? <User className="w-4 h-4" /> : <img src="/logo.png" alt="Trainer KG" className="w-full h-full object-contain" />}
                    </div>
                    <div className="relative">
                      <div className={cn(
                        "p-4 rounded-2xl text-sm leading-relaxed",
                        msg.role === "user" 
                        ? "bg-primary text-primary-foreground font-semibold rounded-tr-sm" 
                        : "bg-white/5 text-silver border border-white/5 rounded-tl-sm"
                      )}>
                        {msg.content}
                      </div>
                      {msg.role === "assistant" && (
                        <div className="absolute -top-2 -right-12 text-xs text-primary/60 font-semibold bg-black/80 px-2 py-1 rounded">
                          Trainer KG
                          {personaInfo?.currentName && personaInfo.currentName !== 'KG' && (
                            <span className="ml-1 text-primary/80">({personaInfo.currentName})</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center overflow-hidden">
                    <img src="/logo.png" alt="Trainer KG" className="w-full h-full object-contain" />
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl flex gap-1">
                    <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                    <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                    <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-white/10 bg-black/20">
          <form onSubmit={handleSend} className="flex gap-2 max-w-4xl mx-auto">
            <button 
              type="button" 
              onClick={toggleRecording}
              className={cn(
                "p-3 rounded-xl transition-colors relative",
                isRecording 
                  ? "bg-red-500/20 text-red-500 hover:bg-red-500/30 animate-pulse" 
                  : "bg-white/5 text-muted-foreground hover:bg-primary/20 hover:text-primary"
              )}
            >
              <Mic className="w-6 h-6" />
              {isRecording && (
                <div className="absolute inset-0 rounded-xl border-2 border-red-500 animate-ping" />
              )}
            </button>
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Listening..." : "Ask Kevin anything..."} 
              className={cn(
                "flex-1 bg-white/5 border-white/10 rounded-xl h-12 focus-visible:ring-primary text-white",
                isListening && "border-red-500/50 bg-red-500/5"
              )}
            />
            <Button 
              type="submit"
              disabled={!input.trim() || isListening}
              className="bg-primary text-primary-foreground hover:bg-primary/80 rounded-xl w-12 h-12 p-0"
            >
              <Send className="w-5 h-5" />
            </Button>
          </form>
          <div className="flex items-center justify-between mt-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 text-primary" /> Powered by Free AI
            </p>
            {isListening && (
              <div className="flex items-center gap-2 text-xs text-red-500">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                Recording...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Workout Preview and Stopwatch */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <WorkoutPreview workout={currentWorkout} />
        </div>
        <div>
          <StopWatchBox isActive={stopwatchActive} currentWorkout={currentWorkout} />
        </div>
      </div>
      
      {usedCount >= dailyLimit && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-accent/20 border border-accent/30 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div className="text-center md:text-left">
            <p className="text-white font-bold uppercase tracking-wider">Unlock Unlimited Knowledge</p>
            <p className="text-silver text-xs uppercase tracking-tight">Daily limit reached. Get unlimited AI coaching with Untamed PRO.</p>
          </div>
          <Button className="bg-accent text-white hover:bg-accent/80 rounded-full font-bold uppercase tracking-widest px-8">Upgrade Now</Button>
        </motion.div>
      )}
      
      {/* Avatar Panel */}
      <AvatarPanel 
        isSpeaking={isAISpeaking}
        isUserSpeaking={isUserSpeaking}
      />
      
      {/* Free Flow Mode */}
      <FreeFlowMode
        isOpen={isFreeFlowMode}
        onClose={() => setIsFreeFlowMode(false)}
        messages={messages}
        onSendMessage={(message) => {
          // Create a synthetic message send
          const userMsg = { role: "user", content: message };
          setMessages(prev => [...prev, userMsg]);
          setInput("");
          setIsTyping(true);
          setIsAISpeaking(true);
          setUsedCount(prev => prev + 1);

          // Call the AI API
          fetch('/api/kevin-free/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message,
              conversationHistory: messages.map(msg => ({
                role: msg.role,
                content: msg.content
              }))
            }),
          }).then(response => response.json())
            .then(data => {
              if (data.success) {
                const assistantMsg = { role: "assistant", content: data.response };
                setMessages(prev => [...prev, assistantMsg]);
                
                // Update persona if changed
                if (data.personaName && personaInfo?.currentName !== data.personaName) {
                  setPersonaInfo(prev => ({ ...prev, currentName: data.personaName }));
                }
              }
            })
            .catch(error => {
              console.error('AI API Error:', error);
              // Fallback response
              setTimeout(() => {
                const fallbackMsg = { 
                  role: "assistant", 
                  content: "Let's crush your fitness goals! What are we working on today?" 
                };
                setMessages(prev => [...prev, fallbackMsg]);
              }, 1500);
            })
            .finally(() => {
              setIsTyping(false);
              setIsAISpeaking(false);
            });
        }}
        isTyping={isTyping}
        isRecording={isRecording}
        isListening={isListening}
        onToggleRecording={toggleRecording}
        input={input}
        onInputChange={setInput}
        personaInfo={personaInfo}
        isAISpeaking={isAISpeaking}
        isUserSpeaking={isUserSpeaking}
      />
    </Layout>
  );
}
