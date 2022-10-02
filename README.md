# Constant-Time JavaScript

Constant-time algorithms written in TypeScript.

[![Build Status](https://github.com/soatok/constant-time-js/actions/workflows/ci.yml/badge.svg)](https://github.com/soatok/soatok/constant-time-js/actions)
[![npm version](https://img.shields.io/npm/v/constant-time-js.svg)](https://npm.im/constant-time-js)

**Important**: This Github repository is the companion to [Soatok's Guide to Side-Channel Attacks](https://soatok.blog/2020/08/27/soatoks-guide-to-side-channel-attacks/).
Do not use this in production, especially if you don't have the budget for a cryptography audit.

![Mind Blowing, right?](https://soatok.files.wordpress.com/2020/08/soatoktelegrams2020-01.png)

## Installing and Usage

Simply add `constant-time-js` to your dependencies section. One way to do this is with `npm`:

```terminal
npm install --save constant-time-js
```

Next, you can import the modules you need.

For JavaScript users:

```js
const { compare, bignum } = require('constant-time-js');
```

Tor TypeScript users:

```typescript
import { compare, bignum } from 'constant-time-js';
```

Please refer to the documentation below for what each function/class does.

## Documentation

This is just a quick outline of what each function does.

* `compare(a, b)` - Compare two `Uint8Array` objects.
  * [Explanation](https://soatok.blog/2020/08/27/soatoks-guide-to-side-channel-attacks/#string-inequality)
  * Returns `-1` if `a < b`
  * Returns `1` if `a > b`
  * Returns `0` if `a === b`
  * Throws an `Error` if `a.length !== b.length`
* `compare_ints(a, b)` - Compare two integers.
  * [Explanation](https://soatok.blog/2020/08/27/soatoks-guide-to-side-channel-attacks/#string-inequality)
  * Returns `-1` if `a < b`
  * Returns `1` if `a > b`
  * Returns `0` if `a === b`
* `equals(a, b)` - Are these `Uint8Array` objects equal?
  * [Explanation](https://soatok.blog/2020/08/27/soatoks-guide-to-side-channel-attacks/#string-comparison)
  * Returns `true` if they are equal.
  * Returns `false` if they are not equal.
  * Throws an `Error` if `a.length !== b.length`
* `hmac_equals(a, b)` - Are these `Uint8Array` objects equal? (Using HMAC to compare.)
  * [Explanation](https://soatok.blog/2020/08/27/soatoks-guide-to-side-channel-attacks/#double-hmac)
  * Returns `true` if they are equal.
  * Returns `false` if they are not equal.
  * Throws an `Error` if `a.length !== b.length`
* `intdiv(N, D)` - Divide `N` into `D`, discarding remainder.
  * [Explanation](https://soatok.blog/2020/08/27/soatoks-guide-to-side-channel-attacks/#integer-division)
  * Returns an integer.
* `modulo(N, D)` - Divide `N` into `D`, return the remainder.
  * [Explanation](https://soatok.blog/2020/08/27/soatoks-guide-to-side-channel-attacks/#integer-division)
  * Returns an integer.
* `resize(buf, size)` - Return a resized `Uint8Array` object (to side-step memory access leakage)
* `select(x, a, b)` - Read it as a ternary. If `x` is true, returns `a`. Otherwise, returns `b`.
  * [Explanation](https://soatok.blog/2020/08/27/soatoks-guide-to-side-channel-attacks/#conditional-select)
  * `x` must be a `boolean`
  * `a` must be a `Uint8Array`
  * `b` must be a `Uint8Array`
  * Throws an `Error` if `a.length !== b.length`
* `select_ints(x, a, b)` - Read it as a ternary. If `x` is even, returns `a`. Otherwise, returns `b`. 
  (You should pass `1` or `0` for `x`).
  * [Explanation](https://soatok.blog/2020/08/27/soatoks-guide-to-side-channel-attacks/#conditional-select)
  * `x` must be a `boolean`
  * `a` must be a `number`
  * `b` must be a `number`
* `trim_zeroes_left(buf)`
  * [Explanation](https://soatok.blog/2020/08/27/soatoks-guide-to-side-channel-attacks/#null-byte-trimming)
  * `buf` must be a `Uint8Array`
  * Returns a `Uint8Array`
* `trim_zeroes_right(buf)`
  * [Explanation](https://soatok.blog/2020/08/27/soatoks-guide-to-side-channel-attacks/#null-byte-trimming)
  * `buf` must be a `Uint8Array`
  * Returns a `Uint8Array`

### BigNumber

Our BigNumber implementation aims to be constant-time for the magnitude of the numbers
(i.e. number of limbs or bytes, regardless of how many bits are significant).

Unless otherwise stated, all of our APIs expect `Uint8Array` objects (`Buffer` extends
from `Uint8Array` and should work too, but we return `Uint8Array` objects, not `Buffer`
objects).

Unless otherwise stated, all `Uint8Array` objects are **big-endian byte order**.

Unless otherwise stated, all `Uint8Array` objects assume **unsigned integer** behavior.

Unless otherwise stated, all of the `bignum` methods are immutable (meaning: they return
a new `Uint8Array` object rather than mutating the input arrays).  

#### bignum.add()

Returns `a + b`. Overflow is discarded.

```typescript
/** 
 * @var {Uint8Array} a
 * @var {Uint8Array} b
 */
const c: Uint8Array = bignum.add(a, b);
```
#### bignum.and()

Returns `a & b` (bitwise AND).

```typescript
/** 
 * @var {Uint8Array} a
 * @var {Uint8Array} b
 */
const c: Uint8Array = bignum.and(a, b);
```

#### bignum.count_trailing_zero_bits()

Counts the number of `0` bits beneath the most significant `1` bit.

Returns a **BigInt** (the native JS type), since the number of bits may
exceed 2^32 for an array that is less than 2^32 elements long.

```typescript
/** 
 * @var {Uint8Array} a
 */
const c: bigint = bignum.count_trailing_zero_bits(a, b);
```

#### bignum.divide()

Calculate `a / b`, discarding the remainder.

```typescript
/**
 * @var {Uint8Array} a
 * @var {Uint8Array} b
 */
const c: Uint8Array = bignum.divide(a, b);
```

#### bignum.gcd()

Calculate the Greatest Common Denominator of two integers.

```typescript
/** 
 * @var {Uint8Array} a
 * @var {Uint8Array} b
 */
const c: Uint8Array = bignum.gcd(a, b);
```

#### bignum.is_nonzero()

Returns true if this number is not equal to zero?

```typescript
/**
 * @var {Uint8Array} x
 */
const check: boolean = bignum.is_nonzero(x);
```

#### bignum.lsb()

Returns the least significant bit of a big number.
(If `0`, this is a multiple of two.)

```typescript
/**
 * @var {Uint8Array} x
 */
const least: number = bignum.lsb(x);
```

#### bignum.lshift1()

**Mutates the input array.**

Left-shift by 1. This is used internally in some algorithms.

```typescript
/** 
 * @var {Uint8Array} a
 */
lshift1(a);
// `a` is now double its previous value
```

#### bignum.modulo()

Calculate `a mod b`.

```typescript
/**
 * @var {Uint8Array} a
 * @var {Uint8Array} b
 */
const c: Uint8Array = bignum.modulo(a, b);
```

#### bignum.modInverse()

Calculate the modular inverse of two integers.

**Throws if `gcd(a, b)` is not equal to `1`.**

```typescript
/** 
 * @var {Uint8Array} a
 * @var {Uint8Array} b
 */
let one_over_a: Uint8Array;
try {
    one_over_a = bignum.modInverse(a, b);
} catch (e) {
    // Handle exception when 1/a is not defined (mod b).
}
```

#### bignum.modPow()

Modular exponentiation.

```typescript
/**
 * @var {Uint8Array} base
 * @var {Uint8Array} exp
 * @var {Uint8Array} mod
 */
const out: Uint8Array = bignum.modPow(base, exp, mod);
```

#### bignum.msb()

Returns the most significant bit of a big number.

```typescript
/**
 * @var {Uint8Array} x
 */
const most: number = bignum.msb(x);
```

#### bignum.multiply()

Multiply two big numbers, return the product.

The output size will be larger than the inputs.

```typescript
/**
 * @var {Uint8Array} x
 * @var {Uint8Array} y
 */
const z: Uint8Array = bignum.multiply(x, y);
```

#### bignum.normalize()

Resize an Uint8Array to the desired length.

The default behavior is to treat the number as signed (thereby filling in the
left with 0xFF bytes if the most significant bit of the input Uint8Array is set).

Pass `true` to the optional third argument to always zero-fill this padding value.

```typescript
/** 
 * @var {Uint8Array} a
 * @var {number} len
 */
const c: Uint8Array = bignum.normalize(a, len);
```

#### bignum.or()

Returns `a | b` (bitwise OR).

```typescript
/** 
 * @var {Uint8Array} a
 * @var {Uint8Array} b
 */
const c: Uint8Array = bignum.or(a, b);
```


#### bignum.pow()

Exponentiation.

```typescript
/** 
 * @var {Uint8Array} a
 * @var {Uint8Array} n
 */
const c: Uint8Array = bignum.pow(a, n);
```

#### bignum.rshift1()

**Mutates the input array.**

Right-shift by 1. This is used internally in some algorithms.

```typescript
/** 
 * @var {Uint8Array} a
 */
rshift1(a);
// `a` is half double its previous value
```

The default behavior is congruent to JavaScript's `>>` operator.
For an unsigned right shift (`>>>`), pass `true` as the second argument:

```
rshift1(a, true);
```

#### bignum.shift_left()

Shift left by an arbitrary amount.

```typescript
/**
 * @var {Uint8Array} x
 */
const y: Uint8Array = bignum.shift_left(x, 3n);
// y :=  8 * x
```

#### bignum.shift_right()

Shift right by an arbitrary amount.

```typescript
/**
 * @var {Uint8Array} x
 */
const y: Uint8Array = bignum.shift_right(x, 3n);
// y := x / 8
```

#### bignum.sub()

Returns `a - b`. Use `msb()` to check if the output is negative.

```typescript
/** 
 * @var {Uint8Array} a
 * @var {Uint8Array} b
 */
const c: Uint8Array = bignum.sub(a, b);
```

#### bignum.xor()

Returns `a ^ b` (bitwise XOR).

```typescript
/** 
 * @var {Uint8Array} a
 * @var {Uint8Array} b
 */
const c: Uint8Array = bignum.xor(a, b);
```

## Limitations

### Potentially Dangerous on 32-bit Applications

32-bit v8 (and, presumably, a lot of other 32-bit implementations) do things wrong, 
and our implementation might be variable-time on it.

Specifically, the most significant bit of a 32-bit integer distinguishes values from pointers.
As a result, accessing the highest bit of a 32-bit number in 32-bit JavaScript engines (such as v8)
is potentially variable-time.

To mitigate this risk, the [`int32` class was created](https://github.com/soatok/constant-time-js/blob/master/lib/int32.ts)
which wraps operates on 16-bit limbs (wrapping `Uint16Array`).

## Frequently Asked Questions

### But Why Though?

![Mwahahahahahaha!](https://soatok.files.wordpress.com/2020/04/soatok_stickerpack-evil-laughter.png)

**For science!**

This is a proof-of-concept library, that will eventually implement
all of the algorithms described in [the accompanying blog post](https://soatok.blog/2020/08/27/soatoks-guide-to-side-channel-attacks/).

The main purpose of this library is to demonstrate the concepts in a programming
language widely accessible outside of the cryptography orthodoxy (which today is
largely C and sometimes Python, and hopefully soon Rust).

### Can I use this in a project?

Hold off until v1.0.0 is tagged before you even *think* about relying on it for
anything. APIs might break until then.

### What's with the blue {fox, wolf}?

My fursona is a [dhole](https://soatok.blog/2020/08/10/all-about-dholes-and-dhole-fursonas/), not a wolf.

### You should remove your fursona from this so my manager might take it seriously.

I don't owe you anything. I don't owe your manager anything.

Besides, if anyone is bigoted against a [predominantly LGBTQIA+ community](https://furscience.com/research-findings/sex-relationships-pornography/5-1-orientation/),
they're precisely the sort of person whose career I don't want to help.

In sum:

[![I will increase the thing](https://soatok.files.wordpress.com/2020/07/increase-the-thing.png)](https://soatok.blog/2020/07/09/a-word-on-anti-furry-sentiments-in-the-tech-community/)
