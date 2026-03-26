export type ToolStatus = 'running' | 'done' | 'error';
export type Role = 'user' | 'assistant';

export interface ToolCall {
  id: string;
  toolName: string;
  status: ToolStatus;
  input: Record<string, unknown>;
  output?: string;
}

export interface MessageAttachment {
  name: string;
  mimeType: string;
  previewUrl: string;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  toolCalls: ToolCall[];
  attachments: MessageAttachment[];
  createdAt: Date;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: Date;
  messages: Message[];
}
