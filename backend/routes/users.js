const express = require("express");
const userController = require("../controllers/userController");
const { isAuthenticated } = require("../middleware/auth");

const router = express.Router();

router.get("/profile", isAuthenticated, userController.getCurrentUser);
router.get("/test", userController.test);

router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.post("/refresh-tokens", userController.refreshUserTokens);

module.exports = router;
