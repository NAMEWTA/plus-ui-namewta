import { ElButton, ElContainer, ElHeader, ElMain, ElPagination, ElRow, ElTooltip } from 'element-plus';
import { defineComponent, h, type PropType } from 'vue';

export interface ClientShellNavigationItem {
  active?: boolean;
  id: string;
  label: string;
  onSelect(): void;
}

export interface ClientPaginationEvent {
  limit: number;
  page: number;
}

export interface PreventableNavigationEvent {
  preventDefault(): void;
}

export function createClientBrandNavigation(href: string, onSelect?: () => void) {
  return Object.freeze({
    href,
    onClick: (event: PreventableNavigationEvent) => {
      if (!onSelect) return;
      event.preventDefault();
      onSelect();
    }
  });
}

export const ClientRightToolbar = defineComponent({
  name: 'ClientRightToolbar',
  props: {
    search: { type: Boolean, default: true },
    showSearch: { type: Boolean, default: true }
  },
  emits: ['update:showSearch', 'queryTable'],
  setup(props, { emit }) {
    return () =>
      h(ElRow, { class: 'client-right-toolbar' }, () => [
        ...(props.search
          ? [
              h(
                ElTooltip,
                { content: props.showSearch ? '隐藏搜索' : '显示搜索', placement: 'top' },
                {
                  default: () =>
                    h(ElButton, {
                      circle: true,
                      icon: 'Search',
                      'aria-label': props.showSearch ? '隐藏搜索' : '显示搜索',
                      onClick: () => emit('update:showSearch', !props.showSearch)
                    })
                }
              )
            ]
          : []),
        h(
          ElTooltip,
          { content: '刷新', placement: 'top' },
          {
            default: () =>
              h(ElButton, {
                circle: true,
                icon: 'Refresh',
                'aria-label': '刷新列表',
                onClick: () => emit('queryTable')
              })
          }
        )
      ]);
  }
});

export const ClientPagination = defineComponent({
  name: 'ClientPagination',
  props: {
    background: { type: Boolean, default: true },
    hidden: { type: Boolean, default: false },
    limit: { type: Number, default: 10 },
    page: { type: Number, default: 1 },
    pageSizes: { type: Array as PropType<number[]>, default: () => [10, 20, 30, 50] },
    total: { type: Number, default: 0 }
  },
  emits: ['update:page', 'update:limit', 'pagination'],
  setup(props, { emit }) {
    const publish = (page: number, limit: number) => {
      const event: ClientPaginationEvent = Object.freeze({ page, limit });
      emit('pagination', event);
    };
    return () =>
      h(
        'div',
        { class: 'client-pagination', hidden: props.hidden },
        h(ElPagination, {
          background: props.background,
          currentPage: props.page,
          layout: 'total, sizes, prev, pager, next, jumper',
          pageSize: props.limit,
          pageSizes: props.pageSizes,
          total: props.total,
          'onUpdate:currentPage': (page: number) => emit('update:page', page),
          'onUpdate:pageSize': (limit: number) => emit('update:limit', limit),
          onCurrentChange: (page: number) => publish(page, props.limit),
          onSizeChange: (limit: number) => {
            const page = props.page * limit > props.total ? 1 : props.page;
            if (page !== props.page) emit('update:page', page);
            publish(page, limit);
          }
        })
      );
  }
});

export const ClientWebShell = defineComponent({
  name: 'ClientWebShell',
  props: {
    appName: { type: String, required: true },
    brandHref: { type: String, required: true },
    onBrandSelect: { type: Function as PropType<() => void>, default: undefined },
    clientLabel: { type: String, required: true },
    navigation: {
      type: Array as PropType<readonly ClientShellNavigationItem[]>,
      default: () => []
    }
  },
  setup(props, { slots }) {
    return () => {
      const brand = createClientBrandNavigation(props.brandHref, props.onBrandSelect);
      return h(
        ElContainer,
        { class: 'client-shell', 'data-app-shell': 'client-web' },
        {
          default: () => [
            h(
              ElHeader,
              { class: 'client-shell__header' },
              {
                default: () => [
                  h(
                    'a',
                    {
                      class: 'client-shell__brand',
                      href: brand.href,
                      'aria-label': props.appName,
                      onClick: brand.onClick
                    },
                    props.appName
                  ),
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
    };
  }
});
