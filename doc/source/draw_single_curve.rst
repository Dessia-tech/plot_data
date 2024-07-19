Graph2D: draw curves on a Figure
================================

With `Graph2D`, time series or any curve function that can be written `y = f(x)` can be displayed on a figure with axes such as x values are drawn on x axis and y values are drawn on y axis, in an orthogonal frame.

How to draw a curve in a Graph2D ?
----------------------------------

1. **Import the required packages**

.. code-block:: python

    # Required packages
    import math
    import plot_data.core as pld
    from plot_data.colors import BLUE, DARK_BLUE, RED, BLACK


2. **Create Data**

In order to display a Graph2D, create a vector of x values and their associated y values.

Values then have to be added in a list of samples, where each sample is a `dict` which keys are names of samples’ features.

Here, we create a sinusoidal function.

.. code-block:: python

    # Inputs
    amplitude = 2
    n_samples = 50
    x_name = "angle"
    y_name = "amplitude"

    # Vectors creation
    X = [i / (2 * math.pi) for i in range(n_samples)]
    Y = [amplitude * math.sin(i) for i in X]

    # Build PlotData vector of samples
    samples = []
    for k in range(len(X)):
        samples.append({x_name: X[k], y_name: Y[k]})

    # Create the dataset
    dataset = pld.Dataset(elements=samples, name='y = A.sin(x)',)

3. **Add meta-data on samples**

Some additional information can be added on data thanks to tooltips, that can be displayed by clicking on the shape that carries the designed tootlip.

Here, the tooltip is directly created as an independent object that will be used in next steps, while creating the figure to draw the previously built data.

.. code-block:: python

    # Attributes to show in tooltip
    shown_attributes = [x_name, y_name]

    # Tooltip creation
    tooltip = pld.Tooltip(attributes=shown_attributes)

4. **Set styles for points, curves and axes**

Styles for points, curves and axes can be customized with the user’s preferences.

.. code-block:: python

    # Points style
    point_style = pld.PointStyle(color_fill=RED, color_stroke=BLACK)

    # Curves style
    edge_style = pld.EdgeStyle(color_stroke=BLUE, dashline=[10, 5])

    # Dataset style
    custom_dataset = pld.Dataset(
    	elements=samples,
    	name='y = A.sin(x)',
    	tooltip=tooltip,
    	point_style=point_style,
    	edge_style=edge_style
    	)

    # Axis style
    ## Text style
    graduation_style = pld.TextStyle(
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
    	nb_points_x=7,
    	nb_points_y=5,
    	graduation_style=graduation_style,
    	axis_style=axis_style
    	)

5. **Create the Graph2D object and draw it in a web browser**

.. code-block:: python

    graph2d = pld.Graph2D(
    	graphs=[custom_dataset],
    	x_variable=x_name,
    	y_variable=y_name,
    	axis=axis
    	)

Once done, the figure can be displayed with the following command line :

.. code-block:: python

    pld.plot_canvas(plot_data_object=graph2d, canvas_id='my_graph2d')

.. raw:: html
   :file: htmls/section2_1_plot_graph.html


Graph2D features
----------------

- Points used to build the curve can be displayed by clicking on `Show Points` button,
- The figure can be scaled with mouse wheel or by clicking on `Zoom Box`, `Zoom+` and `Zoom-` buttons,
- Curves can be displayed with log scales by clicking on `Log Scale` button,
- One can select points with a selection window by keeping pressed the `Shift` key,
- One can select several points with several mouse click by keeping pressed `Ctrl` key,
- One can reset the view by pressing `Ctrl + Space`,
- One can reset the whole figure by pressing `Ctrl + Shift + Left Click.`

How to add a method to draw a Graph2D within a DessiaObject ?
-------------------------------------------------------------

A Graph2D (or any kind of figure that can be drawn with PlotData) can be added to any DessiaObject to depict its behavior.

In the following example, a free pendulum with no friction as been designed as a DessiaObject.

Firstly, import all the required packages.

.. code-block:: python

    import math
    import numpy as npy

    from dessia_common.core import DessiaObject
    from dessia_common.decorators import plot_data_view

    import plot_data.core as pld
    from plot_data.colors import Color

Then create a pendulum object with no friction. Required attributes to get the pendulum movement are its `initial angle`, its `length`, its `mass` and the gravity acceleration constant (declared as a variable `g`). `duration` and `time_step` have been added to simulate the pendulum over time.

In order to get the pendulum state evolving with time, a method to compute its `angle` over `time` and a method to compute its Cartesian coordinates (`coords`) over time have also been added.

.. code-block:: python

    class Pendulum(DessiaObject):
        _standalone_in_db = True

        def __init__(self, init_angle: float, length: float, g: float,
    							   duration: float, time_step: float, name: str = ''):
            self.length = length
            self.g = g
            self.duration = duration
            self.time_step = time_step
            self.init_angle = init_angle
            self.period = self._compute_period(length)
            self.time = self._get_time_vector(duration, time_step)
            self.angle = self._compute_angle()
            self.coords = self._compute_coords()
            super().__init__(name)

        def _compute_period(self, length: float):
            return (self.g / length) ** 0.5

        def _get_time_vector(self, duration: float, time_step: float):
            return npy.arange(0, duration + time_step, time_step).tolist()

        def _compute_angle(self):
            return [self.init_angle * math.cos(self.period * t) for t in self.time]

        def _compute_coords(self):
            return [
    	        [self.length * math.sin(angle), self.length * (1 - math.cos(angle))]
    	        for angle in self.angle
    	        ]

To plot the pendulum state variables over time, write methods with `@plot_data_view` decorator for platform usages. Each of the written method defines a `Graph2D` to draw data of interest.

.. code-block:: python

    # To add to Pendulum class
    @plot_data_view("angle_vs_time")
    def angle_vs_time(self, reference_path: str = "#"):
        elements = [
          {"time": t, "angle": angle}
          for t, angle in zip(self.time, self.angle)
          ]
        dataset = pld.Dataset(elements, name="angle vs time")
        graphs2d = pld.Graph2D(
          graphs=[dataset],
          x_variable="time",
          y_variable="angle"
          )
        return graphs2d

    @plot_data_view("x_vs_time")
    def x_vs_time(self, reference_path: str = "#"):
        elements = [
          {"time": t, "x": coord[0]}
          for t, coord in zip(self.time, self.coords)
          ]
        dataset = pld.Dataset(elements, name="x vs time")
        graphs2d = pld.Graph2D(
          graphs=[dataset],
           x_variable="time",
           y_variable="x"
           )
        return graphs2d

    @plot_data_view("y_vs_time")
    def y_vs_time(self, reference_path: str = "#"):
        elements = [
          {"time": t, "y": coord[1]}
          for t, coord in zip(self.time, self.coords)
          ]
        dataset = pld.Dataset(elements, name="y vs time")
        graphs2d = pld.Graph2D(
          graphs=[dataset],
          x_variable="time",
          y_variable="y"
          )
        return graphs2d

    @plot_data_view("y_vs_time")
    def y_vs_x(self, reference_path: str = "#"):
        elements = [{"x": x, "y": y} for x, y in self.coords]
        dataset = pld.Dataset(elements, name="y vs x")
        graphs2d = pld.Graph2D(graphs=[dataset], x_variable="x", y_variable="y")
        return graphs2d

In these methods, a vector of elements is firstly created and added to a `Dataset`. It is then declared as the only dataset drawn in a `Graph2D` object that plots `x_variable` against `y_variable` of vector `elements`.

The results of graph drawings are available on the next 4 html pages in the present document. They have generated with the following code:

.. code-block:: python

    # Instantiate a pendulum
    pendulum = Pendulum(math.pi / 3, 1, 9.81, 10, 0.01)

    # Draw its graphs with specific files name
    pld.plot_canvas(plot_data_object=pendulum.angle_vs_time(), canvas_id='my_graph2d', filepath="section2_1_2_angle_time")
    pld.plot_canvas(plot_data_object=pendulum.x_vs_time(), canvas_id='my_graph2d', filepath="section2_1_2_x_time")
    pld.plot_canvas(plot_data_object=pendulum.y_vs_time(), canvas_id='my_graph2d', filepath="section2_1_2_y_time")
    pld.plot_canvas(plot_data_object=pendulum.y_vs_x(), canvas_id='my_graph2d', filepath="section2_1_2_x_y")

.. raw:: html
   :file: htmls/section2_1_2_angle_time.html

.. raw:: html
   :file: htmls/section2_1_2_x_time.html

.. raw:: html
   :file: htmls/section2_1_2_y_time.html

.. raw:: html
   :file: htmls/section2_1_2_x_y.html
