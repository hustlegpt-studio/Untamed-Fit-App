// Audio utility functions for weight room and UI sounds

export interface SoundConfig {
  weightRoomSound: string;
  uiSounds: boolean;
  masterVolume: number;
  customSound?: string;
}

export const DEFAULT_SOUNDS = {
  hardcore: {
    name: 'Hardcore',
    description: 'Heavy metal & intense weight room atmosphere',
    sounds: {
      weightDrop: 'data:audio/weight-drop-heavy.mp3',
      repComplete: 'data:audio/rep-complete-metal.mp3',
      buttonClick: 'data:audio/click-heavy.mp3',
      screenTransition: 'data:audio/transition-metal.mp3'
    }
  },
  zen: {
    name: 'Zen',
    description: 'Peaceful & focused gym environment',
    sounds: {
      weightDrop: 'data:audio/wight-drop-zen.mp3',
      repComplete: 'data:audio/rep-complete-calm.mp3',
      buttonClick: 'data:audio/click-soft.mp3',
      screenTransition: 'data:audio/transition-zen.mp3'
    }
  },
  classic: {
    name: 'Classic',
    description: 'Traditional gym sounds',
    sounds: {
      weightDrop: 'data:audio/weight-drop-classic.mp3',
      repComplete: 'data:audio/rep-complete-beep.mp3',
      buttonClick: 'data:audio/click-beep.mp3',
      screenTransition: 'data:audio/transition-beep.mp3'
    }
  }
};

// Generate basic sounds using Web Audio API as fallback
export class AudioGenerator {
  private audioContext: AudioContext | null = null;
  
  constructor() {
    if (typeof window !== 'undefined' && window.AudioContext) {
      this.audioContext = new window.AudioContext();
    }
  }
  
  playWeightDrop(soundType: string = 'classic') {
    if (!this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    switch (soundType) {
      case 'hardcore':
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
        break;
      case 'zen':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.8);
        break;
      default:
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
    }
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 1);
  }
  
  playButtonClick(soundType: string = 'classic') {
    if (!this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    switch (soundType) {
      case 'hardcore':
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
        break;
      case 'zen':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(2000, this.audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.03, this.audioContext.currentTime);
        break;
      default:
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(1500, this.audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.02, this.audioContext.currentTime);
    }
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.05);
  }
  
  playRepComplete(soundType: string = 'classic') {
    if (!this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    switch (soundType) {
      case 'hardcore':
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        break;
      case 'zen':
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(880, this.audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
        break;
      default:
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(1200, this.audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
    }
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.5);
  }
  
  setVolume(volume: number) {
    if (this.audioContext) {
      // Volume is handled per-sound in the play methods
    }
  }
}

export const audioGenerator = new AudioGenerator();

// Helper functions for playing sounds
export const playWeightDrop = (soundType: string, volume: number = 50) => {
  audioGenerator.playWeightDrop(soundType);
};

export const playButtonClick = (soundType: string, volume: number = 50) => {
  audioGenerator.playButtonClick(soundType);
};

export const playRepComplete = (soundType: string, volume: number = 50) => {
  audioGenerator.playRepComplete(soundType);
};
