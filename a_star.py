from heapq import heappush, heappop

def a_star(graph, start, goal, heuristic):
    open_list = []
    heappush(open_list, (0, start))
    
    came_from = {}
    g_cost = {node: float('inf') for node in graph}
    g_cost[start] = 0
    
    f_cost = {node: float('inf') for node in graph}
    f_cost[start] = heuristic[start]

    while open_list:
        current = heappop(open_list)[1]

        if current == goal:
            path = []
            while current in came_from:
                path.append(current)
                current = came_from[current]
            path.append(start)
            path.reverse()
            return path

        for neighbor, cost in graph[current].items():
            temp_g = g_cost[current] + cost

            if temp_g < g_cost[neighbor]:
                came_from[neighbor] = current
                g_cost[neighbor] = temp_g
                f_cost[neighbor] = temp_g + heuristic[neighbor]
                heappush(open_list, (f_cost[neighbor], neighbor))

    return None


# Graph representation
graph = {
    'A': {'B': 1, 'C': 3},
    'B': {'A': 1, 'D': 5, 'E': 2},
    'C': {'A': 3, 'F': 4},
    'D': {'B': 5},
    'E': {'B': 2, 'F': 1},
    'F': {'C': 4, 'E': 1}
}

# Heuristic values
heuristic = {
    'A': 6,
    'B': 4,
    'C': 4,
    'D': 3,
    'E': 2,
    'F': 0
}

start = 'A'
goal = 'F'

path = a_star(graph, start, goal, heuristic)

print("Shortest Path:", path)