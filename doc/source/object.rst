Draw a 2D representation of an object
=====================================

PlotData allows to draw complex shapes and to associate them with a DessiaObject.

Available shapes
----------------

The following bullet point lists all available shapes in PlotData and how to instantiate and draw them. For the sake of simplicity, imports are given just below and used for all the following shapes.

.. code-block:: python

    import math
    import plot_data as pld
    from plot_data.colors import ORANGE, BLACK, BLUE, LIGHTGREEN

- **Point**: draw a point at the given 2D coordinates `(cx, cy)`. To create a `Point2D` which drawing parameters are customized, write the following lines:

.. code-block:: python

    point_style = pld.PointStyle(
    		color_fill=ORANGE,
    		color_stroke=BLACK,
    		stroke_width=2,
    		shape="circle",
    		size = 20
    		)

    point = pld.Point2D(
    		cx = 1,
    		cy=12,
    		point_style=point_style,
    		tooltip="Circle point"
    		)

- **Line segment**: draw a line segment between two given points. To create a `LineSegment2D` which drawing parameters are customized, write the following lines:

.. code-block:: python

    edge_style = pld.EdgeStyle(
    		line_width=3,
    		color_stroke=BLUE,
    		dashline=[5, 2]
    		)

    line_segment = pld.LineSegment2D(
    		point1=[0, 0],
    		point2=[20, 16],
    		edge_style=edge_style,
    		tooltip="LineSegment2D"
    		)

- **Line**: draw an infinite line crossing two given points. To create a `Line2D` (same style customization as `LineSegment2D`) write the following lines:

.. code-block:: python

    pld.Line2D(
    		point1=[-10, 24.5],
    		point2=[22, 24.5],
    		edge_style=edge_style,
    		tooltip="Line2D"
    		)

- **Rectangle**: draw a rectangle with given origin coordinates, width and height. To create a Rectangle which drawing parameters are customized, write the following lines:

.. code-block:: python

    # Surface hatching
    hatching = pld.HatchingSet(1, 10)

    surface_style = pld.SurfaceStyle(
    		color_fill=LIGHTGREEN,
    		opacity=0.8,
    		hatching=hatching
    		)

    edge_style = pld.EdgeStyle(
    		line_width=3,
    		color_stroke=BLUE,
    		dashline=[5, 2]
    		)

    rectangle = pld.Rectangle(
    		x_coord=-6, y_coord=16, width=15, height=10,
    		surface_style=surface_style,
    		edge_style=edge_style,
    		tooltip="rectangle"
    		)

- **Round rectangle**: draw a rectangle with given origin coordinates, width, height and radius. To create a `RoundRectangle`(same style customization as `Rectangle`) write the following lines:

.. code-block:: python

    round_rect = pld.RoundRectangle(
    		x_coord=24, y_coord=0, width=60, height=37, radius=1,
    		edge_style=edge_style,
    		surface_style=surface_style,
    		tooltip="round_rectangle"
    		)

- **Circle**: draw a circle with given origin coordinates and radius. To create a `Circle` (same style customization as `Rectangle`) write the following lines:

.. code-block:: python

    circle = pld.Circle2D(
        cx=15,
        cy=35,
        r=5,
        edge_style=edge_style,
        surface_style=surface_style,
        tooltip="Circle"
        )

- **Arc**: draw an arc with given origin coordinates, radius and start and end angles. To create an `Arc2D` (same style customization as `Line`) write the following lines:

.. code-block:: python

    arc = pld.Arc2D(
        cx=0,
        cy=30,
        r=5,
        start_angle=math.pi/4,
        end_angle=2*math.pi/3,
        edge_style=edge_style,
        clockwise=False, # Specify the turning sense for drawing the arc
        tooltip="arc_anticlockwise"
        )

- **Wire**: draw a 2D polygon connecting the given points. It can be closed or open. To create a `Wire` (same customization as `Line`) write the following lines:

.. code-block:: python

    # Point series ([x1, y1],...,[xn, yn]) to link with lines
    lines = [
        [25, 35], [28, 26], [29, 30], [30, 26],
        [33, 35], [34, 35], [34, 26], [35, 26],
        [35, 35], [40, 35], [35, 30], [40, 26],
        [44, 26], [41, 26], [41, 30.5], [43, 30.5],
        [41, 30.5], [41, 35], [44, 35]
        ]

    wire = pld.Wire(
        lines=lines,
        tooltip="Wire",
        edge_style=edge_style
        )

- **Contour**: draw a 2D polygon with arcs and lines. It can be closed or open. To get a transparent filling for the Contour, do not specify any `SurfaceStyle` when building it. To create a `Contour` (same style customization as `Rectangle`) write the following lines:

.. code-block:: python

    heart_lines = [
        pld.LineSegment2D([51, 26], [47, 33]),
        pld.Arc2D(cx=49, cy=33, r=2, start_angle=math.pi, end_angle=0, clockwise=True),
        pld.Arc2D(cx=53, cy=33, r=2, start_angle=math.pi, end_angle=0, clockwise=True),
        pld.LineSegment2D([55, 33], [51, 26])
        ]

    contour = pld.Contour2D(
        plot_data_primitives=heart_lines,
        edge_style=pld.EdgeStyle(line_width=2, color_stroke=BORDEAUX),
        surface_style=pld.SurfaceStyle(color_fill=RED),
        tooltip="Heart shaped contour.")

- **Text**: write text at the specified coordinates with the given text properties. To create a `Text` write the following lines and specify the following attribute for it to fit with its requirements:

  - `text_style` attribute allows to specify a `TextStyle`to custom text font, size and align
  - `text_scaling` attribute allows to scale the text with mouse wheel or not
  - `max_width` attribute allows to resize the text’s font automatically to be smaller than the specified length
  - `height` attribute allows to resize the text’s font automatically to be smaller than the specified height
  - `multi_lines` attribute allows to specify if the text shall automatically create a new line when it is longer than the specified `max_width`

.. code-block:: python

    # Unscaled text
    unscaled = pld.Text(
        comment='This text never changes its size because text_scaling is False.',
        position_x=-14,
        position_y=28,
        text_scaling=False,
        multi_lines=True
        text_style=pld.TextStyle(
            font_size=16,
            text_align_y="top"
            )
        )

    # Scaled text
    scaled = pld.Text(
        comment='Dessia',
        position_x=70,
        position_y=35,
        text_scaling=True,
        multi_lines=False,
        text_style=pld.TextStyle(
            font_size=8,
            text_color=BLUE,
            text_align_x="right",
            text_align_y="bottom",
            bold=True
            )
        )

- **Label**: draw a label with the given text **or** for the given shape. To create a `Label` create a shape and associate it to a `Label` or write a text and set a style to show anything else. The following lines give the procedure to build labels:

.. code-block:: python

    # Standalone Label
    text_style = pld.TextStyle(
        text_color=ORANGE,
        font_size=14,
        italic=True,
        bold=True
        )

    edge_style = pld.EdgeStyle(
        line_width=1,
        color_stroke=BLUE,
        dashline=[5, 5]
        )

    label_1 = pld.Label(
        title='Standalone Label 1',
        text_style=text_style,
        rectangle_surface_style=surface_style,
        rectangle_edge_style=edge_style)

    # Automatic labels
    ## Set a shape list
    shapes = [
    		point, line_segment, line, rectangle, round_rectangle, circle,
    		arc, wire, contour]

    ## Create a label for each shape
    labels = [
    		pld.Label(title=type(shape).__name__, shape=shape) for shape in shapes
    		]

Drawing shapes in a Figure
--------------------------

The previously presented shapes can all be drawn in a `PrimitiveGroup` (soon renamed as `Draw`). To do it, store all these shapes in a list and draw a `PrimitiveGroup` :

.. code-block:: python

    primitives=[point, line_segment, line, rectangle, round_rectangle,
    						circle, arc, wire, contour, unscaled, scaled, label_1] + labels

    draw = pld.PrimitiveGroup(primitives=primitives)

Once done, the figure can be displayed with the following command line:

.. code-block:: python

    pld.plot_canvas(plot_data_object=draw, filepath="section2_6_2_draw")

.. raw:: html
   :file: htmls/section2_6_2_draw.html


How to add a 2D representation to a DessiaObject ?
--------------------------------------------------

For the previously designed Pendulum ([section 2.1.2](https://www.notion.so/Using-data-display-with-PlotData-30f86e58db6240788cf4f3b543b0ae51?pvs=21)), an interesting 2D representation may be to represent the pendulum with its course over x and y coordinates.

To do it, add a method to build the 2D representation to the `Pendulum` class:

.. code-block:: python

    class Pendulum(DessiaObject):
    	:
    	:
    	:
      @plot_data_view("2d_drawing")
      def draw(self, reference_path: str = "#"):
          # Pendulum's pivot
          origin = pld.Point2D(0, 3.1, pld.PointStyle(color_fill=BLACK, color_stroke=BLACK, size=20, shape="circle"))

          # Pendulum's mass object
          mass_origin = [
              self.length * math.sin(self.init_angle),
              origin.cy - self.length *math.cos(self.init_angle)
              ]
          mass_circle = pld.Circle2D(
              cx=mass_origin[0], cy=mass_origin[1], r=0.25,
              surface_style = pld.SurfaceStyle(color_fill=BLUE)
              )

          # Pendulum's link
          bar = pld.LineSegment2D(
              [origin.cx, origin.cy], mass_origin,
              edge_style=pld.EdgeStyle(line_width=5, color_stroke=BLACK))

          # Pendulum's course
          shifted_coords = (npy.array(self.coords) + npy.array([[0, origin.cy - self.length]])).tolist()
          course = pld.Wire(shifted_coords, edge_style=pld.EdgeStyle(line_width=1, color_stroke=BLUE, dashline=[7,3]))
          return pld.PrimitiveGroup([origin, mass_circle, bar, course])

Once done, the figure can be displayed with the following command line:

.. code-block:: python

    pld.plot_canvas(plot_data_object=pendulum.draw(), canvas_id='my_draw', filepath="section2_6_3_draw")

.. raw:: html
   :file: htmls/section2_6_3_draw.html
