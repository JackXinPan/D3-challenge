//Creating variables for dimensions of svg container

var svgWidth = 960
var svgHeight = 500

var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};
// create appropriate width and heights (relative to container size)
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(stateData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(stateData, d => d[chosenXAxis]) * 0.8,
        d3.max(stateData, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);
  
    return xLinearScale;
  
}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
  }

// function used for updating yAxis var upon click on axis label
function renderAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    xAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
  }

// function used for updating circles group when clicking axes
// with a transition to new circle locations
function renderCircles(circlesGroup, newXScale, chosenXAxis,newYScale, chosenYAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));

    return circlesGroup;
}



// function used for updating abbr group when clicking axes
// with a transition to new abbr locations
function renderAbbr(abbrGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
    abbrGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]))
        .attr("y", d => newYScale(d[chosenYAxis])+6);
    return abbrGroup;
}

// function used for updating circles group with new tooltip
//
function updateToolTip(chosenXAxis,chosenYaxis, circlesGroup) {

    var xlabel;
    var ylabel;
  
    if (chosenXAxis === "poverty") {
      xlabel = "% in Poverty:";
    }
    else if (chosenXAxis === "age") {
      xlabel = "Age (Median):";
    }
    else{
      xlabel = "Household Income (Median):";  
    }
  
    if (chosenYaxis === "healthcare") {
        ylabel = "% Lacking Healthcare:";
    }
    else if (chosenYAxis === "smokes"){
        ylabel = "% Smoke:";
    }
    else{
        ylabel = "% Obese:";
    }
    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.abbr}<br>${ylabel} ${d[chosenYAxis]}<br>${ylabel} ${d[chosenXAxis]}`);
      });
  
    circlesGroup.call(toolTip);
  
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data);
    })
      // onmouseout event
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });
  
    return circlesGroup;
}
  
//Load data from data.csv
d3.csv("./assets/data/data.csv").then((stateData, err) => {
    if (err) throw err;
    console.log(stateData)

    // parse data
    stateData.forEach((data) => {
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
        data.smokes = +data.smokes;
        data.age = +data.age;
        data.obesity = +data.obesity;
        data.income = +data.income;    
    })
    console.log(d3.map(stateData, d => d.obesity))
     // xLinearScale function above csv import
    var xLinearScale = xScale(stateData, chosenXAxis); 

      // Create y scale function
    var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(stateData, d => d.healthcare)])
    .range([height, 0]);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);
    // append y axis
        chartGroup.append("g")
        .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(stateData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 20)
        .attr("fill", "lightblue")
        .attr("opacity", ".8");

    // append state abbreviations at same locations as circles
    var abbrGroup = chartGroup.selectAll(".label")
        .data(stateData)
        .enter()
        .append("text")
        .attr("text-anchor", "middle")
        .text(function(d) {return d.abbr;})
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis])+6)
        .attr("fill", "white");

  
   // Create group for three x-axis labels
  var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true) // toggle for bold text
        .text("In Poverty (%)");

    var ageLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true) // toggle for bold text
        .text("Age (Median)");
    var incomeLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true) // toggle for bold text
        .text("Household Income (Median)");
   
    // append y axis
    // Create group for three y-axis labels
    var ylabelsGroup = chartGroup.append("g")
    .attr("transform", "rotate(-90)")
    var healthcareLabel = ylabelsGroup.append("text")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("value", "healthcare")
        .classed("axis-text", true)
        .classed("active", true)
        .text("Lacks Healthcare (%)");
    
    var smokesLabel = ylabelsGroup.append("text")
        .attr("y", 0 - margin.left - 20)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("value", "smokes")
        .classed("axis-text", true)
        .classed("inactive", true)
        .text("Smokes (%)");
    
    var obesityLabel = ylabelsGroup.append("text")
        .attr("y", 0 - margin.left - 40)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("value", "obesity")
        .classed("axis-text", true)
        .classed("inactive", true)
        .text("Obese(%)");
    
    
 
  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

  // x axis labels event listener
  xlabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(stateData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
            povertyLabel
                .classed("active", true)
                .classed("inactive", false);
            ageLabel
                .classed("active", false)
                .classed("inactive", true);
            incomeLabel
                .classed("active", false)
                .classed("inactive", true);
        }
        else if (chosenXAxis === "age") {
            ageLabel
                .classed("active", false)
                .classed("inactive", true);
            povertyLabel
                .classed("active", true)
                .classed("inactive", false);
            incomeLabel
                .classed("active", true)
                .classed("inactive", false);
        }
        else {
            incomeLabel
                .classed("active", false)
                .classed("inactive", true);
            povertyLabel
                .classed("active", true)
                .classed("inactive", false);
            ageLabel
                .classed("active", true)
                .classed("inactive", false);
        }
      }
    });
    
    // y axis labels event listener
  ylabelsGroup.selectAll("text")
  .on("click", function() {
    // get value of selection
    var value = d3.select(this).attr("value");
    if (value !== chosenYAxis) {

      // replaces chosenXAxis with value
      chosenYAxis = value;

      // console.log(chosenYAxis)

      // functions here found above csv import
      // updates x scale for new data
      yLinearScale = yScale(stateData, chosenXAxis);

      // updates x axis with transition
      yAxis = renderAxes(yLinearScale, yAxis);

      // updates circles with new x values
      circlesGroup = renderCircles(circlesGroup, yLinearScale, chosenYAxis);

      // updates tooltips with new info
      circlesGroup = updateToolTip(chosenYAxis, circlesGroup);

      // changes classes to change bold text
      if (chosenYAxis === "healthcare") {
          healthcareLabel
              .classed("active", true)
              .classed("inactive", false);
          smokesLabel
              .classed("active", false)
              .classed("inactive", true);
          obesityLabel
              .classed("active", false)
              .classed("inactive", true);
      }
      else if (chosenYAxis === "smokes") {
          smokesLabel
              .classed("active", false)
              .classed("inactive", true);
          healthcareLabel
              .classed("active", true)
              .classed("inactive", false);
          obesityLabel
              .classed("active", true)
              .classed("inactive", false);
      }
      else {
          obesityLabel
              .classed("active", false)
              .classed("inactive", true);
          healthcareLabel
              .classed("active", true)
              .classed("inactive", false);
          smokesLabel
              .classed("active", true)
              .classed("inactive", false);
      }
    }
  });

}).catch(function(error) {
    console.log(error);
}); 
