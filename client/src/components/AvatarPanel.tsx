import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AvatarPanelProps {
  isSpeaking: boolean;
  isUserSpeaking: boolean;
  className?: string;
}

export default function AvatarPanel({ isSpeaking, isUserSpeaking, className }: AvatarPanelProps) {
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const elementStartPos = useRef({ x: 0, y: 0 });

  // Load saved position from localStorage
  useEffect(() => {
    const savedPosition = localStorage.getItem('avatar-panel-position');
    if (savedPosition) {
      try {
        const pos = JSON.parse(savedPosition);
        setPosition(pos);
      } catch (error) {
        console.error('Failed to parse saved position:', error);
      }
    }
  }, []);

  // Save position to localStorage
  useEffect(() => {
    localStorage.setItem('avatar-panel-position', JSON.stringify(position));
  }, [position]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    elementStartPos.current = { x: position.x, y: position.y };
    
    // Add global mouse event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStartPos.current.x;
    const deltaY = e.clientY - dragStartPos.current.y;
    
    setPosition({
      x: elementStartPos.current.x + deltaX,
      y: elementStartPos.current.y + deltaY
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // Cleanup event listeners on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const getGlowClass = () => {
    if (isSpeaking) return 'shadow-green-500/50 shadow-2xl animate-pulse';
    if (isUserSpeaking) return 'shadow-blue-500/50 shadow-2xl animate-pulse';
    return 'shadow-primary/30 shadow-lg';
  };

  const getBorderClass = () => {
    if (isSpeaking) return 'border-green-500 bg-green-500/10';
    if (isUserSpeaking) return 'border-blue-500 bg-blue-500/10';
    return 'border-primary/30 bg-white/5';
  };

  return (
    <motion.div
      ref={dragRef}
      className={cn(
        'fixed z-50 rounded-2xl border transition-all duration-300',
        getBorderClass(),
        getGlowClass(),
        isDragging ? 'cursor-grabbing scale-105' : 'cursor-grab',
        isMinimized ? 'w-16 h-16' : 'w-24 h-24',
        className
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        userSelect: isDragging ? 'none' : 'auto'
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Drag Handle */}
      <div
        className="absolute top-2 left-2 right-2 h-6 flex items-center justify-center cursor-grab active:cursor-grabbing opacity-0 hover:opacity-100 transition-opacity"
        onMouseDown={handleMouseDown}
      >
        <GripVertical className="w-4 h-4 text-white/60" />
      </div>

      {/* Minimize/Close Buttons */}
      <div className="absolute top-1 right-1 flex gap-1 opacity-0 hover:opacity-100 transition-opacity">
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <span className="text-xs text-white/80">
            {isMinimized ? '□' : '−'}
          </span>
        </button>
        <button
          onClick={() => {
            // Hide the panel (could be extended to remove from DOM)
            dragRef.current?.style.setProperty('display', 'none');
          }}
          className="w-5 h-5 rounded-full bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center transition-colors"
        >
          <X className="w-3 h-3 text-white/80" />
        </button>
      </div>

      {/* Avatar Content */}
      <div className="relative w-full h-full flex items-center justify-center p-2">
        <AnimatePresence mode="wait">
          {!isMinimized ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              {/* Untamed Fit Logo */}
              <img
                src="/logo.png"
                alt="Untamed Fit"
                className="w-full h-full object-contain"
                draggable={false}
              />
              
              {/* Speaking Indicator */}
              {(isSpeaking || isUserSpeaking) && (
                <motion.div
                  className="absolute inset-0 rounded-2xl border-2 animate-pulse"
                  style={{
                    borderColor: isSpeaking ? '#10b981' : '#3b82f6',
                    boxShadow: `0 0 20px ${isSpeaking ? '#10b981' : '#3b82f6'}`
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
                  isSpeaking ? 'bg-green-500 animate-pulse' : 
                  isUserSpeaking ? 'bg-blue-500 animate-pulse' : 
                  'bg-gray-500'
                )} />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="minimized"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="relative w-full h-full"
            >
              {/* Minimized Logo */}
              <img
                src="/logo.png"
                alt="Untamed Fit"
                className="w-full h-full object-contain p-1"
                draggable={false}
              />
              
              {/* Minimized Status */}
              <div className="absolute -top-1 -right-1">
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  isSpeaking ? 'bg-green-500 animate-pulse' : 
                  isUserSpeaking ? 'bg-blue-500 animate-pulse' : 
                  'bg-gray-500'
                )} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tooltip */}
      {isMinimized && (
        <motion.div
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded whitespace-nowrap"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {isSpeaking ? 'Trainer KG Speaking...' : 
           isUserSpeaking ? 'You are speaking...' : 
           'Trainer KG'}
        </motion.div>
      )}
    </motion.div>
  );
}
