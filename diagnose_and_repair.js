const mysql = require('mysql2/promise');
const fs = require('fs');

(async () => {
    let output = '';
    const log = (msg) => {
        console.log(msg);
        output += msg + '\n';
    };

    try {
        log('Connecting...');
        const conn = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'sku_app_db'
        });

        // 1. Check Structure
        log('--- BEFORE ---');
        const [cols] = await conn.execute("DESCRIBE activity_logs");
        cols.forEach(c => log(`${c.Field} (${c.Type})`));

        const hasDevice = cols.some(c => c.Field === 'device');

        if (!hasDevice) {
            log('Adding device column...');
            await conn.execute("ALTER TABLE activity_logs ADD COLUMN device TEXT");
            log('Column added.');
        } else {
            log('Device column exists. Modifying to TEXT to be safe...');
            await conn.execute("ALTER TABLE activity_logs MODIFY COLUMN device TEXT");
            log('Column modified.');
        }

        // 2. Test Insert
        log('Testing INSERT...');
        await conn.execute(
            'INSERT INTO activity_logs (action_type, user_name, details, device) VALUES (?, ?, ?, ?)',
            ['TEST', 'System', 'Db Repair Check', 'Repair Script']
        );
        log('INSERT SUCCESSFUL.');

        await conn.end();
        fs.writeFileSync('repair_result.txt', output);
        process.exit(0);
    } catch (error) {
        log('ERROR: ' + error.message);
        fs.writeFileSync('repair_result.txt', output);
        process.exit(1);
    }
})();
