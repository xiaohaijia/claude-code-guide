/**
 * Claude Code 全局 PreToolUse Hook
 *
 * 作用：在工具执行前进行权限检查和安全拦截
 * 优先级：最高（在 deny/allow/ask 规则之前执行）
 *
 * 返回格式：
 * - { allowed: true } - 允许执行
 * - { allowed: false, reason: "原因" } - 拒绝执行
 */

export async function preToolUse(context) {
  const { tool, parameters } = context;

  // ==================== 文件读写保护 ====================
  if (tool === 'Read' || tool === 'Write' || tool === 'Edit') {
    const filePath = parameters.file_path || '';

    // 敏感文件模式（不区分大小写）
    const sensitivePatterns = [
      // 环境变量和密钥
      /\.env$/i,
      /\.env\./i,
      /\.key$/i,
      /\.pem$/i,
      /\.p12$/i,
      /\.pfx$/i,

      // 凭证和密码
      /credentials/i,
      /password/i,
      /secret/i,
      /token/i,
      /auth.*key/i,

      // SSH 和证书
      /id_rsa/i,
      /id_dsa/i,
      /id_ecdsa/i,
      /\.ssh[/\\].*_rsa/i,

      // 数据库配置
      /database\.yml/i,
      /db\.conf/i,

      // AWS/云服务
      /\.aws[/\\]credentials/i,
      /\.azure/i,

      // Git 凭证
      /\.git-credentials/i,
      /\.netrc/i
    ];

    for (const pattern of sensitivePatterns) {
      if (pattern.test(filePath)) {
        return {
          allowed: false,
          reason: `🚫 安全拦截：拒绝访问敏感文件\n文件: ${filePath}\n原因: 该文件可能包含敏感信息（密钥、密码、凭证等）`
        };
      }
    }

    // 阻止写入敏感目录
    if (tool === 'Write' || tool === 'Edit') {
      const sensitiveWritePaths = [
        /[/\\]\.git[/\\]config/i,
        /[/\\]\.ssh[/\\]/i,
        /[/\\]System32[/\\]/i,
        /^C:[/\\]Windows[/\\]/i
      ];

      for (const pattern of sensitiveWritePaths) {
        if (pattern.test(filePath)) {
          return {
            allowed: false,
            reason: `🚫 安全拦截：禁止写入系统敏感目录\n路径: ${filePath}`
          };
        }
      }
    }
  }

  // ==================== Bash 命令保护 ====================
  if (tool === 'Bash') {
    const command = parameters.command || '';

    // 极度危险命令 - 直接拦截
    const criticalDangerPatterns = [
      // 递归删除
      { pattern: /rm\s+-rf\s+[/\\]/i, reason: '递归删除根目录或重要路径' },
      { pattern: /del\s+\/[sS]\s+C:\\/i, reason: '删除 Windows 系统文件' },
      { pattern: /rmdir\s+\/[sS]\s+C:\\/i, reason: '删除 Windows 系统目录' },
      { pattern: /format\s+C:/i, reason: '格式化系统盘' },

      // 危险的网络操作
      { pattern: /curl.*\|\s*(sh|bash|powershell|cmd)/i, reason: '从网络下载并执行脚本' },
      { pattern: /wget.*\|\s*(sh|bash|powershell|cmd)/i, reason: '从网络下载并执行脚本' },
      { pattern: /Invoke-WebRequest.*\|\s*Invoke-Expression/i, reason: 'PowerShell 下载执行' },

      // 强制 Git 操作
      { pattern: /git\s+push\s+.*--force/i, reason: 'Git 强制推送' },
      { pattern: /git\s+push\s+.*-f\s/i, reason: 'Git 强制推送（-f）' },
      { pattern: /git\s+reset\s+--hard\s+HEAD~[2-9]/i, reason: '重置多个提交' },

      // 数据库危险操作
      { pattern: /DROP\s+DATABASE/i, reason: '删除数据库' },
      { pattern: /DROP\s+TABLE/i, reason: '删除数据表' },
      { pattern: /TRUNCATE\s+TABLE/i, reason: '清空数据表' },
      { pattern: /DELETE\s+FROM.*WHERE\s+1\s*=\s*1/i, reason: '删除所有数据' },

      // 系统关键操作
      { pattern: /shutdown/i, reason: '系统关机' },
      { pattern: /reboot/i, reason: '系统重启' },
      { pattern: /mkfs/i, reason: '创建文件系统（会清除数据）' }
    ];

    for (const { pattern, reason } of criticalDangerPatterns) {
      if (pattern.test(command)) {
        return {
          allowed: false,
          reason: `⛔ 极度危险命令被拦截\n命令: ${command}\n原因: ${reason}\n\n如果确实需要执行，请手动在终端中操作。`
        };
      }
    }

    // 高风险命令 - 需要特别注意
    const highRiskPatterns = [
      { pattern: /npm\s+publish/i, reason: '发布 NPM 包' },
      { pattern: /docker\s+rm.*-f/i, reason: '强制删除 Docker 容器' },
      { pattern: /docker\s+rmi.*-f/i, reason: '强制删除 Docker 镜像' },
      { pattern: /kill\s+-9/i, reason: '强制终止进程' },
      { pattern: /chmod\s+777/i, reason: '设置最宽松的文件权限' }
    ];

    for (const { pattern, reason } of highRiskPatterns) {
      if (pattern.test(command)) {
        console.warn(`⚠️ 高风险命令: ${command} (${reason})`);
        // 高风险命令允许执行，但会记录警告
      }
    }
  }

  // ==================== NotebookEdit 保护 ====================
  if (tool === 'NotebookEdit') {
    const notebookPath = parameters.notebook_path || '';

    // 防止修改重要的 notebook
    if (notebookPath.includes('backup') || notebookPath.includes('archive')) {
      console.warn(`⚠️ 正在修改备份/归档的 notebook: ${notebookPath}`);
    }
  }

  // ==================== WebFetch 保护 ====================
  if (tool === 'WebFetch') {
    const url = parameters.url || '';

    // 阻止访问内网地址
    const localNetworkPatterns = [
      /localhost/i,
      /127\.0\.0\.1/,
      /192\.168\./,
      /10\.\d+\.\d+\.\d+/,
      /172\.(1[6-9]|2\d|3[0-1])\./,
      /::1/,
      /file:\/\//i
    ];

    for (const pattern of localNetworkPatterns) {
      if (pattern.test(url)) {
        return {
          allowed: false,
          reason: `🚫 安全拦截：禁止访问内网地址\nURL: ${url}\n原因: 可能存在 SSRF 风险`
        };
      }
    }
  }

  // ==================== 默认允许 ====================
  return { allowed: true };
}

/**
 * PostToolUse Hook（可选）
 * 在工具执行后执行，可用于日志记录、审计等
 */
export async function postToolUse(context) {
  const { tool, parameters, result, error } = context;

  // 记录敏感操作
  const sensitiveTools = ['Write', 'Edit', 'Bash'];
  if (sensitiveTools.includes(tool)) {
    const timestamp = new Date().toISOString();
    console.log(`[Audit ${timestamp}] Tool: ${tool}, Success: ${!error}`);
  }

  return { allowed: true };
}
