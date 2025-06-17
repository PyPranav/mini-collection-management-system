const { Client } = require('@elastic/elasticsearch');

const client = new Client({
  node: process.env.ELASTICSEARCH_URL, // Default to localhost if not set
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME ,
    password: process.env.ELASTICSEARCH_PASSWORD  
  },
  headers: {
    accept: 'application/json'
  }
});

client.ping().then(() => {
  console.log('Elasticsearch client connected successfully');
}).catch((error) => {
  console.error('Elasticsearch client connection failed:', error);
});

module.exports = { client }; // Export the Elasticsearch client for use in other modules