import { describe, expect, it } from 'vitest';
import { extractAxiosErrorMessage } from './index';

describe('axios browser error boundary', () => {
  it('classifies network and structured response failures', async () => {
    const resolve = (code: unknown) => (code === 500 ? 'server-error' : undefined);
    await expect(extractAxiosErrorMessage({ message: 'Network Error' }, resolve)).resolves.toBe('后端接口连接异常');
    await expect(extractAxiosErrorMessage({ response: { data: { code: 500 } } }, resolve)).resolves.toBe(
      'server-error'
    );
  });
});
