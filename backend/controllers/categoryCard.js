// backend/controllers/category-card-controller.js
const mongoose = require('mongoose');
const CategoryCard = require('../models/categoryCardModel');

exports.getCategoryCards = async (req, res) => {
  try {
    const adminID = req.params.adminID;
    console.log('Received adminID:', adminID);
    if (!mongoose.Types.ObjectId.isValid(adminID)) {
      console.error(`Invalid adminID format: ${adminID}`);
      return res.status(400).json({ message: 'Invalid adminID format' });
    }
    console.log(`Querying CategoryCard for admin: ${adminID}`);
    const categoryCards = await CategoryCard.find({ admin: new mongoose.Types.ObjectId(adminID) })
      .sort({ createdAt: -1 })
      .lean();
    console.log(`Found ${categoryCards.length} category cards`);
    res.status(200).json({
      message: 'Category cards fetched successfully',
      data: categoryCards,
      count: categoryCards.length,
    });
  } catch (error) {
    console.error('Error in getCategoryCards:', error.stack);
    res.status(500).json({ message: 'Server error while fetching category cards', error: error.message });
  }
};

exports.addCategoryCard = async (req, res) => {
  try {
    const { category, description, adminID } = req.body;
    if (!category || !description || !adminID) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    if (!mongoose.Types.ObjectId.isValid(adminID)) {
      return res.status(400).json({ message: 'Invalid adminID format' });
    }
    const existingCategoryCard = await CategoryCard.findOne({ category, admin: new mongoose.Types.ObjectId(adminID) });
    if (existingCategoryCard) {
      return res.status(400).json({ message: 'Category card name already exists' });
    }
    const newCategoryCard = new CategoryCard({
      category,
      description,
      admin: new mongoose.Types.ObjectId(adminID),
    });
    await newCategoryCard.save();
    res.status(201).json({ message: 'Category card added successfully', data: newCategoryCard });
  } catch (error) {
    console.error('Error adding category card:', error.stack);
    res.status(500).json({ message: 'Server error while adding category card', error: error.message });
  }
};

exports.updateCategoryCard = async (req, res) => {
  try {
    const { category, description, adminID } = req.body;
    if (!mongoose.Types.ObjectId.isValid(adminID)) {
      return res.status(400).json({ message: 'Invalid adminID format' });
    }
    const categoryCard = await CategoryCard.findOne({ _id: req.params.id, admin: new mongoose.Types.ObjectId(adminID) });
    if (!categoryCard) {
      return res.status(404).json({ message: 'Category card not found' });
    }
    const existingCategoryCard = await CategoryCard.findOne({ 
      category, 
      admin: new mongoose.Types.ObjectId(adminID), 
      _id: { $ne: req.params.id } 
    });
    if (existingCategoryCard) {
      return res.status(400).json({ message: 'Category card name already exists' });
    }
    categoryCard.category = category || categoryCard.category;
    categoryCard.description = description || categoryCard.description;
    await categoryCard.save();
    res.status(200).json({ message: 'Category card updated successfully', data: categoryCard });
  } catch (error) {
    console.error('Error updating category card:', error.stack);
    res.status(500).json({ message: 'Server error while updating category card', error: error.message });
  }
};

exports.deleteCategoryCard = async (req, res) => {
  try {
    const adminID = req.query.adminID;
    if (!mongoose.Types.ObjectId.isValid(adminID)) {
      return res.status(400).json({ message: 'Invalid adminID format' });
    }
    const categoryCard = await CategoryCard.findOneAndDelete({ 
      _id: req.params.id, 
      admin: new mongoose.Types.ObjectId(adminID) 
    });
    if (!categoryCard) {
      return res.status(404).json({ message: 'Category card not found' });
    }
    res.status(200).json({ message: 'Category card deleted successfully' });
  } catch (error) {
    console.error('Error deleting category card:', error.stack);
    res.status(500).json({ message: 'Server error while deleting category card', error: error.message });
  }
};