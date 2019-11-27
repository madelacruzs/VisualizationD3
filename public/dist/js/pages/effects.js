/*
 * Author: Martha Garcia
 * Date:
 * Description: Script that contains all the events for polarArea Chart in "Effects"
 * References:
 *    https://www.chartjs.org/docs/latest/charts/doughnut.html
 *    https://tobiasahlin.com/blog/chartjs-charts-to-get-you-started/#5-polar-area-chart
 **/

var svg = null;

//Initial page load
$(document).ready(function() {
  "use strict";

  //Select Areas
  $(".div-filter-area").click(function() {
    $(".div-filter-area").removeClass("box");
    $(this).addClass("box");
    loadCharts(false);
  });

  //Load Data JSON with Jquery => Categories
  $.getJSON("data/categories_effects.json", function(json) {
    jQuery.each(json, function(i, item) {
      $("#ddl-categories").append(
        $("<option />")
          .val(item.value)
          .html(item.text)
      );
    });
    //Select item in drop down list
    $("#ddl-categories option:first-child").attr("selected", "selected");
    //Load Charts
    loadCharts(true);
  });

  $("#ddl-categories").change(function() {
    //Load Charts
    loadCharts(false);
  });
});

//function to validate the filters and call to load the charts
function loadCharts(isLoad) {
  //Get Filters (All filters in the page)
  var aFilters = getFilters();

  //Titles
  $(".title-chart").html(aFilters.area);

  $("#div-pie-chart-result").html(
    " <canvas id='pie-chart-result' width='800' height='400'></canvas>"
  );

  //Load Data with Jquery
  $.getJSON("data/effects_2011_v2.json", function(fullData) {
    //Filter Data
    var filterData = fullData
      .filter(
        d =>
          d.Type_of_specialized_service == aFilters.area &&
          d.characteristic_key == aFilters.categoryValue &&
          d.VALUE != null &&
          d.VALUE != ""
      )
      .sort(function(a, b) {
        return a.REF_DATE - b.REF_DATE;
      });

    //Load Chart
    loadPieChart(filterData, aFilters, fullData);
  });
}

//Function to get Filters
function getFilters() {
  var aFilters = {};
  aFilters.area = $(".div-filter-area.box").data("value");
  aFilters.categoryValue = $("#ddl-categories option:selected").val();
  aFilters.categoryText = $("#ddl-categories option:selected").text();
  return aFilters;
}

//Function to capitalize string
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

//Function to load Chart
function loadPieChart(filterData, aFilters, fullData) {
  var aLabels = [];
  var aValues = [];
  filterData.forEach(function(item) {
    aLabels.push(capitalize(item.effect_desc));
    aValues.push(item.VALUE);
  });

  //Create Chart
  new Chart(document.getElementById("pie-chart-result"), {
    type: "polarArea",
    data: {
      showTooltips: false,
      responsive: true,
      labels: aLabels,
      datasets: [
        {
          //   label: aLabels,
          backgroundColor: [
            "#5899DA",
            "#E8743B",
            "#19A979",
            "#ED4A7B",
            "#945ECF",
            "#13A4B4",
            "#525DF4",
            "#BF399E",
            "#6C8893",
            "#EE6868",
            "#2F6497"
          ],
          data: aValues
        }
      ]
    },
    options: {
      title: {
        display: true,
        text: "Effect on people in 2001"
      }
    }
  });
}
