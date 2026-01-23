package com.example.moneynote.repository;

import com.example.moneynote.entity.Record;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RecordRepository extends JpaRepository<Record, Long> {
    @Query("SELECT r FROM Record r WHERE r.userId = :userId AND (r.deleted IS NULL OR r.deleted = false) ORDER BY r.recordDate DESC, r.createdAt DESC")
    List<Record> findByUserIdOrderByRecordDateDescCreatedAtDesc(@Param("userId") Long userId);
    
    @Query("SELECT r FROM Record r WHERE r.userId = :userId AND r.type = :type AND (r.deleted IS NULL OR r.deleted = false) ORDER BY r.recordDate DESC, r.createdAt DESC")
    List<Record> findByUserIdAndTypeOrderByRecordDateDescCreatedAtDesc(@Param("userId") Long userId, @Param("type") String type);
    
    @Query("SELECT r FROM Record r WHERE r.userId = :userId AND r.categoryId = :categoryId AND (r.deleted IS NULL OR r.deleted = false) ORDER BY r.recordDate DESC")
    List<Record> findByUserIdAndCategoryIdOrderByRecordDateDesc(@Param("userId") Long userId, @Param("categoryId") Long categoryId);
    
    @Query("SELECT r FROM Record r WHERE r.userId = :userId AND r.deleted = true ORDER BY r.updatedAt DESC")
    List<Record> findByUserIdAndDeletedTrueOrderByUpdatedAtDesc(@Param("userId") Long userId); // 回收站
    
    @Query("SELECT r FROM Record r WHERE r.userId = :userId AND r.type = :type " +
           "AND r.recordDate BETWEEN :startDate AND :endDate " +
           "AND (r.deleted IS NULL OR r.deleted = false) " +
           "ORDER BY r.recordDate DESC, r.createdAt DESC")
    List<Record> findByUserIdAndTypeAndDateRange(
        @Param("userId") Long userId,
        @Param("type") String type,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
    
    @Query("SELECT r FROM Record r WHERE r.userId = :userId AND r.type = :type " +
           "AND LOWER(r.remark) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "AND (r.deleted IS NULL OR r.deleted = false) " +
           "ORDER BY r.recordDate DESC, r.createdAt DESC")
    List<Record> findByUserIdAndTypeAndRemarkContaining(
        @Param("userId") Long userId,
        @Param("type") String type,
        @Param("keyword") String keyword
    );
    
    @Query("SELECT SUM(r.amount) FROM Record r WHERE r.userId = :userId AND r.type = :type " +
           "AND YEAR(r.recordDate) = :year AND MONTH(r.recordDate) = :month " +
           "AND (r.deleted IS NULL OR r.deleted = false)")
    java.math.BigDecimal getTotalByMonth(@Param("userId") Long userId, @Param("type") String type, 
                                         @Param("year") int year, @Param("month") int month);
}
