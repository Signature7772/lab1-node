require('dotenv').config();
const express = require("express");

const app = express();
const PORT = 3000;

// Маршрут /
app.get("/", (req, res) => {
  res.send(process.env.MESSAGE || "Hello World");
});

// Експортуємо app для тестів
module.exports = app;

// Якщо файл запущено тоді запускаємо сервер
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}