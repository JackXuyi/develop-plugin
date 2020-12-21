# develop-plugin

开发过程中项目优化

## 安装

```bash
npm install --save-dev @zhijianren/develop-plugin

或

yarn add @zhijianren/develop-plugin --dev
```

## 使用

### 检查资源是否被使用

- 加入 `loader` 收集需要检测的资源

```js
module.exports = {
  module: {
    rules: [
      {
        test: /.(png|jpg|svg|jpeg)$/,
        use: ['other-loader', '@zhijianren/develop-plugin'],
      },
    ],
  },
}
```

- 引入插件在编译文件完成之后检测对应资源目录下的文件是否使用

```js
const developLoader = require('@zhijianren/develop-plugin')

module.exports = {
  plugins: [
    new developLoader.Plugin({
      rootPath: [path.resolve(__dirname, '../client/static')],
      output: true,
      test: /.(png|jpg|svg|jpeg)$/,
      isDel: true,
      outputAssets: false,
    }),
  ],
}
```

#### 插件可选参数

| 参数名称     | 参数值                                | 是否必须 | 默认值 | 说明                                                                                      |
| :----------- | :------------------------------------ | :------- | ------ | ----------------------------------------------------------------------------------------- |
| rootPath     | string[]                              | 是       | 无     | 需要检测的资源的绝对路径                                                                  |
| output       | boolean \| (assets: string[]) => void | 否       | true   | 输出删除的资源信息，true 通过控制台输出，false 不输出，若为函数则参数为需要删除的资源路径 |
| test         | RegExp                                | 是       | 无     | 需要检测的资源正则表达式                                                                  |
| isDel        | boolean                               | 否       | false  | 是否自动删除未使用的资源                                                                  |
| outputAssets | boolean                               | 否       | false  | 是否生成对应的资源文件                                                                    |

#### 说明

此方案的原理是通过 loader 收集项目中使用的资源信息，然后再通过文件递归的方式检测是否使用，所以整个项目需要编译一遍，耗时可能较长

- 部分资源是在 loader 中直接调用 emitFile 生成的文件，不经过 webpack 的其它流程，所以无法在插件中获取源文件路径

### 检查 package.json 中的依赖是否在生产环境被使用

```js
const developLoader = require('@zhijianren/develop-plugin')

const { dependencies = {} } = require('../package.json')

module.exports = {
  plugins: [
    new developLoader.PackageCheckPlugin({
      packages: Object.keys(dependencies),
    }),
  ],
}
```

#### 插件可选参数

| 参数名称 | 参数值                                                   | 是否必须 | 默认值 | 说明                 |
| :------- | :------------------------------------------------------- | :------- | ------ | -------------------- |
| packages | string[]                                                 | 是       | 无     | 需要检测依赖包的数组 |
| callback | (noUsePackages: string[], usePackages: string[]) => void | 否       | 无     | 输出依赖包的检测结果 |
