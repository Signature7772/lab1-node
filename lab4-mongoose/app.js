// app.js (зріз)
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());
app.use(express.static(__dirname + '/public'));

const {
  MONGO_DB_HOSTNAME = 'localhost',
  MONGO_DB_PORT = '27017',
  MONGO_DB = 'usersdb',
  PORT = 3000
} = process.env;

const url = `mongodb://${MONGO_DB_HOSTNAME}:${MONGO_DB_PORT}/${MONGO_DB}`;

// схема
const { Schema } = mongoose;
const userSchema = new Schema({ name: String, age: Number }, { versionKey: false });
const User = mongoose.model('User', userSchema);

mongoose.connect(url, { /* сучасний mongoose сам справляється з опціями */ })
  .then(() => {
    console.log('Connected to MongoDB at', url);
    app.listen(parseInt(PORT, 10), () => console.log(`Server listening at http://localhost:${PORT}`));
  })
  .catch(err => { console.error('Mongo connection error:', err); process.exit(1); });

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