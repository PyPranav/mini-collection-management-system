const { Client } = require('@elastic/elasticsearch');

const client = new Client({
    node: process.env.ELASTICSEARCH_URL, // Default to localhost if not set
    auth: {
        username: process.env.ELASTICSEARCH_USERNAME,
        password: process.env.ELASTICSEARCH_PASSWORD
    }
});

client.ping().then(() => {
    console.log('Elasticsearch client connected successfully');
}).catch((error) => {
    console.error('Elasticsearch client connection failed:', error);
});

const createIndex = async (indexName, mappings) => {
    try {
        const response = await client.indices.create({
            index: indexName,
            body: {
                mappings: mappings
            }
        });
        return response;
    } catch (error) {
        console.error('Error creating index:', error);
        throw error;
    }
}

const checkIndexExists = async (indexName) => {
    try {
        const response = await client.indices.exists({ index: indexName });
        return response;
    } catch (error) {
        console.error('Error checking index existence:', error);
        throw error;
    }
}

const createDoc = async (index, body) => {
    try {
        const response = await client.index({
            index,
            body
        });
        return response;
    } catch (error) {
        console.error('Error creating document:', error);
        throw error;
    }
}

const updateDoc = async (index, id, body) => {
    try {
        const response = await client.update({
            index,
            id,
            body: {
                doc: body
            }
        });
        return response;
    } catch (error) {
        console.error('Error updating document:', error);
        throw error;
    }
}

const deleteDoc = async (index, id) => {
    try {
        const response = await client.delete({
            index,
            id
        });
        return response;
    } catch (error) {
        console.error('Error deleting document:', error);
        throw error;
    }
}

const searchDocs = async (index, query) => {
    try {
        const response = await client.search({
            index,
            body: {
                query
            }
        });
        return response;
    } catch (error) {
        console.error('Error searching documents:', error);
        throw error;
    }
}

module.exports = {
    client,
    checkIndexExists,
    createIndex,
    createDoc,
    updateDoc,
    deleteDoc,
    searchDocs
}; // Export the Elasticsearch client and functions for use in other modules