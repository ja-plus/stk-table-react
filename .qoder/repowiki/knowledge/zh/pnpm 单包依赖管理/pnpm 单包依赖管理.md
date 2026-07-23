---
kind: dependency_management
name: pnpm 单包依赖管理
category: dependency_management
scope:
    - '**'
source_files:
    - package.json
    - pnpm-lock.yaml
---

本仓库采用 pnpm 作为唯一包管理器，以单包形式管理 StkTable React 组件及其文档、示例和测试的依赖。核心决策与约定如下：

1. 包管理器锁定
- package.json 中通过 `packageManager: "pnpm@10.7.0"` 强制团队使用指定版本的 pnpm。
- 根目录存在 `pnpm-lock.yaml`（lockfileVersion 9.0），所有依赖版本被精确锁定，确保安装可复现。
- 未启用 pnpm workspaces，整个仓库视为单一项目，不存在子包或 monorepo 结构。

2. 依赖声明策略
- 运行时依赖仅通过 `peerDependencies` 声明对 `react` 和 `react-dom` 的版本要求（>=16.8.0），由消费方自行提供，避免打包进库产物。
- 构建、开发、文档、测试相关工具全部放入 `devDependencies`，包括 Vite、TypeScript、Vitest、VitePress、ESLint/Prettier、Less、PostCSS 等。
- 无 `dependencies` 字段，表明该包不直接依赖任何第三方运行时库。

3. 私有源与镜像
- 未发现 `.npmrc`、`.pnpmrc`、`pnpm-workspace.yaml` 或 lockfile 中的自定义 registry 配置，默认使用 npm 官方源。
- 未发现 GOPRIVATE、vendor 目录、Go mod 文件等非 JS/TS 生态的依赖管理痕迹。

4. 发布与产物
- `files` 字段仅包含 `lib` 和 `src`，发布到 npm 的产物为编译后的 `lib/stk-table-react.js` 及类型声明，不包含源码外的开发依赖。
- 无 vendoring 策略，也不存在本地 `node_modules` 提交；依赖通过 pnpm 从远端解析并写入 lockfile。

开发者应遵循的规则
- 新增依赖时区分用途：运行期 peer 依赖写 `peerDependencies`，其余一律写 `devDependencies`。
- 修改依赖后必须提交更新后的 `pnpm-lock.yaml`，禁止手动编辑锁文件。
- 不要引入 `dependencies` 下的运行时依赖，除非确需随包分发。
- 如需切换私有源或镜像，应在仓库级配置文件（如 `.npmrc`）中集中声明，而非在单个包的 package.json 中设置。