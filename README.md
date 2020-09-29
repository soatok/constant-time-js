# Constant-Time JavaScript

Constant-time algorithms written in TypeScript.

[![Support on Patreon](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Fshieldsio-patreon.herokuapp.com%2Fsoatok&style=flat)](https://patreon.com/soatok)
[![Linux Build Status](https://travis-ci.org/soatok/constant-time-js.svg?branch=master)](https://travis-ci.org/soatok/constant-time-js)
[![npm version](https://img.shields.io/npm/v/constant-time-js.svg)](https://npm.im/constant-time-js)

**Important**: This Github repository is the companion to [Soatok's Guide to Side-Channel Attacks](https://soatok.blog/2020/08/27/soatoks-guide-to-side-channel-attacks/).

![Mind Blowing, right?](https://soatok.files.wordpress.com/2020/08/soatoktelegrams2020-01.png)

## Documentation

* `compare(a, b)` - Compare two `Uint8Array` objects.
  * Returns `-1` if `a < b`
  * Returns `1` if `a > b`
  * Returns `0` if `a === b`
  * Throws an `Error` if `a.length !== b.length`
* `compare_ints(a, b)` - Compare two integers.
  * Returns `-1` if `a < b`
  * Returns `1` if `a > b`
  * Returns `0` if `a === b`
* `equals(a, b)` - Are these `Uint8Array` objects equal?
  * Returns `true` if they are equal.
  * Returns `false` if they are not equal.
  * Throws an `Error` if `a.length !== b.length`
* `hmac_equals(a, b)` - Are these `Uint8Array` objects equal? (Using HMAC to compare.)
  * Returns `true` if they are equal.
  * Returns `false` if they are not equal.
  * Throws an `Error` if `a.length !== b.length`
* `intdiv(N, D)` - Divide `N` into `D`, discarding remainder.
  * Returns an integer.
* `modulo(N, D)` - Divide `N` into `D`, return the remainder.
* `resize(buf, size)` - Return a resized `Uint8Array` object (to side-step memory access leakage)
* `select(x, a, b)` - Read it as a ternary. If `x` is true, returns `a`. Otherwise, returns `b`.
  * `x` must be a `boolean`
  * `a` must be a `Uint8Array`
  * `b` must be a `Uint8Array`
  * Throws an `Error` if `a.length !== b.length`
* `select_ints(x, a, b)` - Read it as a ternary. If `x` is even, returns `a`. Otherwise, returns `b`. 
  (You should pass `1` or `0` for `x`).
  * `x` must be a `boolean`
  * `a` must be a `number`
  * `b` must be a `number`
* `trim_zeroes_left(buf)`
  * `buf` must be a `Uint8Array`
  * Returns a `Uint8Array`
* `trim_zeroes_right(buf)`
  * `buf` must be a `Uint8Array`
  * Returns a `Uint8Array`
