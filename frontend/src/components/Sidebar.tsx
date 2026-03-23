import { useConversations } from '../hooks/useConversations';
import ConversationList from './ConversationList';

export default function Sidebar() {
  const { conversations, activeId, setActive, create } = useConversations();

  return (
    <aside
      className="flex h-screen w-[270px] flex-col border-r shrink-0"
      style={{
        background: 'var(--bg-sidebar)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between px-4 pt-5 pb-4">
        <button
          onClick={create}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer"
          style={{ background: 'var(--accent)', color: '#fff' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-hover)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)'; }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="7" y1="1" x2="7" y2="13" />
            <line x1="1" y1="7" x2="13" y2="7" />
          </svg>
          New chat
        </button>

        {/* Collapse icon placeholder */}
        <button
          className="flex items-center justify-center rounded-md p-1.5 transition-colors cursor-pointer"
          style={{ color: 'var(--text-tertiary)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-secondary)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          title="Collapse sidebar"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="9" y1="3" x2="9" y2="21" />
          </svg>
        </button>
      </div>

      {/* Recent section */}
      <div className="px-4 pb-1">
        <p className="text-xs font-semibold tracking-wide uppercase" style={{ color: 'var(--text-tertiary)' }}>
          Recent
        </p>
      </div>

      <ConversationList
        conversations={conversations}
        activeId={activeId}
        onSelect={setActive}
      />
    </aside>
  );
}
