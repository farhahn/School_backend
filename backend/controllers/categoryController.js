const mongoose = require('mongoose');
const Category = require('../models/Category');

exports.getCategories = async (req, res) => {
  try {
    const adminID = req.params.adminID;
    if (!mongoose.Types.ObjectId.isValid(adminID)) {
      console.error(`Invalid adminID format: ${adminID}`);
      return res.status(400).json({ message: 'Invalid adminID format' });
    }
    console.log(`Fetching categories for adminID: ${adminID}`);
    const categories = await Category.find({ school: new mongoose.Types.ObjectId(adminID) })
      .sort({ createdAt: -1 })
      .lean();
    console.log(`Found ${categories.length} categories for adminID: ${adminID}`);
    console.log('Categories:', JSON.stringify(categories, null, 2));
    res.status(200).json({
      message: 'Categories fetched successfully',
      data: categories,
      count: categories.length,
    });
  } catch (error) {
    console.error('Error fetching categories:', error.message);
    res.status(500).json({ message: 'Server error while fetching categories', error: error.message });
  }
};

exports.addCategory = async (req, res) => {
  try {
    const { name, description, adminID } = req.body;
    if (!name || !description || !adminID) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    if (!mongoose.Types.ObjectId.isValid(adminID)) {
      return res.status(400).json({ message: 'Invalid adminID format' });
    }
    const newCategory = new Category({
      name: name.trim(),
      description: description.trim(),
      active: true,
      school: new mongoose.Types.ObjectId(adminID),
      categoryId: new mongoose.Types.ObjectId().toString(),
    });
    await newCategory.save();
    console.log('Added new category:', JSON.stringify(newCategory, null, 2));
    res.status(201).json({ message: 'Category added successfully', data: newCategory });
  } catch (error) {
    console.error('Error adding category:', error.message);
    if (error.code === 11000 && error.keyPattern?.name) {
      return res.status(400).json({ message: 'Category name already exists', error: error.message });
    }
    res.status(500).json({ message: 'Server error while adding category', error: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { name, description, active, adminID } = req.body;
    if (!mongoose.Types.ObjectId.isValid(adminID)) {
      return res.status(400).json({ message: 'Invalid adminID format' });
    }
    const category = await Category.findOne({ _id: req.params.id, school: new mongoose.Types.ObjectId(adminID) });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    category.name = name ? name.trim() : category.name;
    category.description = description ? description.trim() : category.description;
    category.active = active !== undefined ? active : category.active;
    await category.save();
    console.log('Updated category:', category);
    res.status(200).json({ message: 'Category updated successfully', data: category });
  } catch (error) {
    console.error('Error updating category:', error.message);
    res.status(500).json({ message: 'Server error while updating category', error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const adminID = req.query.adminID;
    if (!mongoose.Types.ObjectId.isValid(adminID)) {
      return res.status(400).json({ message: 'Invalid adminID format' });
    }
    const category = await Category.findOneAndDelete({ _id: req.params.id, school: new mongoose.Types.ObjectId(adminID) });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    console.log('Deleted category:', category);
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error.message);
    res.status(500).json({ message: 'Server error while deleting category', error: error.message });
  }
};