# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.23.1]

### Fix

- LineSegment2D : If it is overloaded, MPL Plot now show the right edge_style instead of generating of random one 

## [0.23.0]

### Feat
- Add events (Subject) to emit shape hovering and clicking
- Highlight shapes when corresponding function is called from wrapper software

### Fix
- Remove offline mode

### Refactor
- Implements InteractiveObject for handling all mouse objects in one class

## [0.22.0]
### Add
- Integer axes only show integer ticks
- Handle date as continuous value on axes
- Allow to log scale axes
- Offline mode

### Fix
- Add reference_path to all Primitive / Elementary drawing Objects
- Remove data attr from class Arc in Python
- Light improvement of class Arc in Python
- Html stream method

## [0.21.0]
### Add
- Tests of typescript app

## [0.20.0]
### Add
- Tests for most of important features
- Toggle Axes
- Customable axes names of Draw

## [0.19.1]
### Build
- Use pip install instead of setuptools install in order to avoid .egg being generating and preventing PyPI upload


## [0.19.0]
### Fixes
- Multiplot Drawing + its review

### Refactor
- Remove ill code
- Files organization 1
- Change names of classes and functions (e.g. remove 'new' prefix)
- Files organization 2

## [0.18.0]
### Add
- Draw to replace PrimitiveGroups
- Rectangle shapes

### Fixes
- Text handling and writing

## [0.17.0]
### Fixes
- Handle empty elements in Scatter
- Offset & Margin in ParallelPlot
- Performance for curves drawing in ParallelPlot
- Events on window outside canvas are disabled for sure

### Add
- Parallel plot feature with:
    - Movable axes
    - Scalable axes
    - Possibility to translate local values of axes
    - Rubberbands
    - Mouse handling on curves
    - Possibility to switch orientation
    - Possibility to change sense of axes by clicking on their title
- Line shape with its variants
- ParallelPlot in multiplot with mouse interactions

### Refactor
- newAxis
- newText
- Mouse handling in objects
- MouseWheel interactions

## [0.16.0]
### Refactor
- First implementation of Scatter as a Frame plot
- Add SelectionBox object and allow to draw it on any BasePlot, interacting with RubberBands
- Add method to merge scatter points
- New Scatter frontend implementation:
    - Selection Boxes
    - Mouse interactions
    - Zoom boxes
    - Clustering
    - Fixed mouse behavior for almost all cases of selection
    - Reset actions
    - Dependencies of sample states between plots
    - Use attributes coming from Python
- Point families implementation as PointSet
- Graph2D implementation

### Removed
- Package Version checks is not implemented anymore

## [0.15.0]
### Add
- Tooltip in Histograms, which can be drawn only in the current window plot
- Avoid huge bugs or problems with frontend implementation

### Fix
- Automatic font size and positioning
- Background for texts
- Review the way ticks are computed
- Review the way clicked and hovered objects are handled

### Refactor
- Remove old Histogram and switch ScatterMatrix to Multiplot
- Rename newHistogram as Histogram
- Light refactor of mouse attributes

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
