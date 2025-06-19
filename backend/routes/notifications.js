const express = require("express");
const { isAuthenticated } = require("../middleware/auth");
const { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } = require("../controllers/notificationController");

const router = express.Router();

router.use(isAuthenticated); // Apply authentication middleware to all routes
router.get("/", getNotifications);
router.patch("/:id", markNotificationAsRead);
router.patch("/", markAllNotificationsAsRead);

module.exports = router; // Export the router for use in the main app
