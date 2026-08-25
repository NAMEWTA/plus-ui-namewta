import '@namewta/design-tokens/client-theme.css';
import 'element-plus/dist/index.css';
import './style.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import { ClientPagination, ClientRightToolbar } from '@namewta/web-shell-element';
import ElementPlus from 'element-plus';
import { createApp, defineComponent, h } from 'vue';
import App from './App.vue';
import { clientApplicationKey, createClientApplication } from './application';
import { ClientWebConfigurationError, readClientWebConfig } from './config';
import { createT06PermissionDirective } from './permissionProof';

const mountFailure = (message: string) => {
  createApp(
    defineComponent({
      name: 'ClientConfigurationFailure',
      setup: () => () =>
        h('main', { class: 'client-config-error', 'data-app-shell': 'client-web', role: 'alert' }, [
          h('h1', 'Client Web 配置不可用'),
          h('p', message)
        ])
    })
  ).mount('#app');
};

try {
  const config = readClientWebConfig(import.meta.env);
  const application = createClientApplication(config);
  const app = createApp(App)
    .provide(clientApplicationKey, application)
    .use(application.router)
    .use(ElementPlus)
    .directive('hasPermi', createT06PermissionDirective());
  for (const [name, component] of Object.entries(ElementPlusIconsVue)) app.component(name, component);
  app.component('Pagination', ClientPagination).component('RightToolbar', ClientRightToolbar).mount('#app');
} catch (error) {
  if (!(error instanceof ClientWebConfigurationError)) throw error;
  mountFailure(error.message);
}
