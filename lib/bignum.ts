import {compare, compare_alt} from './compare';
import {equals} from './equals';
import {modulo as mod} from './intdiv';
import {select, select_alt, select_int32} from './select';
import {trim_zeroes_left} from './trim';

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
 * Divide a / b. Returns only the quotient (no remainder).
 *
 * @param {Uint8Array} a
 * @param {Uint8Array} b
 * @returns {Uint8Array}
 */
export function divide(a: Uint8Array, b: Uint8Array): Uint8Array {
    return division(a, b)[0];
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
 * Divide a / b. Returns the remainder.
 *
 * @param {Uint8Array} a
 * @param {Uint8Array} b
 * @returns {Uint8Array}
 */
export function modulo(a: Uint8Array, b: Uint8Array): Uint8Array {
    return division(a, b)[1];
}

/**
 * Calculate a^x (mod m).
 *
 * @param {Uint8Array} a
 * @param {Uint8Array} x
 * @param {Uint8Array} m
 */
export function modPow(a: Uint8Array, x: Uint8Array, m: Uint8Array): Uint8Array {
    const zero: Uint8Array = new Uint8Array(m.length + 1);
    const one: Uint8Array = zero.slice();
    one[one.length - 1] = 1;
    const two: Uint8Array = zero.slice();
    two[two.length - 1] = 2;

    let length: number = zero.length << 1;
    const mod: Uint8Array = normalize(m, length);
    let result: Uint8Array = normalize(one, length);
    let base: Uint8Array = normalize(a, length);
    let e: Uint8Array = normalize(x, length);
    let p: Uint8Array;

    while (is_nonzero(e)) {
        /*
        if (exponent & 1) equals 1:
           result = (result * base) mod modulus
         */
        p = multiply(result, base);
        p = normalize(modulo(p, mod), length, true);
        result = select_alt(lsb(e), p, result);

        /*
        exponent := exponent >> 1
         */
        rshift1(e, true);

        /*
        base = (base * base) mod modulus
         */
        p = multiply(base, base);
        p = normalize(modulo(p, mod), length, true);
        base = p;
    }
    return normalize(result, zero.length - 1);
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
        z = select_alt(lsb(y), add(z, x), z);
        lshift1(x);
        rshift1(y);
        ops--;
    }
    return z;
}

/**
 * Normalize this output to the desired length.
 *
 * @param {Uint8Array} a
 * @param {number} l
 * @param {boolean} unsigned
 */
export function normalize(a: Uint8Array, l: number, unsigned?: boolean): Uint8Array {
    const out = new Uint8Array(l);
    const neg: number = unsigned
        ? 0x00
        : ((-msb(a)) & 0xff);
    let j: number = a.length - 1;
    const tmp: Int32Array = new Int32Array(1);
    for (let i: number = l - 1; i >= 0; i--, j--) {
        /* if j >= 0:
             fill = 0xff
           else:
             fill = 0x00
         */
        tmp[0] = j >>> 31;
        tmp[0] *= -1;
        const fill: number = ~tmp[0] & 0xff;
        const index: number = mod(j, a.length) & fill;
        /* if j < 0, neg; else, a[j] */
        out[i] = (a[index] & fill) ^ (neg & ~fill);
    }
    return out;
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
 * Calculate a to the nth power.
 *
 * Based off algorithm 14.76 from the Handbook of Applied Cryptography
 *
 * @param {Uint8Array} a
 * @param {Uint8Array} n
 * @returns {Uint8Array}
 */
export function pow(a: Uint8Array, n: Uint8Array): Uint8Array {
    const one: Uint8Array = new Uint8Array(a.length);
    one[one.length - 1] = 1;

    let A: Uint8Array = one.slice();
    let S: Uint8Array = a.slice();
    let e: Uint8Array = n.slice();
    let Aprime: Uint8Array;
    let Sprime: Uint8Array;
    do {
        Aprime = multiply(A, S);
        A = select_alt(
            lsb(e),
            Aprime,
            normalize(A, Aprime.length)
        );
        rshift1(e, true);
        Sprime = multiply(S, S);
        S = select(
            is_nonzero(e),
            Sprime,
            normalize(S, Sprime.length)
        );
    } while (is_nonzero(e));
    return trim_zeroes_left(A);
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
        y = (mod(index, a.length) & x);
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
        y = (mod(index, a.length) & x);
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
    const c: Int16Array = new Int16Array(1);
    for (let i: number = out.length - 1; i >= 0; i--) {
        c[0] += a[i] - b[i];
        out[i] = c[0] & 0xff;
        c[0] >>= 8;
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
            A = select_alt(swap, A, add(A, y));
            rshift1(A);
            B = select_alt(swap, B, sub(B, x));
            rshift1(B);
        }
        for (bits = count_trailing_zero_bits(v); bits > 0n; bits--) {
            rshift1(v);
            swap = (~lsb(C) & ~lsb(D)) & 1;
            C = select_alt(swap, C, add(C, y));
            rshift1(C);
            D = select_alt(swap, D, sub(D, x));
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
        swap = (1 - (compare_alt(u, v)[0] >>> 31));
        u = select_alt(swap, sub(u, v), u);
        A = select_alt(swap, sub(A, C), A);
        B = select_alt(swap, sub(B, D), B);

        swap = 1 - swap;
        // else:
        v = select_alt(swap, sub(v, u), v);
        C = select_alt(swap, sub(C, A), C);
        D = select_alt(swap, sub(D, B), D);
    } while (is_nonzero(u));
    return [C, shift_left(v, g)];
}

/**
 * Big number division.
 *
 * @param {Uint8Array} num
 * @param {Uint8Array} denom
 * @returns {Uint8Array}
 */
function division(num: Uint8Array, denom: Uint8Array): Uint8Array[] {
    if (!is_nonzero(denom)) {
        throw new Error('Division by zero');
    }
    const length: number = Math.max(num.length, denom.length);
    const zero: Uint8Array = new Uint8Array(length);
    let bits: number = (length << 3) - 1;
    let N: Uint8Array = normalize(num, length, true);
    let D: Uint8Array = normalize(denom, length, true);
    let Q: Uint8Array = zero.slice();
    let R: Uint8Array = zero.slice();
    let Qprime: Uint8Array;
    let Rprime: Uint8Array;
    let compared: Uint32Array;
    let swap: number;
    let byte: number;
    let b: number;
    let i: number;
    for (i = 0; i <= bits; i++) {
        byte = i >>> 3;
        b = ((bits - i) & 7);
        lshift1(R);

        // R(0) := N(i)
        R[R.length - 1] |= (N[byte] >>> b) & 1;

        /*
          -- if R > D  then compared ==  1, swap = 1
          -- if R == D then compared ==  0, swap = 1
          -- if R < D  then compared == -1, swap = 0
         */
        compared = compare_alt(R, D);
        swap = (1 - (compared[0] >>> 31));

        /*
          Rprime := R - D
          Qprime := Q
          Qprime(i) := 1
         */
        Rprime = sub(R, D);
        Qprime = Q.slice();
        Qprime[byte] |= (1 << b);

        R = select_alt(swap, Rprime, R);
        Q = select_alt(swap, Qprime, Q);
    }
    return [Q, R];
}
