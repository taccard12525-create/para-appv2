'use client';

import { useState, useRef } from 'react';

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const audioUrl = 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3';

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.volume = 0.3;
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <audio ref={audioRef} src={audioUrl} loop />
      <button
        onClick={togglePlay}
        className={`flex items-center justify-center w-12 h-12 rounded-full backdrop-blur-md border shadow-soft transition-all duration-500 hover:scale-105 ${
          isPlaying 
            ? 'bg-terra/10 border-terra/30 text-terra' 
            : 'bg-white/40 border-white/60 text-inkSoft hover:text-ink'
        }`}
        title={isPlaying ? 'Выключить музыку' : 'Включить атмосферу'}
      >
        {isPlaying ? (
          <div className="flex items-end gap-1 h-4">
            <span className="w-1 bg-terra animate-[bounce_1s_infinite_100ms] h-full"></span>
            <span className="w-1 bg-terra animate-[bounce_1s_infinite_300ms] h-3/4"></span>
            <span className="w-1 bg-terra animate-[bounce_1s_infinite_200ms] h-full"></span>
          </div>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l12-2v13"></path>
            <circle cx="6" cy="18" r="3"></circle>
            <circle cx="18" cy="16" r="3"></circle>
          </svg>
        )}
      </button>
    </div>
  );
}