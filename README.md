# 💰 moneyNote

> 一个优雅、轻量级的前后端分离个人财务管理系统。

[![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Spring Boot](https://img.shields.io/badge/Backend-Spring_Boot-6DB33F?logo=spring&logoColor=white)](https://spring.io/projects/spring-boot)
[![MySQL](https://img.shields.io/badge/Database-MySQL-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)

## 📖 简介

`moneyNote` 是一个旨在解决个人日常记账与财务追踪痛点的全栈 Web 应用。摒弃了繁琐的冗余功能，回归“记账”本身，提供多维度账单分类、状态流转记录以及高频交互下的强一致性数据支撑。

本项目采用 **前后端分离** 架构开发，前端专注于数据可视化与状态流转，后端专注于核心业务逻辑与数据持久化。
<img width="655" height="1125" alt="8f68e3d4024920c21776f14de35b330c" src="https://github.com/user-attachments/assets/51be4c78-b9ff-4b6b-968b-0e7ce09c837c" />
<img width="645" height="1204" alt="6063af4c6a1c25f5619282c68af61da2" src="https://github.com/user-attachments/assets/fcc2cf01-6c2b-483f-9938-1fa7e2b7707b" />


---

## ✨ 核心特性

- **⚡️ 极速记账**：高度优化的交互链路，支持快速录入收支明细与分类。
- **📊 多维面板**：支持按月、按分类的聚合统计，财务状况一目了然。
- **🔄 数据强一致**：基于严格的 RESTful API 规范设计，确保高频筛选与增删改操作时的数据准确性。
- **🧩 状态解耦**：前端采用 React Hooks 体系精细化管理复杂状态，保证 SPA 页面的极速响应。

---

## 🛠️ 技术栈

### 前端 (Frontend)
- **核心框架**: React 18+ 
- **状态与生命周期**: React Hooks (`useState`, `useEffect`, `useMemo`)
- **路由管理**: React Router
- **网络请求**: Axios

### 后端 (Backend)
- **核心框架**: Java / Spring Boot
- **数据持久化**: MyBatis / Spring Data JPA
- **数据库**: MySQL 8.0
- **接口规范**: RESTful API 架构风格

---

## 🚀 快速开始

### 环境依赖
- Node.js >= 16.x
- JDK >= 17 (或 1.8)
- MySQL >= 8.0

### 1. 克隆项目
```bash
git clone [https://github.com/liuGuanYi-hub/moneyNote.git](https://github.com/liuGuanYi-hub/moneyNote.git)
cd moneyNote
