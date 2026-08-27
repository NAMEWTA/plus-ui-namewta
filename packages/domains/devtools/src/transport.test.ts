import { describe, expect, it } from 'vitest';
import { projectGeneratorTableTransport, type GeneratorTableTransport } from './transport';

describe('devtools OpenAPI transport boundary', () => {
  it('keeps generator defaults in the domain mapper', () => {
    const transport: GeneratorTableTransport = {
      dataName: 'master',
      tableName: 'sys_user',
      tableComment: 'User',
      className: 'SysUser',
      packageName: 'org.example',
      moduleName: 'system',
      businessName: 'user',
      functionName: 'User',
      functionAuthor: 'namewta'
    };
    expect(projectGeneratorTableTransport(transport)).toMatchObject({ tableId: '', tree: false, crud: false });
  });
});
