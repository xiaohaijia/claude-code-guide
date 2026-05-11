---
name: wechat-article-formatter
description: "将原始文章内容（纯文本或Markdown）自动排版为茶绿色风格的微信公众号HTML文章。当用户要求'公众号排版'、'微信文章排版'、'格式化文章'、'文章排版'、或需要将文本内容转为精美排版的公众号HTML页面时使用此skill。"
---

# 微信公众号文章自动排版

将用户提供的原始文章内容，自动分析结构并套用茶绿色风格 HTML 模板，生成可直接用于微信公众号的排版 HTML 文件。

## Workflow

### Step 1: 加载模板资源

读取 skill 目录下的模板文件，提取完整 CSS 样式：

1. 定位 skill 目录：
```bash
skill_dir=""
for base in "${AGENTS_HOME:-$HOME/.agents}" "${CLAUDE_HOME:-$HOME/.claude}"; do
  if [ -d "$base/skills/wechat-article-formatter" ]; then
    skill_dir="$base/skills/wechat-article-formatter"
    break
  fi
done
```

2. 读取 `assets/template.html`，提取其中完整的 `<style>...</style>` 块，用于嵌入输出 HTML。
3. 参考 `references/template-spec.md` 获取元素映射规则和 HTML 片段模板。

### Step 2: 分析用户内容

接收用户传入的原始文章内容（纯文本、Markdown 或半结构化文本），执行以下分析：

1. **提取标题**：文章第一行 / `# 标题` / 明确标注的标题 → 映射为 `<h1>`
2. **提取导语**：文章开头概括主题的 1-3 句话 → 映射为 `.intro-para`
3. **识别分节**：
   - 编号标记（01、1.、第一、其一）→ `section-number` + `section-title`
   - `##` Markdown 标题 → `section-title`
   - 无显式标记时，根据主题转折自然分段
4. **识别内容类型**：
   - 普通叙述 → `<p>`
   - `**加粗**` 或核心论点 → `<strong>`（嵌套在 `<p>` 内）
   - 需要视觉突出的关键短语 → `<span class="emphasize">`（嵌套在 `<p>` 内）
   - 诗歌式排比/人生哲理/感悟 → `.insight-card`
   - 3 个及以上并列项 → `<ul class="dream-list">`
5. **识别结尾**：
   - "最后"、"总结"、"写在最后"等标记后的内容 → `.closing-card`
   - 文章最后一句话（点睛之笔）→ `.final-word`（在 closing-card 内）

### Step 3: 判断文章类型

根据内容结构特征，选择对应的排版策略：

- **列表式**（有明确编号分节）→ 每个编号项用 `section-number` + `section-title`
- **叙事式**（流畅文本，无编号）→ 按主题转折分组，用 `section-title` 分隔
- **金句密集型**（大量短句格言）→ 频繁使用 `insight-card`
- **混合型**（默认）→ 按顺序映射，自动识别各元素类型

### Step 4: 生成 HTML 文件

组装完整的 HTML 文档，严格遵循以下结构：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <title>{文章标题}</title>
    <style>
        /* 从 assets/template.html 完整复制的 CSS */
    </style>
</head>
<body>
    <div class="article-wrap">
        <div class="top-decor"></div>
        <h1>{文章标题}</h1>
        <div class="intro-para">{导语}</div>
        <!-- 正文内容，按分析结果映射 -->
        ...
        <div class="closing-card">
            ...
            <div class="final-word">{点睛之笔}</div>
        </div>
        <div class="divider-deco">· 谢谢你看到这里 ·</div>
    </div>
</body>
</html>
```

**元素严格排序**：top-decor → h1 → intro-para → p/section-blocks → closing-card → divider-deco

## Content Parsing Rules

### 标题识别
- 独立成行的短文本（<30字），位于文章开头
- Markdown `#` 标题
- 如果没有明确标题，从内容主题中合成一个

### 导语识别
- 紧跟标题之后、第一节之前的内容
- 概括全文主题的 1-3 句话
- 如果没有明确导语，可以跳过此元素

### 金句/感悟识别
- 短句分行排列（诗歌结构）
- 包含人生哲理、感悟、警句的内容
- 带有排比或递进结构的情感文字

### 列表识别
- Markdown `-` 或 `*` 列表项
- 连续 3 个及以上并列短语/短句
- 少于 3 个并列项时，合并为 `<p>` 内用句号分隔的文本

### 强调识别
- `**text**` → `<strong>text</strong>`（深绿色加粗，用于核心论点）
- 作者特别想突出的短语 → `<span class="emphasize">短语</span>`（绿色渐变下划线）
- 每段最多标记 1-2 处强调，避免过度使用

## Output

- 文件名：从文章标题派生，去除特殊字符（`\ / : * ? " < > |`），保留中英文字母和数字
- 后缀：`.html`
- 保存位置：用户当前工作目录
- 编码：UTF-8
- CSS 完全内联（`<style>` 块），无外部依赖，可直接在浏览器打开预览

## Limitations

- 不支持代码块、表格等复杂排版元素
- 专为中文微信公众号移动端阅读优化
- 使用内联 CSS，不依赖外部资源
- 模板为茶绿色散文风格，适合情感/生活/成长类文章

## 关联资源

- **元素映射与 HTML 片段参考**：`references/template-spec.md`
- **原始 CSS 模板**：`assets/template.html`
