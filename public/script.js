document.addEventListener('DOMContentLoaded', function () {
  const addRecipeForm = document.getElementById('addRecipeForm');
  const editRecipeForm = document.getElementById('editRecipeForm');
  const editRecipeSection = document.getElementById('editRecipeSection');
  const searchForm = document.getElementById('searchForm');
  const backButton = document.getElementById('backButton');

  async function fetchRecipes() {
    const response = await fetch('/api/recipes');
    const data = await response.json();
    const tableBody = document.querySelector('#recipesTable tbody');
    tableBody.innerHTML = '';
    data.forEach(recipe => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${recipe.title}</td>
        <td>${recipe.ingredients.join(', ')}</td>
        <td>${recipe.instructions}</td>
        <td>${recipe.cookingTime}</td>
        <td>
          <button class="update" onclick="editRecipe('${recipe._id}', '${recipe.title}', '${recipe.ingredients.join(', ')}', '${recipe.instructions}', ${recipe.cookingTime})">Update</button>
          <button class="delete" onclick="deleteRecipe('${recipe._id}')">Delete</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
    backButton.style.display = 'none';
  }

  async function addRecipe(event) {
    event.preventDefault();
    const title = document.getElementById('title').value;
    const ingredients = document.getElementById('ingredients').value.split(',').map(item => item.trim());
    const instructions = document.getElementById('instructions').value;
    const cookingTime = document.getElementById('cookingTime').value;

    const response = await fetch('/api/recipes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title, ingredients, instructions, cookingTime })
    });

    if (response.status === 201) {
      fetchRecipes();
      addRecipeForm.reset();
    } else {
      const errorData = await response.json();
      alert(`Error: ${errorData.message}`);
    }
  }

  async function deleteRecipe(id) {
    if (confirm('Are you sure you want to delete this recipe?')) {
      const response = await fetch(`/api/recipes/${id}`, {
        method: 'DELETE'
      });

      if (response.status === 200) {
        fetchRecipes();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    }
  }

  function editRecipe(id, title, ingredients, instructions, cookingTime) {
    document.getElementById('editTitle').value = title;
    document.getElementById('editIngredients').value = ingredients;
    document.getElementById('editInstructions').value = instructions;
    document.getElementById('editCookingTime').value = cookingTime;

    editRecipeForm.onsubmit = async function (event) {
      event.preventDefault();
      const updatedTitle = document.getElementById('editTitle').value;
      const updatedIngredients = document.getElementById('editIngredients').value.split(',').map(item => item.trim());
      const updatedInstructions = document.getElementById('editInstructions').value;
      const updatedCookingTime = document.getElementById('editCookingTime').value;

      const response = await fetch(`/api/recipes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: updatedTitle, ingredients: updatedIngredients, instructions: updatedInstructions, cookingTime: updatedCookingTime })
      });

      if (response.status === 200) {
        fetchRecipes();
        editRecipeForm.reset();
        editRecipeSection.style.display = 'none';
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    };

    editRecipeSection.style.display = 'block';
    document.getElementById('editTitle').focus();
  }

  async function searchRecipe(event) {
    event.preventDefault();
    const title = document.getElementById('searchTitle').value;
    const response = await fetch(`/api/recipes/${title}`);

    if (response.status === 200) {
      const recipe = await response.json();
      const tableBody = document.querySelector('#recipesTable tbody');
      tableBody.innerHTML = `
        <tr>
          <td>${recipe.title}</td>
          <td>${recipe.ingredients.join(', ')}</td>
          <td>${recipe.instructions}</td>
          <td>${recipe.cookingTime}</td>
          <td>
            <button class="update" onclick="editRecipe('${recipe._id}', '${recipe.title}', '${recipe.ingredients.join(', ')}', '${recipe.instructions}', ${recipe.cookingTime})">Update</button>
            <button class="delete" onclick="deleteRecipe('${recipe._id}')">Delete</button>
          </td>
        </tr>
      `;
      backButton.style.display = 'block';
    } else {
      alert('Recipe not found');
    }
  }

  backButton.addEventListener('click', fetchRecipes);
  window.editRecipe = editRecipe;
  window.deleteRecipe = deleteRecipe;

  addRecipeForm.addEventListener('submit', addRecipe);
  searchForm.addEventListener('submit', searchRecipe);
  fetchRecipes();
});
