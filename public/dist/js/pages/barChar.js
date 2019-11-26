/*
 * Author: Martha Garcia
 * Date:
 * Description: Script that contains all the events for Bar Chart in "Waiting times per province"
 * References:
 *        https://bl.ocks.org/kalnar/5547c0279331b9b2b1bb00b9f880dd35
 *        https://bl.ocks.org/shimizu/a4c0c940b19d42cf8ebca29e20573aca
 *        https://bl.ocks.org/alandunning/274bf248fd0f362d64674920e85c1eb7
 **/

var width, height;
var chartWidth, chartHeight;
var margin;

var xScale = null;

var xInScale = null;

var yScale = null;

//Function to load Bar Chart
function loadBarChart(filterData, aFilters, fullData) {
  //Object chart and chart layer
  var svg = d3.select("#bar-chart-result").append("svg");
  var axisLayer = svg.append("g").classed("axisLayer", true);
  var chartLayer = svg.append("g").classed("chartLayer", true);

  xScale = d3.scaleBand();

  xInScale = d3.scaleBand();

  yScale = d3.scaleLinear();

  main(filterData, fullData);

  // Function main to set values and call functions to configure the Chart
  function main(filterData, fullData) {
    var nested = d3
      .nest() // nest function allows to group the calculation per level of a factor
      .key(function(d) {
        return d.REF_DATE;
      })
      .sortKeys(d3.ascending)
      .entries(filterData);

    // console.log(nested);

    nested.forEach(function(d) {
      d._rangeValue = Object.keys(d.values).map(function(key) {
        return {
          key: d.values[key].GEO_key,
          value: d.values[key].VALUE,
          year: d.values[key].REF_DATE,
          GEO: d.values[key].GEO
        };
      });
    });

    //Call functions
    setSize(nested, fullData);
    drawAxis();
    drawChart(nested);
    legend(filterData);
  }

  // Function to size the SVG for chart
  function setSize(nested, fullData) {
    (margin = { top: 0, right: 100, bottom: 40, left: 60 }),
      (width = $("#bar-chart-result").width()),
      (height = 450);

    chartWidth = width - (margin.left + margin.right);
    chartHeight = height - (margin.top + margin.bottom);

    svg.attr("width", width).attr("height", height);

    axisLayer.attr("width", width).attr("height", height);

    chartLayer
      .attr("width", chartWidth)
      .attr("height", chartHeight)
      .attr("transform", "translate(" + [margin.left, margin.top] + ")");

    xScale
      .domain(
        nested.map(function(d) {
          return d.key;
        })
      )
      .range([0, chartWidth])
      .paddingInner(0.1);

    var nested_full = d3
      .nest() // nest function allows to group the calculation per level of a factor
      .key(function(d) {
        return d.GEO_key;
      })
      .entries(fullData);

    //Array of provincies
    var provincies = nested_full.map(function(d) {
      return d.key;
    }); // list of group names

    xInScale.domain(provincies).range([0, xScale.bandwidth()]);

    var yMax = d3.max(fullData, function(d) {
      return +d.VALUE;
    });
    yScale.domain([0, yMax]).range([chartHeight, 0]);
  }

  //Create bar chart
  function drawChart(nested) {
    var tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "toolTip");

    //Effects
    var t = d3
      .transition()
      .duration(1000)
      .ease(d3.easeLinear);

    var year = chartLayer.selectAll(".year").data(nested);

    var newYear = year
      .enter()
      .append("g")
      .attr("class", "year");

    year.merge(newYear).attr("transform", function(d) {
      // console.log(d);
      return "translate(" + [xScale(d.key), 0] + ")";
    });

    var bar = newYear.selectAll(".bar").data(function(d) {
      // console.log(d);
      return d._rangeValue;
    });

    var newBar = bar
      .enter()
      .append("rect")
      .attr("class", "bar")
      // Print Values in tooltip
      .on("mousemove", function(d) {
        // Tooltip for print Provincie and value
        tooltip
          .style("left", d3.event.pageX - 50 + "px")
          .style("top", d3.event.pageY - 70 + "px")
          .style("display", "inline-block")
          .html(d.GEO + "<br>" + "  " + d.value);
      })
      .on("mouseout", function(d) {
        tooltip.style("display", "none");
      });

    bar
      .merge(newBar)
      .attr("width", xInScale.bandwidth())
      .attr("height", 0)
      .attr("fill", function(d) {
        // console.log(d);
        return color[d.key];
      })
      .attr("transform", function(d, i) {
        // console.log(d);
        return "translate(" + [xInScale(d.key), chartHeight] + ")";
      });

    bar
      .merge(newBar)
      .transition(t)
      .attr("height", function(d) {
        // console.log(d);

        return chartHeight - yScale(d.value);
      })
      .attr("transform", function(d, i) {
        // console.log(d);
        return "translate(" + [xInScale(d.key), yScale(d.value)] + ")";
      });
  }

  //Function to create X and Y
  function drawAxis() {
    var yAxis = d3.axisLeft(yScale).tickSizeInner(-chartWidth);

    axisLayer
      .append("g")
      .attr("transform", "translate(" + [margin.left, margin.top] + ")")
      .attr("class", "axis y")
      .call(yAxis);

    var xAxis = d3.axisBottom(xScale);

    axisLayer
      .append("g")
      .attr("class", "axis x")
      .attr("transform", "translate(" + [margin.left, chartHeight] + ")")
      .call(xAxis);
  }

  //Function to print labels of provincies with colors
  function legend(filterData) {
    var sumstat = d3
      .nest() // nest function allows to group
      .key(function(d) {
        return d.GEO_key;
      })
      .entries(filterData);

    var legend = svg
      .selectAll(".line")
      .data(sumstat)
      .enter()
      .append("g")
      .attr("class", "legend");

    legend
      .append("rect")
      .attr("x", width - 95)
      .attr("y", function(d, i) {
        return i * 20;
      })
      .attr("width", 10)
      .attr("height", 10)
      .style("fill", function(d) {
        // console.log(d);
        return color[d.key];
      });

    legend
      .append("text")
      .attr("x", width - 80)
      .attr("y", function(d, i) {
        return i * 20 + 9;
      })
      .text(function(d) {
        return d.values[0].GEO;
      });
  }
}
