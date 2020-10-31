import * as crypto from 'crypto';

/**
 * Constant-time buffer comparison
 *
 * @param {Uint8Array} left
 * @param {Uint8Array} right
 * @returns {boolean}
 */
export function equals(left: Uint8Array, right: Uint8Array): boolean {
    if (left.length !== right.length) {
        return false;
    }
    let d: number = 0;
    let i: number;
    for (i = 0; i < left.length; i++) {
        d |= left[i] ^ right[i];
    }
    return d === 0;
}

/**
 * Constant-time equality even with an adversarial JIT compiler.
 *
 * @param {Uint8Array} left
 * @param {Uint8Array} right
 * @returns {boolean}
 */
export function hmac_equals(left: Uint8Array, right: Uint8Array): boolean {
    return equals(
        crypto.createHmac('sha256', hmacKey).update(left).digest(),
        crypto.createHmac('sha256', hmacKey).update(right).digest()
    );
}

const hmacKey = crypto.randomBytes(32);
