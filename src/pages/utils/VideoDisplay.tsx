import React, { useMemo } from 'react';
import VideoPlayer, { VideoPlayerProps } from './VideoPlayer';

const VideoDisplay: React.FC<VideoPlayerProps> = (props) => {
    // Determine if we're in development environment
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    //TODO: check if this works in production
    // Memoize the calculated URL to prevent unnecessary re-renders
    const videoUrl = useMemo(() => {
        // In development, use a local dummy video file from public folder
        // In production, use the proxied URL
        // can also use for testing: https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4
        return isDevelopment
            ? `${window.location.origin}/video.mp4`
            : props.src;
    }, [isDevelopment, props.src]);
      return (
        <VideoPlayer
            {...props}
            src={videoUrl}
        />
    );
};

export default VideoDisplay;