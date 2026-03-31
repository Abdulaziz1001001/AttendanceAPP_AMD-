const mongoose = require('mongoose');

const RecordSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  checkIn: Date,
  checkOut: Date,
  checkInLat: Number,
  checkInLng: Number,
  zoneId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
  status: { type: String, enum: ['present', 'late', 'absent', 'early_leave'] },
  notes: String
});

module.exports = mongoose.model('Record', RecordSchema);