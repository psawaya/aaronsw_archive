function Diagram() {

  // constants

  var MSECS_INA_MIN = 60 * 1000;
  var MSECS_INA_HOUR = 60 * MSECS_INA_MIN;
  var MSECS_INA_DAY = 24 * MSECS_INA_HOUR;
  var MIN_RADIUS = 2;
  var MAX_RADIUS = 20;
  var DATE_FACTOR = 0.1;
  var SIZE_FACTOR = 0;
  var CATEGORY_FACTOR = 0.3;
  var COLLISION_FACTOR = 0.01;
  var CHARGE = -50;
  var LINK_STRENGHT = 0.5;

  // factors

  var dateFactor = 0;
  var categoryFactor = 0;

  // padding and margin vaues

  var padding = {top: 10, right: 10, bottom: 10, left: 10};
  var margin = {top: 10, right: 10, bottom: 20, left: 10};

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

  // layers

  var linkLayer;
  var nodeLayer;
  var tagLayer;

  // the article index

  var articleIndex = {};
  var articles = [];
  var links = [];
  var force = d3.layout.force()
    .charge(CHARGE)
    .linkStrength(0);

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
    linkLayer = dataArea.append("g");
    nodeLayer = dataArea.append("g");
    tagLayer = dataArea.append("g");

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
        var catGen = d3.scale.pow().exponent(4).domain([0, 1]).rangeRound([0, dict.length - 1]);

        // extract the article data

        Object.keys(data).forEach(function(key) {
          var article = data[key];
          article.date = new Date(article.time * 1000);
          article.category = dict[catGen(Math.random())];
//          article.category = article.tags.length > 0 ? article.tags[0] : "misc.";
          article.size = article.post_content.length;
          articles.push(article);
          articleIndex[article.postid] = article;
        });

        var docFilter = function(d) {return d.post_title != "The Archives"};
        articles.filter(docFilter).forEach(function(article) {
          article.internal_links.forEach(function(link) {
            var tokens = link.split("/");
            if (tokens.length > 0) {
              var id = tokens[tokens.length - 1];
              var mention = articleIndex[id];
              if (mention) {
                links.push({source: article, target: mention});
              }
            }
          });
        });

        // links = [];

        // var ra = d3.scale.linear().rangeRound([0, articleIndex.length - 1]);
        // for (var i = 0; i < 30; ++i) {
        //   var a1 = articleIndex[ra(Math.random())];
        //   var a2 = articleIndex[ra(Math.random())];
        //   if (a1 != a2) {
        //     links.push({source: a1, target: a2});
        //   }
        // }

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
    x.domain(d3.extent(articles, function(d) {return d.date}));
    y.domain(d3.extent(articles, function(d) {return d.size}));
    area.domain(d3.extent(articles, function(d) {return d.size}));
    

    dataArea.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .on("click", function(d) {
        dateFactor = (dateFactor) ? 0 : DATE_FACTOR;
        force.resume();
      })
      .call(xAxis);

    // dataArea.append("g")
    //   .attr("class", "y axis")
    //   .attr("transform", "translate(" + width + ",0)")
    //   .call(yAxis);

    force.nodes(articles);
    force.links(links);

    catGroups = d3.nest()
      .key(function(d) {return d.category;})
      .map(articles, d3.map);

    console.log("catGroups", catGroups);
  };

  function update() {

    linkLayer.selectAll("line.link")
      .data(links)
      .enter()
      .append("line")
      .classed("link", true)
      .on("click", function(d) {
        var ls = force.linkStrength();
        console.log("ls", ls);
        force.linkStrength(ls ? 0 : LINK_STRENGHT);
        force.start();
      });
        
   
    var enters = nodeLayer.selectAll("g.article")
      .data(articles)
      .enter()
      .append("g")
      .on("click", function(d) {
        $('#article_viewer').html(markdown.toHTML(d.post_content));
        $('#article_viewer').show();
        // console.log(d);
      });

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

    tagLayer.selectAll("text.category")
      .data(categoryData)
      .enter()
      .append("text")
      .classed("category", true)
      .attr("text-anchor", "middle")
      .text(function(d) {return d.name})
      .on("click", function(d) {
        categoryFactor = categoryFactor ? 0 : CATEGORY_FACTOR;
        force.resume();
      });
    
    force.on("tick", function(e) {

      var CLUSTER = true;
      var COLLISION = true;

      if (CLUSTER) {
        var k = categoryFactor * e.alpha;
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
            member.x = x(member.date) * dateFactor + clx * (1 - dateFactor);
            member.y = y(member.size) * SIZE_FACTOR + cly * (1 - SIZE_FACTOR);
          });
        });
      }

      if (COLLISION) {
        var q = d3.geom.quadtree(articles);

        var i = 0;
        var n = articles.length;

        while (++i < n) {
          q.visit(collide(articles[i]));
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

      d3.selectAll("line.link")
        .attr("x1", function(d) {return d.source.x})
        .attr("y1", function(d) {return d.source.y})
        .attr("x2", function(d) {return d.target.x})
        .attr("y2", function(d) {return d.target.y});
    });
  }

  function collide(node) {
    var r = node.radius;
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

