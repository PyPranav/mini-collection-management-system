const { createDoc } = require("../dbconfig");
const { broadcastNotification } = require("../socket");

const createNotificaiton = async (type, title, message, notification) => {
  try {
    broadcastNotification(notification ?? title);
    const noti = await createDoc("notifications", {
      type,
      title,
      message,
      created_at: new Date(),
      read_by_user_ids: [],
    });
  } catch {
    console.error("something went wrong in notificaiton processing");
  }
};

module.exports = {
  createNotificaiton,
};
