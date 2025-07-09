const mongoose = require('mongoose');
const House = require('../models/House');
const { sanitize } = require('express-mongo-sanitize');

const sendResponse = (res, status, message, data = null, count = null) => {
  const response = { message };
  if (data !== null) response.data = data;
  if (count !== null) response.count = count;
  return res.status(status).json(response);
};

// Generate a unique houseId for a specific school
const generateHouseId = async (schoolId) => {
  try {
    // Validate schoolId
    if (!mongoose.Types.ObjectId.isValid(schoolId)) {
      throw new Error(`Invalid schoolId format: ${schoolId}`);
    }
    const schoolObjectId = new mongoose.Types.ObjectId(schoolId);
    console.log(`Generating houseId for school: ${schoolObjectId}`);

    // Query all houses for the school to find the highest valid houseId
    const houses = await House.find({ school: schoolObjectId })
      .select('houseId')
      .lean();
    
    console.log(`Found houses: ${JSON.stringify(houses)}`);
    
    // Filter out invalid houseId values and find the maximum
    const validHouseIds = houses
      .map(house => house.houseId)
      .filter(id => typeof id === 'number' && !isNaN(id));
    
    const maxHouseId = validHouseIds.length > 0 ? Math.max(...validHouseIds) : 0;
    const newHouseId = maxHouseId + 1;
    
    console.log(`Generated houseId: ${newHouseId}`);
    return newHouseId;
  } catch (error) {
    console.error('Error generating houseId:', error.message, error.stack);
    throw new Error(`Failed to generate houseId: ${error.message}`);
  }
};

// Fetch all houses
exports.getAllHouses = async (req, res) => {
  try {
    const { adminID } = req.params;

    if (!mongoose.Types.ObjectId.isValid(adminID)) {
      return sendResponse(res, 400, 'Invalid admin ID format');
    }

    const houses = await House.find({ school: new mongoose.Types.ObjectId(adminID) })
      .sort({ name: 1 })
      .lean()
      .select('houseId name description class');

    const formattedHouses = houses.map((house) => ({
      id: house.houseId,
      name: house.name,
      description: house.description,
      class: house.class,
      _id: house._id,
    }));

    return sendResponse(res, 200, 'Houses fetched successfully', formattedHouses, formattedHouses.length);
  } catch (error) {
    console.error('Error fetching houses:', error.message, error.stack);
    return sendResponse(res, 500, `Server error while fetching houses: ${error.message}`);
  }
};

// Create a new house
exports.createHouse = async (req, res) => {
  try {
    const { adminID } = req.params;
    const { name, description, class: className } = sanitize(req.body);

    console.log(`Creating house for adminID: ${adminID}, payload:`, { name, description, className });

    if (!mongoose.Types.ObjectId.isValid(adminID)) {
      return sendResponse(res, 400, 'Invalid admin ID format');
    }

    if (!name || name.trim() === '') {
      return sendResponse(res, 400, 'House name is required');
    }

    const existingHouse = await House.findOne({
      school: new mongoose.Types.ObjectId(adminID),
      name: { $regex: `^${name.trim()}$`, $options: 'i' },
    });

    if (existingHouse) {
      return sendResponse(res, 400, 'House already exists');
    }

    const houseId = await generateHouseId(new mongoose.Types.ObjectId(adminID));
    console.log(`Generated houseId: ${houseId}`);

    // Validate houseId
    if (typeof houseId !== 'number' || isNaN(houseId)) {
      throw new Error(`Invalid generated houseId: ${houseId}`);
    }

    const newHouse = new House({
      name: name.trim(),
      description: description ? description.trim() : '',
      class: className ? className.trim() : '',
      houseId,
      school: new mongoose.Types.ObjectId(adminID),
    });

    await newHouse.save();

    return sendResponse(res, 201, 'House created successfully', {
      id: newHouse.houseId,
      name: newHouse.name,
      description: newHouse.description,
      class: newHouse.class,
      _id: newHouse._id,
    });
  } catch (error) {
    console.error('Error creating house:', error.message, error.stack);
    if (error.code === 11000) {
      return sendResponse(res, 400, `House ID ${error.keyValue?.houseId} already exists for this school`);
    }
    return sendResponse(res, 500, `Server error while creating house: ${error.message}`);
  }
};

// Delete a house
exports.deleteHouse = async (req, res) => {
  try {
    const { adminID, houseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(adminID)) {
      return sendResponse(res, 400, 'Invalid admin ID format');
    }

    if (!mongoose.Types.ObjectId.isValid(houseId)) {
      return sendResponse(res, 400, 'Invalid house ID format');
    }

    const result = await House.deleteOne({
      _id: new mongoose.Types.ObjectId(houseId),
      school: new mongoose.Types.ObjectId(adminID),
    });

    if (result.deletedCount === 0) {
      return sendResponse(res, 404, 'House not found');
    }

    return sendResponse(res, 200, 'House deleted successfully');
  } catch (error) {
    console.error('Error deleting house:', error.message, error.stack);
    return sendResponse(res, 500, `Server error while deleting house: ${error.message}`);
  }
};