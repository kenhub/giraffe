// Example Demo dashboards in externally included JavaScript file
// To enable: set dashboard_groups to include "demos"

// Required starting line for externally included files
dashboard_data.push({
  "name": "demos",
  // optionally specify Graphite URL (e.g. http://graphite.example.com) per file
  // or leave global value in dashboards.js and skip this
  "graphite_url": "demo",
  "dashboards":
[
  { "name": "Demo",  // give your dashboard a name (required!)
    "refresh": 5000,  // each dashboard has its own refresh interval (in ms)
    // add an (optional) dashboard description. description can be written in markdown / html.
    "description": "#Giraffe : A [Graphite](http://graphite.wikidot.com) Dashboard with a long neck <img class='pull-right' src='img/giraffe.png' />"
                +"\n"
                +"\n<br/>"
                +"\n<a class='btn btn-large btn-warning' href='https://github.com/kenhub/giraffe'><i class='icon-github icon-large'></i> View project on github</a>"
                +"\n"
                +"\n##More?"
                +"\n"
                +"\nCheck out the different dashboards for more information about riding giraffes."
                ,
    "metrics":  // metrics is an array of charts on the dashboard
    [
      {
        "alias": "signups",  // display name for this metric
        "target": "sumSeries(enter.your.graphite.metrics.here)",  // enter your graphite barebone target expression here
        "description": "New signups to the website",  // enter your metric description here
        "summary": "sum",  // available options: [sum|min|max|avg|last|<function>]
      },
      {
        "alias": "signup breakdown",
        "targets": ["sumSeries(enter.your.graphite.metrics.here)",  // targets array is also supported
                    "sumSeries(enter.another.graphite.metrics)"],   // see below for more advanced usage
        "description": "signup breakdown based on site location",
        "renderer": "area",  // use any rickshaw-supported renderer
        "unstack": true  // other parameters like unstack, interpolation, stroke are also available (see rickshaw documentation for more info)
      },
      {
        "alias": "Registration breakdown",
        "target": "sumSeries(enter.your.graphite.metrics.here)", 
        // target can use a javascript function. This allows using dynamic parameters (e.g. period). See a few functions
        // at the bottom of this file.
        "target": function() { return 'summarize(events.registration.success,"' + entire_period() + 'min)' },
        "renderer": "bar",
        "description": "Registrations based on channel",
      },
    ]
  },
  { "name": "Visuals",
    "refresh": 10000,
    // you can use any rickshaw supported color scheme.
    // Enter palette name as string, or an array of colors
    // (see var scheme at the bottom).
    // Schemes can be configured globally (see below), per-dashboard, or per-metric
    "scheme": "classic9",   // this is a dashboard-specific color palette
    "description": "#Visual settings <img class='pull-right' src='img/giraffe.png' />"
                +"\n"
                +"\nGiraffe is using the [Rickshaw](http://code.shutterstock.com/rickshaw/) d3 charting library."
                +"\nYou can therefore configure almost any visual aspect supported by rickshaw/d3 inside giraffe."
                +"\n"
                +"\nThis includes: [color scheme](https://github.com/shutterstock/rickshaw#rickshawcolorpalette), interpolation, [renderer](https://github.com/shutterstock/rickshaw#renderer) and more."
                +"\n"
                +"\n##Top panel"
                +"\n"
                +"\nThe top panel allows toggling between time ranges (not visible on the demo, but should work fine with graphite)."
                +"\nIt also supports toggling the legend <i class='icon-list-alt'></i>, grid <i class='icon-th'></i>"
                +"\n, X labels <i class='icon-comment'></i> and tooltips <i class='icon-remove-circle'></i>"
                +"\n"
                +"\n##<i class='icon-list-alt'></i> Legend"
                +"\n"
                +"\nClicking on the legend will show the legend under each chart. The legend includes summary information for each series, "
                +"\n &Sigma;: Total; <i class='icon-caret-down'></i>: Minimum; <i class='icon-caret-up'></i>: Maximum; and <i class='icon-sort'></i>: Average"
                +"\n"
                +"\n##Summary"
                +"\n"
                +"\nIn addition to the legend, each chart can have one `summary` value displayed next to its title."
                +"\nThe summary is calculated over the entire series and can be one of `[sum|max|min|avg|last|<function>]`"
                +"\n"
                +"\n"
                +"\n"
                ,
    "metrics": 
    [
      {
        "alias": "cpu utilization",
        "target": "aliasByNode(derivative(servers.system.cpu.*),4)",  // target can use any graphite-supported wildcards
        "annotator": 'events.deployment',  // a simple annotator will track a graphite event and mark it as 'deployment'.
                                           // enter your graphite target as a string
        "description": "cpu utilization on production (using linear interpolation). Summary displays the average across all series",
        "interpolation": "linear",  // you can use different rickshaw interpolation values
        "summary": "avg",
      },
      {
        "alias": "proc mem prod",
        "targets": ["aliasByNode(derivative(servers.system.cpu.user),4)",  // targets array can include strings, 
                                                                           // functions or dictionaries
                   {target: 'alias(derivative(servers.system.cpu.system,"system utilization")',
                    alias: 'system utilization',                           // if you use a graphite alias, specify it here
                    color: '#f00'}],                                       // you can also specify a target color this way
                                                                           // (note that these values are ignored on the demo)
        // annotator can also be a dictionary of target and description.
        // However, only one annotator is supported per-metric.
        "annotator": {'target' : 'events.deployment',
                      'description' : 'deploy'},
        "description": "main process memory usage on production (different colour scheme and interpolation)",
        "interpolation": "step-before",
        "scheme": "munin",  // this is a metric-specific color palette
      },
      {
        "alias": "sys mem prod",
        "target": "aliasByNode(derivative(servers.system.cpu.*),4)",
        "annotator": 'stats.gluteus-medius.events.deployment',
        "description": "main system memory usage on production (cardinal interpolation, line renderer)",
        "interpolation": "cardinal",
        "renderer": "line",
      },
    ]
  },
  { "name": "Setup",
    "refresh": 10000,
    "scheme": "colorwheel",
    "description": "#Setup and configuration <img class='pull-right' src='img/giraffe.png' />"
                +"\n"
                +"\n##Installation"
                +"\n"
                +"\nTo install giraffe, simply [download](https://github.com/kenhub/giraffe/archive/master.zip) the code and run it from your browser."
                +"\nYou can put it on any type of web server, and also open the `index.html` file from your local drive."
                +"\n"
                +"\n##Authentication"
                +"\n"
                +"\nGiraffe uses JSONP to retrieve the data from your graphite server. It should work out of the box, unless you"
                +"\nhave setup authentication. Basic authentication seems to work in Firefox (it will prompt you), "
                +"\nbut with Chrome you might need to authenticate to your graphite server first, and then access Giraffe."
                +"\n"
                +"\n##Configuration"
                +"\n"
                +"\nThe main configuration for all dashboards is found in `dashboards.js`. The file is reasonably self-explanatory, "
                +"\nso please take a look."
                +"\n"
                +"\nIf you need to change the page layout, CSS, or add/remove a time period, you can also edit `index.html` and `css/main.css` file."
                +"\n"
                ,
    "metrics": 
    [
      {
        "alias": "production HTTP req",
        "target": "aliasByNode(derivative(servers.gluteus-medius.Http.http_response_rates.*),4)",
        "renderer": "bar",
        "interpolation": "cardinal",
        "summary": "last",
      },
    ]
  },
],
// optionally specify color scheme for this file
// or leave global value in dashboards.js and skip this
"scheme": [
  '#423d4f',
  '#4a6860',
  '#848f39',
  '#a2b73c',
  '#ddcb53',
  '#c5a32f',
  '#7d5836',
  '#963b20',
  '#7c2626',
].reverse()
});

