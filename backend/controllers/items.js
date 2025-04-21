const Item = require('../models/Item');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { uploadImage, deleteImage } = require('../config/cloudinary');
const path = require('path');

// @desc    Get all items
// @route   GET /api/v1/items
// @access  Public
exports.getItems = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single item
// @route   GET /api/v1/items/:id
// @access  Public
exports.getItem = asyncHandler(async (req, res, next) => {
  const item = await Item.findById(req.params.id).populate('user');

  if (!item) {
    return next(
      new ErrorResponse(`Item not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: item
  });
});

// @desc    Create new item
// @route   POST /api/v1/items
// @access  Private
exports.createItem = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;
  
  // Handle file upload
  if (!req.files || !req.files.image) {
    return next(new ErrorResponse('Please upload an image', 400));
  }
  
  const file = req.files.image;
  
  // Make sure the image is a photo
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse('Please upload an image file', 400));
  }
  
  // Check file size (limit to 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return next(new ErrorResponse('Image must be less than 5MB', 400));
  }
  
  // Create custom filename
  file.name = `item_${req.user.id}_${Date.now()}${path.parse(file.name).ext}`;
  
  // Save file to temp location
  const filePath = `${process.env.FILE_UPLOAD_PATH}/${file.name}`;
  
  file.mv(filePath, async (err) => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse('Problem with file upload', 500));
    }
    
    try {
      // Upload to Cloudinary
      const imageUrl = await uploadImage(filePath);
      
      // Add image URL to request body
      req.body.imageUrl = imageUrl;
      
      // Create item in database
      const item = await Item.create(req.body);
      
      res.status(201).json({
        success: true,
        data: item
      });
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      return next(new ErrorResponse('Problem with image upload', 500));
    }
  });
});

// @desc    Update item
// @route   PUT /api/v1/items/:id
// @access  Private
exports.updateItem = asyncHandler(async (req, res, next) => {
  let item = await Item.findById(req.params.id);

  if (!item) {
    return next(
      new ErrorResponse(`Item not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is item owner
  if (item.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this item`,
        401
      )
    );
  }
  
  // Handle file upload if there is one
  if (req.files && req.files.image) {
    const file = req.files.image;
    
    // Make sure the image is a photo
    if (!file.mimetype.startsWith('image')) {
      return next(new ErrorResponse('Please upload an image file', 400));
    }
    
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return next(new ErrorResponse('Image must be less than 5MB', 400));
    }
    
    // Create custom filename
    file.name = `item_${req.user.id}_${Date.now()}${path.parse(file.name).ext}`;
    
    // Save file to temp location
    const filePath = `${process.env.FILE_UPLOAD_PATH}/${file.name}`;
    
    file.mv(filePath, async (err) => {
      if (err) {
        console.error(err);
        return next(new ErrorResponse('Problem with file upload', 500));
      }
      
      try {
        // Delete previous image from Cloudinary if exists
        if (item.imageUrl) {
          await deleteImage(item.imageUrl);
        }
        
        // Upload new image to Cloudinary
        const imageUrl = await uploadImage(filePath);
        
        // Add image URL to request body
        req.body.imageUrl = imageUrl;
        
        // Update item in database
        item = await Item.findByIdAndUpdate(req.params.id, req.body, {
          new: true,
          runValidators: true
        });
        
        res.status(200).json({
          success: true,
          data: item
        });
      } catch (error) {
        console.error('Error with Cloudinary operations:', error);
        return next(new ErrorResponse('Problem with image processing', 500));
      }
    });
  } else {
    // Update without changing the image
    item = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: item
    });
  }
});

// @desc    Delete item
// @route   DELETE /api/v1/items/:id
// @access  Private
exports.deleteItem = asyncHandler(async (req, res, next) => {
  const item = await Item.findById(req.params.id);

  if (!item) {
    return next(
      new ErrorResponse(`Item not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is item owner
  if (item.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this item`,
        401
      )
    );
  }
  
  try {
    // Delete image from Cloudinary if exists
    if (item.imageUrl) {
      await deleteImage(item.imageUrl);
    }
    
    // Delete item from database
    await item.remove();
  } catch (error) {
    console.error('Error deleting item or image:', error);
    return next(new ErrorResponse('Problem deleting item', 500));
  }

  res.status(200).json({
    success: true,
    data: {}
  });
});