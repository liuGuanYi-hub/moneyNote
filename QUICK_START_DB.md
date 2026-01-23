# 数据库快速建表指南

## 🚀 方式一：JPA自动建表（最简单，推荐开发环境）

**当前项目已配置为自动建表模式，直接启动即可！**

```bash
mvn spring-boot:run
```

启动后，JPA会自动创建以下表：
- `users` - 用户表
- `categories` - 分类表  
- `records` - 记账记录表

**配置位置：** `application.properties`
```properties
spring.jpa.hibernate.ddl-auto=update  # 自动创建/更新表结构
```

---

## 📝 方式二：手动执行SQL建表（推荐生产环境）

### 步骤1：创建数据库

**MySQL:**
```sql
CREATE DATABASE money_note 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;
```

**PostgreSQL:**
```sql
CREATE DATABASE moneynote 
WITH ENCODING 'UTF8';
```

### 步骤2：执行建表脚本

**MySQL:**
```bash
mysql -u root -p money_note < src/main/resources/db/schema.sql
```

**PostgreSQL:**
```bash
psql -U postgres -d money_note -f src/main/resources/db/schema.sql
```

### 步骤3：初始化默认分类（可选）

```bash
mysql -u root -p money_note < src/main/resources/db/data.sql
```

### 步骤4：修改配置为验证模式

修改 `application.properties`:
```properties
spring.jpa.hibernate.ddl-auto=validate  # 只验证，不自动创建
```

---

## 🔄 切换到MySQL数据库

### 1. 添加MySQL依赖

在 `pom.xml` 的 `<dependencies>` 中添加：

```xml
<!-- MySQL 驱动 -->
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>
```

### 2. 修改配置文件

将 `application.properties` 修改为：

```properties
# MySQL 配置
spring.datasource.url=jdbc:mysql://localhost:3306/money_note?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai
spring.datasource.username=root
spring.datasource.password=your_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect
```

或者直接使用配置文件：
```bash
# 启动时指定配置文件
mvn spring-boot:run -Dspring-boot.run.arguments=--spring.profiles.active=mysql
```

### 3. 创建数据库并执行SQL

```sql
CREATE DATABASE money_note CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

然后执行 `schema.sql` 和 `data.sql`

---

## 📊 数据库表结构概览

### users 表
- 存储用户基本信息
- 主键：id
- 唯一约束：username, email

### categories 表  
- 存储分类信息（系统默认 + 用户自定义）
- 主键：id
- user_id 为 NULL 表示系统默认分类

### records 表
- 存储记账记录
- 主键：id
- 外键：user_id → users(id), category_id → categories(id)

---

## ✅ 验证数据库是否创建成功

### H2数据库（当前默认）
访问：http://localhost:8080/h2-console
- JDBC URL: `jdbc:h2:mem:moneynote`
- 用户名: `sa`
- 密码: (空)

### MySQL数据库
```sql
USE money_note;
SHOW TABLES;
-- 应该看到: users, categories, records
```

---

## 🎯 推荐方案

| 环境 | 推荐方式 | 说明 |
|------|---------|------|
| **开发/测试** | JPA自动建表 | 简单快速，无需手动操作 |
| **生产环境** | 手动SQL建表 | 更精确控制，便于维护 |

---

## 📚 详细文档

更多详细信息请参考：`DATABASE_SETUP.md`
