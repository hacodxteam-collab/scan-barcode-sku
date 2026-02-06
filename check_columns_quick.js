const mysql = require('mysql2/promise');

(async () => {
    const conn = await mysql.createConnection({ host: 'localhost', user: 'root', password: '', database: 'sku_app_db' });
    const [rows] = await conn.execute("SHOW COLUMNS FROM activity_logs LIKE 'device'");
    console.log(rows.length > 0 ? 'HAS_DEVICE_COLUMN' : 'MISSING_DEVICE_COLUMN');
    process.exit(0);
})();
