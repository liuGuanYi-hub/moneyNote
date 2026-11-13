package com.example.moneynote.controller;

import com.example.moneynote.dto.ApiResponse;
import com.example.moneynote.entity.Budget;
import com.example.moneynote.service.BudgetService;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BudgetController {

    private final BudgetService budgetService;

    @GetMapping
    public ApiResponse<List<Budget>> getBudgets(@RequestParam String month) {
        Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ApiResponse.success(budgetService.getBudgets(userId, month));
    }

    @GetMapping("/progress")
    public ApiResponse<List<Map<String, Object>>> getBudgetProgress(@RequestParam String month) {
        Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ApiResponse.success(budgetService.getBudgetProgress(userId, month));
    }

    @PutMapping
    public ApiResponse<Budget> setBudget(@Valid @RequestBody SetBudgetRequest request) {
        Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Budget budget = budgetService.setBudget(userId, request.getCategoryId(), request.getMonth(), request.getAmount());
        return ApiResponse.success(budget);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteBudget(@PathVariable Long id) {
        Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        budgetService.deleteBudget(userId, id);
        return ApiResponse.success(null);
    }

    @Data
    public static class SetBudgetRequest {
        @NotNull
        private Long categoryId;

        @NotBlank
        @Pattern(regexp = "\\d{4}-\\d{2}")
        private String month;

        @NotNull
        @DecimalMin("0.01")
        private BigDecimal amount;
    }
}
