package com.example.moneynote.repository;

import com.example.moneynote.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByUserIdAndMonth(Long userId, String month);

    Optional<Budget> findByUserIdAndMonthAndCategoryId(Long userId, String month, Long categoryId);
}
