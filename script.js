const categories = [
    { name: 'Cleanser', color: '#78C6F7' }, // Light Blue
    { name: 'Eye cream', color: '#800080' }, // Purple
    { name: 'Face Mask', color: '#008000' }, // Green
    { name: 'Moisturizer', color: '#8367C7' }, // Light Purple
    { name: 'Sun protect', color: '#D4B400' }, // Gold
    { name: 'Treatment', color: '#949494' } // Gray
];


fetch('cosmetics.json')
    .then(response => response.json())
    .then(data => {
        //console.log(data);
        
        averagePrices = calculateAveragePrice(data);
        console.log(averagePrices);

        let sortedObj = sortByAveragePriceDes(averagePrices, 'average');
        console.log(sortedObj);
        
       
        renderChart(sortedObj);

    })
    .catch(error => console.error('Error:', error));


function calculateAveragePrice(products) {
    //hold the sum and count for each product type
    const averages = {};
    
    products.forEach(product => {
        // Check if the product type exists in the averages object
        if (!averages[product.Label]) {
            // Initialize the sum and count for this product type
            averages[product.Label] = { sum: 0, count: 0 };
        }
    
        // Add the price to the sum and increment the count
        averages[product.Label].sum += product.Price;
        averages[product.Label].count++;
    });
    
    // Calculate the average price for each product type
    Object.keys(averages).forEach(type => {
        averages[type].average = averages[type].sum / averages[type].count;
    });
    
    return averages;
}
function calculateNumberOfProductsPerBrand(products) {
    
    const brands = {numOfBrands: 0};
    
    products.forEach(product => {
        // Check if the product brand exists in the brands object
        if (!brands[product.Brand]) {
            // Initialize the count for this brand
            brands[product.Brand] = { count: 0 };
            brands.numOfBrands += 1;
        }
    
        brands[product.Brand].count++;
    });
    
    return brands;
}

function sortByAveragePrice(obj, prop) {
    let sortedKeys = Object.keys(obj).sort((keyA, keyB) => {
        let valA = obj[keyA][prop];
        let valB = obj[keyB][prop];

        if (valA < valB) {
            return -1;
        } else if (valA > valB) {
            return 1;
        } else {
            return 0;
        }
    });

    let sortedObj = {};
    sortedKeys.forEach(key => {
        sortedObj[key] = obj[key];
    });

    return sortedObj;
}
//sort in descending order
function sortByAveragePriceDes(obj, prop) {
    let sortedKeys = Object.keys(obj).sort((keyA, keyB) => {
        let valA = obj[keyA][prop];
        let valB = obj[keyB][prop];

        // Reversed comparison logic for descending order
        if (valA < valB) {
            return 1;
        } else if (valA > valB) {
            return -1;
        } else {
            return 0;
        }
    });

    let sortedObj = {};
    sortedKeys.forEach(key => {
        sortedObj[key] = obj[key];
    });

    return sortedObj;
}

function renderChart(averagePrice) {
     
     const margin = {top: 40, right: 20, bottom: 40, left: 60},
     width = 600 - margin.left - margin.right,
     height = 500 - margin.top - margin.bottom;

     const dataArray = Object.entries(averagePrice).map(([key, value]) => ({ category: key,...value }));
     const colorScale = d3.scaleOrdinal()
        .domain(dataArray.map(item => item.category))
        .range(["#949494","#8367C7","#800080",   "#D4B400",   "#008000","#78C6F7"]); 
        

     const svg = d3.select("#chart")
     .append("svg")
     .attr("width", width + margin.left + margin.right)
     .attr("height", height + margin.top + margin.bottom)
     .append("g")
     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

     // Set up scales
     const xScale = d3.scaleBand()
     .domain(Object.keys(averagePrice))
     .range([0, width])
     .padding(0.1);

     const yScale = d3.scaleLinear()
     .domain([0, d3.max(Object.values(averagePrice), d => d.average)])
     .range([height, 0]);


     var tooltip = d3.select("body").append("div")
     .attr("class", "tooltip")
     .style("opacity", 0)
     .style("position", "absolute")
     .style("background-color", "#333")
     .style("color", "white")
     .style("padding", "5px")
     .style("border-radius", "3px")
     .style("z-index", "1000");
    
     // Append the bars
     svg.selectAll(".bar")
     .data(Object.entries(averagePrice))
     .enter().append("rect")
     .attr("class", "bar")
     .attr("x", d => xScale(d[0]))
     .attr("y", d => yScale(d[1].average))
     .attr("width", xScale.bandwidth())
     .attr("height", d => height - yScale(d[1].average))
     .style('fill', d => colorScale(d[0]))
     
    // Bind mouseover, mousemove, and mouseout events to the bars
    
     .on("mouseover", function(d) {
        const productCategory = d[0];
        const productInfo = d[1];
        tooltip.transition().duration(50).style("opacity", 1);
        tooltip.html(`<strong>${productCategory}: $${Math.round(productInfo.average)}</strong>`)
        .style("left", (d3.event.pageX + 10) + "px")
        .style("top", (d3.event.pageY - 15) + "px");
      })
     .on("mousemove", function(d) {
        tooltip.style("left", (d3.event.pageX + 10) + "px").style("top", (d3.event.pageY - 15) + "px");
      })
     .on("mouseout", function() {
        tooltip.transition().duration(50).style("opacity", 0);
      });

     // Add x-axis
     svg.append("g")
     .attr("class", "x axis")
     .attr("transform", "translate(0," + height + ")")
     .call(d3.axisBottom(xScale).tickSizeOuter(0).tickSize(0));

     // Add y-axis
     svg.append("g")
     .attr("class", "y axis")
     .call(d3.axisLeft(yScale).ticks(10).tickSizeInner(0).tickSizeOuter(0).tickPadding(15).tickFormat(d3.format(".2s")));

     // Add title
     svg.append("text")
     .attr("text-anchor", "middle")
     .attr("x", width / 2)
     .attr("y", -margin.top / 2)
     .style("font-family", "Libre Baskerville,serif")
     .style("font-weight", "bold")
     .style("font-size", "14px")
     .text("Average price per product category");

     // Add y-axis title
     svg.append("text")
     .attr("transform", "rotate(-90)")
     .attr("y", -15 - margin.left / 2)
     .attr("x", 0 - height / 2)
     .attr("dy", "0.35em")
     .style("font-size", "12px")
     .style("font-family", "Libre Baskerville,serif")
     .style("text-anchor", "end")
     .text("Price ($)");

     svg.selectAll(".x.axis .tick text")
    .text(function(d) {
        return d.toUpperCase();
    })
    .style("font-size", "10px")
   .attr('dy', '15px'); // Move labels down by 15 pixels


}
      
  