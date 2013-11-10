function Diagram() {

  // constants

  var MSECS_INA_MIN = 60 * 1000;
  var MSECS_INA_HOUR = 60 * MSECS_INA_MIN;
  var MSECS_INA_DAY = 24 * MSECS_INA_HOUR;
  var MAX_RADIUS = 20;
  var DATE_FACTOR = 0.3;
  var SIZE_FACTOR = 0.3;
  var CHARGE = -20;

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

      d3.tsv("/static/data/en.txt", function(words) {
        wordFrequency = {};
        words.forEach(function(word) {
          wordFrequency[word.word] = word.cnt;
        });

        console.log("data", data);
        var dict = [
          "cat",
          "dog",
          "bat",
          "boy",
          "frog"
        ];
        var catGen = d3.scale.linear().domain([0, 1]).rangeRound([0, dict.length - 1]);

        var tokenRegex = /\w{5,}/g;
        var categories = {};

        Object.keys(data).forEach(function(key) {
          var article = data[key];

          var titleWords = article["post_content:"].match(tokenRegex) || [];
          var categoryScore = Infinity;
          article.category = "";

          titleWords.forEach(function(word) {

            word = word.toLowerCase();
            if (word[word.length - 1] == "s") word = word.substring(0, word.length - 1);

            var score = wordFrequency[word] || -word.length;
            if (score < categoryScore) {
              article.category = word;
              categoryScore = score;
            }
          });

          categories[article.category] = categories[article.category] ? categories[article.category] + 1 : 1;

          article.date = new Date(article.time * 1000);
          article.category = dict[catGen(Math.random())];
          article.size = article["post_content:"].length;
          articleIndex.push(article);
        });

        console.log("categories", categories);

        construct();
        update();
        force.start();
      });
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
      .append("title")
      .text(function(d) {return d.post_title});

    enters
      .classed("article", true)
      .attr("fill", function(d) {
        return color(d.category)
      })
      .append("circle")
      .attr("r", function(d) {d.radius = area(d.size); return d.radius});
    

    force.on("tick", function(e) {

      var CLUSTER = true;
      var COLLISION = false;

      if (CLUSTER) {
        var k = .08 * e.alpha;
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
            // member.x = x(member.date) * DATE_FACTOR + cx * (1 - DATE_FACTOR);
            // member.y = y(member.size) * SIZE_FACTOR + cy * (1 - SIZE_FACTOR);
            member.x += k * (cx - member.x);
            member.y += k * (cy - member.y);
          });
        });
      }

      if (COLLISION) {
        var q = d3.geom.quadtree(articleIndex);

        var i = 0;
        var n = articleIndex.length;

        while (++i < n) {
          q.visit(collide(articleIndex[i]));
        }
      }

      d3.selectAll("g.article")
        .attr("transform", function(d) {
          var xt = d.x;
          var yt = d.y;
          return "translate(" + xt + ", " + yt + ")";
        });
    });
  }

  function collide(node) {
    var r = node.radius + 16;
    var nx1 = node.x - r;
    var nx2 = node.x + r;
    var ny1 = node.y - r;
    var ny2 = node.y + r;

    return function(quad, x1, y1, x2, y2) {
      if (quad.point && (quad.point !== node)) {
        var x = node.x - quad.point.x;
        var y = node.y - quad.point.y;
        var l = Math.sqrt(x * x + y * y);
        var r = node.radius + quad.point.radius;

        if (l < r) {
          l = (l - r) / l * .1;
          node.x -= x *= l;
          node.y -= y *= l;
          quad.point.x += x;
          quad.point.y += y;
        }
      }
      return x1 > nx2
        || x2 < nx1
        || y1 > ny2
        || y2 < ny1;
    };
  }
}

$(document).ready(function() {
  var d = new Diagram();
});

