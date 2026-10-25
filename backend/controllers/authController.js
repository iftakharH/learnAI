'use strict';

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { config } = require('../config/env');
const { ApiError } = require('../utils/ApiError');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;
const MAX_PASSWORD_LENGTH = 128;

const generateToken = (id) => {
  if (!config.jwtSecret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign({ id: String(id) }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
};

const toAuthResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  token: generateToken(user._id),
});

const assertPasswordPolicy = (password) => {
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    throw ApiError.badRequest(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    throw ApiError.badRequest(`Password cannot exceed ${MAX_PASSWORD_LENGTH} characters`);
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const name = String(req.body?.name || '').trim();
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = req.body?.password;

  if (!name || !email || !password) {
    throw ApiError.badRequest('Name, email, and password are required');
  }
  if (name.length > 80) {
    throw ApiError.badRequest('Name cannot exceed 80 characters');
  }
  if (!EMAIL_PATTERN.test(email)) {
    throw ApiError.badRequest('Please provide a valid email address');
  }
  assertPasswordPolicy(password);

  if (await User.exists({ email })) {
    throw ApiError.conflict('An account with this email already exists');
  }

  let user;
  try {
    user = await User.create({ name, email, password });
  } catch (error) {
    // Covers the race between the existence check and the insert.
    if (error.code === 11000) {
      throw ApiError.conflict('An account with this email already exists');
    }
    throw error;
  }

  res.status(201).json(toAuthResponse(user));
};

// @desc    Authenticate a user and return a token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = req.body?.password;

  if (!email || !password) {
    throw ApiError.badRequest('Email and password are required');
  }

  const user = await User.findOne({ email }).select('+password');
  const isValid = user ? await user.matchPassword(String(password)) : false;

  if (!isValid) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  res.json(toAuthResponse(user));
};

// @desc    Get the signed-in user
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  res.json({ _id: user._id, name: user.name, email: user.email });
};

// @desc    Change the password
// @route   PUT /api/auth/update-password
// @access  Private
const updateUserPassword = async (req, res) => {
  const { currentPassword, password } = req.body || {};

  if (!currentPassword || !password) {
    throw ApiError.badRequest('currentPassword and password are required');
  }
  assertPasswordPolicy(password);

  const user = await User.findById(req.user._id).select('+password');
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (!(await user.matchPassword(String(currentPassword)))) {
    throw ApiError.unauthorized('Current password is incorrect');
  }

  user.password = password;
  await user.save();

  res.json({ message: 'Password updated successfully' });
};

module.exports = { registerUser, loginUser, getUserProfile, updateUserPassword };
