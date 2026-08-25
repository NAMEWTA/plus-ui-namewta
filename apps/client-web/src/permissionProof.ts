export interface RemovablePermissionElement {
  remove(): void;
}

export function createT06PermissionDirective() {
  return Object.freeze({
    mounted(element: RemovablePermissionElement) {
      element.remove();
    }
  });
}
