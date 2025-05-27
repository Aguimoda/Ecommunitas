const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { uploadImage, deleteImage } = require('../config/cloudinary'); // Importar funciones de Cloudinary
const bcrypt = require('bcryptjs'); // Asegurarse de que bcryptjs está importado

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get user profile
// @route   GET /api/v1/user/profile
// @access  Private
exports.getProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Private
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is requesting their own profile or is admin
  if (req.user.id !== user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to access this profile`,
        401
      )
    );
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user details (including profile picture)
// @route   PUT /api/v1/users/:id  (o podría ser /api/v1/auth/updatedetails)
// @access  Private
exports.updateUser = asyncHandler(async (req, res, next) => {
  let user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is updating their own profile or is admin
  if (req.user.id !== user.id.toString() && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this profile`,
        401
      )
    );
  }

  const { name, bio, location, password } = req.body;
  const updateData = {};

  if (name) updateData.name = name;
  if (bio) updateData.bio = bio;
  if (location) updateData.location = location;

  // Handle password update
  if (password) {
    const salt = await bcrypt.genSalt(10);
    updateData.password = await bcrypt.hash(password, salt);
  }

  // Handle avatar upload
  if (req.files && req.files.avatar) {
    const file = req.files.avatar;

    // Validate image type
    if (!file.mimetype.startsWith('image')) {
      return next(new ErrorResponse('Please upload an image file', 400));
    }

    // Validate image size (e.g., 5MB)
    if (file.size > process.env.MAX_FILE_UPLOAD_SIZE * 1024 * 1024) {
      return next(
        new ErrorResponse(
          `Please upload an image less than ${process.env.MAX_FILE_UPLOAD_SIZE}MB`,
          400
        )
      );
    }

    try {
      // Delete old avatar if exists and is a Cloudinary URL
      if (user.avatar && user.avatar.startsWith('http')) {
        await deleteImage(user.avatar);
      }

      // Upload new avatar
      const result = await uploadImage(file.tempFilePath, `avatars/${user._id}`);
      updateData.avatar = result.secure_url;
    } catch (err) {
      console.error('Cloudinary error:', err);
      return next(new ErrorResponse('Error uploading image to Cloudinary', 500));
    }
  }

  user = await User.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  await user.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});