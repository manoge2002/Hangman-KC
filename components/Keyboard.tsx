
import React from 'react';
import { GERMAN_ALPHABET } from '../constants';

interface KeyboardProps {
  guessedLetters: string[];
  onLetterClick: (letter: string) => void;
  disabled?: boolean;
}

const Keyboard: React.FC<KeyboardProps> = ({ guessedLetters, onLetterClick, disabled }) => {
  return (
    <div className="grid grid-cols-7 sm:grid-cols-10 gap-3 p-6 bg-slate-900/40 rounded-[2.5rem] shadow-2xl max-w-5xl mx-auto border border-white/5 backdrop-blur-sm">
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

export default Keyboard;
