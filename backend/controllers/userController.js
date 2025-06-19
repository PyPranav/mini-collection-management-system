const {
  hashPassword,
  comparePassword,
  generateTokens,
  refreshTokens,
  extractTokenFromHeader,
} = require("../middleware/auth");
const { createDoc, searchDocs } = require("../dbconfig");
const { validateUser } = require("../utils/validation");

// registerUser function to handle user registration
const registerUser = async (req, res) => {
  const { email, password } = req.body;

  // Validate user input
  const { isValid, errors } = validateUser({
    email,
    password,
  });
  if (!isValid) {
    return res.status(400).json({ message: "Validation failed", errors });
  }

  // Check if the user already exists
  const userExists = (await searchDocs("users", { query: { term: { email } } }))
    .hits.hits;
  if (userExists.length > 0) {
    return res.status(400).json({ message: "Email already exists" });
  }

  // Hash the password before storing it
  const hashedPassword = await hashPassword(password);
  if (!hashedPassword) {
    return res.status(500).json({ message: "Error hashing password" });
  }

  // Create the user document in Elasticsearch
  const newUser = await createDoc("users", {
    email,
    password: hashedPassword,
    created_at: new Date(),
  });

  if (!newUser) {
    return res.status(500).json({ message: "Error creating user" });
  }

  // Generate tokens for the user
  const tokens = generateTokens({ email, id: newUser._id });
  if (!tokens) {
    return res.status(500).json({ message: "Error generating tokens" });
  }

  res.status(201).json({
    message: "User registered successfully",
    email,
    id: newUser._id,
    ...tokens,
  });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // search for the user by email
  const user = (await searchDocs("users", { query: { term: { email } } })).hits
    .hits[0];
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // compare the password
  const isPasswordValid = await comparePassword(
    password,
    user._source.password
  );
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid password" });
  }

  // Generate tokens for the user
  const tokens = generateTokens({ email, id: user._id });

  res
    .status(200)
    .json({ message: "Login successful", email, id: user._id, ...tokens });
};

const getCurrentUser = async (req, res) => {
  const userId = req.user.id;

  // search for the user by ID
  const user = (await searchDocs("users", { query: { term: { _id: userId } } }))
    .hits.hits[0];
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Return the user data without the password
  delete user._source.password;

  res.status(200).json({ email: user._source.email, id: user._id });
};

const refreshUserTokens = async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = extractTokenFromHeader(authHeader);

  try {
    const newTokens = refreshTokens(token);
    res
      .status(200)
      .json({ message: "Tokens refreshed successfully", ...newTokens });
  } catch (error) {
    res
      .status(401)
      .json({ message: "Failed to refresh tokens", error: error.message });
  }
};

const test = (req, res) => {
  res.status(200).json({ message: "Test route is working!" });
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  refreshUserTokens,
  test,
};
