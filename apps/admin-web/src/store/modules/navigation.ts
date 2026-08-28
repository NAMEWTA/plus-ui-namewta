import type { RouteRecordRaw } from 'vue-router';
import {
  findDuplicateRouteNames,
  projectServerRoutes,
  type RouteRegistration,
  type ServerRouteNode
} from '@namewta/platform-app-runtime';
import { defineStore } from 'pinia';
import { ref, type Component } from 'vue';
import { identityAccessService } from '@/application/services';
import ParentView from '@/components/ParentView/index.vue';
import InnerLink from '@/layout/components/InnerLink/index.vue';
import Layout from '@/layout/index.vue';
import { constantRoutes } from '@/router';
import { resolveAdminWebRegistration } from '@/router/adminManifestRegistry';
import { createManifestRouteDiagnostic, presentDuplicateRouteNameDiagnostics } from '@/router/manifestDiagnostic';
import store from '@/store';

type AdminRouteComponent = Component | (() => Promise<Component>);

function projectMenus(menus: readonly RouteRecordRaw[], flattenParentView = false): RouteRecordRaw[] {
  return projectServerRoutes<AdminRouteComponent>({
    appId: 'admin-web',
    routes: menus as unknown as readonly ServerRouteNode<AdminRouteComponent>[],
    flattenParentView,
    specialComponents: { Layout, ParentView, InnerLink },
    resolveRegistration: ({ componentKey, domainId }) => {
      const registration = resolveAdminWebRegistration(componentKey, domainId);
      if (!registration) return undefined;
      return registration as RouteRegistration<AdminRouteComponent>;
    },
    createDiagnostic: createManifestRouteDiagnostic
  }) as unknown as RouteRecordRaw[];
}

export const useNavigationStore = defineStore('navigation', () => {
  const routes = ref<RouteRecordRaw[]>([]);
  const defaultRoutes = ref<RouteRecordRaw[]>([]);
  const topbarRouters = ref<RouteRecordRaw[]>([]);
  const sidebarRouters = ref<RouteRecordRaw[]>([]);

  const getRoutes = (): RouteRecordRaw[] => routes.value as RouteRecordRaw[];
  const getDefaultRoutes = (): RouteRecordRaw[] => defaultRoutes.value as RouteRecordRaw[];
  const getSidebarRoutes = (): RouteRecordRaw[] => sidebarRouters.value as RouteRecordRaw[];
  const getTopbarRoutes = (): RouteRecordRaw[] => topbarRouters.value as RouteRecordRaw[];

  const setRoutes = (newRoutes: RouteRecordRaw[]): void => {
    routes.value = constantRoutes.concat(newRoutes);
  };
  const setDefaultRoutes = (newRoutes: RouteRecordRaw[]): void => {
    defaultRoutes.value = constantRoutes.concat(newRoutes);
  };
  const setTopbarRoutes = (newRoutes: RouteRecordRaw[]): void => {
    topbarRouters.value = newRoutes;
  };
  const setSidebarRouters = (newRoutes: RouteRecordRaw[]): void => {
    sidebarRouters.value = newRoutes;
  };

  const generateRoutes = async (): Promise<RouteRecordRaw[]> => {
    const menus = (await identityAccessService.getMenus()) as unknown as RouteRecordRaw[];
    const sidebarRoutes = projectMenus(menus);
    const rewriteRoutes = projectMenus(menus, true);
    const projectedDefaultRoutes = projectMenus(menus);

    setRoutes(rewriteRoutes);
    setSidebarRouters(constantRoutes.concat(sidebarRoutes));
    setDefaultRoutes(sidebarRoutes);
    setTopbarRoutes(projectedDefaultRoutes);
    presentDuplicateRouteNameDiagnostics(
      findDuplicateRouteNames([
        constantRoutes as unknown as readonly ServerRouteNode<AdminRouteComponent>[],
        sidebarRoutes as unknown as readonly ServerRouteNode<AdminRouteComponent>[]
      ])
    );
    return rewriteRoutes;
  };

  return {
    routes,
    topbarRouters,
    sidebarRouters,
    defaultRoutes,
    getRoutes,
    getDefaultRoutes,
    getSidebarRoutes,
    getTopbarRoutes,
    setRoutes,
    generateRoutes,
    setSidebarRouters
  };
});

export const useNavigationStoreHook = () => useNavigationStore(store);
