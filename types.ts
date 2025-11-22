export interface SystemPlan {
  id: string;
  goal: string;
  microAction: string;
  cue: string;
  environment: string;
  reward: string;
  streak: number;
  lastCompleted: string | null; // ISO Date string
  history: string[]; // Array of ISO Date strings
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  BUILDER = 'BUILDER',
  LEARN = 'LEARN'
}

export interface GemeniSystemResponse {
  microAction: string;
  cue: string;
  environment: string;
  reward: string;
  advice: string;
}

// For the learning section content
export interface PrincipleCard {
  title: string;
  description: string;
  source: string;
  icon: string;
}