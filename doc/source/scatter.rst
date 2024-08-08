Scatter: draw points on a Figure
================================

A Scatter draw is a figure that plots points in an orthogonal frame, without any curve to link them. As an example a transparent curve from the previous Graph2D where points are shown is like a Scatter drawing.

How to draw a Scatter ?
-----------------------

1. **Import the required packages**

.. code-block:: python

    # Required packages
    import random
    import plot_data.core as pld
    from plot_data.colors import BLUE, RED, GREEN, BLACK

1. **Create Data**

In order to draw a Scatter plot with random values, build a random vector of samples (stored as Python `dict`) with different attributes. Here three attributes (`mass`, `length` and `speed`) have been set for the samples to carry more information than just their coordinates in the Scatter plot:

.. code-block:: python

    # Vector construction
    elements = []
    for i in range(500):
        elements.append({'mass': random.uniform(0, 10),
                         'length': random.uniform(0, 100),
                         'speed': random.uniform(0, 3.6)})

1. **Add meta-data on samples**

Some additional information can be added on points thanks to tooltips. They can be displayed by clicking on the point of interest. Here, the tooltip is directly created as an independent object that will be used in next steps, while creating the figure to draw the previously built data.

For the scatter example, some point sets are defined (`PointFamily` object, where a sample is in a set if this set contains its index in vector `elements`).

.. code-block:: python

    # Attributes to show in tooltip
    shown_attributes = ["mass", "length", "speed"]

    # Tooltip creation
    tooltip = pld.Tooltip(attributes=shown_attributes)

    # Points sets declaration
    points_sets = [
        pld.PointFamily(RED, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
        pld.PointFamily(BLUE, [10, 11, 12, 13, 14, 15, 16, 17, 18, 19])
        ]

1. **Set styles for points, curves and axes**

Styles for points and axes can be customized with the user’s preferences.

.. code-block:: python

    # Points style
    point_style = pld.PointStyle(color_fill=GREEN,
                                 color_stroke=BLUE,
                                 stroke_width=2,
                                 size=8,
                                 shape='square')
    # Axis style
    ## Text style
    graduation_style = pld.TextStyle(
    	text_color=BLUE,
    	font_size=10,
    	font_style='Arial'
    	)

    ## Axis edge style
    axis_style = pld.EdgeStyle(
    	line_width=0.5,
    	color_stroke=DARK_BLUE,
    	dashline=[]
    	)

    # Axes ticks number and styles
    axis = pld.Axis(
    	nb_points_x=7, nb_points_y=5,
    	graduation_style=graduation_style,
    	axis_style=axis_style
    	)

1. **Build the Scatter object and draw it in a web browser**

.. code-block:: python

    scatter = pld.Scatter(
        elements=elements,
        x_variable="mass",
        y_variable="length",
        point_style=point_style,
        points_sets=points_sets,
        axis=axis,
        tooltip=tooltip
        )

Once done, the figure can be displayed with the following command line :

.. code-block:: python

    pld.plot_canvas(plot_data_object=scatter, canvas_id='my_scatter')

.. raw:: html

    <iframe src="_static/htmls/section2_3_1_rand_scatter.html" height="345px" width="100%"></iframe>

Scatter features
----------------

- Points used to build the curve can be merged by clicking on `Merge Points` button,
- The figure can be scaled with mouse wheel or by clicking on `Zoom Box`, `Zoom+` and `Zoom-` buttons,
- Points can be displayed in log scales by clicking on `Log Scale` button,
- One can select points with a selection window by keeping pressed the `Shift` key,
- One can select several points with several mouse click by keeping pressed `Ctrl` key,
- One can reset the view by pressing `Ctrl + Space`,
- One can reset the whole figure by pressing `Ctrl + Shift + Left Click`.

How to write a function to draw a Scatter for an object ?
---------------------------------------------------------

As a concrete example, the influence of the pendulum’s period on its maximum speed can be studied by drawing a scatter plot of the pendulum’s maximum speed against its period.

1. **First, add methods to pendulum to compute some insightful values to draw on a scatter plot. Here, we compute the speed over time and its maximum value.**

.. code-block:: python

    # To add to the pendulum class
    def get_speed(self):
        speed = npy.array(self.coords)[1:, :] - npy.array(self.coords)[:-1, :]
        return npy.linalg.norm(speed, ord=2, axis=1) / self.time_step

    @property
    def max_speed(self):
        return npy.max(self.get_speed())

1. **Then write a function to draw speed against period in a Scatter plot**

In the following code lines, `point_style` , `axis_style` and `axis` properties are customized and tooltip is specified so that only relevant information are drawn in tooltips when points are clicked.

.. code-block:: python

    def scatter_speed_period(pendulum_doe: PendulumDOE, reference_path: str = "#"):
        tooltip = pld.Tooltip(["length", "g"])
        elements = [
    	    {"period": pendulum.period,
    	     "speed": pendulum.max_speed,
    	     "length": pendulum.length,
    	     "g": pendulum.g} for pendulum in pendulum_doe.dessia_objects]

        # Point Style
        point_style = pld.PointStyle(
          color_fill=Color(0, 1, 1),
          color_stroke=Color(0, 0, 0),
          size=6,
          shape="triangle", # square, circle, mark, cross, halfline
          orientation="down" # up, left, right
          )

        # Axis edge style
        axis_style = pld.EdgeStyle(
         	line_width=0.5,
         	color_stroke=DARK_BLUE,
         	dashline=[]
         	)
        axis = pld.Axis(
         	nb_points_x=10, nb_points_y=15,
         	axis_style=axis_style
         	)
        return pld.Scatter(x_variable="period", y_variable="speed",
    										   elements=elements, tooltip=tooltip,
    										   point_style=point_style, axis=axis)

1. **Run the function to draw the Scatter plot in a web browser**

With such plot the user can pick the best solutions considering its performances criteria.

.. code-block:: python

    scatter = scatter_speed_period(pendulum_doe)
    pld.plot_canvas(plot_data_object=scatter, filepath="section_2_3_speed_period")

.. raw:: html

    <iframe src="_static/htmls/section2_3_2_speed_period.html" height="345px" width="100%"></iframe>

How to add a method to draw a Scatter within a DessiaObject ?
-------------------------------------------------------------

For the pendulum example, the previous Scatter plot can be added to the `PendulumDOE` class by simply changing the previous function into a `PendulumDOE` method. As for Graph2D, a decorator `@plot_data_view` is added for a future platform usage. Furthermore, for the sake of simplicity, plot customization is removed:

.. code-block:: python

    # To add to PendulumDOE class
    @plot_data_view("max_speed")
    def scatter_speed_period(self, reference_path: str = "#"):
        tooltip = pld.Tooltip(["length", "g"])
        elements = [
            {"period": pendulum.period, "speed": pendulum.max_speed, "length": pendulum.length, "g": pendulum.g}
            for pendulum in self.dessia_objects]
        return pld.Scatter(x_variable="period", y_variable="speed", elements=elements, tooltip=tooltip)

To draw this scatter in a web browser, run the following code lines:

.. code-block:: python

    scatter_self = pendulum_doe.scatter_speed_period()
    pld.plot_canvas(plot_data_object=scatter_self, canvas_id='my_scatter')

.. raw:: html

    <iframe src="_static/htmls/section2_3_3_speed_period_self.html" height="345px" width="100%"></iframe>
