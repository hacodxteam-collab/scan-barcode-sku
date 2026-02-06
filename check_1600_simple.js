const mysql = require('mysql2/promise');

(async () => {
    try {
        const conn = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'sku_app_db'
        });

        const [rows] = await conn.execute("SELECT * FROM users WHERE employee_id = '1600'");
        if (rows.length > 0) {
            console.log('FOUND: ' + JSON.stringify(rows[0]));
        } else {
            console.log('NOT FOUND');
        }

        await conn.end();
        process.exit(0);
    } catch (error) {
        console.log('ERROR: ' + error.message);
        process.exit(1);
    }
})();
