const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  school: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true, unique: true },
  categoryId: { type: Number, default: 0 },
});

module.exports = mongoose.model('Counter', counterSchema);