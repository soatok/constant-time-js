export function uint8array_to_hex(input: Uint8Array): string {
    return Buffer.from(input).toString('hex');
}
