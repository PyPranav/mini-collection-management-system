// Mock the dependencies before they are imported by the controller
jest.mock("../middleware/auth");
jest.mock("../dbconfig");
jest.mock("../utils/validation");

const userController = require("../controllers/userController");
const {
  hashPassword,
  comparePassword,
  generateTokens,
  refreshTokens,
  extractTokenFromHeader,
} = require("../middleware/auth");
const { createDoc, searchDocs } = require("../dbconfig");
const { validateUser } = require("../utils/validation");

// Helper to create mock Express request and response objects
const mockRequest = (body = {}, user = null, headers = {}) => ({
  body,
  user,
  headers,
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// Clear all mocks before each test to ensure a clean state
beforeEach(() => {
  jest.clearAllMocks();
});

describe("User Controller", () => {
  describe("registerUser", () => {
    it("should register a user successfully and return tokens", async () => {
      // Arrange
      const req = mockRequest({
        email: "test@example.com",
        password: "password123",
      });
      const res = mockResponse();
      const fakeTokens = {
        accessToken: "fakeAccess",
        refreshToken: "fakeRefresh",
      };

      // Mock dependency functions
      validateUser.mockReturnValue({ isValid: true, errors: {} });
      searchDocs.mockResolvedValue({ hits: { hits: [] } }); // User does not exist
      hashPassword.mockResolvedValue("hashed_password");
      createDoc.mockResolvedValue({ _id: "newUserId" });
      generateTokens.mockReturnValue(fakeTokens);

      // Act
      await userController.registerUser(req, res);

      // Assert
      expect(validateUser).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
      expect(searchDocs).toHaveBeenCalledWith("users", {
        term: { email: "test@example.com" },
      });
      expect(hashPassword).toHaveBeenCalledWith("password123");
      expect(createDoc).toHaveBeenCalledWith("users", expect.any(Object));
      expect(generateTokens).toHaveBeenCalledWith({
        email: "test@example.com",
        id: "newUserId",
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "User registered successfully",
        email: "test@example.com",
        id: "newUserId",
        ...fakeTokens,
      });
    });

    it("should return 400 if validation fails", async () => {
      // Arrange
      const req = mockRequest({ email: "invalid", password: "123" });
      const res = mockResponse();
      validateUser.mockReturnValue({
        isValid: false,
        errors: { email: "Invalid email" },
      });

      // Act
      await userController.registerUser(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Validation failed",
        errors: { email: "Invalid email" },
      });
      expect(searchDocs).not.toHaveBeenCalled();
    });

    it("should return 400 if email already exists", async () => {
      // Arrange
      const req = mockRequest({
        email: "exists@example.com",
        password: "password123",
      });
      const res = mockResponse();
      validateUser.mockReturnValue({ isValid: true, errors: {} });
      searchDocs.mockResolvedValue({ hits: { hits: [{ _id: "existingId" }] } }); // User exists

      // Act
      await userController.registerUser(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Email already exists",
      });
      expect(hashPassword).not.toHaveBeenCalled();
    });

    it("should return 500 if creating user fails", async () => {
      // Arrange
      const req = mockRequest({
        email: "test@example.com",
        password: "password123",
      });
      const res = mockResponse();
      validateUser.mockReturnValue({ isValid: true, errors: {} });
      searchDocs.mockResolvedValue({ hits: { hits: [] } });
      hashPassword.mockResolvedValue("hashed_password");
      createDoc.mockResolvedValue(null); // Simulate creation failure

      // Act
      await userController.registerUser(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Error creating user" });
    });
  });

  describe("loginUser", () => {
    it("should log in a user successfully and return tokens", async () => {
      // Arrange
      const req = mockRequest({
        email: "user@example.com",
        password: "password123",
      });
      const res = mockResponse();
      const fakeUser = {
        _id: "userId123",
        _source: { email: "user@example.com", password: "hashed_password" },
      };
      const fakeTokens = {
        accessToken: "fakeAccess",
        refreshToken: "fakeRefresh",
      };

      searchDocs.mockResolvedValue({ hits: { hits: [fakeUser] } });
      comparePassword.mockResolvedValue(true);
      generateTokens.mockReturnValue(fakeTokens);

      // Act
      await userController.loginUser(req, res);

      // Assert
      expect(searchDocs).toHaveBeenCalledWith("users", {
        term: { email: "user@example.com" },
      });
      expect(comparePassword).toHaveBeenCalledWith(
        "password123",
        "hashed_password"
      );
      expect(generateTokens).toHaveBeenCalledWith({
        email: "user@example.com",
        id: "userId123",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Login successful",
        email: "user@example.com",
        id: "userId123",
        ...fakeTokens,
      });
    });

    it("should return 404 if user not found", async () => {
      // Arrange
      const req = mockRequest({
        email: "notfound@example.com",
        password: "password123",
      });
      const res = mockResponse();
      searchDocs.mockResolvedValue({ hits: { hits: [] } }); // User not found

      // Act
      await userController.loginUser(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
      expect(comparePassword).not.toHaveBeenCalled();
    });

    it("should return 401 for an invalid password", async () => {
      // Arrange
      const req = mockRequest({
        email: "user@example.com",
        password: "wrong_password",
      });
      const res = mockResponse();
      const fakeUser = {
        _id: "userId123",
        _source: { email: "user@example.com", password: "hashed_password" },
      };
      searchDocs.mockResolvedValue({ hits: { hits: [fakeUser] } });
      comparePassword.mockResolvedValue(false); // Password does not match

      // Act
      await userController.loginUser(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid password" });
      expect(generateTokens).not.toHaveBeenCalled();
    });
  });

  describe("getCurrentUser", () => {
    it("should return the current user's data (without password)", async () => {
      // Arrange
      const req = mockRequest({}, { id: "userId123" }); // `req.user` is populated by isAuthenticated middleware
      const res = mockResponse();
      const fakeUser = {
        _id: "userId123",
        _source: { email: "current@example.com", password: "hashed_password" },
      };
      searchDocs.mockResolvedValue({ hits: { hits: [fakeUser] } });

      // Act
      await userController.getCurrentUser(req, res);

      // Assert
      expect(searchDocs).toHaveBeenCalledWith("users", {
        term: { _id: "userId123" },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        email: "current@example.com",
        id: "userId123",
      });
    });

    it("should return 404 if user not found", async () => {
      // Arrange
      const req = mockRequest({}, { id: "nonexistentUserId" });
      const res = mockResponse();
      searchDocs.mockResolvedValue({ hits: { hits: [] } }); // User not found

      // Act
      await userController.getCurrentUser(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });
  });

  describe("refreshUserTokens", () => {
    it("should refresh tokens successfully", async () => {
      // Arrange
      const req = mockRequest({}, null, {
        authorization: "Bearer oldRefreshToken",
      });
      const res = mockResponse();
      const newTokens = {
        accessToken: "newAccess",
        refreshToken: "newRefresh",
      };

      extractTokenFromHeader.mockReturnValue("oldRefreshToken");
      refreshTokens.mockReturnValue(newTokens);

      // Act
      await userController.refreshUserTokens(req, res);

      // Assert
      expect(extractTokenFromHeader).toHaveBeenCalledWith(
        "Bearer oldRefreshToken"
      );
      expect(refreshTokens).toHaveBeenCalledWith("oldRefreshToken");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Tokens refreshed successfully",
        ...newTokens,
      });
    });

    it("should return 401 if refreshing tokens fails", async () => {
      // Arrange
      const req = mockRequest({}, null, {
        authorization: "Bearer invalidToken",
      });
      const res = mockResponse();
      const error = new Error("Invalid refresh token");

      extractTokenFromHeader.mockReturnValue("invalidToken");
      refreshTokens.mockImplementation(() => {
        throw error;
      });

      // Act
      await userController.refreshUserTokens(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to refresh tokens",
        error: error.message,
      });
    });
  });
});
