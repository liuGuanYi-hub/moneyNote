package com.example.moneynote.service;

import com.example.moneynote.entity.Budget;
import com.example.moneynote.repository.BudgetRepository;
import com.example.moneynote.repository.RecordRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final RecordRepository recordRepository;

    @Transactional
    public Budget setBudget(Long userId, Long categoryId, String month, BigDecimal amount) {
        Budget budget = budgetRepository
                .findByUserIdAndMonthAndCategoryId(userId, month, categoryId)
                .orElseGet(() -> {
                    Budget b = new Budget();
                    b.setUserId(userId);
                    b.setCategoryId(categoryId);
                    b.setMonth(month);
                    return b;
                });
        budget.setAmount(amount);
        return budgetRepository.save(budget);
    }

    public List<Budget> getBudgets(Long userId, String month) {
        return budgetRepository.findByUserIdAndMonth(userId, month);
    }

    public List<Map<String, Object>> getBudgetProgress(Long userId, String month) {
        List<Budget> budgets = budgetRepository.findByUserIdAndMonth(userId, month);
        if (budgets.isEmpty()) return Collections.emptyList();

        String[] parts = month.split("-");
        int year = Integer.parseInt(parts[0]);
        int monthNum = Integer.parseInt(parts[1]);

        List<Map<String, Object>> result = new ArrayList<>();
        for (Budget budget : budgets) {
            BigDecimal spent = recordRepository.getTotalByCategoryAndMonth(userId, "expense", budget.getCategoryId(), year, monthNum);
            if (spent == null) spent = BigDecimal.ZERO;

            Map<String, Object> item = new LinkedHashMap<>();
            item.put("budgetId", budget.getId());
            item.put("categoryId", budget.getCategoryId());
            item.put("month", budget.getMonth());
            item.put("budgetAmount", budget.getAmount());
            item.put("spent", spent);
            item.put("remaining", budget.getAmount().subtract(spent));
            item.put("percentage", Math.min(100, spent.multiply(BigDecimal.valueOf(100))
                    .divide(budget.getAmount(), 1, RoundingMode.HALF_UP).doubleValue()));
            result.add(item);
        }
        return result;
    }

    @Transactional
    public void deleteBudget(Long userId, Long budgetId) {
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new EntityNotFoundException("预算不存在"));
        if (!budget.getUserId().equals(userId)) {
            throw new RuntimeException("无权删除此预算");
        }
        budgetRepository.delete(budget);
    }
}
