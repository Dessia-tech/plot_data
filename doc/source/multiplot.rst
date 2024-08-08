Multiplot: drawing several plots on one page
============================================

The `Multiplot` object is basically a layout of several figures where all drawn elements are linked together so that selecting an object in one plot selects this object on all plots, except for 2D representations (`PrimitiveGroup`) and `Graph2D` objects.

How to draw a Multiplot ?
-------------------------

1. **Import the required packages**

.. code-block:: python

    # Required packages
    import random
    import plot_data

2. **Create Data**

In order to draw a Multiplot with random values, build a random vector of samples (stored as Python `dict`) with different attributes. Here 4 float attributes (`mass`, `length`, `speed` and `power`), 1 integer attribute (`rank`) and 1 discrete attribute (`shape`) are chosen to describe each sample.

.. code-block:: python

    # Vector construction
    elements = []
    SHAPES = ['round', 'square', 'triangle', 'ellipse']
    for i in range(500):
        elements.append({"mass": random.uniform(0, 10),
                         "length": random.uniform(0, 100),
                         "speed": random.uniform(0, 3.6),
                         "shape": random.choice(SHAPES),
                         "rank": random.randint(1, 20),
                         'power': random.gauss(0, 3)})

3. **Build all plots to draw in the Multiplot**

.. code-block:: python

    # ParallelPlot
    parallelplot = pld.ParallelPlot(axes=['mass', 'length', 'speed', 'shape', 'rank', 'power'])

    # Scatterplots
    mass_vs_length = pld.Scatter(x_variable='mass', y_variable='length')
    shape_vs_rank = pld.Scatter(x_variable='shape', y_variable='rank')

    # 2D representation
    drawing_2d = pld.PrimitiveGroup(primitives=[pld.Rectangle(0, 0, 12, 24), pld.Circle2D(12, 24, 5)])

    histogram_power = pld.Histogram(x_variable='power')
    histogram_speed = pld.Histogram(x_variable='speed')

    # Creating the multiplot
    plots = [parallelplot, mass_vs_length, shape_vs_rank, drawing_2d, histogram_power, histogram_speed]

4. **Build a Multiplot with all these plots**

.. code-block:: python

    # Points sets creation as an example
    point_families=[
    		pld.PointFamily('rgb(25, 178, 200)', [1,2,3,4,5,6,7]),
    		pld.PointFamily('rgb(225, 13, 200)', [10,20,30,41,45,46,47]),
    		pld.PointFamily('rgb(146, 178, 78)', [11,21,31,41,25,26,27])
    		]

    multiplot = pld.MultiplePlots(
    		plots=plots,
    		elements=elements,
    		initial_view_on=True
    		)

Once done, the figure can be displayed with the following command line :

.. code-block:: python

    pld.plot_canvas(plot_data_object=multiplot, canvas_id='my_mulitplot')

.. raw:: html

    <iframe src="_static/htmls/section2_7_1_multiplot.html" height="345px" width="100%"></iframe>

Multiplot Features
------------------

- All features available in alone figures are available in the Multiplot layout,
- Cross selection between figures is available,
- One can reorder figures by clicking on `Resize Figures` ,
- One can select several lines with several mouse click by keeping pressed `Ctrl` key,
- One can reset the view of the mouse hovered plot by pressing `Ctrl + Space`,
- One can reset the whole figure by pressing `Ctrl + Shift + Left Click`.

How to write a method to draw a Multiplot in a DessiaObject ?
-------------------------------------------------------------

For the pendulum example, a Multiplot can be designed for the `PendulumDOE` class to draw all relevant figures in one html page. As for other plots, a decorator `@plot_data_view` is added for a future platform usage.

1. **Before coding the Multiplot method, some re-arrangements need to be done in PendulumDOE class for minimizing the amount of produced data**

.. code-block:: python

    class PendulumDOE(Dataset):
    	:
    	:
    	:
    	# To build only one vector elements
    	def _to_sample(self):
        return [{
            "length": pendulum.length,
            "g": pendulum.g,
            "speed": pendulum.max_speed,
            "period": pendulum.period,
            } for pendulum in self.dessia_objects]

    	# To draw all pendulums
      def _to_drawings(self):
        cmap = colormaps["jet"](npy.linspace(0, 1, len(self.dessia_objects)))
        return sum([pendulum.draw(Color(*(cmap[i][:-1]))).primitives
                    for i, pendulum in enumerate(self.dessia_objects)], [])

      def _scatter_speed_period(self, elements = None):
        tooltip = pld.Tooltip(["length", "g"])
        return pld.Scatter(x_variable="period", y_variable="speed", tooltip=tooltip, elements=elements)

      def _parallel_plot(self, elements = None):
        return pld.ParallelPlot(axes=["g", "length", "period", "speed"], elements=elements)

      def _histogram(self, elements = None):
        return pld.Histogram(x_variable="speed", graduation_nb=20, elements=elements)

      @plot_data_view("max_speed")
      def scatter_speed_period(self, reference_path: str = "#"):
        return self._scatter_speed_period(elements=self._to_sample())

      @plot_data_view("parallelplot")
      def parallel_plot(self, reference_path: str = "#"):
        return self._parallel_plot(elements=self._to_sample())

      @plot_data_view("histogram")
      def histogram(self, reference_path: str = "#"):
        return self._histogram(elements=self._to_sample())

      @plot_data_view("draw")
      def draw(self):
        return pld.PrimitiveGroup(primitives=self._to_drawings())

2. Write the **Mutliplot** method

.. code-block:: python

    class PendulumDOE(Dataset):
    	:
    	:
    	:
    	@plot_data_view("Multiplot")
    	def multiplot(self, reference_path: str = "#"):
    	  scatter_plot = self._scatter_speed_period()
    	  y_vs_t_curves = self.all_y_vs_time()
    	  parallel_plot = self._parallel_plot()
    	  histogram = self._histogram()
    	  draw = self.draw()
    	  plots = [scatter_plot, parallel_plot, histogram, draw, y_vs_t_curves]
    	  elements = self._to_sample()
    	  return pld.MultiplePlots(elements=elements, plots=plots, name="Multiple Plot")

Once done, the figure can be displayed with the following command line :

.. code-block:: python

    multiplot = pendulum_doe.multiplot()
    pld.plot_canvas(plot_data_object=multiplot, canvas_id='my_multiplot')

.. raw:: html

    <iframe src="_static/htmls/section2_4_1_rand_parallelplot.html" height="345px" width="100%"></iframe>
