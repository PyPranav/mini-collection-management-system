// backend/__tests__/notificationController.test.js

// Mock the dependencies
jest.mock("../dbconfig");

// Import the controller to be tested
const notificationController = require("../controllers/notificationController");

// Import the mocked functions to control their behavior
const { searchDocs, updateDoc, getClient } = require("../dbconfig");

// Helper to create mock Express request and response objects
const mockRequest = (params = {}, user = {}) => ({
  params,
  user,
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// Clear mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});


describe("Notification Controller", () => {
  
  describe("markNotificationAsRead", () => {
    it("should mark a notification as read successfully", async () => {
      const req = mockRequest({ id: "notif_123" }, { id: "user_abc" });
      const res = mockResponse();
      const fakeNotification = {
        _source: {
          title: "Test",
          read_by_user_ids: ["user_xyz"],
        },
      };
      // We test the internal getNotificationById by mocking what it calls
      searchDocs.mockResolvedValue({ hits: { hits: [fakeNotification] } });
      updateDoc.mockResolvedValue({}); // Simulate successful update

      // Act
      await notificationController.markNotificationAsRead(req, res);

      // Assert
      expect(searchDocs).toHaveBeenCalledWith("notifications", { query: { term: { _id: "notif_123" } } });
      expect(updateDoc).toHaveBeenCalledWith("notifications", "notif_123", {
        read_by_user_ids: ["user_xyz", "user_abc"],
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Notification marked as read" });
    });

    it("should return 404 if notification is not found", async () => {
        // Arrange
        const req = mockRequest({ id: "not_found" }, { id: "user_abc" });
        const res = mockResponse();
        searchDocs.mockResolvedValue({ hits: { hits: [] } }); // Simulate not found
  
        // Act
        await notificationController.markNotificationAsRead(req, res);
  
        // Assert
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "Notification not found" });
        expect(updateDoc).not.toHaveBeenCalled();
    });

    it("should return 500 on database error", async () => {
        const req = mockRequest({ id: "notif_123" }, { id: "user_abc" });
        const res = mockResponse();
        searchDocs.mockResolvedValue({ hits: { hits: [{ _source: {} }] } });
        updateDoc.mockRejectedValue(new Error("DB Error"));
  
        // Act
        await notificationController.markNotificationAsRead(req, res);
  
        // Assert
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
    });
  });

  describe("markAllNotificationsAsRead", () => {
    const mockBulk = jest.fn();

    beforeEach(() => {
      // Set up the nested mock for the ES client's bulk method
      getClient.mockReturnValue({ bulk: mockBulk });
    });

    it("should successfully mark all unread notifications as read", async () => {
        // Arrange
        const req = mockRequest({}, { id: "user_abc" });
        const res = mockResponse();
        const unreadNotifications = {
            hits: {
                hits: [
                    { _id: "n1", _source: { read_by_user_ids: [] } },
                    { _id: "n2", _source: { read_by_user_ids: ['other_user'] } },
                ],
            },
        };
        searchDocs.mockResolvedValue(unreadNotifications);
        mockBulk.mockResolvedValue({ errors: false }); // Simulate successful bulk op

        // Act
        await notificationController.markAllNotificationsAsRead(req, res);
        
        // Assert
        expect(searchDocs).toHaveBeenCalledWith("notifications", expect.objectContaining({
            query: { bool: { must_not: [{ term: { read_by_user_ids: "user_abc" } }] } }
        }));
        expect(getClient).toHaveBeenCalled();
        expect(mockBulk).toHaveBeenCalled();
        
        // Check the structure of the bulk request body
        const bulkBody = mockBulk.mock.calls[0][0].body;
        expect(bulkBody).toHaveLength(4); // 2 updates * 2 lines per update = 4
        expect(bulkBody[0]).toEqual({ update: { _index: "notifications", _id: "n1" } });
        expect(bulkBody[1]).toEqual({ doc: { read_by_user_ids: ["user_abc"] } });

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: "All notifications marked as read" });
    });

    it("should return 200 if no notifications needed updating", async () => {
        const req = mockRequest({}, { id: "user_abc" });
        const res = mockResponse();
        searchDocs.mockResolvedValue({ hits: { hits: [] } }); // No unread notifs found

        // Act
        await notificationController.markAllNotificationsAsRead(req, res);
        
        // Assert
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: "All notifications already marked as read" });
        expect(mockBulk).not.toHaveBeenCalled();
    });

    it("should return 500 if the bulk update operation fails", async () => {
        const req = mockRequest({}, { id: "user_abc" });
        const res = mockResponse();
        searchDocs.mockResolvedValue({ hits: { hits: [{ _id: "n1", _source: {} }] } });
        mockBulk.mockResolvedValue({ errors: true }); // Accept any value for details

        // Act
        await notificationController.markAllNotificationsAsRead(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                message: "Error marking all notifications as read",
            })
        );
    });
  });

  describe("getNotifications", () => {
    it("should fetch and format unread notifications for a user", async () => {
        // Arrange
        const req = mockRequest({}, { id: "user_abc" });
        const res = mockResponse();
        const dbNotifications = {
            hits: {
                hits: [
                    { 
                        _id: "n1", 
                        _source: { title: "Title 1", message: "Message 1", type: "info", created_at: "2024-01-01T12:00:00Z" } 
                    },
                    { 
                        _id: "n2", 
                        _source: { title: "Title 2", message: "Message 2", type: "alert", created_at: "2024-01-02T12:00:00Z" } 
                    }
                ],
            },
        };
        searchDocs.mockResolvedValue(dbNotifications);

        // Act
        await notificationController.getNotifications(req, res);

        // Assert
        expect(searchDocs).toHaveBeenCalledWith("notifications", expect.objectContaining({
            query: { bool: { must_not: [{ term: { read_by_user_ids: "user_abc" } }] } }
        }));
        expect(res.status).toHaveBeenCalledWith(200);
        
        const responseJson = res.json.mock.calls[0][0];
        expect(responseJson).toHaveLength(2);
        expect(responseJson[0]).toEqual({
            id: "n1",
            title: "Title 1",
            message: "Message 1",
            type: "info",
            created_at: "2024-01-01T12:00:00Z",
        });
        expect(responseJson[0]).not.toHaveProperty("_source");
    });

    it("should return an empty array if no unread notifications are found", async () => {
        const req = mockRequest({}, { id: "user_abc" });
        const res = mockResponse();
        searchDocs.mockResolvedValue({ hits: { hits: [] } });

        // Act
        await notificationController.getNotifications(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([]);
    });

    it("should return 500 on database error", async () => {
        const req = mockRequest({}, { id: "user_abc" });
        const res = mockResponse();
        searchDocs.mockRejectedValue(new Error("DB Error"));

        // Act
        await notificationController.getNotifications(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
    });
  });
});