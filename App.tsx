import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GameStatus } from './types';
import { MAX_LIVES, GAME_WORDS } from './constants';
import HangmanDrawing from './components/HangmanDrawing';
import Keyboard from './components/Keyboard';

const App: React.FC = () => {
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [status, setStatus] = useState<GameStatus>(GameStatus.PLAYING);
  const [scale, setScale] = useState<number>(1.0);

  // Get all unique guessable letters from all words combined
  const allUniqueLetters = useMemo(() => {
    const combined = GAME_WORDS.join('').replace(/\s/g, '');
    return [...new Set(combined.split(''))];
  }, []);

  const wrongGuesses = useMemo(() => {
    return guessedLetters.filter(letter => 
      !GAME_WORDS.some(word => word.includes(letter))
    ).length;
  }, [guessedLetters]);

  const livesLeft = Math.max(0, MAX_LIVES - wrongGuesses);
  const isWinner = useMemo(() => {
    return allUniqueLetters.length > 0 && allUniqueLetters.every(l => guessedLetters.includes(l));
  }, [allUniqueLetters, guessedLetters]);

  const isLoser = wrongGuesses >= MAX_LIVES;

  useEffect(() => {
    if (isWinner) setStatus(GameStatus.WON);
    else if (isLoser) setStatus(GameStatus.LOST);
    else setStatus(GameStatus.PLAYING);
  }, [isWinner, isLoser]);

  const handleLetterClick = useCallback((letter: string) => {
    if (status !== GameStatus.PLAYING || guessedLetters.includes(letter)) return;
    setGuessedLetters(prev => [...prev, letter]);
  }, [status, guessedLetters]);

  const startNewGame = useCallback(() => {
    setGuessedLetters([]);
    setStatus(GameStatus.PLAYING);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let key = e.key.toUpperCase();
      // Special handling for the sharp S to ensure consistency with 'ẞ'
      if (e.key === 'ß' || key === 'SS') key = 'ẞ';
      
      const validChars = /^[A-ZÄÖÜẞ]$/;
      if (validChars.test(key)) {
        handleLetterClick(key);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleLetterClick]);

  const increaseScale = () => setScale(prev => Math.min(prev + 0.1, 2.0));
  const decreaseScale = () => setScale(prev => Math.max(prev - 0.1, 0.5));

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start py-8 px-4 md:px-8 overflow-x-hidden relative">
      <main 
        className="w-full max-w-[2200px] grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start transition-transform duration-300"
        style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
      >
        
        {/* Sidebar: Drawing & Lives */}
        <div className="lg:col-span-3 lg:sticky lg:top-8 flex flex-col items-center space-y-6 md:space-y-12">
          
          {/* Gallows Box - Liquid Glass */}
          <div className="w-full bg-white/5 backdrop-blur-2xl border border-white/10 p-6 md:p-8 rounded-[4rem] shadow-2xl flex flex-col items-center ring-1 ring-white/5">
            <HangmanDrawing wrongGuesses={wrongGuesses} />
          </div>

          {/* Life Box - Liquid Glass */}
          <div className="w-full bg-white/5 backdrop-blur-2xl border border-white/10 p-10 rounded-[3rem] shadow-2xl flex items-center justify-center ring-1 ring-white/5">
            <div className="flex flex-col items-center gap-4">
              <span className="text-6xl animate-pulse mb-2 drop-shadow-lg">❤️</span>
              <span className="text-3xl md:text-5xl font-black tracking-widest uppercase text-white whitespace-nowrap drop-shadow-md">
                {livesLeft} / {MAX_LIVES}
              </span>
            </div>
          </div>
          
          <button 
            onClick={startNewGame}
            className="text-[10px] md:text-xs text-indigo-200 hover:text-white uppercase tracking-widest transition-colors font-bold py-2 px-4 rounded-full hover:bg-white/5"
          >
            Spiel zurücksetzen
          </button>
        </div>

        {/* Game Area: Words & Keyboard */}
        <div className="lg:col-span-9 space-y-12 md:space-y-16 flex flex-col items-center w-full">
          
          {/* Responsive Words List Box - Liquid Glass */}
          <div className="w-full max-w-full space-y-10 md:space-y-16 bg-white/5 backdrop-blur-2xl border border-white/10 p-8 md:p-16 rounded-[4rem] shadow-2xl flex flex-col items-center mx-auto overflow-hidden ring-1 ring-white/5">
            {GAME_WORDS.map((word, wordIdx) => (
              <div 
                key={wordIdx} 
                className="w-full flex justify-center flex-wrap gap-x-2 gap-y-4 md:gap-x-4 px-2 md:px-6 items-center"
              >
                {word.split("").map((letter, lIdx) => (
                  <div 
                    key={lIdx}
                    className={`
                      flex flex-col items-center justify-end
                      w-8 md:w-14 h-16 md:h-32 
                      ${letter === ' ' ? 'w-4 md:w-8 border-none' : 'border-b-4 border-white/30'}
                    `}
                  >
                    {letter !== ' ' && (
                      <span className={`
                        text-2xl md:text-6xl font-black mono transition-all duration-500 mb-2
                        ${guessedLetters.includes(letter) || status === GameStatus.LOST ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-4'} 
                        ${status === GameStatus.WON 
                          ? 'text-emerald-300 drop-shadow-[0_0_15px_rgba(52,211,153,0.8)]' 
                          : (status === GameStatus.LOST && !guessedLetters.includes(letter)) 
                            ? 'text-rose-400 drop-shadow-[0_0_10px_rgba(251,113,133,0.5)]' 
                            : 'text-indigo-200 drop-shadow-md'}
                      `}>
                        {letter}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="w-full">
            <Keyboard 
              guessedLetters={guessedLetters} 
              onLetterClick={handleLetterClick} 
              disabled={status !== GameStatus.PLAYING}
            />
          </div>
        </div>
      </main>

      {/* Control UI - Liquid Glass Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        <button 
          onClick={increaseScale}
          className="w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-xl flex items-center justify-center text-xl font-bold border border-white/20 transition-all shadow-lg active:scale-90"
        >
          +
        </button>
        <button 
          onClick={decreaseScale}
          className="w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-xl flex items-center justify-center text-xl font-bold border border-white/20 transition-all shadow-lg active:scale-90"
        >
          -
        </button>
        <div className="text-[11px] text-indigo-200 text-center font-black bg-black/40 px-2 py-1 rounded-md backdrop-blur-md border border-white/10">
          {Math.round(scale * 100)}%
        </div>
      </div>
    </div>
  );
};

export default App;