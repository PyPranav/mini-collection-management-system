const express = require("express");
const {
  createCustomer,
  updateCustomer,
  getCustomerById,
  deleteCustomer,
  getCustomersWithPagination,
  bulkCustomerUpdateExcel,
  getSampleCustomerExcel,
  makePayment,
  getDetailsForPayment,
} = require("../controllers/customerController");

const router = express.Router();

router.post("/", makePayment);
router.get("/:id", getDetailsForPayment);

module.exports = router;
