/*
 * Author: Martha Garcia
 * Date:
 * Description: Script that contains all the events for Bubble Chart in "Timetrend"
 * References:
 *    https://roundsliderui.com/demos.html
 *    http://bl.ocks.org/arthurwelle/01506d8136f6898b2123cd897b8ba59e
 *    https://bl.ocks.org/Jverma/2385cb7794d18c51e3ab
 *    https://gist.github.com/biovisualize/373c6216b5634327099a
 **/

//Object for chart
var svg = null;

// Array of colors used to differentiate the provinces
var color = [];
color["CA-BC"] = "#003f5c";
color["CA-AB"] = "#00c0ef";
color["CA-MB"] = "#665191";
color["CA-SK"] = "#a05195";
color["CA-ON"] = "#d45087";
color["CA-QC"] = "#f95d6a";
color["CA-NB"] = "#ff7c43";
color["CA-NL"] = "#ffa600";
color["CA-NU"] = "#6faa01";
color["CA-NT"] = "#727272";
color["CA-YT"] = "#bfc0c2";
color["CA-NS"] = "#39a3cd";
color["CA-PE"] = "#363032";

//Initial page load
$(document).ready(function() {
  "use strict";

  //Select Areas
  $(".div-filter-area").click(function() {
    $(".div-filter-area").removeClass("box");
    $(this).addClass("box");
    //Load Charts
    loadCharts(false);
  });

  //Load Charts
  loadCharts(true);
});

//function to validate the filters and call to load the charts
function loadCharts(isLoad) {
  var aFilters = getFilters();

  //Titles
  $(".title-chart").html(aFilters.area);

  // append the svg object to the body of the page
  if (!isLoad) {
    $("#gap-chart-result").html("");
  }

  //Load Data JSON with D3 => Canada Data
  d3.json("data/timetrend_income_population_value.json", function(fullData) {
    //Filter Data
    var filterData = fullData
      .filter(
        d =>
          d.Type_of_specialized_service == aFilters.area &&
          d.GEO_key != "Canada" &&
          d.VALUE_numberofpersons != null
      )
      .sort(function(a, b) {
        return a.REF_DATE - b.REF_DATE;
      });
    console.log(filterData);
    //Load Bar Chart
    loadBubbleChart(filterData, aFilters, fullData);
  });
}

//Function to get Filters
function getFilters() {
  var aFilters = {};
  aFilters.area = $(".div-filter-area.box").data("value");
  return aFilters;
}

//Function to load Bubble Chart
function loadBubbleChart(filterData, aFilters, fullData) {
  // Various accessors that specify the four dimensions of data to visualize.
  function x(d) {
    return d.TOTAL_POPULATION; //Total population
  }
  function y(d) {
    return d.VALUE_numberofpersons; //number of persons
  }
  function radius(d) {
    return d.VALUE_medianweeks; // median weeks
  }

  function key(d) {
    return d.GEO_key; //Key Provincie
  }

  // Chart dimensions.
  var margin = { top: 10, right: 100, bottom: 30, left: 60 },
    width = $("#gap-chart-result").width() - margin.right,
    height = 450 - margin.top - margin.bottom;

  var xMax = d3.max(filterData, function(d) {
    return +d.TOTAL_POPULATION;
  });

  // Various scales. These domains make assumptions of data, naturally.
  var xScale = d3.scale
    .linear()
    .domain([0, xMax])
    .range([0, width]);

  var yMax = d3.max(filterData, function(d) {
    return +d.VALUE_numberofpersons;
  });

  // yMax = yMax + yMax / 20;

  var yScale = d3.scale
    .linear()
    .domain([0, yMax])
    .range([height, 0]);

  var radiusScale = d3.scale
    .sqrt()
    .domain([0, 104])
    .range([0, 52]);

  var colorScale = d3.scale.category10();

  // The x & y axes.
  var xAxis = d3.svg
    .axis()
    .orient("bottom")
    .scale(xScale);
  // .ticks(12, d3.format(",d"));
  yAxis = d3.svg
    .axis()
    .scale(yScale)
    .orient("left");

  // Create the SVG container and set the origin.
  var svg = d3
    .select("#gap-chart-result")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Add the x-axis.
  svg
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  // Add the y-axis.
  svg
    .append("g")
    .attr("class", "y axis")
    .call(yAxis);

  // Add an x-axis label.
  svg
    .append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height - 6)
    .text("Population");

  // Add a y-axis label.
  svg
    .append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", 6)
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .text("Number of persons affected");

  var nested_by_year = d3
    .nest() // nest function allows to group the calculation per year
    .key(function(d) {
      return d.REF_DATE;
    })
    .entries(filterData);

  var startYear = nested_by_year[0].key;
  var endYear = nested_by_year[nested_by_year.length - 1].key;

  // Add the year label; the value is set on transition.
  var label2 = svg
    .append("text")
    .attr("class", "year label2")
    .attr("text-anchor", "end")
    .attr("y", 380)
    .attr("x", width)
    .text(startYear);

  //Create object for insert slider
  var foreignObject = svg
    .append("foreignObject")
    .attr("class", "node")
    .attr("text-anchor", "end")
    .attr("x", width - 160)
    .attr("y", height - 180)
    .attr("width", 200)
    .attr("height", 120);

  //Insert slider div
  foreignObject.html("<div id='custom-slider'><div>");

  //Create Slider
  $("#custom-slider").roundSlider({
    // sliderType: "min-range",
    // radius: 90,
    // width: 16,
    sliderType: "min-range",
    radius: 100,
    showTooltip: false,
    width: 16,
    // value: 100,
    handleSize: 0,
    handleShape: "square",
    circleShape: "half-top",

    value: startYear,
    min: startYear,
    max: endYear,
    drag: function(e) {
      displayYear(e.value);
    }
  });
  // ----------------
  // Load the data.
  // ----------------
  // A bisector since many nation's data is sparsely-defined.
  var bisect = d3.bisector(function(d) {
    return d[0];
  });

  // Add a dot per nation. Initialize the data at 1800, and set the colors.
  var dot = svg
    .append("g")
    .attr("class", "dots")
    .selectAll(".dot")
    // .data(filterData)
    .data(interpolateData(startYear))
    .enter()
    .append("circle")
    .attr("class", "dot")
    .style("fill", function(d) {
      return color[d.GEO_key];
    })
    .call(position)
    .sort(order);

  // Add a title.
  dot.append("title").text(function(d) {
    return "Median weeks: " + d.VALUE_medianweeks;
  });

  svg
    .transition()
    .duration(10000)
    .ease("linear")
    .tween("year", tweenYear);

  //Call function legend
  legend(filterData);

  //Function to print labels of provincies with colors
  function legend(filterData) {
    var sumstat = d3
      .nest() // nest function allows to group the calculation per provincie
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
      // .attr("x", width - 95)
      .attr("x", 30)
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
      // .attr("x", width - 80)
      .attr("x", 45)
      .attr("y", function(d, i) {
        return i * 20 + 9;
      })
      .text(function(d) {
        return d.values[0].GEO;
      });
  }

  // Positions the dots based on data.
  function position(dot) {
    dot
      .attr("cx", function(d) {
        return xScale(x(d));
      })
      .attr("cy", function(d) {
        return yScale(y(d));
      })
      .attr("r", function(d) {
        return radiusScale(radius(d));
      });

    dot.select("title").text(function(d) {
      // console.log(d);
      return "Median weeks: " + d.VALUE_medianweeks;
    });
  }

  // Defines a sort order so that the smallest dots are drawn on top.
  function order(a, b) {
    return radius(b) - radius(a);
  }

  // Tweens the entire chart by first tweening the year, and then the data.
  // For the interpolated data, the dots and label are redrawn.
  function tweenYear() {
    var year = d3.interpolateNumber(startYear, endYear);

    return function(t) {
      displayYear(year(t));
    };
  }

  // Updates the display to show the specified year.
  function displayYear(year) {
    year = parseInt(year);
    dot
      .data(interpolateData(year), key)
      .call(position)
      .sort(order);

    label2.text(Math.round(year));
    $("#custom-slider").roundSlider("setValue", year);
  }

  // Interpolates the dataset for the given (fractional) year.
  function interpolateData(year) {
    var result = filterData
      .filter(d => d.REF_DATE == year)
      .sort(function(a, b) {
        return a.REF_DATE - b.REF_DATE;
      });

    return result;
  }
}
