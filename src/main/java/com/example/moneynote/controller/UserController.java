package com.example.moneynote.controller;

import com.example.moneynote.dto.ApiResponse;
import com.example.moneynote.dto.AuthResponse;
import com.example.moneynote.dto.LoginRequest;
import com.example.moneynote.dto.RegisterRequest;
import com.example.moneynote.entity.User;
import com.example.moneynote.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    public ApiResponse<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = userService.register(request);
        return ApiResponse.success("注册成功", response);
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = userService.login(request);
        return ApiResponse.success("登录成功", response);
    }

    @GetMapping("/me")
    public ApiResponse<AuthResponse.UserInfo> getCurrentUser() {
        Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userService.getUserById(userId);

        AuthResponse.UserInfo userInfo = new AuthResponse.UserInfo(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getNickname(),
                user.getAvatar()
        );
        return ApiResponse.success(userInfo);
    }

    @PutMapping("/me")
    public ApiResponse<AuthResponse.UserInfo> updateUser(
            @RequestParam(required = false) String nickname,
            @RequestParam(required = false) String avatar) {
        Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userService.updateUser(userId, nickname, avatar);

        AuthResponse.UserInfo userInfo = new AuthResponse.UserInfo(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getNickname(),
                user.getAvatar()
        );
        return ApiResponse.success("更新成功", userInfo);
    }
}
