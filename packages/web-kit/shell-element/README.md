# Element Web 外壳

`@namewta/web-shell-element` 已激活，提供可复用的 Element Plus 页面容器、品牌/导航地标，以及迁移页面所需的最小工具栏和分页宿主。

App 负责传入品牌、Client 标签、基于 Router 的导航回调、布局插槽与内容。本包不选择领域、不解析路由、不认证、不调用后端，也不拥有特定 App 品牌。

禁止依赖 App、domain、web-domain 内部、具体适配器或全局 Router/Store。验证覆盖可访问性地标、基路径导航、工具栏/分页行为、主题覆盖和双 App 使用。
