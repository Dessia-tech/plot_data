Histogram: draw the amount of samples in ranges of values
=========================================================

A histogram is a visual representation of the distribution of quantitative data. In other words, it allows to represent the amount of samples for which a chosen attribute is contained in a range of values.

How to draw a Histogram ?
-------------------------

1. **Import the required packages**

.. code-block:: python

    # Required packages
    import random
    import plot_data as pld
    from plot_data.colors import BLUE, GREEN

2. **Create data**

In order to draw a Histogram of a variable sampled randomly, build a random vector of samples (stored as Python `dict`) with one attribute. Here we chose to build a vector of length sampled within a Gaussian distribution.

.. code-block:: python

    # Vector construction
    elements = [{'length': random.gauss(0, 3)} for _ in range(500)]

3. **Set styles for bars and axes**

Styles for bars and axes can be customized with the user’s preferences:

.. code-block:: python

    # Surface Style
    surface_style = pld.SurfaceStyle(color_fill=BLUE)

    # Edge Style
    edge_style = pld.EdgeStyle(line_width=1, color_stroke=GREEN, dashline=[5, 3])

4. **Build the Histogram object and draw it in a web browser**

When building the histogram, ticks number on x axis can be specified with the `graduation_nb` attribute.

.. code-block:: python

    histogram = pld.Histogram(x_variable='length',
                              elements=elements,
                              graduation_nb=20,
                              surface_style=surface_style,
                              edge_style=edge_style)

Once done, the figure can be displayed with the following command line:

.. code-block:: python

    pld.plot_canvas(plot_data_object=histogram, canvas_id='my_histogram')

.. raw:: html

    <iframe src="_static/htmls/section2_5_1_rand_histogram.html" height="345px" width="100%"></iframe>


Histogram Features
------------------

- **Rubberbands can be drawn on axes by clicking and dragging on it with mouse. Rubberbands allow to select range of values on each axis,**
- Bars tooltips give information on how samples are distributed within a clicked bar,
- The view can be adjusted with mouse interactions (click, drag and wheel),
- One can select several bars with several mouse click by keeping pressed `Ctrl` key,
- One can reset the view by pressing `Ctrl + Space`,
- One can reset the whole figure by pressing `Ctrl + Shift + Left Click`.

How to write a method to draw a Histogram in a DessiaObject ?
-------------------------------------------------------------

For the previously designed PendulumDOE ([section 2.2.2](https://www.notion.so/Using-data-display-with-PlotData-30f86e58db6240788cf4f3b543b0ae51?pvs=21)), an interesting plot may be to draw the distribution of pendulums speeds within the previously designed PendulumDOE class.

To do it, add a method to draw a Histogram to the PendulumDOE class:

.. code-block:: python

    class PendulumDOE(Dataset):
    	:
    	:
    	:
      @plot_data_view("histogram")
      def histogram(self, reference_path: str = "#"):
        elements = [{"speed": pendulum.max_speed} for pendulum in self.dessia_objects]
        return pld.Histogram(x_variable="speed", elements=elements, graduation_nb=20)

And draw the Histogram with the function `plot_canvas`:

.. code-block:: python

    # Parameters sampling definition
    planet_sampling = BoundedAttributeValue('g', 1, 11, 10)
    length_sampling = BoundedAttributeValue('length', 0.1, 3, 10)

    # DOE instantiation
    pendulum_doe = PendulumDOE.from_boundaries(planet_sampling, length_sampling, 10, 0.01, method = 'fullfact')

    # Parallel Plot construction
    histogram = pendulum_doe.histogram()

    # Draw the figure in a web browser
    pld.plot_canvas(plot_data_object=histogram, filepath="section_2_5_2_histogram")

.. raw:: html

    <iframe src="_static/htmls/section2_5_2_histogram.html" height="345px" width="100%"></iframe>
