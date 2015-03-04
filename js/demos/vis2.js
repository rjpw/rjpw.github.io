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

