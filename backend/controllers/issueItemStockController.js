const mongoose = require('mongoose');
const IssueItem = require('../models/IssueItemStock');
const CategoryCard = require('../models/categoryCardModel');

exports.getIssueItems = async (req, res) => {
  try {
    const adminID = req.params.adminID;
    if (!mongoose.Types.ObjectId.isValid(adminID)) {
      console.error(`Invalid adminID format: ${adminID}`);
      return res.status(400).json({ message: 'Invalid adminID format' });
    }
    console.log(`Fetching issue items for adminID: ${adminID}`);
    const issueItems = await IssueItem.find({ admin: new mongoose.Types.ObjectId(adminID) })
      .sort({ createdAt: -1 })
      .lean();
    console.log(`Found ${issueItems.length} issue items for adminID: ${adminID}`);
    res.status(200).json({
      message: 'Issue items fetched successfully',
      data: issueItems,
      count: issueItems.length,
    });
  } catch (error) {
    console.error('Error fetching issue items:', error.message);
    res.status(500).json({ message: 'Server error while fetching issue items', error: error.message });
  }
};

exports.addIssueItem = async (req, res) => {
  try {
    const { item, category, issueDate, issueTo, issuedBy, quantity, status, adminID } = req.body;
    if (!item || !category || !issueDate || !issueTo || !issuedBy || !quantity || !adminID) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    if (!mongoose.Types.ObjectId.isValid(adminID)) {
      return res.status(400).json({ message: 'Invalid adminID format' });
    }
    // Validate category against CategoryCard
    const categoryExists = await CategoryCard.findOne({
      categoryCard: { $regex: new RegExp(`^${category}$`, 'i') },
      admin: new mongoose.Types.ObjectId(adminID),
    });
    if (!categoryExists) {
      return res.status(400).json({ message: 'Category does not exist' });
    }
    const newIssueItem = new IssueItem({
      item,
      category,
      issueDate,
      issueTo,
      issuedBy,
      quantity: parseInt(quantity),
      status: status || 'Issued',
      admin: new mongoose.Types.ObjectId(adminID),
    });
    await newIssueItem.save();
    console.log('Issue item added:', newIssueItem);
    res.status(201).json({ message: 'Issue item added successfully', data: newIssueItem });
  } catch (error) {
    console.error('Error adding issue item:', error.message);
    res.status(500).json({ message: 'Server error while adding issue item', error: error.message });
  }
};

exports.updateIssueItem = async (req, res) => {
  try {
    const { item, category, issueDate, issueTo, issuedBy, quantity, status, adminID } = req.body;
    if (!mongoose.Types.ObjectId.isValid(adminID)) {
      return res.status(400).json({ message: 'Invalid adminID format' });
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid issue item ID' });
    }
    const issueItem = await IssueItem.findOne({ _id: req.params.id, admin: new mongoose.Types.ObjectId(adminID) });
    if (!issueItem) {
      return res.status(404).json({ message: 'Issue item not found' });
    }
    if (category) {
      const categoryExists = await CategoryCard.findOne({
        categoryCard: { $regex: new RegExp(`^${category}$`, 'i') },
        admin: new mongoose.Types.ObjectId(adminID),
      });
      if (!categoryExists) {
        return res.status(400).json({ message: 'Category does not exist' });
      }
    }
    issueItem.item = item || issueItem.item;
    issueItem.category = category || issueItem.category;
    issueItem.issueDate = issueDate || issueItem.issueDate;
    issueItem.issueTo = issueTo || issueItem.issueTo;
    issueItem.issuedBy = issuedBy || issueItem.issuedBy;
    issueItem.quantity = quantity ? parseInt(quantity) : issueItem.quantity;
    issueItem.status = status || issueItem.status;
    await issueItem.save();
    console.log('Issue item updated:', issueItem);
    res.status(200).json({ message: 'Issue item updated successfully', data: issueItem });
  } catch (error) {
    console.error('Error updating issue item:', error.message);
    res.status(500).json({ message: 'Server error while updating issue item', error: error.message });
  }
};

exports.deleteIssueItem = async (req, res) => {
  try {
    const { adminID } = req.query;
    if (!mongoose.Types.ObjectId.isValid(adminID)) {
      return res.status(400).json({ message: 'Invalid adminID format' });
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid issue item ID' });
    }
    const issueItem = await IssueItem.findOneAndDelete({ _id: req.params.id, admin: new mongoose.Types.ObjectId(adminID) });
    if (!issueItem) {
      return res.status(404).json({ message: 'Issue item not found' });
    }
    console.log('Issue item deleted:', issueItem);
    res.status(200).json({ message: 'Issue item deleted successfully' });
  } catch (error) {
    console.error('Error deleting issue item:', error.message);
    res.status(500).json({ message: 'Server error while deleting issue item', error: error.message });
  }
};