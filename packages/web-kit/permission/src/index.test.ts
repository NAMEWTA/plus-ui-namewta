import type { App, Directive, DirectiveBinding } from 'vue';
import { createAccessEvaluator, type AccessEvaluator } from '@namewta/platform-permission';
import { describe, expect, it, vi } from 'vitest';
import { installWebPermissionHost } from './index';

type MountedDirective = {
  mounted(element: HTMLElement, binding: DirectiveBinding<readonly string[]>): void;
};

function install(provider: () => AccessEvaluator) {
  const directives = new Map<string, Directive>();
  const app = {
    directive(name: string, directive: Directive) {
      directives.set(name, directive);
      return app;
    }
  } as unknown as App;
  installWebPermissionHost(app, provider);
  return directives;
}

function run(directive: Directive | undefined, value: unknown) {
  const removeChild = vi.fn();
  const element = { parentNode: { removeChild } } as unknown as HTMLElement;
  (directive as MountedDirective).mounted(element, { value } as DirectiveBinding<readonly string[]>);
  return removeChild;
}

describe('web permission host', () => {
  it('registers only the two public permission directives', () => {
    const directives = install(() => createAccessEvaluator({ permissions: [], roles: [] }));

    expect([...directives.keys()]).toEqual(['hasPermi', 'hasRoles']);
  });

  it.each([
    { name: 'hasPermi', snapshot: { permissions: ['system:user:add'] }, required: ['system:user:add'] },
    { name: 'hasPermi', snapshot: { permissions: ['*:*:*'] }, required: ['system:user:add'] },
    { name: 'hasRoles', snapshot: { roles: ['operator'] }, required: ['operator'] },
    { name: 'hasRoles', snapshot: { roles: ['superadmin'] }, required: ['operator'] }
  ])('keeps an element when $name matches the platform evaluator', ({ name, snapshot, required }) => {
    const directives = install(() => createAccessEvaluator(snapshot));

    expect(run(directives.get(name), required)).not.toHaveBeenCalled();
  });

  it.each([
    { name: 'hasPermi', required: ['system:user:add'] },
    { name: 'hasRoles', required: ['operator'] }
  ])('removes an element when $name fails closed', ({ name, required }) => {
    const directives = install(() => createAccessEvaluator({ permissions: [], roles: [] }));

    expect(run(directives.get(name), required)).toHaveBeenCalledTimes(1);
  });

  it('reads the current evaluator every time a directive is mounted', () => {
    let evaluator = createAccessEvaluator({ permissions: [], roles: [] });
    const directives = install(() => evaluator);

    expect(run(directives.get('hasPermi'), ['system:user:add'])).toHaveBeenCalledTimes(1);
    evaluator = createAccessEvaluator({ permissions: ['system:user:add'], roles: [] });
    expect(run(directives.get('hasPermi'), ['system:user:add'])).not.toHaveBeenCalled();
  });

  it.each([undefined, 'system:user:add', [], [''], ['system:user:add', '  ']])(
    'rejects an invalid directive binding: %j',
    value => {
      const directives = install(() => createAccessEvaluator({ permissions: ['*:*:*'], roles: ['superadmin'] }));

      expect(() => run(directives.get('hasPermi'), value)).toThrow('v-hasPermi requires a non-empty string array');
    }
  );

  it('fails explicitly when the evaluator provider has no current identity', () => {
    const directives = install(() => undefined as unknown as AccessEvaluator);

    expect(() => run(directives.get('hasRoles'), ['operator'])).toThrow('AccessEvaluator is unavailable');
  });
});
