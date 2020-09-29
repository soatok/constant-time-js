import { int32 } from './int32';
import { modulo } from './intdiv';
import { select_ints } from './select';

/**
 * Iterate over every byte of the input array, returning a new object
 * (so as to minimize memory access leakage outside).
 *
 * This is useful for building functions to trim trailing or leading zero
 * bytes without leakage.
 *
 * @param {Uint8Array} input
 * @param {number} desired
 */
export function resize(input: Uint8Array, desired: number): Uint8Array {
    if (desired === 0) {
        return new Uint8Array(0);
    }
    const output: Uint8Array = new Uint8Array(desired);
    let x: number;
    let y: number;
    let z: number;
    const desired32: int32 = int32.fromInt(desired);
    for (x = 0; x < input.length; x++) {
        /*
         if (x <= desired) y = 0;
         else              y = 1;
         */
        y = int32.fromInt(x).sub(desired32).msb();
        z = modulo(x, desired);
        output[z] = select_ints(y, input[z], output[z]);
    }
    desired32.wipe();

    return output;
}
