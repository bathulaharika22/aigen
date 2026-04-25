export interface Point {
  x: number;
  y: number;
}

export interface Track {
  id: string;
  title: string;
  type: 'drone' | 'arp' | 'noise';
}

export enum GameState {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER'
}
