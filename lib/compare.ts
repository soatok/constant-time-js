import { int32 } from './int32';

export function compare(left: Uint8Array, right: Uint8Array): number {
    if (left.length !== right.length) {
        throw new Error('Both arrays must be of equal length');
    }
    let gt: number = 0;
    let eq: number = 1;
    let i: number = left.length;
    let l: int32;
    let r: int32;
    while (i > 0) {
        i--;
        r = int32.fromInt(right[i]);
        l = int32.fromInt(left[i]);
        gt |= r.sub(l).msb();
        eq &= r.xor(l).sub(1).msb();
    }
    l.wipe();
    r.wipe();
    return (gt + gt + eq) - 1;
}

export function compare_ints(left: number, right: number): number {
    /*
    let gt: number = (right - left) >>> 31;
    let eq: number = ((right ^ left) - 1) >>> 31;
    */
    const L: int32 = int32.fromInt(left);
    const R: int32 = int32.fromInt(right);
    const gt: number = R.sub(L).msb();
    const eq: number = R.xor(L).sub(1).msb();
    L.wipe();
    R.wipe();
    return (gt + gt + eq) - 1;
}
