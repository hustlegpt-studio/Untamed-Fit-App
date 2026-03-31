import React, { useState, useRef, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, User, Sparkles, Zap, Mic, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { WorkoutPreview } from "@/components/WorkoutPreview";
import { StopWatchBox } from "@/components/StopWatchBox";
import { WORKOUTS } from "@/utils/workoutData";
import { isStartPhrase, getRandomQuote } from "@/utils/startPhrases";
import { analyzeUserGoal, getTrainerResponse, getUserFitnessProfile } from "@/utils/aiTrainerLogic";
import { recommendWorkout } from "@/utils/workoutEngine";

export default function AskKevin() {
  const [messages, setMessages] = useState<any[]>([
    { role: "assistant", content: "Alright, let's get after it. What are you looking to work on today? Strength, fat loss, mobility, or a specific body part?" }
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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    
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
    setUsedCount(prev => prev + 1);

    try {
      // Call the real AI API
      const response = await fetch('/api/kevin/chat', {
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response from Trainer KG');
      }

      const assistantMsg = { 
        role: "assistant", 
        content: data.response
      };
      setMessages(prev => [...prev, assistantMsg]);

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
      
      // Fallback to existing mock logic if AI fails
      setTimeout(() => {
        let responseContent = "That's a solid question. When it comes to that, you gotta focus on the 'Mindset Marathon'. Don't just train your muscles, train your will. Keep pushing!";
        
        const userWantsToStart = isStartPhrase(userInput);
        const analysis = analyzeUserGoal(userInput);
        
        if (userWantsToStart) {
          const quote = getRandomQuote();
          responseContent = `${quote}\n\nAlright, let's get to work! I'm setting the stopwatch now. Show me what you got!`;
          const randomWorkout = WORKOUTS[Math.floor(Math.random() * WORKOUTS.length)];
          setCurrentWorkout(randomWorkout);
          setStopwatchActive(true);
        } else if (analysis.detected) {
          const trainerResponse = getTrainerResponse(analysis);
          
          if (trainerResponse === "Got it. Before I recommend a workout, let me check your body type and goals.") {
            const profile = getUserFitnessProfile();
            setUserProfile(profile);
            
            if (analysis.bodyPart) {
              const recommended = recommendWorkout(analysis.bodyPart, {
                bodyType: profile.bodyType,
                goals: profile.goals,
                experienceLevel: profile.experience
              });
              
              if (recommended) {
                setCurrentWorkout(recommended);
                responseContent = `${trainerResponse}\n\nAlright, based on your profile, I've got a ${recommended.name} workout that fits your body type and experience level. Want me to show it?`;
              } else {
                responseContent = `${trainerResponse}\n\nAlright, based on your profile, I've got a workout that fits your body type and experience level. Want me to show it?`;
              }
            } else {
              responseContent = `${trainerResponse}\n\nAlright, based on your profile, I've got a workout that fits your body type and experience level. Want me to show it?`;
            }
          } else {
            responseContent = trainerResponse;
          }
        }
        
        const assistantMsg = { 
          role: "assistant", 
          content: responseContent
        };
        setMessages(prev => [...prev, assistantMsg]);
      }, 1500);
    }
    
    setIsTyping(false);
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
          <span className="text-[10px] font-bold text-white tracking-widest uppercase">{usedCount}/{dailyLimit} FREE DAILY</span>
        </div>
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
                    <div className={cn(
                      "p-4 rounded-2xl text-sm leading-relaxed",
                      msg.role === "user" 
                      ? "bg-primary text-primary-foreground font-semibold rounded-tr-sm" 
                      : "bg-white/5 text-silver border border-white/5 rounded-tl-sm"
                    )}>
                      {msg.content}
                    </div>
                    {msg.role === "assistant" && (
                      <div className="text-xs text-primary/60 font-semibold ml-2">
                        Trainer KG
                      </div>
                    )}
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
            <button type="button" className="p-3 rounded-xl bg-white/5 text-muted-foreground hover:bg-primary/20 hover:text-primary transition-colors">
              <Mic className="w-6 h-6" />
            </button>
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Kevin anything..." 
              className="flex-1 bg-white/5 border-white/10 rounded-xl h-12 focus-visible:ring-primary text-white"
            />
            <Button 
              type="submit"
              disabled={!input.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/80 rounded-xl w-12 h-12 p-0"
            >
              <Send className="w-5 h-5" />
            </Button>
          </form>
          <p className="text-center text-[10px] text-muted-foreground mt-3 uppercase tracking-widest flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-primary" /> Powered by Untamed AI
          </p>
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
    </Layout>
  );
}
