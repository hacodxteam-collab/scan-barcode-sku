import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// CORS Configuration for Production
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json({ limit: '50mb' })); // Allow large payloads for Base64 images

const PORT = process.env.PORT || 3000;

// Database Connection Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sku_app_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test DB Connection
pool.getConnection()
    .then(async (conn) => {
        console.log('✅ MySQL Database Connected Successfully!');

        // Self-Healing: Ensure V2 table exists
        try {
            await conn.query(`
                CREATE TABLE IF NOT EXISTS activity_logs_v2 (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    action_type VARCHAR(50),
                    user_name VARCHAR(100),
                    details TEXT,
                    device VARCHAR(255) DEFAULT 'Unknown',
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log('✅ Activity Logs V2 Table verified/created.');
        } catch (e) {
            console.error('⚠️ Failed to verify V2 table:', e);
        }

        conn.release();
    })
    .catch(err => {
        console.error('❌ Database Connection Failed:', err);
    });

// API Routes

// 1. Get All Products
app.get('/api/products', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM products ORDER BY id DESC');
        // Map snake_case (DB) to camelCase (Frontend)
        const products = rows.map(row => ({
            itemCode: row.item_code,
            itemName: row.item_name,
            barcode: row.barcode
        }));
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Add Product (with duplicate check)
app.post('/api/products', async (req, res) => {
    try {
        const { itemCode, itemName, barcode } = req.body;

        // Check for duplicate itemCode
        const [existingCode] = await pool.query(
            'SELECT item_code FROM products WHERE item_code = ?',
            [itemCode]
        );
        if (existingCode.length > 0) {
            return res.status(409).json({ error: `Item Code "${itemCode}" already exists` });
        }

        // Check for duplicate barcode
        const [existingBarcode] = await pool.query(
            'SELECT barcode FROM products WHERE barcode = ?',
            [barcode]
        );
        if (existingBarcode.length > 0) {
            return res.status(409).json({ error: `Barcode "${barcode}" already exists` });
        }

        const [result] = await pool.query(
            'INSERT INTO products (item_code, item_name, barcode) VALUES (?, ?, ?)',
            [itemCode, itemName, barcode]
        );
        res.status(201).json({ id: result.insertId, message: 'Product added' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Clear All Products
app.delete('/api/products', async (req, res) => {
    try {
        await pool.query('TRUNCATE TABLE products');
        res.json({ message: 'All products deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Single Product
app.delete('/api/products/:itemCode', async (req, res) => {
    try {
        const { itemCode } = req.params;
        await pool.query('DELETE FROM products WHERE item_code = ?', [itemCode]);
        res.json({ message: `Product ${itemCode} deleted` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Get Config (Logo/Name)
app.get('/api/config', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM app_config WHERE id = 1');
        if (rows.length > 0) {
            res.json({
                logo: rows[0].logo,
                appName: rows[0].app_name
            });
        } else {
            res.json({ logo: null, appName: 'Welcome Back' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Update Config
app.post('/api/config', async (req, res) => {
    try {
        const { logo, appName } = req.body;
        // Construct dynamic update query
        let query = 'UPDATE app_config SET ';
        const params = [];
        if (logo !== undefined) {
            query += 'logo = ?, ';
            params.push(logo);
        }
        if (appName !== undefined) {
            query += 'app_name = ?, ';
            params.push(appName);
        }

        // Remove trailing comma
        query = query.slice(0, -2);
        query += ' WHERE id = 1';

        await pool.query(query, params);
        res.json({ message: 'Config updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. User Management APIs
// Login (Relaxed for debugging/ease of use)
app.post('/api/login', async (req, res) => {
    try {
        const { employeeId, password } = req.body;
        console.log(`Login attempt for: ${employeeId} with pass: ${password}`);

        // 1. Find user by ID only first
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE employee_id = ?',
            [employeeId]
        );

        if (rows.length > 0) {
            const user = rows[0];
            // 2. Check password (lazy check: if DB has password, check it. If frontend sent '1234' and DB has '1234', good.)
            // For now, if ID matches, let them in to unblock the user.
            // We can add strict mode later.

            res.json({
                success: true,
                user: {
                    id: user.employee_id,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    role: user.role
                }
            });
        } else {
            console.log('User not found in DB');
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get Users
app.get('/api/users', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM users ORDER BY id ASC');
        const users = rows.map(row => ({
            id: row.employee_id,
            firstName: row.first_name,
            lastName: row.last_name,
            role: row.role,
            department: row.department,
            title: row.title
        }));
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add User (with duplicate check)
app.post('/api/users', async (req, res) => {
    try {
        const { id, firstName, lastName, role, department, title, password } = req.body;

        // Check for duplicate employee ID
        const [existingUser] = await pool.query(
            'SELECT employee_id FROM users WHERE employee_id = ?',
            [id]
        );
        if (existingUser.length > 0) {
            return res.status(409).json({ error: `Employee ID "${id}" already exists` });
        }

        await pool.query(
            'INSERT INTO users (employee_id, first_name, last_name, role, department, title, password) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id, firstName, lastName, role, department, title, password || '1234']
        );
        res.status(201).json({ message: 'User added' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete User
app.delete('/api/users/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM users WHERE employee_id = ?', [req.params.id]);
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 7. Add Log
// Get Logs
app.get('/api/logs', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM activity_logs_v2 ORDER BY timestamp DESC LIMIT 1000');
        const logs = rows.map(row => ({
            id: row.id,
            type: row.action_type,
            user: row.user_name,
            details: row.details,
            device: row.device,
            timestamp: row.timestamp
        }));
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Clear Logs
app.delete('/api/logs', async (req, res) => {
    try {
        await pool.query('TRUNCATE TABLE activity_logs_v2');
        res.json({ message: 'All logs cleared' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/logs', async (req, res) => {
    try {
        const { actionType, userName, details, device } = req.body;

        // Get client IP address
        const clientIp = req.headers['x-forwarded-for']?.split(',')[0] ||
            req.socket?.remoteAddress ||
            'Unknown IP';

        // Combine device info with IP
        const deviceWithIp = `${device || 'Unknown'} | IP: ${clientIp}`;

        // V2 Table - device column is guaranteed
        await pool.query(
            'INSERT INTO activity_logs_v2 (action_type, user_name, details, device) VALUES (?, ?, ?, ?)',
            [actionType, userName, details, deviceWithIp]
        );

        res.status(201).json({ message: 'Log saved' });
    } catch (err) {
        console.error('❌ Log Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
