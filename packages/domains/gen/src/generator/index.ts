export type {
  DbTableForm,
  DbTableQuery,
  DbTableVO,
  DownloadIntent,
  GenMetadata,
  GenTableDetailPayload,
  Identifier,
  ImportTableInput,
  TableQuery,
  TableVO
} from './types';
export { createGenService, type GenService } from '../index';

export const genGeneratorResource = Object.freeze({ controller: 'GenController', basePath: '/tool/gen' });
