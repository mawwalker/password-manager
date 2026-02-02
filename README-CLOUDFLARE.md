# Password Manager - Cloudflare Worker 版本

这是密码管理器的 Cloudflare Worker 版本，使用 JavaScript/Node.js 重构，完全保留了原 Python 版本的密码生成算法。

## ✨ 特性

- 🔐 **算法一致性**: 与 Python 版本生成完全相同的密码
- ⚡ **边缘计算**: 部署在 Cloudflare 全球网络，访问速度快
- 🌐 **无服务器**: 无需维护服务器，自动扩展
- 💰 **免费额度**: Cloudflare Workers 提供慷慨的免费额度
- 🎨 **现代界面**: 美观的 Web 界面

## 🚀 快速开始

### 本地开发

1. **安装依赖**
   ```bash
   npm install
   ```

2. **本地运行**
   ```bash
   npm run dev
   ```
   
   访问 `http://localhost:8787` 查看界面

### 部署到 Cloudflare

1. **登录 Cloudflare**
   ```bash
   npx wrangler login
   ```

2. **部署**
   ```bash
   npm run deploy
   ```

3. **查看日志**
   ```bash
   npm run tail
   ```

## 📡 API 接口

### 生成密码

**端点**: `POST /api/generate`

**请求体**:
```json
{
  "rem_name": "qq",
  "length": 16,
  "key": "your-master-key"
}
```

**响应**:
```json
{
  "password": "aB3$xY9@mN2&qP5!"
}
```

**示例**:
```bash
curl -X POST https://your-worker.workers.dev/api/generate \
  -H "Content-Type: application/json" \
  -d '{"rem_name":"qq","length":16,"key":"your-master-key"}'
```

## 🔧 配置

编辑 `wrangler.toml` 文件来配置你的 Worker:

```toml
name = "password-manager"  # 修改为你的 Worker 名称
main = "worker.js"
compatibility_date = "2024-01-01"

# 可选: 配置自定义域名
# routes = [
#   { pattern = "password.example.com", custom_domain = true }
# ]
```

## 🔐 密码生成算法

算法与 Python 版本完全一致:

1. **哈希生成**: 将 `rem_name` 插入到 `key` 的每个字符之间，然后进行 MD5 哈希
2. **字符选择**: 使用 MD5 哈希的子串作为随机种子，从字符集中选择字符
3. **字符集**: 包含数字、大小写字母和特殊符号（与 Python 版本完全相同）

**重要**: 相同的输入（网站名、长度、主密钥）永远生成相同的密码。

## 📝 从 Python 版本迁移

如果你之前使用 Python 版本，可以放心迁移到这个 Cloudflare Worker 版本:

- ✅ 密码生成算法完全相同
- ✅ 所有之前生成的密码仍然有效
- ✅ API 接口参数相同
- ✅ 只需要使用相同的主密钥即可

## 🛡️ 安全建议

1. **主密钥安全**: 请妥善保管你的主密钥，不要与他人分享
2. **HTTPS**: Cloudflare Workers 自动提供 HTTPS 加密
3. **本地计算**: 密码在 Worker 中生成，不会被存储
4. **开源透明**: 代码完全开源，可以自行审计

## 📦 项目结构

```
password-manager/
├── worker.js           # Cloudflare Worker 主文件
├── wrangler.toml       # Wrangler 配置文件
├── package.json        # Node.js 依赖配置
└── README-CLOUDFLARE.md # 本文档
```

## 🔄 与 Python 版本对比

| 特性 | Python 版本 | Cloudflare Worker 版本 |
|------|------------|----------------------|
| 部署方式 | 传统服务器 | 边缘计算/无服务器 |
| 语言 | Python + Flask | JavaScript/Node.js |
| 密码算法 | ✅ | ✅ (完全相同) |
| 访问速度 | 取决于服务器位置 | 全球 CDN 加速 |
| 维护成本 | 需要维护服务器 | 零维护 |
| 扩展性 | 手动扩展 | 自动扩展 |

## 💡 使用提示

- 建议密码长度设置为 12-20 位
- 为不同网站使用不同的 `rem_name`
- 主密钥应该足够复杂且容易记忆
- 可以在浏览器中收藏 Worker URL 方便访问

## 📄 许可证

与原 Python 版本保持一致。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**注意**: 这是从 Python Flask 版本重构而来的 Cloudflare Worker 版本，密码生成逻辑保持 100% 一致。
