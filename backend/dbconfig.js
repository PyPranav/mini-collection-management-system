const { Client } = require("@elastic/elasticsearch");
const { seedCustomers } = require("./utils/seedCustomers");

let client;

const connect = async () => {
  if (client) {
    console.log("Elasticsearch client already connected");
    return;
  }
  client = new Client({
    node: process.env.ELASTICSEARCH_URL || "http://elasticsearch:9200", // Default to localhost if not set
    auth: {
      username: process.env.ELASTICSEARCH_USERNAME || "elastic",
      password: process.env.ELASTICSEARCH_PASSWORD || "changeme",
    },
  });

  client
    .ping()
    .then(() => {
      console.log("Elasticsearch client connected successfully");
    })
    .catch((error) => {
      console.error("Elasticsearch client connection failed:", error);
    });
};

const createIndex = async (indexName, mappings) => {
  try {
    const response = await getClient().indices.create({
      index: indexName,
      body: {
        mappings: mappings,
      },
    });
    return response;
  } catch (error) {
    console.error("Error creating index:", error);
    throw error;
  }
};

const checkIndexExists = async (indexName) => {
  try {
    const response = await getClient().indices.exists({ index: indexName });
    return response;
  } catch (error) {
    console.error("Error checking index existence:", error);
    throw error;
  }
};

const createDoc = async (index, body) => {
  try {
    const response = await getClient().index({
      index,
      body,
    });
    return response;
  } catch (error) {
    console.error("Error creating document:", error);
    throw error;
  }
};

const updateDoc = async (index, id, body) => {
  try {
    const response = await getClient().update({
      index,
      id,
      body: {
        doc: body,
      },
    });
    return response;
  } catch (error) {
    console.error("Error updating document:", error);
    throw error;
  }
};

const deleteDoc = async (index, id) => {
  try {
    const response = await getClient().delete({
      index,
      id,
    });
    return response;
  } catch (error) {
    console.error("Error deleting document:", error);
    throw error;
  }
};

const searchDocs = async (index, body) => {
  try {
    const response = await getClient().search({
      index,
      body,
    });
    return response;
  } catch (error) {
    console.error("Error searching documents:", error);
    throw error;
  }
};

const getClient = () => {
  if (!client) {
    throw new Error(
      "Elasticsearch client is not initialized. Call connect() first."
    );
  }
  return client;
};

const initializeDB = async () => {
  // user index
  if (!(await checkIndexExists("users"))) {
    console.log("Creating users index...");
    createIndex("users", {
      properties: {
        email: { type: "keyword" },
        password: { type: "text", index: false },
        created_at: { type: "date" },
      },
    });
  } else {
    console.log("Users index already exists.");
  }

  // customer index
  if (!(await checkIndexExists("customers"))) {
    console.log("Creating customers index...");
    await createIndex("customers", {
      properties: {
        name: {
          type: "text",
        },
        contact_info: {
          properties: {
            email: { type: "keyword" },
            phone: { type: "keyword" },
          },
        },
        outstanding_amount: { type: "double" },
        due_date: { type: "date" },
        payment_status: { type: "keyword" }, //'pending', 'paid', 'overdue'
        created_at: { type: "date" },
        updated_at: { type: "date" },
      },
    });
    await seedCustomers(createDoc);
  } else {
    console.log("Customer index already exists.");
  }

  if (!(await checkIndexExists("notifications"))) {
    console.log("Creating notifications index...");
    createIndex("notifications", {
      properties: {
        title: { type: "text" },
        message: { type: "text" },
        type: { type: "keyword" },
        created_at: { type: "date" },
        read_by_user_ids: { type: "keyword" },
      },
    });
  } else {
    console.log("notifications index already exists.");
  }
};

module.exports = {
  getClient,
  initializeDB,
  connect,
  checkIndexExists,
  createIndex,
  createDoc,
  updateDoc,
  deleteDoc,
  searchDocs,
}; // Export the Elasticsearch client and functions for use in other modules
