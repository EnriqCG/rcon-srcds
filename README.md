# RCON library for NodeJS
[According to Valve's RCON specification](https://developer.valvesoftware.com/wiki/Source_RCON_Protocol)

## Install
```console
npm install rcon-srcds --save
```

## Usage
```javascript
const server = new Rcon(options);
```

### Options
These are the default values.
```javascript
{
    host: '127.0.0.1',          // Host
    port: 27015,                // Port

    maximumPacketSize: 0,       // Maximum packet bytes (0 = no limit)
    encoding: 'ascii',          // Packet encoding (ascii, utf8)
    timeout: 1000               // ms
}
```

Remember you can't send a packet larger then 4096 bytes: https://developer.valvesoftware.com/wiki/Source_RCON_Protocol#Packet_Size

## Example
Async example (cleaner & more readable)
```javascript
try {
    await server.authenticate('your_rcon_password');
    console.log("Authenticated");
    let status = await server.execute("status"); // You can parse `status` reponse
    server.execute("mp_autokick 0"); // This call will not be asynchronous
} catch(e) {
    console.error(e);
}
```
Legacy example
```javascript
const rcon = require('rcon-srcds');
const server = new Rcon({ port: 25010 });

server.authenticate('rcon_password')
    .then(() => {
        console.log('Authenticated');
        return server.execute('status');
    })
    .then(console.log)
    .catch(console.error);
```