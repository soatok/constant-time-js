import { int32 } from './int32';
import { resize } from './resize';

/**
 * @param {Uint8Array} buf
 * @returns {Uint8Array}
 */
export function trim_zeroes_right(buf: Uint8Array): Uint8Array {
    let foundNonZero: int32 = int32.zero();
    let i: number;
    let index: number = -1;
    let isNonZero: int32 = int32.zero();
    const m: int32 = int32.fromInt(0xff);
    for (i = buf.length - 1; i >= 0; i--) {
        /* if foundNonZero === 0 && buf[i] !== 0, index := i */
        isNonZero = int32.fromInt(buf[i]).sub(1).rshift(8).and(m);
        index = (foundNonZero.negate().and(i))
            .xor(foundNonZero.and(index))
            .toNumber();
        foundNonZero = foundNonZero.or(isNonZero.negate()).and(m);
    }
    foundNonZero.wipe();
    isNonZero.wipe();
    return resize(buf, index + 1);
}

/**
 * @param {Uint8Array} buf
 * @returns {Uint8Array}
 */
export function trim_zeroes_left(buf: Uint8Array): Uint8Array {
    const ret = buf.slice();
    ret.reverse();
    return trim_zeroes_right(ret).reverse();
}
