---
title: Elpis 1：基于 Node.js 实现服务端内核引擎
date: 2026-04-30T10:58
tags:
  - Elpis
---

# Elpis 1：基于 Node.js 实现服务端内核引擎

## 1. 项目介绍

Elpis 是一个基于 Koa 的轻量级服务端项目。项目通过约定优于配置的方式，实现模块自动加载、路由自动注册等基础能力；同时采用分层设计组织业务代码，将框架层与业务层解耦，以便后续扩展和维护。

## 2. 阶段目标

本阶段的目标是完成 Elpis 服务端内核的基础能力建设，形成可启动、可扩展、可承载基础业务逻辑的项目骨架，为后续业务开发和能力演进提供统一的运行基础。

## 3. 阶段任务

### 3.1 项目启动和基础框架搭建

本阶段完成了项目启动流程和基础框架的搭建。项目通过入口文件启动服务，再由 `elpis-core` 统一完成 Koa 实例创建、配置加载、业务模块装配以及路由注册等工作，从而收敛项目初始化逻辑，降低接入和维护成本。

```js
// 引入elpis-core
const ElpisCore = require("./elpis-core");

// 启动项目
ElpisCore.start({
  name: "Elpis",
  homePage: "/",
});
```

### 3.2 完成模块自动加载机制

本阶段实现了模块自动加载机制。项目启动时，系统会自动扫描 `config`、`extend`、`middleware`、`service`、`controller`、`router-schema` 和 `router` 目录，并将对应模块挂载到应用实例上。该机制减少了手动注册代码，统一了项目初始化方式，也提升了整体结构的一致性。

按照以下顺序加载模块：

1. `config`：加载配置文件，提供全局配置支持。
2. `extend`：加载扩展模块，提供一些全局可用的工具函数。
3. `middleware`：加载中间件模块，根据实际情况注入全局中间件。
4. `service`：加载业务逻辑模块。
5. `controller`：加载控制器模块。
6. `router-schema`：加载接口参数校验规则，为后续接口校验提供依据。
7. `router`：加载路由注册模块，完成接口和页面路由的注册。

之所以采用上述加载顺序，是为了确保在路由正式生效之前，配置、扩展能力、业务模块和中间件均已完成准备，避免模块尚未初始化完成就被提前调用。

其中，`router-schema` 本质上是路径与校验规则之间的映射关系，其注入位置对运行结果影响较小。出于使用体验和职责划分的考虑，将其放在 `router` 之前进行加载。

### 3.3 完成基础业务分层

本阶段完成了基础业务分层设计。项目将业务代码划分为 `controller`、`service`、`middleware` 和 `router` 四个部分：`controller` 负责请求处理与响应返回，`service` 负责具体业务逻辑，`middleware` 负责参数校验、签名校验和异常处理等通用能力，`router` 负责请求路径与控制器方法的映射。

通过上述分层，项目中各模块的职责边界更加清晰，能够有效避免业务逻辑过度集中，也为后续功能扩展和问题排查提供了更好的可维护性。

### 3.4 完成基础中间件能力

本阶段完成了基础中间件能力建设，当前已支持参数校验、签名校验和异常处理等通用能力。通过将这部分逻辑下沉到中间件层，可以减少业务代码中的重复判断，使 `controller` 和 `service` 更聚焦于核心业务处理。

其中，参数校验中间件需要单独处理。Koa 实例本身并不直接提供 `params` 解析能力，`params` 是在路由匹配阶段对 `ctx` 的扩展。因此，参数校验中间件需要在路由中间件执行之后，才能正确获取对应的路径参数，这也是该中间件采用随路由注册一并注入方式的原因。

### 3.5 接口请求和页面渲染

本阶段已实现基础接口处理和页面渲染能力。接口侧验证了从 `router` 到 `controller` 再到 `service` 的调用链路；页面侧验证了从 `router` 到 `controller` 再到模板渲染的执行流程，说明当前项目已经具备承载基础接口和页面访问的能力。

当前请求的整体执行链路如下：

```
middleware before
  router before
    controller - service
  router after
middleware after
```

约定：

1. `/api` 开头的路径用于接口调用。
2. `/view` 开头的路径用于页面访问。

```js
// 调用接口
router.put("/api/project/:id", app.middlewares.apiParamsVerify, (ctx) =>
  projectController.update(ctx),
);

// 访问页面
router.get("/view/:page", (ctx) => viewController.renderPage(ctx));
```

## 4. 参考资料

- [koa](https://koa.bootcss.com/)
- [koa-router](https://github.com/koajs/router)
