package com.example.moneynote.controller;

import com.example.moneynote.dto.ApiResponse;
import com.example.moneynote.entity.Category;
import com.example.moneynote.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ApiResponse<List<Category>> getCategories(
            @RequestParam(required = false) String type) {
        try {
            List<Category> categories;
            if (type != null && (type.equals("expense") || type.equals("income"))) {
                categories = categoryService.getCategoriesByType(type, null);
            } else {
                categories = categoryService.getAllCategories(null);
            }
            return ApiResponse.success(categories);
        } catch (Exception e) {
            return ApiResponse.error("获取分类失败: " + e.getMessage());
        }
    }

    // 升级：为了安全起见，移除了 @PathVariable userId，直接从安全上下文获取
    @GetMapping("/user/me")
    public ApiResponse<List<Category>> getUserCategories(
            @RequestParam(required = false) String type) {
        try {
            Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            List<Category> categories;
            if (type != null && (type.equals("expense") || type.equals("income"))) {
                categories = categoryService.getCategoriesByType(type, userId);
            } else {
                categories = categoryService.getAllCategories(userId);
            }
            return ApiResponse.success(categories);
        } catch (Exception e) {
            return ApiResponse.error("获取分类失败: " + e.getMessage());
        }
    }
}