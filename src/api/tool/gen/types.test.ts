import { describe, expectTypeOf, it } from 'vitest';
import type { DbColumnForm, GenTableDetailPayload, TableQuery } from './types';

describe('legacy generator type facade', () => {
  it('keeps the established column, detail, and date query contracts exported', () => {
    expectTypeOf<DbColumnForm>().toHaveProperty('columnName').toEqualTypeOf<string>();
    expectTypeOf<DbColumnForm>().toHaveProperty('queryType').toEqualTypeOf<string>();
    expectTypeOf<DbColumnForm>().toHaveProperty('isRequired').toEqualTypeOf<string>();
    expectTypeOf<GenTableDetailPayload>().toHaveProperty('rows');
    expectTypeOf<TableQuery>().toHaveProperty('params');
  });
});
