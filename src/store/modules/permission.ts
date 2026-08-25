import type { RouteRecordRaw } from 'vue-router';
import { assembleServerRoutes } from '@namewta/platform-app-runtime';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getRouters } from '@/api/menu';
import ParentView from '@/components/ParentView/index.vue';
import InnerLink from '@/layout/components/InnerLink/index.vue';
import Layout from '@/layout/index.vue';
import auth from '@/plugins/auth';
import router, { constantRoutes, dynamicRoutes } from '@/router';
import { resolveAdminWebRegistration } from '@/router/adminManifestRegistry';
import { createManifestRouteDiagnostic } from '@/router/manifestDiagnostic';
import store from '@/store';
import { createCustomNameComponent } from '@/utils/createCustomNameComponent';

// 匹配views里面所有的.vue文件，预建查找表避免每次 O(n) 扫描
const modules = import.meta.glob('./../../views/**/*.vue');
const viewModuleMap = new Map<string, () => Promise<any>>();
for (const path in modules) {
  const viewsIndex = path.indexOf('/views/');
  if (viewsIndex === -1) continue;
  const dir = path.substring(viewsIndex + 7, path.lastIndexOf('.vue'));
  viewModuleMap.set(dir, modules[path] as () => Promise<any>);
}
export const usePermissionStore = defineStore('permission', () => {
  const routes = ref<RouteRecordRaw[]>([]);
  const addRoutes = ref<RouteRecordRaw[]>([]);
  const defaultRoutes = ref<RouteRecordRaw[]>([]);
  const topbarRouters = ref<RouteRecordRaw[]>([]);
  const sidebarRouters = ref<RouteRecordRaw[]>([]);

  const getRoutes = (): RouteRecordRaw[] => {
    return routes.value as RouteRecordRaw[];
  };
  const getDefaultRoutes = (): RouteRecordRaw[] => {
    return defaultRoutes.value as RouteRecordRaw[];
  };
  const getSidebarRoutes = (): RouteRecordRaw[] => {
    return sidebarRouters.value as RouteRecordRaw[];
  };
  const getTopbarRoutes = (): RouteRecordRaw[] => {
    return topbarRouters.value as RouteRecordRaw[];
  };

  const setRoutes = (newRoutes: RouteRecordRaw[]): void => {
    addRoutes.value = newRoutes;
    routes.value = constantRoutes.concat(newRoutes);
  };
  const setDefaultRoutes = (routes: RouteRecordRaw[]): void => {
    defaultRoutes.value = constantRoutes.concat(routes);
  };
  const setTopbarRoutes = (routes: RouteRecordRaw[]): void => {
    topbarRouters.value = routes;
  };
  const setSidebarRouters = (routes: RouteRecordRaw[]): void => {
    sidebarRouters.value = routes;
  };
  const generateRoutes = async (): Promise<RouteRecordRaw[]> => {
    const res = await getRouters();
    const data = Array.isArray(res.data) ? res.data : [];
    const sdata = structuredClone(data);
    const rdata = structuredClone(data);
    const defaultData = structuredClone(data);
    const sidebarRoutes = filterAsyncRouter(sdata);
    const rewriteRoutes = filterAsyncRouter(rdata, undefined, true);
    const defaultRoutes = filterAsyncRouter(defaultData);
    const asyncRoutes = filterDynamicRoutes(dynamicRoutes);
    asyncRoutes.forEach(route => {
      router.addRoute(route);
    });
    setRoutes(rewriteRoutes);
    setSidebarRouters(constantRoutes.concat(sidebarRoutes));
    setDefaultRoutes(sidebarRoutes);
    setTopbarRoutes(defaultRoutes);
    // 路由name重复检查
    duplicateRouteChecker(asyncRoutes, sidebarRoutes);
    return rewriteRoutes;
  };

  /**
   * 遍历后台传来的路由字符串，转换为组件对象
   * @param asyncRouterMap 后台传来的路由字符串
   * @param lastRouter 上一级路由
   * @param type 是否是重写路由
   */
  const filterAsyncRouter = (
    asyncRouterMap: RouteRecordRaw[],
    lastRouter?: RouteRecordRaw,
    type = false
  ): RouteRecordRaw[] => {
    const sourceRoutes = asyncRouterMap.map(route => {
      if (type && route.children) return { ...route, children: filterChildren(route.children, undefined) };
      return route;
    });
    const assembled = assembleServerRoutes<any>({
      appId: 'admin-web',
      routes: sourceRoutes as unknown as any[],
      specialComponents: { Layout, ParentView, InnerLink },
      resolveRegistration: ({ componentKey, domainId, routeName }) => {
        const registration = resolveAdminWebRegistration(componentKey, domainId);
        if (registration) return registration;
        const component = loadView(componentKey, routeName ?? componentKey);
        return component ? { componentName: routeName ?? componentKey, load: component } : undefined;
      },
      createDiagnostic: createManifestRouteDiagnostic
    }) as unknown as RouteRecordRaw[];
    const pruneEmptyChildren = (routes: RouteRecordRaw[]): RouteRecordRaw[] =>
      routes.map(route => {
        if (route.children?.length) route.children = pruneEmptyChildren(route.children);
        else {
          delete route.children;
          delete route.redirect;
        }
        return route;
      });
    return pruneEmptyChildren(assembled);
  };
  const filterChildren = (childrenMap: RouteRecordRaw[], lastRouter?: RouteRecordRaw): RouteRecordRaw[] => {
    let children: RouteRecordRaw[] = [];
    childrenMap.forEach(el => {
      el.path = lastRouter ? lastRouter.path + '/' + el.path : el.path;
      if (el.children && el.children.length && el.component?.toString() === 'ParentView') {
        children = children.concat(filterChildren(el.children, el));
      } else {
        children.push(el);
      }
    });
    return children;
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

// 动态路由遍历，验证是否具备权限
export const filterDynamicRoutes = (routes: RouteRecordRaw[]) => {
  const res: RouteRecordRaw[] = [];
  routes.forEach(route => {
    if (route.permissions) {
      if (auth.hasPermiOr(route.permissions)) {
        res.push(route);
      }
    } else if (route.roles) {
      if (auth.hasRoleOr(route.roles)) {
        res.push(route);
      }
    }
  });
  return res;
};

export const loadView = (view: any, name: string) => {
  const loader = viewModuleMap.get(view);
  if (loader) {
    return createCustomNameComponent(loader, { name });
  }
  return undefined;
};

// 非setup
export const usePermissionStoreHook = () => {
  return usePermissionStore(store);
};

interface Route {
  name?: string | symbol;
  path: string;
  children?: Route[];
}

/**
 * 检查路由name是否重复
 * @param localRoutes 本地路由
 * @param routes 动态路由
 */
function duplicateRouteChecker(localRoutes: Route[], routes: Route[]) {
  // 展平
  function flatRoutes(routes: Route[]) {
    const res: Route[] = [];
    routes.forEach(route => {
      if (route.children) {
        res.push(...flatRoutes(route.children));
      } else {
        res.push(route);
      }
    });
    return res;
  }

  const allRoutes = flatRoutes([...localRoutes, ...routes]);

  const nameList: string[] = [];
  allRoutes.forEach(route => {
    const name = route.name?.toString() ?? '';
    if (!name) return;
    if (nameList.includes(name)) {
      const message = `路由名称: [${name}] 重复, 会造成 404`;
      console.error(message);
      ElNotification({
        title: '路由名称重复',
        message,
        type: 'error'
      });
      return;
    }
    nameList.push(name);
  });
}
