const express = require('express');
const bcrypt = require('bcryptjs');
const Employee = require('../models/Employee');
const router = express.Router();

// مسار إضافة موظف جديد إلى قاعدة البيانات
router.post('/add-employee', async (req, res) => {
  try {
    const { eid, name, username, password, email, phone, groupId, workStart, workEnd, salary } = req.body;
    
    // تشفير كلمة مرور الموظف لكي تكون آمنة
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // إنشاء الموظف في MongoDB
    const newEmp = new Employee({
      eid, name, username, password: hashedPassword, email, phone, groupId, workStart, workEnd, salary, active: true
    });

    await newEmp.save();
    res.json({ msg: 'Employee saved to Database', employee: newEmp });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error while saving employee' });
  }
});

module.exports = router;
