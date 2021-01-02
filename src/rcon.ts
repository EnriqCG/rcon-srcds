import { createConnection, Socket } from 'net'
import protocol from './protocol'
import * as packets from './packet'

class RCON {
    host: string
    port: number
    maxPacketSize: number
    encoding: packets.EncodingOptions
    timeout: number
    connection!: Socket
    connected: boolean
    authenticated: boolean

    /**
     * Source RCON (https://developer.valvesoftware.com/wiki/Source_RCON)
     * @param options Connection options
     */
    constructor(options: RCONOptions) {
        this.host = options.host || '127.0.0.1'
        this.port = options.port || 27015
        this.maxPacketSize = options.maxPacketSize || 4096
        this.encoding = options.encoding || 'ascii'
        this.timeout = options.timeout || 1000

        this.authenticated = false
        this.connected = false
    }

    /**
     * Authenticates the connection
     * @param password Password string
     */
    async authenticate(password: string): Promise<boolean> {

        if (!this.connected) {
            await this.connect()
        }

        return new Promise((resolve, reject) => {
            if (this.authenticated) {
                reject(Error('Already authenticated'))
                return
            }

            this.write(protocol.SERVERDATA_AUTH, protocol.ID_AUTH, password)
                .then((data) => {
                    if (data === true) {
                        this.authenticated =  true
                        resolve(true)
                    } else {
                        this.disconnect()
                        reject(Error('Unable to authenticate'))
                    }
                }).catch(reject)
        })
    }

    /**
     * Executes command on the server
     * @param command Command to execute
     */
    execute(command: string): Promise<string | boolean> {
        return new Promise((resolve, reject) => {
            if (!this.connected) {
                reject(Error('Already disconnected. Please reauthenticate.'))
                return
            }
            const packetId = Math.floor(Math.random() * (256 - 1) + 1)
            if (!this.connection.writable) {
                reject(Error('Unable to write to socket'))
                return
            }

            if (!this.authenticated) {
                reject(Error('Not authorized'))
                return
            }

            this.write(protocol.SERVERDATA_EXECCOMMAND, packetId, command)
                .then(resolve)
                .catch(reject)
        })
    }

    /**
     * Creates a connection to the socket
     */
    private connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.connection = createConnection({
                host: this.host,
                port: this.port
            }, () => {
                if (this.connection) this.connection.removeListener('error', reject)
                this.connected = true
                resolve()
            })

            this.connection.once('error', reject)
            this.connection.setTimeout(this.timeout)

        })
    }

    /**
     * Destroys the socket connection
     */
    disconnect(): Promise<void> {
        this.authenticated = false
        this.connected = false
        this.connection.destroy()

        return new Promise((resolve, reject) => {
            const onError = (e: Error): void => {
                this.connection.removeListener('close', onClose)
                reject(e)
            }

            const onClose = (): void => {
                this.connection.removeListener('error', onError)
                resolve()
            }

            this.connection.once('close', onClose)
            this.connection.once('error', onError)
        })
    }

    isConnected(): boolean {
        return this.connected
    }

    isAuthenticated(): boolean {
        return this.authenticated
    }

    /**
     * Writes to socket connection
     * @param type Packet Type
     * @param id Packet ID
     * @param body Packet payload
     */
    private write(type: number, id: number, body: string): Promise<string | boolean> {
        return new Promise((resolve, reject) => {

            let response = ''

            const onData = (packet: Buffer): void => {
                const decodedPacket = packets.decode(packet, this.encoding)

                // Server will respond twice (0x00 and 0x02) if we send an auth packet (0x03)
                // but we need 0x02 to confirm
                if (type === protocol.SERVERDATA_AUTH && decodedPacket.type !== protocol.SERVERDATA_AUTH_RESPONSE) {
                    return
                } else if (type === protocol.SERVERDATA_AUTH && decodedPacket.type === protocol.SERVERDATA_AUTH_RESPONSE) {
                    if (decodedPacket.id === protocol.ID_AUTH) {
                        resolve(true)
                    } else {
                        resolve(false)
                    }

                    this.connection.removeListener('data', onData)
                } else if (id === decodedPacket.id) {
                    response = response.concat(decodedPacket.body.replace(/\n$/, '\n')) // remove last line break

                    // Check the response if it's defined rather than if it contains 'command ${body}'
                    // Reason for this is because we no longer need to check if it starts with 'command', testing shows it never will
                    if (response) {
                        this.connection.removeListener('data', onData)
                        resolve(response)
                    }
                }

                this.connection.removeListener('error', onError)
            }

            const onError = (e: Error): void => {
                this.connection.removeListener('data', onData)
                reject(e)
            }

            const encodedPacket = packets.encode(type, id, body, this.encoding)

            if (this.maxPacketSize > 0 && encodedPacket.length > this.maxPacketSize) {
                reject(Error('Packet size too big'))
                return
            }

            this.connection.on('data', onData)
            this.connection.on('error', onError)
            this.connection.write(encodedPacket)
        })
    }
}

interface RCONOptions {
    host?: string
    port?: number
    maxPacketSize?: number
    encoding?: packets.EncodingOptions
    timeout?: number
}

export default RCON
