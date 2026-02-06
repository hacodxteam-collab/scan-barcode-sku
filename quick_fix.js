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
        console.log('Connected!');

        console.log('Deleting 9999...');
        await conn.execute("DELETE FROM users WHERE employee_id = '9999'");

        console.log('Inserting 9999...');
        await conn.execute(`
            INSERT INTO users (employee_id, first_name, last_name, role, password, department, title) 
            VALUES ('9999', 'Super', 'Admin', 'admin', '1234', 'IT', 'Mr.')
        `);

        console.log('DONE!');
        await conn.end();
        process.exit(0);
    } catch (error) {
        console.error('ERROR:', error);
        process.exit(1);
    }
})();
