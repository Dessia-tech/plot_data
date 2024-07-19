""" Module to handle nx graphs. """

import networkx as nx
import plot_data


class NetworkxGraph(plot_data.PrimitiveGroup):
    """
    Each node of self.graph can contain its settings in the node.data dictionary.

    Keys can be :
        - 'color' with format 'rgb(xr, xg, xb)', xr, xg, xb are integers between 0 and 255
        - 'shape', choose between '.' for Point2D, 'o' for Circle2D, 's' for bigger Circle2D
        - 'name' with format str
    """
    _non_serializable_attributes = ['graph']

    def __init__(self, graph: nx.Graph, name: str = ''):
        self.graph = graph
        primitives = self._to_primitives()
        plot_data.PrimitiveGroup.__init__(self, primitives=primitives, name=name)

    def _to_primitives(self, text_style: plot_data.TextStyle = None):
        radius = 0.04
        primitives = []
        pos = nx.kamada_kawai_layout(self.graph)

        for edge in self.graph.edges:
            node1, node2 = edge[0], edge[1]
            pos1, pos2 = pos[node1], pos[node2]
            line = plot_data.LineSegment2D([pos1[0], pos1[1]], [pos2[0], pos2[1]], edge_style=plot_data.EdgeStyle())
            primitives.append(line)

        for node, data in self.graph.nodes(data=True):
            position = pos[node]
            color, shape, name = data['color'], data['shape'], data['name']
            x_coord, y_coord = position[0], position[1]
            edge_style = plot_data.EdgeStyle(color_stroke=color)
            surface_style = plot_data.SurfaceStyle(color_fill=color)
            if shape == '.':
                point_style = plot_data.PointStyle(color_fill=color, color_stroke=color, size=4)
                primitive = plot_data.Point2D(x_coord, y_coord, point_style=point_style)

            elif shape == 'o':
                primitive = plot_data.Circle2D(x_coord, y_coord, radius, edge_style=edge_style,
                                               surface_style=surface_style)

            elif shape == 's':
                x_left, x_right, y_down, y_up = x_coord - radius, x_coord + radius, y_coord - radius, y_coord + radius
                l1 = plot_data.LineSegment2D([x_left, y_down], [x_right, y_down])
                l2 = plot_data.LineSegment2D([x_right, y_down], [x_right, y_up])
                l3 = plot_data.LineSegment2D([x_right, y_up], [x_left, y_up])
                l4 = plot_data.LineSegment2D([x_left, y_up], [x_left, y_down])
                primitive = plot_data.Contour2D([l1, l2, l3, l4], edge_style=edge_style, surface_style=surface_style)

            else:
                raise NotImplementedError
            primitives.append(primitive)

            if text_style is None:
                text_style = plot_data.TextStyle(text_color='rgb(0,0,0)', text_align_x='center', text_align_y='middle')

            text = plot_data.Text(name, x_coord, y_coord, text_style=text_style, text_scaling=True,
                                  max_width=2 * radius, multi_lines=False)
            primitives.append(text)

        return primitives

    def to_plot_data(self):
        """ Get the equivalent PlotDataObject. """
        return plot_data.PrimitiveGroup(self.primitives)
