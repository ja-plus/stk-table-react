---
kind: build_system
name: Vite + pnpm 单仓构建与文档站点体系
category: build_system
scope:
    - '**'
source_files:
    - package.json
    - vite.config.ts
    - tsconfig.json
    - vitest.config.ts
    - lib-demo/vite.config.ts
    - docs-src/.vitepress/config.ts
---

## 1. 构建系统与工具链
- 包管理器：pnpm@10.7.0（通过 `packageManager` 字段锁定）
- 构建工具：Vite 8，使用 `vite build` 输出库产物；开发服务器端口 5199
- 类型生成：生产构建时启用 `vite-plugin-dts` 生成 `.d.ts`，并排除 `test/`、`demo/`
- 样式处理：Less → CSS，最终产物统一为 `lib/style.css`（通过 Rollup `assetFileNames` 重命名）
- JSX 转换：esbuild 与 Vite React 插件均配置 `jsx: 'automatic'` / `react-jsx`，无需显式 import React
- 目标浏览器：`target: ['chrome84']`，ES 模块仅输出 ESM 格式
- 外部依赖：`react`、`react-dom` 标记为 external，作为 peerDependencies 由消费者提供

## 2. 关键配置文件与脚本
- `package.json`：声明入口 `main`、`types`、`files`（发布 `lib`、`src`），并提供 `dev`、`build`、`test`、`docs:*` 等脚本
- `vite.config.ts`：库构建主配置，定义 entry、formats、external、banner、dts 插件等
- `tsconfig.json`：全局 TS 编译选项，开启 strict、sourceMap、bundler 解析、`@/*` 路径别名
- `vitest.config.ts`：单元测试配置，jsdom 环境，自动包含 `src/StkTable/**/*.test.*` 与 `test/**` 下的用例
- `lib-demo/vite.config.ts`：独立 demo 工程，允许从父目录读取已构建的 `../lib` 产物进行消费验证
- `docs-src/.vitepress/config.ts`：多语言文档站配置，集成 `vitepress-demo-plugin` 将 `docs-demo` 中的示例嵌入 Markdown

## 3. 产物结构与发布约定
- 构建输出目录：`lib/`（含 `stk-table-react.js`、`index.d.ts`、`style.css` 等）
- 发布文件白名单：`files: ["lib", "src"]`，确保源码与类型声明随 npm 包一起发布
- 版本信息注入：通过 `vite-plugin-banner` 在产物头部写入 name/version/description/author/homepage/license
- 文档站点：`docs-src` 下按 `main/en/ja/ko` 组织四语内容，`docs-demo` 存放可运行示例组件

## 4. 开发者工作流与规则
- 本地开发：`pnpm dev` 启动 Vite 开发服务器，`pnpm docs:dev` 启动 VitePress 文档站
- 构建库：`pnpm build` 输出到 `lib/`，随后可用 `lib-demo` 验证产物是否可被正常消费
- 运行测试：`pnpm test` 基于 Vitest + jsdom 执行所有 `*.test.{ts,tsx}` 用例
- 代码规范：ESLint + Prettier，lint 命令限定扫描 `src` 目录下的 `.ts/.tsx` 文件
- 新增示例：在 `docs-demo` 中创建组件，并在 `docs-src` 对应语言的 Markdown 中通过 `<Demo>` 语法引用
- 新增功能：在 `src/StkTable` 下实现逻辑，同步更新 `src/StkTable/types/index.ts` 的类型导出，并确保 `index.ts` 重新导出新 API
- 发布前检查：确认 `lib/` 产物存在、类型声明完整、`style.css` 未被拆分、peerDependencies 版本范围合理