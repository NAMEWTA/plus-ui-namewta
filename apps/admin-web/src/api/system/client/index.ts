import type { ClientForm, ClientQuery, ClientVO } from './types';
import { systemAdminService } from './runtime';

export const listClient = (query?: ClientQuery) => systemAdminService.clients.list(query as never);
export const getClient = (id: string | number) => systemAdminService.clients.get(id);
export const addClient = (data: ClientForm) => systemAdminService.clients.add(data as never);
export const updateClient = (data: ClientForm) => systemAdminService.clients.update(data as never);
export const delClient = (id: string | number | Array<string | number>) => systemAdminService.clients.delete(id);
export const listClientOptions = async (): Promise<ClientVO[]> =>
  (await systemAdminService.clients.options()) as ClientVO[];
export const changeStatus = (clientId: string, status: string) =>
  systemAdminService.clients.changeStatus(clientId, status);
