import { describe, expect, it } from 'vitest';
import { createManifestRouteDiagnostic, formatManifestRouteDiagnostic } from './manifestDiagnostic';

describe('manifest route diagnostic', () => {
  it('keeps the original backend component key and stable inferred ownership visible', () => {
    const details = {
      appId: 'admin-web',
      code: 'missing-component-key' as const,
      componentKey: 'system/user/not-a-facade',
      domainId: 'system'
    };
    expect(formatManifestRouteDiagnostic(details)).toBe(
      '页面组件不可用 [missing-component-key] app=admin-web domain=system key=system/user/not-a-facade'
    );
    expect(createManifestRouteDiagnostic(details)).toMatchObject({ name: 'ManifestRouteDiagnostic' });
  });
});
