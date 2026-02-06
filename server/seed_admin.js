const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sku_app_db'
};

async function seed() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        const [rows] = await connection.execute('SELECT * FROM users WHERE employee_id = ?', ['9999']);

        if (rows.length === 0) {
            await connection.execute(`
                INSERT INTO users (employee_id, first_name, last_name, role, password, department) 
                VALUES ('9999', 'Super', 'Admin', 'admin', '1234', 'IT')
            `);
            console.log('User 9999 inserted successfully.');
        } else {
            console.log('User 9999 already exists.');
        }

        await connection.end();
    } catch (err) {
        console.error('Error seeding admin:', err);
    }
}

seed();
