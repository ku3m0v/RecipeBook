// Load the JSON file
fetch('recipes.json')
    .then(response => response.json())
    .then(data => {
        console.log(data);


        const shuffledRecipes = shuffleArray(data.recipes);


        const selectedRecipes = shuffledRecipes.slice(0, 6);


        const recipeCardContainer = document.createElement('div');
        recipeCardContainer.classList.add('recipe-card-container');
        recipeCardContainer.addEventListener('click', (event) => {
            if (event.target.closest('.recipe-card')) {

                const recipeName = event.target.closest('.recipe-card').querySelector('h3').textContent;
                const recipe = data.recipes.find(recipe => recipe.name === recipeName);


                const recipeDetailContainer = document.querySelector('#recipe-detail-container');
                recipeDetailContainer.innerHTML = generateRecipeDetail(recipe);

                recipeDetailContainer.scrollIntoView({ behavior: 'smooth' });


                const downloadBtn = recipeDetailContainer.querySelector('.download-btn');
                downloadBtn.addEventListener('click', () => {
                    generatePDF(recipe);
                });
            }
        });
        selectedRecipes.forEach(recipe => {
            const recipeCardHTML = generateRecipeCard(recipe);
            recipeCardContainer.insertAdjacentHTML('beforeend', recipeCardHTML);
        });

        const selectBox = document.querySelector('#select-box');
        selectBox.addEventListener('change', () => {
            const selectedType = selectBox.value;
            let filteredRecipes;
            if (selectedType === 'all') {
                filteredRecipes = shuffleArray(data.recipes).slice(0, 6);
            } else {
                filteredRecipes = data.recipes.filter(recipe => recipe.type === selectedType);
            }
            recipeCardContainer.innerHTML = '';
            filteredRecipes.forEach(recipe => {
                const recipeCardHTML = generateRecipeCard(recipe);
                recipeCardContainer.insertAdjacentHTML('beforeend', recipeCardHTML);
            });

            recipeCardContainer.scrollIntoView({ behavior: 'smooth' });

        });

        const searchButton = document.querySelector('#search-button');
        searchButton.addEventListener('click', () => {
            const searchInput = document.querySelector('#search-input');
            const searchQuery = searchInput.value.toLowerCase().trim();
            const filteredRecipes = data.recipes.filter(recipe => recipe.name.toLowerCase().includes(searchQuery));
            recipeCardContainer.innerHTML = '';
            filteredRecipes.forEach(recipe => {
                const recipeCardHTML = generateRecipeCard(recipe);
                recipeCardContainer.insertAdjacentHTML('beforeend', recipeCardHTML);
            });

            recipeCardContainer.scrollIntoView({ behavior: 'smooth' });

        });



        document.body.appendChild(recipeCardContainer);


        let recipeDetailContainer = document.createElement('div');
        recipeDetailContainer.classList.add('recipe-detail-container');
        document.body.appendChild(recipeDetailContainer);

        function generateRecipeCard(recipe) {
            return `
                <div class="recipe-card ${recipe.name.toLowerCase()}">
                  <img src="${recipe.image}" alt="${recipe.name}">
                  <h3>${recipe.name}</h3>
                  <p>${recipe.description}</p>
                  <p id="type">${recipe.type}</p>
                </div>
            `;
        }


        function generateRecipeDetail(recipe) {
            const ingredientRows = recipe.ingredients.reduce((accumulator, ingredient, index) => {
                const rowIndex = Math.floor(index / 4);
                if (!accumulator[rowIndex]) {
                    accumulator[rowIndex] = [];
                }
                accumulator[rowIndex].push(`<td>${ingredient.name} - ${ingredient.count}</td>`);
                return accumulator;
            }, []);
            const ingredientTable = `
                <table>
                    ${ingredientRows.map(row => `<tr>${row.join('')}</tr>`).join('')}
                </table>
            `;
            return `
                <div class="recipe-detail ${recipe.name.toLowerCase()}">
                  <h3>${recipe.name}</h3>
                  <img src="${recipe.image}" alt="${recipe.name}">
                  <h4>Ingredients:</h4>
                  ${ingredientTable}
                  <h4>Steps:</h4>
                  <ol>
                    ${recipe.steps.map(step => `<li>${step}</li>`).join('')}
                  </ol>
                  <div class="buttons">
                    <button class="close-btn">Close</button>
                    <button class="download-btn">Download</button>
                  </div>
                </div>
            `;
        }



        recipeDetailContainer = document.querySelector('.recipe-detail-container');
        recipeDetailContainer.addEventListener('click', (event) => {
            if (event.target.classList.contains('close-btn')) {
                recipeDetailContainer.innerHTML = '';
            }
        });

        function generatePDF(recipe) {
            const doc = new jsPDF();

            doc.setFontSize(12);
            doc.setFont("helvetica", "bold", 'iso-8859-2');

            const recipeName = recipe.name;
            const recipeNameWidth = doc.getTextWidth(recipeName);
            const docWidth = doc.internal.pageSize.width;
            const recipeNameX = (docWidth - recipeNameWidth) / 2;

            doc.text(recipeName, recipeNameX, 20);

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal", 'iso-8859-2');


            fetch(recipe.image)
                .then((response) => response.blob())
                .then((imageBlob) => {

                    const reader = new FileReader();
                    reader.readAsDataURL(imageBlob);
                    reader.onload = () => {
                        const imageDataUrl = reader.result;


                        doc.addImage(imageDataUrl, "JPEG", 10, 40, 190, 100);


                        doc.text("Ingredients:", 10, 155);
                        let y = 165;
                        recipe.ingredients.forEach((ingredient) => {
                            doc.text(`${ingredient.name} - ${ingredient.count}`, 15, y);
                            y += 10;
                        });


                        const maxY = doc.internal.pageSize.height;
                        const contentHeight =
                            y + recipe.steps.length * 10 + doc.getLineHeight() * 2 + 10;
                        if (contentHeight > maxY) {
                            doc.addPage();
                            y = 20;
                        } else {
                            y += 10;
                        }

                        doc.text("Steps:", 10, y);
                        y += 10;
                        recipe.steps.forEach((step, index) => {
                            doc.text(`${index + 1}. ${step}`, 15, y);
                            y += 10;
                        });

                        doc.save(`${recipe.name}.pdf`);
                    };
                });
        }



        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }
    })
    .catch(error => {
        console.error('Failed to load recipes.json', error);
    });
