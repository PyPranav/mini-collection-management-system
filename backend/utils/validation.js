const validateUser = (userData, isPartial = false) => {
  const errors = [];
  const requiredFields = ["email", "password"];

  if (!isPartial) {
    requiredFields.forEach((field) => {
      if (!userData[field] || userData[field] === "") {
        errors.push(`${field} is required`);
      }
    });
  }

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

module.exports = {
  validateUser,
};
