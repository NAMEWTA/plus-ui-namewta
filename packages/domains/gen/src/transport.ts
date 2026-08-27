import type { OpenApiSchema } from '@namewta/api-contracts';
import type { TableVO } from './types';

export type GeneratorTableTransport = OpenApiSchema<'GenTable'>;

export function projectGeneratorTableTransport(value: GeneratorTableTransport): TableVO {
  return {
    ...value,
    tableId: value.tableId ?? '',
    dataName: value.dataName,
    tableName: value.tableName,
    tableComment: value.tableComment,
    className: value.className,
    tplCategory: value.tplCategory ?? 'crud',
    frontendType: value.frontendType ?? 'element-plus',
    packageName: value.packageName,
    moduleName: value.moduleName,
    businessName: value.businessName,
    functionName: value.functionName,
    functionAuthor: value.functionAuthor,
    tree: value.tree === true,
    crud: value.crud === true
  };
}
