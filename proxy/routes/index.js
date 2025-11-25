// proxy/routes/index.js
const express = require('express');
const router = express.Router();
const proxyService = require('../services/proxyService');

router.get('/', async (req, res, next) => {
  try {
    const data = await proxyService.getRoot();
    // просто повертаємо те, що отримали з API
    res.send(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;