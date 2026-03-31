import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

const MOTTOS = [
  "Unleash Your Strongest Self",
  "Train Untamed. Live Untamed.",
  "Built Not Born",
  "Rise Strong",
  "No Excuses. Just Results.",
  "Your Power Starts Here",
  "BE THE BEAST KEVIN KNOWS YOU ARE"
];

export default function Splash() {
  const [, setLocation] = useLocation();
  const [motto] = useState(() => MOTTOS[Math.floor(Math.random() * MOTTOS.length)]);
  const [canContinue, setCanContinue] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCanContinue(true);
    }, 7000);
    return () => clearTimeout(timer);
  }, []);

  const handleLogoClick = () => {
    if (canContinue) {
      window.location.href = "/auth";
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col items-center justify-center relative overflow-hidden">
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-1000"
        style={{ 
          backgroundImage: `url('/assets/placeholders/KG_INTRO_01.jpg')`,
          filter: 'blur(10px)',
        }}
      />
      <div className="absolute inset-0 z-1 bg-black/50" />
      <div className="absolute inset-0 z-2 bg-gradient-to-br from-[#00FF7A]/10 to-[#FF7A00]/10" />
      <div className="absolute inset-0 z-3 bg-[radial-gradient(circle_at_center,_transparent_0%,_black_90%)]" />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="text-center z-10 flex flex-col items-center"
      >
        <motion.div 
          className={`mb-8 w-48 h-48 md:w-64 md:h-64 relative ${canContinue ? 'cursor-pointer' : 'cursor-default'}`}
          whileHover={canContinue ? { scale: 1.05 } : {}}
          whileTap={canContinue ? { scale: 0.95 } : {}}
          onClick={handleLogoClick}
        >
          <img 
            src="/logo.png" 
            alt="UNTAMED LOGO" 
            className={`w-full h-full object-contain transition-all duration-500 ${canContinue ? 'drop-shadow-[0_0_20px_rgba(0,255,122,0.8)] opacity-100' : 'drop-shadow-[0_0_10px_rgba(0,255,122,0.3)] opacity-80'}`}
          />
          {canContinue && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-primary font-display text-sm tracking-tighter uppercase"
            >
              TAP TO ENTER
            </motion.div>
          )}
        </motion.div>
        
        <AnimatePresence mode="wait">
          <motion.p 
            key={motto}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-2xl md:text-3xl text-[#CFCFCF] font-display tracking-widest uppercase px-4"
          >
            {motto}
          </motion.p>
        </AnimatePresence>
      </motion.div>

      <div className="absolute bottom-8 left-0 w-full text-center z-10 opacity-60">
        <p className="text-[10px] md:text-xs text-white uppercase tracking-[0.2em]">
          Created by Kevin Gilliam<br/>
          Built with HustleBuilder™ (HustleGPT Family)<br/>
          Engineered by TMG Rambo
        </p>
      </div>
    </div>
  );
}
