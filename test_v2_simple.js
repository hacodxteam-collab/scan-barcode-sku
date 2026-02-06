const mysql = require('mysql2/promise');

(async () => {
    try {
        const conn = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'sku_app_db'
        });

        // Try selecting
        try {
            await conn.execute("SELECT 1 FROM activity_logs_v2 LIMIT 1");
            console.log('TABLE_EXISTS_OK');
        } catch (e) {
            console.log('TABLE_MISSING_ERROR: ' + e.message);
        }

        process.exit(0);
    } catch (error) {
        console.log('CONN_ERROR: ' + error.message);
        process.exit(1);
    }
})();
