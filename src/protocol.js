/**
 * Packet Type
 * https://developer.valvesoftware.com/wiki/Source_RCON#Requests_and_Responses
 * @readonly
 * @enum {number}
 */
module.exports = Object.freeze({
    SERVERDATA_AUTH: 0x03,              // First packet for authenticate
    SERVERDATA_EXECCOMMAND: 0x02,       // Execute commands
    SERVERDATA_AUTH_RESPONSE: 0x02,     // Response of SERVERDATA_AUTH, body === -1 mean failed
    SERVERDATA_RESPONSE_VALUE: 0x00,    // Response of SERVERDATA_EXECCOMMAND

    ID_AUTH: 0x999,
    ID_REQUEST: 0x123
});