
fetch('cosmetics.json')
    .then(response => response.json())
    .then(data => {
       
    var margin = {top: 20, right: 30, bottom: 30, left: 50},
        width = 800 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#scatter").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      // .style("background-color", "#F2F7FF")//#F5F5DC
        .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

        const preparedData = data.map(item => ({
            name: item.Name,
            label: item.Label,
            price: item.Price,
            rank: item.Rank,
          }));
          console.log(preparedData);
        const colorScale = d3.scaleOrdinal()
        .domain(preparedData.map(d => d.label))
        .range(["#78C6F7", "#008000", "#8367C7", "#800080", "#D4B400", "#949494"]); //B0B0B0 FFD700 Example colors, adjust as needed
       //["#FFD700", "#FFF8C6", "#F4A460", "#BA55D3", "#E2725B", "#483C32"] ChatGPT
       //["#8367C7","#78C6F7","#6B9AC4","#6a994e" , "#5603AD","#F4B942" ]
        //["#69b3a2", "#e69a6e", "#56b4e9", "#ff7f00", "#9370db", "#daa520"]"#97D8C4" 

     
       const x = d3.scaleLinear()
        .domain([0, d3.max(preparedData, d => d.price)])
        .range([0, width]);
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

       const y = d3.scaleLinear()
        .domain([0, d3.max(preparedData, d => d.rank)])
        .range([ height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y));
      
       
       svg.selectAll("circle")
        .data(preparedData)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.price))
        .attr("cy", d => y(d.rank))
        .attr("r", 3.1)
        .style("fill", d => colorScale(d.label)); // Use the color based on the Label
       

    })
    .catch(error => console.error('Error:', error));