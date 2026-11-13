# 记账助手 Pro 后续开发路线图

> 本文档是后续开发的总体路线图，详细计划请参阅各阶段子文档。

---

## 总体策略：短跑迭代，价值优先

```
Phase 1: 基础加固  ───  Phase 2: 功能增强  ───  Phase 3: 智能进化
   (1-2 周)               (2-4 周)                (1-2 月)
```

**开发原则：**
- 每个 Phase 产出可独立上线验证的功能
- 优先解决用户痛点，再追求技术完美
- 小步快跑，每 1-2 周有可见交付

---

## 当前项目健康状况

| 维度 | 评分 | 说明 |
|------|------|------|
| 核心功能完整度 | ⭐⭐⭐⭐⭐ | 记账 CRUD + 统计 + AI 已完备 |
| 代码架构 | ⭐⭐⭐⭐ | 分层清晰，但前后端均有优化空间 |
| 用户体验 | ⭐⭐⭐⭐ | 基础体验良好，缺精细化打磨 |
| 测试覆盖 | ⭐ | 几乎无自动化测试 |
| 部署运维 | ⭐⭐ | 仅开发环境可用 |
| 安全性 | ⭐⭐⭐ | 基础 JWT 认证，缺深层防护 |

---

## 推荐执行顺序

### Week 1-2：Phase 1 核心项
1. React Router + Zustand 重构
2. TypeScript 迁移
3. 环境变量 + 骨架屏 + Toast
4. 后端参数校验 + 统一异常处理
5. 后端单元测试起步

### Week 3-6：Phase 2 核心项
1. 预算管理完整闭环
2. 数据导入导出
3. 语音输入 (Web Speech API)
4. 定期记账模板
5. 日历视图

### Week 7-10：Phase 1 收尾 + Phase 3 启动
1. 多账本支持
2. Docker 容器化
3. AI Chat 助手
4. 资产账户 + 净值跟踪

### 持续进行
- 技术债务偿还
- 测试覆盖提升
- 性能优化

---

## 快速开始（如果今天开始做）

```
Week 1 推荐工作包：
├── 第 1-2 天：引入 React Router + Zustand
│   ├── npm install react-router-dom zustand
│   ├── 创建 stores/ (authStore, recordStore)
│   └── 重构 App.jsx → Layout + Routes
├── 第 3-4 天：TypeScript 迁移
│   ├── npm install typescript @types/react @types/react-dom
│   ├── 配置 tsconfig.json
│   └── 定义类型文件 → 迁移核心文件
├── 第 5 天：环境变量 + 代理配置
└── 第 6-7 天：后端单元测试
```

---

## 详细文档索引

| 文档 | 内容 |
|------|------|
| [01-architecture-overview.md](./01-architecture-overview.md) | 技术栈详情与架构分析 |
| [02-phase1-polish.md](./02-phase1-polish.md) | Phase 1：基础加固与体验优化 |
| [03-phase2-features.md](./03-phase2-features.md) | Phase 2：核心功能增强 |
| [04-phase3-advanced.md](./04-phase3-advanced.md) | Phase 3：进阶功能与智能化 |
| [05-tech-debt.md](./05-tech-debt.md) | 技术债务与架构优化 |
