import React, { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import type Player from 'video.js/dist/types/player';
import 'video.js/dist/video-js.css';
import { Box, CircularProgress, Alert, Typography } from '@mui/material';

// Import HLS support
import '@videojs/http-streaming';

// Define Video.js options type if not available
interface VideoJsPlayerOptions {
  autoplay?: boolean | string;
  controls?: boolean;
  loop?: boolean;
  muted?: boolean;
  fluid?: boolean;
  responsive?: boolean;
  preload?: string;
  sources?: Array<{
    src: string;
    type?: string;
  }>;
  poster?: string;
  html5?: any;
  errorDisplay?: boolean;
  playbackRates?: number[];
  userActions?: {
    hotkeys?: boolean;
  };
  [key: string]: any;
}

export interface VideoPlayerProps {
  src: string;
  poster?: string;
  autoplay?: boolean;
  controls?: boolean;
  loop?: boolean;
  muted?: boolean;
  width?: string | number;
  height?: string | number;
  onReady?: (player: Player) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onError?: (error: any) => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  fluid?: boolean;
  responsive?: boolean;
  preload?: 'auto' | 'metadata' | 'none';
  debug?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  poster,
  autoplay = false,
  controls = true,
  loop = false,
  muted = false,
  width = '100%',
  height = '400px', // Set a default height
  onReady,
  onPlay,
  onPause,
  onEnded,
  onError,
  onTimeUpdate,
  fluid = true,
  responsive = true,
  preload = 'auto',
  debug = false,
}) => {
  const videoRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!videoRef.current || !src) return;

    const videoElement = document.createElement('video-js');
    videoElement.classList.add('vjs-big-play-centered');
    videoElement.setAttribute('style', 'width: 100%; height: 100%;');
    videoRef.current.appendChild(videoElement);

    // Determine source type based on URL
    let sourceType = 'video/mp4'; // default
    if (src.includes('.m3u8')) {
      sourceType = 'application/x-mpegURL';
    } else if (src.includes('.mpd')) {
      sourceType = 'application/dash+xml';
    } else if (src.includes('.webm')) {
      sourceType = 'video/webm';
    } else if (src.includes('.ogg')) {
      sourceType = 'video/ogg';
    }

    if (debug) {
      console.log('Initializing video player with:', { src, sourceType });
    }

    // Video.js options
    const options: VideoJsPlayerOptions = {
      autoplay,
      controls,
      loop,
      muted,
      fluid,
      responsive,
      preload,
      sources: [{
        src,
        type: sourceType,
      }],
      poster,
      html5: {
        vhs: {
          enableLowInitialPlaylist: true,
          smoothQualityChange: true,
          overrideNative: !videojs.browser.IS_SAFARI,
        },
        nativeAudioTracks: false,
        nativeVideoTracks: false,
      },
      // Enable error display
      errorDisplay: true,
      // Increase timeout for slow connections
      timeout: 45000,
    };

    try {
      // Initialize Video.js
      const player = videojs(videoElement, options, function onPlayerReady() {
        console.log('Player is ready');
        setInitialized(true);
        setLoading(false);
        
        // Log player state for debugging
        if (debug) {
          console.log('Player initialized:', {
            src: player.currentSrc(),
            duration: player.duration(),
            paused: player.paused(),
            readyState: player.readyState(),
          });
        }
        
        if (onReady) {
          onReady(player);
        }
      });

      playerRef.current = player;

      // Event listeners
      player.on('loadstart', () => {
        if (debug) console.log('Load started');
        setLoading(true);
        setError(null);
      });

      player.on('loadeddata', () => {
        if (debug) console.log('Data loaded');
        setLoading(false);
      });

      player.on('play', () => {
        if (onPlay) onPlay();
      });

      player.on('pause', () => {
        if (onPause) onPause();
      });

      player.on('ended', () => {
        if (onEnded) onEnded();
      });

      player.on('error', (e: any) => {
        const playerError = player.error();
        const errorMessage = playerError ? 
          `Error Code: ${playerError.code}, Message: ${playerError.message}` : 
          'Unknown error occurred';
        
        console.error('Video.js error:', errorMessage, e);
        setError(errorMessage);
        setLoading(false);
        
        if (onError) onError(playerError || e);
      });

      player.on('timeupdate', () => {
        if (onTimeUpdate) {
          onTimeUpdate(player.currentTime() || 0, player.duration() || 0);
        }
      });

      // Add source error handling
      player.on('sourceerror', (e: any) => {
        console.error('Source error:', e);
        setError('Failed to load video source. Please check the URL and CORS settings.');
      });

      // Try to load the source explicitly
      player.src({ type: sourceType, src });
      
      // For debugging - check ready state after a delay
      if (debug) {
        setTimeout(() => {
          console.log('Player state after 2s:', {
            readyState: player.readyState(),
            networkState: player.networkState(),
            error: player.error(),
            currentSrc: player.currentSrc(),
          });
        }, 2000);
      }

    } catch (err) {
      console.error('Failed to initialize player:', err);
      setError('Failed to initialize video player');
      setLoading(false);
    }

    // Cleanup
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
        setInitialized(false);
      }
    };
  }, [src, debug]);

  return (
    <Box
      sx={{
        position: 'relative',
        width,
        height,
        backgroundColor: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Video container */}
      <div ref={videoRef} style={{ width: '100%', height: '100%' }} />

      {/* Loading indicator */}
      {loading && !error && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
          }}
        >
          <CircularProgress color="primary" />
          <Typography variant="body2" sx={{ color: 'white', mt: 2 }}>
            Loading video...
          </Typography>
        </Box>
      )}

      {/* Error display */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            position: 'absolute',
            top: 20,
            left: 20,
            right: 20,
            zIndex: 1000,
          }}
        >
          {error}
        </Alert>
      )}

      {/* Debug info */}
      {debug && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            backgroundColor: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: 1,
            fontSize: '12px',
            fontFamily: 'monospace',
            zIndex: 1000,
          }}
        >
          <div>Src: {src}</div>
          <div>Initialized: {initialized ? 'Yes' : 'No'}</div>
          <div>Loading: {loading ? 'Yes' : 'No'}</div>
        </Box>
      )}
    </Box>
  );
};

export default VideoPlayer;

// Example usage with debugging:
/*
import VideoPlayer from './VideoPlayer';

// Basic usage
<VideoPlayer
  src="https://your-video-url.mp4"
  controls={true}
  debug={true} // Enable debug mode to see what's happening
/>

// For Flask backend with CORS headers needed:
// Make sure your Flask endpoint includes these headers:
// response.headers['Access-Control-Allow-Origin'] = '*'
// response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
// response.headers['Access-Control-Allow-Headers'] = 'Range'

// For Bunny CDN
<VideoPlayer
  src="https://your-pull-zone.b-cdn.net/video.mp4"
  height="500px"
/>

// For HLS streaming
<VideoPlayer
  src="https://example.com/playlist.m3u8"
  muted={true} // Often needed for autoplay
  autoplay={true}
/>
*/