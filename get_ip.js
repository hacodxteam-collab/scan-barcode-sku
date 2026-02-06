const os = require('os');
const networkInterfaces = os.networkInterfaces();

let ipAddress = 'localhost';

for (const interfaceName in networkInterfaces) {
    const interfaces = networkInterfaces[interfaceName];
    for (const iface of interfaces) {
        // Skip internal (i.e. 127.0.0.1) and non-ipv4 addresses
        if (iface.family === 'IPv4' && !iface.internal) {
            ipAddress = iface.address;
            console.log(ipAddress);
            // We take the first one found, assuming it's the main adapter
            process.exit(0);
        }
    }
}

console.log('localhost'); // Fallback
