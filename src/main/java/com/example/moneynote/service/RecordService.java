package com.example.moneynote.service;

import com.example.moneynote.entity.Record;
import com.example.moneynote.repository.RecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RecordService {
    
    private final RecordRepository recordRepository;
    private final CategoryService categoryService;
    
    @Transactional
    public Record createRecord(Long userId, Long categoryId, BigDecimal amount, 
                               String type, String remark, LocalDate recordDate) {
        Record record = new Record();
        record.setUserId(userId);
        record.setCategoryId(categoryId);
        record.setAmount(amount);
        record.setType(type);
        record.setRemark(remark);
        record.setRecordDate(recordDate != null ? recordDate : LocalDate.now());
        
        // 增加分类使用次数
        categoryService.incrementCategoryUseCount(categoryId);
        
        return recordRepository.save(record);
    }
    
    public List<Record> getUserRecords(Long userId) {
        return recordRepository.findByUserIdOrderByRecordDateDescCreatedAtDesc(userId);
    }
    
    public List<Record> getUserRecordsByType(Long userId, String type) {
        return recordRepository.findByUserIdAndTypeOrderByRecordDateDescCreatedAtDesc(userId, type);
    }
    
    public List<Record> getDeletedRecords(Long userId) {
        return recordRepository.findByUserIdAndDeletedTrueOrderByUpdatedAtDesc(userId);
    }
    
    public List<Record> getUserRecordsByCategory(Long userId, Long categoryId) {
        return recordRepository.findByUserIdAndCategoryIdOrderByRecordDateDesc(userId, categoryId);
    }
    
    public List<Record> getUserRecordsByDateRange(Long userId, String type, 
                                                   LocalDate startDate, LocalDate endDate) {
        return recordRepository.findByUserIdAndTypeAndDateRange(userId, type, startDate, endDate);
    }
    
    public List<Record> searchRecordsByKeyword(Long userId, String type, String keyword) {
        return recordRepository.findByUserIdAndTypeAndRemarkContaining(userId, type, keyword);
    }
    
    public Record getRecordById(Long recordId) {
        return recordRepository.findById(recordId)
            .orElseThrow(() -> new RuntimeException("记录不存在"));
    }
    
    @Transactional
    public Record updateRecord(Long recordId, Long categoryId, BigDecimal amount, 
                               String remark, LocalDate recordDate) {
        Record record = getRecordById(recordId);
        if (categoryId != null) {
            record.setCategoryId(categoryId);
            categoryService.incrementCategoryUseCount(categoryId);
        }
        if (amount != null) {
            record.setAmount(amount);
        }
        if (remark != null) {
            record.setRemark(remark);
        }
        if (recordDate != null) {
            record.setRecordDate(recordDate);
        }
        return recordRepository.save(record);
    }
    
    @Transactional
    public void deleteRecord(Long recordId) {
        Record record = getRecordById(recordId);
        record.setDeleted(true);
        recordRepository.save(record);
    }
    
    @Transactional
    public void restoreRecord(Long recordId) {
        Record record = getRecordById(recordId);
        record.setDeleted(false);
        recordRepository.save(record);
    }
    
    @Transactional
    public void permanentlyDeleteRecord(Long recordId) {
        recordRepository.deleteById(recordId);
    }
    
    public BigDecimal getTotalByMonth(Long userId, String type, int year, int month) {
        BigDecimal total = recordRepository.getTotalByMonth(userId, type, year, month);
        return total != null ? total : BigDecimal.ZERO;
    }
}
