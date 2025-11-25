// api/server.js
require('dotenv').config();
const express = require('express');
const app = express();

const PORT = process.env.PORT ? parseInt(process.env.PORT,10) : 3000;

app.get('/', (req, res) => {
  res.send(process.env.MESSAGE || 'Hello World');
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});