const mysql = require('mysql2/promise');

(async () => {
    try {
        const conn = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'sku_app_db'
        });

        console.log('Creating activity_logs_v2...');
        await conn.execute(`
            CREATE TABLE IF NOT EXISTS activity_logs_v2 (
                id INT AUTO_INCREMENT PRIMARY KEY,
                action_type VARCHAR(50),
                user_name VARCHAR(100),
                details TEXT,
                device VARCHAR(255) DEFAULT 'Unknown',
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('✅ New Table Created: activity_logs_v2');
        await conn.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
})();
