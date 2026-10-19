const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MySQL Database Connection Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'balaji_transport',
    port: process.env.DB_PORT || 3306
});

// 1. PUBLIC API: Track GR Number
app.get('/api/track/:grNumber', async (req, res) => {
    try {
        const [shipment] = await pool.query('SELECT * FROM shipments WHERE gr_number = ?', [req.params.grNumber]);
        if (shipment.length === 0) {
            return res.status(404).json({ success: false, message: "GR Number not found!" });
        }
        const [logs] = await pool.query('SELECT * FROM tracking_logs WHERE gr_number = ? ORDER BY updated_at DESC', [req.params.grNumber]);
        
        res.json({ success: true, shipment: shipment[0], trackingHistory: logs });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 2. ADMIN API: Create New GR / Shipment
app.post('/api/admin/shipment', async (req, res) => {
    const { gr_number, sender_name, receiver_name, origin, destination, goods_description, weight_quintal, freight_amount } = req.body;
    try {
        await pool.query(
            'INSERT INTO shipments (gr_number, sender_name, receiver_name, origin, destination, goods_description, weight_quintal, freight_amount, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, "Booked")',
            [gr_number, sender_name, receiver_name, origin, destination, goods_description, weight_quintal, freight_amount]
        );
        await pool.query(
            'INSERT INTO tracking_logs (gr_number, status_update, location_name) VALUES (?, "बुकिंग दर्ज की गई (Booked)", ?)',
            [gr_number, origin]
        );
        res.json({ success: true, message: "New GR created successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 3. ADMIN API: Update Status / Location Milestone
app.post('/api/admin/update-status', async (req, res) => {
    const { gr_number, status_update, location_name, new_status } = req.body;
    try {
        await pool.query(
            'INSERT INTO tracking_logs (gr_number, status_update, location_name) VALUES (?, ?, ?)',
            [gr_number, status_update, location_name]
        );
        if (new_status) {
            await pool.query('UPDATE shipments SET status = ? WHERE gr_number = ?', [new_status, gr_number]);
        }
        res.json({ success: true, message: "Tracking status updated successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Balaji Transport Backend running on port ${PORT}`);
});
