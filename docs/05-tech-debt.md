# 技术债务与架构优化

> **目标**：识别当前项目的技术债务，分阶段偿还，保证项目长期可维护性。

---

## 5.1 测试体系建设

| 优先级 | 任务 | 说明 |
|--------|------|------|
| P0 | 后端单元测试 | Service 层测试 (JUnit 5 + Mockito) |
| P1 | 后端集成测试 | Controller 层测试 (@WebMvcTest + @DataJpaTest) |
| P1 | 前端组件测试 | Vitest + React Testing Library 核心组件测试 |
| P2 | E2E 测试 | Playwright 关键用户流程 (登录→记账→统计→回收站) |
| P2 | CI 集成 | GitHub Actions push 自动运行测试 |

**当前状态**：仅有 `MoneyNoteApplicationTests.java` 空测试类，前端无任何测试。

---

## 5.2 容器化与部署

| 优先级 | 任务 | 说明 |
|--------|------|------|
| P1 | Dockerfile (后端) | 多阶段构建 Spring Boot 镜像 |
| P1 | Dockerfile (前端) | Nginx 静态文件服务 |
| P1 | docker-compose.yml | 一键启动 前端 + 后端 + MySQL |
| P2 | nginx 配置 | 反向代理、Gzip、静态缓存 |

```yaml
# docker-compose.yml 示意
services:
  mysql:
    image: mysql:8.0
    environment: ...
  backend:
    build: .
    depends_on: [mysql]
  frontend:
    build: ./frontend
    ports: ["80:80"]
    depends_on: [backend]
```

---

## 5.3 安全性增强

| 优先级 | 任务 | 说明 |
|--------|------|------|
| P1 | Token 刷新机制 | 添加 refresh token，减少频繁登录 |
| P1 | 密码强度校验 | 注册时前端 + 后端双重校验密码强度 |
| P1 | XSS 防护 | 前端输出编码，后端 Content-Security-Policy 头 |
| P2 | Rate Limiting | API 限流防刷 (Bucket4j 或 Spring 拦截器) |
| P2 | SQL 注入防护 | 确认所有查询使用参数绑定 (JPA 默认安全，确认原生查询) |
| P2 | HTTPS | 生产环境强制 HTTPS |

---

## 5.4 性能优化

### 后端
| 任务 | 说明 |
|------|------|
| 数据库索引优化 | 根据慢查询日志补充复合索引 |
| 查询缓存 | Spring Cache + Caffeine 热点数据缓存 |
| 懒加载配置 | JPA `@ManyToOne` 确认懒加载，避免 N+1 问题 |
| 分页查询 | 记录列表、回收站列表增加分页参数 |

### 前端
| 任务 | 说明 |
|------|------|
| 组件懒加载 | React.lazy + Suspense |
| ECharts 按需引入 | 仅引入使用的图表类型，减小打包体积 |
| 图片优化 | 头像等图片添加懒加载 `loading="lazy"` |
| Bundle 分析 | 使用 `rollup-plugin-visualizer` 分析打包体积 |

---

## 5.5 代码质量

| 任务 | 说明 |
|------|------|
| 后端代码规范 | Checkstyle / SpotBugs 集成 |
| 统一 DTO 层 | 新增 `RecordDTO`, `CategoryDTO` 避免 Entity 直接暴露 |
| 常量定义 | 硬编码字符串提取为常量/枚举 (如记录类型 `expense`/`income`) |
| 自定义异常 | 用 `ResourceNotFoundException`, `UnauthorizedException` 替代 `RuntimeException` |
| Git Hooks | husky + lint-staged 提交前格式化 + lint |

---

## 5.6 监控与运维

| 优先级 | 任务 | 说明 |
|--------|------|------|
| P2 | Actuator 端点 | Spring Boot Actuator 健康检查 / 指标 |
| P2 | 日志集中化 | 日志文件滚动策略 + 错误告警 |
| P2 | 前端错误监控 | Sentry 或自建错误上报 |
| P3 | APM 追踪 | SkyWalking 或 Prometheus + Grafana |

---

## 技术债务偿还路线图

| 阶段 | 任务 | 预计工时 |
|------|------|----------|
| 短期 | 后端单元测试 (Service) | 2 天 |
| 短期 | 统一 DTO + 自定义异常 | 1 天 |
| 中期 | Docker 容器化 | 2 天 |
| 中期 | 前端测试 + CI 集成 | 3 天 |
| 中期 | 安全增强 (Refresh Token + Rate Limit) | 2 天 |
| 长期 | 性能优化 | 3 天 |
| 长期 | 监控体系 | 2 天 |
