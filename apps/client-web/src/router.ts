import { AppRuntimeError, type AppRuntime } from '@namewta/platform-app-runtime';
import { defineAsyncComponent, defineComponent, h, type Component, type Ref } from 'vue';
import {
  createRouter,
  createWebHistory,
  type RouteLocationNormalized,
  type RouteRecordRaw,
  useRoute
} from 'vue-router';

const routeView = (runtime: AppRuntime<Component>, domainId: string, componentKey: string) =>
  defineAsyncComponent(runtime.resolve({ domainId, componentKey }).load);

export interface ClientManifestDiagnostic {
  appId: string;
  code: 'missing-component-key';
  componentKey: string;
  domainId: string;
  message: string;
}

export function resolveClientManifestDiagnostic(
  runtime: Pick<AppRuntime<Component>, 'resolve'>,
  input: { componentKey: string; domainId: string }
): ClientManifestDiagnostic {
  try {
    runtime.resolve(input);
    throw new Error(`Expected an unselected component key: ${input.componentKey}`);
  } catch (error) {
    if (!(error instanceof AppRuntimeError) || error.code !== 'missing-component-key') throw error;
    return Object.freeze({
      appId: error.appId,
      code: error.code,
      componentKey: error.componentKey,
      domainId: error.domainId,
      message: error.message
    });
  }
}

export interface ClientBrandRouter {
  resolve(path: string): { href: string };
}

export function resolveClientBrandHref(router: ClientBrandRouter): string {
  return router.resolve('/login').href;
}

const diagnosticPage = (runtime: AppRuntime<Component>) =>
  defineComponent({
    name: 'ClientManifestDiagnostic',
    setup() {
      const route = useRoute();
      return () => {
        const domainId = typeof route.query.domain === 'string' ? route.query.domain : 'unknown';
        const componentKey = typeof route.query.key === 'string' ? route.query.key : 'unknown';
        const diagnostic = resolveClientManifestDiagnostic(runtime, { domainId, componentKey });
        return h('section', { class: 'client-diagnostic', 'aria-labelledby': 'client-diagnostic-title' }, [
          h('p', { class: 'client-diagnostic__eyebrow' }, 'COMPOSITION DIAGNOSTIC'),
          h('h1', { id: 'client-diagnostic-title' }, '当前 App 未选择该能力'),
          h('p', { role: 'alert' }, diagnostic.message)
        ]);
      };
    }
  });

const requiresSession = (authenticated: Ref<boolean>) => (to: RouteLocationNormalized) => {
  if (!authenticated.value) return { path: '/login', query: { redirect: to.fullPath } };
  return true;
};

export function createClientRouter(runtime: AppRuntime<Component>, authenticated: Ref<boolean>) {
  const routes: RouteRecordRaw[] = [
    { path: '/', redirect: '/login' },
    {
      path: '/login',
      name: 'ClientLogin',
      component: routeView(runtime, 'admin', 'identity-access/login/index')
    },
    {
      path: '/demo',
      name: 'ClientDemo',
      component: routeView(runtime, 'demo', 'demo/demo/index'),
      beforeEnter: requiresSession(authenticated)
    },
    { path: '/diagnostic', name: 'ClientDiagnostic', component: diagnosticPage(runtime) }
  ];
  return createRouter({ history: createWebHistory(import.meta.env.BASE_URL), routes });
}
