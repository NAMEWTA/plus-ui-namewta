import { describe, expect, it, vi } from 'vitest';
import { createDemoWebDomain, type DemoWebRuntime } from './index';

const runtime = (): DemoWebRuntime => ({
  service: {
    addDemo: vi.fn(),
    addTree: vi.fn(),
    deleteDemo: vi.fn(),
    deleteTree: vi.fn(),
    getDemo: vi.fn(),
    getTree: vi.fn(),
    listDemo: vi.fn(),
    listTree: vi.fn(),
    updateDemo: vi.fn(),
    updateTree: vi.fn()
  },
  confirm: vi.fn(),
  download: vi.fn(),
  success: vi.fn()
});

describe('demo web domain public manifest', () => {
  it('publishes stable backend keys and keep-alive component names', () => {
    const manifest = createDemoWebDomain(runtime());

    expect(manifest).toMatchObject({ id: 'web-domain-demo', domainId: 'demo' });
    expect(manifest.components).toMatchObject({
      'demo/demo/index': { componentName: 'Demo' },
      'demo/tree/index': { componentName: 'Tree' }
    });
  });

  it('fails closed when composition omits the injected runtime', () => {
    expect(() => createDemoWebDomain(undefined as unknown as DemoWebRuntime)).toThrow('DemoWebRuntime is required');
  });
});
