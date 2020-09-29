import { equals, hmac_equals } from '../lib/equals';
import { expect } from 'chai';
import 'mocha';
import * as crypto from 'crypto';

describe('Constant-Time Equality', () => {
    it('equals()', () => {
        const buf1 = crypto.randomBytes(32);
        const buf2 = crypto.randomBytes(32);
        expect(equals(buf1, buf1)).to.be.equals(true);
        expect(equals(buf1, buf2)).to.be.equals(false);
        expect(equals(buf2, buf1)).to.be.equals(false);
        expect(equals(buf2, buf2)).to.be.equals(true);
    });

    it('hmac_equals()', () => {
        const buf1 = crypto.randomBytes(32);
        const buf2 = crypto.randomBytes(32);
        expect(hmac_equals(buf1, buf1)).to.be.equals(true);
        expect(hmac_equals(buf1, buf2)).to.be.equals(false);
        expect(hmac_equals(buf2, buf1)).to.be.equals(false);
        expect(hmac_equals(buf2, buf2)).to.be.equals(true);
    });
});
