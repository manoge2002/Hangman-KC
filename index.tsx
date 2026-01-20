import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";

// --- Konstanten & Typen ---
const GERMAN_ALPHABET = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
  'Ä', 'Ö', 'Ü', 'ẞ'
];

const INITIAL_WORDS = ['GROẞZÜGIGKEIT', 'VERGEBUNG', 'GEBET', 'RUHE', 'NÄCHSTENLIEBE', 'VERURTEILT NICHT'];
const MAX_LIVES = 6;

// --- KI Service ---
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fetchAIWord = async () => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Generiere ein inspirierendes deutsches Wort oder eine kurze Phrase (max 2 Wörter) für Hangman. Das Thema ist 'Glaube und Werte'. Gib mir das Wort in Großbuchstaben (nutze ẞ statt SS), einen Hinweis und die Kategorie als JSON zurück.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING },
            hint: { type: Type.STRING },
            category: { type: Type.STRING }
          },
          required: ["word", "hint", "category"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (e) {
    console.error("AI Error:", e);
    return null;
  }
};

// --- Komponenten ---

const HangmanDrawing = ({ wrongGuesses }: { wrongGuesses: number }) => {
  const stroke = "#f1f5f9";
  const parts = [
    <circle cx="210" cy="105" r="30" stroke={stroke} strokeWidth="6" fill="none" key="h" />, // Kopf
    <line x1="210" y1="135" x2="210" y2="225" stroke={stroke} strokeWidth="6" key="b" />,   // Körper
    <line x1="210" y1="165" x2="165" y2="195" stroke={stroke} strokeWidth="6" key="la" />,  // L-Arm
    <line x1="210" y1="165" x2="255" y2="195" stroke={stroke} strokeWidth="6" key="ra" />,  // R-Arm
    <line x1="210" y1="225" x2="165" y2="285" stroke={stroke} strokeWidth="6" key="ll" />,  // L-Bein
    <line x1="210" y1="225" x2="255" y2="285" stroke={stroke} strokeWidth="6" key="rl" />,  // R-Bein
  ];

  return (
    <svg height="360" width="300" className="drop-shadow-2xl opacity-90">
      <line x1="15" y1="345" x2="285" y2="345" stroke={stroke} strokeWidth="6" />
      <line x1="75" y1="345" x2="75" y2="30" stroke={stroke} strokeWidth="6" />
      <line x1="75" y1="30" x2="210" y2="30" stroke={stroke} strokeWidth="6" />
      <line x1="210" y1="30" x2="210" y2="75" stroke={stroke} strokeWidth="3" />
      {parts.slice(0, wrongGuesses)}
    </svg>
  );
};

const Keyboard = ({ guessedLetters, onGuess, disabled }: any) => (
  <div className="grid grid-cols-6 sm:grid-cols-10 gap-2 md:gap-3 p-4 md:p-6 bg-slate-900/40 rounded-[2.5rem] border border-white/5 backdrop-blur-xl shadow-2xl w-full max-w-5xl">
    {GERMAN_ALPHABET.map(l => {
      const isGuessed = guessedLetters.includes(l);
      return (
        <button
          key={l}
          onClick={() => onGuess(l)}
          disabled={isGuessed || disabled}
          className={`h-12 md:h-20 flex items-center justify-center rounded-xl md:rounded-2xl font-black text-lg md:text-3xl transition-all shadow-lg
            ${isGuessed 
              ? 'bg-slate-950/40 text-slate-800 border-transparent cursor-not-allowed' 
              : 'bg-slate-800/60 text-indigo-300 border border-white/10 hover:bg-indigo-600/40 hover:border-indigo-500/50 active:scale-90'}`}
        >
          {l}
        </button>
      );
    })}
  </div>
);

// --- Haupt App ---

const App = () => {
  const [words, setWords] = useState<string[]>(INITIAL_WORDS);
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [scale, setScale] = useState(1.0);
  const [isLoading, setIsLoading] = useState(false);
  const [hint, setHint] = useState("");

  const allLetters = useMemo(() => words.join('').replace(/\s/g, '').split(''), [words]);
  const uniqueLetters = useMemo(() => [...new Set(allLetters)], [allLetters]);
  
  const wrongGuesses = guessedLetters.filter(l => !allLetters.includes(l)).length;
  const isWinner = uniqueLetters.length > 0 && uniqueLetters.every(l => guessedLetters.includes(l));
  const isLoser = wrongGuesses >= MAX_LIVES;
  const isGameOver = isWinner || isLoser;

  const handleGuess = useCallback((letter: string) => {
    if (isGameOver || guessedLetters.includes(letter)) return;
    setGuessedLetters(prev => [...prev, letter]);
  }, [isGameOver, guessedLetters]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      let k = e.key.toUpperCase();
      if (e.key === 'ß') k = 'ẞ';
      if (GERMAN_ALPHABET.includes(k)) handleGuess(k);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleGuess]);

  const startAIChallenge = async () => {
    setIsLoading(true);
    const result = await fetchAIWord();
    if (result) {
      setWords([result.word]);
      setHint(result.hint);
      setGuessedLetters([]);
    }
    setIsLoading(false);
  };

  const resetGame = () => {
    setWords(INITIAL_WORDS);
    setGuessedLetters([]);
    setHint("");
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-10 px-4">
      <header className="mb-12 text-center">
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-white mb-2">
          WortHänger
        </h1>
        <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-xs">Konficastle Edition</p>
      </header>

      <main 
        className="w-full max-w-[1800px] grid grid-cols-1 lg:grid-cols-12 gap-8 items-start transition-transform duration-300"
        style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
      >
        {/* Sidebar */}
        <div className="lg:col-span-3 flex flex-col gap-8">
          <div className="bg-slate-900/40 p-8 rounded-[3rem] border border-white/5 backdrop-blur-md flex flex-col items-center shadow-2xl">
            <HangmanDrawing wrongGuesses={wrongGuesses} />
          </div>
          <div className="bg-slate-900/40 p-8 rounded-[2rem] border border-white/5 backdrop-blur-md flex flex-col items-center shadow-2xl">
            <span className="text-5xl mb-2">❤️</span>
            <span className="text-4xl font-black text-white">{Math.max(0, MAX_LIVES - wrongGuesses)} / {MAX_LIVES}</span>
          </div>
          <div className="flex flex-col gap-2">
            <button onClick={resetGame} className="w-full py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl text-xs font-black uppercase tracking-widest transition-all">Standard-Set</button>
            <button onClick={startAIChallenge} disabled={isLoading} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-2xl text-xs font-black uppercase tracking-widest transition-all">
              {isLoading ? "Generiere..." : "KI-Herausforderung"}
            </button>
          </div>
        </div>

        {/* Game Area */}
        <div className="lg:col-span-9 flex flex-col items-center gap-12 w-full">
          <div className="w-full bg-slate-900/40 p-8 md:p-16 rounded-[4rem] border border-white/5 shadow-2xl flex flex-col items-center gap-12 overflow-hidden">
            {hint && <p className="text-indigo-300 font-semibold italic text-lg mb-4 text-center">„{hint}“</p>}
            {words.map((word, wIdx) => (
              <div key={wIdx} className="w-full flex justify-center flex-wrap gap-2 md:gap-4 px-4">
                {word.split('').map((l, lIdx) => (
                  <div key={lIdx} className={`h-12 md:h-28 flex items-center justify-center ${l === ' ' ? 'w-8 md:w-16' : 'flex-1 min-w-[20px] max-w-[80px] border-b-4 md:border-b-8 border-slate-800'}`}>
                    {l !== ' ' && (
                      <span className={`text-2xl sm:text-4xl md:text-7xl font-black mono transition-all duration-500
                        ${guessedLetters.includes(l) || isGameOver ? 'opacity-100' : 'opacity-0'}
                        ${isWinner ? 'text-emerald-400 animate-win-glow' : (isLoser && !guessedLetters.includes(l) ? 'text-rose-500' : 'text-indigo-400')}
                      `}>
                        {l}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <Keyboard guessedLetters={guessedLetters} onGuess={handleGuess} disabled={isGameOver} />
        </div>
      </main>

      {/* Controls */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2">
        <button onClick={() => setScale(s => Math.min(s + 0.1, 2))} className="w-12 h-12 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold border border-white/10 shadow-xl">+</button>
        <button onClick={() => setScale(s => Math.max(s - 0.1, 0.5))} className="w-12 h-12 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold border border-white/10 shadow-xl">-</button>
        <div className="bg-slate-900/80 px-2 py-1 rounded text-[10px] text-center font-black text-slate-500">{Math.round(scale*100)}%</div>
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
