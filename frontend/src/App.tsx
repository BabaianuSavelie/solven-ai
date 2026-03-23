import Sidebar from './components/Sidebar';
import ChatPanel from './components/ChatPanel';

export default function App() {
  return (
    <div className="flex h-screen" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <Sidebar />
      <ChatPanel />
    </div>
  );
}
