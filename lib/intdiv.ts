import { int32 } from './int32';
import { select_int32 } from './select';

/**
 * Returns {num / denom} rounded down.
 *
 * @param {number} numerator
 * @param {number} denominator
 * @returns {number}
 */
export function intdiv(numerator: number, denominator: number): number {
    return divide(numerator, denominator)[0];
}

/**
 * Returns {num % denom}.
 *
 * @param {number} numerator
 * @param {number} denominator
 * @returns {number}
 */
export function modulo(numerator: number, denominator: number): number {
    return divide(numerator, denominator)[1];
}

function divide(num: number, denom: number): number[] {
    if (denom === 0) {
        throw new Error('Division by zero');
    }
    let bits: number = Math.ceil(Math.log2(num)) | 0;
    let N: int32 = int32.fromInt(num);
    let D: int32 = int32.fromInt(denom);
    let Q: int32 = int32.zero();
    let R: int32 = int32.zero();
    let Qprime: int32 = int32.zero();
    let Rprime: int32 = int32.zero();
    let i: number;
    let compared: int32;
    let swap: number;
    for (i = 0; i <= bits; i++) {
        // R := R << 1
        // R(0) := N(i)
        R = R.lshift(1).or(
            N.rshift(bits - i).lsb()
        );

        /*
          -- if R > D  then compared ==  1, swap = 1
          -- if R == D then compared ==  0, swap = 1
          -- if R < D  then compared == -1, swap = 0
         */
        compared = R.compare(D);
        swap = (1 - compared.msb());

        /*
          Rprime := R - D
          Qprime := Q
          Qprime(i) := 1
         */
        Rprime = R.sub(D);
        Qprime = Q.or(1 << (bits - i));

        R = select_int32(swap, Rprime, R);
        Q = select_int32(swap, Qprime, Q);
    }
    // Wipe intermediary values
    const ret: number[] = [Q.toNumber(), R.toNumber()];
    compared.wipe();
    Qprime.wipe();
    Rprime.wipe();
    N.wipe();
    D.wipe();
    Q.wipe();
    R.wipe();
    return ret;
}
