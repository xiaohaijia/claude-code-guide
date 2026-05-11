# 模板规格参考

本文档定义了公众号排版模板的所有 CSS 类、HTML 片段结构、元素映射规则和组合约束。

---

## 一、CSS 类速查表

| 类名/标签 | 视觉效果 | 语义用途 | 出现次数 |
|---|---|---|---|
| `.top-decor` | 50px 宽、3px 高的茶绿色圆角横线 | 文章顶部装饰 | 恰好 1 个 |
| `h1` | 26px 深色粗体标题，底部 40px 茶绿色下划线 | 文章主标题 | 恰好 1 个 |
| `.intro-para` | 浅绿底色 + 左 4px 茶绿竖线，15px 斜体 | 导语/摘要/主题引入 | 0~1 个 |
| `p` | 16px 两端对齐正文，段间距 18px | 普通正文段落 | 任意 |
| `strong` | 深绿色加粗（嵌套在 p 内） | 关键论点/核心观点 | 按需 |
| `.emphasize` | 茶绿色渐变下划线高亮（嵌套在 p 内） | 需要视觉突出的重点短语 | 按需 |
| `.section-number` | 36px 大号褪色衬线数字 | 分节编号（01、02...） | 按分节数量 |
| `.section-title` | 20px 深色粗体 + 右侧延伸横线 | 分节标题 | 跟 section-number 配对 |
| `.insight-card` | 浅绿圆角卡片，左上装饰引号 | 金句/感悟/诗意内容 | 按需 |
| `.dream-list` | 无序列表，每项前有 🌿 图标 | 3 个及以上条目的列举 | 按需 |
| `.closing-card` | 渐变绿底圆角卡片，内含 final-word | 文章结尾升华总结 | 恰好 1 个 |
| `.final-word` | 白底圆角胶囊按钮样式 | 结尾点睛之笔（在 closing-card 内） | 恰好 1 个 |
| `.divider-deco` | 居中文字 + 两侧短横线分隔 | 文末感谢语装饰 | 恰好 1 个 |

---

## 二、HTML 片段模板

以下为每个元素的精确 HTML 结构，`{{}}` 内为占位符。

### 顶部装饰线
```html
<div class="top-decor"></div>
```

### 主标题
```html
<h1>{{文章标题}}</h1>
```

### 导语段落
```html
<div class="intro-para">
    {{导语内容，通常 1-3 句摘要或主题引入}}
</div>
```

### 普通正文段落
```html
<p>{{段落内容}}</p>
```

### 含加粗强调的段落
```html
<p>前面文字<strong>关键论点加粗</strong>后面文字。</p>
```

### 含下划线高亮的段落
```html>
<p>前面文字<span class="emphasize">需要突出的重点短语</span>后面文字。</p>
```

### 分节（编号 + 标题）
```html
<div class="section-number">{{编号，如 01}}</div>
<div class="section-title">{{分节标题}}</div>
```

非编号分节（如"写在最后"）：
```html
<div class="section-number" style="font-size: 28px; margin-top: 44px;">写在最后</div>
```

### 金句/感悟卡片
```html
<div class="insight-card">
    {{第一行}}<br>
    {{第二行}}<br>
    {{第三行}}
</div>
```

### 列表
```html
<ul class="dream-list">
    <li>{{列表项 1}}</li>
    <li>{{列表项 2}}</li>
    <li>{{列表项 3}}</li>
</ul>
```

### 结尾升华卡片
```html
<div class="closing-card">
    <p style="font-size: 16px;">{{总结句 1}}</p>
    <p style="font-size: 16px;">{{总结句 2}}</p>
    <p style="margin-top: 12px;">{{过渡句}}</p>
    <p>{{铺垫句}}</p>
    <div class="final-word">{{点睛之笔}}</div>
</div>
```

### 分隔装饰
```html
<div class="divider-deco">· 谢谢你看到这里 ·</div>
```

---

## 三、元素映射规则

### 识别规则：原始内容 → HTML 元素

| 原始内容特征 | 应映射到 | 判断依据 |
|---|---|---|
| 文章第一行，或明确标注的标题 | `<h1>` | 通常是最短的一行，独立成行 |
| 文章开头 1-3 句摘要/总起句 | `.intro-para` | 概括全文主题的引入性段落 |
| "01"、"第一"、"1." 等编号开头的段落 | `.section-number` + `.section-title` | 显式编号标记 |
| `##` Markdown 标题 | `.section-title` | 二级标题 |
| `**加粗**` 文本 | `<strong>` | Markdown 加粗语法或明确的核心观点 |
| 诗歌式排比、感悟、人生哲理 | `.insight-card` | 短句分行、情感/哲理性质 |
| `- 项目` 或连续的并列短句 | `.dream-list` | 3 个及以上并列项 |
| 文末总结、升华、呼吁 | `.closing-card` | "最后"、"总结"、"写在最后"等标记 |
| 最后一句点睛之笔 | `.final-word` | 放在 closing-card 内 |
| 其他普通文本 | `<p>` | 默认 |

### 强调判断优先级

1. `**加粗**` → `<strong>`
2. 作者特别想突出的短语（比喻、转折、结论）→ `<span class="emphasize">`
3. 其余保持普通文本

---

## 四、组合规则与约束

### 允许的嵌套

- `<strong>` 可嵌套在 `<p>` 内
- `<span class="emphasize">` 可嵌套在 `<p>` 内
- `<br>` 可用在 `.insight-card` 内换行
- `<li>` 必须在 `<ul class="dream-list">` 内
- `.final-word` 必须在 `.closing-card` 内
- `<p>` 可出现在 `.closing-card` 内（带内联样式）

### 禁止的嵌套

- `.insight-card` 内不能嵌套 `<p>`，只用 `<br>` 换行
- `.dream-list` 内不能有嵌套列表
- `<h1>` 只出现一次
- `.intro-para` 最多一个

### 严格排序

```
1. .top-decor          （固定第一个）
2. h1                  （固定第二个）
3. .intro-para         （可选，第三个）
4. p*                  （标题后、第一节前的过渡段落）
5. 重复以下结构块：
   .section-number + .section-title
   p* + .insight-card? + .dream-list?
6. .closing-card       （固定倒数第二个）
7. .divider-deco       （固定最后一个）
```

---

## 五、文章类型适配

### A. 列表式（"N 件事"）
特征：有明确的编号分节（01、1.、第一等）
处理：每个编号项 → `section-number` + `section-title`，内容正常映射

### B. 叙事式/散文
特征：流畅文本，无明确编号分节
处理：根据主题转折将文本分为 2-4 个段落组，每组用 `section-title` 分隔（无 `section-number`）

### C. 金句密集型
特征：大量短句、格言、诗意内容
处理：频繁使用 `insight-card`，连接文字用 `<p>`

### D. 混合/通用
处理：按顺序处理，标题/主题切换处用 `section-title`，自动识别金句和列表
