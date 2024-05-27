require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Recipe = require("./models/recipe");
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;
const CONNECTION_URL = process.env.CONNECTION_URL;

mongoose.connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to the database'))
  .catch((error) => console.error('Error connecting to the database', error));

// CRUD Operations
// Get all recipes
app.get('/api/recipes', async (req, res) => {
  const recipes = await Recipe.find();
  res.json(recipes);
});

// Get a specific recipe by title
app.get('/api/recipes/:title', async (req, res) => {
  const recipe = await Recipe.findOne({ title: req.params.title });
  if (recipe) {
    res.json(recipe);
  } else {
    res.status(404).json({ message: 'Recipe not found' });
  }
});

// Create a new recipe
app.post('/api/recipes', async (req, res) => {
  const existingRecipe = await Recipe.findOne({ title: req.body.title });
  if (existingRecipe) {
    res.status(409).json({ message: 'Recipe already exists' });
  } else {
    const newRecipe = new Recipe(req.body);
    await newRecipe.save();
    res.status(201).json(newRecipe);
  }
});

// Update a recipe by ID
app.put('/api/recipes/:id', async (req, res) => {
  const updatedRecipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (updatedRecipe) {
    res.json(updatedRecipe);
  } else {
    res.status(404).json({ message: 'Recipe not found' });
  }
});

// Delete a recipe by ID
app.delete('/api/recipes/:id', async (req, res) => {
  const deletedRecipe = await Recipe.findByIdAndDelete(req.params.id);
  if (deletedRecipe) {
    res.json({ message: 'Recipe deleted successfully' });
  } else {
    res.status(404).json({ message: 'Recipe not found' });
  }
});

// Serve the HTML file
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
