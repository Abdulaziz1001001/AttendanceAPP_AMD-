const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Employee = require('../models/Employee');
const router = express.Router();

// Admin Login
router.post('/admin-login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: admin._id, name: admin.name } });
  } catch (err) { res.status(500).send('Server Error'); }
});

// Employee Login
router.post('/emp-login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const emp = await Employee.findOne({ username, active: true });
    if (!emp) return res.status(400).json({ msg: 'Invalid credentials' });

    // Note: If you create employees from the frontend initially without hashing, 
    // you might need to compare plain text first. In production, ALWAYS hash.
    const isMatch = await bcrypt.compare(password, emp.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: emp._id, role: 'employee' }, process.env.JWT_SECRET, { expiresIn: '12h' });
    res.json({ token, user: { id: emp._id, name: emp.name, groupId: emp.groupId } });
  } catch (err) { res.status(500).send('Server Error'); }
});

module.exports = router;