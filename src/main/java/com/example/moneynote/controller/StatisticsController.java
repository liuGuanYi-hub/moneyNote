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

    @GetMapping("/monthly-overview")
    public ApiResponse<Map<String, Object>> getMonthlyOverview(
            @RequestParam(defaultValue = "0") int year,
            @RequestParam(defaultValue = "0") int month) {
        Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (year == 0 || month == 0) {
            java.time.YearMonth current = java.time.YearMonth.now();
            year = current.getYear();
            month = current.getMonthValue();
        }

        Map<String, Object> overview = statisticsService.getMonthlyOverview(userId, year, month);
        return ApiResponse.success(overview);
    }

    @GetMapping("/expense-trend")
    public ApiResponse<List<Map<String, Object>>> getExpenseTrend(
            @RequestParam(defaultValue = "30") int days) {
        Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        List<Map<String, Object>> trend = statisticsService.getExpenseTrend(userId, days);
        return ApiResponse.success(trend);
    }

    @GetMapping("/category-distribution")
    public ApiResponse<List<Map<String, Object>>> getCategoryDistribution(
            @RequestParam(defaultValue = "0") int year,
            @RequestParam(defaultValue = "0") int month) {
        Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (year == 0 || month == 0) {
            java.time.YearMonth current = java.time.YearMonth.now();
            year = current.getYear();
            month = current.getMonthValue();
        }

        List<Map<String, Object>> distribution =
                statisticsService.getCategoryDistribution(userId, year, month);
        return ApiResponse.success(distribution);
    }

    @GetMapping("/income-expense-comparison")
    public ApiResponse<List<Map<String, Object>>> getIncomeExpenseComparison(
            @RequestParam(defaultValue = "6") int months) {
        Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        List<Map<String, Object>> comparison =
                statisticsService.getIncomeExpenseComparison(userId, months);
        return ApiResponse.success(comparison);
    }
}
