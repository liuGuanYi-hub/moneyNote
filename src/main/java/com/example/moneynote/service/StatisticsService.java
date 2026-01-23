package com.example.moneynote.service;

import com.example.moneynote.entity.Record;
import com.example.moneynote.repository.RecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatisticsService {
    
    private final RecordRepository recordRepository;
    private final RecordService recordService;
    
    // 月度收支概览
    public Map<String, Object> getMonthlyOverview(Long userId, int year, int month) {
        BigDecimal totalIncome = recordService.getTotalByMonth(userId, "income", year, month);
        BigDecimal totalExpense = recordService.getTotalByMonth(userId, "expense", year, month);
        BigDecimal balance = totalIncome.subtract(totalExpense);
        
        // 上个月数据
        YearMonth currentMonth = YearMonth.of(year, month);
        YearMonth lastMonth = currentMonth.minusMonths(1);
        BigDecimal lastMonthIncome = recordService.getTotalByMonth(userId, "income", 
            lastMonth.getYear(), lastMonth.getMonthValue());
        BigDecimal lastMonthExpense = recordService.getTotalByMonth(userId, "expense", 
            lastMonth.getYear(), lastMonth.getMonthValue());
        
        Map<String, Object> result = new HashMap<>();
        result.put("totalIncome", totalIncome);
        result.put("totalExpense", totalExpense);
        result.put("balance", balance);
        result.put("lastMonthIncome", lastMonthIncome);
        result.put("lastMonthExpense", lastMonthExpense);
        result.put("incomeChange", totalIncome.subtract(lastMonthIncome));
        result.put("expenseChange", totalExpense.subtract(lastMonthExpense));
        
        return result;
    }
    
    // 消费趋势图表数据（最近N天）
    public List<Map<String, Object>> getExpenseTrend(Long userId, int days) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(days - 1);
        
        List<Record> records = recordRepository.findByUserIdAndTypeAndDateRange(
            userId, "expense", startDate, endDate);
        
        // 按日期分组统计
        Map<LocalDate, BigDecimal> dailyExpenses = records.stream()
            .collect(Collectors.groupingBy(
                Record::getRecordDate,
                Collectors.reducing(BigDecimal.ZERO, Record::getAmount, BigDecimal::add)
            ));
        
        // 填充所有日期（包括没有记录的日期）
        List<Map<String, Object>> trendData = new ArrayList<>();
        for (int i = 0; i < days; i++) {
            LocalDate date = startDate.plusDays(i);
            BigDecimal amount = dailyExpenses.getOrDefault(date, BigDecimal.ZERO);
            
            Map<String, Object> dayData = new HashMap<>();
            dayData.put("date", date.toString());
            dayData.put("dateLabel", date.getMonthValue() + "月" + date.getDayOfMonth() + "日");
            dayData.put("amount", amount);
            trendData.add(dayData);
        }
        
        return trendData;
    }
    
    // 分类占比图表数据
    public List<Map<String, Object>> getCategoryDistribution(Long userId, int year, int month) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();
        
        List<Record> records = recordRepository.findByUserIdAndTypeAndDateRange(
            userId, "expense", startDate, endDate);
        
        // 按分类分组统计
        Map<Long, BigDecimal> categoryTotals = records.stream()
            .collect(Collectors.groupingBy(
                Record::getCategoryId,
                Collectors.reducing(BigDecimal.ZERO, Record::getAmount, BigDecimal::add)
            ));
        
        BigDecimal total = categoryTotals.values().stream()
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // 计算占比
        List<Map<String, Object>> distribution = new ArrayList<>();
        for (Map.Entry<Long, BigDecimal> entry : categoryTotals.entrySet()) {
            Map<String, Object> item = new HashMap<>();
            item.put("categoryId", entry.getKey());
            item.put("amount", entry.getValue());
            item.put("percentage", total.compareTo(BigDecimal.ZERO) > 0 
                ? entry.getValue().divide(total, 4, java.math.RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100")).setScale(2, java.math.RoundingMode.HALF_UP)
                : BigDecimal.ZERO);
            distribution.add(item);
        }
        
        // 按金额降序排序
        distribution.sort((a, b) -> 
            ((BigDecimal) b.get("amount")).compareTo((BigDecimal) a.get("amount")));
        
        return distribution;
    }
    
    // 收支对比图表数据（每月）
    public List<Map<String, Object>> getIncomeExpenseComparison(Long userId, int months) {
        List<Map<String, Object>> comparison = new ArrayList<>();
        YearMonth currentMonth = YearMonth.now();
        
        for (int i = months - 1; i >= 0; i--) {
            YearMonth month = currentMonth.minusMonths(i);
            BigDecimal income = recordService.getTotalByMonth(userId, "income", 
                month.getYear(), month.getMonthValue());
            BigDecimal expense = recordService.getTotalByMonth(userId, "expense", 
                month.getYear(), month.getMonthValue());
            
            Map<String, Object> monthData = new HashMap<>();
            monthData.put("year", month.getYear());
            monthData.put("month", month.getMonthValue());
            monthData.put("monthLabel", month.getYear() + "年" + month.getMonthValue() + "月");
            monthData.put("income", income);
            monthData.put("expense", expense);
            comparison.add(monthData);
        }
        
        return comparison;
    }
}
