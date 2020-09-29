import { trim_zeroes_left, trim_zeroes_right } from '../lib/trim';
import { expect } from 'chai';
import 'mocha';
import { uint8array_to_hex } from './test-helper';

describe('Constant-Time Trim', () => {
    it('trim_zeroes_left()', () => {
        const before = new Uint8Array([
            0x00, 0x00, 0x00, 0x00, 0x00, 0x0D, 0xEC, 0xAF, 0xC0, 0xFF, 0xEE
        ]);
        const after = new Uint8Array([
            0x0D, 0xEC, 0xAF, 0xC0, 0xFF, 0xEE
        ]);
        expect(uint8array_to_hex(trim_zeroes_left(before)))
            .to.be.equal(uint8array_to_hex(after));
    });
    it('trim_zeroes_right()', () => {
        const before = new Uint8Array([
            0x0D, 0xEC, 0xAF, 0xC0, 0xFF, 0xEE, 0x00, 0x00, 0x00, 0x00, 0x00
        ]);
        const after = new Uint8Array([
            0x0D, 0xEC, 0xAF, 0xC0, 0xFF, 0xEE
        ]);
        expect(uint8array_to_hex(trim_zeroes_right(before)))
            .to.be.equal(uint8array_to_hex(after));
    });
});
