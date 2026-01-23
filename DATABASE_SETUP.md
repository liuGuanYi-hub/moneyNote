# 数据库建表说明

## 一、建表方式

项目支持两种建表方式：

### 方式1：JPA 自动建表（推荐开发环境）

**优点：**
- 无需手动执行SQL
- 自动根据实体类创建表结构
- 适合快速开发和测试

**配置：**
```properties
spring.jpa.hibernate.ddl-auto=update
```

**说明：**
- `update`: 启动时自动创建或更新表结构（如果表不存在则创建，存在则更新）
- `create`: 每次启动都删除并重新创建表（会丢失数据）
- `create-drop`: 启动时创建，关闭时删除
- `validate`: 只验证表结构，不创建或修改
- `none`: 不做任何操作

**当前配置：** 项目已配置为 `update` 模式，启动时会自动建表。

### 方式2：手动执行SQL建表（推荐生产环境）

**优点：**
- 更精确控制表结构
- 可以设置索引、外键等
- 适合生产环境部署

**步骤：**

1. **创建数据库**
```sql
CREATE DATABASE IF NOT EXISTS money_note 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;
```

2. **执行建表脚本**
```bash
# 方式A: 使用MySQL命令行
mysql -u root -p money_note < src/main/resources/db/schema.sql

# 方式B: 使用MySQL客户端工具（如Navicat、DBeaver等）
# 直接执行 schema.sql 文件内容
```

3. **初始化默认数据（可选）**
```bash
mysql -u root -p money_note < src/main/resources/db/data.sql
```

4. **修改配置为 validate 模式**
```properties
spring.jpa.hibernate.ddl-auto=validate
```

## 二、数据库表结构

### 1. users 表（用户表）

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | BIGINT | 用户ID | 主键，自增 |
| username | VARCHAR(50) | 用户名 | 唯一，非空 |
| password | VARCHAR(255) | 加密密码 | 非空 |
| email | VARCHAR(100) | 邮箱 | 唯一，非空 |
| nickname | VARCHAR(50) | 昵称 | 可空 |
| avatar | VARCHAR(500) | 头像URL | 可空 |
| created_at | DATETIME | 创建时间 | 自动设置 |
| updated_at | DATETIME | 更新时间 | 自动更新 |

**索引：**
- `idx_username` - 用户名索引
- `idx_email` - 邮箱索引

### 2. categories 表（分类表）

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | BIGINT | 分类ID | 主键，自增 |
| name | VARCHAR(50) | 分类名称 | 非空 |
| icon | VARCHAR(50) | 图标类名 | 非空 |
| type | VARCHAR(20) | 类型 | 非空（expense/income） |
| user_id | BIGINT | 用户ID | 可空（NULL=系统默认） |
| sort_order | INT | 排序顺序 | 默认0 |
| use_count | INT | 使用次数 | 默认0 |
| created_at | DATETIME | 创建时间 | 自动设置 |

**索引：**
- `idx_type_user` - 类型和用户ID联合索引
- `idx_user_id` - 用户ID索引
- `idx_use_count` - 使用次数索引

### 3. records 表（记账记录表）

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | BIGINT | 记录ID | 主键，自增 |
| user_id | BIGINT | 用户ID | 非空，外键 |
| category_id | BIGINT | 分类ID | 非空，外键 |
| amount | DECIMAL(10,2) | 金额 | 非空 |
| type | VARCHAR(20) | 类型 | 非空（expense/income） |
| remark | VARCHAR(500) | 备注 | 可空 |
| record_date | DATE | 记账日期 | 非空 |
| created_at | DATETIME | 创建时间 | 自动设置 |
| updated_at | DATETIME | 更新时间 | 自动更新 |

**索引：**
- `idx_user_id` - 用户ID索引
- `idx_category_id` - 分类ID索引
- `idx_type` - 类型索引
- `idx_record_date` - 日期索引
- `idx_user_type_date` - 用户、类型、日期联合索引

**外键：**
- `user_id` → `users(id)` ON DELETE CASCADE
- `category_id` → `categories(id)` ON DELETE RESTRICT

## 三、切换数据库

### 从 H2 切换到 MySQL

1. **添加 MySQL 依赖到 pom.xml**
```xml
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>
```

2. **修改 application.properties**
```properties
# 使用 MySQL 配置
spring.datasource.url=jdbc:mysql://localhost:3306/money_note?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai
spring.datasource.username=root
spring.datasource.password=your_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect
```

3. **创建数据库并执行建表脚本**
```sql
CREATE DATABASE money_note CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 从 H2 切换到 PostgreSQL

1. **添加 PostgreSQL 依赖**
```xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
```

2. **修改配置**
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/money_note
spring.datasource.username=postgres
spring.datasource.password=your_password
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
```

## 四、初始化数据

### 系统默认分类

系统会在启动时自动初始化以下分类：

**支出分类（9个）：**
- 餐饮 (fa-utensils)
- 交通 (fa-bus)
- 购物 (fa-shopping-bag)
- 居住 (fa-home)
- 娱乐 (fa-gamepad)
- 学习 (fa-book)
- 医疗 (fa-heartbeat)
- 生活日用 (fa-shopping-cart)
- 其他支出 (fa-ellipsis-h)

**收入分类（6个）：**
- 工资 (fa-coins)
- 兼职 (fa-hand-holding-usd)
- 生活费 (fa-money-bill-wave)
- 奖学金 (fa-graduation-cap)
- 投资 (fa-chart-line)
- 其他收入 (fa-gift)

**注意：** 如果使用手动建表，可以执行 `data.sql` 脚本初始化分类数据，或者依赖 `CategoryService` 的 `@PostConstruct` 方法自动初始化。

## 五、数据库维护建议

### 1. 备份策略
```bash
# MySQL 备份
mysqldump -u root -p money_note > backup_$(date +%Y%m%d).sql

# 恢复
mysql -u root -p money_note < backup_20240322.sql
```

### 2. 性能优化
- 定期清理过期数据（可选）
- 对常用查询字段建立索引（已包含）
- 考虑分表策略（如果数据量很大）

### 3. 数据迁移
如果从 H2 迁移到 MySQL：
1. 导出 H2 数据
2. 转换数据格式（如需要）
3. 导入到 MySQL

## 六、常见问题

### Q1: 启动时报表已存在错误？
**A:** 将 `ddl-auto` 改为 `update` 或 `validate`

### Q2: 如何重置数据库？
**A:** 
- H2: 重启应用即可（内存数据库）
- MySQL: 删除数据库重新创建，或使用 `ddl-auto=create-drop`

### Q3: 外键约束错误？
**A:** 确保先创建 `users` 和 `categories` 表，再创建 `records` 表

### Q4: 字符编码问题？
**A:** 确保数据库和表都使用 `utf8mb4` 字符集
