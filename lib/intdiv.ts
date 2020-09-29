import { compare_ints } from './compare';
import { select_ints } from './select';

export function intdiv(numerator: number, denominator: number): number {
    return divide(numerator, denominator)[0];
}

export function modulo(numerator: number, denominator: number): number {
    return divide(numerator, denominator)[1];
}

function divide(N: number, D: number): number[] {
    if (D === 0) {
        throw new Error('Division by zero');
    }
    let Q: number = 0;
    let R: number = 0;
    let Qprime: number = 0;
    let Rprime: number = 0;
    let i: number = 0;
    let compared: number;
    let swap: number;
    let bits: number = Math.ceil(Math.log2(N)) | 0;
    for (i = 0; i <= bits; i++) {
        // R := R << 1
        // R(0) := N(i)
        R = (R << 1) | ((N >> (bits - i)) & 1);

        /*
          -- if R > D  then compared ==  1, swap = 1
          -- if R == D then compared ==  0, swap = 1
          -- if R < D  then compared == -1, swap = 0
         */
        compared = compare_ints(R, D);
        swap = (1 - ((compared >>> 31) & 1));

        /*
          Rprime := R - D
          Qprime := Q
          Qprime(i) := 1
         */
        Rprime = R - D;
        Qprime = Q | (1 << (bits - i));

        R = select_ints(swap, Rprime, R);
        Q = select_ints(swap, Qprime, Q);
    }
    return [Q, R];
}
