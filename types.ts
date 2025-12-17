
export enum AppView {
  DASHBOARD = 'DASHBOARD',
  IDEA_GENERATOR = 'IDEA_GENERATOR',
  CHARACTER_DESIGNER = 'CHARACTER_DESIGNER',
  WORLD_BUILDER = 'WORLD_BUILDER',
  WRITING_GAME = 'WRITING_GAME'
}

export interface GeneratedCharacter {
  name: string;
  role: string;
  backstory: string;
  stats: {
    strength: number;
    agility: number;
    intelligence: number;
    charisma: number;
  };
  imageUrl?: string;
}

export interface GameIdea {
  title: string;
  genre: string;
  platform: string;
  coreLoop: string;
  uniqueSellingPoint: string;
  storySynopsis: string;
}

export interface WorldLore {
  regionName: string;
  climate: string;
  factions: string[];
  history: string;
  keyLocations: string[];
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Game Specific Types
export interface WritingChallenge {
  topic: string;
  exampleSentence: string;
  stepDescription: string;
  difficulty: string;
}

export interface ChallengeResult {
  isCorrect: boolean;
  feedback: string;
}

export interface BookPage {
  text: string;
  imageUrl: string;
}

export interface IllustrationOption {
  id: string;
  imageUrl: string;
  style: string;
}
