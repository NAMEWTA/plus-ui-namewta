import type { DomainModule } from '@namewta/platform-app-runtime';

export * from './permissions';
export * from './service';
export * from './transport';
export * from './types';

export const profileDomainModule: DomainModule = Object.freeze({
  id: 'profile',
  backendModules: Object.freeze(['ruoyi-profile']),
  capabilities: Object.freeze([
    'material-tag',
    'person-application',
    'person-material',
    'person-archive',
    'enterprise-application',
    'enterprise-material',
    'enterprise-archive'
  ])
});
