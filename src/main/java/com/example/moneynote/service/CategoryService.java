package com.example.moneynote.service;

import com.example.moneynote.entity.Category;
import com.example.moneynote.repository.CategoryRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {
    
    private final CategoryRepository categoryRepository;
    
    // 初始化系统默认分类
    @PostConstruct
    @Transactional
    public void initDefaultCategories() {
        if (categoryRepository.count() == 0) {
            // 支出分类
            createDefaultCategory("餐饮", "fa-utensils", "expense", 1);
            createDefaultCategory("交通", "fa-bus", "expense", 2);
            createDefaultCategory("购物", "fa-shopping-bag", "expense", 3);
            createDefaultCategory("居住", "fa-home", "expense", 4);
            createDefaultCategory("娱乐", "fa-gamepad", "expense", 5);
            createDefaultCategory("学习", "fa-book", "expense", 6);
            createDefaultCategory("医疗", "fa-heartbeat", "expense", 7);
            createDefaultCategory("生活日用", "fa-shopping-cart", "expense", 8);
            createDefaultCategory("其他支出", "fa-ellipsis-h", "expense", 9);
            
            // 收入分类
            createDefaultCategory("工资", "fa-coins", "income", 1);
            createDefaultCategory("兼职", "fa-hand-holding-usd", "income", 2);
            createDefaultCategory("生活费", "fa-money-bill-wave", "income", 3);
            createDefaultCategory("奖学金", "fa-graduation-cap", "income", 4);
            createDefaultCategory("投资", "fa-chart-line", "income", 5);
            createDefaultCategory("其他收入", "fa-gift", "income", 6);
        }
    }
    
    private void createDefaultCategory(String name, String icon, String type, int sortOrder) {
        Category category = new Category();
        category.setName(name);
        category.setIcon(icon);
        category.setType(type);
        category.setUserId(null); // 系统默认分类
        category.setSortOrder(sortOrder);
        category.setUseCount(0);
        categoryRepository.save(category);
    }
    
    public List<Category> getCategoriesByType(String type, Long userId) {
        return categoryRepository.findCategoriesByType(type, userId);
    }
    
    public List<Category> getAllCategories(Long userId) {
        List<Category> expenseCategories = getCategoriesByType("expense", userId);
        List<Category> incomeCategories = getCategoriesByType("income", userId);
        expenseCategories.addAll(incomeCategories);
        return expenseCategories;
    }
    
    @Transactional
    public void incrementCategoryUseCount(Long categoryId) {
        categoryRepository.incrementUseCount(categoryId);
    }
    
    @Transactional
    public Category createCustomCategory(Long userId, String name, String icon, String type) {
        Category category = new Category();
        category.setName(name);
        category.setIcon(icon);
        category.setType(type);
        category.setUserId(userId);
        category.setSortOrder(999);
        category.setUseCount(0);
        return categoryRepository.save(category);
    }
}
