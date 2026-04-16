import React, { useState, useRef, useEffect } from 'react';
import { useSpotifyPlayer } from '@/contexts/SpotifyPlayerContext';
import { Play, Pause, SkipForward, SkipBack, Maximize2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface DraggablePlayerProps {
  isVisible: boolean;
  onClose: () => void;
}

export const DraggablePlayer: React.FC<DraggablePlayerProps> = ({ isVisible, onClose }) => {
  const { state, play, pause, next, previous, seek, fallbackToEmbed } = useSpotifyPlayer();
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 400, y: 100 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const dragRef = useRef<HTMLDivElement>(null);
  const [currentPlaylist, setCurrentPlaylist] = useState<any>(null);

  useEffect(() => {
    // Get current playlist from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const playlistId = urlParams.get('playlist');
    
    if (playlistId) {
      // Find playlist data (this should be moved to a shared context)
      const playlists = [
        {
          id: "untamed-fitness",
          title: "Untamed Fitness",
          url: "https://open.spotify.com/playlist/69p9UJnze06a8hf1ppTHj1?si=FS8MPcUaTTq_beIv52wM7A&pi=KnfHt7OESYeNY&nd=1&dlsi=4b09afab0d654272",
          coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop",
        },
        {
          id: "military-monday",
          title: "Military Monday",
          url: "https://open.spotify.com/playlist/3birA7raRHqAsduSan6M1e?si=57zJqCfxTs2M-HPbOm2ddg&pi=1eeO1DcYSESfb",
          coverUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&h=300&fit=crop",
        },
        {
          id: "beast-mode",
          title: "Beast Mode Bootcamp",
          url: "https://open.spotify.com/playlist/3birA7raRHqAsduSan6M1e?si=57zJqCfxTs2M-HPbOm2ddg&pi=1eeO1DcYSESfb",
          coverUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=300&h=300&fit=crop",
        },
        {
          id: "zen-party",
          title: "Zen Party",
          url: "https://open.spotify.com/playlist/6lTJBDYBVZf7vlBacC0Oww?si=n2Dq1CZBTbiSV9qTbQr1qg&pi=pnjWoUcnTjCRo",
          coverUrl: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=300&h=300&fit=crop",
        },
      ];
      
      const playlist = playlists.find(p => p.id === playlistId);
      if (playlist) {
        setCurrentPlaylist(playlist);
      }
    }
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      // Keep player within viewport bounds
      const maxX = window.innerWidth - 400; // Player width
      const maxY = window.innerHeight - 120; // Player height
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handlePlayPause = () => {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!isVisible || !state.currentTrack) return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={dragRef}
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          style={{
            position: 'fixed',
            top: position.y,
            left: position.x,
            zIndex: 9999,
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
          className="bg-gray-900 rounded-xl shadow-2xl border border-gray-700 p-4 select-none backdrop-blur-lg bg-opacity-95"
          onMouseDown={handleMouseDown}
        >
          {/* Error Message */}
          {state.error && (
            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-2 mb-3">
              <p className="text-yellow-500 text-xs mb-1">{state.error}</p>
              {state.isUsingSDK && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    fallbackToEmbed();
                  }}
                  className="bg-green-500 hover:bg-green-600 text-black px-2 py-1 rounded text-xs transition-colors"
                >
                  Switch to Embed
                </button>
              )}
            </div>
          )}
          
          <div className="flex items-center gap-4 w-[450px]">
            {/* Album Art */}
            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 shadow-lg">
              <img
                src={state.currentTrack?.imageUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop'}
                alt="Album Art"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Track Info and Controls */}
            <div className="flex-1 flex flex-col justify-between">
              {/* Track Info */}
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-bold text-sm truncate">
                    {state.isUsingSDK && state.currentTrack ? state.currentTrack.name : currentPlaylist?.title || 'Spotify Player'}
                  </h4>
                  <p className="text-gray-400 text-xs truncate">
                    {state.isUsingSDK && state.currentTrack ? state.currentTrack.artist : 'Loading...'}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  className="text-gray-400 hover:text-white transition-colors ml-2"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>

              {state.isUsingSDK ? (
                <>
                  {/* Progress Bar */}
                  <div className="mb-2">
                    <div 
                      className="relative h-1 bg-gray-700 rounded-full overflow-hidden cursor-pointer"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const percentage = x / rect.width;
                        const newPosition = percentage * state.duration;
                        seek(newPosition);
                      }}
                    >
                      <div
                        className="absolute top-0 left-0 h-full bg-green-500 transition-all duration-100"
                        style={{ width: `${(state.position / state.duration) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>{formatTime(state.position)}</span>
                      <span>{formatTime(state.duration)}</span>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        previous();
                      }}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <SkipBack className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayPause();
                      }}
                      className="w-8 h-8 bg-green-500 text-black rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
                    >
                      {state.isPlaying ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4 fill-current" />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        next();
                      }}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <SkipForward className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                /* Embed Player for Fallback */
                <div className="flex-1">
                  {currentPlaylist && (
                    <iframe
                      src={`https://open.spotify.com/embed/playlist/${currentPlaylist.url.split('/').pop()?.split('?')[0]}?utm_source=generator&theme=0`}
                      width="100%"
                      height="80"
                      frameBorder="0"
                      allowFullScreen={true}
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                      className="rounded bg-black"
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Powered by Spotify Badge */}
          <div className="absolute bottom-2 right-2 flex items-center gap-1 text-green-500 text-xs">
            <span className="text-xs">Powered by</span>
            <div className="w-10 h-2 bg-green-500 rounded-sm flex items-center justify-center">
              <span className="text-black text-[8px] font-bold">Spotify</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
