#!/usr/bin/env node
/**
 * FINAL FIX: Complete Python-compatible random implementation
 */

import crypto from 'node:crypto';

const BASE_STR = [
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k',
    'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
    'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G',
    'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R',
    'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', ',', '.', '~',
    '!', '@', '#', '$', '%', '^', '&', '*', ';', ':', '?'
];

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

    /**
     * Python's _randbelow implementation for integers
     */
    randbelow(n) {
        const k = Math.ceil(Math.log2(n));
        let r = this.getrandbits(k);
        while (r >= n) {
            r = this.getrandbits(k);
        }
        return r;
    }

    /**
     * Python's randint - returns random integer in [a, b] inclusive
     */
    randint(a, b) {
        return a + this.randbelow(b - a + 1);
    }
}

// ===== FINAL TEST =====
console.log('FINAL TEST: Python-compatible Random Implementation\n');
console.log('='.repeat(80));

// Test 1: Basic seeding
console.log('\nTest 1: Single randint() calls');
const testSeeds = ['', '8', '84', '84e', '84e4'];

testSeeds.forEach(seed => {
    const rng = new PythonRandom();
    rng.seed(seed);
    const val = rng.randint(0, 71);
    const char = BASE_STR[val];
    console.log(`  seed('${seed}') -> randint(0,71) = ${val} -> '${char}'`);
});

console.log('\nExpected from Python:');
console.log("  seed('') -> 58 -> 'V'");
console.log("  seed('8') -> 29 -> 's'");
console.log("  seed('84') -> 28 -> 'r'");
console.log("  seed('84e') -> 52 -> 'P'");
console.log("  seed('84e4') -> 41 -> 'E'");

// Test 2: Full password generation
console.log('\n' + '='.repeat(80));
console.log('\nTest 2: Full password for steam/dsm980220');

const md5Hash = '84e468dc950010fa4585f225d346074f';
const password = [];

for (let i = 0; i < 16; i++) {
    const seedStr = md5Hash.substring(0, i);
    const rng = new PythonRandom();
    rng.seed(seedStr);
    const idx = rng.randint(0, BASE_STR.length - 1);
    password.push(BASE_STR[idx]);
}

const generatedPassword = password.join('');
console.log(`\nGenerated: ${generatedPassword}`);
console.log(`Expected:  VsrPEQJH!oHV~xLT`);
console.log(`\n${generatedPassword === 'VsrPEQJH!oHV~xLT' ? '✅ SUCCESS! Passwords match!' : '❌ FAILED'}`);
