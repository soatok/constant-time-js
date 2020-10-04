import { compare, compare_ints } from '../lib/compare';
import { expect } from 'chai';
import 'mocha';

describe('Constant-Time Comparison', () => {
    it('compare()', () => {
        const A = new Uint8Array([0x12, 0x34, 0x56, 0x78]);
        const B = new Uint8Array([0x12, 0x34, 0x56, 0x79]);
        const C = new Uint8Array([0x12, 0x34, 0x56, 0x7A]);

        expect(compare(A, A)).to.be.equal(0);
        expect(compare(B, A)).to.be.equal(1);
        expect(compare(C, A)).to.be.equal(1);

        expect(compare(A, B)).to.be.equal(-1);
        expect(compare(B, B)).to.be.equal(0);
        expect(compare(C, B)).to.be.equal(1);

        expect(compare(A, C)).to.be.equal(-1);
        expect(compare(B, C)).to.be.equal(-1);
        expect(compare(C, C)).to.be.equal(0);

        const D = new Uint8Array([0x00, 0x00, 0x00, 0x03]);
        const E = new Uint8Array([0x00, 0x01, 0x00, 0x01]);
        expect(compare(D, E)).to.be.equal(-1);
        expect(compare(D, D)).to.be.equal(0);
        expect(compare(E, E)).to.be.equal(0);
        expect(compare(E, D)).to.be.equal(1);
    });

    it('compare_ints()', () => {
        const A = 0x1234;
        const B = 0x1235;
        const C = 0x1236;

        expect(compare_ints(A, A)).to.be.equal(0);
        expect(compare_ints(B, A)).to.be.equal(1);
        expect(compare_ints(C, A)).to.be.equal(1);

        expect(compare_ints(A, B)).to.be.equal(-1);
        expect(compare_ints(B, B)).to.be.equal(0);
        expect(compare_ints(C, B)).to.be.equal(1);

        expect(compare_ints(A, C)).to.be.equal(-1);
        expect(compare_ints(B, C)).to.be.equal(-1);
        expect(compare_ints(C, C)).to.be.equal(0);
    });

    it('compare_ints() big', () => {
        const SMOL =    0x12345678;
        const CHUNGUS = 0x7fffffff;
        const MAX =     0xffffffff;

        expect(compare_ints(MAX, MAX)).to.be.equal(0);
        expect(compare_ints(CHUNGUS, MAX)).to.be.equal(-1);
        expect(compare_ints(SMOL, MAX)).to.be.equal(-1);

        expect(compare_ints(MAX, CHUNGUS)).to.be.equal(1);
        expect(compare_ints(CHUNGUS, CHUNGUS)).to.be.equal(0);
        expect(compare_ints(SMOL, CHUNGUS)).to.be.equal(-1);

        expect(compare_ints(MAX, SMOL)).to.be.equal(1);
        expect(compare_ints(CHUNGUS, SMOL)).to.be.equal(1);
        expect(compare_ints(SMOL, SMOL)).to.be.equal(0);
    })
});
