const mysql = require('mysql2/promise');
const fs = require('fs');

(async () => {
    try {
        const conn = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'sku_app_db'
        });

        const [rows] = await conn.execute("SELECT id, employee_id, first_name FROM users");

        let output = "USERS IN DB:\n";
        rows.forEach(r => {
            output += `ID: ${r.id}, EmpID: ${r.employee_id}, Name: ${r.first_name}\n`;
        });

        fs.writeFileSync('users_list.txt', output);
        console.log('Dumped users to users_list.txt');

        await conn.end();
        process.exit(0);
    } catch (error) {
        fs.writeFileSync('users_list.txt', 'ERROR: ' + error.message);
        process.exit(1);
    }
})();
