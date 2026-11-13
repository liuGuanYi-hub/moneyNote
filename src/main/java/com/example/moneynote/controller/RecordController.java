package com.example.moneynote.controller;

import com.example.moneynote.dto.ApiResponse;
import com.example.moneynote.entity.Record;
import com.example.moneynote.service.RecordService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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

    @PostMapping
    public ApiResponse<Record> createRecord(@Valid @RequestBody CreateRecordRequest request) {
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
    }

    @GetMapping
    public ApiResponse<List<Record>> getRecords(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String keyword) {
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
    }

    @GetMapping("/recycle-bin")
    public ApiResponse<List<Record>> getDeletedRecords() {
        Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        List<Record> records = recordService.getDeletedRecords(userId);
        return ApiResponse.success(records);
    }

    @GetMapping("/{id}")
    public ApiResponse<Record> getRecord(@PathVariable Long id) {
        Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Record record = recordService.getRecordById(id);
        if (record == null || !record.getUserId().equals(userId)) {
            return ApiResponse.error("记录不存在或无权访问");
        }
        return ApiResponse.success(record);
    }

    @PutMapping("/{id}")
    public ApiResponse<Record> updateRecord(@PathVariable Long id,
                                            @Valid @RequestBody UpdateRecordRequest request) {
        Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Record record = recordService.updateRecord(
                id,
                request.getCategoryId(),
                request.getAmount(),
                request.getRemark(),
                request.getRecordDate()
        );
        return ApiResponse.success("更新成功", record);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteRecord(@PathVariable Long id) {
        Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        recordService.deleteRecord(id);
        return ApiResponse.success("删除成功", null);
    }

    @PostMapping("/{id}/restore")
    public ApiResponse<Record> restoreRecord(@PathVariable Long id) {
        Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        recordService.restoreRecord(id);
        Record record = recordService.getRecordById(id);
        return ApiResponse.success("恢复成功", record);
    }

    @DeleteMapping("/{id}/permanent")
    public ApiResponse<Void> permanentlyDeleteRecord(@PathVariable Long id) {
        Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        recordService.permanentlyDeleteRecord(id);
        return ApiResponse.success("永久删除成功", null);
    }

    @Data
    public static class CreateRecordRequest {
        @NotNull(message = "分类不能为空")
        private Long categoryId;

        @NotNull(message = "金额不能为空")
        @DecimalMin(value = "0.01", message = "金额必须大于0")
        private BigDecimal amount;

        @NotBlank(message = "类型不能为空")
        private String type;

        private String remark;

        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        private LocalDate recordDate;
    }

    @Data
    public static class UpdateRecordRequest {
        @NotNull(message = "分类不能为空")
        private Long categoryId;

        @NotNull(message = "金额不能为空")
        @DecimalMin(value = "0.01", message = "金额必须大于0")
        private BigDecimal amount;

        private String remark;

        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        private LocalDate recordDate;
    }
}
