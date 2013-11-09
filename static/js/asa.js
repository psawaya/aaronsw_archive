function Diagram() {

  // constants

  var MSECS_INA_MIN = 60 * 1000;
  var MSECS_INA_HOUR = 60 * MSECS_INA_MIN;
  var MSECS_INA_DAY = 24 * MSECS_INA_HOUR;
  var MAX_RADIUS = 20;

  // padding and margin vaues

  var padding = {top: 10, right: 10, bottom: 10, left: 10};
  var margin = {top: 25, right: 25, bottom: 25, left: 25};

  // svg region

  var svgWidth;
  var svgHeight;

  // margin region

  var marginWidth;
  var marginHeight;

  // primary content area

  var width;
  var height;

  // standard diagram elements

  var x;
  var y;
  var xAxis;
  var yAxis;
  var svg;
  var marginArea;
  var dataArea;
  var defs;

  // the article index

  var articleIndex = [];

  // when document ready, initialize the chart

  $(document).ready(function() {
    initialize();
  });

  // perform all chart initialization

  function initialize() {

    // construct svg, defs, and outer and inner work areas

    svg = d3.select("#chart").append("svg");
    defs = svg.append("defs");
    marginArea = svg.append("g").classed("marginArea", true);
    dataArea = svg.append("g").classed("dataArea", true);

    // create scales and axes

    x = d3.time.scale()
    y = d3.scale.linear();
    xAxis = d3.svg.axis();
    yAxis = d3.svg.axis().orient("right");

    // size the chart

    size();

    // load the data

    load();
  }

  function load() {

    // generate random data

    var end = new Date();
    var start = new Date(end.getTime() - 365 * MSECS_INA_DAY);
    var dateGen = d3.time.scale().domain([start, end]);

    for (var i = 0; i < 5; ++i) {
      articleIndex.push({date: dateGen.invert(Math.random()), y: Math.random()});
    }

    // construct static portions of the chart

    construct();
    update();
  }

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

    // update elements

    x.range([MAX_RADIUS, width - MAX_RADIUS]);
    y.range([MAX_RADIUS, height - MAX_RADIUS]);
    svg.attr("width", svgWidth).attr("height", svgHeight);
    marginArea.attr("transform", "translate(" + padding.left + "," + padding.top + ")");
    dataArea.attr("transform", "translate(" + (padding.left + margin.left) + "," + (padding.top + margin.top) + ")");

    xAxis.scale(x);
    yAxis.scale(y);
  }

  // construt ontime chart specific elements

  function construct() {
    x.domain(d3.extent(articleIndex, function(d) {return d.date}));

    dataArea.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    dataArea.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + width + ",0)")
      .call(yAxis);
  };

  function update() {
    dataArea.selectAll("g.article")
      .data(articleIndex)
      .enter()
      .append("g")
      .classed("article", true)
      .attr("transform", function(d) {
        var xt = x(d.date);
        var yt = y(d.y);
        return "translate(" + xt + ", " + yt + ")";
      })
      .append("circle")
      .attr("r", MAX_RADIUS);
  }
}

$(document).ready(function() {
  var d = new Diagram();
});

