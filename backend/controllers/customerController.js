const { createDoc, searchDocs, updateDoc, deleteDoc } = require("../dbconfig");
const { broadcastNotification } = require("../socket");
const { createNotificaiton } = require("../utils/notifications");
const { validateCustomer } = require("../utils/validation");
const xlsx = require("xlsx");

const allowedUpdateFields = [
  "name",
  "contact_info",
  "outstanding_amount",
  "due_date",
  "payment_status",
  "payments",
];

const createCustomer = async (req, res) => {
  const customerData = req.body;
  customerData.outstanding_amount = customerData.outstanding_amount || 0;
  customerData.due_date = customerData.due_date || null;
  customerData.payment_status = customerData.payment_status || "paid";

  console.log("!@!!!!", customerData);

  // Validate customer input
  const { isValid, errors } = validateCustomer(customerData);
  if (!isValid) {
    return res
      .status(400)
      .json({ message: "Please Provide a valid customer", errors });
  }

  // Create the customer document in Elasticsearch
  const newCustomer = await createDoc("customers", {
    ...customerData,
    created_at: new Date(),
    updated_at: new Date(),
  });

  if (!newCustomer) {
    return res.status(500).json({ message: "Error creating customer" });
  }

  createNotificaiton(
    "customerAdded",
    "New Customer created successfully",
    `${customerData.name} was added to customers`
  );
  res
    .status(201)
    .json({ message: "Customer created successfully", newCustomer });
};

const updateCustomer = async (req, res) => {
  const customerId = req.params.id;
  const customerData = req.body;

  // remove not allowed fields
  Object.keys(customerData).forEach((key) => {
    if (!allowedUpdateFields.includes(key)) {
      delete customerData[key];
    }
  });

  // Validate customer input
  const { isValid, errors } = validateCustomer(customerData, true);
  if (!isValid) {
    return res
      .status(400)
      .json({ message: "Please Provide a valid customer", errors });
  }

  // Update the customer document in Elasticsearch
  const updatedCustomer = await updateDoc("customers", customerId, {
    ...customerData,
    updated_at: new Date(),
  });

  if (!updatedCustomer) {
    return res.status(500).json({ message: "Error updating customer" });
  }

  res
    .status(200)
    .json({ message: "Customer updated successfully", updatedCustomer });
};

const getCustomerById = async (req, res) => {
  const customerId = req.params.id;

  // Search for the customer by ID
  const customer = (
    await searchDocs("customers", { query: { term: { _id: customerId } } })
  ).hits.hits[0];

  if (!customer) {
    return res.status(404).json({ message: "Customer not found" });
  }

  res.status(200).json(customer);
};

const deleteCustomer = async (req, res) => {
  const customerId = req.params.id;
  // Delete the customer document in Elasticsearch
  try {
    await deleteDoc("customers", customerId);
  } catch (error) {
    return res.status(500).json({ message: "Error deleting customer" });
  }
  res.status(200).json({ message: "Customer deleted successfully" });
};

const getCustomersWithPagination = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    // Sorting options
    sortBy = "created_at",
    sortOrder = "desc",
    // Search options
    name_search,
    email_search,
    // Filter options
    payment_status,
    outstanding_amount_min,
    outstanding_amount_max,
    due_date_from,
    due_date_to,
    created_after,
    created_before,
  } = req.query;

  const from = (page - 1) * limit;
  const must = [];

  // Build search queries for text fields (name OR email)
  if (name_search || email_search) {
    const shouldQueries = [];

    if (name_search) {
      shouldQueries.push({
        match: {
          name: {
            query: name_search,
            fuzziness: "AUTO",
            operator: "and",
          },
        },
      });
    }

    if (email_search) {
      shouldQueries.push({
        wildcard: {
          "contact_info.email": `*${email_search.toLowerCase()}*`,
        },
      });
    }

    // Add the OR condition for name/email search
    must.push({
      bool: {
        should: shouldQueries,
        minimum_should_match: 1,
      },
    });
  }

  // Build filters
  if (payment_status) {
    // Handle multiple payment statuses
    if (Array.isArray(payment_status)) {
      must.push({
        terms: { payment_status },
      });
    } else {
      must.push({
        term: { payment_status },
      });
    }
  }

  // Outstanding amount range filter
  if (outstanding_amount_min || outstanding_amount_max) {
    const rangeQuery = {};
    if (outstanding_amount_min) {
      rangeQuery.gt = parseFloat(outstanding_amount_min);
    }
    if (outstanding_amount_max) {
      rangeQuery.lte = parseFloat(outstanding_amount_max);
    }
    must.push({
      range: { outstanding_amount: rangeQuery },
    });
  }

  // Due date range filter
  if (due_date_from || due_date_to) {
    const rangeQuery = {};
    if (due_date_from) {
      rangeQuery.gt = due_date_from;
    }
    if (due_date_to) {
      rangeQuery.lte = due_date_to;
    }
    must.push({
      range: { due_date: rangeQuery },
    });
  }

  // Created date range filter
  if (created_after || created_before) {
    const rangeQuery = {};
    if (created_after) {
      rangeQuery.gt = created_after;
    }
    if (created_before) {
      rangeQuery.lte = created_before;
    }
    must.push({
      range: { created_at: rangeQuery },
    });
  }

  // Build the complete query
  const query = {
    from,
    size: parseInt(limit),
    sort: [{ [sortBy]: { order: sortOrder } }],
  };

  if (must.length > 0) {
    query.query = {
      bool: { must },
    };
  }

  try {
    const customers = await searchDocs("customers", query);

    res.status(200).json({
      data: customers.hits,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: customers.hits.total.value,
        totalPages: Math.ceil(customers.hits.total.value / limit),
      },
      appliedFilters: {
        search: {
          name_search: name_search || null,
          email_search: email_search || null,
        },
        filters: {
          payment_status: payment_status || null,
          outstanding_amount: {
            min: outstanding_amount_min || null,
            max: outstanding_amount_max || null,
          },
          due_date: {
            from: due_date_from || null,
            to: due_date_to || null,
          },
          created_at: {
            after: created_after || null,
            before: created_before || null,
          },
        },
        sorting: {
          field: sortBy,
          order: sortOrder,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch customers",
      message: error.message,
    });
  }
};

const bulkCustomerUpdateExcel = async (req, res) => {
  try {
    const { file } = req;
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Validate file type
    if (!file.originalname.match(/\.(xlsx|xls)$/)) {
      return res
        .status(400)
        .json({ message: "Please upload a valid Excel file" });
    }

    let workbook, data;
    try {
      workbook = xlsx.read(file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      data = xlsx.utils.sheet_to_json(sheet);
    } catch (error) {
      return res.status(400).json({ message: "Invalid Excel file format" });
    }

    if (!data || data.length === 0) {
      return res.status(400).json({ message: "Excel file is empty" });
    }

    const errors = [];
    const createdCustomers = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2; // +2 because Excel rows start at 1 and first row is header

      // Handle Excel date conversion if needed
      let dueDate = row.due_date;
      if (typeof dueDate === "number") {
        // Excel serial date number
        const excelDate = new Date((dueDate - 25569) * 86400 * 1000);
        dueDate = excelDate.toISOString().split("T")[0];
      }

      const customerData = {
        name: row.name?.toString().trim(),
        contact_info: {
          email: row.email?.toString().trim(),
          phone: row.phone?.toString().trim(),
        },
        outstanding_amount: parseFloat(row.outstanding_amount) || 0,
        due_date: dueDate,
        payment_status: row.payment_status?.toString().toLowerCase().trim(),
      };

      // Remove undefined/null values from contact_info
      if (!customerData.contact_info.email)
        delete customerData.contact_info.email;
      if (!customerData.contact_info.phone)
        delete customerData.contact_info.phone;

      // Validate customer input
      const { isValid, errors: validationErrors } = validateCustomer(
        customerData,
        false // false for create mode
      );

      if (!isValid) {
        errors.push({
          row: rowNumber,
          data: row,
          errors: validationErrors,
        });
        continue;
      }

      // Create the customer document in Elasticsearch
      try {
        const newCustomer = await createDoc("customers", {
          ...customerData,
          created_at: new Date(),
          updated_at: new Date(),
        });

        if (newCustomer) {
          createdCustomers.push({
            id: newCustomer._id,
            ...customerData,
            created_at: new Date(),
            updated_at: new Date(),
          });
        }
      } catch (error) {
        errors.push({
          row: rowNumber,
          data: row,
          error: error.message,
        });
      }
    }

    const response = {
      message: `Processing completed. ${createdCustomers.length} customers created successfully.`,
      totalProcessed: data.length,
      successCount: createdCustomers.length,
      errorCount: errors.length,
      createdCustomers,
    };

    createNotificaiton(
      "customerAdded",
      "New customers created successfully through bulk upload",
      ` ${createdCustomers.length} customers created successfully.`,
      `${createdCustomers.length} customers created successfully through bulk upload`
    );

    if (errors.length > 0) {
      response.errors = errors;
      response.message += ` ${errors.length} rows failed.`;
    }

    const statusCode = errors.length > 0 ? 207 : 200; // 207 = Multi-Status
    res.status(statusCode).json(response);
  } catch (error) {
    console.error("Bulk create error:", error);
    res.status(500).json({
      message: "Internal server error during bulk create",
      error: error.message,
    });
  }
};

const getSampleCustomerExcel = async (req, res) => {
  try {
    const xlsx = require("xlsx");

    const sampleData = [
      {
        name: "John Doe",
        email: "johndoe@example.com",
        phone: "+1234567890",
        outstanding_amount: 150.5,
        due_date: "2027-12-31",
        payment_status: "pending",
      },
      {
        name: "Jane Smith",
        email: "janesmith@example.com",
        phone: "+0987654321",
        outstanding_amount: 0,
        due_date: "2027-01-15",
        payment_status: "paid",
      },
      {
        name: "Bob Johnson",
        email: "bob.johnson@example.com",
        phone: "+1122334455",
        outstanding_amount: 75.25,
        due_date: "2027-06-30",
        payment_status: "overdue",
      },
    ];

    const worksheet = xlsx.utils.json_to_sheet(sampleData);

    // Set column widths for better readability
    worksheet["!cols"] = [
      { wch: 20 }, // name
      { wch: 25 }, // email
      { wch: 15 }, // phone
      { wch: 18 }, // outstanding_amount
      { wch: 12 }, // due_date
      { wch: 15 }, // payment_status
    ];

    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Sample_Customers");

    const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

    // Set proper headers
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=sample_customers_template.xlsx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Length", buffer.length);

    res.send(buffer);
  } catch (error) {
    console.error("Sample Excel generation error:", error);
    res.status(500).json({
      message: "Error generating sample Excel file",
      error: error.message,
    });
  }
};

module.exports = {
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerById,
  getCustomersWithPagination,
  bulkCustomerUpdateExcel,
  getSampleCustomerExcel,
};
