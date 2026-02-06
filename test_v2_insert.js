const mysql = require('mysql2/promise');

(async () => {
    try {
        const conn = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'sku_app_db'
        });

        console.log('Testing INSERT into activity_logs_v2...');
        await conn.execute(
            'INSERT INTO activity_logs_v2 (action_type, user_name, details, device) VALUES (?, ?, ?, ?)',
            ['TEST', 'Debug Bot', 'Direct Insert Check', 'Test Script']
        );

        console.log('✅ INSERT SUCCESSFUL.');
        await conn.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ INSERT FAILED:', error.message);
        process.exit(1);
    }
})();
