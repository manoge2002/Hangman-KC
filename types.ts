
export enum GameStatus {
  PLAYING = 'PLAYING',
  WON = 'WON',
  LOST = 'LOST',
  LOADING = 'LOADING'
}

export interface GameWord {
  word: string;
  hint: string;
  category?: string;
}

export type Alphabet = string[];
