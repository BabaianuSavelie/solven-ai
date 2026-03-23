import type { Message } from '../types';
import ToolCallBlock from './ToolCallBlock';

interface MessageBubbleProps {
  message: Message;
}

function renderMarkdown(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Split on fenced code blocks
  const blockParts = text.split(/(```[\s\S]*?```)/g);

  blockParts.forEach((part, bi) => {
    if (part.startsWith('```')) {
      const inner = part.slice(3, -3);
      const newline = inner.indexOf('\n');
      const code = newline !== -1 ? inner.slice(newline + 1) : inner;
      nodes.push(
        <pre
          key={`code-${bi}`}
          className="rounded-md px-4 py-3 my-2 overflow-x-auto text-xs leading-relaxed"
          style={{ background: '#f1f5f9', fontFamily: 'ui-monospace, monospace', color: '#1e293b' }}
        >
          {code}
        </pre>
      );
      return;
    }

    // Process inline: split by lines
    const lines = part.split('\n');
    lines.forEach((line, li) => {
      const segments: React.ReactNode[] = [];
      const inlineParts = line.split(/(\*\*[^*]+\*\*)/g);
      inlineParts.forEach((seg, si) => {
        if (seg.startsWith('**') && seg.endsWith('**')) {
          segments.push(<strong key={si}>{seg.slice(2, -2)}</strong>);
        } else {
          segments.push(seg);
        }
      });
      nodes.push(<span key={`line-${bi}-${li}`}>{segments}{li < lines.length - 1 ? <br /> : null}</span>);
    });
  });

  return nodes;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className="message-enter flex gap-3 py-1">
      {/* Avatar */}
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full mt-0.5"
        style={{
          background: isUser ? 'var(--accent)' : '#e5e7eb',
          color: isUser ? '#fff' : '#6b7280',
        }}
      >
        {isUser ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="10" rx="2" />
            <path d="M12 11V7" />
            <circle cx="12" cy="5" r="2" />
            <path d="M7 16h.01M12 16h.01M17 16h.01" strokeWidth="2.5" />
          </svg>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div
          className="mb-1 text-xs font-semibold"
          style={{ color: 'var(--text-tertiary)' }}
        >
          {isUser ? 'You' : 'Assistant'}
        </div>

        {!isUser && message.toolCalls.length > 0 && (
          <div className="mb-2 space-y-1.5">
            {message.toolCalls.map((tc) => (
              <ToolCallBlock key={tc.id} toolCall={tc} />
            ))}
          </div>
        )}

        {(message.content || isUser) && (
          <div
            className="text-sm leading-relaxed"
            style={{ color: 'var(--text-primary)' }}
          >
            {message.content ? (
              renderMarkdown(message.content)
            ) : (
              <span className="flex items-center gap-1.5 mt-1">
                <span className="typing-dot inline-block h-1.5 w-1.5 rounded-full" style={{ background: 'var(--text-tertiary)' }} />
                <span className="typing-dot inline-block h-1.5 w-1.5 rounded-full" style={{ background: 'var(--text-tertiary)' }} />
                <span className="typing-dot inline-block h-1.5 w-1.5 rounded-full" style={{ background: 'var(--text-tertiary)' }} />
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
