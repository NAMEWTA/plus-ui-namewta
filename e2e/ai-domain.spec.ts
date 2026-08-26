import { expect, test, type Page, type Route } from '@playwright/test';

const adminUrl = process.env.ADMIN_WEB_URL ?? 'http://127.0.0.1:4173';
const clientUrl = process.env.CLIENT_WEB_URL ?? 'http://127.0.0.1:4174';
const adminClientId = 'e5cd7e4891bf95d1d19206ce24a7b32e';

type AiProofState = {
  authenticatedRegistration: boolean;
  clientIds: string[];
  frameRequests: number;
  registrations: number;
  unknownRequests: string[];
};

const json = (route: Route, body: unknown) =>
  route.fulfill({ contentType: 'application/json', body: JSON.stringify(body) });

async function installAdminApi(page: Page, state: AiProofState) {
  await page.route('**/prod-api/**', route => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.replace('/prod-api', '');
    const method = request.method();

    if (path === '/system/user/getInfo' && method === 'GET') {
      return json(route, {
        code: 200,
        data: {
          user: { userId: 12, userName: 'ai-reader', nickName: 'AI Reader', avatarUrl: '' },
          roles: ['operator'],
          permissions: []
        }
      });
    }
    if (path === '/system/menu/getRouters' && method === 'GET') {
      return json(route, {
        code: 200,
        data: [
          {
            path: '/ai-chat-proof',
            name: 'AiChatProof',
            component: 'ai/chat/index',
            meta: { title: 'AI 会话' }
          }
        ]
      });
    }
    if (path === '/resource/message/box' && method === 'GET') {
      return json(route, { code: 200, data: { systemList: [], noticeList: [], workflowList: [] } });
    }
    if (path === '/resource/message/close') return json(route, { code: 200, data: null });
    if (path === '/resource/message') return route.fulfill({ contentType: 'text/event-stream', body: '' });
    if (path === '/snail-ai/user/register' && method === 'POST') {
      state.registrations += 1;
      state.authenticatedRegistration ||= Boolean(request.headers().authorization);
      state.clientIds.push(request.headers().clientid ?? '');
      return json(route, { code: 200, data: { openId: 'browser-proof-user' } });
    }
    if (path === '/snail-chat/' && method === 'GET') {
      state.frameRequests += 1;
      return route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Snail AI proof</title>' });
    }

    state.unknownRequests.push(`${method} ${path}`);
    return route.abort('failed');
  });
}

const createState = (): AiProofState => ({
  authenticatedRegistration: false,
  clientIds: [],
  frameRequests: 0,
  registrations: 0,
  unknownRequests: []
});

test('admin selects the permission-neutral AI manifest and loads the embedded chat', async ({ page }) => {
  const state = createState();
  await installAdminApi(page, state);
  await page.addInitScript(() => localStorage.setItem('Admin-Token', 'ai-browser-proof'));

  await page.goto(`${adminUrl}/ai-chat-proof`);
  const frame = page.locator('iframe[title="Snail AI"]');
  await expect(frame).toBeVisible();
  await expect.poll(() => state.frameRequests).toBe(1);

  const source = await frame.getAttribute('src');
  const frameUrl = new URL(source!, page.url());
  expect(frameUrl.pathname).toBe('/prod-api/snail-chat/');
  expect(frameUrl.searchParams.get('openId')).toBe('browser-proof-user');
  expect(frameUrl.searchParams.has('trustedCredential')).toBe(true);
  expect(state).toMatchObject({
    authenticatedRegistration: true,
    clientIds: [adminClientId],
    registrations: 1,
    unknownRequests: []
  });
});

test('an iframe interruption clears the sensitive URL, ends loading, and retries', async ({ page }) => {
  const state = createState();
  await installAdminApi(page, state);
  await page.addInitScript(() => localStorage.setItem('Admin-Token', 'ai-browser-retry-proof'));

  await page.goto(`${adminUrl}/ai-chat-proof`);
  const frame = page.locator('iframe[title="Snail AI"]');
  await expect(frame).toBeVisible();
  await frame.evaluate(element => element.dispatchEvent(new Event('error')));

  await expect(page.getByText('AI 聊天连接中断，请重新加载', { exact: true })).toBeVisible();
  await expect(frame).toHaveCount(0);
  await expect(page.locator('.ai-chat-page .el-loading-mask')).toHaveCount(0);

  await page.getByRole('button', { name: '重新加载' }).click();
  await expect(page.locator('iframe[title="Snail AI"]')).toBeVisible();
  await expect.poll(() => state.registrations).toBe(2);
  expect(state.unknownRequests).toEqual([]);
});

test('client-web visibly diagnoses the unselected AI capability', async ({ page }) => {
  await page.goto(`${clientUrl}/diagnostic?domain=ai&key=ai%2Fchat%2Findex`);

  await expect(page.getByRole('heading', { name: '当前 App 未选择该能力' })).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('[missing-component-key]');
  await expect(page.getByRole('alert')).toContainText('app=client-web domain=ai key=ai/chat/index');
});
