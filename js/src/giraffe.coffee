# giraffe vars
graphite_url = graphite_url || 'demo'
default_graphite_url = graphite_url
default_period = 1440
scheme = 'classic9' if scheme is undefined
period = default_period
dashboard = dashboards[0]
metrics = dashboard['metrics']
description = dashboard['description']
refresh = dashboard['refresh']
refreshTimer = null
auth = auth ? false
graphs = []

dataPoll = ->
  for graph in graphs
    graph.refreshGraph(period)

# helper functions
_sum = (series) ->
  _.reduce(series, ((memo, val) ->
    memo + val)
    ,0)

_avg = (series) ->
  _sum(series)/series.length

_max = (series) ->
  _.reduce(series, ((memo, val) ->
    return val if memo is null
    return val if val > memo 
    return memo)
    ,null)

_min = (series) ->
  _.reduce(series, ((memo, val) ->
    return val if memo is null
    return val if val < memo 
    return memo)
    ,null)

_last = (series) ->
  _.reduce(series, ((memo, val) ->
    return val if val != null
    return memo)
    ,null)

_formatBase1024KMGTP = (y, formatter = d3.format(".2r")) ->
  abs_y = Math.abs(y)
  if abs_y >= 1125899906842624   then return formatter(y / 1125899906842624) + "P"
  else if abs_y >= 1099511627776 then return formatter(y / 1099511627776) + "T"
  else if abs_y >= 1073741824    then return formatter(y / 1073741824) + "G"
  else if abs_y >= 1048576       then return formatter(y / 1048576) + "M"
  else if abs_y >= 1024          then return formatter(y / 1024) + "K"
  else if abs_y < 1 && y > 0     then return formatter(y)
  else if abs_y == 0             then return 0
  else                           return formatter(y)

# updates the graph summary value (if any)
# summary options: [sum|avg|min|max|last|<function>]
refreshSummary = (graph) ->
  return unless graph.args?.summary
  summary_func = _sum if graph.args.summary is "sum"
  summary_func = _avg if graph.args.summary is "avg"
  summary_func = _min if graph.args.summary is "min"
  summary_func = _max if graph.args.summary is "max"
  summary_func = _last if graph.args.summary is "last"
  summary_func = graph.args.summary if typeof graph.args.summary is "function"
  console.log("unknown summary function #{graph.args.summary}") unless summary_func
  y_data = _.map(_.flatten(_.pluck(graph.graph.series, 'data')), (d) -> d.y)
  $("#{graph.args.anchor} .graph-summary").html(graph.args.summary_formatter(summary_func(y_data)))
  

# builds the HTML scaffolding for the graphs
# using a small mustache template
graphScaffold = ->
  graph_template = """
                  {{#dashboard_description}}
                      <div class="well">{{{dashboard_description}}}</div>
                  {{/dashboard_description}}
                  {{#metrics}}
                    {{#start_row}}
                    <div class="row-fluid">
                    {{/start_row}}
                      <div class="{{span}}" id="graph-{{graph_id}}">
                        <h2>{{metric_alias}} <span class="pull-right graph-summary"><span></h2>
                        <div class="chart"></div>
                        <div class="timeline"></div>
                        <p>{{metric_description}}</p>
                        <div class="legend"></div>
                      </div>
                    {{#end_row}}
                    </div>
                    {{/end_row}}
                  {{/metrics}}"""

  $('#graphs').empty()
  context = {metrics: []}
  converter = new Markdown.Converter()
  context['dashboard_description'] = converter.makeHtml(description) if description
  offset = 0
  for metric, i in metrics
    colspan = if metric.colspan? then metric.colspan else 1
    context['metrics'].push
      start_row: offset % 3 is 0
      end_row: offset % 3 is 2
      graph_id: i
      span: 'span' + (4 * colspan)
      metric_alias: metric.alias
      metric_description: metric.description
    offset += colspan
  $('#graphs').append Mustache.render(graph_template, context)

init = ->
  $('.dropdown-menu').empty()
  for dash in dashboards
    $('.dropdown-menu').append("<li><a href=\"#\">#{dash.name}</a></li>")

  graphScaffold()

  graphs = []
  for metric, i in metrics
    graphs.push createGraph("#graph-#{i}", metric)
  $('.page-header h1').empty().append(dashboard.name)
  # auto refresh
  refreshInterval = refresh || 10000
  clearInterval(refreshTimer) if refreshTimer
  refreshTimer = setInterval(dataPoll, refreshInterval)

getTargetColor = (targets, target) ->
  return unless typeof targets is 'object'
  for t in targets
    continue unless t.color
    if t.target == target or t.alias == target
      return t.color

getTargetRenderer = (targets, target) ->
  return unless typeof targets is 'object'
  for t in targets
    continue unless t.renderer
    if t.target == target or t.alias == target
      return t.renderer

generateGraphiteTargets = (targets) ->
  # checking if single target (string) or a function
  if typeof targets is "string" then return "&target=#{targets}"
  if typeof targets is "function" then return "&target=#{targets()}"
  # handling multiple targets
  graphite_targets = ""
  for target in targets
    graphite_targets += "&target=#{target}" if typeof target is "string"
    graphite_targets += "&target=#{target()}" if typeof target is "function"
    graphite_targets += "&target=#{target?.target || ''}" if typeof target is "object"
  return graphite_targets

# generate a URL to retrieve data from graphite
generateDataURL= (targets, annotator_target, max_data_points) ->
  annotator_target = if annotator_target then "&target=#{annotator_target}" else ""
  data_targets = generateGraphiteTargets(targets)
  "#{graphite_url}/render?from=-#{period}minutes&#{data_targets}#{annotator_target}&maxDataPoints=#{max_data_points}&format=json&jsonp=?"

# generate a URL to retrieve events from graphite
generateEventsURL= (event_tags) ->
  tags = if event_tags is '*' then '' else "&tags=#{event_tags}"
  jsonp = if window.json_fallback then '' else "&jsonp=?"
  "#{graphite_url}/events/get_data?from=-#{period}minutes#{tags}#{jsonp}"


# builds a graph object
createGraph = (anchor, metric) ->
 
  if graphite_url == 'demo'
    graph_provider = Rickshaw.Graph.Demo
  else
    graph_provider = Rickshaw.Graph.JSONP.Graphite
  unstackable = metric.renderer in ['line', 'scatterplot']
  graph = new graph_provider
    anchor: anchor
    targets: metric.target || metric.targets
    summary: metric.summary
    summary_formatter: metric.summary_formatter || _formatBase1024KMGTP
    totals_formatter: metric.totals_formatter || _formatBase1024KMGTP
    totals_fields: metric.totals_fields || ["sum", "min", "max", "avg"]
    scheme: metric.scheme || dashboard.scheme || scheme || 'classic9'
    annotator_target: metric.annotator?.target || metric.annotator
    annotator_description: metric.annotator?.description || 'deployment'
    events: metric.events
    element: $("#{anchor} .chart")[0]
    width: $("#{anchor} .chart").width()
    height: metric.height || 300
    min: if metric.min is undefined then 'auto' else metric.min
    max: metric.max
    null_as: if metric.null_as is undefined then null else metric.null_as
    renderer: metric.renderer || 'area'
    interpolation: metric.interpolation || 'step-before'
    unstack: if metric.unstack is undefined then unstackable else metric.unstack
    stroke: if metric.stroke is false then false else true
    stroke_fn: metric.stroke if typeof metric.stroke is "function"
    strokeWidth: metric.stroke_width
    dataURL: generateDataURL(metric.target || metric.targets)
    onRefresh: (transport) ->
      refreshSummary(transport)
    onComplete: (transport) ->
      graph = transport.graph
      # graph.onUpdate(addAnotations)
      xAxis = new Rickshaw.Graph.Axis.Time
        graph: graph
      xAxis.render()
      yAxis = new Rickshaw.Graph.Axis.Y
        graph: graph
        tickFormat: metric.tick_formatter || (y) -> _formatBase1024KMGTP(y)
        ticksTreatment: 'glow'
      yAxis.render()
        # element: $("#{anchor} .y-axis")[0]
      hover_formatter = metric.hover_formatter || _formatBase1024KMGTP
      detail = new Rickshaw.Graph.HoverDetail
        graph: graph
        yFormatter: (y) -> hover_formatter(y)
      # a bit of an ugly hack, but some times onComplete
      # seems to be called twice, generating duplicate legend
      $("#{anchor} .legend").empty()
      @legend = new Rickshaw.Graph.Legend
        graph: graph
        element: $("#{anchor} .legend")[0]
      shelving = new Rickshaw.Graph.Behavior.Series.Toggle
        graph: graph
        legend: @legend
      if metric.annotator or metric.events
        @annotator = new GiraffeAnnotate
          graph: graph
          element: $("#{anchor} .timeline")[0]
      refreshSummary(@)

  
Rickshaw.Graph.JSONP.Graphite = Rickshaw.Class.create(Rickshaw.Graph.JSONP,
  request: ->
    @refreshGraph(period)

  refreshGraph: (period) ->

    deferred = @getAjaxData(period)
    deferred.done (result) =>
      return if result.length <= 0
      result_data = _.filter(result, (el) =>
        el.target != @args.annotator_target?.replace(/["']/g, ''))
      result_data = @preProcess(result_data)
      # success is called once to build the initial graph
      @success(@parseGraphiteData(result_data, @args.null_as)) if not @graph
      series = @parseGraphiteData(result_data, @args.null_as)
      annotations = @parseGraphiteData(_.filter(result, (el) =>
        el.target == @args.annotator_target.replace(/["']/g, '')), @args.null_as) if @args.annotator_target
      for el, i in series
        @graph.series[i].data = el.data
        @addTotals(i)
      @graph.renderer.unstack = @args.unstack
      @graph.render()
      # adding event annotations if events are specified
      if @args.events
        deferred = @getEvents(period)
        deferred.done (result) =>
          @addEventAnnotations(result)
      @addAnnotations(annotations, @args.annotator_description)
      @args.onRefresh(@)

  addTotals: (i) ->
    label = $(@legend.lines[i].element).find('span.label').text()
    $(@legend.lines[i].element).find('span.totals').remove()
    series_data = _.map(@legend.lines[i].series.data, (d) -> d.y)
    sum = @args.totals_formatter(_sum(series_data))
    max = @args.totals_formatter(_max(series_data))
    min = @args.totals_formatter(_min(series_data))
    avg = @args.totals_formatter(_avg(series_data))

    totals = "<span class='totals pull-right'>"
    totals = totals + " &Sigma;: #{sum}" if "sum" in @args.totals_fields
    totals = totals + " <i class='icon-caret-down'></i>: #{min}" if "min" in @args.totals_fields
    totals = totals + " <i class='icon-caret-up'></i>: #{max}" if "max" in @args.totals_fields
    totals = totals + " <i class='icon-sort'></i>: #{avg}" if "avg" in @args.totals_fields
    totals += "</span>"

    $(@legend.lines[i].element).append(totals)

  preProcess: (result) ->
    for item in result
      # when we get a single datapoint, we need to add another one
      # for Rickshaw to draw it properly.
      #
      # We either add zero value or repeat the same value
      # depending on whether the graph is stacked or not
      if item.datapoints.length == 1
        item.datapoints[0][1] = 0
        if @args.unstack
          item.datapoints.push [0, 1]
        else
          item.datapoints.push [item.datapoints[0][0], 1]
    result

  # parses graphite data and produces a
  # rickshaw series data structure
  parseGraphiteData: (d, null_as = null) ->

    rev_xy = (datapoints) ->
      _.map datapoints, (point) ->
        {'x': point[1], 'y': if point[0] != null then point[0] else null_as}

    palette = new Rickshaw.Color.Palette
      scheme: @args.scheme
    targets = @args.target || @args.targets
    stroke_fn = @args.stroke_fn
    d = _.map d, (el) ->
      if typeof targets in ["string", "function"]
        color = palette.color()
      else
        color = getTargetColor(targets, el.target) || palette.color()
        renderer = getTargetRenderer(targets, el.target) || 'line'
      return {
        color: color
        renderer: renderer
        stroke: stroke_fn(d3.rgb(color)) if stroke_fn?
        name: el.target
        data: rev_xy(el.datapoints)
      }
    Rickshaw.Series.zeroFill(d)
    return d

  addEventAnnotations: (events_json) ->
    return unless events_json
    @annotator ||= new GiraffeAnnotate
      graph: @graph
      element: $("#{@args.anchor} .timeline")[0]
      
    @annotator.data = {}
    $(@annotator.elements.timeline).empty()
    active_annotation = $(@annotator.elements.timeline)
                        .parent().find('.annotation_line.active').size() > 0
    $(@annotator.elements.timeline).parent()?.find('.annotation_line').remove()
    for event in events_json
      @annotator.add(event.when, "#{event.what} #{event.data or ''}")
    @annotator.update()
    if active_annotation
      $(@annotator.elements.timeline).parent()?.find('.annotation_line').addClass('active')

  addAnnotations: (annotations, description) ->
    return unless annotations
    annotation_timestamps = _(annotations[0]?.data).filter (el) -> el.y != 0 and el.y != null
    @addEventAnnotations _.map(annotation_timestamps, (a) -> {when: a.x, what: description})

  getEvents: (period) ->
    @period = period
    deferred = $.ajax
      dataType: 'json'
      url: generateEventsURL(@args.events)
      error: (xhr, textStatus, errorThrown) =>
        # trying to fallback to json if jsonp wasn't available
        if textStatus is 'parsererror' and /was not called/.test(errorThrown.message)
          window.json_fallback = true
          @refreshGraph(period)
        else
          console.log("error loading eventsURL: " + generateEventsURL(@args.events))

  getAjaxData: (period) ->
    @period = period
    deferred = $.ajax
      dataType: 'json'
      url: generateDataURL(@args.targets, @args.annotator_target, @args.width)
      error: @error.bind(@)
)

Rickshaw.Graph.Demo = Rickshaw.Class.create(Rickshaw.Graph.JSONP.Graphite,
  success: (data) ->
    palette = new Rickshaw.Color.Palette
      scheme: @args.scheme
    @seriesData = [ [], [], [], [], [], [], [], [], [] ]
    @random = new Rickshaw.Fixtures.RandomData(period/60 + 10)

    for i in [0..60] 
        @random.addData(@seriesData)
    @graph = new Rickshaw.Graph
      element: @args.element
      width: @args.width
      height: @args.height
      min: @args.min
      max: @args.max
      renderer: @args.renderer
      interpolation: @args.interpolation
      stroke: @args.stroke
      strokeWidth: @args.strokeWidth
      series: [
          {
              color: palette.color(),
              data: @seriesData[0],
              name: 'Moscow',
              renderer: 'line'
          }, {
              color: palette.color(),
              data: @seriesData[1],
              name: 'Shanghai',
              renderer: 'line'
          }, {
              color: palette.color(),
              data: @seriesData[2],
              name: 'Amsterdam',
              renderer: 'bar'
          }, {
              color: palette.color(),
              data: @seriesData[3],
              name: 'Paris',
              renderer: 'line'
          }, {
              color: palette.color(),
              data: @seriesData[4],
              name: 'Tokyo',
              renderer: 'line'
          }, {
              color: palette.color(),
              data: @seriesData[5],
              name: 'London',
              renderer: 'line'
          }, {
              color: palette.color(),
              data: @seriesData[6],
              name: 'New York',
              renderer: 'line'
          }
      ].map((s) =>
        s.stroke = @args.stroke_fn(d3.rgb(s.color)) if @args.stroke_fn?
        s)

    @graph.renderer.unstack = @args.unstack
    @graph.render()
    @onComplete(@)

  refreshGraph: (period) ->
    if not @graph
      @success()
    else
      @random.addData(@seriesData)
      @random.addData(@seriesData)
      _.each(@seriesData, (d) -> d.shift())
      @args.onRefresh(@)
      @graph.render()
      for i in [0...@graph.series.length]
        @addTotals(i)
)
    
###
#   Events and interaction
###
# dashboard selection
$('.dropdown-menu').on 'click', 'a', ->
  changeDashboard($(this).text())
  $('.dropdown').removeClass('open')
  false

# changing to a different dashboard
changeDashboard = (dash_name) ->
  dashboard = _.where(dashboards, {name: dash_name})[0] || dashboards[0]
  graphite_url = dashboard['graphite_url'] || default_graphite_url
  description = dashboard['description']
  metrics = dashboard['metrics']
  refresh = dashboard['refresh']
  period ||= default_period
  init()
  $.bbq.pushState({dashboard: dashboard.name})

# time panel - changing timeframe for graphs
$('.timepanel').on 'click', 'a.range', ->
  if graphite_url == 'demo' then changeDashboard(dashboard.name)
  period = $(this).attr('data-timeframe') || default_period
  dataPoll()
  timeFrame = $(this).attr('href').replace(/^#/, '')
  dash = $.bbq.getState()?.dashboard
  $.bbq.pushState({timeFrame: timeFrame, dashboard: dash || dashboard.name})
  $(this).parent('.btn-group').find('a').removeClass('active')
  $(this).addClass('active')
  false

# "permanently" add a css style to hide an element
# (useful when elements are refreshed / don't exist yet)
toggleCss = (css_selector) ->
  if $.rule(css_selector).text().match('display: ?none')
    $.rule(css_selector, 'style').remove()
  else
    $.rule("#{css_selector} {display:none;}").appendTo('style')

# toggle legend
$('#legend-toggle').on 'click', -> 
  $(this).toggleClass('active')
  $('.legend').toggle()
  false

# toggle x and y axis display
$('#axis-toggle').on 'click', ->
  $(this).toggleClass('active')
  toggleCss('.y_grid')
  toggleCss('.y_ticks')
  toggleCss('.x_tick')
  false

# toggle x labels inside the graphs  
$('#x-label-toggle').on 'click', ->
  toggleCss('.rickshaw_graph .detail .x_label')
  $(this).toggleClass('active')
  false

# toggle active item text display  
$('#x-item-toggle').on 'click', ->
  toggleCss('.rickshaw_graph .detail .item.active')
  $(this).toggleClass('active')
  false

# hashchange allows history for dashboard + timeframe  
$(window).bind 'hashchange', (e) ->
  timeFrame = e.getState()?.timeFrame || $(".timepanel a.range[data-timeframe='#{default_period}']")[0].text || "1d"
  dash = e.getState()?.dashboard
  if dash != dashboard.name
    changeDashboard(dash)
  $('.timepanel a.range[href="#' + timeFrame + '"]').click()

$ ->
  $(window).trigger( 'hashchange' )
  init()

