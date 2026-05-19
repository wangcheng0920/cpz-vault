---
title: Elpis 2：基于 webpack5 完成工程化建设
date: 2026-05-17T20:18
tags:
  - Elpis
---

# Elpis 2：基于 webpack5 完成工程化建设

## 1. 阶段背景

Elpis 在上一阶段完成了服务端内核建设，已经具备基础的路由分发和页面渲染能力。但当时页面资源仍以手工维护为主，缺少前端工程化体系，无法满足真实项目中对构建、分包、压缩和开发调试效率的要求。

因此，需要在现有服务端能力之上补齐前端工程化体系，为后续前后端协同开发提供稳定的基础设施。

## 2. 阶段目标

本阶段的目标是基于 webpack 5 完成 Elpis 的前端工程化建设，将业务源码通过统一的解析与编译流程生成可部署的静态资源产物，并补齐开发环境与生产环境所需的构建能力。

围绕这一目标，本阶段主要解决以下问题：

1. 建立多页面入口机制，支持不同页面独立构建。
2. 完成基础模块解析与产物输出能力。
3. 搭建开发环境下的调试、热更新和资源服务能力。
4. 建立生产环境下的分包、压缩和缓存优化方案。
5. 补充统一的前端请求工具封装，提升页面接入效率。

## 3. 阶段任务

### 3.1 实现多入口页面构建机制

本阶段首先实现了多入口能力，约定以 `./app/pages/**/entry.*.js` 作为页面入口文件。通过这一约定，系统可以自动扫描页面目录并收集所有入口，从而支持多页面独立打包。

在页面启动方式上，将多个入口文件中重复的 Vue 应用初始化逻辑抽取到统一的 `boot.js` 中。这样做可以避免各页面重复编写应用挂载、路由注册和通用依赖注入逻辑，使页面入口更加简洁，也便于后续统一维护。

```js
// entry.page.js

import page1 from "./page.vue";
import boot from "$pages/boot.js";

boot(page);
```

```js
// boot.js

import { createApp } from "vue";
import ElementUI from "element-plus";
import "element-plus/theme-chalk/index.css";
import "./assets/custom.css";
import pinia from "$store";
import { createRouter, createWebHashHistory } from "vue-router";

/**
 * Vue 页面主入口，用于启动应用。
 * @param pageComponent 页面入口组件
 * @param options 页面启动配置
 */
export default (pageComponent, { routes, libs } = {}) => {
  const app = createApp(pageComponent);
  app.use(ElementUI);
  app.use(pinia);

  if (libs?.length) {
    for (let i = 0; i < libs.length; i++) {
      app.use(libs[i]);
    }
  }

  if (routes?.length) {
    const router = createRouter({
      history: createWebHashHistory(),
      routes,
    });
    app.use(router);
    router.isReady().then(() => {
      app.mount("#root");
    });
  } else {
    app.mount("#root");
  }
};
```

### 3.2 完成 webpack 基础构建配置

在基础配置层，本阶段完成了入口收集、模板生成、模块处理、模块解析和插件注入等能力。

首先，通过扫描页面入口文件，动态生成 webpack 的 `entry` 配置：

```js
glob.sync(path.resolve(process.cwd(), "./app/pages/**/entry.*.js"));
```

经过遍历处理后，可得到如下入口对象：

```js
const pageEntries = {
  "entry.page1": "/path/to/entry.page1.js",
  "entry.page2": "/path/to/entry.page2.js",
};
```

随后，结合 `HtmlWebpackPlugin` 为每个入口自动生成对应的 HTML 文件，用于注入打包后的资源产物：

```js
const htmlWebpackPluginList = [];

htmlWebpackPluginList.push(
  new HtmlWebpackPlugin({
    filename: path.resolve(
      process.cwd(),
      "./app/public/dist/",
      `${entryName}.html`,
    ),
    template: path.resolve(process.cwd(), "./app/view/entry.html"),
    chunks: [entryName],
  }),
);
```

最终将入口和插件配置注入 webpack：

```js
module.exports = {
  // ...
  entry: pageEntries,
  plugins: [
    // ...
    ...htmlWebpackPluginList,
  ],
};
```

在模块处理方面，引入了 `vue-loader`、`babel-loader`、`style-loader`、`css-loader`、`url-loader` 和 `file-loader` 等常用 loader，用于处理 Vue 单文件组件、JavaScript、样式和静态资源文件。这里不需要在每条规则中限定具体目录，而是让当前依赖图中所有符合条件的模块按规则进行处理，从而保持构建规则的一致性。

在模块解析方面，通过 `resolve.extensions` 和 `alias` 提升导入体验，减少复杂相对路径的使用：

```js
module.exports = {
  // ...
  resolve: {
    extensions: [".js", ".vue", ".less", ".css"],
    alias: {
      $pages: path.resolve(process.cwd(), "./app/pages"),
      $common: path.resolve(process.cwd(), "./app/pages/common"),
      $widgets: path.resolve(process.cwd(), "./app/pages/widgets"),
      $store: path.resolve(process.cwd(), "./app/pages/store"),
    },
  },
};
```

### 3.3 完成开发环境调试能力建设

在完成基础构建链路后，本阶段进一步补齐了开发环境下的调试体验。开发配置中使用 `devtool: "eval-cheap-module-source-map"`，用于建立源码与构建结果之间的映射关系，便于在开发过程中快速定位问题。

关于 `devtool` 的其他常见取值，可以作为补充参考：

> `devtool` 的不同取值，本质上是在构建速度、映射精度和产物体积之间做取舍。
>
> `eval`：构建速度最快，但映射信息较弱，适合对调试精度要求不高的本地开发场景。
>
> `eval-cheap-source-map`：保留较快构建速度，同时提供基础的行级映射，适合一般开发调试。
>
> `eval-cheap-module-source-map`：在 `cheap` 基础上保留 loader 处理前的模块映射信息，适合需要兼顾构建速度和源码定位体验的开发环境，也是当前项目采用的方案。
>
> `cheap-module-source-map`：构建速度比 `eval` 系列略慢，但生成独立 source map 文件，适合希望调试信息更稳定的开发环境。
>
> `source-map`：提供最完整、最精确的源码映射，但构建开销也更大，通常更适合生产问题排查或对调试精度要求较高的场景。
>
> `inline-source-map`：将 source map 直接内联到产物中，便于临时调试，但会显著增大文件体积，通常不适合常规开发和生产环境。
>
> `hidden-source-map`：生成 source map 文件，但不在产物中暴露引用信息，适合将 source map 上传到监控平台做线上错误定位。
>
> `nosources-source-map`：生成映射关系但不包含源码内容，适合在一定程度上兼顾线上排障和源码保护。
>
> 整体来看，开发环境更关注构建速度和调试便利性，通常优先选择 `eval` 系列；生产环境如果需要错误追踪，则更适合根据实际情况在 `source-map`、`hidden-source-map` 和 `nosources-source-map` 之间做取舍。

开发服务并未直接采用 `webpack-dev-server` 启动，而是基于 Express 自定义开发服务器，并接入 `webpack-dev-middleware` 与 `webpack-hot-middleware`。这种方式更适合与现有服务端体系结合，也便于按项目需要扩展中间件逻辑。

```js
app.use(
  devMiddleware(compiler, {
    writeToDisk: (filePath) => {
      return filePath.endsWith(".html");
    },
    publicPath: webpackConfig.output.publicPath,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers":
        "X-Request-With, content-type, Authorization",
    },
    stats: {
      colors: true,
    },
  }),
);
```

其中，`headers` 配置用于给 `webpack-dev-middleware` 返回的响应统一补充 HTTP 响应头。如果不增加这部分配置，浏览器可能会拦截 bundle 请求，HMR client 也可能因为跨域问题连接失败。

#### 3.3.1 HMR 的作用与整体流程

HMR，即 Hot Module Replacement，核心目标是在开发过程中只替换发生变化的模块，而不是刷新整个页面。

围绕执行链路来看，HMR 可以拆成两个关键部分。

第一部分，是开发服务器检测模块变化并通知浏览器。开发时一旦源码被修改，webpack 会重新编译本次变更影响到的模块，并生成对应的热更新信息。随后，开发服务器会通过长连接将这次构建结果通知到浏览器。这个长连接通常基于 WebSocket 或 SSE 实现，本质上承担的是“更新信号通道”的职责。也就是说，浏览器并不是不断轮询才知道代码变了，而是开发服务器在编译完成后主动把“有新模块可用”这件事推送过去。

第二部分，是浏览器接收到通知后，只替换变化的模块，而不是整页刷新。浏览器中的 HMR client 收到更新信号后，会去拉取本次热更新对应的模块代码和清单信息，再交给运行时处理。运行时会定位受影响的模块，并尝试在当前页面中替换这些模块。如果该模块或其上层依赖可以接受热更新，那么页面就只会局部生效，当前路由、输入状态和其他未受影响的上下文可以继续保留；如果这条链路上没有可接受更新的边界，运行时才会退化为整页刷新。

简而言之，就是修改代码后，webpack 重新编译变更模块；开发服务器通过 WebSocket 或 SSE 通知浏览器；浏览器收到通知后，只替换变更模块，而不刷新整个页面。

在当前项目里，`webpack-dev-middleware` 负责把最新构建结果以中间件形式提供出来，而 `webpack-hot-middleware` 负责建立热更新事件的通信与推送能力。两者配合后，才构成完整的 HMR 链路。

整体上，开发环境以“快速构建、热更新、方便调试”为核心，为后续生产环境优化提供了稳定的本地研发基础。

### 3.4 完成生产环境构建优化

在开发链路可用之后，本阶段继续补齐生产环境下的分包、缓存、压缩和构建性能优化能力，以降低产物体积并提升线上加载效率。

首先，通过 `splitChunks` 将第三方依赖抽离到 `vendor` 中。由于 Vue、axios、lodash 等依赖通常来自 `node_modules` 且变化频率较低，将其单独打包可以提高缓存命中率，减少业务代码变更带来的重复下载。

同时，将被多个业务入口复用的代码抽离到 `common` 中，只要模块被至少两个入口引用，即可作为公共模块参与拆分。对应配置可以统一表达为：

```js
splitChunks: {
  cacheGroups: {
    vendor: {
      test: /[\\/]node_modules[\\/]/,
      name: "vendor",
      priority: 20,
      enforce: true,
      reuseExistingChunk: true,
    },
    common: {
      name: "common",
      minChunks: 2,
      minSize: 1,
      priority: 10,
      reuseExistingChunk: true,
    },
  },
}
```

此外，开启 `runtimeChunk: true`，将 webpack 运行时代码从业务 bundle 中独立拆出。这样做可以避免业务代码的小改动频繁影响运行时代码的缓存，进一步细化缓存粒度。

在构建性能方面，将原有的 `HappyPack` 替换为 `thread-loader`。对比结果显示，新方案在 webpack 5 环境下更稳定，也更符合当前官方生态。

原方案 `HappyPack`：

```text
webpack 5.106.2 compiled successfully in 9016 ms
webpack 5.106.2 compiled successfully in 7013 ms
webpack 5.106.2 compiled successfully in 8629 ms
```

替换为 `thread-loader` 后：

```text
webpack 5.106.2 compiled successfully in 7094 ms
webpack 5.106.2 compiled successfully in 1181 ms
webpack 5.106.2 compiled successfully in 1190 ms
```

`HappyPack` 并非完全不可用，但它属于较早期的外挂式并行构建方案。在 webpack 5 时代，`thread-loader` 与当前构建缓存和官方生态的兼容性更好，因此更适合作为当前工程的多线程打包方案。

在样式和压缩优化方面，使用 `MiniCssExtractPlugin` 将 CSS 从构建结果中提取为独立文件，再通过 `CSSMinimizerPlugin` 对 CSS 进行压缩输出。同时，生产环境还需要配合移除 `console` 等调试信息，以进一步减小产物体积并降低无效运行开销。

整体上，生产环境更强调“更小体积、更高性能、更稳定上线”，与开发环境形成了清晰的职责划分。

### 3.5 完成前端请求工具封装

除构建体系外，本阶段还补充了前端请求工具的统一封装，用于收敛页面侧的接口调用方式。该部分主要包括请求封装、签名处理、统一响应处理和异常提示等能力。

通过将请求逻辑统一下沉，可以减少各页面重复处理请求参数、鉴权签名和错误提示的代码，也为后续接口治理和前后端联调提供更一致的接入方式。

## 4. 参考资料

- [webpack](https://webpack.docschina.org/concepts/)
