import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Point, GameState } from '../types';
import { GlitchText } from './GlitchText';

const GRID_SIZE = 20;
const INITIAL_SPEED = 150;

const generateFood = (snake: Point[]): Point => {
  let newFood: Point;
  while (true) {
    newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
    // eslint-disable-next-line no-loop-func
    const isOnSnake = snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
    if (!isOnSnake) break;
  }
  return newFood;
};

export const SnakeGame: React.FC = () => {
  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Point>({ x: 15, y: 10 });
  const [direction, setDirection] = useState<Point>({ x: 1, y: 0 });
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [score, setScore] = useState(0);
  
  // Use refs for state accessed inside the interval to avoid stale closures
  const directionRef = useRef(direction);
  const nextDirectionRef = useRef(direction);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  const resetGame = useCallback(() => {
    setSnake([{ x: 10, y: 10 }]);
    setDirection({ x: 1, y: 0 });
    nextDirectionRef.current = { x: 1, y: 0 };
    setScore(0);
    setFood(generateFood([{ x: 10, y: 10 }]));
    setGameState(GameState.PLAYING);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameState !== GameState.PLAYING) {
      if (e.code === 'Space' || e.code === 'Enter') {
        resetGame();
      }
      return;
    }

    // Prevent default scrolling
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault();
    }

    const currentDir = directionRef.current;
    switch (e.code) {
      case 'ArrowUp':
      case 'KeyW':
        if (currentDir.y !== 1) nextDirectionRef.current = { x: 0, y: -1 };
        break;
      case 'ArrowDown':
      case 'KeyS':
        if (currentDir.y !== -1) nextDirectionRef.current = { x: 0, y: 1 };
        break;
      case 'ArrowLeft':
      case 'KeyA':
        if (currentDir.x !== 1) nextDirectionRef.current = { x: -1, y: 0 };
        break;
      case 'ArrowRight':
      case 'KeyD':
        if (currentDir.x !== -1) nextDirectionRef.current = { x: 1, y: 0 };
        break;
    }
  }, [gameState, resetGame]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (gameState !== GameState.PLAYING) return;

    const moveSnake = () => {
      setSnake(prevSnake => {
        const head = prevSnake[0];
        const currentDir = nextDirectionRef.current;
        setDirection(currentDir); // Update actual state for next render

        const newHead = {
          x: head.x + currentDir.x,
          y: head.y + currentDir.y
        };

        // Wall collision
        if (
          newHead.x < 0 || newHead.x >= GRID_SIZE ||
          newHead.y < 0 || newHead.y >= GRID_SIZE
        ) {
          setGameState(GameState.GAME_OVER);
          return prevSnake;
        }

        // Self collision
        if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameState(GameState.GAME_OVER);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(s => s + 10);
          setFood(generateFood(newSnake));
          // Don't pop the tail, snake grows
        } else {
          newSnake.pop(); // Remove tail
        }

        return newSnake;
      });
    };

    // Speed increases slightly as score goes up
    const currentSpeed = Math.max(50, INITIAL_SPEED - Math.floor(score / 50) * 10);
    const intervalId = setInterval(moveSnake, currentSpeed);

    return () => clearInterval(intervalId);
  }, [gameState, food, score]);

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto">
      <div className="w-full flex justify-between items-end mb-2 px-2">
        <div className="text-cyan-400 text-xs md:text-sm">
          SYS.SCORE: <span className="text-fuchsia-500">{score.toString().padStart(4, '0')}</span>
        </div>
        <div className="text-cyan-400 text-xs md:text-sm">
          STATUS: <span className={gameState === GameState.PLAYING ? 'text-green-400' : 'text-red-500 animate-pulse'}>{gameState}</span>
        </div>
      </div>

      <div 
        className="relative bg-black border-4 border-cyan-500 shadow-[0_0_20px_rgba(0,255,255,0.2)]"
        style={{ 
          width: '100%', 
          aspectRatio: '1/1',
          maxWidth: '500px'
        }}
      >
        {/* Grid Background */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(#0ff 1px, transparent 1px), linear-gradient(90deg, #0ff 1px, transparent 1px)',
            backgroundSize: `${100 / GRID_SIZE}% ${100 / GRID_SIZE}%`
          }}
        />

        {/* Snake */}
        {snake.map((segment, i) => (
          <div
            key={`${segment.x}-${segment.y}-${i}`}
            className={`absolute ${i === 0 ? 'bg-fuchsia-500 z-10' : 'bg-cyan-400 opacity-80'}`}
            style={{
              left: `${(segment.x / GRID_SIZE) * 100}%`,
              top: `${(segment.y / GRID_SIZE) * 100}%`,
              width: `${100 / GRID_SIZE}%`,
              height: `${100 / GRID_SIZE}%`,
              boxShadow: i === 0 ? '0 0 10px #f0f' : 'none',
              transform: 'scale(0.9)' // Slight gap between segments
            }}
          />
        ))}

        {/* Food */}
        <div
          className="absolute bg-yellow-400 animate-pulse"
          style={{
            left: `${(food.x / GRID_SIZE) * 100}%`,
            top: `${(food.y / GRID_SIZE) * 100}%`,
            width: `${100 / GRID_SIZE}%`,
            height: `${100 / GRID_SIZE}%`,
            boxShadow: '0 0 15px #ff0',
            transform: 'scale(0.8)'
          }}
        />

        {/* Overlays */}
        {gameState === GameState.IDLE && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20">
            <GlitchText text="SNAKE.EXE" as="h2" className="text-2xl md:text-4xl mb-4 text-fuchsia-500" />
            <p className="text-cyan-400 text-xs md:text-sm animate-pulse text-center px-4">
              PRESS [SPACE] TO INITIALIZE
            </p>
          </div>
        )}

        {gameState === GameState.GAME_OVER && (
          <div className="absolute inset-0 bg-red-900/40 flex flex-col items-center justify-center z-20 backdrop-blur-sm">
            <GlitchText text="SYSTEM_FAILURE" as="h2" className="text-2xl md:text-4xl mb-4 text-red-500" />
            <p className="text-cyan-400 text-xs md:text-sm mb-2">FINAL_SCORE: {score}</p>
            <p className="text-fuchsia-500 text-xs md:text-sm animate-pulse mt-4 text-center px-4">
              PRESS [SPACE] TO REBOOT
            </p>
          </div>
        )}
      </div>
      
      <div className="mt-4 text-gray-500 text-[10px] md:text-xs text-center">
        USE [W][A][S][D] OR [ARROW_KEYS] TO NAVIGATE
      </div>
    </div>
  );
};
