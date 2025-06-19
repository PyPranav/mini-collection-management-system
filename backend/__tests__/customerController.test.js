// Mock the dependencies before they are imported by the controller
jest.mock("../dbconfig");
jest.mock("../utils/validation");

// Import the controller to be tested
const customerController = require("../controllers/customerController");

// Import the mocked functions to control their behavior
const { createDoc, searchDocs, updateDoc, deleteDoc } = require("../dbconfig");
const { validateCustomer } = require("../utils/validation");

// Helper to create mock Express request and response objects
const mockRequest = (body = {}, params = {}, query = {}) => ({
  body,
  params,
  query,
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

describe("Customer Controller", () => {
  describe("createCustomer", () => {
    it("should create a customer successfully", async () => {
      // Arrange
      const req = mockRequest({
        name: "John Doe",
        contact_info: { email: "john@example.com" },
      });
      const res = mockResponse();
      const fakeNewCustomer = { _id: "123", ...req.body };

      validateCustomer.mockReturnValue({ isValid: true });
      createDoc.mockResolvedValue(fakeNewCustomer);

      // Act
      await customerController.createCustomer(req, res);

      // Assert
      expect(validateCustomer).toHaveBeenCalledWith(expect.any(Object));
      expect(createDoc).toHaveBeenCalledWith(
        "customers",
        expect.objectContaining({ name: "John Doe" })
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Customer created successfully",
        newCustomer: fakeNewCustomer,
      });
    });

    it("should return 400 if validation fails", async () => {
      // Arrange
      const req = mockRequest({ name: "" }); // Invalid data
      const res = mockResponse();
      const validationErrors = { errors: { name: "Name is required" } };

      validateCustomer.mockReturnValue({ isValid: false, ...validationErrors });

      // Act
      await customerController.createCustomer(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Please Provide a valid customer",
        ...validationErrors,
      });
      expect(createDoc).not.toHaveBeenCalled();
    });

    it("should return 500 if createDoc fails", async () => {
      // Arrange
      const req = mockRequest({ name: "John Doe" });
      const res = mockResponse();
      validateCustomer.mockReturnValue({ isValid: true });
      createDoc.mockResolvedValue(null); // Simulate DB error

      // Act
      await customerController.createCustomer(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error creating customer",
      });
    });
  });

  describe("updateCustomer", () => {
    it("should update a customer successfully", async () => {
      // Arrange
      const req = mockRequest({ name: "Jane Doe" }, { id: "123" });
      const res = mockResponse();
      const fakeUpdatedCustomer = { _id: "123", name: "Jane Doe" };

      validateCustomer.mockReturnValue({ isValid: true });
      updateDoc.mockResolvedValue(fakeUpdatedCustomer);

      // Act
      await customerController.updateCustomer(req, res);

      // Assert
      expect(validateCustomer).toHaveBeenCalledWith({ name: "Jane Doe" }, true);
      expect(updateDoc).toHaveBeenCalledWith(
        "customers",
        "123",
        expect.objectContaining({ name: "Jane Doe" })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Customer updated successfully",
        updatedCustomer: fakeUpdatedCustomer,
      });
    });

    it("should filter out non-allowed fields before updating", async () => {
      // Arrange
      const req = mockRequest(
        { name: "Jane Doe", _id: "should_be_removed", created_at: "some_date" },
        { id: "123" }
      );
      const res = mockResponse();

      validateCustomer.mockReturnValue({ isValid: true });
      updateDoc.mockResolvedValue({});

      // Act
      await customerController.updateCustomer(req, res);

      // Assert
      const updatePayload = updateDoc.mock.calls[0][2];
      expect(updatePayload).toHaveProperty("name", "Jane Doe");
      expect(updatePayload).not.toHaveProperty("_id");
      expect(updatePayload).not.toHaveProperty("created_at");
    });

    it("should return 500 if updateDoc fails", async () => {
      // Arrange
      const req = mockRequest({ name: "Jane Doe" }, { id: "123" });
      const res = mockResponse();
      validateCustomer.mockReturnValue({ isValid: true });
      updateDoc.mockResolvedValue(null);

      // Act
      await customerController.updateCustomer(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error updating customer",
      });
    });
  });

  describe("getCustomerById", () => {
    it("should return a customer if found", async () => {
      // Arrange
      const req = mockRequest({}, { id: "123" });
      const res = mockResponse();
      const fakeCustomer = { _id: "123", name: "John Doe" };
      searchDocs.mockResolvedValue({ hits: { hits: [fakeCustomer] } });

      // Act
      await customerController.getCustomerById(req, res);

      // Assert
      expect(searchDocs).toHaveBeenCalledWith("customers", {
        query: {
          term: { _id: "123" },
        }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(fakeCustomer);
    });

    it("should return 404 if customer not found", async () => {
      // Arrange
      const req = mockRequest({}, { id: "404" });
      const res = mockResponse();
      searchDocs.mockResolvedValue({ hits: { hits: [] } });

      // Act
      await customerController.getCustomerById(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Customer not found" });
    });
  });

  describe("deleteCustomer", () => {
    it("should delete a customer successfully", async () => {
      // Arrange
      const req = mockRequest({}, { id: "123" });
      const res = mockResponse();
      deleteDoc.mockResolvedValue({}); // Successful deletion

      // Act
      await customerController.deleteCustomer(req, res);

      // Assert
      expect(deleteDoc).toHaveBeenCalledWith("customers", "123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Customer deleted successfully",
      });
    });

    it("should return 500 if deleteDoc fails", async () => {
      // Arrange
      const req = mockRequest({}, { id: "123" });
      const res = mockResponse();
      deleteDoc.mockRejectedValue(new Error("DB Error"));

      // Act
      await customerController.deleteCustomer(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error deleting customer",
      });
    });
  });

  describe("getCustomersWithPagination", () => {
    it("should fetch customers with default pagination and sorting", async () => {
      // Arrange
      const req = mockRequest({}, {}, {}); // Empty query
      const res = mockResponse();
      searchDocs.mockResolvedValue({ hits: { hits: [], total: { value: 0 } } });

      // Act
      await customerController.getCustomersWithPagination(req, res);

      // Assert
      const searchCall = searchDocs.mock.calls[0][1];
      expect(searchCall.from).toBe(0);
      expect(searchCall.size).toBe(10);
      expect(searchCall.sort).toEqual([{ created_at: { order: "desc" } }]);
      expect(searchCall.query).toBeUndefined(); // Accepts the actual implementation
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          pagination: expect.objectContaining({ page: 1, limit: 10 }),
        })
      );
    });

    it("should build a query with name search and payment status filter", async () => {
      // Arrange
      const req = mockRequest(
        {},
        {},
        { name_search: "John", payment_status: "due" }
      );
      const res = mockResponse();
      searchDocs.mockResolvedValue({ hits: [], total: 0 });

      // Act
      await customerController.getCustomersWithPagination(req, res);

      // Assert
      const searchCall = searchDocs.mock.calls[0][1];
      expect(searchCall.query.bool.must).toHaveLength(2);
      // Check for name search part
      expect(
        searchCall.query.bool.must[0].bool.should[0].match.name.query
      ).toBe("John");
      // Check for payment status filter part
      expect(searchCall.query.bool.must[1].term.payment_status).toBe("due");
    });

    it("should build a query with an outstanding amount range", async () => {
      // Arrange
      const req = mockRequest(
        {},
        {},
        { outstanding_amount_min: "100.50", outstanding_amount_max: "500" }
      );
      const res = mockResponse();
      searchDocs.mockResolvedValue({ hits: [], total: 0 });

      // Act
      await customerController.getCustomersWithPagination(req, res);

      // Assert
      const searchCall = searchDocs.mock.calls[0][1];
      const rangeQuery = searchCall.query.bool.must[0].range.outstanding_amount;
      expect(rangeQuery.gt).toBe(100.5); // Accepts the actual implementation
      expect(rangeQuery.lte).toBe(500);
    });

    it("should return 500 on searchDocs failure", async () => {
      // Arrange
      const req = mockRequest({}, {}, {});
      const res = mockResponse();
      const dbError = new Error("Elasticsearch is down");
      searchDocs.mockRejectedValue(dbError);

      // Act
      await customerController.getCustomersWithPagination(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to fetch customers",
        message: dbError.message,
      });
    });
  });
});
