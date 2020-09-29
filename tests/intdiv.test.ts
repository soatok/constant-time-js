import { intdiv, modulo } from '../lib/intdiv';
import { expect } from 'chai';
import 'mocha';

describe('Constant-Time Integer Division', () => {
    it('intdiv() and modulo()', () => {
        const testCases = [
            {N: 3628800, D: 11, Q: 329890, R: 10},
            {N: 3628800, D: 10, Q: 362880, R: 0},
            {N: 3628800, D: 9, Q: 403200, R: 0},
            {N: 3628800, D: 13, Q: 279138, R: 6},
        ];
        for (const test of testCases) {
            expect(test.Q * test.D + test.R).to.be.equal(test.N);
            expect(intdiv(test.N, test.D)).to.be.equal(test.Q);
            expect(modulo(test.N, test.D)).to.be.equal(test.R);
        }
    });
});
