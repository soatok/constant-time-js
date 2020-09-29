import { resize } from '../lib/resize';
import { expect } from 'chai';
import 'mocha';
import * as crypto from 'crypto';
import { uint8array_to_hex } from './test-helper';

describe('Constant-Time Buffer Resizing', () => {
    it('resize()', () => {
        const inBuf = crypto.randomBytes(32);
        for (let i = 1; i < 32; i++) {
            const left = resize(inBuf, i);
            const right = inBuf.slice(0, i);
            expect(uint8array_to_hex(left))
                .to.be.equal(uint8array_to_hex(right), `i = ${i}`);
        }
    });
});
