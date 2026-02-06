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
        console.log('COLUMNS IN activity_logs:');
        rows.forEach(r => console.log(`- ${r.Field} (${r.Type})`));

        await conn.end();
        process.exit(0);
    } catch (error) {
        console.log('ERROR: ' + error.message);
        process.exit(1);
    }
})();
