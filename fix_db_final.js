const mysql = require('mysql2/promise');
const fs = require('fs');

(async () => {
    let log = '';
    try {
        const conn = await mysql.createConnection({ host: 'localhost', user: 'root', password: '', database: 'sku_app_db' });

        // 1. Drop & Create
        await conn.execute("DROP TABLE IF EXISTS activity_logs");
        await conn.execute(`CREATE TABLE activity_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            action_type VARCHAR(50),
            user_name VARCHAR(100),
            details TEXT,
            device VARCHAR(255),
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        log += 'Table Recreated.\n';

        // 2. Insert Test
        await conn.execute("INSERT INTO activity_logs (action_type, details, device) VALUES ('TEST', 'Init', 'Script')");
        log += 'Insert Success.\n';

        await conn.end();
        fs.writeFileSync('db_fix_status.txt', 'SUCCESS\n' + log);
    } catch (e) {
        fs.writeFileSync('db_fix_status.txt', 'ERROR: ' + e.message);
    }
    process.exit(0);
})();
