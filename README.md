# CPZ Vault

基于 VitePress 搭建的个人博客与知识库项目，用来沉淀文章、笔记和阶段性总结。项目目前已经具备基础的站点展示能力，以及一套用于快速生成文章的命令行工具。

## 快速开始

### 安装依赖

建议优先使用 `pnpm`：

```bash
pnpm install
```

### 启动开发环境

```bash
pnpm docs:dev
```

默认开发端口为 `3000`。

### 构建静态站点

```bash
pnpm docs:build
```

### 本地预览构建结果

```bash
pnpm docs:preview
```

### 创建新文章

```bash
pnpm post
```

执行后会提示输入文章标题，并自动在 `docs/posts/<year>/<month>/` 下生成对应 Markdown 文件。

## 目录说明

```text
docs/                站点内容与页面组件
docs/.vitepress/     VitePress 配置
docs/comps/          首页文章列表与卡片组件
docs/posts/          博客文章内容
docs/types/          站点使用的类型定义
scripts/             命令行脚本
templates/           文章模板
```

## 任务列表

- [x] 首页文章列表展示，支持从 Markdown 文章中读取数据并渲染
- [x] 文章数据加载与转换逻辑，包括日期格式化与摘要提取
- [x] Vue 组件`post-card-list` 和 `post-card-item` 拆分
- [x] 支持 Cli 创建新文章，输入标题后自动生成新文章文件
- [x] 接入文章模板，可统一生成 frontmatter 与正文骨架
- [ ] 增加首页文章分页，并支持底部分页器切换功能
- [ ] 文章标签功能，并支持点击标签跳转到按标签分类查询功能
- [ ] 支持文章草稿，首页列表读取过滤掉草稿状态的文章