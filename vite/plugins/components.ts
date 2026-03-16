import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

export default (path: any) => {
  return Components({
    resolvers: [
      // 自动导入 Element Plus 组件
      ElementPlusResolver()
    ],
    dts: path.resolve(path.resolve(__dirname, '../../src'), 'types', 'components.d.ts')
  });
};
