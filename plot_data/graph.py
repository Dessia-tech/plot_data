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
        r = 0.01
        primitives = []
        pos = nx.kamada_kawai_layout(self.graph)

        for edge in self.graph.edges:
            node1, node2 = edge[0], edge[1]
            pos1, pos2 = pos[node1], pos[node2]
            line = plot_data.LineSegment(
                [pos1[0], pos1[1], pos2[0], pos2[1]],
                plot_data_states=[plot_data.Settings()])
            primitives.append(line)

        for node, data in self.graph.nodes(data=True):
            position = pos[node]
            color, shape = data['color'], data['shape']
            x, y = position[0], position[1]
            if shape == 'o':
                prim = plot_data.Circle2D(
                        x, y, r, plot_data_states=[plot_data.Settings()])
            elif shape == 's':
                # TODO: changer Circle2D par un carré
                prim = plot_data.Circle2D(
                        x, y, r*2, plot_data_states=[plot_data.Settings()])
            else:
                raise NotImplementedError

            contour = plot_data.Contour2D(
                [prim],
                [plot_data.Settings(
                    color_surface=plot_data.ColorSurfaceSet(color),
                    color_line=color)])
            primitives.append(contour)

        return primitives
