import networkx as nx
import plot_data.core as plot_data


class NetworkxGraph(plot_data.PrimitiveGroup):
    _non_serializable_attributes = ['graph']

    def __init__(self, graph: nx.Graph, name: str = ''):
        self.graph = graph

        primitives = self._to_primitives()
        plot_data.PrimitiveGroup.__init__(self,
                                          primitives=primitives,
                                          name=name)

    def _to_primitives(self):
        r = 0.02
        primitives = []
        pos = nx.kamada_kawai_layout(self.graph)

        for edge in self.graph.edges:
            node1, node2 = edge[0], edge[1]
            pos1, pos2 = pos[node1], pos[node2]
            line = plot_data.LineSegment(
                [pos1[0], pos1[1], pos2[0], pos2[1]],
                edge_style=plot_data.EdgeStyle())
            primitives.append(line)

        for node, data in self.graph.nodes(data=True):
            position = pos[node]
            color, shape, name = data['color'], data['shape'], data['name']
            x, y = position[0], position[1]
            edge_style = plot_data.EdgeStyle(color_stroke=color)
            surface_style = plot_data.SurfaceStyle(color_fill=color)
            if shape == 'o':
                prim = plot_data.Circle2D(
                        x, y, r,
                        edge_style=edge_style,
                        surface_style=surface_style)
            elif shape == 's':
                # TODO: changer Circle2D par un carré
                prim = plot_data.Circle2D(
                        x, y, r*2, edge_style=edge_style,
                        surface_style=surface_style)
            else:
                raise NotImplementedError
            primitives.append(prim)

            text_style = plot_data.TextStyle(text_color='rgb(0,0,0)',
                                             text_align_x='center',
                                             text_align_y='middle')
            text = plot_data.Text(name, x, -y, text_style=text_style)
            primitives.append(text)

        return primitives
