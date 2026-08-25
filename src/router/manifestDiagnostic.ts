import type { MissingComponentDiagnostic } from '@namewta/platform-app-runtime';
import { defineComponent, h, type Component } from 'vue';

export const formatManifestRouteDiagnostic = (details: MissingComponentDiagnostic): string =>
  `页面组件不可用 [${details.code}] app=${details.appId} domain=${details.domainId} key=${details.componentKey}`;

export function createManifestRouteDiagnostic(details: MissingComponentDiagnostic): Component {
  const message = formatManifestRouteDiagnostic(details);
  return defineComponent({
    name: 'ManifestRouteDiagnostic',
    setup: () => () =>
      h('main', { class: 'app-container', role: 'alert', 'data-testid': 'manifest-route-diagnostic' }, [
        h('h1', '页面加载失败'),
        h('p', message)
      ])
  });
}
