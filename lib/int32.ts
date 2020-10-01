export class int32 {
    private limbs: Uint16Array;

    constructor(low: number, high: number) {
        this.limbs = new Uint16Array([low, high]);
    }

    static zero(): int32 {
        return new int32(0, 0);
    }

    static one(): int32 {
        return new int32(1, 0);
    }

    static fromInt(int: number): int32 {
        return new int32(int & 0xffff, int >>> 16);
    }

    low() {
        return this.limbs[0];
    }

    high() {
        return this.limbs[1];
    }

    lsb() {
        return this.limbs[0] & 1;
    }

    msb() {
        return (this.limbs[1] >>> 15) & 1;
    }

    add(arg: number|int32): int32 {
        if (arg instanceof int32) {
            return int32_add_int32(this, arg);
        }
        return int32_add_number(this, arg);
    }

    and(arg: number|int32): int32 {
        if (arg instanceof int32) {
            return int32_and_int32(this, arg);
        }
        return int32_and_number(this, arg);
    }

    compare(arg: number|int32): int32 {
        if (typeof arg === 'number') {
            arg = int32.fromInt(arg);
        }
        return int32_compare(this, arg);
    }

    lshift(amount: number): int32 {
        if (amount > 31) {
            return int32.zero();
        }
        return int32_lshift(this, amount);
    }

    not(): int32 {
        return int32_not(this);
    }

    or(arg: number|int32): int32 {
        if (arg instanceof int32) {
            return int32_or_int32(this, arg);
        }
        return int32_or_number(this, arg);
    }

    rshift(amount: number): int32 {
        if (amount > 31) {
            return int32.zero();
        }
        return int32_rshift(this, amount);
    }

    sub(arg: number|int32): int32 {
        if (arg instanceof int32) {
            return int32_sub_int32(this, arg);
        }
        return int32_sub_number(this, arg);
    }

    xor(arg: number|int32): int32 {
        if (arg instanceof int32) {
            return int32_xor_int32(this, arg);
        }
        return int32_xor_number(this, arg);
    }

    toHex(): string {
        const l: string = (this.low() & 0xffff)
            .toString(16)
            .padStart(4, '0');
        const h: string = (this.high() & 0xffff)
            .toString(16)
            .padStart(4, '0');
        return h.concat(l);
    }

    toNumber(): number {
        return (this.low() | (this.high() << 16));
    }

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
    let gt: number = right.sub(left).msb();
    let eq: number = right.xor(left).sub(1).msb();
    return int32.fromInt((gt + gt + eq) - 1);
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
