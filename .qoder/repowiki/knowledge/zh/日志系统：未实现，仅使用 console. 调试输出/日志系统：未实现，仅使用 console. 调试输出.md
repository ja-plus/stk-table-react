---
kind: logging_system
name: 日志系统：未实现，仅使用 console.* 调试输出
category: logging_system
scope:
    - '**'
---

本仓库未发现任何统一的日志系统。核心库 `src/StkTable/` 下没有任何 `console.log`、`logger`、`debug`、`info`、`warn`、`error` 等调用，也没有引入第三方日志框架（如 winston、pino、bunyan、debug 等）。所有与日志相关的输出仅出现在 `docs-demo/` 演示代码中，且全部是散落的 `console.log` / `console.error` 语句，用于在示例页面打印交互事件，属于临时调试用途，不具备结构化字段、级别管理或统一 sink 等日志系统特征。因此该类别在本仓库不适用。