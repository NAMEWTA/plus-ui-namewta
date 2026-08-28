export interface ServerRouteNode<Component = unknown> {
  children?: readonly ServerRouteNode<Component>[];
  component?: string | Component;
  [key: string]: unknown;
}

export interface MissingComponentDiagnostic {
  appId: string;
  code: 'missing-component-key';
  componentKey: string;
  domainId: string;
}

export interface RouteRegistration<Component> {
  componentName: string;
  load: Component;
}

export interface AssembleServerRoutesOptions<Component> {
  appId: string;
  createDiagnostic(details: MissingComponentDiagnostic): Component;
  resolveRegistration(input: {
    componentKey: string;
    domainId: string;
    routeName?: string;
  }): RouteRegistration<Component> | undefined;
  routes: readonly ServerRouteNode<Component>[];
  specialComponents?: Readonly<Record<string, Component>>;
}

export interface ProjectServerRoutesOptions<Component> extends AssembleServerRoutesOptions<Component> {
  flattenParentView?: boolean;
  parentViewComponentKey?: string;
}

export interface DuplicateRouteNameDiagnostic {
  code: 'duplicate-route-name';
  routeName: string;
}

export function inferDomainId(componentKey: string): string {
  const [domainId] = componentKey.split('/').filter(Boolean);
  return domainId || 'unknown';
}

export function assembleServerRoutes<Component>({
  appId,
  createDiagnostic,
  resolveRegistration,
  routes,
  specialComponents = {}
}: AssembleServerRoutesOptions<Component>): ServerRouteNode<Component>[] {
  return routes.map(route => {
    const assembled: ServerRouteNode<Component> = { ...route };
    if (Array.isArray(route.children)) {
      assembled.children = assembleServerRoutes({
        appId,
        createDiagnostic,
        resolveRegistration,
        routes: route.children,
        specialComponents
      });
    }
    if (typeof route.component !== 'string') return assembled;

    if (Object.prototype.hasOwnProperty.call(specialComponents, route.component)) {
      assembled.component = specialComponents[route.component];
      return assembled;
    }
    const domainId = inferDomainId(route.component);
    const registration = resolveRegistration({
      componentKey: route.component,
      domainId,
      routeName: typeof route.name === 'string' ? route.name : undefined
    });
    assembled.component =
      registration?.load ??
      createDiagnostic({
        appId,
        code: 'missing-component-key',
        componentKey: route.component,
        domainId
      });
    return assembled;
  });
}

function joinRoutePath(parentPath: string, childPath: string): string {
  return `${parentPath.replace(/\/$/, '')}/${childPath.replace(/^\//, '')}`;
}

function normalizeProjection<Component>(
  routes: readonly ServerRouteNode<Component>[],
  flattenParentView: boolean,
  parentViewComponentKey: string,
  parentViewPath?: string
): ServerRouteNode<Component>[] {
  const result: ServerRouteNode<Component>[] = [];
  for (const source of routes) {
    const route: ServerRouteNode<Component> = { ...source };
    const sourcePath = typeof source.path === 'string' ? source.path : '';
    if (parentViewPath && sourcePath) route.path = joinRoutePath(parentViewPath, sourcePath);

    const children: readonly ServerRouteNode<Component>[] = Array.isArray(source.children)
      ? (source.children as readonly ServerRouteNode<Component>[])
      : [];
    if (flattenParentView && source.component === parentViewComponentKey && children.length > 0) {
      result.push(
        ...normalizeProjection(
          children,
          flattenParentView,
          parentViewComponentKey,
          typeof route.path === 'string' ? route.path : undefined
        )
      );
      continue;
    }

    if (children.length > 0) {
      route.children = normalizeProjection(children, flattenParentView, parentViewComponentKey);
    } else {
      delete route.children;
      delete route.redirect;
    }
    result.push(route);
  }
  return result;
}

export function projectServerRoutes<Component>({
  flattenParentView = false,
  parentViewComponentKey = 'ParentView',
  ...assembleOptions
}: ProjectServerRoutesOptions<Component>): ServerRouteNode<Component>[] {
  return assembleServerRoutes({
    ...assembleOptions,
    routes: normalizeProjection(assembleOptions.routes, flattenParentView, parentViewComponentKey)
  });
}

export function findDuplicateRouteNames<Component>(
  routeGroups: readonly (readonly ServerRouteNode<Component>[])[]
): readonly DuplicateRouteNameDiagnostic[] {
  const seen = new Set<string>();
  const reported = new Set<string>();
  const diagnostics: DuplicateRouteNameDiagnostic[] = [];

  const visit = (routes: readonly ServerRouteNode<Component>[]) => {
    for (const route of routes) {
      const routeName = typeof route.name === 'string' ? route.name.trim() : '';
      if (routeName) {
        if (seen.has(routeName) && !reported.has(routeName)) {
          reported.add(routeName);
          diagnostics.push(Object.freeze({ code: 'duplicate-route-name', routeName }));
        }
        seen.add(routeName);
      }
      if (Array.isArray(route.children)) visit(route.children);
    }
  };

  for (const routes of routeGroups) visit(routes);
  return Object.freeze(diagnostics);
}
