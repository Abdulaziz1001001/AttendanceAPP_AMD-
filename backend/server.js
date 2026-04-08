const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');
require('dotenv').config();

const app = express();

// إعدادات الأمان واستقبال البيانات
app.use(cors()); 
app.use(express.json()); 

// 🚨 رادار السيرفر: يطبع أي طلب يصل إلى الشاشة لكي نراه في سجلات Render
app.use((req, res, next) => {
  console.log(`📥 [${req.method}] ${req.url}`);
  next();
});

// الاتصال بقاعدة البيانات (MongoDB)
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB Connected successfully');
    try {
      const adminExists = await Admin.findOne({ username: 'admin' });
      if (!adminExists) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        const newAdmin = new Admin({ username: 'admin', password: hashedPassword, name: 'System Administrator' });
        await newAdmin.save();
        console.log('✅ Default Admin created! (admin / admin123)');
      }
    } catch (err) {
        console.log('❌ Error checking admin:', err);
    }
  })
  .catch(err => console.log('❌ MongoDB Error:', err));

// المسارات (Routes)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/employee', require('./routes/employee'));

// مسار فحص حالة السيرفر
app.get('/', (req, res) => res.send('AMD Backend API is running perfectly!'));

// 🛡️ كود منع السيرفر من النوم (Anti-Sleep)
// هذا الكود سيقوم بزيارة رابط السيرفر كل 14 دقيقة لكي لا يغلق أبداً
const https = require('https');
setInterval(() => {
    https.get('https://attendanceapp-50no.onrender.com/');
    console.log('⏰ Ping sent to keep server awake!');
}, 14 * 60 * 1000); 

// التشغيل (مع إضافة '0.0.0.0' لتجنب مشكلة Timed Out في منصة Render)
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running perfectly on port ${PORT}`);
});
