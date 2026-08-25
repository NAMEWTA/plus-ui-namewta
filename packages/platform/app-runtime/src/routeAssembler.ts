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
    if (route.children) {
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
