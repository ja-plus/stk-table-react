---
kind: frontend_style
name: 基于 CSS 变量 + LESS 的主题化样式系统
category: frontend_style
scope:
    - '**'
source_files:
    - src/StkTable/style.less
    - lib/style.css
    - src/StkTable/custom-cells/CheckboxCell/CheckboxCell.less
    - src/StkTable/custom-cells/EditableCell/EditableCell.less
    - src/StkTable/custom-cells/FilterCell/Filter.less
    - docs-demo/basic/theme/CssVarsDemo.tsx
    - src/StkTable/const.ts
    - postcss.config.js
    - package.json
---

## 样式体系概览

stk-table-react 采用 **LESS + CSS 自定义属性（CSS Variables）** 的混合方案实现主题化与可定制性，不依赖任何 CSS-in-JS 或 UI 组件库。所有视觉样式通过一个主样式文件集中管理，并通过 `theme` prop 切换亮/暗两套设计令牌。

## 核心架构

### 1. 设计令牌层（Design Tokens）
- 所有颜色、尺寸、间距等视觉常量均以 CSS 变量形式定义在 `.stk-table` 根选择器下，如 `--row-height`、`--border-color`、`--td-bgc`、`--th-color` 等 30+ 个变量
- 提供完整的亮色默认值与 `.dark` 类覆盖的暗色值，支持运行时动态切换
- 文档站点的 `CssVarsDemo.tsx` 提供了可视化调试面板，可直接修改任意 CSS 变量并一键复制生成的 CSS 片段

### 2. 样式组织方式
- **主样式文件**：`src/StkTable/style.less`（768 行），包含表格核心样式、边框绘制、虚拟滚动、固定列阴影、单元格选区、排序箭头、折叠图标、滚动条等全部样式逻辑
- **构建产物**：编译后输出到 `lib/style.css`，作为 npm 包的一部分随组件发布
- **子模块样式**：内置自定义单元格（CheckboxCell、EditableCell、FilterCell）各自拥有独立的 `.less` 文件，按需引入
- **无 Tailwind/原子 CSS**：项目未使用任何原子化 CSS 框架，完全手写语义化类名

### 3. 主题机制
- 通过 `theme` prop（`'light' | 'dark'`）控制根元素添加 `dark` 类
- 高亮动画颜色根据主题动态计算（JS 中 `HIGHLIGHT_COLOR.light/dark` 常量）
- 过滤下拉框也支持 `--light` / `--dark` 变体类名适配不同主题

### 4. 构建与处理链
- 使用 **Less** 预处理器编写样式
- **PostCSS** 插件链：`postcss-preset-env`（特性自动补全）+ `postcss-discard-comments`（移除注释）
- Vite 负责 Less → CSS 转换及打包

## 关键约定与规则

1. **命名空间**：所有类名前缀为 `stk-`，避免与宿主应用冲突
2. **CSS 变量优先**：新增视觉配置应优先定义为 CSS 变量而非硬编码值
3. **BEM 风格**：使用 `--` 修饰符表示变体（如 `stk-filter--light`、`stk-filter--dark`）
4. **响应式策略**：通过 `@media (hover: none) and (pointer: coarse)` 检测移动端，禁用自定义滚动条恢复原生触摸滚动
5. **性能优化**：大量使用 `will-change`、`contain`、`sticky` 定位提升渲染性能
6. **兼容性考虑**：针对 Chrome < 56 / Firefox < 59 提供 legacy sticky 兼容模式

## 扩展点

- 用户可通过覆盖 `.stk-table` 上的 CSS 变量实现主题定制
- 通过传入 `className` 和 `style` 属性进行局部样式覆盖
- 自定义单元格组件可附带独立样式文件，由使用者自行引入