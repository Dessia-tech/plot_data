Display several curves in a Graph2D object
==========================================

Graph2D objects also allows to draw several curves on only one figure.

How to create a Graph2D with several curves ?
---------------------------------------------

Several datasets can be used to create a Graph2D. This allows to draw several curves on only one figure. The following code lines show how to specify it to draw `x` and `y` values of a circle with `radius = 1`.

.. code-block:: python

    import numpy

    import plot_data.core as pld
    from plot_data.colors import BLUE, RED

    time = npy.arange(100)
    x_coord = npy.cos(0.1 * time)
    y_coord = npy.sin(0.1 * time)
    x_vector = []
    y_vector = []
    for t, x, y in zip(time, x_coord, y_coord):
    	x_vector.append({"time": t, "amplitude": x})
    	y_vector.append({"time": t, "amplitude": y})

    x_dataset = pld.Dataset(elements=x_vector, edge_style=pld.EdgeStyle(color_stroke=BLUE))
    y_dataset = pld.Dataset(elements=y_vector, edge_style=pld.EdgeStyle(color_stroke=RED))
    graph2d = pld.Graph2D(graphs=[x_dataset, y_dataset], x_variable="time", y_variable="amplitude",)
    pld.plot_canvas(plot_data_object=graph2d, filepath="section2_2_1_alone_multi_graph")

In the case of the pendulum, one can draw both x and y on the same Graph2D.

In order to do it, a function that takes a pendulum as argument and draws a Graph2D with both the curves on the same plot can be written.

.. code-block:: python

    # Function definition
    def pendulum_draw_x_y_vs_time(pendulum):
        x_amplitude = []
        y_amplitude = []
        # Create vector elements with same name for x and y values
        for t, coord in zip(pendulum.time, pendulum.coords):
            x_amplitude.append({"time": t, "amplitude": coord[0]})
            y_amplitude.append({"time": t, "amplitude": coord[1]})

        # Create the two datasets
        x_dataset = pld.Dataset(
    	    elements=x_amplitude,
    	    name="x_amplitude",
    	    edge_style=pld.EdgeStyle(color_stroke=Color(1, 0, 0))
    	    )
        y_dataset = pld.Dataset(
    	    elements=y_amplitude,
    	    name="y_amplitude",
    	    edge_style=pld.EdgeStyle(color_stroke=Color(0, 0, 1))
    	    )

    	  # Draw the Graph2D
        graphs2d = pld.Graph2D(
    	    graphs=[x_dataset, y_dataset],
    	    x_variable="time",
    	    y_variable="amplitude"
    	    )
        pld.plot_canvas(plot_data_object=graphs2d, canvas_id='my_graph2d')

    # Instantiate a pendulum
    pendulum = Pendulum(math.pi / 3, 1, 9.81, 10, 0.01)

    # Draw Graph2D
    pendulum_draw_x_y_vs_time(pendulum)

.. raw:: html
   :file: htmls/section2_2_1_x_and_y.html

How to design a class for getting a Graph2D with several curves ?
-----------------------------------------------------------------

For the pendulum example, a Design Of Experiment (DOE) can be built to generate several pendulums with different masses, lengths, initial angles or even on different planets.

Firstly, Dataset to store all generated pendulums have been designed. Then the `from_boundaries` method has been written to generate sets of pendulum thanks to a sampling. It has been set to produce several solutions in a closed parameter space which is, in this example, constituted of the planet’s gravity `g` and the pendulum’s `length`.

.. code-block:: python

    import math
    from matplotlib import colormaps
    import numpy as npy
    from typing import List

    from dessia_common.core import DessiaObject
    from dessia_common.optimization import BoundedAttributeValue, FixedAttributeValue
    from dessia_common.datatools.dataset import Dataset
    from dessia_common.datatools.sampling import ClassSampler
    from dessia_common.decorators import plot_data_view

    import plot_data.core as pld
    from plot_data.colors import Color, DARK_BLUE, BLUE

    class PendulumDOE(Dataset):
        def __init__(self, dessia_objects: List[DessiaObject] = None, name: str = ''):
            super().__init__(dessia_objects=dessia_objects, name=name)

        @classmethod
        def from_boundaries(cls, planet_sampling: BoundedAttributeValue,
    										    length_sampling: BoundedAttributeValue,
                            duration: float, time_step: float, method: str = 'lhs',
                            n_samples: int = 1000, name: str = ''):
            sampled_attributes = [planet_sampling, length_sampling]
            fixed_attributes = [
                FixedAttributeValue("init_angle", math.pi / 3),
                FixedAttributeValue("duration", 10),
                FixedAttributeValue("time_step", 0.05)
                ]
            sampler = ClassSampler(Pendulum, sampled_attributes, fixed_attributes)
            return cls(sampler.make_doe(n_samples, method).dessia_objects, name=name)

Finally, to draw all curves in a unique Graph2D figure, write specific methods for creating a curve for each pendulum. Here the code is duplicated for the sake of simplicity but every duplicated line should be in a factored method (e.g. colors, for loop,…). Some colors have been added for a better viewing and curves’ name have been set so that the corresponding pendulum’s parameters are shown when clicking on its curve.

.. code-block:: python

    # To add to PendulumDOE class
    @plot_data_view("all_y")
    def all_y_vs_time(self, reference_path: str = "#"):
        datasets = []
        cmap = colormaps["jet"](npy.linspace(0, 1, len(self.dessia_objects)))
        for i, pendulum in enumerate(self.dessia_objects):
            color = Color(*cmap[i][:-1])
            edge_style = pld.EdgeStyle(line_width = 0.8, color_stroke=color)
            elements = [{"time": time, "y": coord[0]} for time, coord in zip(pendulum.time, pendulum.coords)]
            name = f"length: {round(pendulum.length, 2)}, planet: {round(pendulum.g, 2)}"
            dataset = pld.Dataset(elements, name=name, edge_style=edge_style)
            datasets.append(dataset)

        graphs2d = pld.Graph2D(graphs=datasets, x_variable="time", y_variable="y")
        return graphs2d

    @plot_data_view("all_x_y")
    def all_y_vs_x(self, reference_path: str = "#"):
        datasets = []
        cmap = colormaps["jet"](npy.linspace(0, 1, len(self.dessia_objects)))
        for i, pendulum in enumerate(self.dessia_objects):
            color = Color(*cmap[i][:-1])
            edge_style = pld.EdgeStyle(line_width = 0.8, color_stroke=color)
            elements = [{"x": x, "y": y} for x, y in pendulum.coords]
            name = f"length: {round(pendulum.length, 2)}, planet: {round(pendulum.g, 2)}"
            dataset = pld.Dataset(elements, name=name, edge_style=edge_style)
            datasets.append(dataset)

        graphs2d = pld.Graph2D(graphs=datasets, x_variable="x", y_variable="y")
        return graphs2d

Once done, the DOE can be generated and the pendulum behavior curves can be displayed with the following command lines:

.. code-block:: python

    # Parameters sampling definition
    planet_sampling = BoundedAttributeValue('g', 1, 11, 10)
    length_sampling = BoundedAttributeValue('length', 0.1, 3, 10)

    # DOE instantiation
    pendulum_doe = PendulumDOE.from_boundaries(
    	planet_sampling,
    	length_sampling,
    	10,
    	0.01,
    	method = 'fullfact'
    	)

    # Graph2D creation
    y_vs_t_curves = pendulum_doe.all_y_vs_time()
    y_vs_x_curves = pendulum_doe.all_y_vs_x()

    # Plot
    pld.plot_canvas(plot_data_object=y_vs_t_curves, canvas_id='my_graph2d')
    pld.plot_canvas(plot_data_object=y_vs_x_curves, canvas_id='my_graph2d')

.. raw:: html
   :file: htmls/section2_2_2_y_vs_time.html

.. raw:: html
   :file: htmls/section2_2_2_y_vs_x.html
