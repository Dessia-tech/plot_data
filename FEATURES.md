# Load Data
Features to directly load data.

## CSV Reader
File location: `../script/csv_reader.py`
   - Works with no imports of Dessia modules

# Handled Shapes / Primitives
Handled shapes or primitives in plot_data.

## Point2D
## Arc2D
## Circle2D
## Contour2D
## Graph2D
File location: `../script/graph2D.py`, `../script/test_objects/graph2D.py`
   - Init scale does not work correctly: when two graphs are plotted in the same plot, only considers one of them (which one ?)
   - Plots points on a graph and link them with line segments
   - There are 2 graduated and labelled axis, points, linked by line segments and a legend
   - Points are coloured and can be hovered, selected and tooltiped

## Label
## Line2D
## LineSegment2D
## MultipleLabels
## PrimitiveGroup
## Scatter
## Text
## Wire
## Heatmap
## Tooltip
   - Tested nearly everywhere
   - Do not work correctly: 
        * it is required to draw a selection rectangle and select a point in it to get its tooltip displayed
        * If a point is clicked before being selected with a rectangle, it must be unclicked to display its tooltip
   - Must be fixed
   - Expected behavior: Tootltip to appear when element is clicked and tooltip exists and set to true

## Axis
## Dataset
File location: `../script/graph2D.py`, `../script/test_objects/graph2D.py`
   - Init scale does not work correctly: when two graphs are plotted in the same plot, only considers one of them (which one ?)
   - Plots points on a graph and link them with line segments
   - There are 2 graduated and labelled axis, points, linked by line segments and a legend
   - Points are coloured and can be hovered, selected and tooltiped

## NetworkxGraph



# Plots
Features that allow to plot data on specific diagram, automatically

## Scatter
## Graph2D
## ParallelPlot
## Histogram
## PrimitiveGroupContainer
## Contour



# Styles
Handled styles in plot_data.

## HatchingSet
## EdgeStyle
## PointStyle
## TextStyle
## SurfaceStyle
## Color



# Divers
Handled styles in plot_data.

## Cross selection in multiplots
   - Cross selection available between figures when a multiplot contains several scatter plots, parallel plots or ???? created with the same data
        * can be tested in `../script/graph2D.py`

## Scatter colorize with parallel plot colors
   - When a parallel plot and a scatter are on the same multiplot, points are colored with the parallel plot colors
        * can be tested in `../script/graph2D.py`



