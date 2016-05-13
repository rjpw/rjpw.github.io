---
title: Meteor and React
layout: post
---

I've missed Meteor, and I want to get back to using it. I know ... some people criticize Meteor for its opinionated
architecture, but I'm hoping to work my way past that. In the meantime, I'm kicking off a new post with a generated
starting point.

{% highlight console %}
  curl https://install.meteor.com/ | sh
  npm install -g yo
  npm install -g generator-meteor-react
{% endhighlight %}

You can find the generator on [npmjs](https://www.npmjs.com/package/generator-meteor-react), or go to its [Github site](https://github.com/payner35/generator-meteor-react).

I made a new app with this generator and now I'm going to kick the tires a bit. There's a lot to absorb on the first bounce, but to get it out of the way I'm going to start with (bikeshed anyone?) some style definitions. I noticed that each of the views had a .styl file, indicating that it uses the [Stylus](http://learnboost.github.io/stylus/) CSS templating languate, and that each view style also imported "nib". Take a look [here](http://tj.github.io/nib/) to get some sense of what *nib* can do.