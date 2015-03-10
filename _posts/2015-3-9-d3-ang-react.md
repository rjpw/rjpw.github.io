---
title: Using D3 with Angular and React
layout: post
css: /css/vis1.css
scripts:
  - /js/vendor/d3/d3.min.js
  - /js/demos/vis2.js
  - /js/demos/vis3.js
---

## Introduction

This post builds on a discussion started last week on managing visualization state. For some more context please see [last week's post]({% post_url 2015-3-2-managing-visualization-state %}).

## Example - D3 meets React and Angular

We start by revisiting (and revising) a simple brushing visualization from Mike Bostock introduced as an example of user interaction with data-driven visualizations.

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

How should we proceed if we need to dynamically react to the wider range of events? We introduced a few such scenarios [last week]({% post_url 2015-3-2-managing-visualization-state %}), for example axis and scale changes, undo/redo, etc. Any answer must be aware of the the lifecycle of HTML and/or SVG elements rendered to our application's DOM.

Taking the *stateful* approach (a.k.a. *retained* mode) to solving this question the developer would need to consider which DOM elements were created at page load and then insert/modify/delete them appropriately. This is a good news/bad news story. The *good news* is that this is precisely what D3 offers. The *bad news* is that they have to anticipate exactly the kinds of changes that might be expected and then write D3 code to manage them. This can start out as a simple matter, but then eventually, as more interactive features are added, it can devolve into wrestling match against their own perfectly reasonable early design decisions.

If instead the developer takes a *stateless* approach (a.k.a. *immediate* mode), they can set aside a great deal of complexity by treating every change as a reason to re-render from scratch. This might seem like a tradeoff between conceptual and computational complexity, but surprisingly it often results in a much more responsive user experience. Libraries based on a lightweight *virtual DOM* don't completely re-render for every change even though their code makes it appear as if they do. Instead they use a *diff and patch* strategy to compute the smallest change required between the current DOM and the desired one. Applying their "patch" usually turns out to be more efficient than the more code-driven updating of a *stateful* approach.

Designing single-page apps with *retained mode* can be compared to designing a state machine with side-effects, where the particular action required at any moment depends on the present state of the machine (the view) and the type and content of any update event that triggers a change. Designing with *immediate mode* can be compared to writing a pure mathematical function, the goal of which is to compute the view at any time as a function of the current state. It is easy to see why the latter approach lends itself well to features like undo/redo, as it becomes a simple matter of pointing to one of a series of remembered states.

## Sample code

The code segments below show part of our experiment writing visualizations with Angular and React. The full code is unfortunately quite a bit larger than the D3 example, in fact spanning a few files, but from this partial example we can see a few important things. First, we appreciate that we're building using components, which is a terrific way to solidify a conceptual model of our code. In this case our components are named for the major SVG structures. These include *VisBase* for the SVG and a main group, *DataGroup* for rendering the points, and *BrushGroup* for rendering the brushes. We can also see that there is no special code to determine what to do during the application lifecycle. The render code is always the same. It will run each time the application state changes, which we will do whenever the data values change or when the brush is updated. The blocks starting with *React.createElement* don't repeatedly add elements to a web page, but rather they create a virtual element to be compared with the last rendering in the DOM. Finally, you may notice that the logical structure of the application can be traced by means of following the *require* keyword. This serves a function similar to *include* in other languages, and should ultimately allow us to build new applications from reusable modules and components.

The code samples below show the part of the visualization that paints the dots. It was derived partly from a similar blog post on the topic, entitled [D3 and React - the future of charting components?](http://10consulting.com/2014/02/19/d3-plus-reactjs-for-charting/)

This is the component written in React for rendering the visualization. In fact, what you're seeing is the result of running the *jsx* command on the original code that includes HTML-like tags, but this code would have been just as easy to write.

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

Heading down the dependencies, this next module called *visbase.js* renders the SVG tag and creates a group where the rest of the child elements are added. That's where you see *this.props.children* below, and those children consist of the *DataGroup* and *BrushGroup* above.

{% highlight javascript %}
var React = require('react');

var VisBase = React.createClass({displayName: 'VisBase',
  render: function() {

    var translate = 'translate(' +
      this.props.margin.left + ',' +
      this.props.margin.top + ')';

    return (
      React.createElement("div", null,
        React.createElement("svg", {
          width: this.props.width,
          height: this.props.height},
          React.createElement("g", {transform: translate}, this.props.children)
        )
      )
    );
  }
});

module.exports = VisBase;
{% endhighlight %}

We keep going deeper to show the DataGroup. Again we just add child elements, using functions to make rendering decisions such as whether or not to render a dot as *selected*.

{% highlight javascript %}
var React = require('react');
var DataPoint = require('./datapoint');

var DataGroup = React.createClass({displayName: 'DataGroup',

  render: function () {

    var props = this.props
      , xFunc = props.xScale
      , yFunc = props.yScale
      , selectedFunc = function(d) { return props.brush[0] <= d.x && d.x <= props.brush[1]; }
      , childElements = {};

    props.data.map( function (point, i) {
      childElements['dp_' + i] = React.createElement(DataPoint, {
        height:  props.height,
        width:  props.width,
        value:  [xFunc(point.x), yFunc(point.y)],
        selected:  selectedFunc(point) })
    });

    return (React.createElement("g", {className: "dots"}, childElements));

  }

});

module.exports = DataGroup;
{% endhighlight %}

Finally the dots themselves are rendered as circles, applying a CSS class if the *selected* property is true.

{% highlight javascript %}
var React = require('react');

var DataPoint = React.createClass({displayName: 'DataPoint',

  getDefaultProps: function() {
    return { value: [0,0], radius: 3.5, selected: false }
  },

  render: function() {
    var selClass = this.props.selected ? "selected" : "";
    var itemTranslate = 'translate(' + this.props.value[0] + ',' + this.props.value[1] + ')';
    return (React.createElement("circle", {r: this.props.radius,
      className: selClass, transform: itemTranslate}));
  }

});

module.exports = DataPoint;
{% endhighlight %}

This isn't the whole visualization, but by now you can see that there is a fair bit more code than the D3 version. Clearly we don't get our solution for free, but hopefully the extra effort will pay off in more flexible use of code in the future.

The next part of the code breaks away from the visualization inself, and delves into the AngularJS part of the code. This is the entry point for Browserify's compilation, and it knits the whole application together.

{% highlight javascript %}
var angular = require('angular');
var AppController = require('./components/appcontroller');
var ChartDirective = require('./components/reactchartdirective');

var app = angular.module('ARD3', [])
  .directive('reactchart', ChartDirective)
  .controller('appController', AppController);

module.exports = app;
{% endhighlight %}

We refer to the app controller in our code, but it's currently only there as an empty AngularJS requirement. The more interesting code is the AngularJS directive that delegates its rendering to the React visualization code we saw above.

{% highlight javascript %}
var React = require('react');
var BrushDemo = React.createFactory(require('./brushdemo'));
var _ = require('underscore');

var ReactChartDirective = function () {
  return {

    restrict: 'E',

    scope: {data:'=',
      chartwidth:'@',
      chartheight:'@',
      id:'@'
    },

    link: function (scope, elem, attrs) {

      scope.brushDemo = React.render(BrushDemo({
        data: scope.data,
        target: scope.id,
        width: scope.chartwidth,
        height: scope.chartheight}),
      elem[0]);

      scope.brushDemo.setState({scope: scope, data:scope.data});

    },

    controller: function ($http, $scope, $interval) {

      var intervalHandle = $interval(refreshData, 5000);

      function randomIntFromInterval(min,max) {
        return Math.floor(Math.random()*(max-min+1)+min);
      }

      var generateData = function () {
        return _.range(randomIntFromInterval(50, 250)).map(function () {
          return {x: Math.random(), y: Math.random()};
        });
      }

      function refreshData() {
        $scope.data = generateData();
        $scope.brushDemo.setState({data: $scope.data});
      }

      // some initial values to start
      $scope.data = generateData();

    }

  }
};

module.exports = ReactChartDirective;
{% endhighlight %}

This AngularJS directive lets us attach a *reactchart* to our page like we see below. Notice the attributes of the *reactchart* tag, a feature that already lets us do a little on-the-fly customization of the visualization.

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

There is *some* D3 code in this example, but the vast majority of the code is written in React. This is best done with their JSX variant of JavaScript, which in turn means including a JSX interpreter on your web page or generating ES5-compliant JavaScript by running some kind of build step. We chose to go with the latter approach, using [Gulp](http://gulpjs.com/) and [Browserify](http://browserify.org/) to convert JSX code into JavaScript. There are several good reasons besides code conversion when deciding whether or not to make use of a build tool to construct your application. They can perform a range of tasks like dependency checking, code linting, minification, etc. Once we have a more complete application we will post the source code for generating it on this GitHub account.

## Discussion

This exercise demonstrates that it's possible to use Angular, React, and D3 to build a custom visualization, but were we satisfied with the result? There is more code than the D3-only version at the top of this post, and that's a bit worrisome since more lines of code usually bring more issues. But I might point out that some of this additional code is inevitable since we are reproducing features previously handled by D3, only this time we're following an *immediate mode* pattern. It may be too early to tell exactly where this approach will lead, but I have written enough *retained mode* visualizations to suspect there will be a payoff when it comes to adding new features.

To get a full appreciation for all the pros and cons of immediate mode we'll need to take this example a little farther. We will also test how well this approach scales. At this moment we only have one such visualization on the page. What if there were hundreds? We will take the time to refactor what we've written, paying attention to how state propagates into visualizations. Along the way we'll explore additional inputs, wiring up other event sources like web sockets and Leap Motion controllers.

In spite of these upcoming challenges I still think that using a component-based visualization architecture definitely feels like we're heading in the right direction. In fact there are other web development frameworks and languages like [Om](https://github.com/omcljs/om), [elm](http://elm-lang.org/) and [Ractive.js](http://www.ractivejs.org/) that also use virtual DOM approaches, and with some of them being guided by the need for interactive visualizations it's likely that writing with these tools would lead to more elegant solutions. Our example here may look like bricolage by comparison, but there are enough applications in the world built on these architectural blocks that the effort was definitely worth it.

In future we will take a cue from the functional programming approach used in those libraries, and look into libraries like BaconJS or RxJS to propagate change throughout the UI based on state. And of course we should also make use of our MIDI API and other unusual event sources to see how easy it is to incorporate them.

## <a name="Resources"></a>Resources and Links

* [Browserify](http://browserify.org/)
* [Gulp](http://gulpjs.com/)
* [Gulp Starter Project](https://github.com/greypants/gulp-starter)
* [Om](https://github.com/omcljs/om)
* [elm](http://elm-lang.org/)
* [Ractive.js](http://www.ractivejs.org/)
