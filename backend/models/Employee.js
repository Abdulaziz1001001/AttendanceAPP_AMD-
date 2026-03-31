const mongoose = require('mongoose');
const EmployeeSchema = new mongoose.Schema({
  eid: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: String,
  phone: String,
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  active: { type: Boolean, default: true },
  workStart: String,
  workEnd: String,
  salary: Number
}, { timestamps: true });
module.exports = mongoose.models.Employee || mongoose.model('Employee', EmployeeSchema);
