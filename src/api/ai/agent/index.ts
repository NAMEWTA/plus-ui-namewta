import type { AxiosPromise } from '@/utils/api-types';
import request from '@/utils/request';
import { getToken } from '@/utils/auth';
import type { AgentChatRequest, AgentItem, ConversationMessage, ConversationSummaryList, SnailOpenApiUser } from './types';

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

export const createConversation = (agentId: number, data: { title?: string }): AxiosPromise<{ conversationId: string; title?: string }> => {
  return request({
    url: `/snail-ai/agent/${agentId}/conversation`,
    method: 'post',
    data
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

export const fetchAgentChat = (
  agentId: number,
  data: AgentChatRequest,
  options: {
    onMessage: (chunk: string) => void;
    onThinking?: (chunk: string) => void;
    onDone: () => void;
    onError: (error: Error) => void;
    signal?: AbortSignal;
  }
) => {
  const baseURL = import.meta.env.VITE_APP_BASE_API;
  const token = getToken();
  const query = new URLSearchParams({ content: data.content });
  if (data.conversationId) {
    query.set('conversationId', data.conversationId);
  }

  fetch(`${baseURL}/snail-ai/agent/${agentId}/chat/stream?${query.toString()}`, {
    method: 'GET',
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      clientid: import.meta.env.VITE_APP_CLIENT_ID
    },
    signal: options.signal
  })
    .then(async response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
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
        const eventBlocks = buffer.split('\n\n');
        buffer = eventBlocks.pop() || '';

        for (const block of eventBlocks) {
          if (!block.trim()) continue;
          let eventName = 'message';
          let payload = '';
          for (const line of block.split('\n')) {
            if (line.startsWith('event:')) {
              eventName = line.slice(6).trim();
            } else if (line.startsWith('data:')) {
              payload += line.slice(5).trim();
            }
          }
          if (!payload) continue;
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

export const fetchAgentChatSync = (agentId: number, data: AgentChatRequest): AxiosPromise<any> => {
  return request({
    url: `/snail-ai/agent/${agentId}/chat/sync`,
    method: 'post',
    data
  });
};
