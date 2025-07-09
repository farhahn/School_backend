const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  storeName: {
    type: String,
    required: [true, 'Store name is required'],
    trim: true,
  },
  storeCode: {
    type: String,
    required: [true, 'Store code is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by is required'],
  },
}, {
  timestamps: true,
});

// Define compound index for unique storeCode per createdBy
storeSchema.index({ storeCode: 1, createdBy: 1 }, { unique: true });

module.exports = mongoose.model('Store', storeSchema);