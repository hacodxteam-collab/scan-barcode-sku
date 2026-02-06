const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config({ path: './server/.env' });

(async () => {
    try {
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'sku_app_db'
        });

        // Delete existing 9999 to be safe
        await conn.execute("DELETE FROM users WHERE employee_id = '9999'");

        // Insert fresh
        await conn.execute(`
            INSERT INTO users (employee_id, first_name, last_name, role, password, department, title) 
            VALUES ('9999', 'Super', 'Admin', 'admin', '1234', 'IT', 'Mr.')
        `);

        // Check
        const [rows] = await conn.execute("SELECT * FROM users WHERE employee_id = '9999'");

        fs.writeFileSync('db_check.txt', JSON.stringify(rows, null, 2));
        console.log('User reset complete. Check db_check.txt');

        await conn.end();
        process.exit(0);
    } catch (error) {
        fs.writeFileSync('db_check.txt', 'ERROR: ' + error.message);
        console.error('DB Error:', error);
        process.exit(1);
    }
})();
