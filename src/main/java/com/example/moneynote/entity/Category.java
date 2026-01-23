package com.example.moneynote.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String name; // 分类名称

    @Column(nullable = false, length = 50)
    private String icon; // FontAwesome图标类名，如 "fa-utensils"

    @Column(nullable = false, length = 20)
    private String type; // "expense" 或 "income"

    @Column(name = "user_id")
    private Long userId; // null表示系统默认分类，非null表示用户自定义分类

    @Column(name = "sort_order")
    private Integer sortOrder; // 排序顺序

    @Column(name = "use_count")
    private Integer useCount = 0; // 使用次数，用于按频率排序

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (useCount == null) {
            useCount = 0;
        }
    }
}
