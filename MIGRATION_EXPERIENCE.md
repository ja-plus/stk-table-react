# StkTable 跨框架迁移经验总结

> 基于 stk-table-vue → stk-table-react 的迁移实践，为未来迁移到更多前端框架提供参考。

---

## 一、核心概念映射（Vue → React）

| Vue 概念 | React 对应实现 | 说明 |
|----------|---------------|------|
| `reactive` / `ref` | `useRef` + `useState` | 不需要触发渲染的可变状态用 `useRef`（如虚拟滚动位置），需要渲染响应的用 `useState` |
| `computed` | `useMemo` | 列配置解析、派生数据等计算缓存 |
| `watch` | `useEffect` / 事件回调内手动同步 | 监听 props 变化并执行副作用 |
| `provide/inject` | `createContext` + `useContext` | 如 StkTableContext 向自定义单元格传递数据源和主题 |
| 插槽 (slot) | `ComponentType` props（`customCell` / `customHeaderCell`） | Vue 的 scoped slot → React 组件 prop |
| `v-model` | 受控 props + 回调 | 排序、筛选等状态由外部管理 |
| 生命周期钩子 | `useEffect` + cleanup | 初始化/销毁事件监听、定时器 |
| `defineExpose` | `forwardRef` + `useImperativeHandle` | 暴露 scrollTo、resetSorter、setFilter 等命令式方法 |

---

## 二、架构设计经验

### 1. 单组件大文件 + Ref 集中管理状态

Vue 版本中大量使用 `reactive` 对象管理内部状态。React 版将其拆分为：

- **`useRef`**：高频变更但不需要触发渲染的状态（虚拟滚动位置 `virtualScrollRef`、列宽缓存 `colWidthCacheRef`、行高缓存 `autoRowHeightMapRef`）
- **`useState`**：需要触发 UI 更新的状态（`version` 强制刷新计数器、滚动条位置 `sbThumb`）
- **`useMemo`**：派生计算（列配置、表头结构、容器 class/style）

> **经验**：虚拟表格的滚动计算是极高频操作，必须用 Ref 避免不必要的 re-render，仅在最终需要更新 DOM 时通过 `setVersion(v => v+1)` 批量触发一次渲染。

### 2. 强制渲染计数器模式

```ts
const [version, setVersion] = useState(0);
// 滚动时：更新 ref → setVersion(v => v + 1)
```

这是替代 Vue 响应式自动追踪的关键模式——手动控制"何时重渲染"。

### 3. 命令式 API 通过 `forwardRef` + `useImperativeHandle` 暴露

Vue 版通过 `defineExpose` 暴露方法，React 版用 `useImperativeHandle` 将 `scrollTo`、`resetSorter`、`setFilter` 等方法挂载到 ref 上。

---

## 三、关键迁移难点与解决方案

### 1. 响应式 → 手动依赖管理

Vue 的 `computed` 自动追踪依赖；React 的 `useMemo`/`useCallback` 需要**手动声明依赖数组**。遗漏依赖会导致闭包陷阱（stale closure），多写依赖会导致性能下降。

> **对策**：对高频回调（滚动、拖拽）使用 `useCallback` + Ref 读取最新值，减少依赖项。

### 2. 虚拟滚动 DOM 占位

Vue 模板中用 `<tr style="height: offsetTop">` 做顶部占位，React 中完全一致——**DOM 结构与框架无关**，核心算法（二分查找、索引计算）可直接复用。

### 3. 自定义单元格

- Vue：通过 `h()` 渲染函数或 scoped slot
- React：定义为 `ComponentType<CustomCellProps>`，在列配置中传入组件引用

> **经验**：将"单元格渲染"抽象为"接收 props 的组件"是跨框架通用的设计。

### 4. 事件系统

Vue 的 `$emit` 多事件 → React 的 `onXxx` 回调 props。所有事件统一为 props 回调函数，类型通过 TypeScript 严格约束。

---

## 四、跨框架迁移通用原则

1. **分离"纯逻辑"与"框架绑定层"**
   - 排序算法、虚拟滚动索引计算、二分查找等 → 纯函数，框架无关
   - 状态管理、渲染、事件绑定 → 框架特定适配层

2. **保持 API 一致性**
   - Props 命名、事件名、暴露方法名保持与 Vue 版一致（如排序逻辑规范：默认排序列只在 asc ↔ desc 间切换）
   - 降低用户跨框架迁移的学习成本

3. **类型定义先行**
   - `StkTableColumn`、`StkTableProps`、`StkTableRef` 等类型先定义好，再实现逻辑
   - TypeScript 类型可跨框架复用（仅渲染相关类型需适配）

4. **样式系统框架无关**
   - CSS 变量 + LESS 方案不依赖框架，直接复用
   - 仅 class 绑定方式需适配（Vue `:class` → React `className` 字符串拼接）

5. **文档/示例同步迁移**
   - VitePress 文档结构可复用，仅代码示例需重写
   - Demo 组件按功能模块组织，便于逐个迁移验证

6. **测试策略**
   - 纯逻辑函数（排序、搜索）→ 单元测试可直接复用
   - 组件交互测试 → 需按目标框架的测试库重写（如 Vitest + Testing Library）

---

## 五、迁移检查清单（适用于任何目标框架）

- [ ] 梳理源框架所有响应式状态，分类为"需渲染响应"vs"纯内部状态"
- [ ] 将 computed/派生数据映射为目标框架的缓存/派生机制
- [ ] 将依赖注入映射为目标框架的 DI 机制
- [ ] 将 scoped slot 映射为目标框架的组件/渲染函数机制
- [ ] 将 expose 映射为目标框架的命令式 API 机制
- [ ] 验证虚拟滚动在目标框架的渲染模型下性能达标
- [ ] 保持对外 API（props/events/methods）命名一致
- [ ] 复用纯逻辑函数和样式系统
- [ ] 纯逻辑单元测试直接迁移，组件测试按框架重写

---

## 六、各框架适配要点预判

| 目标框架 | 状态管理 | 派生计算 | 依赖注入 | 自定义渲染 | 命令式API |
|---------|---------|---------|---------|-----------|----------|
| **Svelte** | `$:` 响应式声明 / store | `$:` 自动派生 | Context API | `<slot>` / render function | `bind:this` + 方法 |
| **Solid** | `createSignal` / `createStore` | `createMemo` | Context | 组件 props (JSX) | `ref` + 方法 |
| **Angular** | Signal / RxJS | `computed` / pipe | DI 装饰器 | `ng-template` / `*ngTemplateOutlet` | `@ViewChild` + 方法 |
| **Preact** | 同 React（Hooks） | 同 React | 同 React | 同 React | 同 React |

---

*核心思路：算法和类型跨框架复用，渲染和状态管理按框架范式适配。*
