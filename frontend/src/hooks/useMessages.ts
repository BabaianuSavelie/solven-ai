import { useConversationsStore } from '../store/conversationsStore';
import type { Message } from '../types';

const emptyMessages: Message[] = [];

export function useMessages() {
  const messages = useConversationsStore(
    (s) => s.conversations.find((c) => c.id === s.activeConversationId)?.messages ?? emptyMessages,
  );
  const sendMessage = useConversationsStore((s) => s.sendMessage);
  const isResponding = useConversationsStore((s) => s.isResponding);

  return { messages, sendMessage, isResponding };
}
