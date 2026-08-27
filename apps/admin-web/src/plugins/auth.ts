import { createAccessEvaluator } from '@namewta/platform-permission';
import { useUserStore } from '@/store/modules/user';

const evaluator = () => {
  const user = useUserStore();
  return createAccessEvaluator({ permissions: user.permissions, roles: user.roles });
};

export default {
  hasPermi: (permission: string): boolean => evaluator().hasPermission(permission),
  hasPermiOr: (permissions: string[]): boolean => evaluator().hasAnyPermission(permissions),
  hasPermiAnd: (permissions: string[]): boolean => evaluator().hasAllPermissions(permissions),
  hasRole: (role: string): boolean => evaluator().hasRole(role),
  hasRoleOr: (roles: string[]): boolean => evaluator().hasAnyRole(roles),
  hasRoleAnd: (roles: string[]): boolean => evaluator().hasAllRoles(roles)
};
