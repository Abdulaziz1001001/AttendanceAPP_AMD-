const mongoose = require('mongoose');
const LocationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  radius: { type: Number, default: 500 }
});
module.exports = mongoose.model('Location', LocationSchema);