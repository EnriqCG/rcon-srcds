/**
 * Packet Types
 * Reference: https://developer.valvesoftware.com/wiki/Source_RCON#Requests_and_Responses
 *
 * @readonly
 */
const protocol = Object.freeze({
    SERVERDATA_AUTH: 0x03,              // First packet for authentication
    SERVERDATA_EXECCOMMAND: 0x02,       // Command issued to the server
    SERVERDATA_AUTH_RESPONSE: 0x02,     // Response of SERVERDATA_AUTH, body === -1 means failed
    SERVERDATA_RESPONSE_VALUE: 0x00,    // Response of SERVERDATA_EXECCOMMAND

    ID_AUTH: 0x999,
    ID_REQUEST: 0x123
})

export default protocol
