export interface AgentItem {
  id: number;
  name: string;
  description?: string;
  avatar?: string;
  greeting?: string;
  presetQuestions?: string[];
  webSearchEnabled?: boolean;
}

export interface ConversationSummaryItem {
  conversationId: string;
  title: string;
  lastMessageDt?: string;
  createDt?: string;
}

export interface ConversationSummaryList {
  data: ConversationSummaryItem[];
  page?: number;
  size?: number;
  total?: number;
}

export interface ConversationMessage {
  role?: string;
  content?: string;
  thinking?: string;
}

export interface AgentChatRequest {
  conversationId?: string;
  content: string;
  disabledMcpServerIds?: number[];
  disabledSkillIds?: number[];
  deepPlanEnabled?: boolean;
  webSearchEnabled?: boolean;
}

export interface SnailOpenApiUser {
  openId: string;
  nickname?: string;
  externalId?: string;
  created?: boolean;
}
