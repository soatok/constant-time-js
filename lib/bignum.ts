import {compare} from './compare';
import {equals} from './equals';
import {select_alt as select} from './select';

/**
 * Add two big numbers. Does not support overflow.
 *
 * @param {Uint8Array} a
 * @param {Uint8Array} b
 * @returns {Uint8Array}
 */
export function add(a: Uint8Array, b: Uint8Array): Uint8Array {
    const out: Uint8Array = new Uint8Array(Math.max(a.length, b.length));
    let c: number = 0;
    for (let i: number = out.length - 1; i >= 0; i--) {
        c += a[i] + b[i];
        out[i] = c & 0xff;
        c >>>= 8;
    }
    return out;
}

/**
 * Bitwise AND two big numbers.
 *
 * @param {Uint8Array} a
 * @param {Uint8Array} b
 * @returns {Uint8Array}
 */
export function and(a: Uint8Array, b: Uint8Array): Uint8Array {
    if (a.length !== b.length) {
        throw new Error('Both arrays must be of equal length');
    }
    const c: Uint8Array = new Uint8Array(a.length);
    for (let i: number = 0; i < c.length; i++) {
        c[i] = a[i] & b[i];
    }
    return c;
}

/**
 * Returns the number of trailing 0 bits (least significant, big endian)
 * in a big number.
 *
 * This returns a native bigint type because the number of zero bits might be
 * >= 2^32 for large data buffers (e.g. 2^30 bytes -> 2^33 bits).
 *
 * @param {Uint8Array} a
 * @returns {bigint}
 */
export function count_trailing_zero_bits(a: Uint8Array): bigint {
    let b: bigint = 0n;
    let num: bigint = 0n;
    let found: bigint = 0n;
    let bit: number = 0;
    for (let i: number = a.length - 1; i >= 0; i--) {
        for (let j: number = 0; j < 8; j++) {
            bit = (a[i] >>> j) & 1; // 1 if non-zero
            num = ((BigInt(-bit) & b) & ~found) ^ (num & found);
            found |= BigInt(-bit); // -1 if found, 0 if not
            b++;
        }
    }
    return num;
}

/**
 * Calculate the greatest common denominator of two big numbers.
 *
 * @param {Uint8Array} a
 * @param {Uint8Array} b
 * @returns {Uint8Array}
 */
export function gcd(a: Uint8Array, b: Uint8Array): Uint8Array {
    return xgcd(a, b)[1];
}

/**
 * Is this number anything except zero?
 *
 * @param {Uint8Array} num
 * @returns {boolean}
 */
export function is_nonzero(num: Uint8Array): boolean {
    let d: number = 0;
    for (let i: number = num.length - 1; i >= 0; i--) {
        d |= num[i];
    }
    return d !== 0;
}

/**
 * Return the least significant bit (big endian).
 *
 * @param {Uint8Array} y
 * @returns {number} (0 or 1)
 */
export function lsb(y: Uint8Array): number {
    return y[y.length - 1] & 1;
}

/**
 * Left-shift this big number in-place by 1.
 *
 * @param {Uint8Array} x
 */
export function lshift1(x: Uint8Array): void {
    let carry: number = 0;
    let tmp: number = 0;
    for (let i: number = x.length - 1; i >= 0; i--) {
        tmp = x[i];
        x[i] = (tmp << 1) | carry;
        carry = (tmp >>> 7) & 1;
    }
}

/**
 * Calculate the modular inverse (1/x mod m).
 *
 * @param {Uint8Array} x
 * @param {Uint8Array} m
 */
export function modInverse(x: Uint8Array, m: Uint8Array): Uint8Array {
    const [a, y] = xgcd(x, m);

    /* if (y != 1) throw */
    const one: Uint8Array = new Uint8Array(x.length);
    one[one.length - 1] = 1;
    if (!equals(one, y)) {
        throw new Error('inverse does not exist');
    }
    /* if (gcd(x, m) == 1), a is the modular inverse */
    return a;
}

/**
 * Return the most significant bit (big endian).
 *
 * @param {Uint8Array} x
 * @returns {number} (0 or 1)
 */
export function msb(x: Uint8Array): number {
    return (x[0] >>> 7) & 1;
}

/**
 * Multiply two big numbers. Output is twice the length of the input.
 *
 * @param {Uint8Array} a
 * @param {Uint8Array} b
 * @param {Number?} ops
 * @returns {Uint8Array}
 */
export function multiply(a: Uint8Array, b: Uint8Array, ops?: number): Uint8Array {
    let z = new Uint8Array(a.length + b.length);
    let x = new Uint8Array(z.length);
    let y = new Uint8Array(z.length);
    x.set(a, z.length - a.length);
    y.set(b, z.length - b.length);
    if (!ops) {
        ops = Math.max(x.length, y.length) << 3;
    }

    while (ops > 0) {
        z = select(lsb(y), add(z, x), z);
        lshift1(x);
        rshift1(y);
        ops--;
    }
    return z;
}

/**
 * Bitwise OR two big numbers.
 *
 * @param {Uint8Array} a
 * @param {Uint8Array} b
 * @returns {Uint8Array}
 */
export function or(a: Uint8Array, b: Uint8Array): Uint8Array {
    if (a.length !== b.length) {
        throw new Error('Both arrays must be of equal length');
    }
    const c: Uint8Array = new Uint8Array(a.length);
    for (let i: number = 0; i < c.length; i++) {
        c[i] = a[i] | b[i];
    }
    return c;
}

/**
 * Right-shift a big number in-place.
 *
 * Defaults to a signed right shift (JS >> operator).
 *
 * Pass {true} to the second argument to make it behave like an
 * unsigned right shift (JS >>> operator).
 *
 * @param {Uint8Array} y
 * @param {boolean?} unsigned
 */
export function rshift1(y: Uint8Array, unsigned?: boolean): void {
    let carry: number = unsigned ? 0 : msb(y);
    let tmp: number = 0;
    for (let i: number = 0; i < y.length; i++) {
        // Get LSB
        tmp = y[i] & 1;
        // Right shift, restoring previous LSB to the MSB
        y[i] = (y[i] >>> 1) | (carry << 7);
        // Store LSB in carry
        carry = tmp;
    }
}

/**
 * Shift left by an arbitrary number of bits.
 *
 * @param {Uint8Array} a
 * @param {bigint} e
 */
export function shift_left(a: Uint8Array, e: bigint): Uint8Array {
    const out = new Uint8Array(a.length);
    let index: number = a.length - 1 - (Number(e >> 3n) & 0x7fffffff);
    const s: number = Number(e & 7n);
    const m: number = (1 << s) - 1;
    /* index <= i, 0 <= s <= 7, 0 <= m <= 127 */
    let x: number = 0;
    let y: number = 0;
    let tmp: number = 0;
    let carry: number = 0;
    for (let i: number = a.length - 1; i >= 0; index--, i--) {
        x = ~(index >> 31);
        y = (index & x); // todo: replace with intdiv modulo
        tmp = (a[i] >>> (8 - s)) & m;
        out[y] = ((((a[i] << s) & 0xff) | carry) & x) ^ (out[y] & ~x);
        carry = tmp;
    }
    return out;
}

/**
 * Shift right by an arbitrary number of bits.
 *
 * @param {Uint8Array} a
 * @param {bigint} e
 */
export function shift_right(a: Uint8Array, e: bigint): Uint8Array {
    const out = new Uint8Array(a.length);
    let index: number = (Number(e >> 3n) & 0x7fffffff);
    const s: number = Number(e & 7n);
    const m: number = ~((1 << s) - 1);
    /* index <= i, 0 <= s <= 7, 0 <= m <= 255 */
    let x: number = 0;
    let y: number = 0;
    let tmp: number = 0;
    let carry: number = 0;
    for (let i: number = 0; i < a.length; i++, index++) {
        x = ~((a.length - index - 1) >> 31);
        y = (index & x); // todo: replace with intdiv modulo
        tmp = (a[i] << (8 - s)) & m;
        out[y] = ((((a[i] >>> s) & 0xff) | carry) & x) ^ (out[y] & ~x);
        carry = tmp;
    }
    return out;
}

/**
 * Subtract two big numbers.
 *
 * @param {Uint8Array} a
 * @param {Uint8Array} b
 * @returns {Uint8Array}
 */
export function sub(a: Uint8Array, b: Uint8Array): Uint8Array {
    const out: Uint8Array = new Uint8Array(Math.max(a.length, b.length));
    let c: number = 0;
    for (let i: number = out.length - 1; i >= 0; i--) {
        c += a[i] - b[i];
        out[i] = c & 0xff;
        c >>>= 8;
    }
    return out;
}

/**
 * Bitwise XOR two big numbers.
 *
 * @param {Uint8Array} a
 * @param {Uint8Array} b
 * @returns {Uint8Array}
 */
export function xor(a: Uint8Array, b: Uint8Array): Uint8Array {
    if (a.length !== b.length) {
        throw new Error('Both arrays must be of equal length');
    }
    const c: Uint8Array = new Uint8Array(a.length);
    for (let i: number = 0; i < c.length; i++) {
        c[i] = a[i] ^ b[i];
    }
    return c;
}

/**
 * Return the minimum of two native bigints.
 *
 * @param {bigint} a
 * @param {bigint} b
 * @returns {bigint}
 */
function minBigInt(a: bigint, b: bigint): bigint {
    let d: bigint = b - a;
    d = (d >> 63n) & d;
    a += d;
    return a;
}

/**
 * Based on algorithm 14.61 from the Handbook of Applied Cryptography
 *
 * @param {Uint8Array} x
 * @param {Uint8Array} y
 * @returns {Uint8Array[]}
 */
function xgcd(x: Uint8Array, y: Uint8Array): Uint8Array[] {
    if (x.length !== y.length) {
        throw new Error('Normalize your Uint8Array lengths first');
    }
    const zero: Uint8Array = new Uint8Array(y.length);
    const one: Uint8Array = zero.slice();
    one[one.length - 1] = 1;

    const g: bigint = minBigInt(
        count_trailing_zero_bits(x),
        count_trailing_zero_bits(y),
    );
    shift_right(x, g);
    shift_right(y, g);
    let u: Uint8Array = x.slice();
    let v: Uint8Array = y.slice();
    let A: Uint8Array = one.slice();
    let B: Uint8Array = zero.slice();
    let C: Uint8Array = zero.slice();
    let D: Uint8Array = one.slice();
    let bits: bigint;
    let swap: number;
    do {
        for (bits = count_trailing_zero_bits(u); bits > 0n; bits--) {
            rshift1(u);
            swap = (~lsb(A) & ~lsb(B)) & 1;
            A = select(swap, A, add(A, y));
            rshift1(A);
            B = select(swap, B, sub(B, x));
            rshift1(B);
        }
        for (bits = count_trailing_zero_bits(v); bits > 0n; bits--) {
            rshift1(v);
            swap = (~lsb(C) & ~lsb(D)) & 1;
            C = select(swap, C, add(C, y));
            rshift1(C);
            D = select(swap, D, sub(D, x));
            rshift1(D);
        }

        /*
         | compare(u, v) | swap |
         +---------------+------+
         | -1            |    0 |
         |  0            |    1 |
         |  1            |    1 |
         */

        // if (u >= v):
        swap = (1 - (compare(u, v) >>> 31));
        u = select(swap, sub(u, v), u);
        A = select(swap, sub(A, C), A);
        B = select(swap, sub(B, D), B);

        swap = 1 - swap;
        // else:
        v = select(swap, sub(v, u), v);
        C = select(swap, sub(C, A), C);
        D = select(swap, sub(D, B), D);
    } while (is_nonzero(u));
    return [C, shift_left(v, g)];
}
