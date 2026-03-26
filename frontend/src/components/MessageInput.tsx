import { useRef, useState } from 'react';
import type { DragEvent, KeyboardEvent } from 'react';

interface MessageInputProps {
  onSend: (content: string, files: File[]) => void;
  disabled: boolean;
}

export default function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [value, setValue] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = (incoming: FileList | File[]) => {
    const arr = Array.from(incoming);
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name + f.size));
      return [...prev, ...arr.filter((f) => !existing.has(f.name + f.size))];
    });
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = () => {
    const trimmed = value.trim();
    if ((!trimmed && files.length === 0) || disabled) return;
    onSend(trimmed, files);
    setValue('');
    setFiles([]);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  const canSend = (value.trim().length > 0 || files.length > 0) && !disabled;

  return (
    <div className="px-6 pb-4 pt-2" style={{ background: 'var(--bg-primary)' }}>
      <div className="mx-auto max-w-3xl">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="rounded-2xl px-4 py-3 transition-colors"
          style={{
            background: isDragging ? 'var(--accent-light)' : 'var(--bg-elevated)',
            border: isDragging ? '1.5px dashed var(--accent)' : '1px solid var(--border-subtle)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}
        >
          {/* File previews */}
          {files.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {files.map((file, i) => {
                const isImage = file.type.startsWith('image/');
                const previewUrl = isImage ? URL.createObjectURL(file) : null;
                return (
                  <div
                    key={i}
                    className="relative flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs"
                    style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)' }}
                  >
                    {isImage && previewUrl ? (
                      <img src={previewUrl} alt={file.name} className="h-8 w-8 rounded object-cover" />
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    )}
                    <span className="max-w-[120px] truncate" style={{ color: 'var(--text-secondary)' }}>
                      {file.name}
                    </span>
                    <button
                      onClick={() => removeFile(i)}
                      className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full transition-colors hover:bg-red-100"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex items-end gap-2">
            {/* Attach button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-150 cursor-pointer disabled:cursor-default disabled:opacity-40"
              style={{ color: 'var(--text-tertiary)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              title="Attach files"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => { if (e.target.files) { addFiles(e.target.files); e.target.value = ''; } }}
            />

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

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={!canSend}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-150 cursor-pointer disabled:cursor-default"
              style={{
                background: canSend ? 'var(--accent)' : '#dbeafe',
                color: canSend ? '#fff' : '#93c5fd',
              }}
              onMouseEnter={(e) => { if (canSend) e.currentTarget.style.background = 'var(--accent-hover)'; }}
              onMouseLeave={(e) => { if (canSend) e.currentTarget.style.background = canSend ? 'var(--accent)' : '#dbeafe'; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
        <p className="mt-2 text-center text-xs" style={{ color: 'var(--text-tertiary)' }}>
          AI can make mistakes. Consider checking important information.
        </p>
      </div>
    </div>
  );
}
