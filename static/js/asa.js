function Diagram() {

  var padding = {top: 50, right: 50, bottom: 50, left: 50};
  var margin = {top: 25, right: 25, bottom: 25, left: 25};

  // padding region

  var svgWidth;
  var svgHeight;

  // margin region

  var marginWidth;
  var marginHeight;

  // primary content area

  var width;
  var height;

  // standard elements

  var x;
  var y;
  var xAxis;
  var yAxis;
  var svg;
  var marginArea;
  var dataArea;
  var defs;

  console.log("padding", padding);
  console.log("margin", margin);

  // when document ready, initialize the chart

  // perform all chart initialization

  function initialize() {

    // construct svg, defs, and outer and inner work areas

    svg = d3.select("#chart").append("svg");
    defs = svg.append("defs");
    marginArea = svg.append("g").classed("marginArea", true);
    dataArea = svg.append("g").classed("dataArea", true);

    // append place for svg definitions


    // create scales and axes

    x = d3.scale.identity();
    y = d3.scale.identity();
    xAxis = d3.svg.axis();
    yAxis = d3.svg.axis().orient("right");

    // size the chart

    size();

    // construct static portions of the chart

    construct();

    // update the dynamic, data driven, portions of the chart

    // update();
  }

  function debug() {
    var context = this;
    [
      "padding",
      "margin", 
      "svgWidth",
      "svgHeight", 
      "marginWidth", 
      "marginHeight", 
      "width", 
      "height"
    ].forEach(function(itemName) {
      console.log(itemName, context[itemName]);
    });
  };

  // establish all chart size related elements

  function size() {

    var context = this;

    // establish metrics

    svgWidth = $("#chart").width();
    svgHeight =  $("#chart").height();
    marginWidth = svgWidth - padding.left - padding.right;
    marginHeight = svgHeight - padding.top - padding.bottom;
    width = marginWidth  - margin.left - margin.right;
    height = marginHeight - margin.top - margin.bottom;

    debug();

    // update elements

    x.domain([0, width]);
    y.domain([0, height]);
    svg.attr("width", svgWidth).attr("height", svgHeight);
    marginArea.attr("transform", "translate(" + padding.left + "," + padding.top + ")");
    dataArea.attr("transform", "translate(" + (padding.left + margin.left) + "," + (padding.top + margin.top) + ")");
  }

  // construt ontime chart specific elements

  function construct() {

    marginArea.append("rect")
      .attr("width", marginWidth)
      .attr("height", marginHeight);

    // construct diagram specific elemenents

    defs.append("marker")
      .attr("id", "triangle-start")
      .attr("viewBox", "0 0 10 10")
      .attr("refX", 10)
      .attr("refY", 5)
      .attr("markerWidth", -6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M 0 0 L 10 5 L 0 10 z");
    
    defs.append("marker")
      .attr("id", "triangle-end")
      .attr("viewBox", "0 0 10 10")
      .attr("refX", 10)
      .attr("refY", 5)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M 0 0 L 10 5 L 0 10 z");
    
    dataArea.append("rect")
      .attr("width", width)
      .attr("height", height);
    
    dataArea.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);
    
    dataArea.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + width + ",0)")
      .call(yAxis);
    
    marginArea.append("line")
      .attr("class", "arrow")
      .attr("x2", margin.left)
      .attr("y2", margin.top)
      .attr("marker-end", "url(#triangle-end)");
    
    marginArea.append("line")
      .attr("class", "arrow")
      .attr("x1", marginWidth / 2)
      .attr("x2", marginWidth / 2)
      .attr("y2", margin.top)
      .attr("marker-end", "url(#triangle-end)");
    
    marginArea.append("line")
      .attr("class", "arrow")
      .attr("x1", marginWidth / 2)
      .attr("x2", marginWidth / 2)
      .attr("y1", marginHeight - margin.bottom)
      .attr("y2", marginHeight)
      .attr("marker-start", "url(#triangle-start)");
    
    marginArea.append("line")
      .attr("class", "arrow")
      .attr("x2", margin.left)
      .attr("y1", marginHeight / 2)
      .attr("y2", marginHeight / 2)
      .attr("marker-end", "url(#triangle-end)");
    
    marginArea.append("line")
      .attr("class", "arrow")
      .attr("x1", marginWidth)
      .attr("x2", marginWidth - margin.right)
      .attr("y1", marginHeight / 2)
      .attr("y2", marginHeight / 2)
      .attr("marker-end", "url(#triangle-end)");
    
    svg.append("text")
      .text("padding area")
      .attr("x", "2em")
      .attr("y", "2em");

    marginArea.append("text")
      .text("margin area")
      .attr("x", "2em")
      .attr("y", "2em");
    
    dataArea.append("text")
      .text("data area")
      .attr("x", "2em")
      .attr("y", "2em");
    
    // marginArea.append("circle")
    //   .attr("class", "origin")
    //   .attr("r", 4.5);
    
    // dataArea.append("text")
    //   .text("translate(padding.left, padding.top)")
    //   .attr("y", -8);
  };

  initialize();
}

$(document).ready(function() {
  console.log("pre-ready");
  var d = new Diagram();
  console.log("post-ready");
});

