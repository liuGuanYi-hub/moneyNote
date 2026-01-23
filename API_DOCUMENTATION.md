# 记账助手 Pro - API 文档

## 基础信息

- 基础URL: `http://localhost:8080/api`
- 认证方式: Bearer Token (JWT)
- 请求头: `Authorization: Bearer <token>`

## 一、用户与账户模块

### 1. 用户注册
**POST** `/users/register`

请求体:
```json
{
  "username": "testuser",
  "password": "123456",
  "email": "test@example.com",
  "nickname": "测试用户"
}
```

响应:
```json
{
  "success": true,
  "message": "注册成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com",
      "nickname": "测试用户",
      "avatar": "https://i.pravatar.cc/150?img=..."
    }
  }
}
```

### 2. 用户登录
**POST** `/users/login`

请求体:
```json
{
  "username": "testuser",
  "password": "123456"
}
```

响应: 同注册接口

### 3. 获取当前用户信息
**GET** `/users/me`

请求头: `Authorization: Bearer <token>`

响应:
```json
{
  "success": true,
  "message": "操作成功",
  "data": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "nickname": "测试用户",
    "avatar": "https://..."
  }
}
```

### 4. 更新用户信息
**PUT** `/users/me?nickname=新昵称&avatar=https://...`

请求头: `Authorization: Bearer <token>`

## 二、分类管理模块

### 1. 获取所有分类
**GET** `/categories?type=expense` (可选参数: expense/income)

响应:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "餐饮",
      "icon": "fa-utensils",
      "type": "expense",
      "userId": null,
      "sortOrder": 1,
      "useCount": 0
    }
  ]
}
```

### 2. 获取用户分类（包含自定义分类）
**GET** `/categories/user/{userId}?type=expense`

## 三、记账记录模块

### 1. 创建记账记录
**POST** `/records`

请求头: `Authorization: Bearer <token>`

请求体:
```json
{
  "categoryId": 1,
  "amount": 36.50,
  "type": "expense",
  "remark": "瑞幸生椰拿铁",
  "recordDate": "2024-03-22"
}
```

### 2. 获取记账记录列表
**GET** `/records?type=expense&categoryId=1&startDate=2024-03-01&endDate=2024-03-31&keyword=咖啡`

参数说明:
- `type`: expense/income (可选)
- `categoryId`: 分类ID (可选)
- `startDate`: 开始日期 (可选)
- `endDate`: 结束日期 (可选)
- `keyword`: 搜索关键词 (可选)

### 3. 获取单条记录
**GET** `/records/{id}`

### 4. 更新记录
**PUT** `/records/{id}`

请求体:
```json
{
  "categoryId": 1,
  "amount": 40.00,
  "remark": "更新后的备注",
  "recordDate": "2024-03-22"
}
```

### 5. 删除记录
**DELETE** `/records/{id}`

## 四、统计图表模块

### 1. 月度收支概览
**GET** `/statistics/monthly-overview?year=2024&month=3`

请求头: `Authorization: Bearer <token>`

响应:
```json
{
  "success": true,
  "data": {
    "totalIncome": 8000.00,
    "totalExpense": 3580.50,
    "balance": 4419.50,
    "lastMonthIncome": 7500.00,
    "lastMonthExpense": 3200.00,
    "incomeChange": 500.00,
    "expenseChange": 380.50
  }
}
```

### 2. 消费趋势图表
**GET** `/statistics/expense-trend?days=30`

响应:
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-03-01",
      "dateLabel": "3月1日",
      "amount": 120.50
    }
  ]
}
```

### 3. 分类占比图表
**GET** `/statistics/category-distribution?year=2024&month=3`

响应:
```json
{
  "success": true,
  "data": [
    {
      "categoryId": 1,
      "amount": 1253.18,
      "percentage": 35.00
    }
  ]
}
```

### 4. 收支对比图表
**GET** `/statistics/income-expense-comparison?months=6`

响应:
```json
{
  "success": true,
  "data": [
    {
      "year": 2024,
      "month": 3,
      "monthLabel": "2024年3月",
      "income": 8000.00,
      "expense": 3580.50
    }
  ]
}
```

## 错误响应格式

```json
{
  "success": false,
  "message": "错误信息",
  "data": null
}
```

## 系统默认分类

### 支出分类
- 餐饮 (fa-utensils)
- 交通 (fa-bus)
- 购物 (fa-shopping-bag)
- 居住 (fa-home)
- 娱乐 (fa-gamepad)
- 学习 (fa-book)
- 医疗 (fa-heartbeat)
- 生活日用 (fa-shopping-cart)
- 其他支出 (fa-ellipsis-h)

### 收入分类
- 工资 (fa-coins)
- 兼职 (fa-hand-holding-usd)
- 生活费 (fa-money-bill-wave)
- 奖学金 (fa-graduation-cap)
- 投资 (fa-chart-line)
- 其他收入 (fa-gift)
