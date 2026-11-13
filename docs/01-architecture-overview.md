# 项目架构与技术栈总览

## 项目概览

**记账助手 Pro (MoneyNote)** — 一个全栈 AI 记账应用，支持语音/文字语义记账、数据可视化统计、回收站机制等。

---

## 技术栈详情

### 后端 (Root)

| 技术 | 版本 | 用途 |
|------|------|------|
| Java | 17 | 开发语言 |
| Spring Boot | 4.0.1 | 应用框架 |
| Spring Data JPA | - | ORM / 数据持久化 |
| Spring Security | - | 认证授权 (BCrypt + JWT) |
| jjwt | 0.12.3 | JWT Token 签发与验证 |
| MySQL | - | 生产数据库 (money_note) |
| H2 | - | 开发/测试内嵌数据库 |
| Maven | - | 构建工具 |
| fastjson2 | 2.0.43 | JSON 解析 (AI 模块) |

**项目结构：**
```
src/main/java/com/example/moneynote/
├── config/          # WebConfig, SecurityConfig, GlobalExceptionHandler
├── controller/      # User, Category, Record, Statistics, AI
├── dto/             # LoginRequest, RegisterRequest, AuthResponse, ApiResponse
├── entity/          # User, Category, Record
├── filter/          # JwtAuthenticationFilter
├── repository/      # JPA Repository 接口
├── service/         # UserService, CategoryService, RecordService, StatisticsService
└── util/            # JwtUtil
```

### 前端 (frontend/)

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 19.2 | UI 框架 |
| Vite | 7.2 | 构建工具 (SWC 编译) |
| Tailwind CSS | 4.1 | 原子化 CSS (via Vite plugin) |
| ECharts | 6.0 | 数据可视化图表 |
| Font Awesome | 6.4 (CDN) | 图标库 |
| lucide-react | 0.563 | React 图标组件 |
| canvas-confetti | 1.9 | 撒花/金币动效 |

**项目结构：**
```
frontend/src/
├── App.jsx          # 主组件 (状态路由)
├── App.css          # 全局样式
├── index.css        # Tailwind + CSS 变量 + 主题
├── main.jsx         # 入口
├── pages/           # 页面组件
│   ├── Auth.jsx     # 登录/注册
│   ├── Home.jsx     # 首页明细 + AI 快记
│   ├── RecordForm.jsx   # 记账表单
│   ├── EditRecord.jsx   # 编辑记录
│   ├── Statistics.jsx   # 统计图表
│   ├── Discover.jsx     # 发现/成就
│   └── RecycleBin.jsx   # 回收站
├── services/        # API 服务
│   ├── api.js       # 封装 fetch (超时/错误/401)
│   └── auth.js      # Token & 用户信息管理
└── utils/
    └── format.js    # 日期/金额格式化
```

---

## 当前架构模式

### 前端
- **状态路由**：App.jsx 中通过 `currentPage` state 控制页面切换，无 React Router
- **认证**：JWT Token 存 localStorage，api.js 拦截器自动附加
- **API 通信**：自定义 `apiFetch` 封装 (10s 超时、401 自动跳转登录、错误统一处理)
- **状态管理**：纯 React useState + useEffect，无 Redux/Zustand

### 后端
- **分层架构**：Controller → Service → Repository → Entity
- **认证流程**：JwtAuthenticationFilter 拦截请求 → 解析 Token → 设置 SecurityContext
- **软删除**：Record 实体有 `deleted` 字段，查询时自动过滤
- **AI 集成**：AiController 调用阿里云百炼 Qwen API，解析自然语言为记账结构化数据

### 数据流
```
用户输入 → React 页面 → apiFetch → HTTP → Controller → Service → JPA Repository → MySQL
                                                                                ↓
AI 记账: 口语文本 → AiController → 阿里云百炼 API → 结构化数据 → RecordService → DB
```

---

## 当前瓶颈分析

1. **前端无路由系统**：`currentPage` switch-case 方式难以扩展，丧失浏览器前进/后退
2. **无 TypeScript**：随着代码增长，类型错误难以及时发现
3. **状态管理原始**：组件间共享状态靠 props 层层传递，页面间通信困难
4. **API 地址硬编码**：`http://localhost:8080` 写死在 api.js 中
5. **前端测试缺失**：无单元测试/组件测试/E2E 测试
6. **AI 功能单一**：仅支持自然语言 → 结构化，无个性化推荐/异常检测
7. **部署未容器化**：无 Dockerfile / docker-compose
