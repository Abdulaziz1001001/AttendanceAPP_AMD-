const express = require('express');
const auth = require('../middleware/authMiddleware');
const Record = require('../models/Record');
const Location = require('../models/Location');
const router = express.Router();

// Get assigned zones for an employee
router.get('/zones', auth, async (req, res) => {
  try {
    // req.user comes from authMiddleware
    const Employee = require('../models/Employee');
    const emp = await Employee.findById(req.user.id);
    const zones = await Location.find({ groupId: emp.groupId });
    res.json(zones);
  } catch (err) { res.status(500).send('Server Error'); }
});

// Check-In
router.post('/checkin', auth, async (req, res) => {
  const { lat, lng, zoneId, status, notes } = req.body;
  const today = new Date().toISOString().split('T')[0];

  try {
    let record = await Record.findOne({ employeeId: req.user.id, date: today });
    if (record) return res.status(400).json({ msg: 'Already checked in today' });

    const newRecord = new Record({
      employeeId: req.user.id,
      date: today,
      checkIn: new Date(),
      checkInLat: lat,
      checkInLng: lng,
      zoneId,
      status,
      notes
    });
    
    await newRecord.save();
    res.json(newRecord);
  } catch (err) { res.status(500).send('Server Error'); }
});

// Check-Out
router.put('/checkout', auth, async (req, res) => {
  const { lat, lng, status, notes } = req.body;
  const today = new Date().toISOString().split('T')[0];

  try {
    let record = await Record.findOne({ employeeId: req.user.id, date: today });
    if (!record) return res.status(400).json({ msg: 'No check-in found for today' });

    record.checkOut = new Date();
    record.checkOutLat = lat;
    record.checkOutLng = lng;
    if (status) record.status = status;
    if (notes) record.notes = record.notes ? `${record.notes} | ${notes}` : notes;

    await record.save();
    res.json(record);
  } catch (err) { res.status(500).send('Server Error'); }
});

module.exports = router;