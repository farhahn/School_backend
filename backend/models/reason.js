const mongoose = require('mongoose');

const reasonSchema = mongoose.Schema({
  reasonId: { type: Number, required: true, unique: true },
  text: { type: String, required: true, trim: true },
  school: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
}, {
  timestamps: true,
  indexes: [
    { key: { school: 1, text: 1 }, unique: true }, // Prevent duplicate reasons per school
  ],
});

module.exports = mongoose.model('Reason', reasonSchema);