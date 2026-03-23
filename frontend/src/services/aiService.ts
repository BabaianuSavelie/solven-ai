import type { ToolCall } from '../types';

const mockTools: ToolCall[] = [
  {
    id: 'tc-1',
    toolName: 'web_search',
    status: 'done',
    input: { query: 'latest AI research papers 2026' },
    output: 'Found 12 relevant results from arxiv.org and scholar.google.com',
  },
  {
    id: 'tc-2',
    toolName: 'file_read',
    status: 'done',
    input: { path: '/src/components/App.tsx' },
    output: 'import React from "react";\n\nexport default function App() { ... }',
  },
  {
    id: 'tc-3',
    toolName: 'file_write',
    status: 'done',
    input: { path: '/src/utils/helpers.ts', content: 'export function formatDate...' },
    output: 'File written successfully.',
  },
];

const mockResponses = [
  "I found some interesting results. Here's a summary of the latest research in AI alignment and safety.",
  "I've read the file. It contains a standard React component with a default export.",
  "Done! I've written the helper utility file with the formatting functions you requested.",
];

let callIndex = 0;

export async function sendMessage(
  _userMessage: string,
): Promise<{ content: string; toolCalls: ToolCall[] }> {
  const idx = callIndex % mockResponses.length;
  callIndex++;

  await new Promise((resolve) => setTimeout(resolve, 1500));

  return {
    content: mockResponses[idx],
    toolCalls: [{ ...mockTools[idx], id: `tc-${Date.now()}` }],
  };
}
