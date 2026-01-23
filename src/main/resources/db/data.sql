-- ============================================
-- 记账助手 Pro - 初始化数据脚本
-- ============================================

-- ============================================
-- 初始化系统默认分类
-- ============================================

-- 支出分类
INSERT INTO categories (name, icon, type, user_id, sort_order, use_count) VALUES
('餐饮', 'fa-utensils', 'expense', NULL, 1, 0),
('交通', 'fa-bus', 'expense', NULL, 2, 0),
('购物', 'fa-shopping-bag', 'expense', NULL, 3, 0),
('居住', 'fa-home', 'expense', NULL, 4, 0),
('娱乐', 'fa-gamepad', 'expense', NULL, 5, 0),
('学习', 'fa-book', 'expense', NULL, 6, 0),
('医疗', 'fa-heartbeat', 'expense', NULL, 7, 0),
('生活日用', 'fa-shopping-cart', 'expense', NULL, 8, 0),
('其他支出', 'fa-ellipsis-h', 'expense', NULL, 9, 0);

-- 收入分类
INSERT INTO categories (name, icon, type, user_id, sort_order, use_count) VALUES
('工资', 'fa-coins', 'income', NULL, 1, 0),
('兼职', 'fa-hand-holding-usd', 'income', NULL, 2, 0),
('生活费', 'fa-money-bill-wave', 'income', NULL, 3, 0),
('奖学金', 'fa-graduation-cap', 'income', NULL, 4, 0),
('投资', 'fa-chart-line', 'income', NULL, 5, 0),
('其他收入', 'fa-gift', 'income', NULL, 6, 0);
