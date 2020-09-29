import { select, select_ints } from '../lib/select';
import { expect } from 'chai';
import 'mocha';
import { uint8array_to_hex } from './test-helper';

describe('Constant-Time Selection', () => {
    it('select()', () => {
        const left = new Uint8Array([0x31, 0x32, 0x33, 0x34]);
        const right = new Uint8Array([0x35, 0x36, 0x37, 0x38]);
        expect(uint8array_to_hex(select(true, left, right)))
            .to.be.equal(uint8array_to_hex(left));
        expect(uint8array_to_hex(select(false, left, right)))
            .to.be.equal(uint8array_to_hex(right));
        expect(uint8array_to_hex(select(false, right, left)))
            .to.be.equal(uint8array_to_hex(left));
        expect(uint8array_to_hex(select(true, right, left)))
            .to.be.equal(uint8array_to_hex(right));
    })

    it('select_ints()', () => {
        expect(select_ints(0, 0xBEEF, 0xCAFE))
            .to.be.equal(0xCAFE);
        expect(select_ints(1, 0xBEEF, 0xCAFE))
            .to.be.equal(0xBEEF);
        expect(select_ints(1, 0xBEEFCAFE, 0))
            .to.be.equal(0xBEEFCAFE | 0);
        expect(select_ints(0, 0xBEEFCAFE, 0))
            .to.be.equal(0);
    })
});
