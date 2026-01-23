# 记账助手 Pro - 后端项目说明

## 项目概述

这是一个基于Spring Boot的记账应用后端系统，实现了完整的用户管理、分类管理、记账记录和统计图表功能。

## 技术栈

- **Spring Boot 4.0.1**
- **Spring Data JPA** - 数据持久化
- **Spring Security** - 安全认证
- **H2 Database** - 内存数据库（开发环境）
- **JWT (JSON Web Token)** - 用户认证
- **Lombok** - 简化代码
- **BCrypt** - 密码加密

## 项目结构

```
src/main/java/com/example/moneynote/
├── entity/          # 实体类
│   ├── User.java
│   ├── Category.java
│   └── Record.java
├── repository/      # 数据访问层
│   ├── UserRepository.java
│   ├── CategoryRepository.java
│   └── RecordRepository.java
├── service/         # 业务逻辑层
│   ├── UserService.java
│   ├── CategoryService.java
│   ├── RecordService.java
│   └── StatisticsService.java
├── controller/      # 控制器层
│   ├── UserController.java
│   ├── CategoryController.java
│   ├── RecordController.java
│   └── StatisticsController.java
├── dto/             # 数据传输对象
│   ├── RegisterRequest.java
│   ├── LoginRequest.java
│   ├── AuthResponse.java
│   └── ApiResponse.java
├── util/            # 工具类
│   └── JwtUtil.java
└── config/          # 配置类
    ├── SecurityConfig.java
    ├── WebConfig.java
    └── GlobalExceptionHandler.java
```

## 功能模块

### 1. 用户与账户模块
- ✅ 用户注册（用户名、密码、邮箱验证）
- ✅ 用户登录（JWT Token生成）
- ✅ 密码加密存储（BCrypt）
- ✅ 用户信息查看和更新
- ✅ 记住登录状态（Token）

### 2. 分类管理模块
- ✅ 系统默认分类初始化
- ✅ 分类展示（按类型筛选）
- ✅ 分类使用频率统计
- ✅ 用户自定义分类支持

### 3. 记账记录模块
- ✅ 创建记账记录
- ✅ 查询记录（按类型、分类、日期、关键词）
- ✅ 更新记录
- ✅ 删除记录
- ✅ 记录详情查看

### 4. 统计图表模块
- ✅ 月度收支概览（含上月对比）
- ✅ 消费趋势图表（最近N天）
- ✅ 分类占比图表
- ✅ 收支对比图表（多月份）

## 运行项目

### 前置要求
- JDK 17+
- Maven 3.6+

### 启动步骤

1. **编译项目**
```bash
mvn clean compile
```

2. **运行项目**
```bash
mvn spring-boot:run
```

或者使用IDE直接运行 `MoneyNoteApplication.java`

3. **访问应用**
- API地址: `http://localhost:8080/api`
- H2控制台: `http://localhost:8080/h2-console`
  - JDBC URL: `jdbc:h2:mem:moneynote`
  - 用户名: `sa`
  - 密码: (空)

## API使用说明

详细API文档请参考 `API_DOCUMENTATION.md`

### 快速测试

1. **注册用户**
```bash
curl -X POST http://localhost:8080/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "123456",
    "email": "test@example.com",
    "nickname": "测试用户"
  }'
```

2. **登录获取Token**
```bash
curl -X POST http://localhost:8080/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "123456"
  }'
```

3. **使用Token访问API**
```bash
curl -X GET http://localhost:8080/api/users/me \
  -H "Authorization: Bearer <your-token>"
```

## 数据库配置

项目使用H2内存数据库，数据在应用重启后会清空。如需持久化存储，可以修改 `application.properties` 配置MySQL或其他数据库。

### 切换到MySQL示例

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/money_note
spring.datasource.username=root
spring.datasource.password=yourpassword
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect
```

## 安全说明

- 密码使用BCrypt加密存储
- JWT Token有效期：24小时（可在application.properties中配置）
- 跨域已配置为允许所有来源（生产环境建议限制）

## 注意事项

1. 系统默认分类会在应用启动时自动初始化
2. Token需要在请求头中携带：`Authorization: Bearer <token>`
3. 所有需要认证的接口都需要有效的Token
4. 日期格式：`yyyy-MM-dd` (ISO格式)

## 开发建议

1. 前端调用API时，需要将Token存储在localStorage或sessionStorage中
2. 每次请求时在请求头中携带Token
3. Token过期后需要重新登录获取新Token
4. 建议使用axios或fetch等HTTP客户端库
