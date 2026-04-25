import React, { useState } from 'react';
import { SnakeGame } from './components/SnakeGame';
import { MusicPlayer } from './components/MusicPlayer';
import { GlitchText } from './components/GlitchText';
import { audioEngine } from './services/audioService';

const App: React.FC = () => {
  const [booted, setBooted] = useState(false);

  const handleBoot = () => {
    // Initialize audio context on user interaction
    audioEngine.init();
    setBooted(true);
  };

  if (!booted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-cyan-400 p-4">
        <GlitchText text="NEURAL_OS_v1.0" as="h1" className="text-3xl md:text-5xl mb-8 text-fuchsia-500" />
        <button 
          onClick={handleBoot}
          className="border-2 border-cyan-500 px-6 py-3 hover:bg-cyan-900/50 hover:text-fuchsia-400 transition-colors focus:outline-none animate-pulse"
        >
          [ INITIATE_BOOT_SEQUENCE ]
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 relative z-10">
      <header className="w-full flex justify-between items-start mb-8 border-b-2 border-fuchsia-900 pb-4">
        <div>
          <GlitchText text="TERMINAL_01" as="h1" className="text-xl md:text-2xl text-cyan-400" />
          <div className="text-[10px] text-fuchsia-500 mt-1">SECURE_CONNECTION_ESTABLISHED</div>
        </div>
        <div className="text-right hidden md:block">
          <div className="text-xs text-cyan-600">MEM: 640K OK</div>
          <div className="text-xs text-cyan-600">CPU: NOMINAL</div>
        </div>
      </header>

      <main className="flex-grow flex flex-col lg:flex-row gap-8 items-center justify-center">
        {/* Left/Top Panel: Music Player */}
        <div className="w-full lg:w-1/3 flex flex-col justify-center order-2 lg:order-1">
          <MusicPlayer />
          
          {/* Decorative terminal output */}
          <div className="mt-8 border border-cyan-900 p-4 h-48 overflow-hidden hidden md:block bg-black/50">
            <div className="text-[10px] text-cyan-700 font-mono leading-tight animate-[scroll_20s_linear_infinite]">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i}>
                  {`> 0x${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase()} : ${Math.random() > 0.5 ? 'ALLOCATING' : 'PARSING'} DATA_BLOCK_${i}`}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center/Right Panel: Game */}
        <div className="w-full lg:w-2/3 flex justify-center order-1 lg:order-2">
          <SnakeGame />
        </div>
      </main>

      <footer className="mt-8 text-center text-[10px] text-cyan-800 border-t border-cyan-900 pt-4">
        WARNING: PROLONGED EXPOSURE MAY CAUSE NEURAL DESYNC.
      </footer>
      
      <style>{`
        @keyframes scroll {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
      `}</style>
    </div>
  );
};

export default App;
