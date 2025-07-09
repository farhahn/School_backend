const mongoose = require('mongoose');
const Store = require('../models/store-model');

exports.createStore = async (req, res) => {
  try {
    console.log("Creating Store - Request body:", JSON.stringify(req.body, null, 2));
    const { storeName, storeCode, description, adminID } = req.body;

    if (!storeName || !storeCode || !adminID) {
      console.log("Missing required fields:", { storeName, storeCode, adminID });
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!mongoose.Types.ObjectId.isValid(adminID)) {
      console.log("Invalid adminID format:", adminID);
      return res.status(400).json({ message: 'Invalid adminID format' });
    }

    const newStore = new Store({
      storeName: storeName.trim(),
      storeCode: storeCode.trim(),
      description: description ? description.trim() : '',
      createdBy: new mongoose.Types.ObjectId(adminID),
    });

    await newStore.save();
    console.log('Store created successfully:', JSON.stringify(newStore, null, 2));
    res.status(201).json({ message: 'Store created successfully', store: newStore });
  } catch (error) {
    console.error("Error in createStore:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
      errors: error.errors,
    });
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Store code already exists for this admin' });
    }
    res.status(500).json({ message: 'Server error while creating store', error: error.message });
  }
};

exports.getStores = async (req, res) => {
  try {
    const { adminID } = req.query;
    console.log("Fetching stores for adminID:", adminID);

    if (!mongoose.Types.ObjectId.isValid(adminID)) {
      console.log("Invalid adminID format:", adminID);
      return res.status(400).json({ message: 'Invalid adminID format' });
    }

    const stores = await Store.find({ createdBy: new mongoose.Types.ObjectId(adminID) })
      .sort({ createdAt: -1 })
      .lean();
    console.log("Fetched stores count:", stores.length, JSON.stringify(stores, null, 2));
    res.status(200).json(stores);
  } catch (error) {
    console.error("Error in getStores:", error.message);
    res.status(500).json({ message: 'Server error while fetching stores', error: error.message });
  }
};

exports.getStoreById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log("Invalid store ID:", req.params.id);
      return res.status(400).json({ message: 'Invalid store ID' });
    }
    const store = await Store.findById(req.params.id).lean();
    if (!store) {
      console.log("Store not found:", req.params.id);
      return res.status(404).json({ message: 'Store not found' });
    }
    console.log('Fetched store:', JSON.stringify(store, null, 2));
    res.status(200).json(store);
  } catch (error) {
    console.error("Error in getStoreById:", error.message);
    res.status(500).json({ message: 'Server error while fetching store', error: error.message });
  }
};

exports.updateStore = async (req, res) => {
  try {
    const { storeName, storeCode, description, adminID } = req.body;
    console.log("Updating store - Request body:", JSON.stringify(req.body, null, 2));

    if (!mongoose.Types.ObjectId.isValid(adminID)) {
      console.log("Invalid adminID format:", adminID);
      return res.status(400).json({ message: 'Invalid adminID format' });
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log("Invalid store ID:", req.params.id);
      return res.status(400).json({ message: 'Invalid store ID' });
    }

    const existingStore = await Store.findOne({
      storeCode: { $regex: new RegExp(`^${storeCode}$`, 'i') },
      createdBy: new mongoose.Types.ObjectId(adminID),
      _id: { $ne: req.params.id },
    });
    if (existingStore) {
      console.log("Store code already exists:", storeCode);
      return res.status(400).json({ message: 'Store code already exists' });
    }

    const store = await Store.findOneAndUpdate(
      { _id: req.params.id, createdBy: new mongoose.Types.ObjectId(adminID) },
      {
        storeName: storeName ? storeName.trim() : undefined,
        storeCode: storeCode ? storeCode.trim() : undefined,
        description: description ? description.trim() : '',
      },
      { new: true }
    );
    if (!store) {
      console.log("Store not found:", req.params.id);
      return res.status(404).json({ message: 'Store not found' });
    }
    console.log('Store updated successfully:', JSON.stringify(store, null, 2));
    res.status(200).json({ message: 'Store updated successfully', store });
  } catch (error) {
    console.error("Error in updateStore:", error.message);
    res.status(500).json({ message: 'Server error while updating store', error: error.message });
  }
};

exports.deleteStore = async (req, res) => {
  try {
    const { adminID } = req.query;
    console.log("Deleting store - ID:", req.params.id, "adminID:", adminID);

    if (!mongoose.Types.ObjectId.isValid(adminID)) {
      console.log("Invalid adminID format:", adminID);
      return res.status(400).json({ message: 'Invalid adminID format' });
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log("Invalid store ID:", req.params.id);
      return res.status(400).json({ message: 'Invalid store ID' });
    }

    const store = await Store.findOneAndDelete({
      _id: req.params.id,
      createdBy: new mongoose.Types.ObjectId(adminID),
    });
    if (!store) {
      console.log("Store not found:", req.params.id);
      return res.status(404).json({ message: 'Store not found' });
    }
    console.log('Store deleted successfully:', JSON.stringify(store, null, 2));
    res.status(200).json({ message: 'Store deleted successfully' });
  } catch (error) {
    console.error("Error in deleteStore:", error.message);
    res.status(500).json({ message: 'Server error while deleting store', error: error.message });
  }
};