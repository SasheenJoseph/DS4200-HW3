// Load the data
const iris = d3.csv("iris.csv");

// Once the data is loaded, proceed with plotting
iris.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.PetalLength = +d.PetalLength;
        d.PetalWidth = +d.PetalWidth;
    });

    // Define the dimensions and margins for the SVG
    const width = 600, height = 600;
    const margin = {top: 50, bottom: 50, left: 50, right: 50};

    // Create the SVG container
    const svg = d3.select("#scatterplot")
        .attr("width", width)
        .attr("height", height)
        .style('background', '#e9f7f2');
    
    // Set up scales for x and y axes
    const xScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.PetalLength) - 1 , d3.max(data, d => d.PetalLength) + 1])
        .range([margin.left, width - margin.right]);
    
    const yScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.PetalWidth) - 0.1, d3.max(data, d => d.PetalWidth) + 0.5])
        .range([height - margin.bottom, margin.top]);

    const colorScale = d3.scaleOrdinal()
        .domain(data.map(d => d.Species))
        .range(d3.schemeCategory10);

    // Add x-axis
    svg.append("g")
        .attr('transform', `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));
    
    // Add y-axis
    svg.append("g")
        .attr('transform', `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yScale));

    // Add circles for each data point
    svg.selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("cx", d => xScale(d.PetalLength))
        .attr("cy", d => yScale(d.PetalWidth))
        .attr("r", 5)
        .attr("fill", d => colorScale(d.Species));

    // Add x-axis label
    svg.append('text')
    .attr('x', width/2)
    .attr('y', height - 10)
    .text('Petal Length')
    .style('text-anchor', 'middle');
    
    // Add y-axis label
    svg.append('text')
    .attr('x', 0 - height/2)
    .attr('y', 20)
    .text('Petal Width')
    .style('text-anchor', 'middle')
    .attr('transform', 'rotate(-90)');

    // Set up legend layout
    const legend = svg.selectAll(".legend")
        .data(colorScale.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(${width - 115}, ${i * 20})`);

    // Add circles
    legend.append('circle')
    .attr("cx", 10)
    .attr("cy", 10)
    .attr("r", 5)
    .attr("fill", d => colorScale(d));

    // Add text
    legend.append("text")
    .attr('x', 20)
    .attr('y', 15)
    .text(d => d);

});

iris.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.PetalLength = +d.PetalLength;
        d.PetalWidth = +d.PetalWidth;
    });

    // Define the dimensions and margins for the SVG
    const width = 600, height = 600;
    const margin = {top: 50, bottom: 50, left: 50, right: 50};

    
    // Create the SVG container
    const svg = d3.select("#boxplot")
        .attr("width", width)
        .attr("height", height)
        .style('background', '#e9f7f2');

    // Set up scales for x and y axes
    const speciesNames = [...new Set(data.map(d => d.Species))];

    const xScale = d3.scaleBand()
        .domain(speciesNames)
        .range([margin.left, width - margin.right])
        .paddingInner(0.1);
     
    const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.PetalLength)])
    .range([height - margin.bottom, margin.top]);

    // Add scales     
    svg.append("g")
    .attr('transform', `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(xScale)); // x-axis
    
    svg.append("g")
    .attr('transform', `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(yScale)); // y-axis

    // Add x-axis label
    svg.append('text')
    .attr('x', width/2)
    .attr('y', height - 10)
    .text('Species')
    .style('text-anchor', 'middle');

    // Add y-axis label
    svg.append('text')
    .attr('x', 0 - height/2)
    .attr('y', 20)
    .text('Petal Length')
    .style('text-anchor', 'middle')
    .attr('transform', 'rotate(-90)');

    const rollupFunction = function(groupData) {
        const values = groupData.map(d => d.PetalLength).sort(d3.ascending);
        const q1 = d3.quantile(values, 0.25);
        const median = d3.quantile(values, 0.5);
        const q3 = d3.quantile(values, 0.75);
        return {q1, median, q3};
    };

    // Calculate the quartile values for each grouped species
    const quartilesBySpecies = d3.rollup(data, rollupFunction, d => d.Species);

    // For each species and it's quartile values, get the x-coordinate and calculate the box width 
    quartilesBySpecies.forEach((quartiles, Species) => {
        const x = xScale(Species);
        const boxWidth = xScale.bandwidth();
        const q1 = quartiles.q1;
        const median = quartiles.median;
        const q3 = quartiles.q3; 
        const IQR = q3 - q1;
        
        // Draw vertical lines
        svg.append("line")
        .attr("x1", x + boxWidth / 2) 
        .attr("x2", x + boxWidth / 2) 
        .attr("y1", yScale(q1 - 1.5 * IQR)) 
        .attr("y2", yScale(q3 + 1.5 * IQR)) 
        .attr("stroke", "black") 
        .attr("stroke-width", 2); 
        
        // Draw box
        svg.append("rect")
        .attr("x", x) 
        .attr("y", yScale(q3)) 
        .attr("width", boxWidth) 
        .attr("height", yScale(q1) - yScale(q3)) 
        .attr("fill", "#e9f7f2")
        .attr("stroke", "black")
        .attr("stroke-width", 2); 
        
        // Draw median line
        svg.append("line")
        .attr("x1", x) 
        .attr("x2", x + boxWidth) 
        .attr("y1", yScale(median)) 
        .attr("y2", yScale(median)) 
        .attr("stroke", "black") 
        .attr("stroke-width", 1);   
    });
});