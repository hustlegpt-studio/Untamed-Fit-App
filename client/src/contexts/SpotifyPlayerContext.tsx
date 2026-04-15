import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  duration: number;
  uri: string;
  imageUrl?: string;
}

interface SpotifyPlayerState {
  isReady: boolean;
  isPlaying: boolean;
  currentTrack: SpotifyTrack | null;
  volume: number;
  position: number;
  duration: number;
  isPremium: boolean;
  deviceId: string | null;
  isUsingSDK: boolean;
  error: string | null;
}

interface SpotifyPlayerContextType {
  player: any; // Spotify.Player instance
  state: SpotifyPlayerState;
  play: (uri?: string) => void;
  pause: () => void;
  next: () => void;
  previous: () => void;
  setVolume: (volume: number) => void;
  seek: (position: number) => void;
  loadPlaylist: (playlistUri: string) => void;
  initialize: () => Promise<void>;
}

const SpotifyPlayerContext = createContext<SpotifyPlayerContextType | null>(null);

export const useSpotifyPlayer = () => {
  const context = useContext(SpotifyPlayerContext);
  if (!context) {
    throw new Error('useSpotifyPlayer must be used within SpotifyPlayerProvider');
  }
  return context;
};

interface SpotifyPlayerProviderProps {
  children: ReactNode;
}

export const SpotifyPlayerProvider: React.FC<SpotifyPlayerProviderProps> = ({ children }) => {
  const [player, setPlayer] = useState<any>(null);
  const [state, setState] = useState<SpotifyPlayerState>({
    isReady: false,
    isPlaying: false,
    currentTrack: null,
    volume: 0.7,
    position: 0,
    duration: 0,
    isPremium: false,
    deviceId: null,
    isUsingSDK: false,
    error: null,
  });

  // Load Spotify Web Playback SDK
  const loadSpotifySDK = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.Spotify) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Spotify SDK'));
      document.body.appendChild(script);
    });
  };

  // Get Spotify access token (this would normally come from OAuth flow)
  const getSpotifyToken = async (): Promise<string> => {
    try {
      const response = await fetch('/api/spotify/token');
      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('Failed to get Spotify token:', error);
      throw error;
    }
  };

  // Initialize Spotify player
  const initialize = async () => {
    try {
      setState(prev => ({ ...prev, error: null, isReady: false }));
      
      // Try to load SDK and get token
      await loadSpotifySDK();
      const token = await getSpotifyToken();
      
      // Check if token is valid (not a mock)
      if (!token || token.includes('mock')) {
        throw new Error('Invalid Spotify access token');
      }
      
      const spotifyPlayer = new window.Spotify.Player({
        name: 'Untamed Fitness Web Player',
        getOAuthToken: (cb: (token: string) => void) => {
          cb(token);
        },
        volume: state.volume,
      });

      // Set up event listeners
      spotifyPlayer.addListener('ready', ({ device_id }: { device_id: string }) => {
        console.log('Ready with Device ID', device_id);
        setState(prev => ({ ...prev, deviceId: device_id, isReady: true, isUsingSDK: true }));
      });

      spotifyPlayer.addListener('not_ready', ({ device_id }: { device_id: string }) => {
        console.log('Device ID has gone offline', device_id);
      });

      spotifyPlayer.addListener('player_state_changed', (playerState: any) => {
        if (!playerState) return;

        const currentTrack = playerState.track_window.current_track;
        const track: SpotifyTrack = {
          id: currentTrack.id,
          name: currentTrack.name,
          artist: currentTrack.artists.map((a: any) => a.name).join(', '),
          album: currentTrack.album.name,
          duration: currentTrack.duration_ms,
          uri: currentTrack.uri,
          imageUrl: currentTrack.album.images[0]?.url,
        };

        setState(prev => ({
          ...prev,
          currentTrack: track,
          isPlaying: !playerState.paused,
          position: playerState.position,
          duration: playerState.duration,
        }));
      });

      spotifyPlayer.addListener('initialization_error', ({ message }: { message: string }) => {
        console.error('Failed to initialize', message);
        setState(prev => ({ ...prev, error: message, isUsingSDK: false }));
      });

      spotifyPlayer.addListener('authentication_error', ({ message }: { message: string }) => {
        console.error('Failed to authenticate', message);
        setState(prev => ({ ...prev, error: message, isUsingSDK: false }));
      });

      spotifyPlayer.addListener('account_error', ({ message }: { message: string }) => {
        console.error('Failed to validate Spotify account', message);
        setState(prev => ({ ...prev, error: message, isUsingSDK: false }));
      });

      // Connect the player
      await spotifyPlayer.connect();
      setPlayer(spotifyPlayer);

    } catch (error) {
      console.error('Error initializing Spotify player:', error);
      // Fall back to embed player mode
      setState(prev => ({ 
        ...prev, 
        error: 'Spotify Web Playback SDK not available. Using embed player.',
        isUsingSDK: false,
        isReady: true // Mark as ready for embed player
      }));
    }
  };

  // Player controls
  const play = async (uri?: string) => {
    if (!player || !state.deviceId) return;

    try {
      if (uri) {
        // Play specific track/playlist
        await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${state.deviceId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await getSpotifyToken()}`,
          },
          body: JSON.stringify({ uris: [uri] }),
        });
      } else {
        // Resume current playback
        await player.resume();
      }
    } catch (error) {
      console.error('Error playing:', error);
    }
  };

  const pause = async () => {
    if (!player) return;
    try {
      await player.pause();
    } catch (error) {
      console.error('Error pausing:', error);
    }
  };

  const next = async () => {
    if (!player) return;
    try {
      await player.nextTrack();
    } catch (error) {
      console.error('Error skipping to next:', error);
    }
  };

  const previous = async () => {
    if (!player) return;
    try {
      await player.previousTrack();
    } catch (error) {
      console.error('Error going to previous:', error);
    }
  };

  const setVolume = async (volume: number) => {
    if (!player) return;
    try {
      await player.setVolume(volume);
      setState(prev => ({ ...prev, volume }));
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  };

  const seek = async (position: number) => {
    if (!player) return;
    try {
      await player.seek(position);
      setState(prev => ({ ...prev, position }));
    } catch (error) {
      console.error('Error seeking:', error);
    }
  };

  const loadPlaylist = async (playlistUri: string) => {
    if (!player || !state.deviceId) return;

    try {
      // Get playlist tracks
      const playlistId = playlistUri.split(':').pop();
      const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
        headers: {
          'Authorization': `Bearer ${await getSpotifyToken()}`,
        },
      });
      const playlist = await response.json();

      // Play the first track of the playlist
      const firstTrack = playlist.tracks.items[0]?.track;
      if (firstTrack) {
        await play(firstTrack.uri);
      }
    } catch (error) {
      console.error('Error loading playlist:', error);
    }
  };

  const value: SpotifyPlayerContextType = {
    player,
    state,
    play,
    pause,
    next,
    previous,
    setVolume,
    seek,
    loadPlaylist,
    initialize,
  };

  return (
    <SpotifyPlayerContext.Provider value={value}>
      {children}
    </SpotifyPlayerContext.Provider>
  );
};

// Add type declaration for window.Spotify
declare global {
  interface Window {
    Spotify: {
      Player: any;
    };
  }
}
