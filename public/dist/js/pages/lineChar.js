/*
 * Author: Martha Garcia
 * Date:
 * Description: Script that contains all the events for Line Chart in "Waiting times per province"
 * References:
 *    https://bl.ocks.org/larsenmtl/e3b8b7c2ca4787f77d78f58d41c3da91
 *    https://www.d3-graph-gallery.com/graph/line_several_group.html
 **/

//Function to load Line Chart
function loadLineChart(filterData, aFilters, fullData) {
  // set the dimensions and margins of the graph
  var margin = { top: 10, right: 100, bottom: 30, left: 60 },
    width = $("#chart-result").width() - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom;

  //Object chart
  svg = d3
    .select("#chart-result")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // group the data: I want to draw one line per Provincie
  var sumstat = d3
    .nest() // nest function allows to group
    .key(function(d) {
      return d.GEO_key;
    })
    .entries(filterData);

  // Add X axis --> it is a date
  var x = d3
    .scaleLinear()
    .domain(
      d3.extent(filterData, function(d) {
        return Number(d.REF_DATE);
      })
    )
    .range([0, width]);

  //Group by Year
  var sumstat_year = d3
    .nest() // nest function allows to group
    .key(function(d) {
      return d.REF_DATE;
    })
    .entries(filterData);

  //Extract years as Array
  var years = sumstat_year.map(function(d) {
    return d.key;
  });

  //Print X Axis
  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(
      d3
        .axisBottom(x)
        .tickFormat(function(d) {
          console.log(d);
          return ~~d;
        })
        .tickValues(years) //Print only years with data
    );

  // Add Y axis
  var y = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(fullData, function(d) {
        return +d.VALUE;
      })
    ])
    .range([height, 0]);

  svg.append("g").call(d3.axisLeft(y));

  // //for color palette
  // var provincies = sumstat.map(function(d) {
  //   return d.key;
  // }); // list of group provincies

  // Draw the line
  path = svg
    .selectAll(".line")
    .data(sumstat)
    .enter()
    .append("path")
    .attr("fill", "none")
    .attr("stroke", function(d) {
      return color[d.key];
    })
    .attr("stroke-width", 1.5)
    .attr("d", function(d) {
      return (
        d3
          .line()
          // .curve(d3.curveMonotoneX)
          .x(function(d) {
            return x(d.REF_DATE);
          })
          .y(function(d) {
            return y(+d.VALUE);
          })(d.values)
      );
    });

  //-------
  // Legend for Provincies
  var legend = svg
    .selectAll(".line")
    .data(sumstat)
    .enter()
    .append("g")
    .attr("class", "legend");

  legend
    .append("rect")
    .attr("x", width + 5)
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
    .attr("x", width + 20)
    .attr("y", function(d, i) {
      return i * 20 + 9;
    })
    .text(function(d) {
      return d.values[0].GEO;
    });
  // ......

  // Print Category in Y Axis
  svg
    .append("g")
    .attr("class", "y axis")
    // .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text(aFilters.categoryText);

  // Print label Year in X Axis
  svg
    .append("g")
    .attr("class", "x axis")
    .append("text")
    .attr("x", width + 40)
    .attr("y", height)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Year");

  // ......
  // this is the black vertical line to follow mouse

  var mouseG = svg.append("g").attr("class", "mouse-over-effects");

  mouseG
    .append("path")
    .attr("class", "mouse-line")
    .style("stroke", "black")
    .style("stroke-width", "1px")
    .style("opacity", "0");

  var mousePerLine = mouseG
    .selectAll(".mouse-per-line")
    .data(sumstat)
    .enter()
    .append("g")
    .attr("class", "mouse-per-line");

  mousePerLine
    .append("circle")
    .attr("r", 7)
    .style("stroke", function(d) {
      return color[d.key];
    })
    .style("fill", "none")
    .style("stroke-width", "1px")
    .style("opacity", "0");

  mousePerLine.append("text").attr("transform", "translate(10,3)");
  //........

  mouseG
    .append("rect") // append a rect to catch mouse movements on canvas
    .attr("width", width) // can't catch mouse events on a g element
    .attr("height", height)
    .attr("fill", "none")
    .attr("pointer-events", "all")
    .on("mouseout", function() {
      // on mouse out hide line, circles and text
      d3.select(".mouse-line").style("opacity", "0");
      d3.selectAll(".mouse-per-line circle").style("opacity", "0");
      d3.selectAll(".mouse-per-line text").style("opacity", "0");
    })
    .on("mouseover", function() {
      // on mouse in show line, circles and text
      d3.select(".mouse-line").style("opacity", "1");
      d3.selectAll(".mouse-per-line circle").style("opacity", "1");
      d3.selectAll(".mouse-per-line text").style("opacity", "1");
    })
    .on("mousemove", function() {
      // mouse moving over canvas
      var mouse = d3.mouse(this);
      d3.select(".mouse-line").attr("d", function() {
        var d = "M" + mouse[0] + "," + height;
        d += " " + mouse[0] + "," + 0;
        return d;
      });

      d3.selectAll(".mouse-per-line").attr("transform", function(d, i) {
        var xDate = x.invert(mouse[0]),
          bisect = d3.bisector(function(d) {
            return d.REF_DATE;
          }).left;
        // console.log(d);
        idx = bisect(d.values, xDate);

        if (d.values[idx] != null) {
          d3.select(this).style("opacity", "1");
          d3.select(this).style("opacity", "1");

          d3.select(this)
            .select("text")
            .text(y.invert(y(d.values[idx].VALUE)).toFixed(2));

          return "translate(" + mouse[0] + "," + y(d.values[idx].VALUE) + ")";
        } else {
          d3.select(this).style("opacity", "0");
          d3.select(this).style("opacity", "0");

          // return "translate(" + mouse[0] + "," + d.values[idx].VALUE + ")";
        }
      });
    });

  //-------
  // });
}
