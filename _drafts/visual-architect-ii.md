---
title: RESTful API Prototyping - Part II
layout: post
---

## Prelude and Caveat

This is a continuation of a post on prototyping RESTful APIs using Node-RED. If you haven't read it already, please see [Part I]({% post_url 2015-2-2-visual-architect %}).

It should be repeated that there are other -- perhaps better -- ways besides a RESTful API for connecting a MIDI device to a web application. In a future post I will extend this MIDI example using web sockets, but the please note that the central purpose of this discussion is not to demonstrate an ideal solution but rather to demonstrate the value of API prototyping using visual tools.

## RESTful MIDI API

If we want to start off with the default node types defined by Node-RED, we can wrap the midi test code from Part I in a bi-directional UDP facade, then sneak the whole thing into Node-RED's global context. Here is the updated script called "midiforwarder.js".

Lines 12 and 13 open the MIDI device for input and output. If your device is on a different port you can change that on line 3. Lines 15-18 forward MIDI messages to a UDP port that we can put into our visual workflow. Lines 20-22 will let define a UDP node that ultimately writes to the MIDI device. You may notice a distinct lack of error checking here. We will be handling that responsibility in the visual editor.

{% highlight javascript linenos=table %}
var dgram = require('dgram')
  , midi = require('midi')
  , midiPort = 1
  , fromMidi = new midi.input()
  , toMidi = new midi.output()
  , host = 'localhost'
  , workflowInput = dgram.createSocket("udp4")
  , workflowOutput = dgram.createSocket("udp4")
  , workflowInputPort = 41234   // UDP ports chosen arbitrarily. If these are
  , workflowOutputPort = 41235; // taken on your system then modify as needed.

fromMidi.openPort(midiPort);
toMidi.openPort(midiPort);

fromMidi.on('message', function (dt, msg) {
  var buf = new Buffer(msg);
  workflowInput.send(buf, 0, buf.length, workflowInputPort, host);
});

workflowOutput.on('message', function (buf, sender) {
  toMidi.sendMessage([ buf[0], buf[1], buf[2] ]);
});

workflowOutput.bind(workflowOutputPort, host);
{% endhighlight %}


You could just run this as a stand-alone NodeJS script, but if you want Node-RED to launch it on startup, you will first have to add the NPM project called "midi" to the Node-RED project, which you can do with the command:

{% highlight console %}
npm install midi
{% endhighlight %}

Then you would add our MIDI UDP forwarder into Node-RED by including a little snippet (line 6 below) in the *functionGlobalContext* property of the Node-RED file "settings.js". Note: I like to keep my code out of the Node-RED folder, hence the "../protos/" relative path.

Once you have made this change to the settings file you will have to restart Node-RED.

{% highlight javascript linenos=table %}
module.exports = {

  // [... snipped out my settings ...]

  functionGlobalContext: {
    midiforwarder: require('../protos/midiforwarder')
  }

}
{% endhighlight %}

Let's start by writing some values to our MIDI device, a [Behringer USB/MIDI Controller](http://www.behringer.com/EN/Products/BCF2000.aspx). We'll use an *Inject* node to emit a signal when we click on it with the mouse, and then connect that node to a function node that produces a random MIDI instruction like this:

{% highlight javascript %}
function randomInt(min, max) {
  return Math.floor( Math.random() * (max - min + 1) + min );
}

msg.payload = new Buffer([
  176,                 // Our MIDI command is a constant.
  randomInt(81, 88),   // The Behringer's faders are numbered 81 to 88
  randomInt(0, 127)    // Allowed fader values run from 0 to 127
]);

return msg;
{% endhighlight %}

Finally we wire that up to a UDP output node configured like this:

![MIDI Out]({{site.url}}/img/midi_out.png)

