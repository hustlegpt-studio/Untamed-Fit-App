// Spotify Web Playback SDK OAuth handler
import { Router } from 'express';
import { storage } from './storage';

const router = Router();

// Spotify app credentials from environment variables
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

// Validate required environment variables
if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REDIRECT_URI) {
  console.error('Missing required Spotify environment variables:');
  console.error('SPOTIFY_CLIENT_ID:', SPOTIFY_CLIENT_ID ? 'Set' : 'Missing');
  console.error('SPOTIFY_CLIENT_SECRET:', SPOTIFY_CLIENT_SECRET ? 'Set' : 'Missing');
  console.error('SPOTIFY_REDIRECT_URI:', SPOTIFY_REDIRECT_URI ? 'Set' : 'Missing');
  console.error('Please check your .env file');
}

// Store access tokens (in production, use proper session management)
const tokens = new Map<string, { accessToken: string; refreshToken: string; expiresAt: number; userId: string }>();

// Spotify OAuth login flow
router.get('/login', async (req, res) => {
  const scopes = [
    'streaming',
    'user-read-email',
    'user-read-private',
    'user-modify-playback-state',
    'user-read-playback-state',
    'user-read-currently-playing'
  ].join(' ');

  const authUrl = `https://accounts.spotify.com/authorize?` +
    `response_type=code&` +
    `client_id=${SPOTIFY_CLIENT_ID}&` +
    `scope=${encodeURIComponent(scopes)}&` +
    `redirect_uri=${encodeURIComponent(SPOTIFY_REDIRECT_URI)}&` +
    `state=${Math.random().toString(36).substring(7)}`;

  res.json({ authUrl });
});

// Get Spotify access token
router.post('/token', async (req, res) => {
  try {
    const { code, refresh_token } = req.body;

    if (code) {
      // Exchange authorization code for access token
      const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: SPOTIFY_REDIRECT_URI
        }).toString()
      });

      const tokenData = await tokenResponse.json();
      
      const tokenInfo = {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: Date.now() + (tokenData.expires_in * 1000),
        userId: tokenData.user_id || 'unknown'
      };

      // Store token for user
      const userId = tokenData.user_id || 'default_user';
      tokens.set(userId, tokenInfo);

      res.json({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_in: tokenData.expires_in,
        token_type: tokenData.token_type
      });
    } else if (refresh_token) {
      // Refresh existing token
      const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token
        }).toString()
      });

      const tokenData = await tokenResponse.json();
      
      res.json({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_in: tokenData.expires_in,
        token_type: tokenData.token_type
      });
    } else {
      res.status(400).json({ error: 'Missing authorization code or refresh token' });
    }
  } catch (error) {
    console.error('Error getting Spotify token:', error);
    res.status(500).json({ error: 'Failed to get Spotify token' });
  }
});

// Spotify OAuth callback
router.get('/callback', async (req, res) => {
  const { code, state, error } = req.query;
  
  if (error) {
    console.error('Spotify OAuth error:', error);
    res.redirect('/music-player?error=auth_failed');
    return;
  }
  
  if (!code) {
    console.error('Missing authorization code');
    res.redirect('/music-player?error=missing_code');
    return;
  }
  
  try {
    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code as string,
        redirect_uri: SPOTIFY_REDIRECT_URI
      }).toString()
    });

    const tokenData = await tokenResponse.json();
    
    // Store token for user
    const userId = tokenData.user_id || 'default_user';
    const tokenInfo = {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: Date.now() + (tokenData.expires_in * 1000),
      userId: userId
    };
    
    tokens.set(userId, tokenInfo);
    
    // Redirect to music player with success
    res.redirect('/music-player?auth=success');
    
  } catch (error) {
    console.error('Error exchanging authorization code:', error);
    res.redirect('/music-player?error=token_exchange_failed');
  }
});

// Initiate OAuth flow
router.get('/authorize', async (req, res) => {
  const scope = 'streaming user-read-playback-state user-modify-playback-state user-read-currently-playing';
  const authUrl = `https://accounts.spotify.com/authorize?` +
    `response_type=code&` +
    `client_id=${SPOTIFY_CLIENT_ID}&` +
    `scope=${encodeURIComponent(scope)}&` +
    `redirect_uri=${encodeURIComponent(SPOTIFY_REDIRECT_URI)}&` +
    `state=${Math.random().toString(36).substring(7)}`;

  res.json({ authUrl });
});

// Refresh access token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    // In production, exchange refresh token for new access token
    const mockResponse = {
      access_token: 'new_mock_access_token',
      expires_in: 3600,
      token_type: 'Bearer'
    };
    
    res.json(mockResponse);
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

export default router;
