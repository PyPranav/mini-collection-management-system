// const express = require('express');
// const router = express.Router();
// const customerController = require('../controllers/customerController');
// const { authenticateToken } = require('../middleware/auth');
// const { validateUploadedFile } = require('../middleware/upload');

// // All routes require authentication
// router.use(authenticateToken);

// router.post('/', customerController.createCustomer);
// router.get('/', customerController.getCustomers);
// router.get('/:id', customerController.getCustomerById);
// router.put('/:id', customerController.updateCustomer);
// router.delete('/:id', customerController.deleteCustomer);
// router.post('/bulk-upload', validateUploadedFile, customerController.bulkUploadCustomers);

// module.exports = router;