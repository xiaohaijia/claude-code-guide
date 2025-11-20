# Git 初始化并推送远程仓库

请执行以下任务来初始化本地 Git 仓库并推送到远程：

## 参数验证

首先检查用户是否提供了远程仓库地址参数。如果没有提供，**立即报错并停止执行**，提示用户：

```
错误：缺少远程仓库地址参数
用法：/git-init-remote <远程仓库地址>
示例：/git-init-remote https://github.com/username/repo.git
```

## 执行步骤

如果用户提供了远程仓库地址参数（记为 $REMOTE_URL），按以下顺序执行：

### 1. 检查当前状态
- 运行 `git status` 检查是否已经是 git 仓库
- 如果已经是 git 仓库，询问用户是否要继续（这可能会覆盖现有配置）

### 2. 初始化仓库
```bash
git init
```

### 3. 添加所有文件
```bash
git add .
```

### 4. 生成规范的提交信息
- 运行 `git status` 和 `git diff --cached` 查看变更
- 分析项目内容，确定提交类型：
  - `feat`: 新功能、新项目初始化
  - `fix`: 修复bug
  - `refactor`: 代码重构
  - `docs`: 文档更新
  - `style`: 代码格式调整
  - `test`: 测试相关
  - `chore`: 构建/工具配置等
- 对于全新项目初始化，使用 `feat: 初始化项目` 或 `chore: 项目初始化`
- 生成简洁明确的中文提交信息

### 5. 创建提交
使用本地 Git 配置的用户名和邮箱进行提交（**不要**使用任何 Claude Code 署名）：
```bash
git commit -m "提交信息"
```

**重要**：
- 不要在提交信息中添加 "Generated with Claude Code" 或 "Co-Authored-By: Claude" 等署名
- 使用本地 git config 中的用户信息

### 6. 添加远程仓库
```bash
git remote add origin $REMOTE_URL
```

### 7. 确保使用 main 分支
```bash
git branch -M main
```

### 8. 推送到远程
```bash
git push -u origin main
```

## 执行原则

1. **严格校验参数**：如果没有远程仓库地址，立即停止
2. **使用本地配置**：所有 git 操作使用本地的 git config，不添加 Claude 相关署名
3. **规范提交信息**：遵循 Conventional Commits 规范
4. **错误处理**：如果任何步骤失败，向用户说明具体错误并停止后续操作
5. **顺序执行**：使用 `&&` 连接相关命令确保前一步成功才执行下一步

## 完成后

向用户报告：
- 初始化结果
- 提交信息
- 远程仓库地址
- 推送状态
