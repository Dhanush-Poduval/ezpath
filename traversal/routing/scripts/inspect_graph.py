from collections import Counter
from routing.graph import load_graph, print_graph_summary
from routing.accessibility import classify_edge

graph = load_graph("data/campus.graphml")
print_graph_summary(graph)
counts = Counter(classify_edge(data) for _, _, _, data in graph.edges(keys=True, data=True))
print("\nAccessibility tags (raw OSM evidence):")
for name in ("ACCESSIBLE", "INACCESSIBLE", "UNKNOWN"):
    print(f"{name}: {counts[name]}")
print("\nUNKNOWN means OSM does not provide enough evidence; it does not mean inaccessible.")
