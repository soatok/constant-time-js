import { int32 } from './int32';

/**
 * Compare {left} with {right}.
 *
 * @param {Uint8Array} left
 * @param {Uint8Array} right
 * @returns {number} -1 if left < right, 0 if left == right, 1 if left > right
 */
export function compare(left: Uint8Array, right: Uint8Array): number {
    if (left.length !== right.length) {
        throw new Error('Both arrays must be of equal length');
    }
    let gt: number = 0;
    let eq: number = 1;
    let l: int32;
    let r: int32;
    for (let i: number = 0; i < left.length; i++) {
        r = int32.fromInt(right[i]);
        l = int32.fromInt(left[i]);
        const d: int32 = r.sub(l);
        gt |= d.xor(l.xor(r).and(l.xor(d))).msb() & eq;
        eq &= r.xor(l).isZero();
    }
    l.wipe();
    r.wipe();
    return (gt + gt + eq) - 1;
}

/**
 * Compare {left} with {right}
 *
 * @param {number} left
 * @param {number} right
 * @returns {number} -1 if left < right, 0 if left == right, 1 if left > right
 */
export function compare_ints(left: number, right: number): number {
    /*
    let gt: number = (right - left) >>> 31;
    let eq: number = ((right ^ left) - 1) >>> 31;
    */
    const L: int32 = int32.fromInt(left);
    const R: int32 = int32.fromInt(right);
    /*
    This borrows a trick from Thomas Pornin's CTTK library:

    https://github.com/pornin/CTTK/blob/1d592024398f06c8eda1d325bdbd105ac32d92b3/inc/cttk.h#L552-L581

	> If both x >= 2^31 and y >= 2^31, then we can virtually
	> subtract 2^31 from both, and we are back to the first
	> case. Since (y-2^31)-(x-2^31) = y-x, the direct subtraction
	> is already fine.

	Except (L, R, diff) := (x, y, z), respectively
    */
    const diff: int32 = R.sub(L);
    const gt: number = diff.xor(L.xor(R).and(L.xor(diff))).msb();
    const eq: number = R.xor(L).isZero();
    L.wipe();
    R.wipe();
    return (gt + gt + eq) - 1;
}
