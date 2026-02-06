const mysql = require('mysql2/promise');

(async () => {
    try {
        const conn = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'sku_app_db'
        });

        console.log('Attempting INSERT with device column...');
        await conn.execute(
            'INSERT INTO activity_logs (action_type, user_name, details, device) VALUES (?, ?, ?, ?)',
            ['TEST', 'Debug Bot', 'Test Log', 'Test Device']
        );

        console.log('SUCCESS: Log inserted.');
        await conn.end();
        process.exit(0);
    } catch (error) {
        console.log('FAIL: ' + error.message);
        process.exit(1);
    }
})();
