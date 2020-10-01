import { int32 } from '../lib/int32';
import { expect } from 'chai';
import 'mocha';

describe('Int32', () => {
    it('add()', () => {
        expect(int32.fromInt(0xffffffff).add(1).toHex())
            .to.be.equal('00000000');
        expect(int32.fromInt(0x7fffffff).add(1).toHex())
            .to.be.equal('80000000');
        const x: int32 = int32.fromInt(0x7fff);
        expect(x.add(2).toHex())
            .to.be.equal('00008001');
        expect(x.add(x).toHex())
            .to.be.equal('0000fffe');
    });

    it('and()', () => {
        expect(int32.fromInt(0xffff).and(1 << 16).toHex())
            .to.be.equal('00000000');
        expect(int32.fromInt(0xffff).and(1 << 15).toHex())
            .to.be.equal('00008000');
        const y: int32 = new int32(0xffff, 0xffff);
        const z: int32 = int32.fromInt(0x12345678);
        expect(z.and(y).toHex()).to.be.equal('12345678')
    });

    it('compare()', () => {
        const x: int32 = new int32(0x5678, 0x1234);
        const y: int32 = new int32(0x5679, 0x1234);
        const z: int32 = new int32(0xffff, 0x7fff);

        expect(x.compare(x).toNumber()).to.be.equal(0);
        expect(y.compare(x).toNumber()).to.be.equal(1);
        expect(z.compare(x).toNumber()).to.be.equal(1);
        expect(x.compare(y).toNumber()).to.be.equal(-1);
        expect(y.compare(y).toNumber()).to.be.equal(0);
        expect(z.compare(y).toNumber()).to.be.equal(1);
        expect(x.compare(z).toNumber()).to.be.equal(-1);
        expect(y.compare(z).toNumber()).to.be.equal(-1);
        expect(z.compare(z).toNumber()).to.be.equal(0);
    });

    it('msb()', () => {
        expect(int32.fromInt(0x7fffffff).msb())
            .to.be.equal(0);
        expect(int32.fromInt(0x8fffffff).msb())
            .to.be.equal(1);
        expect(int32.fromInt(0xffffffff).msb())
            .to.be.equal(1);
        expect(int32.fromInt(-1).msb())
            .to.be.equal(1);
    });

    it('lshift()', () => {
        let a: int32 = int32.fromInt(0x12345678);
        expect(a.lshift(4).toNumber())
            .to.be.equal(0x23456780);
        expect(a.lshift(8).toNumber())
            .to.be.equal(0x34567800);
        expect(a.lshift(16).toNumber())
            .to.be.equal(0x56780000);
        expect(a.lshift(24).toNumber())
            .to.be.equal(0x78000000);
        expect(a.lshift(28).toNumber())
            .to.be.equal(0x80000000|0);
        expect(a.lshift(32).toNumber())
            .to.be.equal(0);
    });

    it('not()', () => {
        const z: int32 = int32.fromInt(0x12345678);
        expect(z.not().toHex()).to.be.equal('edcba987');
        expect(z.toHex()).to.be.equal('12345678');
    });

    it('or()', () => {
        expect(int32.fromInt(0xffff).or(1 << 16).toHex())
            .to.be.equal('0001ffff');
        const y: int32 = new int32(0xffff, 0xffff);
        const z: int32 = int32.fromInt(0x12345678);
        expect(z.or(y).toHex()).to.be.equal('ffffffff')
    });

    it('rshift()', () => {
        let a: int32 = int32.fromInt(0x12345678);
        expect(a.rshift(4).toNumber())
            .to.be.equal(0x01234567);
        expect(a.rshift(8).toNumber())
            .to.be.equal(0x00123456);
        expect(a.rshift(16).toNumber())
            .to.be.equal(0x00001234);
        expect(a.rshift(24).toNumber())
            .to.be.equal(0x00000012);
        expect(a.rshift(28).toNumber())
            .to.be.equal(0x00000001);
        expect(a.rshift(32).toNumber())
            .to.be.equal(0);
    });

    it('sub()', () => {
        const x: int32 = int32.fromInt(0x7fff);
        const y: int32 = int32.fromInt(0x1234);
        const z: int32 = int32.fromInt(0x12345678);

        expect(x.sub(y).toHex()).to.be.equal('00006dcb');
        expect(y.sub(x).toHex()).to.be.equal('ffff9235');
        expect(z.sub(y).toHex()).to.be.equal('12344444');
        expect(y.sub(z).toHex()).to.be.equal('edcbbbbc');
    });

    it('xor()', () => {
        expect(int32.fromInt(0x7fff).xor(0x1234).toHex())
            .to.be.equal('00006dcb');
        expect(int32.fromInt(0xffff).xor(1 << 16).toHex())
            .to.be.equal('0001ffff');

        const y: int32 = new int32(0xffff, 0xffff);
        const z: int32 = int32.fromInt(0x12345678);
        expect(z.xor(y).toHex()).to.be.equal('edcba987')
    });
});
