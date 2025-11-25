// proxy/server.js
require('dotenv').config();
const express = require('express');
const config = require('./config/config');
const indexRouter = require('./routes');

const app = express();

// можна додати middleware логування, наприклад:
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use('/', indexRouter);

// simple error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Proxy error');
});

const PORT = config.get('server.port');
console.log('Proxy config: API URL =', config.get('api.url'));
app.listen(PORT, () => console.log(`Proxy listening on http://localhost:${PORT}`));