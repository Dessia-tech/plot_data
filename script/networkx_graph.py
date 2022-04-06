import networkx as nx
import plot_data.graph
import plot_data


graph = nx.Graph()

graph.add_node(1, color='rgb(0, 255, 0)', shape='s', name='node1')
graph.add_node('a', color='rgb(255, 0, 0)', shape='o', name='node2')
graph.add_node(3, color='rgb(0, 0, 255)', shape='s', name='node3')

graph.add_edge(1, 'a')
graph.add_edge('a', 3)
graph.add_edge(3, 1)

plotdata_nx_graph = plot_data.graph.NetworkxGraph(graph)

plot_data.plot_canvas(plotdata_nx_graph, debug_mode=True)
