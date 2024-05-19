var margins = {top: 70, right: 40, bottom: 60, left: 175},
    width = 660 - margins.left - margins.right,
    height = 400 - margins.top - margins.bottom;

var svgIngredients = d3.select("#ingredients").append("svg")
    .attr("width", width + margins.left + margins.right)
    .attr("height", height + margins.top + margins.bottom)
    .append("g")
    .attr("transform","translate(" + margins.left + "," + margins.top + ")");


    fetch('cosmetics.json')
    .then(response => response.json())
    .then(data => {
       
        // Count ingredients by category
        let ingredientCounts = countIngredientsByCategory(data);
        console.log(ingredientCounts);

        // Find the top 5 ingredients for each category
        let topIngredientsPerCategory = top5Ingredients(ingredientCounts);
        console.log(topIngredientsPerCategory)
        // Print the top 5 ingredients for each category
        for (let category in topIngredientsPerCategory) {
            //console.log(`Top 5 Ingredients for ${category}:`);
            for (let [ingredient, count] of Object.entries(topIngredientsPerCategory[category])) {
                //console.log(`- ${ingredient} (${count})`);
            }
        }
       
        var topIngredientsPerCategoryArrays = {};

        for (var category in topIngredientsPerCategory) {
            topIngredientsPerCategoryArrays[category] = [];
            for (var ingredient in topIngredientsPerCategory[category]) {
                topIngredientsPerCategoryArrays[category].push({
                    ingredient: ingredient,
                    count: topIngredientsPerCategory[category][ingredient]
                });
            }
        }

        console.log(topIngredientsPerCategoryArrays);

        
        //sort the data by count (each category)

        for (var category in topIngredientsPerCategoryArrays) {
            topIngredientsPerCategoryArrays[category].sort(function (a,b) {
            return d3.ascending(a.count, b.count);
            })
        }
        

        //set x and y scales

        const x = d3.scaleLinear()
        .domain([0, d3.max(topIngredientsPerCategoryArrays.Cleanser, d => d.count)]) //domena vrijednosti je od 0 do najvece vrijednosti
        .range([0, width]); //širina px gdje ce biti vizualizacija

       const y = d3.scaleBand() //horizontal barchart
       //.domain([0, d3.max(topIngredientsPerCategory, d => d[0].ingredient)]) 
        .domain( topIngredientsPerCategoryArrays.Cleanser.map(function(d) {return d.ingredient;})) //Cleanser
        .padding(0.1)
        .range([ height, 0]);
        
        //create the x and y axes

        const xAxis = d3.axisBottom(x)
        .ticks(5)
        .tickSize(0); //remove ticks

        const yAxis = d3. axisLeft(y)
        .tickSize(0)
        .tickPadding(10);

        //Add vertical gridlines
        svgIngredients.selectAll("line.vertical-grid")
        .data(x.ticks(5))
        .enter()
        .append("line")
        .attr("class", "vertical-grid")
        .attr("x1", function(d) { return x(d);}) //x1,x2,y1,y2 = find beginning and end points of lines
        .attr("y1", 0)
        .attr("x2", function(d) { return x(d);})
        .attr("y2", height)
        .style("stroke", "gray")
        .style("stroke-width", 0.5)
        .style("stroke-dasharray", "3 3");


        //create the bars for the chart

        svgIngredients.selectAll(".bar")
        .data(topIngredientsPerCategoryArrays.Cleanser)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("y", function(d) { return y(d.ingredient);})
        .attr("height", y.bandwidth())
        .attr("x", 0)
        .attr("width", function(d) {return x(d.count);})
        .style("fill", '#78C6F7');

        //add the x and y axes to the chart

        svgIngredients.append("g")
        .attr("class", "x axis")
        .style("font-size", "10px")
        .attr ("transform","translate(0,"+height+")") //pomice x os od gore (udalji)
        .call(xAxis)
        .call(g => g.select(".domain").remove());

        svgIngredients.append("g")
        .attr("class", "y axis")
        .style("font-size", "8px")
        .call(yAxis)
        .selectAll('path')
        .style("stroke-width", '1.75px');

        svgIngredients.selectAll(".y.axis .tick text")
        .text(function(d) {
            return d.toUpperCase();
        });
      
        svgIngredients.selectAll(".label")
        .data(topIngredientsPerCategoryArrays.Cleanser)
        .enter().append("text")
        .attr("x", function(d) { return x(d.count) + 5;})
        .attr("y", function(d) { return y(d.ingredient) + y.bandwidth()/2;}) //podijeli s dva da se centrira
        .attr("dy", ".35em")
        .style("font-family", "sans-serif")
        .style("font-size", "10px")
        .style("font-weight", "bold")
        .style("fill", "#3c3d28")
        .text(function(d) { return d.count;});

        svgIngredients.append("text")
        .attr ("transform","translate("+ width/2 + "," + (height+margins.bottom / 2) +")") 
        .style("text-anchor", "middle")
        .style("font-size", "10px")
        .style("fill", "black")
        .style("font-family", "sans-serif")
        .attr("dy", "1em")
        .text("Total");

        svgIngredients.append("text")
        .attr ("x",margins.left - 335) 
        .attr ("y",margins.top - 110) 
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("font-family", "sans-serif")
        .text("Top 5 used ingredients in cleansers");

    })
    .catch(error => console.error('Error:', error));


// Function to count ingredients by category
function countIngredientsByCategory(products) {
    let ingredientCounts = {};
    
    for (let product of products) {
        // Get the category and ingredients
        let category = product.Label;
        let ingredients = product.Ingredients.split(", ");
        
        // Count occurrences of each ingredient in the current category
        for (let ingredient of ingredients) {
            if (!ingredientCounts[category]) {
                ingredientCounts[category] = {};
            }
            if (!ingredientCounts[category][ingredient]) {
                ingredientCounts[category][ingredient] = 0;
            }
            ingredientCounts[category][ingredient]++;
        }
    }
    
    return ingredientCounts;
}

//Function to find the top 5 ingredients for each category
function top5Ingredients(ingredientCounts) {
    let topIngredients = {};
    
    for (let category in ingredientCounts) {
        // Sort ingredients by count and select the top 5
        let sortedIngredients = Object.entries(ingredientCounts[category]).sort((a, b) => b[1] - a[1]).slice(0, 5);
        topIngredients[category] = Object.fromEntries(sortedIngredients);
    }
    
    return topIngredients;
}



