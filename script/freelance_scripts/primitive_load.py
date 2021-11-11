import plot_data
import random
primitive_group = plot_data.PrimitiveGroup.load_from_file('../../../samples/plot_data_example.json')
primitive_group2 = plot_data.PrimitiveGroup.load_from_file('../../../samples/plot_data_example2.json')
primitive_group3 = plot_data.PrimitiveGroup.load_from_file('../../../samples/plot_data_example3.json')

fat_primitives = plot_data.PrimitiveGroup.load_from_file('../../../samples/plot_data_object.json')

elements = []
for k in range(50):
    elements.append({'mass': random.uniform(0, 50),
                     'length': random.uniform(10, 40)})

scatter_plot = plot_data.Scatter(x_variable='mass', y_variable='length')
parallel_plot = plot_data.ParallelPlot(to_disp_attribute_names=['mass', 'length'])

primitive_groups = [primitive_group, primitive_group2, primitive_group3, primitive_group,
                    primitive_group2, primitive_group3, primitive_group]
container = plot_data.PrimitiveGroupsContainer(primitive_groups=primitive_groups,
                                               associated_elements=[1,2,3,4,5,6,7],
                                               x_variable='mass', y_variable='length')

plots = [scatter_plot, parallel_plot, container]
multiplot = plot_data.MultiplePlots(plots=plots, elements=elements, initial_view_on=True)
plot_data.plot_canvas(plot_data_object=fat_primitives, debug_mode=True)