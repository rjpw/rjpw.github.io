---
title: Managing Visualization State - Part I
layout: post
css: /css/vis1.css
scripts:
  - /js/vendor/d3/d3.min.js
  - /js/demos/vis1.js
---

## Problem

How best to manage the state of interactive browser-based visualizations.

## Context

Interactive web applications composed of data-driven visualizations typically take advantage of open source JavaScript libraries. Choosing the right visualization library is one of the developer's first decisions, and an important but sometimes hidden element of this decision is how the library maintains interaction state. In the early days of the web it might be said that the DOM *was* the state, and many excellent visualization libraries start with this assumption. But with the rich forms of interaction and collaboration afforded by modern browsers, this assumption can lead to great complexity.

Often an application's features call for taking state away from the DOM and managing it entirely with JavaScript. Many libraries already contain their own abstractions for retaining user interaction, but their perfectly reasonable assumptions about event sources such as the mouse or touch-screen may be at odds with some requirements. Examples might include supporting undo/redo, replaying interaction history, or synchronizing the interaction state of multiple visualizations.

As of this writing, the most popular and powerful JavaScript visualization library is arguably [D3](http://d3js.org/), and there is a veritable encyclopedia of examples available on D3 author Mike Bostock's companion site [bl.ocks.org](http://bl.ocks.org/mbostock).

To illustrate the notion of interaction state we borrow an example from the site that demonstrates a technique called <a href="http://www.infovis-wiki.net/index.php?title=Linking_and_Brushing" target="_">brushing</a>. Brushed visualizations can be used as a powerful visual query tool, and make it possible to achieve direct manipulation of query filters on related data. For an inspirational example see Kai Chang's <a href="http://bl.ocks.org/syntagmatic/3150059" target="_">Nutrient Explorer</a>.

![Nutrient Explorer]({{site.url}}/img/nutrient_explorer.png)

In a simpler example below, brushing is used to define a subset of one dimension of the data. The selected values are highlighted by, in this case, applying or removing a CSS class that paints a dot red (see <a href="http://bl.ocks.org/mbostock/6498000" target="_">the author's demo</a> and <a href="https://gist.github.com/mbostock/6498000" target="_">source</a>).

<div id="vis1">
  <noscript>
    <hr>
    <p>JavaScript-enabled users get an interactive version of this static image.</p>
    <img src="/img/vis1.png" alt="D3 Brush Example">
    <hr>
  </noscript>
</div>

We can think of the data represented by the dots as the *domain model*, and the assignment of a CSS class based on brush position as retaining *interaction state*. The state of the brushed region can be changed using mouse or touch (users of JavaScript-enabled browsers can interact with the example above), and when this happens the CSS class of each data point is re-evaluated. All other dimensions of this visualization are fixed at the point the page is refreshed.

But now we go beyond the intentionally simplified rendering in Bostock's example and ask what other potential degrees of freedom are possible in this one simple image. It is easy to imagine the underlying domain values changing, and when these values are returned we may find they exceed the current range, perhaps calling for the presentation of a scrollbar. A pinch gesture could perhaps expand or contract the range, or maybe we use a sliding window approach and pan horizontally using a swipe gesture. The long press of a mouse button could call up a magnifying glass, or the user could resize their browser window and the new ratio of width to height might trigger the presentation of a vertical axis and new vertical brush handles.

Each of these potential features would require associated state, the maintenance of which could be made local to the feature (as is the case above) or more usefully it could be held in a more central data structure to make it possible to inform other aspects of the page like the lists of food groups or specific dishes we see in Chang's Nutrition Explorer.

But these examples still only cover events local to the visualization. Imagine a system design where one user's brush arrangement represents just one submission in a larger collaborative real-time system, and before updating the actual display the user's individual input is averaged with those of other users connected to a server. Maybe our collaborative visualization is connected to a mix of virtual and physical devices (see RESTful API Prototyping [Part I]({% post_url 2015-2-2-visual-architect %}) and [Part II]({% post_url 2015-2-7-visual-architect-ii %})), raising again the question of which collaborative data repositories or devices are considered sources of ultimate truth. In such cases the need for thoughtfully managing state becomes paramount.

## Solution

When considering applications in these wider usage contexts it becomes useful to add an abstraction layer to hold onto state, and when we reach that point it's almost certain that our application could benefit from a client-side application framework. If understanding the code behind custom visualizations is already a challenge, blending it with frameworks like Backbone, Angular, or React can be all the more daunting. Here are a few key points to consider:

* Store interaction state centrally, but replicate only by necessity
* Maintain a strict separation between state and domain objects
* Strive for code that statelessly renders your views and visualizations
* Be selective in what gets rendered after a change to model or state

## Forces

* Need for modes of interaction beyond simple clicks and drags
* Desire to leverage existing application and graphics libraries
* Potential need for multi-device collaborative input
* Bewildering abundance of choice in available development tools

## Example (to come) - D3 meets React and Angular

In an example to come soon, we will combine D3 for visualization with React for stateless rendering and Angular for application coordination. For a preview of the concepts please follow [this link](https://egghead.io/lessons/integrating-components-with-d3-and-angularjs) to a video of a whirlwind coding session from Joe Maddalone of Egghead.io where he deftly pulls together exactly these technologies.

One might ask why use these three libraries. For several years now Google's AngularJS project has been helping developers build structured client-side applications with an MVC architecture. With so many live systems relying on AngularJS it seemed a helpful base to build on. As for Facebook's React library, their technique of rapidly rendering the "V" in MVC based on a virtual DOM and changes to state was an excellent way to meet our goal of stateless rendering. And of course D3 is the most widely used JavaScript library for authoring bespoke browser-based visualizations.

Even though each of these libraries is excellent for its own reasons, I must include a caveat that this particular combination of libraries/frameworks does not, on its own, guarantee satisfactory results. We might agree that pizza and gelato make a pleasant meal, but they probably don't make a pleasing mouthful. We'll need to ensure each of our libraries serves its own distinct role in the meal of MVC. We'll let AngularJS handle the model and controller in MVC, and we'll let React collaborate with D3 to produce the view. As for application state, we'll start by handling this with React for now, but we may end up writing a custom module later.

For a little more detail on the issues, we want to avoid letting both AngularJS and React manipulate the DOM because they take such a different conceptual approaches to rendering. AngularJS seeks to augment the standard *retained* mode view, whereas React seeks to ensure consistency and performance by employing an *immediate* mode approach that pre-renders and then adds or updates DOM elements (for a quick definition of retained and immediate modes see <a href="https://msdn.microsoft.com/en-us/library/windows/desktop/ff684178(v=vs.85).aspx" target="_">this MSDN page on graphics APIs</a>, and for a conceptual rationale of the value of immediate mode in React see <a href="http://vimeo.com/108801879" target="_">this video with Facebook's Pete Hunt</a>).

But web browsers do render *documents* after all, not *applications*, and so ultimately both approaches are stuck with a stateful DOM. The React library lets us write our code *as if* we are re-rendering the DOM on every state change, but it does have code to deal with the state of certain DOM elements as we would expect (e.g. it doesn't lose track of cursor position while updating textboxes, or scroll position while adding to lists). But in general it does what we were after by putting our own application state firmly under our control. In my experience there is also a performance benefit over AngularJS directives, and conceptually React components are much easier to understand.

For a little more background on our example, roughly three years ago the author of D3 wrote a [blog post](http://bost.ocks.org/mike/chart/) calling for new conventions for coding reusable charts. This eventually inspired another developer to suggest using React components to answer Bostock's request, asking in turn: [D3 and React - the future of charting components?](http://10consulting.com/2014/02/19/d3-plus-reactjs-for-charting/) And in terms of providing an MVC architecture to consume external resources, we've already introduced Joe Maddalone's integration video at the top of this example where he shows how to get an AngularJS directive to delegate rendering to a ReactJS component, which in turn uses D3 to make a chart. In the next post we will put all these ideas together and then discuss where we've ended up.

<!---
Discuss the need to understand the value of visualization lifecycle and *Immediate* vs *Retained* Mode rendering.
Honourable mention: The Guardian's [Ractive.js](http://www.ractivejs.org/) library.
-->

## <a name="Resources"></a>Resources and Links

* [Brushing and Linking](http://www.infovis-wiki.net/index.php?title=Linking_and_Brushing)
* [Nutrient Explorer](http://bl.ocks.org/syntagmatic/3150059)
* [Integrating Components with D3 and AngularJS](https://egghead.io/lessons/integrating-components-with-d3-and-angularjs)
* [D3 and React - the future of charting components?](http://10consulting.com/2014/02/19/d3-plus-reactjs-for-charting/)
* [Introducing D3 - Book Chapter](http://chimera.labs.oreilly.com/books/1230000000345/ch02.html)
* [Retained Mode versus Immediate Mode](https://msdn.microsoft.com/en-us/library/windows/desktop/ff684178(v=vs.85).aspx)
* [D3.js](http://d3js.org/)

<!---
* [Ractive.js](http://www.ractivejs.org/)
* [Crossfilter](http://square.github.io/crossfilter/)
-->
