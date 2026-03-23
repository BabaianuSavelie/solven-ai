import { useMessages } from '../hooks/useMessages';
import { useConversationsStore } from '../store/conversationsStore';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

export default function ChatPanel() {
  const { messages, sendMessage, isResponding } = useMessages();
  const activeId = useConversationsStore((s) => s.activeConversationId);

  if (!activeId) {
    return (
      <div
        className="flex flex-1 flex-col items-center justify-center"
        style={{ background: 'var(--bg-primary)' }}
      >
        <div className="text-center">
          <div
            className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{ background: 'var(--accent-light)' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            Start a conversation
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            Click <strong style={{ color: 'var(--accent)' }}>+ New chat</strong> in the sidebar to begin
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col" style={{ background: 'var(--bg-primary)' }}>
      <MessageList messages={messages} />
      <MessageInput onSend={sendMessage} disabled={isResponding} />
    </div>
  );
}
