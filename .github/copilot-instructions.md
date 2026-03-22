# MoneyNote AI Coding Agent Instructions

**MoneyNote (记账助手 Pro)** is a full-stack AI-powered expense tracking application with a Spring Boot backend and vanilla JavaScript frontend.

## Architecture Overview

### Core Technology Stack
- **Backend:** Java 17 + Spring Boot 4.0.1 + Spring Data JPA + Spring Security (JWT)
- **Frontend:** Pure vanilla JavaScript (no framework) + Vite + ECharts + TailwindCSS
- **Database:** MySQL (production) / H2 (development)
- **AI:** Alibaba DashScope API (通义千问 Qwen) for intelligent expense parsing via Prompt Engineering
- **Auth:** JWT-based stateless authentication with BCrypt password hashing

### Service Architecture
Three core services exist with clear responsibilities:
1. **UserService** ([src/main/java/com/example/moneynote/service/UserService.java](src/main/java/com/example/moneynote/service/UserService.java)) - Registration, login, JWT generation
2. **RecordService** ([src/main/java/com/example/moneynote/service/RecordService.java](src/main/java/com/example/moneynote/service/RecordService.java)) - CRUD operations with soft-delete support, date-range queries
3. **StatisticsService** - Monthly aggregations, category breakdowns, trend analysis

### Data Model Key Patterns
- **Soft Delete:** `Record.deleted` boolean flag preserves deleted records in trash feature
- **User Isolation:** Every Record/Category is scoped to `userId` at the repository level - **CRITICAL: Always filter by userId**
- **Timestamps:** JPA auto-manages `createdAt`, `updatedAt` via `@PrePersist`, `@PreUpdate`
- **Precision Money:** Use `BigDecimal` with `precision=10, scale=2` for all financial amounts

## Critical Developer Workflows

### Backend Development
```bash
# Start development server (auto-compiles, JPA auto-creates H2 tables)
mvn spring-boot:run

# Run tests
mvn test

# Database setup (MySQL)
mysql -u root -p money_note < src/main/resources/db/schema.sql
```
**Configuration:** Edit `application.properties` for database switching (H2 ↔ MySQL) and `application-mysql.properties` for cloud deployments.

### Frontend Development
```bash
cd frontend
npm install
npm run dev  # Starts Vite dev server on http://localhost:5173

npm run build  # Production build
npm run lint   # ESLint check
```
**Key Pattern:** Frontend reads `.env` defaults from `index.html` for API base URL (currently `http://localhost:8080/api`).

### AI Integration Development
The **AI parsing pipeline** ([src/main/java/com/example/moneynote/controller/AiController.java](src/main/java/com/example/moneynote/controller/AiController.java)) uses:
1. **Prompt Engineering** - System prompt forces AI to output strict JSON with schema: `{amount, category, type, remark}`
2. **RestTemplate HTTP** - Direct calls to `dashscope.aliyuncs.com/compatible-mode/v1/chat/completions`
3. **Error Handling** - API key validation via `@Value("${ai.aliyun.api-key}")`

## Project-Specific Conventions

### Authentication Flow
1. User calls `POST /api/users/register` or `POST /api/users/login` (both return JWT token)
2. Token stored in browser localStorage as `token`
3. **JwtAuthenticationFilter** ([src/main/java/com/example/moneynote/filter/JwtAuthenticationFilter.java](src/main/java/com/example/moneynote/filter/JwtAuthenticationFilter.java)) extracts token from `Authorization: Bearer <token>` header
4. SecurityConfig permits ONLY `/api/users/register`, `/api/users/login`, `/h2-console/**` without auth; all other endpoints require valid token

### Record Query Patterns
**Repository custom queries** in [RecordRepository](src/main/java/com/example/moneynote/repository/RecordRepository.java):
- `findByUserIdOrderByRecordDateDescCreatedAtDesc()` - All user records sorted by date
- `findByUserIdAndTypeOrderByRecordDateDescCreatedAtDesc()` - Filter by expense/income
- `findByUserIdAndDeletedTrueOrderByUpdatedAtDesc()` - Trash feature
- **Always implement userId filtering** - Never query global records

### API Response Standard
All endpoints return wrapped responses (see [ApiResponse.java](src/main/java/com/example/moneynote/dto/ApiResponse.java)):
```json
{
  "success": true,
  "message": "操作成功",
  "data": { /* payload */ }
}
```
**Error responses** via [GlobalExceptionHandler](src/main/java/com/example/moneynote/config/GlobalExceptionHandler.java) maintain this contract.

### Frontend Data Storage Convention
- **localStorage Keys:** `token` (JWT), `user` (JSON stringified user object)
- **Fetch Pattern:** Always include `Authorization` header for authenticated endpoints
- **API Base:** Reads from `window.API_BASE || http://localhost:8080/api`

## Integration Points & External Dependencies

### Alibaba DashScope AI
- **Config File:** [application.properties](application.properties) requires `ai.aliyun.api-key=sk-...`
- **Endpoint:** `https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions` (OpenAI-compatible)
- **Model:** `qwen-turbo` (free tier)
- **Failure Handling:** Wrap in try-catch; frontend gracefully degrades to manual entry

### MySQL Cloud Database (Aiven)
- **Config:** [application-mysql.properties](src/main/resources/application-mysql.properties)
- **Profile Activation:** Set `spring.profiles.active=mysql` in production

### Frontend Chart Library
- **ECharts 6.0.0** - Used in Statistics module for pie/bar charts
- **Pattern:** Charts auto-resize on window resize (see `window.addEventListener('resize')`在 Frontend code)

## Common Patterns & Anti-Patterns

### ✅ DO:
1. **Always validate userId ownership** before returning/modifying records
2. **Use @Transactional** on service methods modifying multiple entities (e.g., create record → increment category count)
3. **Return wrapped ApiResponse** from all controllers
4. **Handle BigDecimal** operations - never use float for money

### ❌ DON'T:
1. **Query without userId filter** - Causes data leakage between users
2. **Store passwords in plain text** - Always use BCryptPasswordEncoder
3. **Return raw entity objects** - Use DTOs for API responses
4. **Skip JWT validation** - Filter covers all non-exempted endpoints

## Key Files Reference Map

| Purpose | File |
|---------|------|
| User auth flows | [UserController.java](src/main/java/com/example/moneynote/controller/UserController.java), [UserService.java](src/main/java/com/example/moneynote/service/UserService.java) |
| Record CRUD | [RecordController.java](src/main/java/com/example/moneynote/controller/RecordController.java), [RecordService.java](src/main/java/com/example/moneynote/service/RecordService.java) |
| AI parsing | [AiController.java](src/main/java/com/example/moneynote/controller/AiController.java) |
| JWT mechanics | [JwtUtil.java](src/main/java/com/example/moneynote/util/JwtUtil.java), [JwtAuthenticationFilter.java](src/main/java/com/example/moneynote/filter/JwtAuthenticationFilter.java) |
| Security rules | [SecurityConfig.java](src/main/java/com/example/moneynote/config/SecurityConfig.java) |
| Error handling | [GlobalExceptionHandler.java](src/main/java/com/example/moneynote/config/GlobalExceptionHandler.java) |
| Frontend API | [frontend/src/App.jsx](frontend/src/App.jsx) (Vite entry point) |
| Docs | [API_DOCUMENTATION.md](API_DOCUMENTATION.md), [DEVELOPMENT_JOURNEY.md](DEVELOPMENT_JOURNEY.md) |

## Example: Adding a New Record Endpoint

When adding features, follow this checklist:
1. **Repository** - Add query method if needed (filter by userId)
2. **Service** - Add business logic + @Transactional if multi-entity
3. **DTO** - Create request/response classes (avoid raw entities)
4. **Controller** - Wrap response in ApiResponse, extract userId from JWT
5. **Frontend** - Add fetch call with Authorization header
6. **Test** - Verify userId isolation

---

**Last Updated:** 2026-01-25
