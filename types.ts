export interface Entity {
  name: string;
  type: string;
  context: string;
}

export interface Summary {
  tldr: string;
  bullets: string[];
  entities: Entity[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}