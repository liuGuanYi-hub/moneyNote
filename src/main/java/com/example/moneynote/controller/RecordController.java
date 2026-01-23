package com.example.moneynote.controller;

import com.example.moneynote.dto.ApiResponse;
import com.example.moneynote.entity.Record;
import com.example.moneynote.service.RecordService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/records")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RecordController {

    private final RecordService recordService;

    // --- 1. 创建记录 ---
    @PostMapping
    public ApiResponse<Record> createRecord(@RequestBody CreateRecordRequest request) {
        try {
            Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            Record record = recordService.createRecord(
                    userId,
                    request.getCategoryId(),
                    request.getAmount(),
                    request.getType(),
                    request.getRemark(),
                    request.getRecordDate()
            );
            return ApiResponse.success("记账成功", record);
        } catch (Exception e) {
            return ApiResponse.error("记账失败: " + e.getMessage());
        }
    }

    // --- 2. 查询记录列表 (支持多种过滤条件) ---
    @GetMapping
    public ApiResponse<List<Record>> getRecords(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String keyword) {
        try {
            Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            List<Record> records;

            if (categoryId != null) {
                records = recordService.getUserRecordsByCategory(userId, categoryId);
            } else if (startDate != null && endDate != null && type != null) {
                records = recordService.getUserRecordsByDateRange(userId, type, startDate, endDate);
            } else if (keyword != null && type != null) {
                records = recordService.searchRecordsByKeyword(userId, type, keyword);
            } else if (type != null) {
                records = recordService.getUserRecordsByType(userId, type);
            } else {
                records = recordService.getUserRecords(userId);
            }

            return ApiResponse.success(records);
        } catch (Exception e) {
            return ApiResponse.error("获取记录失败: " + e.getMessage());
        }
    }

    // --- 🆕 补充接口：查询回收站（已删除）的记录 ---
    @GetMapping("/recycle-bin")
    public ApiResponse<List<Record>> getDeletedRecords() {
        try {
            Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            List<Record> records = recordService.getDeletedRecords(userId);
            return ApiResponse.success(records);
        } catch (Exception e) {
            return ApiResponse.error("获取回收站记录失败: " + e.getMessage());
        }
    }

    // --- 3. 获取单条记录 ---
    @GetMapping("/{id}")
    public ApiResponse<Record> getRecord(@PathVariable Long id) {
        try {
            Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            Record record = recordService.getRecordById(id);
            if (record == null || !record.getUserId().equals(userId)) {
                return ApiResponse.error("记录不存在或无权访问");
            }
            return ApiResponse.success(record);
        } catch (Exception e) {
            return ApiResponse.error("获取记录失败: " + e.getMessage());
        }
    }

    // --- 4. 更新记录 ---
    @PutMapping("/{id}")
    public ApiResponse<Record> updateRecord(@PathVariable Long id,
                                            @RequestBody UpdateRecordRequest request) {
        try {
            Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            Record record = recordService.updateRecord(
                    id,
                    request.getCategoryId(),
                    request.getAmount(),
                    request.getRemark(),
                    request.getRecordDate()
            );
            return ApiResponse.success("更新成功", record);
        } catch (Exception e) {
            return ApiResponse.error("更新失败: " + e.getMessage());
        }
    }

    // --- 5. 删除记录 (逻辑删除) ---
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteRecord(@PathVariable Long id) {
        try {
            Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            recordService.deleteRecord(id);
            return ApiResponse.success("删除成功", null);
        } catch (Exception e) {
            return ApiResponse.error("删除失败: " + e.getMessage());
        }
    }

    // --- 6. 恢复删除的记录 ---
    @PostMapping("/{id}/restore")
    public ApiResponse<Record> restoreRecord(@PathVariable Long id) {
        try {
            Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            recordService.restoreRecord(id);
            Record record = recordService.getRecordById(id);
            return ApiResponse.success("恢复成功", record);
        } catch (Exception e) {
            return ApiResponse.error("恢复失败: " + e.getMessage());
        }
    }

    // --- 7. 永久删除记录 ---
    @DeleteMapping("/{id}/permanent")
    public ApiResponse<Void> permanentlyDeleteRecord(@PathVariable Long id) {
        try {
            Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            recordService.permanentlyDeleteRecord(id);
            return ApiResponse.success("永久删除成功", null);
        } catch (Exception e) {
            return ApiResponse.error("永久删除失败: " + e.getMessage());
        }
    }

    @Data
    public static class CreateRecordRequest {
        private Long categoryId;
        private BigDecimal amount;
        private String type;
        private String remark;
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        private LocalDate recordDate;
    }

    @Data
    public static class UpdateRecordRequest {
        private Long categoryId;
        private BigDecimal amount;
        private String remark;
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        private LocalDate recordDate;
    }
}