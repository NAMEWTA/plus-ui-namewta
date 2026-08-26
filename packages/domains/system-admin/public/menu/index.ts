import type { HttpClient } from '@namewta/platform-contracts';

export interface PublicMenuOption {
  id: string | number;
  label: string;
  children?: PublicMenuOption[];
}

export interface MenuQueryPort {
  options(clientId?: string | number): Promise<PublicMenuOption[]>;
}

export function createMenuQueryPort(http: HttpClient): MenuQueryPort {
  return Object.freeze({
    async options(clientId) {
      const response = await http.request<{ data: PublicMenuOption[] }>({
        url: '/system/menu/treeselect',
        method: 'get',
        params: { clientId }
      });
      return response.data;
    }
  });
}
