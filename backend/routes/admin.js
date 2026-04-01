const express = require('express');
const bcrypt = require('bcryptjs');
const Employee = require('../models/Employee');
const Group = require('../models/Group');
const Location = require('../models/Location');
const Record = require('../models/Record');
const router = express.Router();

// 1. مسار سحري يجلب كل بيانات النظام دفعة واحدة ليعرضها في الواجهة
router.get('/all-data', async (req, res) => {
  try {
    const employees = await Employee.find();
    const groups = await Group.find();
    const locations = await Location.find();
    const records = await Record.find();
    
    // تحويل البيانات لشكل يفهمه المتصفح بسهولة
    const format = (arr) => arr.map(doc => ({ ...doc._doc, id: doc._id.toString() }));

    res.json({ 
        employees: format(employees), 
        groups: format(groups), 
        locations: format(locations), 
        records: format(records) 
    });
  } catch (err) { res.status(500).json({ msg: 'Server Error' }); }
});

// 2. الموظفين (إضافة وتعديل)
router.post('/employee', async (req, res) => {
  try {
    const { id, eid, name, username, password, email, phone, groupId, workStart, workEnd, salary, active } = req.body;
    if (id) {
        let emp = await Employee.findById(id);
        if(emp) {
            emp.eid = eid; emp.name = name; emp.username = username; emp.email = email; emp.phone = phone;
            emp.groupId = groupId; emp.workStart = workStart; emp.workEnd = workEnd; emp.salary = salary; emp.active = active;
            if (password) {
                const salt = await bcrypt.genSalt(10);
                emp.password = await bcrypt.hash(password, salt);
            }
            await emp.save();
        }
    } else {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const emp = new Employee({ eid, name, username, password: hashedPassword, email, phone, groupId, workStart, workEnd, salary, active });
        await emp.save();
    }
    res.json({ msg: 'Success' });
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

router.delete('/employee/:id', async (req, res) => {
    try { await Employee.findByIdAndDelete(req.params.id); res.json({msg: 'Deleted'}); } 
    catch (err) { res.status(500).json({ msg: 'Error' }); }
});

// 3. المجموعات
router.post('/group', async (req, res) => {
  try {
    const { id, name, desc, color } = req.body;
    if(id) { await Group.findByIdAndUpdate(id, { name, desc, color }); } 
    else { const group = new Group({ name, desc, color }); await group.save(); }
    res.json({ msg: 'Success' });
  } catch (err) { res.status(500).json({ msg: 'Error' }); }
});

router.delete('/group/:id', async (req, res) => {
    try { await Group.findByIdAndDelete(req.params.id); res.json({msg: 'Deleted'}); } 
    catch (err) { res.status(500).json({ msg: 'Error' }); }
});

// 4. الخرائط والمواقع
router.post('/location', async (req, res) => {
  try {
    const { name, groupId, lat, lng, radius } = req.body;
    const loc = new Location({ name, groupId, lat, lng, radius });
    await loc.save();
    res.json({ msg: 'Success' });
  } catch (err) { res.status(500).json({ msg: 'Error' }); }
});

router.delete('/location/:id', async (req, res) => {
    try { await Location.findByIdAndDelete(req.params.id); res.json({msg: 'Deleted'}); } 
    catch (err) { res.status(500).json({ msg: 'Error' }); }
});

module.exports = router;
