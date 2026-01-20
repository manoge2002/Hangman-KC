import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";

// --- KONSTANTEN & TYPEN ---

const GERMAN_ALPHABET = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
  'Ä', 'Ö', 'Ü', 'ẞ'
];

const GAME_WORDS = [
  'GROẞZÜGIGKEIT',
  'VERGEBUNG',
  'GEBET',
  'RUHE',
  'NÄCHSTENLIEBE',
  'VERURTEILT NICHT'
];

const MAX_LIVES = 6;

enum GameStatus {
  PLAYING = 'PLAYING',
  WON = 'WON',
  LOST = 'LOST'
}

// --- KOMPONENTEN ---

const HangmanDrawing: React.FC<{ wrongGuesses: number }> = ({ wrongGuesses }) => {
  const strokeColor = "#f1f5f9";
  const base = <line x1="15" y1="345" x2="285" y2="345" stroke={strokeColor} strokeWidth="6" />;
  const pillar = <line x1="75" y1="345" x2="75" y2="30" stroke={strokeColor} strokeWidth="6" />;
  const top = <line x1="75" y1="30" x2="210" y2="30" stroke={strokeColor} strokeWidth="6" />;
  const rope = <line x1="210" y1="30" x2="210" y2="75" stroke={strokeColor} strokeWidth="3" />;

  const head = <circle cx="210" cy="105" r="30" stroke={strokeColor} strokeWidth="6" fill="none" key="head" />;
  const body = <line x1="210" y1="135" x2="210" y2="225" stroke={strokeColor} strokeWidth="6" key="body" />;
  const leftArm = <line x1="210" y1="165" x2="165" y2="195" stroke={strokeColor} strokeWidth="6" key="leftArm" />;
  const rightArm = <line x1="210" y1="165" x2="255" y2="195" stroke={strokeColor} strokeWidth="6" key="rightArm" />;
  const leftLeg = <line x1="210" y1="225" x2="165" y2="285" stroke={strokeColor} strokeWidth="6" key="leftLeg" />;
  const rightLeg = <line x1="210" y1="225" x2="255" y2="285" stroke={strokeColor} strokeWidth="6" key="rightLeg" />;

  const bodyParts = [head, body, leftArm, rightArm, leftLeg, rightLeg];

  return (
    <div className="flex justify-center items-center py-8">
      <svg height="360" width="300" className="drop-shadow-2xl">
        {base}
        {pillar}
        {top}
        {rope}
        {bodyParts.slice(0, wrongGuesses)}
      </svg>
    </div>
  );
};

const Keyboard: React.FC<{
  guessedLetters: string[];
  onLetterClick: (letter: string) => void;
  disabled?: boolean;
}> = ({ guessedLetters, onLetterClick, disabled }) => {
  return (
    <div className="grid grid-cols-6 sm:grid-cols-10 gap-3 p-6 bg-slate-900/40 rounded-[2.5rem] shadow-2xl max-w-5xl mx-auto border border-white/5 backdrop-blur-sm">
      {GERMAN_ALPHABET.map((letter) => {
        const isGuessed = guessedLetters.includes(letter);
        return (
          <button
            key={letter}
            onClick={() => onLetterClick(letter)}
            disabled={isGuessed || disabled}
            className={`
              h-14 md:h-20 w-full flex items-center justify-center rounded-2xl font-black text-xl md:text-3xl transition-all
              ${isGuessed 
                ? 'bg-slate-950/30 text-slate-800 cursor-not-allowed border-transparent' 
                : 'bg-slate-800/50 text-indigo-300 border border-white/10 hover:bg-indigo-600/30 hover:border-indigo-500/50 active:scale-90 shadow-lg'
              }
              ${disabled && !isGuessed ? 'opacity-30 cursor-not-allowed' : ''}
            `}
          >
            {letter}
          </button>
        );
      })}
    </div>
  );
};

// --- HAUPT APP ---

const App: React.FC = () => {
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [status, setStatus] = useState<GameStatus>(GameStatus.PLAYING);
  const [scale, setScale] = useState<number>(1.0);

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
      if (e.key === 'ß' || key === 'SS') key = 'ẞ';
      const validChars = /^[A-ZÄÖÜẞ]$/;
      if (validChars.test(key)) {
        handleLetterClick(key);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleLetterClick]);

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen flex flex-col items-center justify-center py-8 px-4 md:px-12 overflow-hidden relative">
      <main 
        className="w-full max-w-[2000px] grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start transition-transform duration-300"
        style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
      >
        {/* Sidebar */}
        <div className="lg:col-span-3 lg:sticky lg:top-8 flex flex-col items-center space-y-6 md:space-y-12">
          <div className="w-full bg-slate-900/40 p-6 md:p-8 rounded-[4rem] border border-white/5 backdrop-blur-sm flex flex-col items-center shadow-2xl">
            <HangmanDrawing wrongGuesses={wrongGuesses} />
          </div>

          <div className="w-full bg-slate-900/40 p-10 rounded-[3rem] border border-white/5 backdrop-blur-sm flex items-center justify-center shadow-2xl">
            <div className="flex flex-col items-center gap-4">
              <span className="text-6xl animate-pulse mb-2">❤️</span>
              <span className="text-3xl md:text-5xl font-black tracking-widest uppercase text-white whitespace-nowrap">
                {livesLeft} / {MAX_LIVES}
              </span>
            </div>
          </div>
          
          <div 
            onClick={startNewGame}
            className="cursor-pointer text-[10px] md:text-xs text-slate-700 hover:text-slate-400 uppercase tracking-widest transition-colors font-bold py-2 px-4"
          >
            Spiel zurücksetzen
          </div>
        </div>

        {/* Wort-Bereich */}
        <div className="lg:col-span-9 space-y-12 md:space-y-16 flex flex-col items-center w-full">
          <div className="w-fit min-w-[300px] space-y-10 md:space-y-16 bg-slate-900/40 p-12 md:p-20 rounded-[5rem] border border-white/5 flex flex-col items-center shadow-2xl mx-auto overflow-visible">
            {GAME_WORDS.map((word, wordIdx) => (
              <div key={wordIdx} className="flex justify-center gap-2 md:gap-4 whitespace-nowrap min-w-max px-8">
                {word.split("").map((letter, lIdx) => (
                  <div 
                    key={lIdx}
                    className={`w-8 h-12 md:w-16 md:h-28 flex items-center justify-center ${
                      letter === ' ' ? 'w-8 md:w-16' : 'border-b-4 md:border-b-8 border-slate-800'
                    }`}
                  >
                    {letter !== ' ' && (
                      <span className={`text-4xl md:text-8xl font-black mono transition-all duration-500 ${
                        guessedLetters.includes(letter) || status === GameStatus.LOST ? 'opacity-100' : 'opacity-0'
                      } ${
                        status === GameStatus.WON 
                        ? 'text-emerald-400 drop-shadow-[0_0_25px_rgba(52,211,153,1)] animate-win-glow' 
                        : (status === GameStatus.LOST && !guessedLetters.includes(letter)) 
                          ? 'text-rose-500' 
                          : 'text-indigo-400'
                      }`}>
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

      {/* Skalierungs-Controls */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        <button 
          onClick={() => setScale(prev => Math.min(prev + 0.1, 2.0))}
          className="w-10 h-10 md:w-12 md:h-12 bg-slate-800 hover:bg-slate-700 text-white rounded-xl flex items-center justify-center text-xl font-bold border border-white/10 shadow-2xl"
        >
          +
        </button>
        <button 
          onClick={() => setScale(prev => Math.max(prev - 0.1, 0.5))}
          className="w-10 h-10 md:w-12 md:h-12 bg-slate-800 hover:bg-slate-700 text-white rounded-xl flex items-center justify-center text-xl font-bold border border-white/10 shadow-2xl"
        >
          -
        </button>
        <div className="text-[11px] text-slate-500 text-center font-black bg-slate-900/80 px-2 py-1 rounded-md backdrop-blur-sm">
          {Math.round(scale * 100)}%
        </div>
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);