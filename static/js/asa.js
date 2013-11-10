function Diagram() {

  // constants

  var MSECS_INA_MIN = 60 * 1000;
  var MSECS_INA_HOUR = 60 * MSECS_INA_MIN;
  var MSECS_INA_DAY = 24 * MSECS_INA_HOUR;
  var MAX_RADIUS = 20;
  var DATE_FACTOR = 1;
  var SIZE_FACTOR = 1;
  var CHARGE = -3;

  // padding and margin vaues

  var padding = {top: 10, right: 10, bottom: 10, left: 10};
  var margin = {top: 25, right: 50, bottom: 20, left: 25};

  // svg region

  var svgWidth;
  var svgHeight;

  // margin region

  var marginWidth;
  var marginHeight;

  // primary content area

  var width;
  var height;

  // create scales and axes

  var x = d3.time.scale();
  var y = d3.scale.pow().exponent(.5);
  var area = d3.scale.pow().exponent(.2).range([MAX_RADIUS, 3]);
  var xAxis = d3.svg.axis();
  var yAxis = d3.svg.axis().orient("right");
  var color = d3.scale.category10();

  // standard diagram elements

  var svg;
  var marginArea;
  var dataArea;
  var defs;

  // the article index

  var articleIndex = [];
  var force = d3.layout.force()
    .charge(CHARGE);
  var catGroups;

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

    // size the chart

    size();

    // load the data

    load();
  }

  function load() {

    d3.json("/api/posts", function(data) {
      console.log("data", data);
      var dict = [
        "cat",
        "dog",
        "bat",
        "boy",
        "frog"
      ];
      var catGen = d3.scale.linear().domain([0, 1]).rangeRound([0, dict.length - 1]);

      Object.keys(data).forEach(function(key) {
        var article = data[key];
        article.date = new Date(article.time * 1000);
        article.category = dict[catGen(Math.random())];
        article.size = article["post_content:"].length;
        articleIndex.push(article);
      });

      construct();
      update();
//      force.start();
    });


    // // generate random data

    // var end = new Date();
    // var start = new Date(end.getTime() - 365 * MSECS_INA_DAY);
    // var dateGen = d3.time.scale().domain([start, end]);
    // var dict = [
    //   "cat",
    //   "dog",
    //   "bat",
    //   "boy",
    //   "frog"
    // ];
    // var catGen = d3.scale.linear().domain([0, 1]).rangeRound([0, dict.length - 1]);
    // color.domain(dict);

    // for (var i = 0; i < 200; ++i) {
    //   var rnd = Math.random();
    //   articleIndex.push({
    //     date: dateGen.invert(Math.random()),         
    //     category: dict[catGen(Math.random())],
    //   });
    // }

    // construct static portions of the chart

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
    force.size([width, height]);
  }

  // construt ontime chart specific elements

  function construct() {
    x.domain(d3.extent(articleIndex, function(d) {return d.date}));
    y.domain(d3.extent(articleIndex, function(d) {return d.size}));
    area.domain(d3.extent(articleIndex, function(d) {return d.size}));
    

    dataArea.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    dataArea.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + width + ",0)")
      .call(yAxis);

    force.nodes(articleIndex);

    catGroups = d3.nest()
      .key(function(d) {return d.category;})
      .map(articleIndex, d3.map);
  };

  function update() {
    var enters = dataArea.selectAll("g.article")
      .data(articleIndex)
      .enter()
      .append("g");

    enters
      .classed("article", true)
      .attr("fill", function(d) {
        return color(d.category)
      })
      .append("circle")
      .attr("r", function(d) {return area(d.size)});

    force.on("tick", function(e) {

      var k = 6 * e.alpha;
      Object.keys(catGroups).forEach(function(cat) {
        var members = catGroups[cat];
        var cx = 0;
        var cy = 0;
        members.forEach(function(member) {
          cx += member.x;
          cy += member.y;
        });

        cx /= members.length;
        cy /= members.length;

        members.forEach(function(member) {
          member.x = x(member.date) * DATE_FACTOR + cx * (1 - DATE_FACTOR);
          member.y = y(member.size) * SIZE_FACTOR + cy * (1 - SIZE_FACTOR);
        });
      });

    // console.log("catGroups", catGroups);


      d3.selectAll("g.article")
        .attr("transform", function(d) {
          var xt = d.x;
          var yt = d.y;
          return "translate(" + xt + ", " + yt + ")";
        });
    });
  }
}

$(document).ready(function() {
  var d = new Diagram();
});

