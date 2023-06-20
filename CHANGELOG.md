# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.15.0]
### Fix
- Automatic font size and positionning
- Background for texts
- Review the way ticks are computed

## [0.14.1]
### Fix
- plot_canvas function in python (needed width and height arguments) (in dev too)

## [0.14.0]
### Add
- to_html method in Python so that it is possible to create a plot data file without opening it in web browser
- Allow to draw all points of a Dataset in Graph objects

### Fix
- Smart writing of axes' names in ParallelPlot
- Allow to draw all points of a Dataset in Graph objects
- Python 3.9 in drone
- Remove numpy from dependencies

## [0.13.0]
### Add
- Doc Typescript
- newHistogram plot to replace current Histogram
    - There is no covering between multiplot histogram and this one so the two of them can live in plot_data at the same time
    - Axes:
        - Handled in a BasePlot object and instantiated specifically in each kind of plot (Frame, Histogram,...)
        - Generate their own ticks, with a start number (default is 7 for normal plot, 20 for xAxis of Histogram)
        - Ticks are built from the nearest 5 multiple in floor(log10(minValue)) with an interval computed with (maxValue - minValue) interval
        - Instantiated in Canvas with CanvasMatrix as fixed objects
        - Mouse style can be activated for debug stuff
    - BasePlot:
        - Base Plot for any plot
        - Manage mouse, features and axes instantiation
        - In BasePlot, all objects are fixed
    - Frame:
        - Classic orthogonal plot with X and Y axis
        - Allow to instantiate moving objects as bars, points, or any other
        - Moving objects are projected in the frame movingMatrix, updated for any mouse translation or wheel
- New Shapes have been created to facilitate the refactor. They will be harmonized with the rest of plot data later:
    - newShape is the base Shape
    - Then some standard shapes (rect, circle, cross, plus, half line,...)
    - newText
    - Bar, to handle Histogram objects
- Histogram can be instantiated in multiplot
    - Rubberbands are not totally connected

### Fix
- Allow to put " " in file paths
- Allow to draw a multiplot with no data

## [0.12.2]
### Fix
- update selected_point_index when selecting from parallelplot
- fix previous bug

## [0.12.1]
### Fix
- npmignore
- remove rubber_bands_dep attribute from PlotData class

## [0.12.0] - 02/28/2022
### Add
- Changelog
- Image generation
- Pre-commit

### Fix
- Text drawings
- Mutliplot cross selection


## [0.11.0] - 02/28/2022
### Add
- Cypress continuous integration
- Sample class for ScatterMatrix and Dataset

### Fix
- Tooltip hovering


## [0.7.2]

## [0.7.1]
### Add
- Webpack config for local dev build

### Changed
- npm run build : used by drone to compile webpack bundle
- npm run dev : for local dev use and used by drone to feed cdn

### Removed
- Drone develop step

## [0.7.0]
### Add
- Add force update to plot_canvas options

### Changed
- Update get_current_link to point to right locations

## [0.6.2]
### Changed
- Remove intempestive ScatterPlot alert
- Use webpack to split and bundle
