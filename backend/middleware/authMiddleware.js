'use strict';

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { config } = require('../config/env');
const { ApiError } = require('../utils/ApiError');

/**
 * Require a valid Bearer token and attach the matching user to `req.user`.
 */
const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (!token || scheme.toLowerCase() !== 'bearer') {
      throw ApiError.unauthorized('Authentication required');
    }

    if (!config.jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      throw ApiError.unauthorized('Your session is no longer valid. Please sign in again.');
    }

    req.user = user;
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Your session has expired. Please sign in again.'));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(ApiError.unauthorized('Invalid authentication token.'));
    }
    return next(error);
  }
};

module.exports = { protect };
