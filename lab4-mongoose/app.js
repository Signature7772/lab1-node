// app.js (lab4-mongoose)
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());
app.use(express.static(__dirname + '/public'));

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'usersdb';
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3003;

// (опціонально) щоб уникнути warning в деяких версіях mongoose
// mongoose.set('strictQuery', false);

let dbConnection;

// --- ОПИС СХЕМИ й МОДЕЛІ ---
const { Schema } = mongoose;
const userSchema = new Schema({
  name: { type: String, required: true, minlength: 3, maxlength: 50 },
  age: { type: Number, required: true, min: 1, max: 200 }
}, { versionKey: false }); // відключаємо __v якщо потрібно

const User = mongoose.model('User', userSchema);

// --- Підключення до БД через mongoose ---
async function start() {
  try {
    // підключаємося; mongoose сам обробляє опції сучасних драйверів
    dbConnection = await mongoose.connect(MONGO_URI, { dbName: DB_NAME });
    console.log('Mongoose connected to', MONGO_URI, 'DB:', DB_NAME);

    app.listen(PORT, () => console.log(`Server (Mongoose) listening at http://localhost:${PORT}`));
  } catch (err) {
    console.error('Mongoose connection error:', err);
    process.exit(1);
  }
}
start();

// --- РОУТИ CRUD ---

// GET /api/users  - всі користувачі
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}).lean();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// GET /api/users/:id - один користувач
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) return res.status(404).send('User not found');
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(400).send('Invalid id');
  }
});

// POST /api/users - створити
app.post('/api/users', async (req, res) => {
  try {
    const { name, age } = req.body;
    const newUser = await User.create({ name, age });
    res.status(201).json(newUser);
  } catch (err) {
    console.error(err);
    // валідаційні помилки mongoose приходять у err.errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation', details: err.errors });
    }
    res.status(500).send('Server error');
  }
});

// PUT /api/users - оновити (передаємо id, name, age в тілі)
app.put('/api/users', async (req, res) => {
  try {
    const { id, name, age } = req.body;
    if (!id) return res.status(400).send('Id required');
    const updated = await User.findByIdAndUpdate(id, { name, age }, { new: true, runValidators: true }).lean();
    if (!updated) return res.status(404).send('User not found');
    res.json(updated);
  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError') return res.status(400).json({ error: 'Validation', details: err.errors });
    res.status(400).send('Invalid data');
  }
});

// DELETE /api/users/:id - видалити
app.delete('/api/users/:id', async (req, res) => {
  try {
    const removed = await User.findByIdAndDelete(req.params.id).lean();
    if (!removed) return res.status(404).send('User not found');
    res.json(removed);
  } catch (err) {
    console.error(err);
    res.status(400).send('Invalid id');
  }
});

// graceful shutdown
process.on('SIGINT', async () => {
  console.log('SIGINT: closing mongoose connection...');
  if (dbConnection) await mongoose.disconnect();
  process.exit();
});