import { ElContainer, ElHeader, ElMain } from 'element-plus';
import { defineComponent, h, type PropType } from 'vue';

export interface ClientShellNavigationItem {
  active?: boolean;
  id: string;
  label: string;
  onSelect(): void;
}

export const ClientWebShell = defineComponent({
  name: 'ClientWebShell',
  props: {
    appName: { type: String, required: true },
    clientLabel: { type: String, required: true },
    navigation: {
      type: Array as PropType<readonly ClientShellNavigationItem[]>,
      default: () => []
    }
  },
  setup(props, { slots }) {
    return () =>
      h(
        ElContainer,
        { class: 'client-shell', 'data-app-shell': 'client-web' },
        {
          default: () => [
            h(
              ElHeader,
              { class: 'client-shell__header' },
              {
                default: () => [
                  h('a', { class: 'client-shell__brand', href: '/', 'aria-label': props.appName }, props.appName),
                  h(
                    'nav',
                    { class: 'client-shell__navigation', 'aria-label': '客户门户导航' },
                    props.navigation.map(item =>
                      h(
                        'button',
                        {
                          class: ['client-shell__nav-button', item.active && 'is-active'],
                          type: 'button',
                          onClick: item.onSelect
                        },
                        item.label
                      )
                    )
                  ),
                  h(
                    'span',
                    { class: 'client-shell__context', 'data-client-context': props.clientLabel },
                    props.clientLabel
                  )
                ]
              }
            ),
            h(ElMain, { class: 'client-shell__main' }, { default: () => slots.default?.() })
          ]
        }
      );
  }
});
