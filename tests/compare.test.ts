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
    })
});
