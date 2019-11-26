/*
 * Author: Martha Garcia
 * Date:
 * Description: Script that contains all the events in the index, filters and calls to the methods to print the graphs
 *  References:
 *    https://api.jquery.com/
 **/

var aRegionsSelected = [];
var svg = null;
var path = null;

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

  // Make the dashboard widgets sortable Using jquery UI
  $(".connectedSortable").sortable({
    containment: $("section.content"),
    placeholder: "sort-highlight",
    connectWith: ".connectedSortable",
    handle: ".box-header, .nav-tabs",
    forcePlaceholderSize: true,
    zIndex: 999999
  });
  $(".connectedSortable .box-header, .connectedSortable .nav-tabs-custom").css(
    "cursor",
    "move"
  );

  // jQuery UI sortable for the todo list
  $(".todo-list").sortable({
    placeholder: "sort-highlight",
    handle: ".handle",
    forcePlaceholderSize: true,
    zIndex: 999999
  });

  // World map by jvectormap
  $("#world-map").vectorMap({
    map: "ca_lcc",
    normalizeFunction: "linear",
    selectedColor: "#f46b49",
    showTooltip: true,
    // Event Click in Map
    onRegionClick: function(event, code) {
      if (aRegionsSelected.includes(code)) {
        removeRegion(aRegionsSelected, code);
      } else {
        aRegionsSelected.push(code);
      }

      //Select Region
      selectRegion(code);
      //Load Charts
      loadCharts(false);
    }
  });

  //Load Years in drop-down-list
  for (var i = 2013; i >= 2001; i--) {
    $("#ddl-year-start").append(
      $("<option />")
        .val(i)
        .html(i)
    );
    $("#ddl-year-end").append(
      $("<option />")
        .val(i)
        .html(i)
    );
  }

  //Select item in drop downs list
  $("#ddl-year-start option:last-child").attr("selected", "selected");
  $("#ddl-year-end option:first-child").attr("selected", "selected");

  //Load Data JSON with Jquery => Categories
  $.getJSON("data/categories.json", function(json) {
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

  //Select Areas
  $(".div-filter-area").click(function() {
    $(".div-filter-area").removeClass("box");
    $(this).addClass("box");
    loadCharts(false);
  });

  //Event Change in Drop DownList
  $("#ddl-categories").change(function() {
    //Load Charts
    loadCharts(false);
  });
  //Event Change in Drop DownList
  $("#ddl-year-start").change(function() {
    //Load Charts
    loadCharts(false);
  });
  //Event Change in Drop DownList
  $("#ddl-year-end").change(function() {
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

  // Clear space to load chart
  if (!isLoad) {
    $("#chart-result").html("");
    $("#bar-chart-result").html("");
  }

  //Validation Year Range
  if (aFilters.yearStartValue > aFilters.yearEndValue) {
    alert("Star Year should be less than End Year");
    return;
  }

  // Validate provincies
  if (aRegionsSelected.length === 0) {
    filterData = null;
    return;
  }

  //Load Data JSON with D3 => Canada Data
  d3.json("data/data_canada.json", function(data) {
    var filterData = {};
    //Filter data
    data = data
      .filter(
        d =>
          d.Type_of_specialized_service == aFilters.area &&
          d.GEO_key != "Canada" &&
          d.characteristic_key == aFilters.categoryValue &&
          d.REF_DATE >= aFilters.yearStartValue &&
          d.REF_DATE <= aFilters.yearEndValue &&
          d.VALUE != null
      )
      .sort(function(a, b) {
        return a.REF_DATE - b.REF_DATE;
      });

    // filter by province
    var count = 0;
    aRegionsSelected.forEach(function(regionSelected) {
      // console.log(regionSelected);
      var regionData = data.filter(d => d.GEO_key == regionSelected);
      if (count == 0) {
        filterData = regionData;
        count++;
      } else {
        filterData = regionData.concat(filterData);
      }
    });

    //Load Graphs
    loadLineChart(filterData, aFilters, data);

    loadBarChart(filterData, aFilters, data);
  });
}

//Function to get Filters
function getFilters() {
  var aFilters = {};

  aFilters.categoryValue = $("#ddl-categories option:selected").val();
  aFilters.categoryText = $("#ddl-categories option:selected").text();
  aFilters.yearStartValue = $("#ddl-year-start option:selected").val();
  aFilters.yearStartText = $("#ddl-year-start option:selected").text();
  aFilters.yearEndValue = $("#ddl-year-end option:selected").val();
  aFilters.yearEndText = $("#ddl-year-end option:selected").text();
  aFilters.area = $(".div-filter-area.box").data("value");
  aFilters.provincies = aRegionsSelected;

  return aFilters;
}

//Function to select region in Maps
function selectRegion(region) {
  var _map = $("#world-map").vectorMap("get", "mapObject");
  _map.clearSelectedRegions();

  aRegionsSelected.forEach(function(regionSelected) {
    _map.setSelectedRegions(regionSelected);
  });
}

//Remove region from the map
function removeRegion(arr, item) {
  for (var i = arr.length; i--; ) {
    if (arr[i] === item) {
      arr.splice(i, 1);
    }
  }
}
