# 高亮钩子 (useHighlight)

<cite>
**本文引用的文件**   
- [src/StkTable/hooks/useHighlight.ts](file://src/StkTable/hooks/useHighlight.ts)
- [docs-demo/advanced/highlight/HighlightBase.tsx](file://docs-demo/advanced/highlight/HighlightBase.tsx)
- [docs-demo/advanced/highlight/Highlight.tsx](file://docs-demo/advanced/highlight/Highlight.tsx)
- [docs-demo/advanced/highlight/HighlightAnimation.tsx](file://docs-demo/advanced/highlight/HighlightAnimation.tsx)
- [docs-demo/advanced/highlight/HighlightCss.tsx](file://docs-demo/advanced/highlight/HighlightCss.tsx)
- [docs-demo/advanced/highlight/const.ts](file://docs-demo/advanced/highlight/const.ts)
- [docs-src/main/table/advanced/highlight.md](file://docs-src/main/table/advanced/highlight.md)
</cite>

## 目录
1. [简介](#简介)
2. [项目结构](#项目结构)
3. [核心组件](#核心组件)
4. [架构总览](#架构总览)
5. [详细组件分析](#详细组件分析)
6. [依赖分析](#依赖分析)
7. [性能考虑](#性能考虑)
8. [故障排查指南](#故障排查指南)
9. [结论](#结论)
10. [附录](#附录)

## 简介
本章节聚焦于表格的高亮能力，围绕 useHighlight 钩子展开。该钩子用于在表格中实现“行/单元格”级别的高亮显示，支持基础高亮、动画高亮与 CSS 变量驱动的高亮样式等模式。通过统一的 API，上层示例可快速接入并组合不同的视觉表现。

## 项目结构
与高亮功能相关的代码主要分布在以下位置：
- 源码层：hooks/useHighlight.ts（核心逻辑）
- 演示层：docs-demo/advanced/highlight/*（多种使用方式与样式方案）
- 文档层：docs-src/main/table/advanced/highlight.md（使用说明与示例说明）

```mermaid
graph TB
subgraph "源码"
H["useHighlight.ts"]
end
subgraph "演示"
HB["HighlightBase.tsx"]
HA["Highlight.tsx"]
HAN["HighlightAnimation.tsx"]
HC["HighlightCss.tsx"]
C["const.ts"]
end
subgraph "文档"
D["highlight.md"]
end
HB --> H
HA --> H
HAN --> H
HC --> H
HB --> C
HA --> C
HAN --> C
HC --> C
D -.参考.-> HB
D -.参考.-> HA
D -.参考.-> HAN
D -.参考.-> HC
```

图表来源
- [src/StkTable/hooks/useHighlight.ts](file://src/StkTable/hooks/useHighlight.ts)
- [docs-demo/advanced/highlight/HighlightBase.tsx](file://docs-demo/advanced/highlight/HighlightBase.tsx)
- [docs-demo/advanced/highlight/Highlight.tsx](file://docs-demo/advanced/highlight/Highlight.tsx)
- [docs-demo/advanced/highlight/HighlightAnimation.tsx](file://docs-demo/advanced/highlight/HighlightAnimation.tsx)
- [docs-demo/advanced/highlight/HighlightCss.tsx](file://docs-demo/advanced/highlight/HighlightCss.tsx)
- [docs-demo/advanced/highlight/const.ts](file://docs-demo/advanced/highlight/const.ts)
- [docs-src/main/table/advanced/highlight.md](file://docs-src/main/table/advanced/highlight.md)

章节来源
- [src/StkTable/hooks/useHighlight.ts](file://src/StkTable/hooks/useHighlight.ts)
- [docs-demo/advanced/highlight/HighlightBase.tsx](file://docs-demo/advanced/highlight/HighlightBase.tsx)
- [docs-demo/advanced/highlight/Highlight.tsx](file://docs-demo/advanced/highlight/Highlight.tsx)
- [docs-demo/advanced/highlight/HighlightAnimation.tsx](file://docs-demo/advanced/highlight/HighlightAnimation.tsx)
- [docs-demo/advanced/highlight/HighlightCss.tsx](file://docs-demo/advanced/highlight/HighlightCss.tsx)
- [docs-demo/advanced/highlight/const.ts](file://docs-demo/advanced/highlight/const.ts)
- [docs-src/main/table/advanced/highlight.md](file://docs-src/main/table/advanced/highlight.md)

## 核心组件
- useHighlight 钩子
  - 职责：维护高亮状态集合、提供添加/移除/清空高亮的操作、暴露当前高亮键集合供渲染层消费。
  - 典型用法：在表格数据变更或用户交互时调用添加方法；在离开或取消选择时调用移除方法；必要时清空全部高亮。
  - 返回值：包含高亮键集合与操作方法的对象，便于在组件内直接解构使用。

- 演示组件
  - HighlightBase.tsx：展示最简高亮用法，通常基于行键或单元格标识进行高亮切换。
  - Highlight.tsx：在基础之上增加交互控制（如批量高亮、条件高亮）。
  - HighlightAnimation.tsx：引入过渡动画效果，增强视觉反馈。
  - HighlightCss.tsx：通过 CSS 变量或类名切换实现高亮样式，便于主题化。
  - const.ts：集中定义演示所需常量（如列配置、默认高亮键等），提高复用性。

章节来源
- [src/StkTable/hooks/useHighlight.ts](file://src/StkTable/hooks/useHighlight.ts)
- [docs-demo/advanced/highlight/HighlightBase.tsx](file://docs-demo/advanced/highlight/HighlightBase.tsx)
- [docs-demo/advanced/highlight/Highlight.tsx](file://docs-demo/advanced/highlight/Highlight.tsx)
- [docs-demo/advanced/highlight/HighlightAnimation.tsx](file://docs-demo/advanced/highlight/HighlightAnimation.tsx)
- [docs-demo/advanced/highlight/HighlightCss.tsx](file://docs-demo/advanced/highlight/HighlightCss.tsx)
- [docs-demo/advanced/highlight/const.ts](file://docs-demo/advanced/highlight/const.ts)

## 架构总览
下图展示了从用户交互到 UI 更新的完整流程：用户在表格中进行操作（如点击行），触发高亮更新，useHighlight 维护状态，渲染层读取状态并应用样式或动画。

```mermaid
sequenceDiagram
participant U as "用户"
participant T as "表格组件"
participant H as "useHighlight 钩子"
participant R as "渲染层"
U->>T : "触发交互(如点击行)"
T->>H : "调用添加/移除高亮方法"
H-->>T : "返回最新高亮键集合"
T->>R : "传入高亮键集合与行/单元格标识"
R-->>U : "应用高亮样式/动画"
```

图表来源
- [src/StkTable/hooks/useHighlight.ts](file://src/StkTable/hooks/useHighlight.ts)
- [docs-demo/advanced/highlight/HighlightBase.tsx](file://docs-demo/advanced/highlight/HighlightBase.tsx)
- [docs-demo/advanced/highlight/HighlightAnimation.tsx](file://docs-demo/advanced/highlight/HighlightAnimation.tsx)
- [docs-demo/advanced/highlight/HighlightCss.tsx](file://docs-demo/advanced/highlight/HighlightCss.tsx)

## 详细组件分析

### useHighlight 钩子
- 设计要点
  - 内部维护一个高亮键集合（Set 或数组），对外暴露 add/remove/clear 等方法。
  - 提供稳定的引用，避免不必要的重渲染。
  - 可与表格的 key 字段或自定义标识绑定，确保高亮定位准确。
- 复杂度与性能
  - 增删查操作通常为 O(1)（基于 Set）或 O(n)（基于数组），建议大数据量场景优先使用 Set。
  - 避免在高频事件中创建新对象，保持方法引用稳定。
- 错误处理与边界
  - 对重复添加/移除做幂等处理，防止状态异常。
  - 对空键或非法键进行过滤，保证集合一致性。
- 优化建议
  - 将高亮键集合提升到更高层级共享，减少重复计算。
  - 结合虚拟滚动时，仅对可视区域应用高亮样式，降低 DOM 操作成本。

章节来源
- [src/StkTable/hooks/useHighlight.ts](file://src/StkTable/hooks/useHighlight.ts)

### 演示组件：HighlightBase.tsx
- 作用：最小可用示例，展示如何获取高亮键集合并在行渲染时判断是否高亮。
- 关键点：
  - 将行唯一标识与高亮键集合匹配。
  - 根据匹配结果动态注入样式类或内联样式。
- 适用场景：快速验证高亮能力，作为其他复杂示例的基础。

章节来源
- [docs-demo/advanced/highlight/HighlightBase.tsx](file://docs-demo/advanced/highlight/HighlightBase.tsx)

### 演示组件：Highlight.tsx
- 作用：在基础示例上扩展交互，例如多选高亮、按条件高亮。
- 关键点：
  - 维护多个高亮键，支持批量操作。
  - 与表格事件（如选中、搜索）联动，自动更新高亮集合。
- 适用场景：需要灵活控制高亮范围的业务页面。

章节来源
- [docs-demo/advanced/highlight/Highlight.tsx](file://docs-demo/advanced/highlight/Highlight.tsx)

### 演示组件：HighlightAnimation.tsx
- 作用：为高亮添加过渡动画，提升用户体验。
- 关键点：
  - 在高亮键变化时触发动画类名切换。
  - 注意动画性能，避免过度重绘。
- 适用场景：强调关键数据变化的场景（如搜索结果高亮）。

章节来源
- [docs-demo/advanced/highlight/HighlightAnimation.tsx](file://docs-demo/advanced/highlight/HighlightAnimation.tsx)

### 演示组件：HighlightCss.tsx
- 作用：通过 CSS 变量或类名切换实现高亮样式，便于主题化与统一风格管理。
- 关键点：
  - 将高亮样式抽离至 CSS 变量或公共类。
  - 支持多套主题切换，保持行为一致。
- 适用场景：需要强主题化与样式治理的项目。

章节来源
- [docs-demo/advanced/highlight/HighlightCss.tsx](file://docs-demo/advanced/highlight/HighlightCss.tsx)

### 常量：const.ts
- 作用：集中存放演示所需的列配置、默认高亮键等常量，便于复用与维护。
- 关键点：
  - 与表格列定义解耦，方便在不同示例间共享。
  - 提供默认值，简化示例初始化。

章节来源
- [docs-demo/advanced/highlight/const.ts](file://docs-demo/advanced/highlight/const.ts)

### 概念流程图：高亮决策
```mermaid
flowchart TD
Start(["进入渲染"]) --> GetKeys["获取高亮键集合"]
GetKeys --> Match{"当前行/单元格<br/>是否在集合中?"}
Match --> |是| ApplyHL["应用高亮样式/动画"]
Match --> |否| SkipHL["不应用高亮"]
ApplyHL --> End(["完成渲染"])
SkipHL --> End
```

[此图为概念流程，不直接映射具体源码文件]

## 依赖分析
- 模块关系
  - 演示组件均依赖 useHighlight 钩子，形成“组件 -> 钩子”的单向依赖。
  - const.ts 被多个演示组件共享，起到配置中心的作用。
- 外部依赖
  - 无额外运行时依赖，主要依赖 React 生态（useState/useRef 等）。
- 潜在风险
  - 若高亮键与数据 key 不一致，可能导致高亮错位。
  - 频繁的状态更新可能引发重渲染，需关注性能。

```mermaid
graph LR
HB["HighlightBase.tsx"] --> H["useHighlight.ts"]
HA["Highlight.tsx"] --> H
HAN["HighlightAnimation.tsx"] --> H
HC["HighlightCss.tsx"] --> H
HB --> C["const.ts"]
HA --> C
HAN --> C
HC --> C
```

图表来源
- [src/StkTable/hooks/useHighlight.ts](file://src/StkTable/hooks/useHighlight.ts)
- [docs-demo/advanced/highlight/HighlightBase.tsx](file://docs-demo/advanced/highlight/HighlightBase.tsx)
- [docs-demo/advanced/highlight/Highlight.tsx](file://docs-demo/advanced/highlight/Highlight.tsx)
- [docs-demo/advanced/highlight/HighlightAnimation.tsx](file://docs-demo/advanced/highlight/HighlightAnimation.tsx)
- [docs-demo/advanced/highlight/HighlightCss.tsx](file://docs-demo/advanced/highlight/HighlightCss.tsx)
- [docs-demo/advanced/highlight/const.ts](file://docs-demo/advanced/highlight/const.ts)

章节来源
- [src/StkTable/hooks/useHighlight.ts](file://src/StkTable/hooks/useHighlight.ts)
- [docs-demo/advanced/highlight/HighlightBase.tsx](file://docs-demo/advanced/highlight/HighlightBase.tsx)
- [docs-demo/advanced/highlight/Highlight.tsx](file://docs-demo/advanced/highlight/Highlight.tsx)
- [docs-demo/advanced/highlight/HighlightAnimation.tsx](file://docs-demo/advanced/highlight/HighlightAnimation.tsx)
- [docs-demo/advanced/highlight/HighlightCss.tsx](file://docs-demo/advanced/highlight/HighlightCss.tsx)
- [docs-demo/advanced/highlight/const.ts](file://docs-demo/advanced/highlight/const.ts)

## 性能考虑
- 高亮键集合的选择
  - 大数据量建议使用 Set，增删查接近 O(1)。
- 渲染优化
  - 仅在必要节点应用高亮样式，避免全表遍历。
  - 与虚拟滚动配合，只针对可视区域计算高亮。
- 动画与样式
  - 动画尽量使用 transform/opacity 等合成属性，减少布局抖动。
  - 将样式抽离为类名或 CSS 变量，利用浏览器缓存与合并规则。
- 事件节流
  - 高频交互（如滚动、输入）下对高亮更新进行节流或防抖。

[本节为通用指导，不直接分析具体文件]

## 故障排查指南
- 高亮不生效
  - 检查行/单元格唯一标识是否与高亮键一致。
  - 确认高亮键集合是否正确更新且未被意外清空。
- 高亮错位
  - 核对数据 key 与高亮键映射关系，避免键冲突。
- 性能问题
  - 观察是否存在大量重渲染，尝试将高亮集合提升到更高层级或使用 memo。
  - 关闭动画或简化样式以定位瓶颈。
- 主题不生效
  - 检查 CSS 变量或类名是否被覆盖，确认样式加载顺序。

章节来源
- [docs-src/main/table/advanced/highlight.md](file://docs-src/main/table/advanced/highlight.md)

## 结论
useHighlight 钩子提供了简洁而强大的高亮能力，配合不同演示组件可满足从基础到高阶的使用需求。在实际项目中，建议结合业务场景选择合适的模式（基础/动画/CSS 变量），并注意性能与主题化方面的最佳实践。

[本节为总结性内容，不直接分析具体文件]

## 附录
- 相关文档
  - 高级特性-高亮：[docs-src/main/table/advanced/highlight.md](file://docs-src/main/table/advanced/highlight.md)