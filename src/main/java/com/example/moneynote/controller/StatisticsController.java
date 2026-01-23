package com.example.moneynote.controller;

import com.example.moneynote.dto.ApiResponse;
import com.example.moneynote.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StatisticsController {

    private final StatisticsService statisticsService;
    // 移除了 jwtUtil

    @GetMapping("/monthly-overview")
    public ApiResponse<Map<String, Object>> getMonthlyOverview(
            @RequestParam(defaultValue = "0") int year,
            @RequestParam(defaultValue = "0") int month) {
        try {
            Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

            // 如果未指定年月，使用当前年月
            if (year == 0 || month == 0) {
                java.time.YearMonth current = java.time.YearMonth.now();
                year = current.getYear();
                month = current.getMonthValue();
            }

            Map<String, Object> overview = statisticsService.getMonthlyOverview(userId, year, month);
            return ApiResponse.success(overview);
        } catch (Exception e) {
            return ApiResponse.error("获取月度概览失败: " + e.getMessage());
        }
    }

    @GetMapping("/expense-trend")
    public ApiResponse<List<Map<String, Object>>> getExpenseTrend(
            @RequestParam(defaultValue = "30") int days) {
        try {
            Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            List<Map<String, Object>> trend = statisticsService.getExpenseTrend(userId, days);
            return ApiResponse.success(trend);
        } catch (Exception e) {
            return ApiResponse.error("获取消费趋势失败: " + e.getMessage());
        }
    }

    @GetMapping("/category-distribution")
    public ApiResponse<List<Map<String, Object>>> getCategoryDistribution(
            @RequestParam(defaultValue = "0") int year,
            @RequestParam(defaultValue = "0") int month) {
        try {
            Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

            // 如果未指定年月，使用当前年月
            if (year == 0 || month == 0) {
                java.time.YearMonth current = java.time.YearMonth.now();
                year = current.getYear();
                month = current.getMonthValue();
            }

            List<Map<String, Object>> distribution =
                    statisticsService.getCategoryDistribution(userId, year, month);
            return ApiResponse.success(distribution);
        } catch (Exception e) {
            return ApiResponse.error("获取分类占比失败: " + e.getMessage());
        }
    }

    @GetMapping("/income-expense-comparison")
    public ApiResponse<List<Map<String, Object>>> getIncomeExpenseComparison(
            @RequestParam(defaultValue = "6") int months) {
        try {
            Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            List<Map<String, Object>> comparison =
                    statisticsService.getIncomeExpenseComparison(userId, months);
            return ApiResponse.success(comparison);
        } catch (Exception e) {
            return ApiResponse.error("获取收支对比失败: " + e.getMessage());
        }
    }

    // --- 删除了 getUserIdFromRequest 和 extractToken 方法 ---
}