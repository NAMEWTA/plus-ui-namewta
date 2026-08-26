import type { HttpRequest } from '@namewta/platform-contracts';
import { describe, expect, it } from 'vitest';
import { createDictQueryPort } from './index';

describe('system-admin public dict seam', () => {
  it('projects only stable label/value fields and encodes the dictionary type', async () => {
    const requests: HttpRequest[] = [];
    const port = createDictQueryPort({
      request: async request => {
        requests.push(request);
        return {
          data: [{ dictLabel: '启用', dictValue: '0', cssClass: 'secret-css', internalId: 'private' }]
        } as never;
      }
    });

    await expect(port.get('sys/status')).resolves.toEqual([{ label: '启用', value: '0' }]);
    expect(requests).toEqual([{ url: '/system/dict/data/type/sys%2Fstatus', method: 'get' }]);
  });
});
