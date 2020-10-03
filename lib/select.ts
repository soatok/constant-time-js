import { int32 } from './int32';

/**
 * If TRUE, return left; else, return right.
 *
 * @param {boolean} returnLeft
 * @param {Uint8Array} left
 * @param {Uint8Array} right
 * @returns {Uint8Array}
 */
export function select(returnLeft: boolean, left: Uint8Array, right: Uint8Array): Uint8Array {
    if (left.length !== right.length) {
        throw new Error('select() expects two Uint8Array objects of equal length');
    }
    /*
     If returnLeft, mask = 0xFF; else, mask = 0x00;
     */
    const mask: number = (-!!returnLeft) & 0xff;
    const out: Uint8Array = new Uint8Array(left.length);
    for (let i: number = 0; i < left.length; i++) {
        out[i] = right[i] ^ ((left[i] ^ right[i]) & mask);
    }
    return out;
}

/**
 * Returns (choice ? m : n) without branches indexed by secret data.
 *
 * @param {number} choice (0 or 1)
 * @param {Uint8Array} m
 * @param {Uint8Array} n
 * @returns {Uint8Array}
 */
export function select_alt(choice: number, m: Uint8Array, n: Uint8Array): Uint8Array {
    if (m.length !== n.length) {
        throw new Error('Both Uint8Arrays must be the same length');
    }
    const mask = (-choice) & 0xff;
    const out = new Uint8Array(m.length);
    for (let i: number = 0; i < out.length; i++) {
        out[i] = n[i] ^ ((m[i] ^ n[i]) & mask);
    }
    return out;
}

/**
 * If TRUE, return left; else, return right.
 *
 * @param {number} returnLeft
 * @param {number} left
 * @param {number} right
 * @returns {number}
 */
export function select_ints(returnLeft: number, left: number, right: number): number {
    /*
     If returnLeft, mask = 0xFFFFFFFF; else, mask = 0x00000000;
     */
    const mask: number = (-(returnLeft & 1)) & 0xfffffffff;
    return right ^ ((left ^ right) & mask);
}

/**
 * If TRUE, return left; else, return right.
 *
 * @param {number} returnLeft
 * @param {number} left
 * @param {number} right
 * @returns {number}
 */
export function select_int32(returnLeft: number, left: int32, right: int32): int32 {
    return right.xor(left.xor(right).and(
        int32.fromInt(-(returnLeft & 1))
    ));
}
