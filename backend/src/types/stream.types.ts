export type MessageStreamEvent =
  | { type: 'text'; delta: string }
  | { type: 'tool'; name: string; input?: unknown };
