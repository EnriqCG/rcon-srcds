/**
 *  Encode data to packet buffer
 * @param type Packet Type
 * @param id Packet ID
 * @param body Packet body (payload)
 * @param encoding Body encoding
 * @returns Encoded packet buffer
 */
export const encode = (type: number, id: number, body: string, encoding: EncodingOptions = 'ascii'): Buffer => {
    const size = Buffer.byteLength(body) + 14 // body size + 10 + 4 (Null)
    const buffer = Buffer.alloc(size)

    buffer.writeInt32LE(size - 4, 0)
    buffer.writeInt32LE(id, 4)
    buffer.writeInt32LE(type, 8)
    buffer.write(body, 12, size - 2, encoding)
    buffer.writeInt16LE(0, size - 2)

    return buffer
}

/**
 * Decodes packet buffer to data
 * @param buf Buffer to decode
 * @param encoding Body encoding
 * @returns Decoded packet object
 */
export const decode = (buf: Buffer, encoding: EncodingOptions = 'ascii'): DecodedPacket => {
    return {
        size: buf.readInt32LE(0),
        id: buf.readInt32LE(4),
        type: buf.readInt32LE(8),
        body: buf.toString(encoding, 12, buf.byteLength - 2)
    }
}

interface DecodedPacket {
    size: number
    id: number
    type: number
    body: string
}

export type EncodingOptions = 'ascii' | 'utf8'
