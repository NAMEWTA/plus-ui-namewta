import type { AxiosPromise } from '@/utils/api-types';
import type { CacheVO } from './types';
import { operationsService } from '../runtime';

// 查询缓存详细
export const getCache = () => operationsService.cache.get() as AxiosPromise<CacheVO>;
