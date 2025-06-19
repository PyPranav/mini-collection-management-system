const validateUser = (userData, isPartial = false) => {
  const errors = [];
  const requiredFields = ["email", "password"];

  // --- 1. Required Fields Check (only for new user creation) ---
  if (!isPartial) {
    requiredFields.forEach((field) => {
      if (!userData[field] || userData[field] === "") {
        errors.push(`${field} is required`);
      }
    });
  }

  // --- 2. Field-Specific Format and Content Validation ---
  // Email validation
  if (userData.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      errors.push("Invalid email format");
    }
  }

  // Password validation
  if (userData.password) {
    if (typeof userData.password !== "string" || userData.password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }
    if (!/[A-Z]/.test(userData.password)) {
      errors.push("Password must contain at least one uppercase letter");
    }
    if (!/[a-z]/.test(userData.password)) {
      errors.push("Password must contain at least one lowercase letter");
    }
    if (!/[0-9]/.test(userData.password)) {
      errors.push("Password must contain at least one number");
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(userData.password)) {
      errors.push("Password must contain at least one special character");
    }
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validateCustomer = (customerData, isPartial = false) => {
  const errors = [];

  // --- 1. Required Fields Check (only for new customer creation) ---
  if (!isPartial) {
    const requiredFields = ["name", "contact_info"];
    requiredFields.forEach((field) => {
      if (!customerData[field] || customerData[field] === "") {
        errors.push(`${field} is required`);
      }
    });

    // Special check for contact_info object content
    if (customerData.contact_info && !customerData.contact_info.email) {
      errors.push("contact_info must contain an email address");
    }
    if (customerData.contact_info && !customerData.contact_info.phone) {
      errors.push("contact_info must contain a phone number");
    }
  }

  // --- 2. Field-Specific Format and Content Validation ---

  // Name validation
  if (customerData.name) {
    if (
      typeof customerData.name !== "string" ||
      customerData.name.trim().length < 2
    ) {
      errors.push("Name must be a string with at least 2 characters");
    }
  }

  // Contact Info validation
  if (customerData.contact_info) {
    if (
      typeof customerData.contact_info !== "object" ||
      customerData.contact_info === null
    ) {
      errors.push("contact_info must be an object");
    } else {
      // Email validation within contact_info
      if (customerData.contact_info.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(customerData.contact_info.email)) {
          errors.push("Invalid email format in contact_info");
        }
      }
      // Phone validation (optional field)
      if (customerData.contact_info.phone) {
        // A simple regex for numeric phone numbers, allows for optional '+' and is 10-15 digits long
        const phoneRegex = /^\+?\d{10,15}$/;
        if (!phoneRegex.test(customerData.contact_info.phone)) {
          errors.push(
            "Invalid phone number format. Should be 10-15 digits, optionally starting with '+'"
          );
        }
      }
    }
  }

  // Outstanding Amount validation
  if (customerData.outstanding_amount !== undefined) {
    if (
      typeof customerData.outstanding_amount !== "number" ||
      isNaN(customerData.outstanding_amount)
    ) {
      errors.push("Outstanding amount must be a valid number");
    } else if (customerData.outstanding_amount < 0) {
      errors.push("Outstanding amount cannot be negative");
    }
  }

  // Due Date validation
  if (customerData.due_date) {
    const date = new Date(customerData.due_date);
    if (isNaN(date.getTime())) {
      errors.push(
        "Invalid due date format. Please use a valid date string (e.g., YYYY-MM-DD)."
      );
    } else if (!isPartial && date < new Date().setHours(0, 0, 0, 0)) {
      // For new customers, due date should not be in the past.
      // For updates, this check is skipped to allow for overdue statuses.
      errors.push("Due date cannot be in the past for new customers.");
    }
  }

  // Payment Status validation
  if (customerData.payment_status) {
    const allowedStatuses = ["pending", "paid", "overdue"];
    if (!allowedStatuses.includes(customerData.payment_status)) {
      errors.push("Payment status must be one of: pending, paid, overdue");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  validateUser,
  validateCustomer,
};
