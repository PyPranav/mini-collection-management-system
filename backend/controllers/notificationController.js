const {
  createDoc,
  searchDocs,
  updateDoc,
  deleteDoc,
  getClient,
} = require("../dbconfig");

const getNotificationById = async (id) => {
  const notification = await searchDocs("notifications", {
    query: { term: { _id: id } },
  });
  if (notification.hits.hits.length === 0) {
    return null;
  }
  return notification.hits.hits[0]._source;
};

const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId } = req.user;

    const notification = await getNotificationById(id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    await updateDoc("notifications", id, {
      read_by_user_ids: [...notification.read_by_user_ids, userId],
    });
    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const markAllNotificationsAsRead = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const client = getClient();

    // Find all notifications where read_by_user_ids does NOT include userId
    const notifications = await searchDocs("notifications", {
      query: {
        bool: {
          must_not: [{ term: { read_by_user_ids: userId } }],
        },
      },
    });

    if (!notifications.hits.hits.length) {
      return res
        .status(200)
        .json({ message: "All notifications already marked as read" });
    }

    // Prepare bulk update body
    const body = [];
    notifications.hits.hits.forEach((hit) => {
      const notification = hit._source;
      const notificationId = hit._id;
      const updatedReadBy = Array.isArray(notification.read_by_user_ids)
        ? [...new Set([...notification.read_by_user_ids, userId])]
        : [userId];
      body.push({ update: { _index: "notifications", _id: notificationId } });
      body.push({ doc: { read_by_user_ids: updatedReadBy } });
    });

    // Perform bulk update
    const bulkResponse = await client.bulk({ refresh: true, body });
    if (bulkResponse.errors) {
      return res
        .status(500)
        .json({
          message: "Error marking all notifications as read",
          details: bulkResponse.errors,
        });
    }

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getNotifications = async (req, res) => {
  try {
    const { id: userId } = req.user;
    console.log("userId", userId)
    const notifications = await searchDocs("notifications", {
      query: {
        bool: {
          must_not: [{ term: { read_by_user_ids: userId } }],
        },
      },
      sort: [{ created_at: { order: "desc" } }],
      size: 100,
    });
    // console.log("notifications", notifications.hits.hits);

    const formattedNotifications = notifications.hits.hits.map((hit) => {
      const n = hit._source;
      console.log(n.read_by_user_ids)
      return {
        id: hit._id || n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        created_at: n.created_at,
      };
    });
    // console.log("formattedNotifications", formattedNotifications);
    res.status(200).json(formattedNotifications);
  } catch (error) {
    console.error("Error getting notifications:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getNotifications,
};
