import React from 'react';
import { GERMAN_ALPHABET } from '../constants';

interface KeyboardProps {
  guessedLetters: string[];
  onLetterClick: (letter: string) => void;
  disabled?: boolean;
}

const Keyboard: React.FC<KeyboardProps> = ({ guessedLetters, onLetterClick, disabled }) => {
  return (
    <div className="grid grid-cols-7 sm:grid-cols-10 gap-3 p-6 bg-white/5 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl max-w-5xl mx-auto border border-white/10 ring-1 ring-white/5">
      {GERMAN_ALPHABET.map((letter) => {
        const isGuessed = guessedLetters.includes(letter);
        return (
          <button
            key={letter}
            onClick={() => onLetterClick(letter)}
            disabled={isGuessed || disabled}
            className={`
              h-14 md:h-20 w-full flex items-center justify-center rounded-2xl font-black text-xl md:text-3xl transition-all duration-300 relative overflow-hidden group
              ${isGuessed 
                ? 'bg-black/20 text-slate-500/50 cursor-not-allowed border border-transparent' 
                : 'bg-white/5 text-indigo-100 border border-white/10 hover:bg-white/10 hover:border-white/30 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] active:scale-95 shadow-lg'
              }
              ${disabled && !isGuessed ? 'opacity-30 cursor-not-allowed' : ''}
            `}
          >
            {/* Glass shine effect */}
            {!isGuessed && !disabled && (
              <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent z-0 pointer-events-none" />
            )}
            <span className="relative z-10">{letter}</span>
          </button>
        );
      })}
    </div>
  );
};

export default Keyboard;