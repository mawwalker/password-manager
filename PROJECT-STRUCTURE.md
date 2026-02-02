# 密码管理器 - 项目结构

## 📦 项目概述

这是一个确定性密码生成器，支持 Python 和 JavaScript (Cloudflare Workers) 两个版本。使用相同的输入参数，两个版本生成完全一致的密码。

## 📁 项目结构

```
password-manager/
├── app/                          # Python 原始版本（备份）
│   ├── app.py                    # Flask 应用主文件
│   ├── generate.py               # 密码生成核心逻辑
│   ├── test.py                   # Python 版本测试
│   ├── Dockerfile                # Docker 容器配置
│   └── ...                       # 其他 Python 相关文件
│
├── worker.js                     # Cloudflare Workers 主文件 ⭐
├── wrangler.toml                 # Cloudflare Workers 配置
├── test-password-generator.js   # JavaScript 版本测试文件
│
├── package.json                  # npm 依赖配置
├── package-lock.json             # npm 依赖锁定
│
├── passwd.service                # Python 版本 systemd 服务配置
│
├── README.md                     # 项目说明
└── README-CLOUDFLARE.md          # Cloudflare 部署说明
```

## 🚀 使用方法

### JavaScript 版本 (Cloudflare Workers)

**在线访问**: https://passwd.smartdeng.com

**本地测试**:
```bash
# 运行测试
node test-password-generator.js

# 部署到 Cloudflare Workers
npm run deploy
```

**核心文件**:
- `worker.js` - 主要实现文件，包含完整的密码生成逻辑
- `wrangler.toml` - 配置文件，包含自定义域名设置

### Python 版本 (备份/原始实现)

**本地测试**:
```bash
cd app
python test.py
```

**运行服务**:
```bash
# 使用 systemd
sudo systemctl start passwd

# 或直接运行
cd app
python app.py
```

## 🔑 密码生成算法

两个版本使用完全相同的算法：

1. **MD5 哈希**: 使用 `rem_name.join(key)` 生成 MD5 哈希
2. **Mersenne Twister (MT19937)**: 使用 Python 兼容的随机数生成器
3. **确定性种子**: 使用 SHA-512 + 原始字节生成大整数种子
4. **Rejection Sampling**: 确保均匀分布的随机数生成

## ✅ 兼容性验证

测试用例：
- Site: `steam`
- Length: `16`
- Key: `dsm980220`

结果：
- Python: `VsrPEQJH!oHV~xLT` ✅
- JavaScript: `VsrPEQJH!oHV~xLT` ✅

**完全匹配！**

## 📝 技术要点

- **Python 版本**: Flask + MT19937
- **JavaScript 版本**: Cloudflare Workers + Python-compatible MT19937
- **关键特性**:
  - SHA-512 字符串种子转换
  - init_by_array 大整数初始化
  - randbelow rejection sampling
  - 完整的 Python random 模块兼容性

## 🌐 部署信息

- **平台**: Cloudflare Workers
- **域名**: passwd.smartdeng.com
- **包大小**: 37.15 KiB / gzip: 9.78 KiB
- **启动时间**: 17 ms
- **兼容性标志**: nodejs_compat

## 📦 依赖

JavaScript:
- Node.js 内置模块: `crypto`
- Cloudflare Workers Runtime

Python:
- Flask
- hashlib
- random (标准库)

## 🔒 安全提示

1. 请妥善保管你的主密钥 (Master Key)
2. 使用相同的网站名称、长度和主密钥会生成相同的密码
3. 更改任何参数都会生成完全不同的密码
4. 建议使用强主密钥，并为不同用途使用不同的网站名称
