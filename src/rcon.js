const { createConnection } = require('net');
const Packet = require('./packet');
const Protocol = require('./protocol');

/**
 * @typedef {Object} ClassOptions 
 * @property {string} [host='127.0.0.1'] Server port
 * @property {number} [port=27015] Server port
 * @property {number} [maximumPacketSize=4096] Maximum packet bytes size, zero to unlimit
 * @property {('ascii'|'utf8')} [encoding='ascii'] Socket encoding
 * @property {number} [timeout=1000] Socket timeout (ms)
 */

/**
 * Source RCON (https://developer.valvesoftware.com/wiki/Source_RCON)
 */
class SourceRCON {
    /**
     * @param {ClassOptions} [options] 
     */
    constructor (options = {}) {
        /**
         * Server port
         * @type {string}
         * @default '127.0.0.1'
         */
        this.host = options.host || '127.0.0.1';

        /**
         * Server port
         * @type {number}
         * @default 27015
         */
        this.port = options.port || 27015;

        /**
         * Maximum packet bytes size, zero to unlimit
         * @type {number}
         * @default 4096
         */
        this.maximumPacketSize = options.maximumPacketSize || 4096; // https://developer.valvesoftware.com/wiki/Source_RCON#Packet_Size
        
        /**
         * Socket encoding
         * @type {('ascii'|'utf8')}
         * @default 'ascii'
         */
        this.encoding = options.encoding || 'ascii';

        /**
         * Socket timeout (ms)
         * @type {number}
         * @default 1000
         */
        this.timeout = options.timeout || 1000;

        /**
         * Socket connection
         * @type {net.Socket}
         */
        this.connection = createConnection({
            host: this.host,
            port: this.port
        });

        this.connection.setTimeout(this.timeout); 

        /**
         * Whether server has been authenticated
         * @type {boolean}
         * @default false
         * @private
         */
        this.authenticated = false;
    }

    /**
     * Authenticate to server
     * @param {string} password
     * @returns {Promise<void>}
     */
    authenticate (password) {
        return new Promise((resolve, reject) => {
            if (this.authenticated)
                reject(Error('Already authenticated'))

            // Send a authentication packet (0x02)
            this.write(Protocol.SERVERDATA_AUTH, Protocol.ID_AUTH, password)
                .then((data) => {
                    if (data.id === Protocol.ID_AUTH) { // Request ID !== -1 mean success!
                        this.authenticated = true;
                        resolve();
                    } else {
                        this.disconnect(); // Failed, disconnect from server :(
                        reject(Error('Unable to authenticate'));
                    }
                })
                .catch(reject); // Error from this.write
        });
    }

    /**
     * Disconnect from server and destroy socket connection
     * @returns {Promise<void>}
     */
    disconnect () {
        this.authenticated = false;
        this.connection.destroy();

        return new Promise((resolve, reject) => {
            const onClose = () => {
                this.connection.removeListener('error', onError); // GC
                resolve();
            }

            const onError = e => {
                this.connection.removeListener('close', onClose); // GC
                reject(e);
            }

            this.connection.once('close', onClose);
            this.connection.once('error', onError);
        });
    }

    /**
     * Write to socket connection
     * @param {number} type
     * @param {number} id
     * @param {string} body
     * @returns {Promise<DecodedPacket>}
     */
    write (type, id, body) {
        return new Promise((resolve, reject) => {
            const onData = packet => {
                const decodedPacket = Packet.decode(packet, this.encoding);

                // Because server will response twice(0x00 and 0x02) if we send authenticate packet(0x03)
                // but we need 0x02 for confirm
                if (type === Protocol.SERVERDATA_AUTH && decodedPacket.type !== Protocol.SERVERDATA_AUTH_RESPONSE) 
                    return;

                this.connection.removeListener('error', onError); // GC
                resolve(decodedPacket); // Let's return our decoded packet data!
            }

            const onError = e => {
                this.connection.removeListener('data', onData); // GC
                reject(e);
            }

            const encodedPacket = Packet.encode(type, id, body, this.encoding);

            // Check packet size with option.maximumPacketSize
            if (this.maximumPacketSize > 0 && encodedPacket.length > this.maximumPacketSize)
                reject(Error('Packet too long'));

            this.connection.on('data', onData); // This event can emit multiple time (i.g. Authentication, Multiple-Packet Responses)
            this.connection.once('error', onError);
            this.connection.write(encodedPacket);
        });
    }

    /**
     * Execute command to server
     * @param {string} command
     * @returns {Promise<string>} Response string
     */
    execute (command) {
        return new Promise((resolve, reject) => {
            if (!this.connection.writable)
                reject(Error('Unable to write to socket'));

            if (!this.authenticated)
                reject(Error('Unable to authenticate'));

            this.write(Protocol.SERVERDATA_EXECCOMMAND, Protocol.ID_REQUEST, command, this.encoding)
                .then(data => resolve(data.body.replace(/\n$/, ''))) // Last new line must be gooone 
                .catch(reject);
        });
    }
}

/**
 * SourceRCON module
 * @module rcon
 */
module.exports = SourceRCON