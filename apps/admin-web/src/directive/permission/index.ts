import type { Directive, DirectiveBinding } from 'vue';
import { createAdminAccessEvaluator } from '@/application/access';

const remove = (element: HTMLElement) => element.parentNode?.removeChild(element);

export const hasPermi: Directive = {
  mounted(element: HTMLElement, binding: DirectiveBinding) {
    if (!Array.isArray(binding.value) || binding.value.length === 0) {
      throw new Error("check perms! Like v-has-permi=\"['system:user:add','system:user:edit']\"");
    }
    if (!createAdminAccessEvaluator().hasAnyPermission(binding.value)) remove(element);
  }
};

export const hasRoles: Directive = {
  mounted(element: HTMLElement, binding: DirectiveBinding) {
    if (!Array.isArray(binding.value) || binding.value.length === 0) {
      throw new Error("check roles! Like v-has-roles=\"['admin','test']\"");
    }
    if (!createAdminAccessEvaluator().hasAnyRole(binding.value)) remove(element);
  }
};
