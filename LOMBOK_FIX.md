# Lombok 编译错误修复指南

## 问题
编译时找不到 getter/setter 方法，这是因为 Lombok 注解处理器没有正确工作。

## 解决方案

### 方案1：清理并重新编译（推荐）

在项目根目录执行：

```bash
# 清理项目
mvn clean

# 重新编译
mvn compile

# 或者直接运行
mvn clean install
```

### 方案2：确保 IDE 支持 Lombok

**IntelliJ IDEA:**
1. 安装 Lombok 插件：`File` → `Settings` → `Plugins` → 搜索 "Lombok" → 安装
2. 启用注解处理：`File` → `Settings` → `Build, Execution, Deployment` → `Compiler` → `Annotation Processors` → 勾选 "Enable annotation processing"
3. 重启 IDE

**Eclipse:**
1. 下载 lombok.jar
2. 运行：`java -jar lombok.jar`
3. 选择 Eclipse 安装目录
4. 重启 Eclipse

**VS Code:**
1. 安装 "Language Support for Java" 扩展
2. 安装 "Lombok Annotations Support" 扩展

### 方案3：验证 Lombok 配置

确保 `pom.xml` 中：
1. ✅ Lombok 依赖存在
2. ✅ Maven 编译器插件配置了注解处理器路径
3. ✅ Java 版本正确（17）

### 方案4：如果以上都不行

可以手动添加 getter/setter 方法，但这会很繁琐。建议先尝试方案1和方案2。

## 验证修复

编译成功后，应该不再有 "找不到符号" 的错误。
