const mongoose = require('mongoose');
const StockItem = require('../models/StockItem');

exports.getStockItems = async (req, res) => {
  try {
    const adminID = req.params.adminID;
    if (!mongoose.Types.ObjectId.isValid(adminID)) {
      console.error(`Invalid adminID format: ${adminID}`);
      return res.status(400).json({ message: 'Invalid adminID format' });
    }
    console.log(`Fetching stock items for adminID: ${adminID}`);
    const stockItems = await StockItem.find({ admin: new mongoose.Types.ObjectId(adminID) })
      .sort({ createdAt: -1 })
      .lean();
    console.log(`Found ${stockItems.length} stock items for adminID: ${adminID}`);
    res.status(200).json({
      message: 'Stock items fetched successfully',
      data: stockItems,
      count: stockItems.length,
    });
  } catch (error) {
    console.error('Error fetching stock items:', error.message);
    res.status(500).json({ message: 'Server error while fetching stock items', error: error.message });
  }
};

exports.addStockItem = async (req, res) => {
  try {
    const { itemName, category, supplier, quantity, purchasePrice, purchaseDate, description, adminID } = req.body;
    if (!itemName || !category || !supplier || !quantity || !purchasePrice || !purchaseDate || !adminID) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    if (!mongoose.Types.ObjectId.isValid(adminID)) {
      return res.status(400).json({ message: 'Invalid adminID format' });
    }
    const newStockItem = new StockItem({
      itemName,
      category,
      supplier,
      quantity: Number(quantity),
      purchasePrice: Number(purchasePrice),
      purchaseDate: new Date(purchaseDate),
      description: description || '',
      admin: new mongoose.Types.ObjectId(adminID),
    });
    await newStockItem.save();
    res.status(201).json({ message: 'Stock item added successfully', data: newStockItem });
  } catch (error) {
    console.error('Error adding stock item:', error.message);
    res.status(500).json({ message: 'Server error while adding stock item', error: error.message });
  }
};

exports.updateStockItem = async (req, res) => {
  try {
    const { itemName, category, supplier, quantity, purchasePrice, purchaseDate, description, adminID } = req.body;
    if (!mongoose.Types.ObjectId.isValid(adminID)) {
      return res.status(400).json({ message: 'Invalid adminID format' });
    }
    const stockItem = await StockItem.findOne({ _id: req.params.id, admin: new mongoose.Types.ObjectId(adminID) });
    if (!stockItem) {
      return res.status(404).json({ message: 'Stock item not found' });
    }
    stockItem.itemName = itemName || stockItem.itemName;
    stockItem.category = category || stockItem.category;
    stockItem.supplier = supplier || stockItem.supplier;
    stockItem.quantity = quantity !== undefined ? Number(quantity) : stockItem.quantity;
    stockItem.purchasePrice = purchasePrice !== undefined ? Number(purchasePrice) : stockItem.purchasePrice;
    stockItem.purchaseDate = purchaseDate ? new Date(purchaseDate) : stockItem.purchaseDate;
    stockItem.description = description !== undefined ? description : stockItem.description;
    await stockItem.save();
    res.status(200).json({ message: 'Stock item updated successfully', data: stockItem });
  } catch (error) {
    console.error('Error updating stock item:', error.message);
    res.status(500).json({ message: 'Server error while updating stock item', error: error.message });
  }
};

exports.deleteStockItem = async (req, res) => {
  try {
    const adminID = req.query.adminID;
    if (!mongoose.Types.ObjectId.isValid(adminID)) {
      return res.status(400).json({ message: 'Invalid adminID format' });
    }
    const stockItem = await StockItem.findOneAndDelete({ _id: req.params.id, admin: new mongoose.Types.ObjectId(adminID) });
    if (!stockItem) {
      return res.status(404).json({ message: 'Stock item not found' });
    }
    res.status(200).json({ message: 'Stock item deleted successfully' });
  } catch (error) {
    console.error('Error deleting stock item:', error.message);
    res.status(500).json({ message: 'Server error while deleting stock item', error: error.message });
  }
};