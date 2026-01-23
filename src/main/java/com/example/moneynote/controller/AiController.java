package com.example.moneynote.controller;

import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONObject;
import com.example.moneynote.dto.ApiResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    // 这里会自动读取你在 application.properties 里填的那个 sk- 开头的密钥
    @Value("${ai.aliyun.api-key}")
    private String apiKey;

    // SpringBoot 自带的发起网络请求的工具
    private final RestTemplate restTemplate = new RestTemplate();

    @PostMapping("/parse")
    public ApiResponse<JSONObject> parseVoiceRecord(@RequestBody Map<String, String> request) {
        String userText = request.get("text");
        if (userText == null || userText.trim().isEmpty()) {
            return ApiResponse.error("你说的话太短啦，我没听清~");
        }

        // 1. 设置请求阿里云的地址 (兼容 OpenAI 格式的接口)
        String url = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";

        // 2. 准备请求头（带上你的专属 Key）
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        // 3. 🎯 核心技术：Prompt Engineering (提示词工程)
        // 告诉 AI 它的任务，并强制它输出 JSON
        String systemPrompt = "你是一个智能财务助手。你的任务是从用户的输入中提取记账信息。\n" +
                "请严格输出 JSON 格式，不要包含任何多余的解释文字。字段如下：\n" +
                "- amount (数字类型，必须提取出金额)\n" +
                "- category (字符串，如：餐饮、交通、购物、娱乐、工资)\n" +
                "- type (字符串，支出填'expense'，收入填'income')\n" +
                "- remark (字符串，提取出用户买的具体东西或备注)\n" +
                "示例输出：{\"amount\": 35, \"category\": \"餐饮\", \"type\": \"expense\", \"remark\": \"黄焖鸡米饭\"}";

        // 4. 组装发给 AI 的数据包
        Map<String, Object> body = new HashMap<>();
        body.put("model", "qwen-turbo"); // 使用阿里云免费的千问 Turbo 模型
        body.put("messages", List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", "用户输入：" + userText)
        ));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            // 5. 🚀 发射请求给阿里云 AI 大脑！
            String responseStr = restTemplate.postForObject(url, entity, String.class);

            // 6. 解析 AI 的回答
            JSONObject jsonResponse = JSON.parseObject(responseStr);
            String aiAnswer = jsonResponse.getJSONArray("choices")
                    .getJSONObject(0)
                    .getJSONObject("message")
                    .getString("content");

            // 清理 AI 可能带回来的 markdown 标记 (比如 ```json ```)
            aiAnswer = aiAnswer.replace("```json", "").replace("```", "").trim();

            // 成功！返回干净的 JSON 结果给前端
            return ApiResponse.success(JSON.parseObject(aiAnswer));

        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error("AI 大脑开小差了，请稍后再试: " + e.getMessage());
        }
    }
}