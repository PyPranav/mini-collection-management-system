const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

// Generate JWT tokens
const generateTokens = (payload) => {
  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'collection-management-system'
  });

  const refreshToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    issuer: 'collection-management-system'
  });

  return { accessToken, refreshToken };
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

// Hash password
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Extract token from header
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) {
    throw new Error('Authorization header is required');
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw new Error('Authorization header format should be: Bearer <token>');
  }

  return parts[1];
};

// Authentication middleware
const isAuthenticated = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);


    const decoded = verifyToken(token);

    req.user = {
      email: decoded.email,
    };
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized access',
      error: error.message
    });
  }
};

const refreshTokens = (refreshToken)=>{
  try {
    const decoded = verifyToken(refreshToken);

    // Generate new tokens
    const tokenPayload = {
      email: decoded.email,
    };

    return generateTokens(tokenPayload);
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
}

module.exports = {
  // Core auth functions
  generateTokens,
  verifyToken,
  hashPassword,
  comparePassword,
  extractTokenFromHeader,

  // Middleware
  isAuthenticated,
};