const http = require('http');

const data = JSON.stringify({
    actionType: 'TEST_LOG',
    userName: 'Debug Bot',
    details: 'Testing API direct connection',
    device: 'NodeJS Script'
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/logs',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
