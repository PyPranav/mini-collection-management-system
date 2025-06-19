require("dotenv").config();
const express = require("express");
const { connect, initializeDB } = require("./dbconfig"); // Ensure dbconfig.js exports connect function
cors = require("cors");
const http = require("http");
const { setupSocket } = require("./socket"); // Import socket setup

const app = express();
const port = 5000;
const server = http.createServer(app); // Create HTTP server for socket.io
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Middleware to parse JSON bodies

// Import routes
const userRoutes = require("./routes/users");
const customerRoutes = require("./routes/customers");
const notificationRoutes = require("./routes/notifications");
const paymentRoutes = require("./routes/payments");
app.use("/api/users", userRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/payments", paymentRoutes);
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.get("/", (req, res) => {
  res.status(200).send({
    message: "Welcome to the Elasticsearch API",
    version: "1.0.0",
  });
});

// Import and start the due date cron job

const startServer = async () => {
  await connect(); // Connect to Elasticsearch
  await initializeDB(); // Initialize the database (create indices, etc.)
  require("./utils/dueDateCron");

  console.log("Connected to Elasticsearch");

  setupSocket(server); // Setup socket.io

  server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
};

startServer();

module.exports = { app, server }; // Export the app and server for testing purposes
