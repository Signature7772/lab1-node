// proxy/services/proxyService.js
const apiClient = require('../clients/apiClient');

async function getRoot() {
  const resp = await apiClient.get('/');
  // повертаємо body
  return resp.data;
}

module.exports = { getRoot };