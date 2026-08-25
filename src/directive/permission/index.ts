import type { Directive, DirectiveBinding } from 'vue';
import { createAccessEvaluator } from '@namewta/platform-permission';
import { useUserStore } from '@/store/modules/user';

const remove = (element: HTMLElement) => element.parentNode?.removeChild(element);
const evaluator = () => {
  const user = useUserStore();
  return createAccessEvaluator({ permissions: user.permissions, roles: user.roles });
};

export const hasPermi: Directive = {
  mounted(element: HTMLElement, binding: DirectiveBinding) {
    if (!Array.isArray(binding.value) || binding.value.length === 0) {
      throw new Error("check perms! Like v-has-permi=\"['system:user:add','system:user:edit']\"");
    }
    if (!evaluator().hasAnyPermission(binding.value)) remove(element);
  }
};

export const hasRoles: Directive = {
  mounted(element: HTMLElement, binding: DirectiveBinding) {
    if (!Array.isArray(binding.value) || binding.value.length === 0) {
      throw new Error("check roles! Like v-has-roles=\"['admin','test']\"");
    }
    if (!evaluator().hasAnyRole(binding.value)) remove(element);
  }
};
