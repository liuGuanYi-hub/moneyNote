package com.example.moneynote.filter;

import com.example.moneynote.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // 1. 获取请求头中的 Authorization
        final String authHeader = request.getHeader("Authorization");

        // 2. 如果没有Token，直接放行（让Spring Security去拦截，或者给不需要登录的接口放行）
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 3. 提取 Token
        final String token = authHeader.substring(7);

        try {
            // 4. 解析 Token 获取 userId
            Long userId = jwtUtil.getUserIdFromToken(token);

            // 5. 如果 userId 存在，且当前安全上下文中没有认证信息
            if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                // 制作一张“通行证” (Authentication)
                // 这里我们将 userId 作为 Principal（主角）存进去，密码设为null，权限列表设为null(空)
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userId, null, null);

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // 6. 把通行证交给 Spring Security 保安
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        } catch (Exception e) {
            // Token过期或无效，不做任何处理，让SecurityContextHolder保持null
            // 后续会被 Spring Security 判定为 401 或 403
        }

        // 7. 继续执行后续的过滤器
        filterChain.doFilter(request, response);
    }
}