// app.js
require('dotenv').config();
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
app.use(express.json()); // парсинг JSON тіл запиту
app.use(express.static(__dirname + '/public')); // статичні файли (index.html)

// Конфіг
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'usersdb';
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

let dbClient; // для коректного закриття

async function main() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    dbClient = client;
    console.log('Connected to MongoDB:', MONGO_URI);

    const db = client.db(DB_NAME);
    const usersCollection = db.collection('users');
    // зберігаємо колекцію у app.locals щоб мати доступ у роутерах
    app.locals.collection = usersCollection;

    // Запускаємо сервер тільки після успішного підключення
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}

main();

// --- РОУТИ CRUD ---
// GET /api/users  -> повернути всі користувачі
app.get('/api/users', async (req, res) => {
  try {
    const collection = req.app.locals.collection;
    const users = await collection.find({}).toArray();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// GET /api/users/:id  -> повернути одного користувача
app.get('/api/users/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const collection = req.app.locals.collection;
    const user = await collection.findOne({ _id: new ObjectId(id) });
    if (!user) return res.status(404).send('User not found');
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(400).send('Invalid id');
  }
});

// POST /api/users  -> створити користувача
app.post('/api/users', async (req, res) => {
  try {
    const { name, age } = req.body;
    if (!name || typeof age === 'undefined') return res.status(400).send('Bad request');
    const collection = req.app.locals.collection;
    const result = await collection.insertOne({ name, age: parseInt(age, 10) });
    const user = result.ops ? result.ops[0] : { _id: result.insertedId, name, age };
    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// PUT /api/users  -> оновити користувача (тіло має містити id, name, age)
app.put('/api/users', async (req, res) => {
  try {
    const { id, name, age } = req.body;
    if (!id || !name || typeof age === 'undefined') return res.status(400).send('Bad request');
    const collection = req.app.locals.collection;
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { name, age: parseInt(age, 10) } },
      { returnDocument: 'after' } // повертає оновлений документ
    );
    if (!result.value) return res.status(404).send('User not found');
    res.json(result.value);
  } catch (err) {
    console.error(err);
    res.status(400).send('Invalid id');
  }
});

// DELETE /api/users/:id  -> видалити користувача
app.delete('/api/users/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const collection = req.app.locals.collection;
    const result = await collection.findOneAndDelete({ _id: new ObjectId(id) });
    if (!result.value) return res.status(404).send('User not found');
    res.json(result.value);
  } catch (err) {
    console.error(err);
    res.status(400).send('Invalid id');
  }
});

// graceful shutdown
process.on('SIGINT', async () => {
  console.log('Received SIGINT. Closing MongoDB client...');
  if (dbClient) await dbClient.close();
  process.exit();
});