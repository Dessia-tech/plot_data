import networkx as nx
import numpy as np

import plot_data


class NetworkxGraph(plot_data.PrimitiveGroup):
    """
    Each node of self.graph can contain its settings in the node.data \
    dictionary. Keys can be :
    'color' with format 'rgb(xr, xg, xb)', xr, xg, xb are integers between \
    0 and 255.
    'shape', choose between '.' for Point2D, 'o' for Circle2D, 's' for bigger \
    Circle2D.
    'name' with format str.
    """
    _non_serializable_attributes = ['graph']

    def __init__(self, graph: nx.Graph, name: str = ''):
        self.graph = graph

        primitives = self._to_primitives()
        plot_data.PrimitiveGroup.__init__(self,
                                          primitives=primitives,
                                          name=name)

    def _to_primitives(self, text_style: plot_data.TextStyle = None):
        r = 0.04
        primitives = []
        pos = nx.kamada_kawai_layout(self.graph)

        for edge in self.graph.edges:
            node1, node2 = edge[0], edge[1]
            pos1, pos2 = pos[node1], pos[node2]
            line = plot_data.LineSegment2D(
                [pos1[0], pos1[1]], [pos2[0], pos2[1]],
                edge_style=plot_data.EdgeStyle())
            primitives.append(line)

        for node, data in self.graph.nodes(data=True):
            position = pos[node]
            color, shape, name = data['color'], data['shape'], data['name']
            x, y = position[0], position[1]
            edge_style = plot_data.EdgeStyle(color_stroke=color)
            surface_style = plot_data.SurfaceStyle(color_fill=color)
            if shape == '.':
                point_style = plot_data.PointStyle(color_fill=color, color_stroke=color, size=4)
                prim = plot_data.Point2D(x, y, point_style=point_style)
            elif shape == 'o':
                prim = plot_data.Circle2D(
                        x, y, r,
                        edge_style=edge_style,
                        surface_style=surface_style)
            elif shape == 's':
                x1, x2, y1, y2 = x - r, x + r, y - r, y + r
                l1 = plot_data.LineSegment2D([x1, y1], [x2, y1])
                l2 = plot_data.LineSegment2D([x2, y1], [x2, y2])
                l3 = plot_data.LineSegment2D([x2, y2], [x1, y2])
                l4 = plot_data.LineSegment2D([x1, y2], [x1, y1])
                prim = plot_data.Contour2D([l1, l2, l3, l4],
                                           edge_style=edge_style,
                                           surface_style=surface_style)
            else:
                raise NotImplementedError
            primitives.append(prim)
            if text_style is None:
                text_style = plot_data.TextStyle(text_color='rgb(0,0,0)',
                                                 text_align_x='center',
                                                 text_align_y='middle')
            text = plot_data.Text(name, x, y, text_style=text_style, max_width=2 * r, multi_lines=False)
            primitives.append(text)

        return primitives

    def to_plot_data(self):
        return plot_data.PrimitiveGroup(self.primitives)
