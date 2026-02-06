const mysql = require('mysql2/promise');
require('dotenv').config({ path: './server/.env' });

(async () => {
    try {
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
        const [rows] = await conn.execute('SELECT * FROM users');
        console.log('Users in DB:');
        console.table(rows);
        process.exit(0);
    } catch (error) {
        console.error('DB Error:', error);
        process.exit(1);
    }
})();
