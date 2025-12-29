'use client';

import { useState, useEffect, useCallback } from 'react';

interface AudioPlayerOptions {
  autoPlay?: boolean;
  onEnded?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Custom hook for managing audio playback
 */
export const useAudioPlayer = (src?: string, options: AudioPlayerOptions = {}) => {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!src) return;

    const audioElement = new Audio(src);
    
    const handleLoadStart = () => setIsLoading(true);
    const handleLoadedData = () => {
      setIsLoading(false);
      setDuration(audioElement.duration);
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      options.onEnded?.();
    };
    const handleError = (e: ErrorEvent) => {
      const err = new Error('Failed to load audio');
      setError(err);
      setIsLoading(false);
      options.onError?.(err);
    };
    const handleTimeUpdate = () => setCurrentTime(audioElement.currentTime);

    audioElement.addEventListener('loadstart', handleLoadStart);
    audioElement.addEventListener('loadeddata', handleLoadedData);
    audioElement.addEventListener('play', handlePlay);
    audioElement.addEventListener('pause', handlePause);
    audioElement.addEventListener('ended', handleEnded);
    audioElement.addEventListener('error', handleError as any);
    audioElement.addEventListener('timeupdate', handleTimeUpdate);

    setAudio(audioElement);

    if (options.autoPlay) {
      audioElement.play().catch(err => {
        setError(err);
        options.onError?.(err);
      });
    }

    return () => {
      audioElement.pause();
      audioElement.removeEventListener('loadstart', handleLoadStart);
      audioElement.removeEventListener('loadeddata', handleLoadedData);
      audioElement.removeEventListener('play', handlePlay);
      audioElement.removeEventListener('pause', handlePause);
      audioElement.removeEventListener('ended', handleEnded);
      audioElement.removeEventListener('error', handleError as any);
      audioElement.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [src, options.autoPlay]);

  const play = useCallback(() => {
    if (!audio) return;
    audio.play().catch(err => {
      setError(err);
      options.onError?.(err);
    });
  }, [audio, options]);

  const pause = useCallback(() => {
    if (!audio) return;
    audio.pause();
  }, [audio]);

  const stop = useCallback(() => {
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  }, [audio]);

  const seek = useCallback((time: number) => {
    if (!audio) return;
    audio.currentTime = time;
  }, [audio]);

  const setVolume = useCallback((volume: number) => {
    if (!audio) return;
    audio.volume = Math.max(0, Math.min(1, volume));
  }, [audio]);

  return {
    play,
    pause,
    stop,
    seek,
    setVolume,
    isPlaying,
    isLoading,
    error,
    currentTime,
    duration,
  };
};
