import { describe, expectTypeOf, it } from 'vitest';
import type {
  DbColumnForm,
  DbColumnVO,
  DbParamForm,
  DbTableForm,
  DbTableVO,
  GenTableDetailPayload,
  TableQuery,
  TableVO
} from './types';

describe('legacy generator type facade', () => {
  it('keeps the established column, detail, and date query contracts exported', () => {
    expectTypeOf<DbColumnForm>().toHaveProperty('columnName').toEqualTypeOf<string>();
    expectTypeOf<DbColumnForm>().toHaveProperty('queryType').toEqualTypeOf<string>();
    expectTypeOf<DbColumnForm>().toHaveProperty('isRequired').toEqualTypeOf<string>();
    expectTypeOf<DbColumnVO>().toHaveProperty('increment').toEqualTypeOf<boolean>();
    expectTypeOf<DbColumnVO>().toHaveProperty('capJavaField');
    expectTypeOf<DbColumnVO>().toHaveProperty('usableColumn').toEqualTypeOf<boolean>();
    expectTypeOf<DbColumnVO>().toHaveProperty('superColumn').toEqualTypeOf<boolean>();
    expectTypeOf<DbColumnVO>().toHaveProperty('list').toEqualTypeOf<boolean>();
    expectTypeOf<DbColumnVO>().toHaveProperty('pk').toEqualTypeOf<boolean>();
    expectTypeOf<DbColumnVO>().toHaveProperty('insert').toEqualTypeOf<boolean>();
    expectTypeOf<DbColumnVO>().toHaveProperty('edit').toEqualTypeOf<boolean>();
    expectTypeOf<DbColumnVO>().toHaveProperty('query').toEqualTypeOf<boolean>();
    expectTypeOf<DbColumnVO>().toHaveProperty('required').toEqualTypeOf<boolean>();
    expectTypeOf<DbParamForm>().toHaveProperty('treeAncestorsField');
    expectTypeOf<DbParamForm>().toHaveProperty('treeAncestors');
    expectTypeOf<TableVO>().toHaveProperty('createDept').toEqualTypeOf<string | number>();
    expectTypeOf<DbTableVO>().toHaveProperty('columns').toEqualTypeOf<DbColumnVO[]>();
    expectTypeOf<DbTableForm>().toHaveProperty('params').toEqualTypeOf<DbParamForm>();
    expectTypeOf<GenTableDetailPayload>().toHaveProperty('rows');
    expectTypeOf<TableQuery>().toHaveProperty('params');
  });
});
