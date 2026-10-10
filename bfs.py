from collections import deque

def bfs(graph, start):
    """
    Breadth-First Search (BFS) traversal on a graph.
    
    Args:
    graph (dict): Adjacency list representation of the graph.
                  Example: {'A': ['B', 'C'], 'B': ['A', 'D'], ...}
    start (str or int): Starting node for traversal.
    
    Returns:
    list: List of nodes in the order they are visited.
    """
    if start not in graph:
        return []
    
    visited = set()
    queue = deque([start])
    visited.add(start)
    traversal_order = []
    
    while queue:
        node = queue.popleft()
        traversal_order.append(node)
        
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    
    return traversal_order

# Sample graph (undirected)
sample_graph = {
    'A': ['B', 'C'],
    'B': ['A', 'D', 'E'],
    'C': ['A', 'F'],
    'D': ['B'],
    'E': ['B', 'F'],
    'F': ['C', 'E']
}

# Demo
if __name__ == "__main__":
    start_node = 'A'
    result = bfs(sample_graph, start_node)
    print(f"BFS traversal starting from '{start_node}': {result}")
    # Expected output: ['A', 'B', 'C', 'D', 'E', 'F']

