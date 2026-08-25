<template>
  <ClientWebShell
    app-name="Namewta Client"
    :brand-href="brandHref"
    :client-label="`Client ${application.clientId}`"
    :navigation="navigation"
    :on-brand-select="selectBrand"
  >
    <p v-if="application.transportMessage.value" class="client-feedback" role="status">
      {{ application.transportMessage.value }}
    </p>
    <RouterView />
  </ClientWebShell>
</template>

<script setup lang="ts">
import { ClientWebShell, type ClientShellNavigationItem } from '@namewta/web-shell-element';
import { computed, inject } from 'vue';
import { RouterView, useRoute, useRouter } from 'vue-router';
import { clientApplicationKey } from './application';
import { resolveClientBrandHref } from './router';

const application = inject(clientApplicationKey);
if (!application) throw new Error('ClientApplication is required');
const route = useRoute();
const router = useRouter();
const brandHref = computed(() => resolveClientBrandHref(router));
const selectBrand = () => {
  void router.push('/login');
};

const navigation = computed<readonly ClientShellNavigationItem[]>(() => {
  const items: ClientShellNavigationItem[] = [
    {
      id: 'login',
      label: '入口',
      active: route.path === '/login',
      onSelect: () => {
        void router.push('/login');
      }
    },
    {
      id: 'diagnostic',
      label: '组合诊断',
      active: route.path === '/diagnostic',
      onSelect: () => {
        void router.push({ path: '/diagnostic', query: { domain: 'workflow', key: 'workflow/task/index' } });
      }
    }
  ];
  if (application.authenticated.value) {
    items.splice(1, 0, {
      id: 'demo',
      label: 'Demo',
      active: route.path === '/demo',
      onSelect: () => {
        void router.push('/demo');
      }
    });
  }
  return items;
});
</script>
