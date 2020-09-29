
export function compare(left: Uint8Array, right: Uint8Array): number {
    if (left.length !== right.length) {
        throw new Error('Both arrays must be of equal length');
    }
    let gt: number = 0;
    let eq: number = 1;
    let i: number = left.length;
    while (i > 0) {
        i--;
        gt |= ((right[i] - left[i]) >>> 8) & eq;
        eq &= ((right[i] ^ left[i]) - 1) >>> 8;
    }
    return (gt + gt + eq) - 1;
}

export function compare_ints(left: number, right: number): number {
    let gt: number = (right - left) >>> 31;
    let eq: number = ((right ^ left) - 1) >>> 31;
    return (gt + gt + eq) - 1;
}
