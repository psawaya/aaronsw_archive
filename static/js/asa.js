function Diagram() {

  // constants

  var MSECS_INA_MIN = 60 * 1000;
  var MSECS_INA_HOUR = 60 * MSECS_INA_MIN;
  var MSECS_INA_DAY = 24 * MSECS_INA_HOUR;
  var MIN_RADIUS = 2;
  var MAX_RADIUS = 20;
  var DATE_FACTOR = 0.01;
  var SIZE_FACTOR = 0;
  var CATEGORY_FACTOR = 1;
  var COLLISION_FACTOR = 0.2;
  var CHARGE = -40;

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
  var area = d3.scale.pow().exponent(.1).range([MAX_RADIUS, MIN_RADIUS]);
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
          "frog",
          "apple",
          "banana",
          "orange",
          "bear",
        ];
        var catGen = d3.scale.linear().domain([0, 1]).rangeRound([0, dict.length - 1]);

        var tokenRegex = /\w{5,}/g;
        var categories = {};

        Object.keys(data).forEach(function(key) {
          var article = data[key];
          if (article.tags)
            console.log("article.tags", article.tags);

          article.date = new Date(article.time * 1000);
          article.category = dict[catGen(Math.random())];
          //article.tags.length > 0 ? article.tags[0] : "misc";
          article.size = article["post_content"].length;
          articleIndex.push(article);
        });

        construct();
        update();
        force.start();
      });
    });
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
      .on("click", function(d) {
        DATE_FACTOR = (DATE_FACTOR == 0) ? 0.01 : 0;
        console.log("DATE_FACTOR", DATE_FACTOR);
        force.restart();
      })
      .call(xAxis);

    dataArea.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + width + ",0)")
      .call(yAxis);

    force.nodes(articleIndex);

    catGroups = d3.nest()
      .key(function(d) {return d.category;})
      .map(articleIndex, d3.map);

    console.log("catGroups", catGroups);
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


    var categoryData = Object.keys(catGroups).map(function(name) {
      return {name: name}
    });

    dataArea.selectAll("text.category")
      .data(categoryData)
      .enter()
      .append("text")
      .classed("category", true)
      .attr("text-anchor", "middle")
      .text(function(d) {return d.name});
    
    force.on("tick", function(e) {

      var CLUSTER = true;
      var COLLISION = true;

      if (CLUSTER) {
        var k = CATEGORY_FACTOR * e.alpha;
        categoryData.forEach(function(category) {
          var members = catGroups[category.name];
          var cx = 0;
          var cy = 0;
          members.forEach(function(member) {
            cx += member.x;
            cy += member.y;
          });

          category.x = cx / members.length;
          category.y = cy / members.length;

          members.forEach(function(member) {
            var clx = member.x + k * (category.x - member.x);
            var cly = member.y + k * (category.y - member.y);
            member.x = x(member.date) * DATE_FACTOR + clx * (1 - DATE_FACTOR);
            member.y = y(member.size) * SIZE_FACTOR + cly * (1 - SIZE_FACTOR);
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

      d3.selectAll("text.category")
        .attr("x", function(d) {return d.x})
        .attr("y", function(d) {return d.y});

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
          l = (l - r) / l * COLLISION_FACTOR;
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

