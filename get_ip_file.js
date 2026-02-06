const os = require('os');
const fs = require('fs');
const networkInterfaces = os.networkInterfaces();

let ipAddress = 'localhost';

for (const interfaceName in networkInterfaces) {
    const interfaces = networkInterfaces[interfaceName];
    for (const iface of interfaces) {
        if (iface.family === 'IPv4' && !iface.internal) {
            ipAddress = iface.address;
            break;
        }
    }
    if (ipAddress !== 'localhost') break;
}

fs.writeFileSync('ip_address.txt', ipAddress);
console.log('IP Saved:', ipAddress);
