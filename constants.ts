
import { GameWord } from "./types";

export const GERMAN_ALPHABET = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
  'Ä', 'Ö', 'Ü', 'ẞ'
];

export const GAME_WORDS = [
  'GROẞZÜGIGKEIT',
  'VERGEBUNG',
  'GEBET',
  'RUHE',
  'NÄCHSTENLIEBE',
  'VERURTEILT NICHT'
];

export const FALLBACK_WORDS: GameWord[] = GAME_WORDS.map(w => ({
  word: w,
  hint: "",
  category: ""
}));

export const MAX_LIVES = 6;
