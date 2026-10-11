export interface ChatMessage {
  from: 'user' | 'agent';
  text: string;
}