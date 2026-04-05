const mongoose = require('mongoose');
const RecordSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  date: { type: String, required: true }, 
  checkIn: Date,
  checkOut: Date,
  checkInLat: Number,
  checkInLng: Number,
  checkOutLat: Number,
  checkOutLng: Number,
  zoneId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
  status: { type: String, enum: ['present', 'late', 'absent', 'early_leave'] },
  notes: String,
status: { type: String, default: 'present' },
  notes: { type: String },
  approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected', 'none'], default: 'none' },
  attachment: { type: String } // <--- أضف هذا السطر لحفظ الصورة/الملف});
module.exports = mongoose.models.Record || mongoose.model('Record', RecordSchema);
