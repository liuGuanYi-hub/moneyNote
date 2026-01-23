package com.example.moneynote.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "records")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Record {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "category_id", nullable = false)
    private Long categoryId;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount; // 金额

    @Column(nullable = false, length = 20)
    private String type; // "expense" 或 "income"

    @Column(length = 500)
    private String remark; // 备注

    @Column(nullable = false)
    private LocalDate recordDate; // 记账日期

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted")
    private Boolean deleted = false; // 软删除标记

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (recordDate == null) {
            recordDate = LocalDate.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
