package com.example.moneynote.dto;

import lombok.Data;

@Data
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    
    // 手动添加构造函数
    public ApiResponse(boolean success, String message, T data) {
        this.success = success;
        this.message = message;
        this.data = data;
    }
    
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<T>(true, "操作成功", data);
    }
    
    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<T>(true, message, data);
    }
    
    @SuppressWarnings("unchecked")
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<T>(false, message, (T) null);
    }
}
