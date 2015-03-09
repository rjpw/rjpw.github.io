---
title: Managing Visualization State - Part II
layout: post
css: /css/vis1.css
scripts:
  - /js/vendor/d3/d3.min.js
  - /js/demos/vis2.js
  - /js/demos/vis3.js
---

## Intro to Part II

This is a continuation of a series on Managing Visualization State. For the full article including background and context please start with [Part I]({% post_url 2015-3-2-managing-visualization-state %}).

## Example - D3 meets React and Angular

We start by revisiting (and revising) the simple brushing visualization from Mike Bostock introduced in Part I of this article.

<div id="vis1">
  <noscript>
    <hr>
    <p>JavaScript-enabled users get an interactive version of this static image.</p>
    <img src="/img/vis1.png" alt="D3 Brush Example">
    <hr>
  </noscript>
</div>

The code for our starting point is fairly typical of D3 sample code. It is a stripped down version of the original on <a href="http://bl.ocks.org/mbostock/6498000" target="_">bl.ocks.org</a>, modified to focus on the basics and to provide blog readers lacking JavaScript with a substitute image. An associated stylesheet is required, shown immediately after the JavaScript code.

### vis2.js (modified from original code by Mike Bostock)

Note: if you need a version of the code without line numbers you can find it in the source code for this site. The code for vis2.js can be found in the [demo script folder](https://github.com/rjpw/rjpw.github.io/tree/master/js/demos).

{% highlight javascript linenos %}
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
.axis line { fill: none;  stroke: #000; shape-rendering: crispEdges; }
.axis text { font: 10px sans-serif; }
.dots { fill-opacity: .2; }
.dots .selected { fill: red; stroke: brown; }
.brush .extent { fill-opacity: .125; shape-rendering: crispEdges; }
.resize {
  display: inline !important; /* show when empty */
  fill: #666;
  fill-opacity: .8;
  stroke: #000;
  stroke-width: 1.5px;
}
{% endhighlight %}

Let's break down the code in *vis2.js*. We've broken it into loosely-defined "blocks", where a block is nothing more formal than a few lines of JavaScript that could use a good comment:

Block|Line(s)|Feature
:---:|:-----:|-------------
1|4-6 | remove a static image tag (for this blog)
2|8 | 400 random data points to represent domain values
3|10-15 | structural drawing values (e.g. size and margins)
4|17 | a linear scaling function to convert domain data to pixels in the *X* axis
5|20 | randomizer for domain value position in the *Y* axis
6|22-25 | brush object definition (just the calculations)
7|27-30 | code to help render the shape of brush handles
8|32-36 | SVG drawing created and sized
9|38-43 | x-axis visual format defined
10|45-51 | selection group for dots defined and mapped to the data from block 2
11|53-55 | SVG group added for brush
12|57-59 | semicircles drawn, one for each brush handle
13|61-62 | height of brush set
14|64 | brush function invoked to set initial coordinates
15|66-69 | brush handler function defined

Now let's take a look at the code from the perspective of user interaction. You'll notice that very few of the blocks in this code are expected to be run in response to user events. Only the *brushmove* function fits the bill (defined in block 15). The rest of this code, 14 of 15 blocks, runs in response to one single event: the initial page load.

How should we proceed if we need to dynamically react to the wider range of events? We introduced a few such scenarios in [Part I]({% post_url 2015-3-2-managing-visualization-state %}), for example axis and scale changes, undo/redo, etc. Any answer must be aware of the the lifecycle of HTML and/or SVG elements rendered to our application's DOM.

Taking the *stateful* approach (a.k.a. *retained* mode) to solving this question the developer would need to consider which DOM elements were created at page load and then insert/modify/delete them appropriately. This is a good news/bad news story. The *good news* is that this is precisely what D3 offers. The *bad news* is that they have to anticipate exactly the kinds of changes that might be expected and then write D3 code to manage them. This can start out as a simple matter, but then eventually, as more interactive features are added, it can devolve into wrestling match against their own perfectly reasonable early design decisions.

If instead the developer takes a *stateless* approach (a.k.a. *immediate* mode), they can set aside a great deal of complexity by treating every change as a reason to re-render from scratch. This might seem like a tradeoff between conceptual and computational complexity, but surprisingly it often results in a much more responsive user experience. Libraries based on a lightweight *virtual DOM* don't completely re-render for every change even though their code makes it appear as if they do. Instead they use a *diff and patch* strategy to compute the smallest change required between the current DOM and the desired one. Applying their "patch" usually turns out to be more efficient than the more code-driven updating of a *stateful* approach.

Designing single-page apps with *retained mode* can be compared to designing a state machine with side-effects, where the particular action required at any moment depends on the present state of the machine (the view) and the type and content of any update event that triggers a change. Designing with *immediate mode* can be compared to writing a pure mathematical function, the goal of which is to compute the view at any time as a function of the current state. It is easy to see why the latter approach lends itself well to features like undo/redo, as it becomes a simple matter of pointing to one of a series of remembered states.

The code below shows part of a shortened version of the visualization written for ReactJS. The full code is unfortunately quite a bit larger than the D3 example, in fact spanning a few files, but from this example can see a few important things. First, we can see that we're building components, which is a terrific way to build a UI. In this case our components are named for the major SVG structures. These include *VisBase* for the SVG and a main group, *DataGroup* for rendering the points, and *BrushGroup* for rendering the brushes. We can also see that there is no special code to determine what to do during the application lifecycle. The render code is always the same. It will run each time the application state changes, which we will do whenever the data values change or when the brush is updated. The blocks starting with *React.createElement* don't repeatedly add elements to a web page, but rather they create a virtual element to be compared with the last rendering in the DOM. Finally, you may notice that the logical structure of the application is enforced at build time using the *require* keyword used by the code that builds the full application.

### Snippet showing main module of React version
{% highlight javascript %}
var React = require('react');
var d3 = require('d3');

var VisBase = require('./visbase');
var DataGroup = require('./datagroup');
var BrushGroup = require('./brushgroup');

var BrushDemo = React.createClass({displayName: 'BrushDemo',

  getInitialState: function () {

    var marginBase = {top: 10, right: 45, bottom: 20, left: 45};

    var outerWidth = this.props.width;
    var outerHeight = this.props.height;

    var innerWidth = outerWidth - marginBase.left - marginBase.right;
    var innerHeight = outerHeight - marginBase.top - marginBase.bottom;

    return { data: [],
      margin: marginBase,
      brush: [0.3, 0.5],
      xScale: d3.scale.linear().range([0, innerWidth ]),
      dragScale: d3.scale.linear().range([0, innerWidth * 1.4 ]),
      yScale: d3.scale.linear().range([innerHeight, 0]),
      scope: {},
      dragging: false,
      dragElement: '',
      dragStart: -9999
    }

  },

  handleMouseMove: function (e) {
    // snipped for space
  },

  handleDragStart: function (e, id) {
    // snipped for space
  },

  handleDragEnd: function (e) {
    // snipped for space
  },

  render: function() {

    var innerWidth = this.props.width - this.state.margin.left - this.state.margin.right;
    var innerHeight = this.props.height - this.state.margin.top - this.state.margin.bottom;

    return (
      React.createElement(VisBase, {
        width: this.props.width,
        height: this.props.height,
        margin: this.state.margin},

        React.createElement(DataGroup, {
          data: this.state.data,
          width: innerWidth,
          height: innerHeight,
          brush: this.state.brush,
          xScale: this.state.xScale,
          yScale: this.state.yScale}),

        React.createElement(BrushGroup, {
          mMove: this.handleMouseMove,
          mStart: this.handleDragStart,
          mEnd: this.handleDragEnd,
          width: innerWidth,
          height: innerHeight,
          brush: this.state.brush,
          xScale: this.state.xScale,
          yScale: this.state.yScale})
        )
    );

  }
});

module.exports = BrushDemo;
{% endhighlight %}

Here is the AngularJS HTML code that we'll use to attach this little application to our page. Notice the attributes of the *reactchart* directive, a feature that already lets us do a little on-the-fly customization of the visualization.

{% highlight html %}
<div id="nghome" ng-app='ARD3'>
  <div ng-controller='appController'>
    <reactchart data="data" id="chart1" chartwidth="700" chartheight="100"></reactchart>
  </div>
</div>
{% endhighlight %}

Immediately below is what you get when this code runs (along with all the supporting parts, of course). Notice that the data is changing every five seconds but the brush state remains where you last put it. That's the separation between model and state that we were looking for. We've got AngularJS changing the data, simulating updates from the server, and we've got React handling the DOM updating as required.

We still have some work to do yet to tidy up this code and finish porting the example to React. The *brushing* code isn't perfect yet (emulating Mr. Bostock is no small feat), but this is still a proof of concept.

<div id="nghome" ng-app='ARD3'>
  <div ng-controller='appController'>
    <reactchart data="data" id="chart1" chartwidth="700" chartheight="100"></reactchart>
  </div>
</div>

There is *some* D3 code in this example, but the vast majority of the code is written in React. This is best done with their JSX variant of JavaScript, which in turn means including a JSX interpreter on your web page or running a build step. We chose to go with the latter approach, using [Gulp](http://gulpjs.com/) and [Browserify](http://browserify.org/) to perform the build. The project source code will be posted to GitHub in the coming days, along with a post explaining the structure.

## <a name="Resources"></a>Resources and Links

* [Browserify](http://browserify.org/)
* [Gulp](http://gulpjs.com/)
* [Gulp Starter Project](https://github.com/greypants/gulp-starter)
