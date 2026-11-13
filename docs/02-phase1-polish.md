# Phase 1：基础加固与体验优化（短期 · 1-2 周）

> **目标**：解决现有架构痛点，提升开发效率和用户体验，为后续功能开发打下坚实基础。

---

## 1.1 前端路由系统重构

| 优先级 | 任务 | 说明 |
|--------|------|------|
| P0 | 引入 React Router v7 | 替换 App.jsx 中的 `currentPage` switch-case 状态路由 |
| P0 | 嵌套路由 + Layout | 登录页独立路由，登录后共用 TabBar Layout |
| P1 | 路由懒加载 | `React.lazy()` 按需加载页面组件，减少首屏 JS 体积 |

**收益**：支持浏览器前进/后退、URL 可分享、组件懒加载、代码更清晰

**改动文件**：`App.jsx` → 拆分 Layout + Routes，各页面从 switch-case 解耦

---

## 1.2 迁移 TypeScript

| 优先级 | 任务 | 说明 |
|--------|------|------|
| P0 | 配置 tsconfig + Vite TS 支持 | 逐步迁移 `.jsx` → `.tsx` |
| P0 | 定义核心类型 | `User`, `Record`, `Category`, `ApiResponse` 接口 |
| P1 | 为 apiFetch 添加泛型 | `apiFetch<T>(path, opts): Promise<T>` |

**收益**：类型安全、IDE 智能提示、减少运行时类型错误

**注意**：可与路由重构并行进行，先定义类型再逐个文件迁移

**新增文件**：`frontend/src/types/index.ts`

---

## 1.3 状态管理层引入

| 优先级 | 任务 | 说明 |
|--------|------|------|
| P0 | 引入 Zustand | 轻量状态管理，替代 props 层层透传 |
| P1 | 创建 Store | `useAuthStore`(用户/Token)、`useRecordStore`(记录)、`useCategoryStore`(分类) |
| P1 | 持久化中间件 | `persist` 中间件自动同步 localStorage |

**收益**：跨页面状态共享、消除 props drilling、代码更可维护

```
选择 Zustand 而非 Redux 的原因：API 简洁、体积小 (<1KB)、无样板代码、React 19 兼容
```

---

## 1.4 前端工程化完善

| 优先级 | 任务 | 说明 |
|--------|------|------|
| P0 | 环境变量化 API 地址 | `VITE_API_BASE` 区分 dev/prod |
| P1 | 引入 ESLint + Prettier | 统一代码风格 (目前已配 ESLint，补充规则) |
| P1 | 配置代理转发 | vite.config.ts proxy 解决开发跨域 |
| P2 | 引入 Vitest 单元测试 | 为 utils、services 编写基础测试 |

---

## 1.5 UI/UX 体验优化

| 优先级 | 任务 | 说明 |
|--------|------|------|
| P1 | 加载骨架屏 (Skeleton) | 首页/统计页数据加载时显示骨架屏而非 spinner |
| P1 | 下拉刷新 (Pull-to-refresh) | 首页下拉重新加载数据，更符合移动端习惯 |
| P1 | 触感反馈 (Haptic) | 按钮点击微动效反馈 |
| P2 | Toast 通知系统 | 替代 `alert()`，实现顶部 Toast 提示组件 |
| P2 | 空状态插画 | 无记录时展示更友好的插画而非纯文字 |

---

## 1.6 后端加固

| 优先级 | 任务 | 说明 |
|--------|------|------|
| P1 | 统一异常处理完善 | 补充更多异常类型 (如 404, 403, 参数校验) |
| P1 | 参数校验 (Validation) | `@Valid` + `jakarta.validation` 注解校验请求体 |
| P1 | API 文档 (SpringDoc) | 引入 springdoc-openapi，自动生成 Swagger UI |
| P2 | 日志系统增强 | 引入 SLF4J + Logback 配置，按天滚动 |
| P2 | 分页查询 | 记录列表支持分页，避免单次查询全量数据 |

---

## 效果衡量

| 指标 | 当前 | 目标 |
|------|------|------|
| 前端构建速度 | ~5s | <2s (SWC 已优化) |
| API 调用容错 | alert 弹窗 | Toast 通知 |
| 页面切换体验 | 无过渡 | 路由动画 + 骨架屏 |
| 代码类型安全 | 无类型 | TypeScript 全覆盖 |
