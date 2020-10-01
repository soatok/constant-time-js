# Constant-Time JavaScript

Constant-time algorithms written in TypeScript.

[![Support on Patreon](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Fshieldsio-patreon.herokuapp.com%2Fsoatok&style=flat)](https://patreon.com/soatok)
[![Linux Build Status](https://travis-ci.org/soatok/constant-time-js.svg?branch=master)](https://travis-ci.org/soatok/constant-time-js)
[![npm version](https://img.shields.io/npm/v/constant-time-js.svg)](https://npm.im/constant-time-js)

**Important**: This Github repository is the companion to [Soatok's Guide to Side-Channel Attacks](https://soatok.blog/2020/08/27/soatoks-guide-to-side-channel-attacks/).
Do not use this in production, especially if you don't have the budget for a cryptography audit.

![Mind Blowing, right?](https://soatok.files.wordpress.com/2020/08/soatoktelegrams2020-01.png)

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

### Not Implemented From the Blog Post Yet

* Constant-Time Integer Multiplication
* Constant-Time Modular Inversion

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
