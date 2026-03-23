import { useState } from 'react';
import type { ToolCall } from '../types';

interface ToolCallBlockProps {
  toolCall: ToolCall;
}

const toolIcons: Record<string, string> = {
  web_search: 'M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z',
  file_read: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6',
  file_write: 'M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z',
};

function getToolLabel(toolCall: ToolCall): string {
  switch (toolCall.toolName) {
    case 'web_search':
      return `Searching: ${(toolCall.input as { query?: string }).query ?? '...'}`;
    case 'file_read':
      return `Reading: ${(toolCall.input as { path?: string }).path ?? '...'}`;
    case 'file_write':
      return `Writing: ${(toolCall.input as { path?: string }).path ?? '...'}`;
    default:
      return `Tool: ${toolCall.toolName}`;
  }
}

export default function ToolCallBlock({ toolCall }: ToolCallBlockProps) {
  const [expanded, setExpanded] = useState(false);
  const label = getToolLabel(toolCall);
  const isRunning = toolCall.status === 'running';
  const isError = toolCall.status === 'error';
  const iconPath = toolIcons[toolCall.toolName] ?? 'M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z';

  return (
    <div>
      <button
        onClick={() => !isRunning && setExpanded(!expanded)}
        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium transition-all duration-150 cursor-pointer"
        style={{
          background: isRunning
            ? 'var(--accent-light)'
            : isError
              ? '#FEF2F2'
              : 'var(--bg-secondary)',
          color: isRunning
            ? 'var(--accent)'
            : isError
              ? '#DC2626'
              : 'var(--text-secondary)',
          border: `1px solid ${isRunning ? 'var(--accent-muted)' : isError ? '#FECACA' : 'var(--border-subtle)'}`,
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={isRunning ? 'tool-running' : ''}
        >
          <path d={iconPath} />
        </svg>
        <span className="flex-1 truncate">{label}</span>
        {!isRunning && (
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        )}
      </button>
      {expanded && !isRunning && (
        <div className="tool-expand-enter">
          <pre
            className="mt-1.5 overflow-x-auto rounded-lg p-3 text-xs leading-relaxed"
            style={{
              background: 'var(--bg-secondary)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div className="mb-1 text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
              Input
            </div>
            {JSON.stringify(toolCall.input, null, 2)}
            {toolCall.output && (
              <>
                <div className="mt-3 mb-1 text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Output
                </div>
                {toolCall.output}
              </>
            )}
          </pre>
        </div>
      )}
    </div>
  );
}
