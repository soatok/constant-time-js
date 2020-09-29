import { resize } from './resize';

/**
 * @param {Uint8Array} buf
 * @returns {Uint8Array}
 */
export function trim_zeroes_right(buf: Uint8Array): Uint8Array {
    let foundNonZero: number = 0;
    let i: number;
    let index: number = 1;
    let isNonZero: number = 0;
    let found: number = 0;
    for (i = buf.length - 1; i >= 0; i--) {
        /* if foundNonZero === 0 && buf[i] !== 0, index := i */
        isNonZero = ((buf[i] - 1) >>> 8) & 0xff;
        found = (foundNonZero - 1) & 0xff;
        index = (i & ~foundNonZero) ^ (foundNonZero & index);
        foundNonZero |= (~isNonZero) & 0xff;
    }
    return resize(buf, index + 1);
}

/**
 * @param {Uint8Array} buf
 * @returns {Uint8Array}
 */
export function trim_zeroes_left(buf: Uint8Array): Uint8Array {
    buf.reverse();
    buf = trim_zeroes_right(buf);
    buf.reverse();
    return buf;
}
