#Giraffe : A [Graphite](http://graphite.wikidot.com) Dashboard with a long neck <img class='pull-right'
src='https://raw.github.com/kenhub/giraffe/master/img/giraffe.png' />

##Stack

Giraffe is based on a number of amazing open-source projects and libraries, to name a few:

* The [Rickshaw](http://code.shutterstock.com/rickshaw/) charting library (based on [d3](http://mbostock.github.com/d3/))
* [HTML5 Boilerplate](http://html5boilerplate.com/) and [Twitter Bootstrap](https://github.com/twitter/bootstrap)
* Written in (but does not require) [Coffeescript](http://coffeescript.org)
* Other libraries such as [jQuery](http://jquery.com), [underscore.js](http://underscorejs.org), [jQuery BBQ](http://benalman.com/projects/jquery-bbq-plugin/), [pagedown](), [{{mustache}}](https://github.com/janl/mustache.js/) and more

##Inspiration

Giraffe is heavily inspired by several existing graphite dashboards. Primarily:

* [GDash](https://github.com/ripienaar/gdash) - it uses twitter bootstrap and allows multiple dashboards to be configured. However, it requires running a sinatra server, and the graphs are pulled directly from graphite rather than rendered via a js charting library.
* [Tasseo](https://github.com/obfuscurity/tasseo) - also allows multiple dashboards, but still relies on a server component. Tasseo also uses Rickshaw, but charts only a single data series. Giraffe started as a tasseo fork, but eventually got refactored (almost) beyond recognition.
* [Graphene](https://github.com/jondot/graphene) - a d3-based relatime dashboard with different widgets. Supports a single dashboard, and its charting functionality is not as extensive as with Richshaw.

##Why another dashboard?

Because we wanted to create a dashboard that has all the benefits and none of the downsides of the other dashboards. And because it was interesting to try something new. Giraffe is not necessarily better than any of those solutions. It's a different animal. It has an interesting pattern and a funny face.

##Benefits

* **No server required** - Giraffe can be installed on any server, or even run from a folder. Just copy the files and you're done.
* **Beautiful, real-time visualization** - using Rickshaw to create visually appealing, interactive charts.
* **Flexible** - supports many dashboards, different metrics, annotations, colour schemes, time intervals, summary options, CSS and more.
* **Easy to use** - configuration is done from one (javascript) file with a reasonbly clear and documented options. You
  don't even need to know javascript to configure it, but it's not very tolerant to typos or missing commas.

##Issues

* There's no such thing as a free lunch
* Consequently, when adding many metrics to a single dashboard, and particularly when metrics have many data points and
  series, the experience might get sluggish. With great power comes great responsibility. Design your dashboards with care.

## Development

Feedback, suggestions and bug reports are most welcome. But of course code speaks louder than words. Feel free to make
contributions via pull requests on github.

The core code lives in `js/src/giraffe.coffee`.
Since the `dashboards.js` configuration needs easy access to everything inside `giraffe.js`, please compile the coffeescript
using the `--bare` option.

##WHo is behind Giraffe?

Giraffe was developed at [kenHub](https://www.kenhub.com). We are not much of techie startup, but we hope to build the
best tools for learning anatomy and medicine online. To do that, we wanted to be able to measure our application,
user-engagement and many other aspects. We could have used a 3rd party service, but it was more fun to build our own.
It's also a chance to contribute to the open source community, which we love so much.

##License
Giraffe is distributed under the MIT license. All 3rd party libraries and components are distributed under their
respective license terms.

The Giraffe icon and image were produced using Rickshaw :)

```
Copyright (C) 2012 kenHub GmbH

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit
persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```

##More?

Check out the different demo dashboards for more information about making your own giraffe awesome.
