const Protocol = require('./protocol');

/**
 * @typedef {Object} DecodedPacket
 * @property {number} size
 * @property {number} id
 * @property {number} type
 * @property {string} body
 */

/**
 * Encode data to packet buffer
 * @param {number} type 
 * @param {number} id 
 * @param {string} body 
 * @param {('ascii'|'utf8')} [encoding='ascii']
 * @returns {Buffer} Encoded packet buffer
 */
function encode (type, id, body, encoding = 'ascii') {
    const size      = Buffer.byteLength(body) + 14, // body size + 10 + 4 (Null)
          buffer    = Buffer.alloc(size); // Create a new allocated buffer

    buffer.writeInt32LE(size - 4,   0); // (4 bytes) Size,  All packet size but 'packet size'(4 bytes) field
    buffer.writeInt32LE(id,         4); // (4 bytes) Id,    Unique packet ID
    buffer.writeInt32LE(type,       8); // (4 bytes) Type,  Packet Type (0x03, 0x02 or 0x00)
    buffer.write(body, 12, size - 2, encoding);  // (>= 1 bytes) Body,   Encoded body
    buffer.writeInt16LE(0, size - 2);   // (1 bytes) Null,  Null terminated string 

    return buffer;
}

/**
 * Decode packet buffer to data
 * @param {Buffer} buf 
 * @param {('ascii'|'utf8')} [encoding='ascii']
 * @returns {DecodedPacket} Decoded packet object
 */
function decode (buf, encoding = 'ascii') {
    return {
        size:   buf.readInt32LE(0),
        id:     buf.readInt32LE(4),
        type:   buf.readInt32LE(8),
        body:   buf.toString(encoding, 12, buf.byteLength - 2)
    };
}

module.exports = { encode, decode }