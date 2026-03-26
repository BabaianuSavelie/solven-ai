import { create } from 'zustand';
import type { Conversation, Message, MessageAttachment } from '../types';
import { streamMessage } from '../services/aiService';

interface ConversationsState {
  conversations: Conversation[];
  activeConversationId: string | null;
  isResponding: boolean;
  createConversation: () => string;
  setActiveConversation: (id: string) => void;
  sendMessage: (content: string, files?: File[]) => Promise<void>;
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

  sendMessage: async (content, files = []) => {
    const state = get();
    let convId = state.activeConversationId;
    if (!convId) {
      convId = state.createConversation();
    }

    const attachments: MessageAttachment[] = files.map((f) => ({
      name: f.name,
      mimeType: f.type,
      previewUrl: URL.createObjectURL(f),
    }));

    const userMsg: Message = {
      id: createId(),
      role: 'user',
      content,
      toolCalls: [],
      attachments,
      createdAt: new Date(),
    };

    const assistantMsgId = createId();
    const assistantMsg: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      toolCalls: [],
      attachments: [],
      createdAt: new Date(),
    };

    set((s) => ({
      isResponding: true,
      conversations: s.conversations.map((c) => {
        if (c.id !== convId) return c;
        return {
          ...c,
          title: c.messages.length === 0 ? content.slice(0, 40) : c.title,
          messages: [...c.messages, userMsg, assistantMsg],
        };
      }),
    }));

    const updateAssistant = (updater: (m: Message) => Message) => {
      set((s) => ({
        conversations: s.conversations.map((c) => {
          if (c.id !== convId) return c;
          return {
            ...c,
            messages: c.messages.map((m) => (m.id !== assistantMsgId ? m : updater(m))),
          };
        }),
      }));
    };

    try {
      await streamMessage(
        convId,
        content,
        files,
        (chunk) => updateAssistant((m) => ({ ...m, content: m.content + chunk })),
        (toolCall) =>
          updateAssistant((m) => {
            const exists = m.toolCalls.some((tc) => tc.id === toolCall.id);
            return {
              ...m,
              toolCalls: exists
                ? m.toolCalls.map((tc) => (tc.id === toolCall.id ? { ...tc, ...toolCall } : tc))
                : [...m.toolCalls, toolCall],
            };
          }),
      );
    } catch {
      updateAssistant((m) => ({
        ...m,
        content: m.content || 'An error occurred. Please try again.',
        toolCalls: m.toolCalls.map((tc) => ({ ...tc, status: 'error' as const })),
      }));
    } finally {
      set({ isResponding: false });
    }
  },
}));
