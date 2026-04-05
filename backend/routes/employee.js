const express = require('express');
const Record = require('../models/Record');
const router = express.Router();

// مسار تسجيل الحضور والانصراف للموظف
router.post('/record', async (req, res) => {
  try {
    const { employeeId, date, checkIn, checkOut, checkInLat, checkInLng, checkOutLat, checkOutLng, status, notes } = req.body;

    // استدعاء ملفات قواعد البيانات (تأكد من توافق الأسماء مع مشروعك)
    const mongoose = require('mongoose');
    const Record = mongoose.models.Record;
    const Employee = mongoose.models.Employee;

    // البحث عن سجل اليوم لهذا الموظف
    let record = await Record.findOne({ employeeId, date });

    if (record) {
      // ===== حالة الانصراف (الخروج) =====
      record.checkOut = checkOut || record.checkOut;
      record.checkOutLat = checkOutLat || record.checkOutLat;
      record.checkOutLng = checkOutLng || record.checkOutLng;
      
      // إذا كان الموظف يستأذن (early_leave)، نحدث حالته، وإلا نحتفظ بحالته الصباحية (سواء كان حاضر أو متأخر)
      if (status === 'early_leave') {
          record.status = 'early_leave';
      }
      
      // دمج الملاحظات الجديدة مع القديمة إن وجدت
      if (notes) {
          record.notes = record.notes ? record.notes + " | " + notes : notes;
      }
      
      await record.save();
      return res.json({ msg: 'Check-out updated successfully', record });

    } else {
      // ===== حالة الحضور (الدخول لأول مرة في اليوم) =====
      
      // جلب بيانات الموظف لمعرفة وقت بداية دوامه
      const emp = await Employee.findById(employeeId);
      if (!emp) return res.status(404).json({ msg: 'Employee not found' });

      let finalStatus = status || 'present'; 

      // حساب التأخير إذا كان للموظف وقت بداية محدد (workStart)
      if (checkIn && emp.workStart) {
          // 1. تحويل وقت بداية دوام الموظف إلى دقائق (مثال: 09:00 تصبح 540 دقيقة)
          const [startHour, startMin] = emp.workStart.split(':').map(Number);
          const expectedStartMinutes = (startHour * 60) + startMin;

          // 2. تحويل وقت البصمة إلى توقيت السعودية (الرياض) بدقة
          const checkInDate = new Date(checkIn);
          const saudiTimeFormatter = new Intl.DateTimeFormat('en-US', { 
              timeZone: 'Asia/Riyadh', 
              hour: 'numeric', 
              minute: 'numeric', 
              hour12: false 
          });
          
          // استخراج الساعة والدقيقة الحقيقية للبصمة
          let [actualHour, actualMin] = saudiTimeFormatter.format(checkInDate).split(':').map(Number);
          if (actualHour === 24) actualHour = 0; // معالجة منتصف الليل

          // تحويل وقت البصمة إلى دقائق
          const actualMinutes = (actualHour * 60) + actualMin;

          // 3. الحكم النهائي (15 دقيقة فترة سماح)
          // إذا كان وقت البصمة أكبر من (وقت الدوام + 15 دقيقة)
          if (actualMinutes > (expectedStartMinutes + 15)) {
              finalStatus = 'late'; // تغيير الحالة إلى متأخر إجبارياً
          }
      }

      // إنشاء السجل الجديد بالحالة النهائية
      const newRecord = new Record({ 
          employeeId, 
          date, 
          checkIn, 
          checkInLat, 
          checkInLng, 
          status: finalStatus, 
          notes 
      });
      await newRecord.save();
      return res.json({ msg: 'Check-in saved successfully', record: newRecord });
    }
    
  } catch (err) {
    console.error("Record Save Error:", err);
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
