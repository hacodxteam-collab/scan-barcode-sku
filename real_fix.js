const mysql = require('mysql2/promise');

(async () => {
    try {
        console.log('Connecting to DB...');
        const conn = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'sku_app_db'
        });

        // 1. Delete if exists
        await conn.execute("DELETE FROM users WHERE employee_id = '9999'");

        // 2. Insert confirm
        await conn.execute(`
            INSERT INTO users (employee_id, first_name, last_name, role, password) 
            VALUES ('9999', 'Super', 'Admin', 'admin', '1234')
        `);

        console.log('✅ User 9999 INSERTED!');
        await conn.end();
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
})();
