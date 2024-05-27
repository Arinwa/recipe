require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;
const CONNECTION_URL = process.env.CONNECTION_URL;

mongoose.connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to the database'))
  .catch((error) => console.error('Error connecting to the database', error));

const recipeSchema = new mongoose.Schema({
  title: String,
  ingredients: [String],
  instructions: String,
  cookingTime: Number
});

const Recipe = mongoose.model('Recipe', recipeSchema);

// Sample data
const sampleRecipes = [
  { title: 'Spaghetti Carbonara', ingredients: ['Spaghetti', 'Eggs', 'Pancetta', 'Parmesan cheese', 'Black pepper'], instructions: 'Boil spaghetti. Fry pancetta. Mix with eggs and cheese. Combine.', cookingTime: 20 },
  { title: 'Chicken Curry', ingredients: ['Chicken', 'Onions', 'Tomatoes', 'Garlic', 'Ginger', 'Spices'], instructions: 'Cook chicken. Add onions, tomatoes, garlic, ginger, and spices. Simmer.', cookingTime: 40 }
];

// Adding sample recipes to the collection
sampleRecipes.forEach(async (recipe) => {
  const newRecipe = new Recipe(recipe);
  await newRecipe.save();
});

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
