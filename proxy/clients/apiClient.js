// proxy/clients/apiClient.js
const axios = require('axios');
const config = require('../config/config');

const client = axios.create({
  baseURL: config.get('api.url'),
  timeout: 5000
});

module.exports = client;