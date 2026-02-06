const mysql = require('mysql2/promise');
require('dotenv').config({ path: './server/.env' });

(async () => {
    try {
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'sku_app_db'
        });

        const [rows] = await conn.execute("SELECT * FROM users WHERE employee_id = '1600'");
        console.log('User 1600:', rows);

        await conn.end();
        process.exit(0);
    } catch (error) {
        console.error('DB Error:', error);
        process.exit(1);
    }
})();
