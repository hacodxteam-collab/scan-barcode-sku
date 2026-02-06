const mysql = require('mysql2/promise');

(async () => {
    try {
        console.log('Connecting...');
        const conn = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'sku_app_db'
        });

        console.log('Dropping table...');
        await conn.execute("DROP TABLE IF EXISTS activity_logs");

        console.log('Recreating table...');
        await conn.execute(`
            CREATE TABLE activity_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                action_type VARCHAR(50) NOT NULL,
                user_name VARCHAR(100),
                details TEXT,
                device TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('✅ TABLE RECREATED SUCCESSFULLY!');
        await conn.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ FATAL ERROR:', error);
        process.exit(1);
    }
})();
