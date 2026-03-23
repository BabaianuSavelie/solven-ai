import { useConversationsStore } from '../store/conversationsStore';

export function useConversations() {
  const conversations = useConversationsStore((s) => s.conversations);
  const activeId = useConversationsStore((s) => s.activeConversationId);
  const setActive = useConversationsStore((s) => s.setActiveConversation);
  const create = useConversationsStore((s) => s.createConversation);

  return { conversations, activeId, setActive, create };
}
