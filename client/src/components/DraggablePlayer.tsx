import React, { useState, useRef, useEffect } from 'react';
import { useSpotifyPlayer } from '@/contexts/SpotifyPlayerContext';
import { Play, Pause, SkipForward, SkipBack, Maximize2 } from 'lucide-react';

interface DraggablePlayerProps {
  isVisible: boolean;
  onClose: () => void;
}

export const DraggablePlayer: React.FC<DraggablePlayerProps> = ({ isVisible, onClose }) => {
  const { state, play, pause, next, previous, seek } = useSpotifyPlayer();
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

  if (!isVisible || !state.currentTrack) return null;

  return (
    <div
      ref={dragRef}
      className="fixed bg-black/90 backdrop-blur-lg border border-gray-800 rounded-2xl shadow-2xl z-50"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '400px',
        height: '120px',
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="p-4 h-full flex items-center gap-4">
        {/* Album Cover */}
        <div className="relative">
          <img
            src={state.currentTrack.imageUrl || 'https://via.placeholder.com/80'}
            alt={state.currentTrack.album}
            className="w-20 h-20 rounded-lg object-cover"
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
                <div className="relative h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-primary transition-all duration-100"
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
                  className="w-8 h-8 bg-primary text-black rounded-full flex items-center justify-center hover:bg-primary/80 transition-colors"
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
                  allowFullScreen=""
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
    </div>
  );
};
