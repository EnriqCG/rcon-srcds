# RCON library for NodeJS
[According to Valve's RCON specification](https://developer.valvesoftware.com/wiki/Source_RCON_Protocol)

## Install
```console
npm install rcon-srcds --save
```

## Usage
```typescript
// ES5 import
const server = new Rcon(options);

// ES5+ import
import Rcon from 'rcon-srcds';
```

### Options
These are the default values.
```typescript
{
    host: '127.0.0.1',          // Host
    port: 27015,                // Port
    maximumPacketSize: 0,       // Maximum packet bytes (0 = no limit)
    encoding: 'ascii',          // Packet encoding (ascii, utf8)
    timeout: 1000               // in ms
}
```

*The maximum possible value of packet size is **4096** bytes*: https://developer.valvesoftware.com/wiki/Source_RCON_Protocol#Packet_Size

## Minecraft Compatibility
Although the package name implies exclusive compatibility with Source games, Minecraft servers also use Valve's RCON implementation, so there should not be any issues using this package for your Minecraft projects!

## Examples
Using async/await:
```typescript
import Rcon from 'rcon-srcds';
const server = new Rcon({ host: '127.0.0.1', port: 25010 });
try {
    await server.authenticate('your_rcon_password');
    console.log('authenticated');
    let status = await server.execute('status'); // You can read `status` reponse
    server.execute('mp_autokick 0'); // no need to read the response
} catch(e) {
    console.error(e);
}
```
Using (native) promises:
```typescript
import Rcon from 'rcon-srcds';
const server = new Rcon({ port: 25010 });

server.authenticate('rcon_password')
    .then(() => {
        console.log('authenticated');
        return server.execute('status');
    })
    .then(console.log)
    .catch(console.error);
```
