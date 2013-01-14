// Generated by CoffeeScript 1.4.0
var auth, changeDashboard, createGraph, dashboard, dataPoll, default_period, description, generateDataURL, generateEventsURL, generateGraphiteTargets, getTargetColor, graphScaffold, graphs, init, metrics, period, refresh, refreshSummary, refreshTimer, scheme, toggleCss, _avg, _formatBase1024KMGTP, _max, _min, _sum;

default_period = 1440;

if (scheme === void 0) {
  scheme = 'classic9';
}

period = default_period;

dashboard = dashboards[0];

metrics = dashboard['metrics'];

description = dashboard['description'];

refresh = dashboard['refresh'];

refreshTimer = null;

auth = auth != null ? auth : false;

graphs = [];

dataPoll = function() {
  var graph, _i, _len, _results;
  _results = [];
  for (_i = 0, _len = graphs.length; _i < _len; _i++) {
    graph = graphs[_i];
    _results.push(graph.refreshGraph(period));
  }
  return _results;
};

_sum = function(series) {
  return _.reduce(series, (function(memo, val) {
    return memo + val;
  }), 0);
};

_avg = function(series) {
  return _sum(series) / series.length;
};

_max = function(series) {
  return _.reduce(series, (function(memo, val) {
    if (memo === null) {
      return val;
    }
    if (val > memo) {
      return val;
    }
    return memo;
  }), null);
};

_min = function(series) {
  return _.reduce(series, (function(memo, val) {
    if (memo === null) {
      return val;
    }
    if (val < memo) {
      return val;
    }
    return memo;
  }), null);
};

_formatBase1024KMGTP = function(y, formatter) {
  var abs_y;
  if (formatter == null) {
    formatter = d3.format(".2r");
  }
  abs_y = Math.abs(y);
  if (abs_y >= 1125899906842624) {
    return formatter(y / 1125899906842624) + "P";
  } else if (abs_y >= 1099511627776) {
    return formatter(y / 1099511627776) + "T";
  } else if (abs_y >= 1073741824) {
    return formatter(y / 1073741824) + "G";
  } else if (abs_y >= 1048576) {
    return formatter(y / 1048576) + "M";
  } else if (abs_y >= 1024) {
    return formatter(y / 1024) + "K";
  } else if (abs_y < 1 && y > 0) {
    return formatter(y);
  } else if (abs_y === 0) {
    return 0;
  } else {
    return formatter(y);
  }
};

refreshSummary = function(graph) {
  var summary_func, y_data, _ref;
  if (!((_ref = graph.args) != null ? _ref.summary : void 0)) {
    return;
  }
  if (graph.args.summary === "sum") {
    summary_func = _sum;
  }
  if (graph.args.summary === "avg") {
    summary_func = _avg;
  }
  if (graph.args.summary === "min") {
    summary_func = _min;
  }
  if (graph.args.summary === "max") {
    summary_func = _max;
  }
  if (graph.args.summary === "last") {
    summary_func = _.last;
  }
  if (typeof graph.args.summary === "function") {
    summary_func = graph.args.summary;
  }
  if (!summary_func) {
    console.log("unknown summary function " + graph.args.summary);
  }
  y_data = _.map(_.flatten(_.pluck(graph.graph.series, 'data')), function(d) {
    return d.y;
  });
  return $("" + graph.args.anchor + " .graph-summary").html(_formatBase1024KMGTP(summary_func(y_data)));
};

graphScaffold = function() {
  var context, converter, graph_template, i, metric, _i, _len;
  graph_template = "{{#dashboard_description}}\n    <div class=\"well\">{{{dashboard_description}}}</div>\n{{/dashboard_description}}\n{{#metrics}}\n  {{#start_row}}\n  <div class=\"row-fluid\">\n  {{/start_row}}\n    <div class=\"span4\" id=\"graph-{{graph_id}}\">\n      <h2>{{metric_alias}} <span class=\"pull-right graph-summary\"><span></h2>\n      <div class=\"chart\"></div>\n      <div class=\"timeline\"></div>\n      <p>{{metric_description}}</p>\n      <div class=\"legend\"></div>\n    </div>\n  {{#end_row}}\n  </div>\n  {{/end_row}}\n{{/metrics}}";
  $('#graphs').empty();
  context = {
    metrics: []
  };
  converter = new Markdown.Converter();
  if (description) {
    context['dashboard_description'] = converter.makeHtml(description);
  }
  for (i = _i = 0, _len = metrics.length; _i < _len; i = ++_i) {
    metric = metrics[i];
    context['metrics'].push({
      start_row: i % 3 === 0,
      end_row: i % 3 === 2,
      graph_id: i,
      metric_alias: metric.alias,
      metric_description: metric.description
    });
  }
  return $('#graphs').append(Mustache.render(graph_template, context));
};

init = function() {
  var dash, i, metric, refreshInterval, _i, _j, _len, _len1;
  $('.dropdown-menu').empty();
  for (_i = 0, _len = dashboards.length; _i < _len; _i++) {
    dash = dashboards[_i];
    $('.dropdown-menu').append("<li><a href=\"#\">" + dash.name + "</a></li>");
  }
  graphScaffold();
  graphs = [];
  for (i = _j = 0, _len1 = metrics.length; _j < _len1; i = ++_j) {
    metric = metrics[i];
    graphs.push(createGraph("#graph-" + i, metric));
  }
  $('.page-header h1').empty().append(dashboard.name);
  refreshInterval = refresh || 10000;
  if (refreshTimer) {
    clearInterval(refreshTimer);
  }
  return refreshTimer = setInterval(dataPoll, refreshInterval);
};

getTargetColor = function(targets, target) {
  var t, _i, _len;
  if (typeof targets !== 'object') {
    return;
  }
  for (_i = 0, _len = targets.length; _i < _len; _i++) {
    t = targets[_i];
    if (!t.color) {
      continue;
    }
    if (t.target === target || t.alias === target) {
      return t.color;
    }
  }
};

generateGraphiteTargets = function(targets) {
  var graphite_targets, target, _i, _len;
  if (typeof targets === "string") {
    return "&target=" + targets;
  }
  if (typeof targets === "function") {
    return "&target=" + (targets());
  }
  graphite_targets = "";
  for (_i = 0, _len = targets.length; _i < _len; _i++) {
    target = targets[_i];
    if (typeof target === "string") {
      graphite_targets += "&target=" + target;
    }
    if (typeof target === "function") {
      graphite_targets += "&target=" + (target());
    }
    if (typeof target === "object") {
      graphite_targets += "&target=" + ((target != null ? target.target : void 0) || '');
    }
  }
  return graphite_targets;
};

generateDataURL = function(targets, annotator_target) {
  var data_targets;
  annotator_target = annotator_target ? "&target=" + annotator_target : "";
  data_targets = generateGraphiteTargets(targets);
  return "" + graphite_url + "/render?from=-" + period + "minutes&" + data_targets + annotator_target + "&format=json&jsonp=?";
};

generateEventsURL = function(event_tags) {
  var jsonp, tags;
  tags = event_tags === '*' ? '' : "&tags=" + event_tags;
  jsonp = window.json_fallback ? '' : "&jsonp=?";
  return "" + graphite_url + "/events/get_data?from=-" + period + "minutes" + tags + jsonp;
};

createGraph = function(anchor, metric) {
  var graph, graph_provider, _ref, _ref1;
  if (graphite_url === 'demo') {
    graph_provider = Rickshaw.Graph.Demo;
  } else {
    graph_provider = Rickshaw.Graph.JSONP.Graphite;
  }
  return graph = new graph_provider({
    anchor: anchor,
    targets: metric.target || metric.targets,
    summary: metric.summary,
    scheme: metric.scheme || dashboard.scheme || scheme || 'classic9',
    annotator_target: ((_ref = metric.annotator) != null ? _ref.target : void 0) || metric.annotator,
    annotator_description: ((_ref1 = metric.annotator) != null ? _ref1.description : void 0) || 'deployment',
    events: metric.events,
    element: $("" + anchor + " .chart")[0],
    width: $("" + anchor + " .chart").width(),
    height: metric.height || 300,
    min: metric.min || 0,
    max: metric.max,
    renderer: metric.renderer || 'area',
    interpolation: metric.interpolation || 'step-before',
    unstack: metric.unstack,
    stroke: metric.stroke === false ? false : true,
    dataURL: generateDataURL(metric.target || metric.targets),
    onRefresh: function(transport) {
      return refreshSummary(transport);
    },
    onComplete: function(transport) {
      var detail, shelving, xAxis, yAxis;
      graph = transport.graph;
      xAxis = new Rickshaw.Graph.Axis.Time({
        graph: graph
      });
      xAxis.render();
      yAxis = new Rickshaw.Graph.Axis.Y({
        graph: graph,
        tickFormat: function(y) {
          return _formatBase1024KMGTP(y);
        },
        ticksTreatment: 'glow'
      });
      yAxis.render();
      detail = new Rickshaw.Graph.HoverDetail({
        graph: graph,
        yFormatter: function(y) {
          return _formatBase1024KMGTP(y);
        }
      });
      $("" + anchor + " .legend").empty();
      this.legend = new Rickshaw.Graph.Legend({
        graph: graph,
        element: $("" + anchor + " .legend")[0]
      });
      shelving = new Rickshaw.Graph.Behavior.Series.Toggle({
        graph: graph,
        legend: this.legend
      });
      if (metric.annotator || metric.events) {
        this.annotator = new GiraffeAnnotate({
          graph: graph,
          element: $("" + anchor + " .timeline")[0]
        });
      }
      return refreshSummary(this);
    }
  });
};

Rickshaw.Graph.JSONP.Graphite = Rickshaw.Class.create(Rickshaw.Graph.JSONP, {
  request: function() {
    return this.refreshGraph(period);
  },
  refreshGraph: function(period) {
    var deferred,
      _this = this;
    deferred = this.getAjaxData(period);
    return deferred.done(function(result) {
      var annotations, el, i, result_data, series, _i, _len;
      if (result.length <= 0) {
        return;
      }
      result_data = _.filter(result, function(el) {
        var _ref;
        return el.target !== ((_ref = _this.args.annotator_target) != null ? _ref.replace(/["']/g, '') : void 0);
      });
      result_data = _this.preProcess(result_data);
      if (!_this.graph) {
        _this.success(_this.parseGraphiteData(result_data));
      }
      series = _this.parseGraphiteData(result_data);
      if (_this.args.annotator_target) {
        annotations = _this.parseGraphiteData(_.filter(result, function(el) {
          return el.target === _this.args.annotator_target.replace(/["']/g, '');
        }));
      }
      for (i = _i = 0, _len = series.length; _i < _len; i = ++_i) {
        el = series[i];
        _this.graph.series[i].data = el.data;
        _this.addTotals(i);
      }
      _this.graph.renderer.unstack = _this.args.unstack;
      _this.graph.render();
      if (_this.args.events) {
        deferred = _this.getEvents(period);
        deferred.done(function(result) {
          return _this.addEventAnnotations(result);
        });
      }
      _this.addAnnotations(annotations, _this.args.annotator_description);
      return _this.args.onRefresh(_this);
    });
  },
  addTotals: function(i) {
    var avg, label, max, min, series_data, sum;
    label = $(this.legend.lines[i].element).find('span.label').text();
    $(this.legend.lines[i].element).find('span.totals').remove();
    series_data = _.map(this.legend.lines[i].series.data, function(d) {
      return d.y;
    });
    sum = _formatBase1024KMGTP(_sum(series_data));
    max = _formatBase1024KMGTP(_max(series_data));
    min = _formatBase1024KMGTP(_min(series_data));
    avg = _formatBase1024KMGTP(_avg(series_data));
    return $(this.legend.lines[i].element).append("<span class='totals pull-right'> &Sigma;: " + sum + " <i class='icon-caret-down'></i>: " + min + " <i class='icon-caret-up'></i>: " + max + " <i class='icon-sort'></i>: " + avg + "</span>");
  },
  preProcess: function(result) {
    var item, _i, _len;
    for (_i = 0, _len = result.length; _i < _len; _i++) {
      item = result[_i];
      if (item.datapoints.length === 1) {
        item.datapoints[0][1] = 0;
        if (this.args.unstack) {
          item.datapoints.push([0, 1]);
        } else {
          item.datapoints.push([item.datapoints[0][0], 1]);
        }
      }
      if (item.datapoints.length > 1 && !item.datapoints[item.datapoints.length - 1][0]) {
        item.datapoints[item.datapoints.length - 1][0] = item.datapoints[item.datapoints.length - 2][0];
      }
    }
    return result;
  },
  parseGraphiteData: function(d) {
    var palette, rev_xy, targets;
    rev_xy = function(datapoints) {
      return _.map(datapoints, function(point) {
        return {
          'x': point[1],
          'y': point[0] || 0
        };
      });
    };
    palette = new Rickshaw.Color.Palette({
      scheme: this.args.scheme
    });
    targets = this.args.target || this.args.targets;
    d = _.map(d, function(el) {
      var color, _ref;
      if ((_ref = typeof targets) === "string" || _ref === "function") {
        color = palette.color();
      } else {
        color = getTargetColor(targets, el.target) || palette.color();
      }
      return {
        "color": color,
        "name": el.target,
        "data": rev_xy(el.datapoints)
      };
    });
    Rickshaw.Series.zeroFill(d);
    return d;
  },
  addEventAnnotations: function(events_json) {
    var active_annotation, event, _i, _len, _ref, _ref1;
    if (!events_json) {
      return;
    }
    this.annotator || (this.annotator = new GiraffeAnnotate({
      graph: this.graph,
      element: $("" + this.args.anchor + " .timeline")[0]
    }));
    this.annotator.data = {};
    $(this.annotator.elements.timeline).empty();
    active_annotation = $(this.annotator.elements.timeline).parent().find('.annotation_line.active').size() > 0;
    if ((_ref = $(this.annotator.elements.timeline).parent()) != null) {
      _ref.find('.annotation_line').remove();
    }
    for (_i = 0, _len = events_json.length; _i < _len; _i++) {
      event = events_json[_i];
      this.annotator.add(event.when, "" + event.what + " " + (event.data || ''));
    }
    this.annotator.update();
    if (active_annotation) {
      return (_ref1 = $(this.annotator.elements.timeline).parent()) != null ? _ref1.find('.annotation_line').addClass('active') : void 0;
    }
  },
  addAnnotations: function(annotations, description) {
    var annotation_timestamps, _ref;
    if (!annotations) {
      return;
    }
    annotation_timestamps = _((_ref = annotations[0]) != null ? _ref.data : void 0).filter(function(el) {
      return el.y !== 0 && el.y !== null;
    });
    return this.addEventAnnotations(_.map(annotation_timestamps, function(a) {
      return {
        when: a.x,
        what: description
      };
    }));
  },
  getEvents: function(period) {
    var deferred,
      _this = this;
    this.period = period;
    return deferred = $.ajax({
      dataType: 'json',
      url: generateEventsURL(this.args.events),
      error: function(xhr, textStatus, errorThrown) {
        if (textStatus === 'parsererror' && /was not called/.test(errorThrown.message)) {
          window.json_fallback = true;
          return _this.refreshGraph(period);
        } else {
          return console.log("error loading eventsURL: " + generateEventsURL(_this.args.events));
        }
      }
    });
  },
  getAjaxData: function(period) {
    var deferred;
    this.period = period;
    return deferred = $.ajax({
      dataType: 'json',
      url: generateDataURL(this.args.targets, this.args.annotator_target),
      error: this.error.bind(this)
    });
  }
});

Rickshaw.Graph.Demo = Rickshaw.Class.create(Rickshaw.Graph.JSONP.Graphite, {
  success: function(data) {
    var i, palette, _i;
    palette = new Rickshaw.Color.Palette({
      scheme: this.args.scheme
    });
    this.seriesData = [[], [], [], [], [], [], [], [], []];
    this.random = new Rickshaw.Fixtures.RandomData(period / 60 + 10);
    for (i = _i = 0; _i <= 60; i = ++_i) {
      this.random.addData(this.seriesData);
    }
    this.graph = new Rickshaw.Graph({
      element: this.args.element,
      width: this.args.width,
      height: this.args.height,
      min: this.args.min,
      max: this.args.max,
      renderer: this.args.renderer,
      interpolation: this.args.interpolation,
      stroke: this.args.stroke,
      series: [
        {
          color: palette.color(),
          data: this.seriesData[0],
          name: 'Moscow'
        }, {
          color: palette.color(),
          data: this.seriesData[1],
          name: 'Shanghai'
        }, {
          color: palette.color(),
          data: this.seriesData[2],
          name: 'Amsterdam'
        }, {
          color: palette.color(),
          data: this.seriesData[3],
          name: 'Paris'
        }, {
          color: palette.color(),
          data: this.seriesData[4],
          name: 'Tokyo'
        }, {
          color: palette.color(),
          data: this.seriesData[5],
          name: 'London'
        }, {
          color: palette.color(),
          data: this.seriesData[6],
          name: 'New York'
        }
      ]
    });
    this.graph.renderer.unstack = this.args.unstack;
    this.graph.render();
    return this.onComplete(this);
  },
  refreshGraph: function(period) {
    var i, _i, _ref, _results;
    if (!this.graph) {
      return this.success();
    } else {
      this.random.addData(this.seriesData);
      this.random.addData(this.seriesData);
      _.each(this.seriesData, function(d) {
        return d.shift();
      });
      this.args.onRefresh(this);
      this.graph.render();
      _results = [];
      for (i = _i = 0, _ref = this.graph.series.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        _results.push(this.addTotals(i));
      }
      return _results;
    }
  }
});

/*
#   Events and interaction
*/


$('.dropdown-menu').on('click', 'a', function() {
  changeDashboard($(this).text());
  $('.dropdown').removeClass('open');
  return false;
});

changeDashboard = function(dash_name) {
  dashboard = _.where(dashboards, {
    name: dash_name
  })[0] || dashboards[0];
  description = dashboard['description'];
  metrics = dashboard['metrics'];
  refresh = dashboard['refresh'];
  init();
  return $.bbq.pushState({
    dashboard: dashboard.name
  });
};

$('.timepanel').on('click', 'a.range', function() {
  var dash, timeFrame, _ref;
  if (graphite_url === 'demo') {
    changeDashboard(dashboard.name);
  }
  period = $(this).attr('data-timeframe') || default_period;
  dataPoll();
  timeFrame = $(this).attr('href').replace(/^#/, '');
  dash = (_ref = $.bbq.getState()) != null ? _ref.dashboard : void 0;
  $.bbq.pushState({
    timeFrame: timeFrame,
    dashboard: dash || dashboard.name
  });
  $(this).parent('.btn-group').find('a').removeClass('active');
  $(this).addClass('active');
  return false;
});

toggleCss = function(css_selector) {
  if ($.rule(css_selector).text().match('display: ?none')) {
    return $.rule(css_selector, 'style').remove();
  } else {
    return $.rule("" + css_selector + " {display:none;}").appendTo('style');
  }
};

$('#legend-toggle').on('click', function() {
  $(this).toggleClass('active');
  $('.legend').toggle();
  return false;
});

$('#axis-toggle').on('click', function() {
  $(this).toggleClass('active');
  toggleCss('.y_grid');
  toggleCss('.y_ticks');
  toggleCss('.x_tick');
  return false;
});

$('#x-label-toggle').on('click', function() {
  toggleCss('.rickshaw_graph .detail .x_label');
  $(this).toggleClass('active');
  return false;
});

$('#x-item-toggle').on('click', function() {
  toggleCss('.rickshaw_graph .detail .item.active');
  $(this).toggleClass('active');
  return false;
});

$(window).bind('hashchange', function(e) {
  var dash, timeFrame, _ref, _ref1;
  timeFrame = ((_ref = e.getState()) != null ? _ref.timeFrame : void 0) || $(".timepanel a.range[data-timeframe='" + default_period + "']")[0].text || "1d";
  dash = (_ref1 = e.getState()) != null ? _ref1.dashboard : void 0;
  if (dash !== dashboard.name) {
    changeDashboard(dash);
  }
  return $('.timepanel a.range[href="#' + timeFrame + '"]').click();
});

$(function() {
  $(window).trigger('hashchange');
  return init();
});
