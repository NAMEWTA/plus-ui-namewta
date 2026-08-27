# Taro 小程序应用占位

## 当前状态

`placeholder`：尚未安装或锁定 Taro 版本，没有源码、依赖、包清单或构建目标，因此不属于工作区。

## 未来职责

通过 Taro 请求与存储适配器复用 headless domains，并拥有小程序专用 ClientContext、页面、组合、平台配置和发布流程。

## 边界

小程序不得依赖 `web-domains`、Element Plus Web 组件、浏览器专用适配器、其他 App 内部或 DOM 能力。

## 激活条件

出现真实小程序需求后，通过独立规格确定 Taro 版本、目标平台、Client、安全合同、所选领域、测试和发布方式，再创建真实工作区包。
