# API 文档生成器

根据 Spring Boot Controller 自动生成规范的 Markdown 接口文档，便于提供给三方系统对接。

## 核心功能

### 1. 自动扫描 Controller
- 查找项目中所有 Controller 类
- 识别 `@RestController` 和 `@Controller` 注解
- 支持多模块项目

### 2. 解析接口信息
提取以下关键信息：
- **请求路径**：`@RequestMapping`、`@GetMapping`、`@PostMapping` 等
- **请求方法**：GET、POST、PUT、DELETE、PATCH
- **接口描述**：`@ApiOperation`、`@Operation` 注解
- **请求参数**：`@RequestParam`、`@PathVariable`、`@RequestHeader`
- **请求体**：`@RequestBody` 和对应的实体类
- **响应数据**：返回值类型及其字段

### 3. 解析实体类结构
- 递归解析请求/响应实体类的所有字段
- 提取字段类型、描述、是否必填
- 支持 Swagger 注解：`@ApiModel`、`@ApiModelProperty`
- 支持 Jakarta Validation：`@NotNull`、`@NotBlank`、`@Size` 等
- 支持泛型（如 `Result<T>`）

### 4. 生成规范的 Markdown 文档
生成包含以下内容的文档：
- 📋 接口概览表格（名称、方法、路径）
- 📝 每个接口的详细说明
- 📥 请求参数表格
- 📤 响应参数表格
- 💡 请求/响应示例（JSON格式）
- ⚠️ 错误码说明

## 执行步骤

### 步骤 1：项目检测
- 检查当前目录是否是 Spring Boot 项目
- 查找 `src/main/java` 目录
- 识别包结构

### 步骤 2：询问用户需求
使用 AskUserQuestion 询问：
- **要生成哪些 Controller 的文档？**
  - 全部 Controller
  - 指定包下的 Controller（如 `com.example.api`）
  - 指定的 Controller 类
- **文档格式偏好**
  - 简洁版（只包含核心信息）
  - 标准版（包含示例）
  - 详细版（包含所有细节和错误码）
- **是否包含通用响应结构**
  - 如 `Result<T>` 包装类的说明

### 步骤 3：扫描 Controller 文件
使用 Glob 工具查找 Controller 文件：
```
**/controller/**/*.java
**/api/**/*.java
```

### 步骤 4：解析 Controller 代码
对每个 Controller 文件：
1. 使用 Read 工具读取文件内容
2. 提取类级别的 `@RequestMapping` 路径前缀
3. 解析每个接口方法：
   - 方法注解（`@GetMapping`、`@PostMapping` 等）
   - 方法路径和请求方法
   - `@ApiOperation` 或注释中的接口描述
   - 参数列表及其注解
   - 返回值类型

### 步骤 5：解析实体类（如需要）
如果接口使用了 `@RequestBody` 或返回了复杂对象：
1. 定位实体类文件（通常在 `dto`、`vo`、`entity` 包）
2. 读取实体类文件
3. 提取所有字段及其属性：
   - 字段名称和类型
   - `@ApiModelProperty` 描述
   - 校验注解（`@NotNull`、`@NotBlank` 等）
   - 默认值

### 步骤 6：生成 Markdown 文档

#### 文档结构

```markdown
# [系统名称] API 接口文档

> 生成时间：YYYY-MM-DD HH:mm:ss
> 版本：v1.0
> 基础路径：http://localhost:8080

## 目录

- [1. 模块A](#模块a)
  - [1.1 接口1](#11-接口1)
  - [1.2 接口2](#12-接口2)

## 通用说明

### 请求头
| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| Authorization | string | 是 | 认证令牌 |
| Content-Type | string | 是 | application/json |

### 通用响应结构
\```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
\```

### 错误码说明
| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 参数错误 |
| 401 | 未授权 |
| 500 | 服务器错误 |

---

## 1. 用户管理模块

### 1.1 创建用户

**接口描述**：创建新用户

**请求URL**：`/api/users`

**请求方法**：`POST`

**请求参数**

Body (application/json):

| 参数名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| username | string | 是 | 用户名，长度3-20 | zhangsan |
| email | string | 是 | 邮箱地址 | test@example.com |
| age | integer | 否 | 年龄，范围1-150 | 25 |

**请求示例**

\```json
{
  "username": "zhangsan",
  "email": "test@example.com",
  "age": 25
}
\```

**响应参数**

| 参数名 | 类型 | 描述 |
|--------|------|------|
| code | integer | 状态码 |
| message | string | 提示信息 |
| data | object | 用户信息 |
| └─ id | long | 用户ID |
| └─ username | string | 用户名 |
| └─ email | string | 邮箱 |
| └─ createdAt | string | 创建时间 |

**响应示例**

\```json
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "id": 1001,
    "username": "zhangsan",
    "email": "test@example.com",
    "createdAt": "2024-01-01 12:00:00"
  }
}
\```

---

### 1.2 查询用户列表

**接口描述**：分页查询用户列表

**请求URL**：`/api/users`

**请求方法**：`GET`

**请求参数**

Query 参数:

| 参数名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| page | integer | 否 | 页码，默认1 | 1 |
| size | integer | 否 | 每页数量，默认10 | 10 |
| keyword | string | 否 | 搜索关键词 | zhang |

**请求示例**

\```
GET /api/users?page=1&size=10&keyword=zhang
\```

**响应参数**

| 参数名 | 类型 | 描述 |
|--------|------|------|
| code | integer | 状态码 |
| message | string | 提示信息 |
| data | object | 分页数据 |
| └─ total | long | 总记录数 |
| └─ list | array | 用户列表 |
| &nbsp;&nbsp;&nbsp;&nbsp;└─ id | long | 用户ID |
| &nbsp;&nbsp;&nbsp;&nbsp;└─ username | string | 用户名 |

**响应示例**

\```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "total": 100,
    "list": [
      {
        "id": 1001,
        "username": "zhangsan"
      }
    ]
  }
}
\```

---
```

### 步骤 7：优化和美化
- 添加目录导航（带锚点链接）
- 统一缩进和格式
- 代码块使用语法高亮
- 添加表情符号增强可读性

### 步骤 8：保存文档
将生成的文档保存为：
- `API-文档-{模块名}-{日期}.md`
- 或用户指定的文件名

## 支持的注解

### Spring MVC 注解
- `@RestController` / `@Controller`
- `@RequestMapping` / `@GetMapping` / `@PostMapping` / `@PutMapping` / `@DeleteMapping`
- `@RequestParam` / `@PathVariable` / `@RequestBody` / `@RequestHeader`

### Swagger 2.x 注解
- `@Api` - Controller 描述
- `@ApiOperation` - 接口描述
- `@ApiParam` - 参数描述
- `@ApiModel` - 实体类描述
- `@ApiModelProperty` - 字段描述

### Swagger 3.x (OpenAPI) 注解
- `@Tag` - Controller 描述
- `@Operation` - 接口描述
- `@Parameter` - 参数描述
- `@Schema` - 实体类/字段描述

### Jakarta Validation 注解
- `@NotNull` / `@NotBlank` / `@NotEmpty` - 必填标记
- `@Size` / `@Min` / `@Max` - 长度/范围约束
- `@Email` / `@Pattern` - 格式校验

## 智能特性

### 1. 自动推断描述
如果没有 Swagger 注解，从以下位置提取描述：
- 方法上方的 Javadoc 注释
- 参数的行内注释
- 字段的行内注释

### 2. 示例数据生成
根据字段类型和约束自动生成合理的示例值：
- `String` → "示例文本"
- `Integer` + `@Min(1)` + `@Max(100)` → 50
- `@Email` → "example@test.com"
- `LocalDateTime` → "2024-01-01 12:00:00"

### 3. 嵌套对象展开
自动展开嵌套对象的层级结构：
```
data
└─ user
   └─ id
   └─ profile
      └─ avatar
      └─ nickname
```

### 4. 泛型处理
智能处理泛型响应：
- `Result<User>` → 展开 User 的字段
- `List<User>` → 标注为数组并展开元素结构
- `Page<User>` → 展开分页结构

## 使用场景

### 场景 1：新接口开发完成
```
我刚写完用户管理模块的接口，帮我生成 UserController 的接口文档
```

### 场景 2：提供给三方对接
```
需要对接外部系统，生成 api.controller 包下所有接口的详细文档
```

### 场景 3：项目交接
```
生成整个项目的API文档，要详细版，包含所有字段说明和示例
```

### 场景 4：快速查看接口
```
生成 OrderController 的简洁版文档，只要接口列表和参数
```

## 输出格式选项

### 简洁版
- 接口列表表格
- 基本的请求/响应参数
- 无示例代码

### 标准版（默认）
- 完整的参数表格
- 请求/响应 JSON 示例
- 基础错误码说明

### 详细版
- 所有字段的详细描述
- 字段约束说明（长度、范围等）
- 完整的错误码列表
- 接口调用注意事项

## 高级功能

### 1. 批量生成
支持按模块批量生成，自动分组：
- 按 Controller 所在包分组
- 按 `@Api(tags="xxx")` 分组
- 自定义分组规则

### 2. 增量更新
如果已有文档：
- 识别新增/修改/删除的接口
- 保留用户手动添加的内容
- 生成变更说明

### 3. 导出格式
除了 Markdown，还可导出为：
- HTML（带样式，可直接发送）
- PDF（正式文档）
- Postman Collection（可导入测试）

### 4. 自定义模板
支持用户自定义文档模板：
- 公司 Logo 和标准格式
- 特定的章节顺序
- 额外的说明章节

## 注意事项

1. **代码规范性**
   - 建议使用 Swagger 注解完善接口描述
   - 实体类字段加上注释
   - 使用标准的响应包装类

2. **复杂类型处理**
   - Map 类型会标注为对象，但无法展开字段
   - 建议使用明确的实体类而非 Map

3. **权限和安全**
   - 敏感接口添加权限说明
   - 密码等字段不生成示例值

4. **版本管理**
   - 重大变更时生成新版本文档
   - 保留历史版本便于回溯

## 最佳实践

1. **定期更新文档**
   - 每次接口变更后重新生成
   - 使用版本号标识文档版本

2. **配合 Swagger 使用**
   - 开发时用 Swagger UI 调试
   - 交付时生成 Markdown 文档

3. **文档评审**
   - 生成后人工检查关键接口
   - 补充业务逻辑说明

4. **统一响应格式**
   - 在文档开头说明通用响应结构
   - 各接口只说明 data 部分

5. **示例数据真实性**
   - 使用真实业务场景的示例
   - 避免 "test"、"123" 等无意义值
