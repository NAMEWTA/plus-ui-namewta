import { createAccessEvaluator } from '@namewta/platform-permission';
import { useUserStore } from '@/store/modules/user';

const evaluator = () => {
  const user = useUserStore();
  return createAccessEvaluator({ permissions: user.permissions, roles: user.roles });
};

export const checkPermi = (value: unknown): boolean =>
  Array.isArray(value) ? evaluator().hasAnyPermission(value) : false;

export const checkRole = (value: unknown): boolean => (Array.isArray(value) ? evaluator().hasAnyRole(value) : false);
