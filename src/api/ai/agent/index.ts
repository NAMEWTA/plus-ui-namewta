import { createAiService } from '@namewta/domain-ai';
import request from '@/utils/request';

const service = createAiService(request);

export const registerCurrentSnailUser = service.registerCurrentSnailUser;
