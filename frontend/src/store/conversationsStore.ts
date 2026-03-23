import { create } from 'zustand';
import type { Conversation, Message } from '../types';
import { sendMessage as aiSendMessage } from '../services/aiService';

interface ConversationsState {
  conversations: Conversation[];
  activeConversationId: string | null;
  isResponding: boolean;
  createConversation: () => string;
  setActiveConversation: (id: string) => void;
  sendMessage: (content: string) => Promise<void>;
}

function createId(): string {
  return crypto.randomUUID();
}

export const useConversationsStore = create<ConversationsState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  isResponding: false,

  createConversation: () => {
    const id = createId();
    const conversation: Conversation = {
      id,
      title: 'New conversation',
      createdAt: new Date(),
      messages: [],
    };
    set((s) => ({
      conversations: [conversation, ...s.conversations],
      activeConversationId: id,
    }));
    return id;
  },

  setActiveConversation: (id) => {
    set({ activeConversationId: id });
  },

  sendMessage: async (content) => {
    const state = get();
    let convId = state.activeConversationId;
    if (!convId) {
      convId = state.createConversation();
    }

    const userMsg: Message = {
      id: createId(),
      role: 'user',
      content,
      toolCalls: [],
      createdAt: new Date(),
    };

    const assistantMsgId = createId();
    const toolCallId = createId();
    const assistantMsg: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      toolCalls: [
        {
          id: toolCallId,
          toolName: 'web_search',
          status: 'running',
          input: { query: content },
        },
      ],
      createdAt: new Date(),
    };

    set((s) => ({
      isResponding: true,
      conversations: s.conversations.map((c) => {
        if (c.id !== convId) return c;
        const isFirst = c.messages.length === 0;
        return {
          ...c,
          title: isFirst ? content.slice(0, 40) : c.title,
          messages: [...c.messages, userMsg, assistantMsg],
        };
      }),
    }));

    try {
      const response = await aiSendMessage(content);
      set((s) => ({
        isResponding: false,
        conversations: s.conversations.map((c) => {
          if (c.id !== convId) return c;
          return {
            ...c,
            messages: c.messages.map((m) => {
              if (m.id !== assistantMsgId) return m;
              return {
                ...m,
                content: response.content,
                toolCalls: response.toolCalls,
              };
            }),
          };
        }),
      }));
    } catch {
      set((s) => ({
        isResponding: false,
        conversations: s.conversations.map((c) => {
          if (c.id !== convId) return c;
          return {
            ...c,
            messages: c.messages.map((m) => {
              if (m.id !== assistantMsgId) return m;
              return {
                ...m,
                content: 'An error occurred. Please try again.',
                toolCalls: m.toolCalls.map((tc) => ({ ...tc, status: 'error' as const })),
              };
            }),
          };
        }),
      }));
    }
  },
}));
