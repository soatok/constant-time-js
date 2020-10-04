import {
    add,
    and,
    count_trailing_zero_bits,
    divide,
    gcd,
    lshift1,
    modInverse,
    modPow,
    modulo,
    multiply,
    normalize,
    or,
    pow,
    rshift1,
    shift_left,
    shift_right,
    sub,
    xor,
} from '../lib/bignum';
import { expect } from 'chai';
import 'mocha';
import { uint8array_to_hex } from './test-helper';
import {trim_zeroes_left} from "../lib/trim";
import {intdiv} from "../lib/intdiv";

describe('Constant-Time BigNumber Arithmetic', () => {
    it('add()', () => {
        const a = new Uint8Array([0x31, 0x41]);
        const b = new Uint8Array([0x59, 0x65]);
        expect(uint8array_to_hex(add(a, b)))
            .to.be.equal('8aa6');
    });

    it('and()', () => {
        const a = new Uint8Array([0x31, 0x41]);
        const b = new Uint8Array([0x59, 0x65]);
        expect(uint8array_to_hex(and(a, b)))
            .to.be.equal('1141');
    });

    it('count_trailing_zero_bits()', () => {
        const a = new Uint8Array([0x31, 0x41, 0x59, 0xff]);
        let count: number;
        count = Number(count_trailing_zero_bits(a));
        expect(count).to.be.equal(0);

        a[3] = 0xfe;
        count = Number(count_trailing_zero_bits(a));
        expect(count).to.be.equal(1);

        a[3] = 0xfc;
        count = Number(count_trailing_zero_bits(a));
        expect(count).to.be.equal(2);

        a[3] = 0xf8;
        count = Number(count_trailing_zero_bits(a));
        expect(count).to.be.equal(3);

        a[3] = 0xf0;
        count = Number(count_trailing_zero_bits(a));
        expect(count).to.be.equal(4);

        a[3] = 0x00;
        count = Number(count_trailing_zero_bits(a));
        expect(count).to.be.equal(8);
    });

    it('divide() and modulo()', () => {
        const testCases = [
            {N: 3628800, D: 11, Q: 329890, R: 10},
            {N: 3628800, D: 10, Q: 362880, R: 0},
            {N: 3628800, D: 9, Q: 403200, R: 0},
            {N: 3628800, D: 13, Q: 279138, R: 6},
        ];
        for (const test of testCases) {
            const testN = new Uint8Array([
                (test.N >>> 24) & 0xff,
                (test.N >>> 16) & 0xff,
                (test.N >>> 8) & 0xff,
                test.N & 0xff,
            ]);
            const testD = new Uint8Array([
                (test.D >>> 24) & 0xff,
                (test.D >>> 16) & 0xff,
                (test.D >>> 8) & 0xff,
                test.D & 0xff,
            ]);
            const testQ = new Uint8Array([
                (test.Q >>> 24) & 0xff,
                (test.Q >>> 16) & 0xff,
                (test.Q >>> 8) & 0xff,
                test.Q & 0xff,
            ]);
            const testR = new Uint8Array([
                (test.R >>> 24) & 0xff,
                (test.R >>> 16) & 0xff,
                (test.R >>> 8) & 0xff,
                test.R & 0xff,
            ]);
            expect(uint8array_to_hex(testQ))
                .to.be.equal(uint8array_to_hex(divide(testN, testD)));
            expect(uint8array_to_hex(testR))
                .to.be.equal(uint8array_to_hex(modulo(testN, testD)));
        }

        const a = new Uint8Array([0x0e])
        const b = new Uint8Array([0x07]);
        expect('02').to.be.equal(
            uint8array_to_hex(divide(a, b))
        );

        const c = new Uint8Array([0x00, 0x00, 0xff, 0xff])
        const d = new Uint8Array([0x00, 0x00, 0x00, 0xff]);
        expect('00000101').to.be.equal(
            uint8array_to_hex(divide(c, d))
        );
        const e = new Uint8Array([0x00, 0x00, 0x01, 0x01]);
        expect('000000ff').to.be.equal(
            uint8array_to_hex(divide(c, e))
        );
    });

    it('gcd()', () => {
        const a = new Uint8Array([0x00, 0x00, 0xff, 0xff])
        const b = new Uint8Array([0x00, 0x00, 0x01, 0x01]);
        expect(uint8array_to_hex(gcd(a, b)))
            .to.be.equal('00000101');

        const c = new Uint8Array([0x00, 0x00, 0x02, 0xb5])
        const d = new Uint8Array([0x00, 0x00, 0x02, 0x61]);
        expect(uint8array_to_hex(gcd(c, d)))
            .to.be.equal('00000015');
    });

    it('lshift1()', () => {
        const a = new Uint8Array([0x31, 0x41, 0x59, 0x65]);
        lshift1(a);
        expect(uint8array_to_hex(a)).to.be.equal('6282b2ca');
        lshift1(a);
        expect(uint8array_to_hex(a)).to.be.equal('c5056594');
        lshift1(a);
        expect(uint8array_to_hex(a)).to.be.equal('8a0acb28');
        lshift1(a);
        expect(uint8array_to_hex(a)).to.be.equal('14159650');
    });

    it('modInverse()', () => {
        const prime = new Uint8Array([0x00, 0x01, 0x00, 0x01]); // 65537
        const three = new Uint8Array([0x00, 0x00, 0x00, 0x03]);
        expect(uint8array_to_hex(modInverse(three, prime)))
            .to.be.equal('00005556');

        const five = new Uint8Array([0x00, 0x00, 0x00, 0x05]);
        expect(uint8array_to_hex(modInverse(five, prime)))
            .to.be.equal('00006667');

        const half = new Uint8Array([0x00, 0x00, 0x7f, 0xff]);
        expect(uint8array_to_hex(modInverse(half, prime)))
            .to.be.equal('00005555');

        const halfUpper = new Uint8Array([0x00, 0x00, 0x80, 0x00]);
        expect(uint8array_to_hex(modInverse(halfUpper, prime)))
            .to.be.equal('0000ffff');
    });

    it('modInverse() - expected failure cases', () => {
        expect(
            () => modInverse(new Uint8Array([4]), new Uint8Array([12]))
        ).to.throw('inverse does not exist');
        expect(
            () => modInverse(new Uint8Array([127]), new Uint8Array([127]))
        ).to.throw('inverse does not exist');
    });

    it('modPow()', () => {
        const base = new Uint8Array([0x00, 0x04]);     // 4
        const exponent = new Uint8Array([0x00, 0x0d]); // 13
        const modulus = new Uint8Array([0x01, 0xf1]); // 497
        expect('01bd').to.be.equal(
            uint8array_to_hex(modPow(base, exponent, modulus))
        );
    });

    it('modPow() - Fermat - 3 ^ 65535 mod 65537', () => {
        const prime = new Uint8Array([0x00, 0x01, 0x00, 0x01]); // 65537
        const pMinus2 = new Uint8Array([0x00, 0x00, 0xff, 0xff]); // 65535
        const three = new Uint8Array([0x00, 0x00, 0x00, 0x03]);
        expect(uint8array_to_hex(modPow(three, pMinus2, prime)))
            .to.be.equal('00005556');
    });
    it('modPow() - Fermat - 5 ^ 65535 mod 65537', () => {
        const prime = new Uint8Array([0x00, 0x01, 0x00, 0x01]); // 65537
        const pMinus2 = new Uint8Array([0x00, 0x00, 0xff, 0xff]); // 65535
        const five = new Uint8Array([0x00, 0x00, 0x00, 0x05]);

        expect(uint8array_to_hex(modPow(five, pMinus2, prime)))
            .to.be.equal('00006667');
    });

    it('modPow() - Fermat - 32767 ^ 65535 mod 65537', () => {
        const prime = new Uint8Array([0x00, 0x01, 0x00, 0x01]); // 65537
        const pMinus2 = new Uint8Array([0x00, 0x00, 0xff, 0xff]); // 65535
        const half = new Uint8Array([0x00, 0x00, 0x7f, 0xff]);

        expect(uint8array_to_hex(modPow(half, pMinus2, prime)))
            .to.be.equal('00005555');
    });
    it('modPow() - Fermat - 32768 ^ 65535 mod 65537', () => {
        const prime = new Uint8Array([0x00, 0x01, 0x00, 0x01]); // 65537
        const pMinus2 = new Uint8Array([0x00, 0x00, 0xff, 0xff]); // 65535
        const halfUpper = new Uint8Array([0x00, 0x00, 0x80, 0x00]);
        expect(uint8array_to_hex(modPow(halfUpper, pMinus2, prime)))
            .to.be.equal('0000ffff');
    });

    it('modulo()', () => {
        expect('00000000001e').to.be.equal(
            uint8array_to_hex(
                modulo(
                    new Uint8Array([0, 0, 0, 0, 4, 0]),
                    new Uint8Array([0, 0, 0, 0, 1, 241])
                )
            )
        );
        expect('00000001').to.be.equal(
            uint8array_to_hex(
                modulo(
                    new Uint8Array([0xFF, 0xFF, 0xFF, 0xFF]),
                    new Uint8Array([0x00, 0x00, 0x00, 0x02])
                )
            )
        );
        expect('00000003').to.be.equal(
            uint8array_to_hex(
                modulo(
                    new Uint8Array([0xFF, 0xFF, 0xFF, 0xFF]),
                    new Uint8Array([0x00, 0x00, 0x00, 0x04])
                )
            )
        );
        expect('0000fff9').to.be.equal(
            uint8array_to_hex(
                modulo(
                    new Uint8Array([0x04, 0x08, 0x04, 0x00]),
                    new Uint8Array([0x00, 0x01, 0x00, 0x01])
                )
            )
        );
        expect('00000000001e').to.be.equal(
            uint8array_to_hex(
                modulo(
                    new Uint8Array([0, 0, 0, 0, 4, 0]),
                    new Uint8Array([0, 0, 0, 0, 1, 241])
                )
            )
        );

    });

    it('multiply()', () => {
        const a = new Uint8Array([0x31, 0x41]);
        const b = new Uint8Array([0x59, 0x65]);
        const one = new Uint8Array([0x00, 0x01]);
        const two = new Uint8Array([0x00, 0x02]);
        expect(uint8array_to_hex(multiply(a, one)))
            .to.be.equal('00003141');
        expect(uint8array_to_hex(multiply(a, two)))
            .to.be.equal('00006282');
        expect(uint8array_to_hex(multiply(a, b)))
            .to.be.equal('113307a5');
        expect(uint8array_to_hex(multiply(b, a)))
            .to.be.equal('113307a5');
        expect(uint8array_to_hex(multiply(a, a)))
            .to.be.equal('0979f281');
    });

    it('or()', () => {
        const a = new Uint8Array([0x00, 0x31, 0x41]);
        expect(uint8array_to_hex(normalize(a, 8)))
            .to.be.equal('0000000000003141');
        expect(uint8array_to_hex(normalize(a, 3)))
            .to.be.equal('003141');
        expect(uint8array_to_hex(normalize(a, 2)))
            .to.be.equal('3141');

        const b = new Uint8Array([0xff, 0xff, 0x3e]);
        expect(uint8array_to_hex(normalize(b, 8)))
            .to.be.equal('ffffffffffffff3e');
    });

    it('or()', () => {
        const a = new Uint8Array([0x31, 0x41]);
        const b = new Uint8Array([0x59, 0x65]);
        expect(uint8array_to_hex(or(a, b)))
            .to.be.equal('7965');
    });

    it('pow()', () => {
        const a = new Uint8Array([0x00, 0x00, 0x00, 0x07]);
        const n = new Uint8Array([0x00, 0x00, 0x00, 0x03]);
        expect(uint8array_to_hex(pow(a, n)))
            .to.be.equal('0157');
    });

    it('rshift1()', () => {
        const a = new Uint8Array([0x62, 0x82, 0xb2, 0xca]);
        rshift1(a);
        expect(uint8array_to_hex(a)).to.be.equal('31415965');
        rshift1(a);
        expect(uint8array_to_hex(a)).to.be.equal('18a0acb2');
        rshift1(a);
        expect(uint8array_to_hex(a)).to.be.equal('0c505659');
        rshift1(a);
        expect(uint8array_to_hex(a)).to.be.equal('06282b2c');
        rshift1(a);
        expect(uint8array_to_hex(a)).to.be.equal('03141596');

        const b = new Uint8Array([0x00, 0xff, 0xff, 0x00]);
        rshift1(b);
        expect(uint8array_to_hex(b)).to.be.equal('007fff80');
    });

    it('shift_left()', () => {
        const a = new Uint8Array([0x31, 0x41, 0x59, 0x65]);
        expect(uint8array_to_hex(shift_left(a, 1n)))
            .to.be.equal('6282b2ca');
        expect(uint8array_to_hex(shift_left(a, 2n)))
            .to.be.equal('c5056594');
        expect(uint8array_to_hex(shift_left(a, 3n)))
            .to.be.equal('8a0acb28');
        expect(uint8array_to_hex(shift_left(a, 4n)))
            .to.be.equal('14159650');
        expect(uint8array_to_hex(shift_left(a, 8n)))
            .to.be.equal('41596500');
        expect(uint8array_to_hex(shift_left(a, 9n)))
            .to.be.equal('82b2ca00');
        expect(uint8array_to_hex(shift_left(a, 16n)))
            .to.be.equal('59650000');
        expect(uint8array_to_hex(shift_left(a, 24n)))
            .to.be.equal('65000000');
        const b = new Uint8Array([0x00, 0x00, 0x31, 0x41, 0x59, 0x65, 0x00, 0x00]);
        expect(uint8array_to_hex(shift_left(b, 1n)))
            .to.be.equal('00006282b2ca0000');
        expect(uint8array_to_hex(shift_left(b, 2n)))
            .to.be.equal('0000c50565940000');
        expect(uint8array_to_hex(shift_left(b, 3n)))
            .to.be.equal('00018a0acb280000');
        expect(uint8array_to_hex(shift_left(b, 4n)))
            .to.be.equal('0003141596500000');
        expect(uint8array_to_hex(shift_left(b, 8n)))
            .to.be.equal('0031415965000000');
        expect(uint8array_to_hex(shift_left(b, 9n)))
            .to.be.equal('006282b2ca000000');
        expect(uint8array_to_hex(shift_left(b, 16n)))
            .to.be.equal('3141596500000000');
        expect(uint8array_to_hex(shift_left(b, 24n)))
            .to.be.equal('4159650000000000');
    });

    it('shift_right()', () => {
        const a = new Uint8Array([0x31, 0x41, 0x59, 0x65]);
        expect(uint8array_to_hex(shift_right(a, 1n)))
            .to.be.equal('18a0acb2');
        const b = new Uint8Array([0x00, 0x00, 0x31, 0x41, 0x59, 0x65, 0x00, 0x00]);
        expect(uint8array_to_hex(shift_right(b, 1n)))
            .to.be.equal('000018a0acb28000');
        expect(uint8array_to_hex(shift_right(b, 2n)))
            .to.be.equal('00000c5056594000');
        expect(uint8array_to_hex(shift_right(b, 3n)))
            .to.be.equal('000006282b2ca000');
        expect(uint8array_to_hex(shift_right(b, 4n)))
            .to.be.equal('0000031415965000');
    });

    it('sub()', () => {
        const a = new Uint8Array([0x8a, 0xa6]);
        const b = new Uint8Array([0x59, 0x65]);
        expect(uint8array_to_hex(sub(a, b)))
            .to.be.equal('3141');

        const c = new Uint8Array([0x01, 0x02, 0x03, 0x04]);
        const d = new Uint8Array([0x7f, 0xff, 0xff, 0xff]);
        expect(uint8array_to_hex(sub(c, d)))
            .to.be.equal('81020305');
    });

    it('xor()', () => {
        const a = new Uint8Array([0x31, 0x41]);
        const b = new Uint8Array([0x59, 0x65]);
        expect(uint8array_to_hex(xor(a, b)))
            .to.be.equal('6824');
    });
});
