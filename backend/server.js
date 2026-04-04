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

// 🚨 رادار السيرفر: يطبع أي طلب يصل إلى الشاشة لكي نراه في Render
app.use((req, res, next) => {
  console.log(`📥 [${req.method}] ${req.url}`);
  next();
});

// الاتصال بقاعدة البيانات
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
    } catch (err) {}
  })
  .catch(err => console.log('❌ MongoDB Error:', err));

// المسارات
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/employee', require('./routes/employee'));

app.get('/', (req, res) => res.send('AMD Backend API is running perfectly!'));

const PORT = process.env.PORT || 5000;
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Employee = require('./models/Employee'); // تأكد من المسار الصحيح
const Record = require('./models/Record');     // تأكد من المسار الصحيح

// 1. إعداد موزع البريد (استخدم الإيميل الذي أنشأت له كلمة مرور التطبيقات)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // سيتم وضعها في Render
    pass: process.env.EMAIL_PASS  // كلمة المرور المكونة من 16 حرف
  }
});
const sendReminderEmail = async (email, subject, message) => {
  try {
    await transporter.sendMail({
      from: `"AMD United HR" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      text: message
    });
    console.log(`📧 تم إرسال تذكير إلى: ${email}`);
  } catch (error) {
    console.error(`❌ خطأ في إرسال الإيميل:`, error);
  }
};

// 2. روبوت تذكير الحضور (يعمل يومياً الساعة 9:30 صباحاً بتوقيت السعودية)
cron.schedule('30 9 * * *', async () => {
  console.log('🔍 الروبوت يبحث عن المتأخرين في الحضور...');
  const today = new Date().toISOString().split('T')[0];
  const employees = await Employee.find({ active: true });

  for (let emp of employees) {
    if (!emp.email) continue; // إذا لم يكن لديه إيميل، تجاوزه
    
    // هل بصم اليوم؟
    const record = await Record.findOne({ employeeId: emp._id, date: today });
    if (!record || !record.checkIn) {
      const msg = `مرحباً ${emp.name}،\n\nنود تذكيرك بأنه لم يتم رصد تسجيل دخولك (حضورك) في النظام لهذا اليوم (${today}).\nيرجى الدخول لتطبيق الشركة وتسجيل الحضور في حال تواجدك في الموقع.\n\nمع التحية،\nإدارة الموارد البشرية - AMD United-!!TESTING!!`;
      await sendReminderEmail(emp.email, 'تذكير: تسجيل الحضور ⏱️', msg);
    }
  }
}, { timezone: "Asia/Riyadh" });

// 3. روبوت تذكير الانصراف (يعمل يومياً الساعة 5:30 مساءً بتوقيت السعودية)
cron.schedule('30 17 * * *', async () => {
  console.log('🔍 الروبوت يبحث عن من نسوا تسجيل الانصراف...');
  const today = new Date().toISOString().split('T')[0];
  
  // ابحث عن كل السجلات لليوم التي بها حضور ولكن لا يوجد بها انصراف
  const records = await Record.find({ date: today, checkIn: { $exists: true }, checkOut: { $exists: false, $eq: null } });

  for (let rec of records) {
    const emp = await Employee.findById(rec.employeeId);
    if (emp && emp.email) {
      const msg = `مرحباً ${emp.name}،\n\nلاحظنا أنك قمت بتسجيل الحضور اليوم ولكنك لم تقم بتسجيل الخروج!!TESTING!! (الانصراف).\nيرجى الدخول للتطبيق وتسجيل الانصراف فور انتهاء دوامك ليتم احتساب ساعات عملك بشكل صحيح.\n\nمع التحية،\nإدارة الموارد البشرية - AMD United`;
      await sendReminderEmail(emp.email, 'تذكير مهم: تسجيل الانصراف ', msg);
    }
  }
}, { timezone: "Asia/Riyadh" });
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
