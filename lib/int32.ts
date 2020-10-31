export class int32 {
    private limbs: Uint16Array;

    constructor(low: number, high: number) {
        this.limbs = new Uint16Array([low, high]);
    }

    /**
     * Returns an int32 with value 0
     *
     * @returns {int32}
     */
    static zero(): int32 {
        return new int32(0, 0);
    }

    /**
     * Returns an int32 with value 1
     *
     * @returns {int32}
     */
    static one(): int32 {
        return new int32(1, 0);
    }

    /**
     * Returns an int32 with the value of {int}
     *
     * @returns {int32}
     */
    static fromInt(int: number): int32 {
        return new int32(int & 0xffff, int >>> 16);
    }

    /**
     * @returns {number}
     */
    low() {
        return this.limbs[0];
    }

    /**
     * @returns {number}
     */
    high() {
        return this.limbs[1];
    }

    /**
     * @returns {number}
     */
    lsb() {
        return this.limbs[0] & 1;
    }

    /**
     * @returns {number}
     */
    msb() {
        return (this.limbs[1] >>> 15) & 1;
    }

    /**
     * Returns the sum of {this} and {arg}.
     *
     * @param {number|int32} arg
     * @returns {number}
     */
    add(arg: number|int32): int32 {
        if (arg instanceof int32) {
            return int32_add_int32(this, arg);
        }
        return int32_add_number(this, arg);
    }

    /**
     * Returns the result of {this & arg}.
     *
     * @param {number|int32} arg
     * @returns {number}
     */
    and(arg: number|int32): int32 {
        if (arg instanceof int32) {
            return int32_and_int32(this, arg);
        }
        return int32_and_number(this, arg);
    }

    /**
     * Returns -1 if {this < arg}
     * Returns 0 if {this == arg}
     * Returns 1 if {this > arg}
     *
     * @param {number|int32} arg
     * @returns {number}
     */
    compare(arg: number|int32): int32 {
        if (typeof arg === 'number') {
            arg = int32.fromInt(arg);
        }
        return int32_compare(this, arg);
    }

    /**
     * Is this number zero?
     *
     * @returns {number} 1 if true, 0 if false
     */
    isZero(): number {
        return int32_is_zero(this);
    }

    /**
     * Return {this} left-shifted by {amount}.
     *
     * @param {number} amount
     * @returns {number}
     */
    lshift(amount: number): int32 {
        if (amount > 31) {
            return int32.zero();
        }
        return int32_lshift(this, amount);
    }

    /**
     * Returns a bitwise NOT of {this}
     *
     * @returns {number}
     */
    not(): int32 {
        return int32_not(this);
    }

    /**
     * Returns the result of {this | arg}.
     *
     * @param {number|int32} arg
     * @returns {number}
     */
    or(arg: number|int32): int32 {
        if (arg instanceof int32) {
            return int32_or_int32(this, arg);
        }
        return int32_or_number(this, arg);
    }

    /**
     * Return {this} right-shifted by {amount}.
     *
     * @param {number} amount
     * @returns {int32}
     */
    rshift(amount: number): int32 {
        if (amount > 31) {
            return int32.zero();
        }
        return int32_rshift(this, amount);
    }

    /**
     * Returns {this - arg}.
     *
     * @param {number|int32} arg
     * @returns {number}
     */
    sub(arg: number|int32): int32 {
        if (arg instanceof int32) {
            return int32_sub_int32(this, arg);
        }
        return int32_sub_number(this, arg);
    }

    /**
     * Returns {this ^ arg}
     *
     * @param {number|int32} arg
     * @returns {number}
     */
    xor(arg: number|int32): int32 {
        if (arg instanceof int32) {
            return int32_xor_int32(this, arg);
        }
        return int32_xor_number(this, arg);
    }

    /**
     * Returns the hexadecimal representation of this integer.
     *
     * @returns {string}
     */
    toHex(): string {
        const l: string = (this.low() & 0xffff)
            .toString(16)
            .padStart(4, '0');
        const h: string = (this.high() & 0xffff)
            .toString(16)
            .padStart(4, '0');
        return h.concat(l);
    }

    /**
     * Convert to a JavaScript Number.
     *
     * @returns {number}
     */
    toNumber(): number {
        return (this.low() | (this.high() << 16));
    }

    /**
     * MUTATES the obejct!
     *
     * Set both limbs to 0 in-place.
     */
    wipe(): void {
        this.limbs[0] ^= this.limbs[0];
        this.limbs[1] ^= this.limbs[1];
    }
}

function int32_add_int32(a: int32, b: int32): int32 {
    let l: number = a.low() + b.low();
    let h: number = a.high() + b.high() + (l >>> 16);
    return new int32(l & 0xffff, h & 0xffff);
}

function int32_add_number(a: int32, b: number): int32 {
    let l: number = a.low() + (b & 0xffff);
    let h: number = a.high() + (b >>> 16) + (l >>> 16);
    return new int32(l & 0xffff, h & 0xffff);
}

function int32_and_int32(a: int32, b: int32): int32 {
    let l: number = a.low() & b.low();
    let h: number = a.high() & b.high();
    return new int32(l & 0xffff, h & 0xffff);
}

function int32_and_number(a: int32, b: number): int32 {
    let l: number = a.low() & (b & 0xffff);
    let h: number = a.high() & (b >>> 16);
    return new int32(l & 0xffff, h & 0xffff);
}

function int32_compare(left, right): int32 {
    const diff: int32 = right.sub(left);
    /*
    This borrows a trick from Thomas Pornin's CTTK library:

    https://github.com/pornin/CTTK/blob/1d592024398f06c8eda1d325bdbd105ac32d92b3/inc/cttk.h#L552-L581

	> If both x >= 2^31 and y >= 2^31, then we can virtually
	> subtract 2^31 from both, and we are back to the first
	> case. Since (y-2^31)-(x-2^31) = y-x, the direct subtraction
	> is already fine.

	Except (left, right, diff) := (x, y, z), respectively
    */
    let gt: number = diff.xor(left.xor(right).and(left.xor(diff))).msb();
    let eq: number = right.xor(left).isZero();
    return int32.fromInt((gt + gt + eq) - 1);
}

function int32_is_zero(a: int32): number {
    /*
     Bitiwse OR the bits of the limbs together
     then subtract 1 and grab the most significant bit.

     [0] - 1 >>> 31
      -> 1
     [1..0xffff] - 1 >>> 31
      -> 0
     */
    return ((a.low() | a.high()) - 1) >>> 31;
}

function int32_lshift(a: int32, x: number) {
    let l: number = (a.low() << x);
    let h: number = (l >>> 16) | (a.high() << x);
    return new int32(l & 0xffff, h & 0xffff);
}

function int32_not(a: int32): int32 {
    let l: number = a.low() ^ 0xffff;
    let h: number = a.high() ^ 0xffff;
    return new int32(l & 0xffff, h & 0xffff);
}

function int32_or_int32(a: int32, b: int32): int32 {
    let l: number = a.low() | b.low();
    let h: number = a.high() | b.high();
    return new int32(l & 0xffff, h & 0xffff);
}

function int32_or_number(a: int32, b: number): int32 {
    let l: number = a.low() | (b & 0xffff);
    let h: number = a.high() | (b >>> 16);
    return new int32(l & 0xffff, h & 0xffff);
}

function int32_rshift(a: int32, amount: number) {
    let m: number = (1 << (amount + 1)) - 1;
    let h: number = (a.high() >>> amount);
    let l: number = (a.low() >>> amount) | (((a.high() & m) << 16) >>> amount);
    return new int32(l & 0xffff, h & 0xffff);
}

function int32_sub_int32(a: int32, b: int32): int32 {
    let l: number = a.low() - b.low();
    let h: number = a.high() - b.high() + (l >>> 16);
    return new int32(l & 0xffff, h & 0xffff);
}
function int32_sub_number(a: int32, b: number): int32 {
    let l: number = a.low() - (b & 0xffff);
    let h: number = a.high() - (b >>> 16) + (l >>> 16);
    return new int32(l & 0xffff, h & 0xffff);
}

function int32_xor_int32(a: int32, b: int32): int32 {
    let l: number = a.low() ^ b.low();
    let h: number = a.high() ^ b.high();
    return new int32(l & 0xffff, h & 0xffff);
}

function int32_xor_number(a: int32, b: number): int32 {
    let l: number = a.low() ^ (b & 0xffff);
    let h: number = a.high() ^ (b >>> 16);
    return new int32(l & 0xffff, h & 0xffff);
}
