import type { HttpClient } from '@namewta/platform-contracts';

export interface PublicDictOption {
  label: string;
  value: string;
}

export interface DictQueryPort {
  get(type: string): Promise<PublicDictOption[]>;
}

export function createDictQueryPort(http: HttpClient): DictQueryPort {
  return Object.freeze({
    async get(type: string) {
      const response = await http.request<{ data: Array<{ dictLabel: string; dictValue: string }> }>({
        url: '/system/dict/data/type/' + encodeURIComponent(type),
        method: 'get'
      });
      return response.data.map(item => ({ label: item.dictLabel, value: item.dictValue }));
    }
  });
}
