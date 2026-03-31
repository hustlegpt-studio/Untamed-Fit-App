import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';

// This simulates the logic for playing a voice cue and "ducking" background music.
// In a true native app, this interacts with AVAudioSession. In the browser, 
// we conceptually demonstrate lowering our internal media volume if playing.

const AudioCuesContext = createContext<{ playCue: (type: string) => void }>({
  playCue: () => {},
});

export function AudioCuesProvider({ children }: { children: React.ReactNode }) {
  const { data: user } = useAuth();
  const voiceCuesEnabled = user?.voiceCues ?? true;
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Initialize lazily on user interaction
    const initAudio = () => {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    };
    document.addEventListener('click', initAudio, { once: true });
    return () => document.removeEventListener('click', initAudio);
  }, []);

  const playCue = (type: string) => {
    if (!voiceCuesEnabled || !audioCtxRef.current) return;
    
    console.log(`[Audio] Ducking background music... Playing cue: ${type}`);
    // Simulate a beep for the cue
    const osc = audioCtxRef.current.createOscillator();
    const gain = audioCtxRef.current.createGain();
    
    osc.connect(gain);
    gain.connect(audioCtxRef.current.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(type === 'start' ? 880 : 440, audioCtxRef.current.currentTime);
    gain.gain.setValueAtTime(0, audioCtxRef.current.currentTime);
    gain.gain.linearRampToValueAtTime(0.5, audioCtxRef.current.currentTime + 0.1);
    gain.gain.linearRampToValueAtTime(0, audioCtxRef.current.currentTime + 0.5);
    
    osc.start();
    osc.stop(audioCtxRef.current.currentTime + 0.5);

    setTimeout(() => {
      console.log(`[Audio] Restoring background music volume.`);
    }, 1000);
  };

  return (
    <AudioCuesContext.Provider value={{ playCue }}>
      {children}
    </AudioCuesContext.Provider>
  );
}

export const useAudioCues = () => useContext(AudioCuesContext);
