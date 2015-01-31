---
title: RESTful API Prototyping with Visual Tools
layout: post
---

## Problem

When building web application prototypes there is value in rapid redesign on both clients and servers. Can we make it easy for client programmers to tinker with server prototypes?

## Context

While in many situations it is possible to create a mock server API for clients to consume, in some cases there is value in more realistic data sources. Examples include real-time collaboration and Internet-of-Things (IoT) scenarios.

The situation can arise in small agile teams whose focus is primarily on web client applications, but who depend on evolving or establishing server-based resources and APIs. This may be early in proof-of-concept phases, after paper prototyping and perhaps in place of [Wizard-of-Oz](http://www.usabilitybok.org/wizard-of-oz) testing, and hopefully long before a production implementation.

Another context may simply involve the rapid provision of a more realistic *sandbox* API server that can stand in for or provide controlled access to expensive or sensitive resources.

## Solution

One solution that seems popular re-emerging in the IoT community is *data flow programming* as exemplified by [Node-RED](http://nodered.org/), an open source project from IBM Emerging Technologies. Node-RED and similar projects (see [Resources](#Resources) at the end of this article) offers a number of advantages in API design over *mock*-based strategies or rapidly coding an API prototype from scratch, not the least of which is an interactive visual formalism of programmatic data flows.

## Forces

* Co-evolving server and client architecture or API
* Need for user validation of designs that goes beyond Wizard-of-Oz approaches
* Value in a self-describing architecture with a visual representation
* Need for rapid and moderately high-fidelity emulation of an actual resource

## Example - RESTful API for a MIDI Fader Panel

For our example, we will design a RESTful API for a piece of hardware in our lab. REST stands for Representational State Transfer, a technique for using the HTTP protocol for server APIs based on resource names and small set of simple operations, e.g. GET, PUT, POST, DELETE. Our example will allow us to query and update a MIDI Fader Panel. Ultimately we will use this API to control a parallel coordinates visualization.

![MIDI Fader Panel Graphed]({{site.url}}/img/midi_controller_graph.jpg)

Before starting work on our API project we had a tiny NodeJS script that pushed MIDI messages out to a UDP port. The figure below shows our first exercise in Node-RED, which was to forward the raw MIDI messages to a web socket. This is consistent with our approach of quickly iterating until we reach a usable API.

![MIDI Raw Data]({{site.url}}/img/midi_to_socket.png)

, and it will offer GET access to all requesters and POST access if requested from localhost (our MIDI panel is motorized). Note that web client application will eventually be able to talk to MIDI directly but as of this writing only Chrome supports MIDI connections without a plugin.



(Draft: more to come)

## <a name="Resources"></a>Resources

* [Node-RED](http://nodered.org/)
* [NoFlo](http://noflojs.org/)
* [Video: Flow-Based Programming Using JavaScript](https://www.youtube.com/watch?v=hot_0Kn-xJE)