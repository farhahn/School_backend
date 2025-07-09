const mongoose = require('mongoose');

const houseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    class: { type: String, trim: true, default: '' },
    houseId: { type: Number, required: true },
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  },
  {
    timestamps: true,
    indexes: [
      { key: { school: 1, name: 1 }, unique: true },
      { key: { school: 1, houseId: 1 }, unique: true },
    ],
  }
);

module.exports = mongoose.model('House', houseSchema);