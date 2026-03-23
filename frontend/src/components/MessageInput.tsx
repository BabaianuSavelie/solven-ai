import { useState } from 'react';
import type { KeyboardEvent } from 'react';

interface MessageInputProps {
  onSend: (content: string) => void;
  disabled: boolean;
}

export default function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [value, setValue] = useState('');

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div className="px-6 pb-4 pt-2" style={{ background: 'var(--bg-primary)' }}>
      <div className="mx-auto max-w-3xl">
        <div
          className="flex items-end gap-2 rounded-2xl px-4 py-3"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}
        >
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message AI Assistant..."
            disabled={disabled}
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-[var(--text-tertiary)] disabled:opacity-50"
            style={{
              color: 'var(--text-primary)',
              maxHeight: '140px',
              minHeight: '24px',
              lineHeight: '1.5',
            }}
          />
          <button
            onClick={handleSend}
            disabled={!canSend}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-150 cursor-pointer disabled:cursor-default"
            style={{
              background: canSend ? 'var(--accent)' : '#dbeafe',
              color: canSend ? '#fff' : '#93c5fd',
            }}
            onMouseEnter={(e) => { if (canSend) e.currentTarget.style.background = 'var(--accent-hover)'; }}
            onMouseLeave={(e) => { if (canSend) e.currentTarget.style.background = 'var(--accent)'; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <p className="mt-2 text-center text-xs" style={{ color: 'var(--text-tertiary)' }}>
          AI can make mistakes. Consider checking important information.
        </p>
      </div>
    </div>
  );
}
