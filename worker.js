import crypto from 'node:crypto';

// Exact same base_str as Python version - including the duplicate '0' at the beginning
const BASE_STR = [
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k',
  'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
  'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G',
  'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R',
  'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', ',', '.', '~',
  '!', '@', '#', '$', '%', '^', '&', '*', ';', ':', '?'
];

/**
 * Python-compatible Random implementation (MT19937)
 * Matches Python's random module behavior exactly, including:
 * - SHA-512 hashing for string seeds
 * - init_by_array for big integer seeds
 * - Proper randbelow with rejection sampling
 */
class PythonRandom {
  constructor() {
    this.N = 624;
    this.M = 397;
    this.MATRIX_A = 0x9908b0df;
    this.UPPER_MASK = 0x80000000;
    this.LOWER_MASK = 0x7fffffff;
    this.mt = new Array(this.N);
    this.mti = this.N + 1;
  }

  init_genrand(s) {
    this.mt[0] = s >>> 0;
    for (this.mti = 1; this.mti < this.N; this.mti++) {
      const s = this.mt[this.mti - 1] ^ (this.mt[this.mti - 1] >>> 30);
      this.mt[this.mti] = (((((s & 0xffff0000) >>> 16) * 1812433253) << 16) +
        (s & 0x0000ffff) * 1812433253) + this.mti;
      this.mt[this.mti] >>>= 0;
    }
  }

  init_by_array(init_key, key_length) {
    this.init_genrand(19650218);
    let i = 1;
    let j = 0;
    let k = (this.N > key_length ? this.N : key_length);

    for (; k; k--) {
      const s = this.mt[i - 1] ^ (this.mt[i - 1] >>> 30);
      this.mt[i] = (this.mt[i] ^ (((((s & 0xffff0000) >>> 16) * 1664525) << 16) +
        ((s & 0x0000ffff) * 1664525))) + init_key[j] + j;
      this.mt[i] >>>= 0;
      i++;
      j++;
      if (i >= this.N) {
        this.mt[0] = this.mt[this.N - 1];
        i = 1;
      }
      if (j >= key_length) j = 0;
    }

    for (k = this.N - 1; k; k--) {
      const s = this.mt[i - 1] ^ (this.mt[i - 1] >>> 30);
      this.mt[i] = (this.mt[i] ^ (((((s & 0xffff0000) >>> 16) * 1566083941) << 16) +
        ((s & 0x0000ffff) * 1566083941))) - i;
      this.mt[i] >>>= 0;
      i++;
      if (i >= this.N) {
        this.mt[0] = this.mt[this.N - 1];
        i = 1;
      }
    }

    this.mt[0] = 0x80000000;
  }

  bigIntToUint32Array(bigInt) {
    if (bigInt === 0n) {
      return [0];
    }

    const bitLength = bigInt.toString(2).length;
    let byteLength = Math.ceil(bitLength / 8);

    const bytes = [];
    let remaining = bigInt;
    for (let i = 0; i < byteLength; i++) {
      bytes.push(Number(remaining & 0xFFn));
      remaining >>= 8n;
    }

    while (bytes.length % 4 !== 0) {
      bytes.push(0);
    }

    const result = [];
    for (let i = 0; i < bytes.length; i += 4) {
      const val = bytes[i] | (bytes[i + 1] << 8) | (bytes[i + 2] << 16) | (bytes[i + 3] << 24);
      result.push(val >>> 0);
    }

    return result;
  }

  pythonStringSeed(str) {
    const strBytes = Buffer.from(str, 'utf8');
    const hash = crypto.createHash('sha512');
    hash.update(strBytes);
    const hashBytes = hash.digest();

    const combined = Buffer.concat([strBytes, hashBytes]);

    let bigIntValue = 0n;
    for (let i = 0; i < combined.length; i++) {
      bigIntValue = (bigIntValue << 8n) | BigInt(combined[i]);
    }

    return bigIntValue;
  }

  seed(s) {
    if (typeof s === 'string') {
      const bigIntSeed = this.pythonStringSeed(s);
      const keyArray = this.bigIntToUint32Array(bigIntSeed);
      this.init_by_array(keyArray, keyArray.length);
    } else if (typeof s === 'number') {
      this.init_genrand(s);
    } else {
      this.init_genrand(5489);
    }
  }

  genrand_uint32() {
    let y;
    const mag01 = [0x0, this.MATRIX_A];

    if (this.mti >= this.N) {
      let kk;

      if (this.mti === this.N + 1) {
        this.init_genrand(5489);
      }

      for (kk = 0; kk < this.N - this.M; kk++) {
        y = (this.mt[kk] & this.UPPER_MASK) | (this.mt[kk + 1] & this.LOWER_MASK);
        this.mt[kk] = this.mt[kk + this.M] ^ (y >>> 1) ^ mag01[y & 0x1];
      }

      for (; kk < this.N - 1; kk++) {
        y = (this.mt[kk] & this.UPPER_MASK) | (this.mt[kk + 1] & this.LOWER_MASK);
        this.mt[kk] = this.mt[kk + (this.M - this.N)] ^ (y >>> 1) ^ mag01[y & 0x1];
      }

      y = (this.mt[this.N - 1] & this.UPPER_MASK) | (this.mt[0] & this.LOWER_MASK);
      this.mt[this.N - 1] = this.mt[this.M - 1] ^ (y >>> 1) ^ mag01[y & 0x1];

      this.mti = 0;
    }

    y = this.mt[this.mti++];

    y ^= (y >>> 11);
    y ^= (y << 7) & 0x9d2c5680;
    y ^= (y << 15) & 0xefc60000;
    y ^= (y >>> 18);

    return y >>> 0;
  }

  getrandbits(k) {
    if (k <= 32) {
      return this.genrand_uint32() >>> (32 - k);
    }

    const words = Math.ceil(k / 32);
    let result = 0;
    let bitsRemaining = k;

    for (let i = 0; i < words; i++) {
      const bits = Math.min(32, bitsRemaining);
      const val = this.genrand_uint32() >>> (32 - bits);
      result = (result * (2 ** bits)) + val;
      bitsRemaining -= bits;
    }

    return result;
  }

  randbelow(n) {
    const k = Math.ceil(Math.log2(n));
    let r = this.getrandbits(k);
    while (r >= n) {
      r = this.getrandbits(k);
    }
    return r;
  }

  randint(a, b) {
    return a + this.randbelow(b - a + 1);
  }
}

/**
 * Password generator class - exact port of Python implementation
 */
class PasswordGenerator {
  constructor(remName, length, key) {
    this.remName = remName;
    this.length = parseInt(length);
    this.key = key;
    this.md5Str = '';
  }

  /**
   * Generate MD5 hash - exact same logic as Python version
   * Python: string = self.rem_name.join(self.key)
   * This means: insert rem_name between each character of key
   */
  genHash() {
    // Python's str.join() inserts the string between each character
    // e.g., 'qq'.join('abc') = 'aqqbqqc'
    const string = this.key.split('').join(this.remName);

    const hash = crypto.createHash('md5');
    hash.update(string, 'utf8');
    this.md5Str = hash.digest('hex');
  }

  /**
   * Random character selection - exact same logic as Python version
   */
  randomChoose() {
    const result = [];
    for (let i = 0; i < this.length; i++) {
      // Use substring of MD5 hash as seed (same as Python)
      const seed = this.md5Str.substring(0, i);
      const rng = new PythonRandom();
      rng.seed(seed);
      const index = rng.randint(0, BASE_STR.length - 1);
      result.push(BASE_STR[index]);
    }
    return result.join('');
  }

  /**
   * Generate password - main entry point
   */
  generate() {
    this.genHash();
    return this.randomChoose();
  }
}

/**
 * HTML interface for the password manager
 */
const HTML_PAGE = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>密码管理器 - Password Manager</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .container {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-width: 500px;
      width: 100%;
      backdrop-filter: blur(10px);
    }

    h1 {
      color: #333;
      margin-bottom: 10px;
      font-size: 28px;
      text-align: center;
    }

    .subtitle {
      color: #666;
      text-align: center;
      margin-bottom: 30px;
      font-size: 14px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      color: #555;
      margin-bottom: 8px;
      font-weight: 500;
      font-size: 14px;
    }

    input {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      font-size: 15px;
      transition: all 0.3s ease;
      background: white;
    }

    input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    button {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-top: 10px;
    }

    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
    }

    button:active {
      transform: translateY(0);
    }

    .result {
      margin-top: 30px;
      padding: 20px;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      border-radius: 10px;
      display: none;
    }

    .result.show {
      display: block;
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .result-label {
      color: #555;
      font-size: 14px;
      margin-bottom: 10px;
      font-weight: 500;
    }

    .password-display {
      background: white;
      padding: 15px;
      border-radius: 8px;
      font-family: 'Courier New', monospace;
      font-size: 18px;
      color: #333;
      word-break: break-all;
      border: 2px solid #667eea;
      position: relative;
    }

    .copy-btn {
      margin-top: 10px;
      background: #4caf50;
      padding: 10px;
      font-size: 14px;
    }

    .copy-btn:hover {
      background: #45a049;
    }

    .error {
      color: #f44336;
      font-size: 14px;
      margin-top: 10px;
      display: none;
    }

    .error.show {
      display: block;
    }

    .info {
      background: #e3f2fd;
      padding: 15px;
      border-radius: 10px;
      margin-top: 20px;
      font-size: 13px;
      color: #1976d2;
      border-left: 4px solid #2196f3;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔐 密码管理器</h1>
    <p class="subtitle">Password Manager</p>
    
    <form id="passwordForm">
      <div class="form-group">
        <label for="remName">网站/应用名称 (Site Name)</label>
        <input type="text" id="remName" name="remName" placeholder="例如: qq, github, twitter" required>
      </div>

      <div class="form-group">
        <label for="length">密码长度 (Password Length)</label>
        <input type="number" id="length" name="length" value="16" min="6" max="32" required>
      </div>

      <div class="form-group">
        <label for="key">主密钥 (Master Key)</label>
        <input type="password" id="key" name="key" placeholder="你的主密钥" required>
      </div>

      <button type="submit">生成密码 (Generate Password)</button>
    </form>

    <div class="error" id="error"></div>

    <div class="result" id="result">
      <div class="result-label">生成的密码 (Generated Password):</div>
      <div class="password-display" id="password"></div>
      <button class="copy-btn" id="copyBtn">📋 复制密码 (Copy Password)</button>
    </div>

    <div class="info">
      💡 提示: 使用相同的网站名称、密码长度和主密钥，每次都会生成相同的密码。请妥善保管你的主密钥！
    </div>
  </div>

  <script>
    const form = document.getElementById('passwordForm');
    const resultDiv = document.getElementById('result');
    const passwordDiv = document.getElementById('password');
    const errorDiv = document.getElementById('error');
    const copyBtn = document.getElementById('copyBtn');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const data = {
        rem_name: formData.get('remName'),
        length: formData.get('length'),
        key: formData.get('key')
      };

      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
          passwordDiv.textContent = result.password;
          resultDiv.classList.add('show');
          errorDiv.classList.remove('show');
        } else {
          errorDiv.textContent = result.error || '生成密码失败';
          errorDiv.classList.add('show');
          resultDiv.classList.remove('show');
        }
      } catch (error) {
        errorDiv.textContent = '网络错误: ' + error.message;
        errorDiv.classList.add('show');
        resultDiv.classList.remove('show');
      }
    });

    copyBtn.addEventListener('click', () => {
      const password = passwordDiv.textContent;
      navigator.clipboard.writeText(password).then(() => {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✅ 已复制! (Copied!)';
        setTimeout(() => {
          copyBtn.textContent = originalText;
        }, 2000);
      });
    });
  </script>
</body>
</html>`;

/**
 * Main Cloudflare Worker handler
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Serve HTML interface
    if (url.pathname === '/' && request.method === 'GET') {
      return new Response(HTML_PAGE, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          ...corsHeaders,
        },
      });
    }

    // API endpoint for password generation
    if (url.pathname === '/api/generate' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { rem_name, length, key } = body;

        // Validate inputs
        if (!rem_name || !length || !key) {
          return new Response(
            JSON.stringify({ error: 'Missing required parameters: rem_name, length, key' }),
            {
              status: 400,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders,
              },
            }
          );
        }

        // Generate password
        const generator = new PasswordGenerator(rem_name, length, key);
        const password = generator.generate();

        return new Response(
          JSON.stringify({ password }),
          {
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({ error: 'Invalid request: ' + error.message }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      }
    }

    // 404 for other routes
    return new Response('Not Found', {
      status: 404,
      headers: corsHeaders,
    });
  },
};
