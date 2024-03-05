# RCON library for NodeJS
[According to Valve's RCON specification](https://developer.valvesoftware.com/wiki/Source_RCON_Protocol)

## Install
This version of rcon-srcds is an ES Module and requires Node 14+.

```console
npm install rcon-srcds --save
```

## Usage
```typescript
import { RCON, RCONOptions } from 'rcon-srcds';

// These are the default values.
const options: RCONOptions = {
    host: '127.0.0.1',          // Host
    port: 27015,                // Port
    maximumPacketSize: 0,       // Maximum packet bytes (0 = no limit)
    encoding: 'utf8',           // Packet encoding (ascii, utf8)
    timeout: 1000               // in ms
}
const rcon = new RCON(options);

// using async/await
try {
    await rcon.authenticate('your_rcon_password');
    console.log('authenticated');
    let status = await rcon.execute('status'); // You can read `status` reponse
    rcon.execute('mp_autokick 0'); // no need to read the response
} catch(e) {
    console.error(e);
}

// Using promises
rcon.authenticate('your_rcon_password')
    .then(() => {
        console.log('authenticated');
        return rcon.execute('status');
    })
    .then((response) => {
        console.log(response)
    })
    .catch((e) => {
        console.log(e);
    });
```

*The maximum possible value of packet size is **4096** bytes*:
https://developer.valvesoftware.com/wiki/Source_RCON_Protocol#Packet_Size

## Minecraft Compatibility
Although the package name implies exclusive compatibility with Source games, Minecraft servers also use Valve's RCON
implementation, so there should not be any issues using this package for your Minecraft projects!
