import { describe, expect, it } from 'vitest';
import { assembleServerRoutes } from './routeAssembler';

describe('server route assembler', () => {
  it('maps selected manifest registrations without filtering server menu metadata', () => {
    const view = { kind: 'demo-view' };
    const routes = assembleServerRoutes({
      appId: 'admin-web',
      routes: [
        {
          path: '/demo',
          component: 'Layout',
          permissions: ['server:already-filtered'],
          children: [{ path: 'table', component: 'demo/demo/index', name: 'Demo' }]
        }
      ],
      specialComponents: { Layout: { kind: 'layout' } },
      resolveRegistration: ({ componentKey, domainId }) =>
        componentKey === 'demo/demo/index' && domainId === 'demo' ? { componentName: 'Demo', load: view } : undefined,
      createDiagnostic: details => ({ kind: 'diagnostic', details })
    });

    expect(routes).toEqual([
      {
        path: '/demo',
        component: { kind: 'layout' },
        permissions: ['server:already-filtered'],
        children: [{ path: 'table', component: view, name: 'Demo' }]
      }
    ]);
  });

  it('turns an arbitrary missing component into a stable app/domain/key diagnostic', () => {
    const routes = assembleServerRoutes({
      appId: 'admin-web',
      routes: [{ path: '/typo', component: 'system/user/not-a-facade' }],
      resolveRegistration: () => undefined,
      createDiagnostic: details => details
    });

    expect(routes[0]?.component).toEqual({
      appId: 'admin-web',
      code: 'missing-component-key',
      componentKey: 'system/user/not-a-facade',
      domainId: 'system'
    });
  });
});
