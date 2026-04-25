import React, { useEffect, useState } from 'react';
import { Track } from '../types';
import { audioEngine } from '../services/audioService';
import { GlitchText } from './GlitchText';

const TRACKS: Track[] = [
  { id: 'trk_01', title: 'VOID_DRONE.WAV', type: 'drone' },
  { id: 'trk_02', title: 'NEURAL_ARP.SEQ', type: 'arp' },
  { id: 'trk_03', title: 'STATIC_RHYTHM.BIN', type: 'noise' }
];

export const MusicPlayer: React.FC = () => {
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioInitialized, setAudioInitialized] = useState(false);

  useEffect(() => {
    if (isPlaying && audioInitialized) {
      audioEngine.playTrack(TRACKS[currentTrackIdx]);
    } else {
      audioEngine.stop();
    }
    return () => audioEngine.stop();
  }, [currentTrackIdx, isPlaying, audioInitialized]);

  const handlePlayPause = () => {
    if (!audioInitialized) {
      audioEngine.init();
      setAudioInitialized(true);
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    setCurrentTrackIdx((prev) => (prev + 1) % TRACKS.length);
    if (!isPlaying) setIsPlaying(true);
  };

  const handlePrev = () => {
    setCurrentTrackIdx((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    if (!isPlaying) setIsPlaying(true);
  };

  return (
    <div className="border-2 border-fuchsia-500 p-4 bg-black/80 backdrop-blur-sm w-full max-w-md mx-auto shadow-[0_0_15px_rgba(255,0,255,0.3)]">
      <div className="flex justify-between items-center mb-4 border-b border-cyan-500 pb-2">
        <GlitchText text="AUDIO_STREAM" className="text-xs text-cyan-400" />
        <span className={`text-xs ${isPlaying ? 'text-fuchsia-500 animate-pulse' : 'text-gray-600'}`}>
          {isPlaying ? '[ACTIVE]' : '[OFFLINE]'}
        </span>
      </div>
      
      <div className="mb-6 text-center h-12 flex items-center justify-center">
        <GlitchText 
          text={TRACKS[currentTrackIdx].title} 
          className="text-sm md:text-base text-fuchsia-400" 
        />
      </div>

      <div className="flex justify-center gap-6">
        <button 
          onClick={handlePrev}
          className="text-cyan-400 hover:text-fuchsia-500 hover:scale-110 transition-transform focus:outline-none"
          aria-label="Previous Track"
        >
          [&#171;]
        </button>
        <button 
          onClick={handlePlayPause}
          className="text-cyan-400 hover:text-fuchsia-500 hover:scale-110 transition-transform focus:outline-none text-xl"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? '[||]' : '[&#9654;]'}
        </button>
        <button 
          onClick={handleNext}
          className="text-cyan-400 hover:text-fuchsia-500 hover:scale-110 transition-transform focus:outline-none"
          aria-label="Next Track"
        >
          [&#187;]
        </button>
      </div>
      
      {/* Fake progress bar */}
      <div className="mt-4 h-1 w-full bg-gray-800 relative overflow-hidden">
        {isPlaying && (
          <div className="absolute top-0 left-0 h-full bg-cyan-500 w-full animate-[slide_10s_linear_infinite]"></div>
        )}
      </div>
      <style>{`
        @keyframes slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};
