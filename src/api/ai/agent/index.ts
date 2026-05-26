import type { AxiosPromise } from '@/utils/api-types';
import request, { globalHeaders } from '@/utils/request';
import { getLanguage } from '@/lang';
import type {
  AgentChatRequest,
  AgentChatSyncResponse,
  AgentItem,
  ConversationMessage,
  ConversationSummaryItem,
  ConversationSummaryList,
  SnailOpenApiUser
} from './types';

export const fetchMyAgents = (): AxiosPromise<AgentItem[]> => {
  return request({
    url: '/snail-ai/agents',
    method: 'get'
  });
};

export const fetchAgentDetail = (id: number): AxiosPromise<AgentItem> => {
  return request({
    url: `/snail-ai/agent/${id}`,
    method: 'get'
  });
};

export const fetchAgentConversations = (
  id: number,
  params: { page?: number; size?: number; start?: string; end?: string }
): AxiosPromise<ConversationSummaryList> => {
  return request({
    url: `/snail-ai/agent/${id}/conversations`,
    method: 'get',
    params
  });
};

export const fetchConversationMessages = (agentId: number, conversationId: string): AxiosPromise<ConversationMessage[]> => {
  return request({
    url: `/snail-ai/agent/${agentId}/conversation/${conversationId}/messages`,
    method: 'get'
  });
};

export const createConversation = (agentId: number, data: { title?: string }): AxiosPromise<ConversationSummaryItem> => {
  return request({
    url: `/snail-ai/agent/${agentId}/conversation`,
    method: 'post',
    data
  });
};

export const deleteConversation = (agentId: number, conversationId: string): AxiosPromise<void> => {
  return request({
    url: `/snail-ai/agent/${agentId}/conversation/${conversationId}`,
    method: 'delete'
  });
};

export const registerCurrentSnailUser = (): AxiosPromise<SnailOpenApiUser> => {
  return request({
    url: '/snail-ai/user/register',
    method: 'post'
  });
};

export const fetchChatMode = (): AxiosPromise<{ mode?: 'stream' | 'sync' }> => {
  return request({
    url: '/snail-ai/chat/mode',
    method: 'get'
  });
};

export const fetchAgentChat = async (
  agentId: number,
  data: AgentChatRequest,
  options: {
    onMessage: (chunk: string) => void;
    onThinking?: (chunk: string) => void;
    onDone: () => void;
    onError: (error: Error) => void;
    signal?: AbortSignal;
  }
): Promise<void> => {
  const baseURL = import.meta.env.VITE_APP_BASE_API;

  await fetch(`${baseURL}/snail-ai/agent/${agentId}/chat/stream`, {
    method: 'POST',
    headers: {
      ...globalHeaders(),
      'Content-Language': getLanguage(),
      Accept: 'text/event-stream',
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify(data),
    signal: options.signal
  })
    .then(async response => {
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('ReadableStream not supported');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const eventBlocks = buffer.split(/\r?\n\r?\n/);
        buffer = eventBlocks.pop() || '';

        for (const block of eventBlocks) {
          if (!block.trim()) continue;
          let eventName = 'message';
          let payload = '';
          for (const line of block.split(/\r?\n/)) {
            if (line.startsWith('event:')) {
              eventName = line.slice(6).trim();
            } else if (line.startsWith('data:')) {
              payload += line.slice(5).trim();
            }
          }
          if (!payload && eventName !== 'done') continue;
          if (eventName === 'thinking') {
            options.onThinking?.(payload);
          } else if (eventName === 'text') {
            options.onMessage(payload);
          } else if (eventName === 'done') {
            options.onDone();
            return;
          } else if (eventName === 'error') {
            throw new Error(payload || 'SSE stream error');
          } else {
            options.onMessage(payload);
          }
        }
      }

      options.onDone();
    })
    .catch((error: Error) => {
      if (error.name !== 'AbortError') {
        options.onError(error);
      }
    });
};

export const fetchAgentChatSync = (agentId: number, data: AgentChatRequest): AxiosPromise<AgentChatSyncResponse> => {
  return request({
    url: `/snail-ai/agent/${agentId}/chat/sync`,
    method: 'post',
    data
  });
};
