---
title: Managing Visualization State - Part II
layout: post
css: /css/vis1.css
scripts:
  - /js/vendor/d3/d3.min.js
  - /js/demos/vis2.js
---

## Intro to Part II

This is a continuation of a series on Managing Visualization State. For the full article including background and context please start with [Part I]({% post_url 2015-3-2-managing-visualization-state %}).

## Example - D3 meets React and Angular

We start by revisiting the simple brushing visualization from Mike Bostock introduced in Part I of this article.

<div id="vis1">
  <noscript>
    <hr>
    <p>JavaScript-enabled users get an interactive version of this static image.</p>
    <img src="/img/vis1.png" alt="D3 Brush Example">
    <hr>
  </noscript>
</div>

The code for our starting point is fairly typical of D3 sample code. It is a stripped down version of the original on <a href="http://bl.ocks.org/mbostock/6498000" target="_">bl.ocks.org</a>, modified to focus on the basics and to provide blog readers lacking JavaScript with a substitute image. The associated CSS stylesheet is shown immediately after the JavaScript code.

### vis2.js (modified from original code by Mike Bostock)

{% highlight javascript linenos=table %}
(function () {

  // clear out the noscript placeholder
  var elementID = '#vis1';
  var el = document.querySelector(elementID);
  el.innerHTML = '';

  var data = d3.range(400).map(Math.random);

  var margin = {top: 10, right: 45, bottom: 20, left: 45},
      width = 700 - margin.left - margin.right,
      height = 80 - margin.top - margin.bottom,
      centering = false,
      center,
      alpha = .2;

  var x = d3.scale.linear()
      .range([0, width]);

  var y = d3.random.normal(height / 2, height / 8);

  var brush = d3.svg.brush()
      .x(x)
      .extent([.3, .5])
      .on("brush", brushmove);

  var arc = d3.svg.arc()
      .outerRadius(height / 2)
      .startAngle(0)
      .endAngle(function(d, i) { return i ? -Math.PI : Math.PI; });

  var svg = d3.select(elementID).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.svg.axis()
        .scale(x)
        .orient("bottom"));

  var dot = svg.append("g")
      .attr("class", "dots")
    .selectAll("circle")
      .data(data)
    .enter().append("circle")
      .attr("transform", function(d) { return "translate(" + x(d) + "," + y() + ")"; })
      .attr("r", 3.5);

  var gBrush = svg.append("g")
      .attr("class", "brush")
      .call(brush);

  gBrush.selectAll(".resize").append("path")
      .attr("transform", "translate(0," +  height / 2 + ")")
      .attr("d", arc);

  gBrush.selectAll("rect")
      .attr("height", height);

  gBrush.call(brush.event);

  function brushmove() {
    var extent = brush.extent();
    dot.classed("selected", function(d) { return extent[0] <= d && d <= extent[1]; });
  }

})();
{% endhighlight %}

### vis1.css

{% highlight css %}
.axis path,
.axis line {
  fill: none;
  stroke: #000;
  shape-rendering: crispEdges;
}

.axis text { font: 10px sans-serif; }

.dots { fill-opacity: .2; }

.dots .selected {
  fill: red;
  stroke: brown;
}

.brush .extent {
  fill-opacity: .125;
  shape-rendering: crispEdges;
}

.resize {
  display: inline !important; /* show when empty */
  fill: #666;
  fill-opacity: .8;
  stroke: #000;
  stroke-width: 1.5px;
}
{% endhighlight %}
