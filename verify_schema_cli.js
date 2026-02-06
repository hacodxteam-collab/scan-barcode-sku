const mysql = require('mysql2/promise');

(async () => {
    try {
        const conn = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'sku_app_db'
        });

        const [rows] = await conn.execute("SHOW COLUMNS FROM activity_logs");
        console.log('Current Columns:');
        rows.forEach(r => console.log(`- ${r.Field} (${r.Type})`));

        // Try to add it if missing
        const hasDevice = rows.some(r => r.Field === 'device');
        if (!hasDevice) {
            console.log('Attempting to ADD COLUMN device...');
            try {
                await conn.execute("ALTER TABLE activity_logs ADD COLUMN device TEXT");
                console.log('Column ADDED successfully.');
            } catch (err) {
                console.log('Failed to add column: ' + err.message);
            }
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
