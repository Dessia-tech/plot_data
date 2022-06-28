# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased => [0.7.2]
### Add
- Add Piechart drawing
- Add Piechart drawing in mutliplot

## [0.7.1]
### Add
- Webpack config for local dev build

### Changed
- npm run build : used by drone to compile webpack bundle
- npm run dev : for local dev use and used by drone to feed cdn

### Removed
- Drone develop step

## [ 0.7.0]
### Add
- Add force update to plot_canvas options

### Changed
- Update get_current_link to point to right locations

## [0.6.2]
### Changed
- Remove intempestive ScatterPlot alert
- Use webpack to split and bundle
