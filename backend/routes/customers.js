const express = require("express");
const {
  createCustomer,
  updateCustomer,
  getCustomerById,
  deleteCustomer,
  getCustomersWithPagination,
  bulkCustomerUpdateExcel,
  getSampleCustomerExcel,
} = require("../controllers/customerController");
const { isAuthenticated } = require("../middleware/auth");

const router = express.Router();
// Using multer to handle file uploads in memory
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

router.use(isAuthenticated); // Apply authentication middleware to all routes
router.post("/", createCustomer); // Create a new customer
router.put("/:id", updateCustomer); // Update an existing customer by ID
router.get("/:id", getCustomerById); // Get a customer by ID
router.delete("/:id", deleteCustomer); // Delete a customer by ID
router.get("/", getCustomersWithPagination); // Get customers with pagination
router.post("/excel/bulk", upload.single("file"), bulkCustomerUpdateExcel);
router.get("/excel/sample", getSampleCustomerExcel); // Get sample Excel file for customer data

module.exports = router; // Export the router for use in the main app
