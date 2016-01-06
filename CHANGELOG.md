# Changelog for Giraffe

* Version 1.3.1 - fixed width bug (#69)
* Version 1.3.0 - updated Rickshaw to latest version
* Version 1.2.0 - added support for offset param
* Version 1.1.1 - Moving the X axis text down
* Version 1.1.0 - added support for renderer: multi
* Version 1.0.3 - bug fix for `min: 0` (#55)
* Version 1.0.2 - more configuration options
  - Stroke color in area renderer can be a function that takes the graph color
    as a d3.rgb color and returns the color of the stroke
  - Format y axis ticks and totals values with a formatting function,
    `ticks_formatter` and `totals_formatter` respectively,
    just like `summary_formatter`
  - Totals fields can be selected by passing an array of strings, e.g.
    `"totals_fields": ["max", "min"]`
* Version 1.0.1 - min default set to `auto` (#49)
* Version 1.0.0
  - first tagged version

## commits

[github commit log](https://github.com/kenhub/giraffe/commits)
