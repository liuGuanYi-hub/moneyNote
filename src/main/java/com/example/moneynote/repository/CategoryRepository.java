package com.example.moneynote.repository;

import com.example.moneynote.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByTypeAndUserIdIsNull(String type); // 系统默认分类
    List<Category> findByTypeAndUserId(String type, Long userId); // 用户自定义分类
    List<Category> findByTypeAndUserIdIsNullOrUserIdOrderByUseCountDescSortOrderAsc(String type, Long userId);
    
    @Query("SELECT c FROM Category c WHERE c.type = :type AND (c.userId IS NULL OR c.userId = :userId) ORDER BY c.useCount DESC, c.sortOrder ASC")
    List<Category> findCategoriesByType(@Param("type") String type, @Param("userId") Long userId);
    
    @Modifying
    @Query("UPDATE Category c SET c.useCount = c.useCount + 1 WHERE c.id = :categoryId")
    void incrementUseCount(@Param("categoryId") Long categoryId);
}
