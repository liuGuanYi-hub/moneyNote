-- ============================================
-- 记账助手 Pro - 简化版测试数据脚本
-- ============================================
-- 注意：执行此脚本前，请确保表已经创建且分类数据已初始化
-- 使用方法：在MySQL客户端中执行此脚本

-- ============================================
-- 1. 插入测试用户（如果不存在）
-- ============================================
-- 密码都是 123456（BCrypt加密后的值）
INSERT IGNORE INTO users (username, password, email, nickname, avatar, created_at, updated_at) VALUES
('testuser', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwy8pK0O', 'test@example.com', '测试用户', 'https://i.pravatar.cc/150?img=12', NOW(), NOW()),
('zhangsan', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwy8pK0O', 'zhangsan@example.com', '张三', 'https://i.pravatar.cc/150?img=33', NOW(), NOW()),
('lisi', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwy8pK0O', 'lisi@example.com', '李四', 'https://i.pravatar.cc/150?img=45', NOW(), NOW());

-- ============================================
-- 2. 设置分类ID变量（根据实际分类ID调整）
-- ============================================
SET @cat_food = (SELECT id FROM categories WHERE name = '餐饮' AND type = 'expense' AND user_id IS NULL LIMIT 1);
SET @cat_transport = (SELECT id FROM categories WHERE name = '交通' AND type = 'expense' AND user_id IS NULL LIMIT 1);
SET @cat_shopping = (SELECT id FROM categories WHERE name = '购物' AND type = 'expense' AND user_id IS NULL LIMIT 1);
SET @cat_entertainment = (SELECT id FROM categories WHERE name = '娱乐' AND type = 'expense' AND user_id IS NULL LIMIT 1);
SET @cat_study = (SELECT id FROM categories WHERE name = '学习' AND type = 'expense' AND user_id IS NULL LIMIT 1);
SET @cat_salary = (SELECT id FROM categories WHERE name = '工资' AND type = 'income' AND user_id IS NULL LIMIT 1);
SET @cat_parttime = (SELECT id FROM categories WHERE name = '兼职' AND type = 'income' AND user_id IS NULL LIMIT 1);
SET @cat_allowance = (SELECT id FROM categories WHERE name = '生活费' AND type = 'income' AND user_id IS NULL LIMIT 1);

-- ============================================
-- 3. 更新分类使用次数
-- ============================================
UPDATE categories SET use_count = 15 WHERE name = '餐饮' AND type = 'expense' AND user_id IS NULL;
UPDATE categories SET use_count = 8 WHERE name = '交通' AND type = 'expense' AND user_id IS NULL;
UPDATE categories SET use_count = 12 WHERE name = '购物' AND type = 'expense' AND user_id IS NULL;
UPDATE categories SET use_count = 5 WHERE name = '娱乐' AND type = 'expense' AND user_id IS NULL;
UPDATE categories SET use_count = 3 WHERE name = '学习' AND type = 'expense' AND user_id IS NULL;
UPDATE categories SET use_count = 10 WHERE name = '工资' AND type = 'income' AND user_id IS NULL;
UPDATE categories SET use_count = 5 WHERE name = '兼职' AND type = 'income' AND user_id IS NULL;

-- ============================================
-- 4. 插入记账记录（用户ID=1，testuser）
-- ============================================
-- 2024年3月的记录
INSERT INTO records (user_id, category_id, amount, type, remark, record_date, created_at, updated_at) VALUES
-- 支出记录
(1, @cat_food, 45.50, 'expense', '早餐：包子+豆浆', '2024-03-01', NOW(), NOW()),
(1, @cat_food, 68.00, 'expense', '午餐：公司食堂', '2024-03-01', NOW(), NOW()),
(1, @cat_transport, 12.00, 'expense', '地铁出行', '2024-03-01', NOW(), NOW()),
(1, @cat_food, 88.00, 'expense', '晚餐：火锅', '2024-03-01', NOW(), NOW()),

(1, @cat_food, 36.00, 'expense', '瑞幸生椰拿铁', '2024-03-02', NOW(), NOW()),
(1, @cat_shopping, 299.00, 'expense', '购买T恤', '2024-03-02', NOW(), NOW()),
(1, @cat_entertainment, 128.00, 'expense', '看电影', '2024-03-02', NOW(), NOW()),

(1, @cat_food, 52.00, 'expense', '午餐：麻辣烫', '2024-03-03', NOW(), NOW()),
(1, @cat_transport, 25.00, 'expense', '打车费用', '2024-03-03', NOW(), NOW()),
(1, @cat_study, 89.00, 'expense', '购买编程书籍', '2024-03-03', NOW(), NOW()),

(1, @cat_food, 28.00, 'expense', '早餐', '2024-03-04', NOW(), NOW()),
(1, @cat_shopping, 199.00, 'expense', '购买日用品', '2024-03-04', NOW(), NOW()),
(1, @cat_transport, 15.00, 'expense', '公交卡充值', '2024-03-04', NOW(), NOW()),

(1, @cat_food, 65.00, 'expense', '午餐', '2024-03-05', NOW(), NOW()),
(1, @cat_entertainment, 88.00, 'expense', 'KTV唱歌', '2024-03-05', NOW(), NOW()),

-- 收入记录
(1, @cat_salary, 8000.00, 'income', '3月工资', '2024-03-01', NOW(), NOW()),
(1, @cat_parttime, 500.00, 'income', '周末兼职', '2024-03-10', NOW(), NOW()),
(1, @cat_parttime, 300.00, 'income', '线上兼职', '2024-03-20', NOW(), NOW()),

-- 2024年2月的记录（用于对比）
(1, @cat_food, 1200.00, 'expense', '2月餐饮总支出', '2024-02-15', NOW(), NOW()),
(1, @cat_transport, 350.00, 'expense', '2月交通总支出', '2024-02-15', NOW(), NOW()),
(1, @cat_shopping, 800.00, 'expense', '2月购物总支出', '2024-02-15', NOW(), NOW()),
(1, @cat_salary, 7500.00, 'income', '2月工资', '2024-02-01', NOW(), NOW()),

-- 2024年1月的记录
(1, @cat_food, 1100.00, 'expense', '1月餐饮总支出', '2024-01-15', NOW(), NOW()),
(1, @cat_transport, 320.00, 'expense', '1月交通总支出', '2024-01-15', NOW(), NOW()),
(1, @cat_salary, 7500.00, 'income', '1月工资', '2024-01-01', NOW(), NOW()),

-- 最近几天的记录（用于趋势图）
(1, @cat_food, 45.00, 'expense', '早餐', DATE_SUB(CURDATE(), INTERVAL 5 DAY), NOW(), NOW()),
(1, @cat_food, 68.00, 'expense', '午餐', DATE_SUB(CURDATE(), INTERVAL 5 DAY), NOW(), NOW()),
(1, @cat_transport, 12.00, 'expense', '地铁', DATE_SUB(CURDATE(), INTERVAL 5 DAY), NOW(), NOW()),

(1, @cat_food, 52.00, 'expense', '午餐', DATE_SUB(CURDATE(), INTERVAL 4 DAY), NOW(), NOW()),
(1, @cat_shopping, 199.00, 'expense', '购物', DATE_SUB(CURDATE(), INTERVAL 4 DAY), NOW(), NOW()),

(1, @cat_food, 88.00, 'expense', '晚餐', DATE_SUB(CURDATE(), INTERVAL 3 DAY), NOW(), NOW()),
(1, @cat_entertainment, 128.00, 'expense', '娱乐', DATE_SUB(CURDATE(), INTERVAL 3 DAY), NOW(), NOW()),

(1, @cat_food, 36.00, 'expense', '咖啡', DATE_SUB(CURDATE(), INTERVAL 2 DAY), NOW(), NOW()),
(1, @cat_food, 65.00, 'expense', '午餐', DATE_SUB(CURDATE(), INTERVAL 2 DAY), NOW(), NOW()),

(1, @cat_food, 45.00, 'expense', '早餐', DATE_SUB(CURDATE(), INTERVAL 1 DAY), NOW(), NOW()),
(1, @cat_food, 68.00, 'expense', '午餐', DATE_SUB(CURDATE(), INTERVAL 1 DAY), NOW(), NOW()),
(1, @cat_transport, 15.00, 'expense', '打车', DATE_SUB(CURDATE(), INTERVAL 1 DAY), NOW(), NOW()),

(1, @cat_food, 28.00, 'expense', '早餐', CURDATE(), NOW(), NOW()),
(1, @cat_food, 52.00, 'expense', '午餐', CURDATE(), NOW(), NOW());

-- ============================================
-- 5. 插入用户2（zhangsan）的部分记录
-- ============================================
INSERT INTO records (user_id, category_id, amount, type, remark, record_date, created_at, updated_at) VALUES
(2, @cat_food, 35.00, 'expense', '早餐', '2024-03-01', NOW(), NOW()),
(2, @cat_food, 55.00, 'expense', '午餐', '2024-03-01', NOW(), NOW()),
(2, @cat_transport, 10.00, 'expense', '地铁', '2024-03-01', NOW(), NOW()),
(2, @cat_salary, 6000.00, 'income', '3月工资', '2024-03-01', NOW(), NOW());

-- ============================================
-- 6. 插入用户3（lisi）的部分记录
-- ============================================
INSERT INTO records (user_id, category_id, amount, type, remark, record_date, created_at, updated_at) VALUES
(3, @cat_food, 42.00, 'expense', '早餐', '2024-03-01', NOW(), NOW()),
(3, @cat_study, 150.00, 'expense', '购买学习资料', '2024-03-01', NOW(), NOW()),
(3, @cat_allowance, 2000.00, 'income', '生活费', '2024-03-01', NOW(), NOW());

-- ============================================
-- 数据统计说明
-- ============================================
-- 用户1（testuser）：
--   - 3月支出记录：约 20+ 条
--   - 3月收入：8000 + 500 + 300 = 8800 元
--   - 2月支出：约 2350 元
--   - 2月收入：7500 元
--   - 1月支出：约 1420 元
--   - 1月收入：7500 元
--
-- 用户2（zhangsan）：
--   - 3月支出：约 100 元
--   - 3月收入：6000 元
--
-- 用户3（lisi）：
--   - 3月支出：约 192 元
--   - 3月收入：2000 元
