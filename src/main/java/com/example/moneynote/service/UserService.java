package com.example.moneynote.service;

import com.example.moneynote.dto.AuthResponse;
import com.example.moneynote.dto.LoginRequest;
import com.example.moneynote.dto.RegisterRequest;
import com.example.moneynote.entity.User;
import com.example.moneynote.repository.UserRepository;
import com.example.moneynote.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // 验证用户名是否重复
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("用户名已存在");
        }
        
        // 验证邮箱是否重复
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("邮箱已被注册");
        }
        
        // 创建新用户
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword())); // 密码加密
        user.setEmail(request.getEmail());
        user.setNickname(request.getNickname() != null ? request.getNickname() : request.getUsername());
        // 使用像素头像API，根据用户名生成唯一头像
        int avatarId = Math.abs(user.getUsername().hashCode()) % 1000;
        user.setAvatar("https://api.dicebear.com/7.x/pixel-art/svg?seed=" + avatarId);
        
        user = userRepository.save(user);
        
        // 生成Token
        String token = jwtUtil.generateToken(user.getId(), user.getUsername());
        
        return new AuthResponse(token, new AuthResponse.UserInfo(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getNickname(),
            user.getAvatar()
        ));
    }
    
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
            .orElseThrow(() -> new RuntimeException("用户名或密码错误"));
        
        // 验证密码
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("用户名或密码错误");
        }
        
        // 生成Token
        String token = jwtUtil.generateToken(user.getId(), user.getUsername());
        
        return new AuthResponse(token, new AuthResponse.UserInfo(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getNickname(),
            user.getAvatar()
        ));
    }
    
    public User getUserById(Long userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("用户不存在"));
    }
    
    @Transactional
    public User updateUser(Long userId, String nickname, String avatar) {
        User user = getUserById(userId);
        if (nickname != null && !nickname.trim().isEmpty()) {
            user.setNickname(nickname);
        }
        if (avatar != null && !avatar.trim().isEmpty()) {
            user.setAvatar(avatar);
        }
        return userRepository.save(user);
    }
}
