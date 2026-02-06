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

        console.log('Adding device column to activity_logs...');

        try {
            await conn.execute("ALTER TABLE activity_logs ADD COLUMN device VARCHAR(100)");
            console.log('✅ Column device added successfully.');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️ Column device already exists.');
            } else {
                throw err;
            }
        }

        await conn.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ DB Error:', error);
        process.exit(1);
    }
})();
