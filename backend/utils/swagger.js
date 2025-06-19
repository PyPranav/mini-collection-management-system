// OpenAPI 3.0 specification for the Mini Collection Management System API
const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Mini Collection Management System API",
    version: "1.0.0",
    description: "API documentation for the Mini Collection Management System",
  },
  servers: [
    { url: "http://localhost:5000/api" }
  ],
  paths: {
    // Users
    "/users/register": {
      post: {
        summary: "Register a new user",
        tags: ["Users"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 8 },
                },
              },
              example: {
                email: "user@example.com",
                password: "Password123!"
              }
            }
          }
        },
        responses: {
          201: {
            description: "User registered successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    email: { type: "string" },
                    id: { type: "string" },
                    accessToken: { type: "string" },
                    refreshToken: { type: "string" }
                  }
                }
              }
            }
          },
          400: {
            description: "Validation failed or email exists",
            content: {
              "application/json": {
                schema: { type: "object" },
                example: { message: "Validation failed", errors: ["email is required"] }
              }
            }
          },
          500: {
            description: "Server error",
            content: { "application/json": { schema: { type: "object" } } }
          }
        }
      },
    },
    "/users/login": {
      post: {
        summary: "Login a user",
        tags: ["Users"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string" },
                },
              },
              example: {
                email: "user@example.com",
                password: "Password123!"
              }
            }
          }
        },
        responses: {
          200: {
            description: "Login successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    email: { type: "string" },
                    id: { type: "string" },
                    accessToken: { type: "string" },
                    refreshToken: { type: "string" }
                  }
                }
              }
            }
          },
          401: {
            description: "Invalid password",
            content: { "application/json": { schema: { type: "object" }, example: { message: "Invalid password" } } }
          },
          404: {
            description: "User not found",
            content: { "application/json": { schema: { type: "object" }, example: { message: "User not found" } } }
          }
        }
      },
    },
    "/users/refresh-tokens": {
      post: {
        summary: "Refresh user tokens",
        tags: ["Users"],
        parameters: [
          {
            name: "Authorization",
            in: "header",
            required: true,
            schema: { type: "string" },
            description: "Bearer refresh token"
          }
        ],
        responses: {
          200: {
            description: "Tokens refreshed successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    accessToken: { type: "string" },
                    refreshToken: { type: "string" }
                  }
                }
              }
            }
          },
          401: {
            description: "Failed to refresh tokens",
            content: { "application/json": { schema: { type: "object" }, example: { message: "Failed to refresh tokens" } } }
          }
        }
      },
    },
    "/users/profile": {
      get: {
        summary: "Get current user profile",
        tags: ["Users"],
        parameters: [
          {
            name: "Authorization",
            in: "header",
            required: true,
            schema: { type: "string" },
            description: "Bearer access token"
          }
        ],
        responses: {
          200: {
            description: "User profile",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    email: { type: "string" },
                    id: { type: "string" }
                  }
                }
              }
            }
          },
          404: {
            description: "User not found",
            content: { "application/json": { schema: { type: "object" }, example: { message: "User not found" } } }
          }
        }
      },
    },
    "/users/test": {
      get: {
        summary: "Test endpoint for users",
        tags: ["Users"],
        responses: {
          200: {
            description: "Test route is working",
            content: { "application/json": { schema: { type: "object" }, example: { message: "Test route is working!" } } }
          }
        }
      },
    },
    // Customers
    "/customers": {
      get: {
        summary: "Get customers with pagination",
        tags: ["Customers"],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
          { name: "sortBy", in: "query", schema: { type: "string", default: "created_at" } },
          { name: "sortOrder", in: "query", schema: { type: "string", default: "desc" } },
          { name: "name_search", in: "query", schema: { type: "string" } },
          { name: "email_search", in: "query", schema: { type: "string" } },
          { name: "payment_status", in: "query", schema: { type: "string", enum: ["pending", "paid", "overdue"] } },
          { name: "outstanding_amount_min", in: "query", schema: { type: "number" } },
          { name: "outstanding_amount_max", in: "query", schema: { type: "number" } },
          { name: "due_date_from", in: "query", schema: { type: "string", format: "date" } },
          { name: "due_date_to", in: "query", schema: { type: "string", format: "date" } },
          { name: "created_after", in: "query", schema: { type: "string", format: "date" } },
          { name: "created_before", in: "query", schema: { type: "string", format: "date" } }
        ],
        responses: {
          200: {
            description: "Paginated customers list",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { type: "array", items: { type: "object" } },
                    pagination: { type: "object" },
                    appliedFilters: { type: "object" }
                  }
                }
              }
            }
          },
          500: {
            description: "Failed to fetch customers",
            content: { "application/json": { schema: { type: "object" } } }
          }
        }
      },
      post: {
        summary: "Create a new customer",
        tags: ["Customers"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "contact_info"],
                properties: {
                  name: { type: "string" },
                  contact_info: {
                    type: "object",
                    required: ["email", "phone"],
                    properties: {
                      email: { type: "string", format: "email" },
                      phone: { type: "string" }
                    }
                  },
                  outstanding_amount: { type: "number", default: 0 },
                  due_date: { type: "string", format: "date", nullable: true },
                  payment_status: { type: "string", enum: ["pending", "paid", "overdue"], default: "paid" }
                }
              },
              example: {
                name: "John Doe",
                contact_info: { email: "john@example.com", phone: "+1234567890" },
                outstanding_amount: 100,
                due_date: "2027-12-31",
                payment_status: "pending"
              }
            }
          }
        },
        responses: {
          201: {
            description: "Customer created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    newCustomer: { type: "object" }
                  }
                }
              }
            }
          },
          400: {
            description: "Validation failed",
            content: { "application/json": { schema: { type: "object" }, example: { message: "Please Provide a valid customer", errors: ["name is required"] } } }
          },
          500: {
            description: "Server error",
            content: { "application/json": { schema: { type: "object" } } }
          }
        }
      },
    },
    "/customers/{id}": {
      get: {
        summary: "Get a customer by ID",
        tags: ["Customers"],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } }
        ],
        responses: {
          200: {
            description: "Customer found",
            content: { "application/json": { schema: { type: "object" } } }
          },
          404: {
            description: "Customer not found",
            content: { "application/json": { schema: { type: "object" }, example: { message: "Customer not found" } } }
          }
        }
      },
      put: {
        summary: "Update an existing customer by ID",
        tags: ["Customers"],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  contact_info: {
                    type: "object",
                    properties: {
                      email: { type: "string", format: "email" },
                      phone: { type: "string" }
                    }
                  },
                  outstanding_amount: { type: "number" },
                  due_date: { type: "string", format: "date", nullable: true },
                  payment_status: { type: "string", enum: ["pending", "paid", "overdue"] }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Customer updated successfully",
            content: { "application/json": { schema: { type: "object" }, example: { message: "Customer updated successfully" } } }
          },
          400: {
            description: "Validation failed",
            content: { "application/json": { schema: { type: "object" }, example: { message: "Please Provide a valid customer", errors: ["name is required"] } } }
          },
          404: {
            description: "Customer not found",
            content: { "application/json": { schema: { type: "object" }, example: { message: "Customer not found" } } }
          }
        }
      },
      delete: {
        summary: "Delete a customer by ID",
        tags: ["Customers"],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } }
        ],
        responses: {
          200: {
            description: "Customer deleted successfully",
            content: { "application/json": { schema: { type: "object" }, example: { message: "Customer deleted successfully" } } }
          },
          404: {
            description: "Customer not found",
            content: { "application/json": { schema: { type: "object" }, example: { message: "Customer not found" } } }
          },
          500: {
            description: "Server error",
            content: { "application/json": { schema: { type: "object" } } }
          }
        }
      },
    },
    "/customers/excel/bulk": {
      post: {
        summary: "Bulk update customers via Excel upload",
        tags: ["Customers"],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  file: { type: "string", format: "binary" }
                },
                required: ["file"]
              }
            }
          }
        },
        responses: {
          200: {
            description: "Bulk customers created successfully",
            content: { "application/json": { schema: { type: "object" } } }
          },
          207: {
            description: "Partial success with errors",
            content: { "application/json": { schema: { type: "object" } } }
          },
          400: {
            description: "Invalid or missing file",
            content: { "application/json": { schema: { type: "object" }, example: { message: "No file uploaded" } } }
          },
          500: {
            description: "Server error",
            content: { "application/json": { schema: { type: "object" } } }
          }
        }
      },
    },
    "/customers/excel/sample": {
      get: {
        summary: "Get sample Excel file for customer data",
        tags: ["Customers"],
        responses: {
          200: {
            description: "Sample Excel file",
            content: { "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {} }
          },
          500: {
            description: "Error generating sample Excel file",
            content: { "application/json": { schema: { type: "object" } } }
          }
        }
      },
    },
    // Notifications
    "/notifications": {
      get: {
        summary: "Get all notifications for the authenticated user",
        tags: ["Notifications"],
        parameters: [
          {
            name: "Authorization",
            in: "header",
            required: true,
            schema: { type: "string" },
            description: "Bearer access token"
          }
        ],
        responses: {
          200: {
            description: "List of notifications",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      title: { type: "string" },
                      message: { type: "string" },
                      type: { type: "string" },
                      created_at: { type: "string", format: "date-time" }
                    }
                  }
                }
              }
            }
          },
          500: {
            description: "Internal server error",
            content: { "application/json": { schema: { type: "object" } } }
          }
        }
      },
      patch: {
        summary: "Mark all notifications as read",
        tags: ["Notifications"],
        parameters: [
          {
            name: "Authorization",
            in: "header",
            required: true,
            schema: { type: "string" },
            description: "Bearer access token"
          }
        ],
        responses: {
          200: {
            description: "All notifications marked as read",
            content: { "application/json": { schema: { type: "object" }, example: { message: "All notifications marked as read" } } }
          },
          500: {
            description: "Internal server error",
            content: { "application/json": { schema: { type: "object" } } }
          }
        }
      },
    },
    "/notifications/{id}": {
      patch: {
        summary: "Mark a notification as read by ID",
        tags: ["Notifications"],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
          {
            name: "Authorization",
            in: "header",
            required: true,
            schema: { type: "string" },
            description: "Bearer access token"
          }
        ],
        responses: {
          200: {
            description: "Notification marked as read",
            content: { "application/json": { schema: { type: "object" }, example: { message: "Notification marked as read" } } }
          },
          404: {
            description: "Notification not found",
            content: { "application/json": { schema: { type: "object" }, example: { message: "Notification not found" } } }
          },
          500: {
            description: "Internal server error",
            content: { "application/json": { schema: { type: "object" } } }
          }
        }
      },
    },
    // Payments
    "/payments": {
      post: {
        summary: "Make a payment",
        tags: ["Payments"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["customerId"],
                properties: {
                  customerId: { type: "string" }
                }
              },
              example: { customerId: "customer_id_here" }
            }
          }
        },
        responses: {
          200: {
            description: "Payment made successfully",
            content: { "application/json": { schema: { type: "object" }, example: { message: "Payment made successfully" } } }
          },
          404: {
            description: "Customer not found",
            content: { "application/json": { schema: { type: "object" }, example: { message: "Customer not found" } } }
          },
          500: {
            description: "Error updating customer",
            content: { "application/json": { schema: { type: "object" } } }
          }
        }
      },
    },
    "/payments/{id}": {
      get: {
        summary: "Get payment details by ID",
        tags: ["Payments"],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } }
        ],
        responses: {
          200: {
            description: "Payment details",
            content: { "application/json": { schema: { type: "object" }, example: { name: "John Doe", outstanding_amount: 0, due_date: null, email: "john@example.com" } } }
          },
          404: {
            description: "Customer not found",
            content: { "application/json": { schema: { type: "object" }, example: { message: "Customer not found" } } }
          }
        }
      },
    },
  },
};

module.exports = swaggerDocument; 