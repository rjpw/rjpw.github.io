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

One solution that seems popular in the IoT community is *flow-based programming* as exemplified by [Node-RED](http://nodered.org/), an open source project from IBM Emerging Technologies. Node-RED and similar projects (see [Resources](#Resources) at the end of this article) offers a number of advantages in API design over *mock*-based strategies or rapidly coding an API prototype from scratch, not the least of which is an interactive visual formalism of programmatic data flows.

## Forces

* Co-evolving server and client architecture or API
* Need for user validation of designs that goes beyond Wizard-of-Oz approaches
* Value in a self-describing architecture with a visual representation
* Need for rapid and moderately high-fidelity emulation of an actual resource

## Example - RESTful API for a MIDI Fader Panel

For our example, we will design two RESTful APIs: one for access to a MongoDB dataset, and another for plugin-free read/write access to a MIDI Fader Panel from a web client application (note: as of this writing only Chrome supports MIDI connections without a plugin).

(Draft: more to come)

## <a name="Resources"></a>Resources

* [Node-RED](http://nodered.org/)
* [NoFlo](http://noflojs.org/)
* [Video: Flow-Based Programming Using JavaScript](https://www.youtube.com/watch?v=hot_0Kn-xJE)


