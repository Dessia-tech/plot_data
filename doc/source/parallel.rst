Parallel Plot: draw all features on one Figure
==============================================

Parallel plot or parallel coordinates plot allows to compare features of several individual observations (series) on a set of numeric variables.

Each vertical bar represents a variable or an objective value and has its own scale (units can even be different). Values are then plotted as series of lines connected across each axis.

**Thanks to Parallel Plot, correlations between variables and objectives can be globally visually studied**.

How to draw a Parallel Plot ?
-----------------------------

1. **Import the required packages**

.. code-block:: python

    # Required packages
    import random
    import plot_data.core as pld
    from plot_data.colors import BLUE, RED, GREEN, BLACK

2. **Create Data**

In order to draw a Parallel plot with random values, build a random vector of samples (stored as Python `dict`) with different attributes. Here 3 float attributes (`mass`, `length` and `speed`), 1 integer attribute (`rank`) and 1 discrete attribute (`shape`) are chosen to describe each sample.

.. code-block:: python

    # Vector construction
    elements = []
    SHAPES = ['round', 'square', 'triangle', 'ellipse']
    for i in range(500):
        elements.append({"mass": random.uniform(0, 10),
                         "length": random.uniform(0, 100),
                         "speed": random.uniform(0, 3.6),
                         "shape": random.choice(SHAPES),
                         "rank": random.randint(1, 20)})

3. **Build the Parallel Plot object and draw it in a web browser**

.. code-block:: python

    parallel_plot = pld.ParallelPlot(
        elements=elements,
        axes=["mass", "length", "speed", "shape", "rank"],
        edge_style=edge_style
        )

Once done, the figure can be displayed with the following command line :

.. code-block:: python

    pld.plot_canvas(plot_data_object=parallel_plot, canvas_id='my_parallel_plot')

.. raw:: html

    <iframe src="_static/htmls/section2_4_1_rand_parallelplot.html" height="345px" width="100%"></iframe>

Parallel Plot Features
----------------------

- **Rubberbands can be drawn on axes by clicking and dragging on it with mouse. Rubberbands allow to select range of values on each axis,**
- Axes layout can be changed from vertical to horizontal with the `Change Disposition` button,
- Values order on axes can be changed from ascending to descending by clicking on its title,
- Each axis can be scrolled and scaled with mouse click and wheel,
- Each axis can be moved by clicking on its title and dragging it with mouse,
- Values can be displayed in log scales by clicking on `Log Scale` button,
- One can select several lines with several mouse click by keeping pressed `Ctrl` key,
- One can reset the view by pressing `Ctrl + Space`,
- One can reset the whole figure by pressing `Ctrl + Shift + Left Click`.

How to write a method to draw a Parallel Plot in a DessiaObject ?
-----------------------------------------------------------------

For the previously designed PendulumDOE ([section 2.2.2](https://www.notion.so/Using-data-display-with-PlotData-30f86e58db6240788cf4f3b543b0ae51?pvs=21)), an interesting plot may be to draw all pendulum variables and objective values (`length`, `gravity`, `speed` and `period`).

To do it, add a method to draw a Parallel Plot to the PendulumDOE class:

.. code-block:: python

    class PendulumDOE(Dataset):
    	:
    	:
    	:
      @plot_data_view("parallelplot")
      def parallel_plot(self, reference_path: str = "#"):
        elements = [
          {"period": pendulum.period, "speed": pendulum.max_speed, "length": pendulum.length, "g": pendulum.g}
          for pendulum in self.dessia_objects]
        return pld.ParallelPlot(axes=["g", "length", "period", "speed"], elements=elements)

And draw the Parallel Plot with the function `plot_canvas` :

.. code-block:: python

    # Parameters sampling definition
    planet_sampling = BoundedAttributeValue('g', 1, 11, 10)
    length_sampling = BoundedAttributeValue('length', 0.1, 3, 10)

    # DOE instantiation
    pendulum_doe = PendulumDOE.from_boundaries(planet_sampling, length_sampling, 10, 0.01, method = 'fullfact')

    # Parallel Plot construction
    parallel_plot = pendulum_doe.parallel_plot()

    # Draw the figure in a web browser
    pld.plot_canvas(plot_data_object=parallel_plot, filepath="section2_4_2_parallel_plotod")

.. raw:: html

    <iframe src="_static/htmls/section2_4_2_parallel_plot.html" height="345px" width="100%"></iframe>
