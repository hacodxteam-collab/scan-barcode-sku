# 🚀 การ Deploy Scan Barcode SKU ขึ้นเว็บ

คู่มือนี้จะพาคุณ Deploy แอพขึ้นเว็บฟรี ทีละขั้นตอน

---

## 📋 สิ่งที่ต้องเตรียม

- [ ] บัญชี GitHub (สร้างฟรีที่ github.com)
- [ ] บัญชี TiDB Cloud (สร้างฟรีที่ tidbcloud.com)
- [ ] บัญชี Render (สร้างฟรีที่ render.com)
- [ ] บัญชี Vercel (สร้างฟรีที่ vercel.com)

---

## 🗄️ ขั้นตอนที่ 1: สร้าง Database บน TiDB Cloud

### 1.1 สมัครและสร้าง Cluster
1. ไปที่ https://tidbcloud.com และ **Sign Up** (ใช้ GitHub/Google login ได้)
2. คลิก **"Create Cluster"**
3. เลือก **"Serverless"** (ฟรี!)
4. ตั้งค่า:
   - **Cluster Name:** `scan-barcode-db`
   - **Region:** `Singapore` หรือใกล้ไทยที่สุด
   - **Password:** ตั้งรหัสผ่าน (จดไว้!)
5. คลิก **"Create"** และรอประมาณ 1-2 นาที

### 1.2 สร้าง Tables
1. ไปที่ Cluster ที่สร้าง → คลิก **"Connect"**
2. เลือก **"SQL Editor"** หรือ **"Chat2Query"**
3. Copy และ Run SQL นี้ทีละคำสั่ง:

```sql
-- สร้างตาราง Users
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(10) UNIQUE,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    title VARCHAR(10),
    department VARCHAR(50),
    role VARCHAR(20) DEFAULT 'user',
    password VARCHAR(255) DEFAULT '1234'
);

-- สร้างตาราง Products
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_code VARCHAR(50) UNIQUE,
    item_name VARCHAR(255),
    barcode VARCHAR(100) UNIQUE
);

-- สร้างตาราง Activity Logs
CREATE TABLE activity_logs_v2 (
    id INT AUTO_INCREMENT PRIMARY KEY,
    action_type VARCHAR(50),
    user_name VARCHAR(100),
    details TEXT,
    device VARCHAR(255) DEFAULT 'Unknown',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- สร้างตาราง App Config
CREATE TABLE app_config (
    id INT PRIMARY KEY DEFAULT 1,
    app_name VARCHAR(100) DEFAULT 'Scan SKU',
    logo LONGTEXT
);

-- เพิ่ม Admin User
INSERT INTO users (employee_id, first_name, last_name, title, department, role, password)
VALUES ('ADMIN', 'System', 'Admin', 'Mr.', 'IT', 'admin', '1234');
```

### 1.3 ดู Connection String
1. คลิก **"Connect"** ที่ Cluster
2. เลือก **"General"** → **"Node.js"**
3. จดบันทึกค่าเหล่านี้:
   - `Host` → ใช้เป็น `DB_HOST`
   - `Port` → ปกติคือ `4000`
   - `User` → ใช้เป็น `DB_USER`
   - `Password` → รหัสที่ตั้งไว้ (`DB_PASSWORD`)
   - `Database` → ใช้เป็น `DB_NAME` (ปกติคือ `test`)

> ⚠️ **สำคัญ!** บันทึกค่าเหล่านี้ไว้ใช้ในขั้นตอนถัดไป

---

## 📤 ขั้นตอนที่ 2: Push Code ขึ้น GitHub

### 2.1 สร้าง Repository ใหม่
1. ไปที่ https://github.com
2. คลิก **"New repository"**
3. ตั้งชื่อ: `scan-barcode-sku`
4. เลือก **Private**
5. คลิก **"Create repository"**

### 2.2 Push Code
เปิด Terminal ในโฟลเดอร์โปรเจค แล้วรันคำสั่ง:

```bash
git init
git add .
git commit -m "Initial commit for deployment"
git branch -M main
git remote add origin https://github.com/hacodxteam-collab/scan-barcode-sku.git
git push -u origin main
```

> แทนที่ `YOUR_USERNAME` ด้วย GitHub username ของคุณ

---

## 🖥️ ขั้นตอนที่ 3: Deploy Backend บน Render

### 3.1 สร้าง Web Service
1. ไปที่ https://render.com และ Sign Up (ใช้ GitHub login)
2. คลิก **"New +"** → **"Web Service"**
3. เลือก **"Connect a repository"** → เลือก `scan-barcode-sku`
4. ตั้งค่า:
   - **Name:** `scan-barcode-api`
   - **Region:** Singapore
   - **Root Directory:** `server`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free

### 3.2 ตั้งค่า Environment Variables
ไปที่ **Environment** → เพิ่มตัวแปรเหล่านี้:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `DB_HOST` | (จาก TiDB Cloud) |
| `DB_USER` | (จาก TiDB Cloud) |
| `DB_PASSWORD` | (รหัสที่ตั้ง) |
| `DB_NAME` | `test` |
| `ALLOWED_ORIGINS` | (รอใส่หลัง Deploy Frontend) |

### 3.3 Deploy
1. คลิก **"Create Web Service"**
2. รอประมาณ 2-5 นาที
3. จดบันทึก URL เช่น: `https://scan-barcode-api.onrender.com`

---

## 🌐 ขั้นตอนที่ 4: Deploy Frontend บน Vercel

### 4.1 Import Project
1. ไปที่ https://vercel.com และ Sign Up (ใช้ GitHub login)
2. คลิก **"Add New..."** → **"Project"**
3. เลือก Repository `scan-barcode-sku`
4. ตั้งค่า:
   - **Framework Preset:** Vite
   - **Root Directory:** `client`

### 4.2 ตั้งค่า Environment Variables
เพิ่มตัวแปร:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://scan-barcode-api.onrender.com/api` |

### 4.3 Deploy
1. คลิก **"Deploy"**
2. รอประมาณ 1-2 นาที
3. จดบันทึก URL เช่น: `https://scan-barcode-sku.vercel.app`

---

## 🔗 ขั้นตอนที่ 5: เชื่อม CORS

กลับไปที่ **Render Dashboard** → Environment Variables:
- แก้ไข `ALLOWED_ORIGINS` = URL ของ Vercel (เช่น `https://scan-barcode-sku.vercel.app`)
- คลิก **"Save Changes"**

---

## ✅ ทดสอบ

1. เปิด URL ของ Vercel
2. Login ด้วย **ID:** ADMIN | **Password:** 1234
3. ถ้า Login ได้ = **สำเร็จ!** 🎉

---

## ⚠️ ข้อจำกัด Free Tier

| บริการ | ข้อจำกัด |
|--------|----------|
| **Render** | Sleep หลังไม่ใช้ 15 นาที |
| **TiDB Cloud** | 5GB storage, 50M Request Units/เดือน |
| **Vercel** | ไม่จำกัด |

---

**🎉 เรียบร้อย! แอพของคุณอยู่บนเว็บแล้ว!**
