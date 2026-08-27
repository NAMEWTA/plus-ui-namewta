import type { DbTableForm, DbTableQuery, Identifier, ImportTableInput, TableQuery } from '@namewta/domain-devtools';
import { devtoolsService } from '../runtime';

export const listTable = (query: TableQuery) => devtoolsService.list(query);
export const listDbTable = (query: DbTableQuery) => devtoolsService.listDatabaseTables(query);
export const getGenTable = (tableId: Identifier) => devtoolsService.get(tableId);
export const updateGenTable = (data: DbTableForm) => devtoolsService.update(data);
export const importTable = (data: ImportTableInput) => devtoolsService.importTables(data);
export const previewTable = (tableId: Identifier) => devtoolsService.preview(tableId);
export const delTable = (tableIds: Identifier | readonly Identifier[]) => devtoolsService.delete(tableIds);
export const synchDb = (tableId: Identifier) => devtoolsService.sync(tableId);
export const getDataNames = () => devtoolsService.dataSourceNames();
export type { GenTableDetailPayload } from '@namewta/domain-devtools';
