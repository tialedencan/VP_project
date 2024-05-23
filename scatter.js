
const filterByBrand = (selectedBrand) => (product) => product.Brand === selectedBrand;
const filterBySkinType = (selectedSkinType) => (product) => product[selectedSkinType] === 1;

let activeFilters = {
  brand: false,
  skinType: false
};

let selectedBrand = "all";
let selectedSkinType = "all";

const combineFilters = () => {
  const brandFilter = selectedBrand !== "all" ? filterByBrand(selectedBrand) : () => true;
  const skinTypeFilter = selectedSkinType !== "all" ? filterBySkinType(selectedSkinType) : () => true;

  return (product) => brandFilter(product) && skinTypeFilter(product);
};

fetch('cosmetics.json')
    .then(response => response.json())
    .then(data => {
       
    var margin = {top: 20, right: 30, bottom: 30, left: 50},
        width = 800 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    var svg = d3.select("#scatter").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const brands = calculateNumberOfProductsPerBrand(data);

    const filterBrandsWithMostProductsInDS = Object.entries(brands)
        .filter(([brandName, brandInfo]) => brandInfo.count > 27)
        .map(([brandName, brandInfo]) => brandName);

    // console.log(filterBrandsWithMostProductsInDS);

    d3.select("#selectBtnBrand")
      .append('option')
      .text("All")
      .attr("value", "all");

    d3.select("#selectBtnBrand")
      .selectAll('myOptions')
      .data(filterBrandsWithMostProductsInDS)
      .enter()
      .append('option')
      .text(function(d) { return d; })
      .attr("value", function(d) { return d; });

    const skinTypes = ['Combination', 'Dry', 'Normal', 'Oily', 'Sensitive'];

    d3.select("#selectBtnSkinType")
      .append('option')
      .text("All")
      .attr("value", "all");

    d3.select("#selectBtnSkinType")
      .selectAll('myOptions')
      .data(skinTypes)
      .enter()
      .append('option')
      .text(function(d) { return d; })
      .attr("value", function(d) { return d; });

    drawScatterPlot(data);

    d3.select("#selectBtnBrand").on("change", function() {
      selectedBrand = this.value;
      activeFilters.brand = selectedBrand !== "all";
      updateGraph();
    });

    d3.select("#selectBtnSkinType").on("change", function() {
      selectedSkinType = this.value;
      activeFilters.skinType = selectedSkinType !== "all";
      updateGraph();
    });

    function updateGraph() {
      const filteredData = data.filter(combineFilters());
      console.log(filteredData);
      updateScatterplot(filteredData);
    }


  function updateScatterplot(filteredData) {
      svg.selectAll("*").remove(); 
      drawScatterPlot(filteredData); // Create scatterplot with filtered data
  }

  function drawScatterPlot(preparedData) {

      const colorScale = d3.scaleOrdinal()
      .domain(preparedData.map(d => d.Label))
      .range(["#78C6F7", "#008000", "#8367C7", "#800080", "#D4B400", "#949494"]); 
    

    const x = d3.scaleLinear()
      .domain([0, d3.max(preparedData, d => d.Price)])
      .range([0, width]);
      svg.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x));

    const y = d3.scaleLinear()
      .domain([0, d3.max(preparedData, d => d.Rank)])
      .range([ height, 0]);
      svg.append("g")
          .call(d3.axisLeft(y));

    
    var circles = svg.selectAll("circle")
      .data(preparedData)
      .enter()
      .append("circle")
      .attr("cx", d => x(d.Price))
      .attr("cy", d => y(d.Rank))
      .attr("r", 3.1)
      .style("fill", d => colorScale(d.Label)); // Use the color based on the Label
        
    // Add X-axis label 

    svg.append("text")
        .attr("class", "axis-label")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom)
        .style("fill", "black")
        .style("font-family", "sans-serif")
        .style("font-size", "12px")
        .attr("text-anchor", "middle")
        .text("Price");
    
    // Add Y-axis label

    svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .style("font-size", "12px")
    .style("fill", "black")
    .style("font-family", "sans-serif")
    .text("Rank");

  }

})
  .catch(error => console.error('Error:', error));

