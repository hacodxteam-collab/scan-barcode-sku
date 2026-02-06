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

        console.log('Running ALTER TABLE...');
        try {
            await conn.execute("ALTER TABLE activity_logs ADD COLUMN device VARCHAR(191) DEFAULT 'Unknown'");
            console.log('✅ Column ADDED.');
        } catch (e) {
            console.log('⚠️ Alter result: ' + e.message);
        }

        console.log('Verifying table structure...');
        const [rows] = await conn.execute("DESCRIBE activity_logs");
        const hasDevice = rows.some(r => r.Field === 'device');

        console.log(hasDevice ? '✅ DEVICE COLUMN EXISTS!' : '❌ DEVICE COLUMN MISSING!');

        await conn.end();
        process.exit(0);
    } catch (error) {
        console.error('CRITICAL DB ERROR:', error);
        process.exit(1);
    }
})();
