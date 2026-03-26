import type { ToolCall } from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export async function streamMessage(
  conversationId: string,
  userMessage: string,
  files: File[],
  onText: (chunk: string) => void,
  onToolCall: (toolCall: ToolCall) => void,
): Promise<void> {
  const formData = new FormData();
  formData.append('message', userMessage);
  for (const file of files) {
    formData.append('attachments', file);
  }

  const response = await fetch(`${BASE_URL}/conversations/${conversationId}/messages/stream`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    let eventType = '';
    for (const line of lines) {
      if (line.startsWith('event:')) {
        eventType = line.slice(6).trim();
      } else if (line.startsWith('data:')) {
        const raw = line.slice(5).trim();
        try {
          const data = JSON.parse(raw);
          const resolvedType = eventType || (data.text !== undefined ? 'text' : 'tool_call');
          if (resolvedType === 'text') {
            onText(data.text ?? '');
          } else if (resolvedType === 'tool_call') {
            onToolCall(data as ToolCall);
          }
        } catch {
          // ignore malformed data lines
        }
        eventType = '';
      }
    }
  }
}
