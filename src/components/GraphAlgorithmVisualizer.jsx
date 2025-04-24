import React from 'react';
import { useState, useRef } from 'react';
import { Play, Pause, RefreshCw, Plus, ChevronDown } from 'lucide-react';

export default function GraphAlgorithmVisualizer() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [nodeIdCounter, setNodeIdCounter] = useState(1);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('bfs');
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(500); // milliseconds
  const [isAddingEdge, setIsAddingEdge] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [visitedNodes, setVisitedNodes] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [showAlgorithmMenu, setShowAlgorithmMenu] = useState(false);
  const [startNode, setStartNode] = useState(null);
  const [mode, setMode] = useState('addNode'); // Default mode is adding nodes
  const [edgeType, setEdgeType] = useState('undirected'); // Default edge type
  const [editingEdge, setEditingEdge] = useState(null);
  const [edgeWeight, setEdgeWeight] = useState(1);
  const svgRef = useRef(null);
  const animationRef = useRef(null);

  // Add a node at the specified position
  const addNode = (x, y) => {
    // Check if we're clicking too close to an existing node
    const tooClose = nodes.some(node => {
      const distance = Math.sqrt(Math.pow(node.x - x, 2) + Math.pow(node.y - y, 2));
      return distance < 50; // Don't add nodes if they're closer than 50px
    });

    if (!tooClose) {
      const newNode = {
        id: nodeIdCounter,
        x: x,
        y: y,
        label: nodeIdCounter.toString()
      };

      setNodes([...nodes, newNode]);
      setNodeIdCounter(nodeIdCounter + 1);
    }
  };

  // Handle canvas click for adding nodes or selecting nodes for edges
  const handleCanvasClick = (e) => {
    if (!svgRef.current || isRunning) return;

    const svgRect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - svgRect.left;
    const y = e.clientY - svgRect.top;

    // Check if we clicked on a node first
    const clickedNode = nodes.find(node => {
      const distance = Math.sqrt(Math.pow(node.x - x, 2) + Math.pow(node.y - y, 2));
      return distance <= 25; // Node radius
    });

    if (clickedNode) {
      // If we clicked on a node, handle the node click
      handleNodeClick(clickedNode);
    } else if (mode === 'addNode') {
      // If we're in node adding mode and clicked on empty space, add a node
      addNode(x, y);
    } else {
      // If we're clicking on empty space while in edge mode, cancel edge creation
      setSelectedNode(null);
    }
  };

  // Handle node click for edge creation or algorithm starting point
  const handleNodeClick = (node) => {
    if (isRunning) return; // Don't allow interaction during algorithm execution

    if (isAddingEdge) {
      if (!selectedNode) {
        setSelectedNode(node);
      } else if (selectedNode.id !== node.id) {
        // Check if this edge already exists
        const edgeExists = edges.some(edge =>
          (edge.source === selectedNode.id && edge.target === node.id) ||
          (edgeType === 'undirected' && edge.source === node.id && edge.target === selectedNode.id)
        );

        if (!edgeExists) {
          const newEdge = {
            source: selectedNode.id,
            target: node.id,
            weight: edgeWeight,
            type: edgeType
          };
          setEdges([...edges, newEdge]);
        }
        setSelectedNode(null);
      }
    } else {
      // If not adding an edge, set as start node
      setStartNode(node);
    }
  };

  // Reset the visualization
  const resetVisualization = () => {
    setIsRunning(false);
    setVisitedNodes([]);
    setCurrentPath([]);
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
  };

  // Delete a node and its connected edges
  const deleteNode = (nodeId) => {
    setNodes(nodes.filter(node => node.id !== nodeId));
    setEdges(edges.filter(edge => edge.source !== nodeId && edge.target !== nodeId));
    if (startNode && startNode.id === nodeId) {
      setStartNode(null);
    }
  };

  // Toggle between node adding mode and edge adding mode
  const toggleMode = (newMode) => {
    setMode(newMode);
    if (newMode === 'addEdge') {
      setIsAddingEdge(true);
      setSelectedNode(null);
    } else {
      setIsAddingEdge(false);
      setSelectedNode(null);
    }
    setEditingEdge(null);
  };

  // Handle edge click for editing
  const handleEdgeClick = (edge, e) => {
    e.stopPropagation();
    if (isRunning) return;

    setEditingEdge(edge);
    setEdgeWeight(edge.weight);
  };

  // Save edge weight changes
  const saveEdgeWeight = () => {
    if (!editingEdge) return;

    setEdges(edges.map(edge =>
      (edge.source === editingEdge.source && edge.target === editingEdge.target)
        ? { ...edge, weight: parseInt(edgeWeight) || 1 }
        : edge
    ));

    setEditingEdge(null);
  };

  // Delete an edge
  const deleteEdge = (edge, e) => {
    e.stopPropagation();
    setEdges(edges.filter(e =>
      !(e.source === edge.source && e.target === edge.target)
    ));
  };

  // Build adjacency list
  const buildAdjList = (directed = false) => {
    const adjList = {};

    // Initialize empty arrays for each node
    nodes.forEach(node => {
      adjList[node.id] = [];
    });

    // Add edges to adjacency list
    edges.forEach(edge => {
      // For weighted graphs, store node and weight
      adjList[edge.source].push({ node: edge.target, weight: edge.weight });

      // If undirected or the specific edge is undirected, add reverse edge
      if ((edge.type === 'undirected' || !directed)) {
        adjList[edge.target].push({ node: edge.source, weight: edge.weight });
      }
    });

    return adjList;
  };

  // Run breadth-first search algorithm
  const runBFS = () => {
    if (!startNode) return;

    resetVisualization();
    setIsRunning(true);

    const visited = new Set();
    const queue = [startNode.id];
    const visitOrder = [];
    const adjList = buildAdjList();

    // BFS animation
    const animateBFS = () => {
      if (queue.length === 0) {
        setIsRunning(false);
        return;
      }

      const currentId = queue.shift();

      if (!visited.has(currentId)) {
        visited.add(currentId);
        visitOrder.push(currentId);
        setVisitedNodes([...visitOrder]);

        // Add unvisited neighbors to queue
        adjList[currentId].forEach(({ node: neighborId }) => {
          if (!visited.has(neighborId)) {
            queue.push(neighborId);
          }
        });
      }

      animationRef.current = setTimeout(animateBFS, speed);
    };

    animateBFS();
  };

  // Run depth-first search algorithm
  const runDFS = () => {
    if (!startNode) return;

    resetVisualization();
    setIsRunning(true);

    const visited = new Set();
    const visitOrder = [];
    const adjList = buildAdjList();

    // DFS steps to animate
    const dfsSteps = [];

    const dfs = (nodeId) => {
      visited.add(nodeId);
      dfsSteps.push(nodeId);

      adjList[nodeId].forEach(({ node: neighborId }) => {
        if (!visited.has(neighborId)) {
          dfs(neighborId);
        }
      });
    };

    dfs(startNode.id);

    // Animate DFS steps
    let stepIndex = 0;

    const animateDFS = () => {
      if (stepIndex >= dfsSteps.length) {
        setIsRunning(false);
        return;
      }

      visitOrder.push(dfsSteps[stepIndex]);
      setVisitedNodes([...visitOrder]);
      stepIndex++;

      animationRef.current = setTimeout(animateDFS, speed);
    };

    animateDFS();
  };

  // Run Dijkstra's shortest path algorithm
  const runDijkstra = () => {
    if (!startNode) return;

    resetVisualization();
    setIsRunning(true);

    const visitOrder = [];
    const distances = {};
    const previous = {};
    const unvisited = new Set();

    // Initialize
    nodes.forEach(node => {
      distances[node.id] = node.id === startNode.id ? 0 : Infinity;
      previous[node.id] = null;
      unvisited.add(node.id);
    });

    // Build adjacency list with weights
    const adjList = buildAdjList();

    // Animation steps
    const animationSteps = [];

    // Dijkstra algorithm
    while (unvisited.size > 0) {
      // Find node with minimum distance
      let current = null;
      let minDist = Infinity;

      unvisited.forEach(nodeId => {
        if (distances[nodeId] < minDist) {
          minDist = distances[nodeId];
          current = nodeId;
        }
      });

      // If we can't find a node or all remaining are unreachable
      if (current === null || distances[current] === Infinity) break;

      // Add to animation steps
      animationSteps.push(current);

      // Remove from unvisited
      unvisited.delete(current);

      // Update distances to neighbors
      adjList[current].forEach(neighbor => {
        if (unvisited.has(neighbor.node)) {
          const alt = distances[current] + neighbor.weight;
          if (alt < distances[neighbor.node]) {
            distances[neighbor.node] = alt;
            previous[neighbor.node] = current;
          }
        }
      });
    }

    // Animate Dijkstra steps
    let stepIndex = 0;

    const animateDijkstra = () => {
      if (stepIndex >= animationSteps.length) {
        setIsRunning(false);
        return;
      }

      visitOrder.push(animationSteps[stepIndex]);
      setVisitedNodes([...visitOrder]);

      // Build current shortest paths for visualization
      const paths = [];
      nodes.forEach(node => {
        if (previous[node.id] !== null) {
          paths.push({ from: previous[node.id], to: node.id });
        }
      });
      setCurrentPath(paths);

      stepIndex++;
      animationRef.current = setTimeout(animateDijkstra, speed);
    };

    animateDijkstra();
  };

  // Run Bellman-Ford algorithm
  const runBellmanFord = () => {
    if (!startNode) return;

    resetVisualization();
    setIsRunning(true);

    const visitOrder = [];
    const distances = {};
    const previous = {};

    // Initialize distances
    nodes.forEach(node => {
      distances[node.id] = node.id === startNode.id ? 0 : Infinity;
      previous[node.id] = null;
    });

    // Extract all edges in format suitable for Bellman-Ford
    const edgeList = edges.flatMap(edge => {
      const forwardEdge = {
        source: edge.source,
        target: edge.target,
        weight: edge.weight
      };

      if (edge.type === 'undirected') {
        const reverseEdge = {
          source: edge.target,
          target: edge.source,
          weight: edge.weight
        };
        return [forwardEdge, reverseEdge];
      }

      return [forwardEdge];
    });

    // Animation steps
    const animationSteps = [];

    // Bellman-Ford algorithm
    for (let i = 0; i < nodes.length - 1; i++) {
      let updated = false;

      edgeList.forEach(edge => {
        if (distances[edge.source] !== Infinity) {
          const newDist = distances[edge.source] + edge.weight;

          if (newDist < distances[edge.target]) {
            distances[edge.target] = newDist;
            previous[edge.target] = edge.source;
            updated = true;

            if (!animationSteps.includes(edge.target)) {
              animationSteps.push(edge.target);
            }
          }
        }
      });

      if (!updated) break;
    }

    // Check for negative cycles
    let hasNegativeCycle = false;

    edgeList.forEach(edge => {
      if (distances[edge.source] !== Infinity) {
        const newDist = distances[edge.source] + edge.weight;

        if (newDist < distances[edge.target]) {
          hasNegativeCycle = true;
        }
      }
    });

    if (hasNegativeCycle) {
      alert("Graph contains a negative cycle!");
      setIsRunning(false);
      return;
    }

    // Animate Bellman-Ford steps
    let stepIndex = 0;

    const animateBellmanFord = () => {
      if (stepIndex >= animationSteps.length) {
        setIsRunning(false);
        return;
      }

      visitOrder.push(animationSteps[stepIndex]);
      setVisitedNodes([...visitOrder]);

      // Build current shortest paths for visualization
      const paths = [];
      nodes.forEach(node => {
        if (previous[node.id] !== null) {
          paths.push({ from: previous[node.id], to: node.id });
        }
      });
      setCurrentPath(paths);

      stepIndex++;
      animationRef.current = setTimeout(animateBellmanFord, speed);
    };

    animateBellmanFord();
  };

  // Run Floyd-Warshall algorithm
  const runFloydWarshall = () => {
    if (!startNode) return;

    resetVisualization();
    setIsRunning(true);

    const visitOrder = [];
    const nodeIds = nodes.map(node => node.id);

    // Initialize distance matrix
    const dist = {};
    const next = {};

    // Set initial distances
    nodeIds.forEach(i => {
      dist[i] = {};
      next[i] = {};

      nodeIds.forEach(j => {
        dist[i][j] = Infinity;
        next[i][j] = null;
      });

      // Distance to self is 0
      dist[i][i] = 0;
    });

    // Set distances for direct edges
    edges.forEach(edge => {
      dist[edge.source][edge.target] = edge.weight;
      next[edge.source][edge.target] = edge.target;

      // If undirected, add reverse edge
      if (edge.type === 'undirected') {
        dist[edge.target][edge.source] = edge.weight;
        next[edge.target][edge.source] = edge.source;
      }
    });

    // Animation steps for Floyd-Warshall
    const animationSteps = [];

    // Floyd-Warshall algorithm
    nodeIds.forEach(k => {
      nodeIds.forEach(i => {
        nodeIds.forEach(j => {
          if (dist[i][k] + dist[k][j] < dist[i][j]) {
            dist[i][j] = dist[i][k] + dist[k][j];
            next[i][j] = next[i][k];

            if (i === startNode.id && !animationSteps.includes(j)) {
              animationSteps.push(j);
            }
          }
        });
      });
    });

    // Animate Floyd-Warshall steps
    let stepIndex = 0;

    const animateFloydWarshall = () => {
      if (stepIndex >= animationSteps.length) {
        setIsRunning(false);
        return;
      }

      visitOrder.push(animationSteps[stepIndex]);
      setVisitedNodes([...visitOrder]);

      // Build current paths for visualization
      const paths = [];

      nodeIds.forEach(targetId => {
        if (startNode.id !== targetId && next[startNode.id][targetId]) {
          let currentNode = startNode.id;
          while (currentNode !== targetId) {
            const nextNode = next[currentNode][targetId];
            paths.push({ from: currentNode, to: nextNode });
            currentNode = nextNode;
          }
        }
      });

      setCurrentPath(paths);

      stepIndex++;
      animationRef.current = setTimeout(animateFloydWarshall, speed);
    };

    animateFloydWarshall();
  };

  // Run cycle detection algorithm
  const runCycleDetection = () => {
    if (!nodes.length) return;

    resetVisualization();
    setIsRunning(true);

    const visited = new Set();
    const recursionStack = new Set();
    const visitOrder = [];
    const cycles = [];

    const adjList = {};

    // Build adjacency list based on edge type
    nodes.forEach(node => {
      adjList[node.id] = [];
    });

    edges.forEach(edge => {
      adjList[edge.source].push(edge.target);

      if (edge.type === 'undirected') {
        adjList[edge.target].push(edge.source);
      }
    });

    // DFS based cycle detection
    const detectCycle = (nodeId, parent = null) => {
      visited.add(nodeId);
      recursionStack.add(nodeId);
      visitOrder.push(nodeId);

      for (const neighbor of adjList[nodeId]) {
        // Skip parent in undirected graph
        if (neighbor === parent) continue;

        if (!visited.has(neighbor)) {
          if (detectCycle(neighbor, nodeId)) {
            cycles.push({ from: nodeId, to: neighbor });
            return true;
          }
        } else if (recursionStack.has(neighbor)) {
          cycles.push({ from: nodeId, to: neighbor });
          return true;
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    // Try to detect cycle starting from each unvisited node
    let hasCycle = false;
    for (const node of nodes) {
      if (!visited.has(node.id)) {
        if (detectCycle(node.id)) {
          hasCycle = true;
          break;
        }
      }
    }

    // Animation steps
    let stepIndex = 0;

    const animateCycleDetection = () => {
      if (stepIndex >= visitOrder.length) {
        if (hasCycle) {
          setCurrentPath(cycles);
          alert("Cycle detected in the graph!");
        } else {
          alert("No cycle detected in the graph!");
        }
        setIsRunning(false);
        return;
      }

      setVisitedNodes(visitOrder.slice(0, stepIndex + 1));
      stepIndex++;

      animationRef.current = setTimeout(animateCycleDetection, speed);
    };

    animateCycleDetection();
  };

  // Run Union-Find algorithm for connected components
  const runUnionFind = () => {
    resetVisualization();
    setIsRunning(true);

    const visitOrder = [];
    const parent = {};
    const rank = {};

    // Initialize each node as its own parent
    nodes.forEach(node => {
      parent[node.id] = node.id;
      rank[node.id] = 0;
    });

    // Find with path compression
    const find = (nodeId) => {
      if (parent[nodeId] !== nodeId) {
        parent[nodeId] = find(parent[nodeId]);
      }
      return parent[nodeId];
    };

    // Union by rank
    const union = (x, y) => {
      const rootX = find(x);
      const rootY = find(y);

      if (rootX === rootY) return;

      if (rank[rootX] < rank[rootY]) {
        parent[rootX] = rootY;
      } else if (rank[rootX] > rank[rootY]) {
        parent[rootY] = rootX;
      } else {
        parent[rootY] = rootX;
        rank[rootX]++;
      }
    };

    // Process all edges
    const edgeList = edges.map(edge => ({
      source: edge.source,
      target: edge.target
    }));

    // Sort edges if needed (for MST algorithms)
    // edgeList.sort((a, b) => a.weight - b.weight);

    // Animation steps
    const animationSteps = [];
    const connectedComponents = {};

    // Process each edge for animation
    edgeList.forEach(edge => {
      const rootSource = find(edge.source);
      const rootTarget = find(edge.target);

      if (rootSource !== rootTarget) {
        union(edge.source, edge.target);
        animationSteps.push({ from: edge.source, to: edge.target });
      }
    });

    // Find final components for coloring
    nodes.forEach(node => {
      const root = find(node.id);
      if (!connectedComponents[root]) {
        connectedComponents[root] = [];
      }
      connectedComponents[root].push(node.id);
      visitOrder.push(node.id);
    });

    // Animation
    let stepIndex = 0;

    const animateUnionFind = () => {
      if (stepIndex >= animationSteps.length) {
        // Show final connected components
        setVisitedNodes(visitOrder);

        // Create color-coded components
        let componentCount = Object.keys(connectedComponents).length;
        alert(`Graph has ${componentCount} connected component(s)`);

        setIsRunning(false);
        return;
      }

      setCurrentPath(animationSteps.slice(0, stepIndex + 1));
      stepIndex++;

      animationRef.current = setTimeout(animateUnionFind, speed);
    };

    animateUnionFind();
  };

  // Start algorithm visualization
  const startVisualization = () => {
    if (isRunning) return;

    if (selectedAlgorithm !== 'unionFind' && !startNode) {
      alert("Please select a starting node first!");
      return;
    }

    switch (selectedAlgorithm) {
      case 'bfs':
        runBFS();
        break;
      case 'dfs':
        runDFS();
        break;
      case 'dijkstra':
        runDijkstra();
        break;
      case 'bellmanFord':
        runBellmanFord();
        break;
      case 'floydWarshall':
        runFloydWarshall();
        break;
      case 'cycleDetection':
        runCycleDetection();
        break;
      case 'unionFind':
        runUnionFind();
        break;
      default:
        break;
    }
  };

  // Stop algorithm visualization
  const stopVisualization = () => {
    setIsRunning(false);
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
  };

  // Get node by id
  const getNodeById = (id) => {
    return nodes.find(node => node.id === id);
  };

  // Calculate arrow position for directed edges
  const calculateArrowPosition = (source, target) => {
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    // const dist = Math.sqrt(dx * dx + dy * dy);

    // Place arrow 70% along the line
    const x = source.x + dx * 0.7;
    const y = source.y + dy * 0.7;

    // Calculate angle for arrow rotation
    const angle = Math.atan2(dy, dx);

    return { x, y, angle };
  };

  // Get cursor style based on current mode
  const getCursorStyle = () => {
    if (isRunning) return "not-allowed";
    if (mode === 'addNode') return "cell";
    if (isAddingEdge && selectedNode) return "crosshair";
    return "default";
  };

  return (
    <div className="flex flex-col w-full h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 flex justify-center">
        <h1 className="text-2xl font-bold">Graph Algorithm Visualizer</h1>
      </div>

      {/* Toolbar */}
      <div className="bg-white shadow p-4 flex flex-wrap items-center gap-4">
        <button
          className={`px-3 py-2 rounded ${mode === 'addNode' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => toggleMode('addNode')}
        >
          <Plus size={16} className="inline mr-1" /> Node Mode
        </button>

        <button
          className={`px-3 py-2 rounded ${mode === 'addEdge' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => toggleMode('addEdge')}
          disabled={nodes.length < 2}
        >
          Edge Mode
        </button>

        <div className="flex items-center gap-2">
          <span>Edge Type:</span>
          <select
            value={edgeType}
            onChange={(e) => setEdgeType(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="undirected">Undirected</option>
            <option value="directed">Directed</option>
          </select>
        </div>

        <div className="relative">
          <button
            className="px-3 py-2 bg-gray-200 rounded flex items-center"
            onClick={() => setShowAlgorithmMenu(!showAlgorithmMenu)}
          >
            {selectedAlgorithm === 'bfs' && 'Breadth-First Search'}
            {selectedAlgorithm === 'dfs' && 'Depth-First Search'}
            {selectedAlgorithm === 'dijkstra' && 'Dijkstra\'s Algorithm'}
            {selectedAlgorithm === 'bellmanFord' && 'Bellman-Ford Algorithm'}
            {selectedAlgorithm === 'floydWarshall' && 'Floyd-Warshall Algorithm'}
            {selectedAlgorithm === 'cycleDetection' && 'Cycle Detection'}
            {selectedAlgorithm === 'unionFind' && 'Union-Find Algorithm'}
            <ChevronDown size={16} className="ml-2" />
          </button>

          {showAlgorithmMenu && (
            <div className="absolute z-10 bg-white shadow-lg rounded mt-1 w-64">
              <ul>
                <li
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setSelectedAlgorithm('bfs');
                    setShowAlgorithmMenu(false);
                  }}
                >
                  Breadth-First Search
                </li>
                <li
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setSelectedAlgorithm('dfs');
                    setShowAlgorithmMenu(false);
                  }}
                >
                  Depth-First Search
                </li>
                <li
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setSelectedAlgorithm('dijkstra');
                    setShowAlgorithmMenu(false);
                  }}
                >
                  Dijkstra's Algorithm
                </li>
                <li
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setSelectedAlgorithm('bellmanFord');
                    setShowAlgorithmMenu(false);
                  }}
                >
                  Bellman-Ford Algorithm
                </li>
                <li
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setSelectedAlgorithm('floydWarshall');
                    setShowAlgorithmMenu(false);
                  }}
                >
                  Floyd-Warshall Algorithm
                </li>
                <li
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setSelectedAlgorithm('cycleDetection');
                    setShowAlgorithmMenu(false);
                  }}
                >
                  Detect Cycle in a Graph
                </li>
                <li
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setSelectedAlgorithm('unionFind');
                    setShowAlgorithmMenu(false);
                  }}
                >
                  Union-Find Algorithm
                </li>
              </ul>
            </div>
          )}
        </div>

        <div className="flex items-center">
          <span className="mr-2">Speed:</span>
          <input
            type="range"
            min="100"
            max="1000"
            step="100"
            value={speed}
            onChange={(e) => setSpeed(parseInt(e.target.value))}
            className="w-32"
          />
        </div>

        <button
          className="px-3 py-2 bg-green-500 text-white rounded flex items-center"
          onClick={startVisualization}
          disabled={isRunning}
        >
          <Play size={16} className="mr-1" /> Start
        </button>

        <button
          className="px-3 py-2 bg-red-500 text-white rounded flex items-center"
          onClick={stopVisualization}
          disabled={!isRunning}
        >
          <Pause size={16} className="mr-1" /> Stop
        </button>

        <button
          className="px-3 py-2 bg-gray-500 text-white rounded flex items-center"
          onClick={resetVisualization}
        >
          <RefreshCw size={16} className="mr-1" /> Reset
        </button>
      </div>

      {/* Edge Weight Editor */}
      {editingEdge && (
        <div className="bg-white shadow p-4 flex items-center space-x-4">
          <span>Edit Edge Weight:</span>
          <input
            type="number"
            value={edgeWeight}
            min={-100}
            max={100}
            onChange={(e) => setEdgeWeight(parseInt(e.target.value) || 1)}
            className="border rounded px-2 py-1 w-16"
          />
          <button
            className="px-3 py-1 bg-green-500 text-white rounded"
            onClick={saveEdgeWeight}
          >
            Save
          </button>
          <button
            className="px-3 py-1 bg-gray-500 text-white rounded"
            onClick={() => setEditingEdge(null)}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden" style={{ minHeight: '600px' }}>
        <svg
          ref={svgRef}
          className="w-full h-full"
          onClick={handleCanvasClick}
          style={{ cursor: getCursorStyle() }}
          preserveAspectRatio="xMidYMid meet"
          viewBox="0 0 1000 600"
        >
          {/* Edges */}
          {edges.map((edge, index) => {
            const sourceNode = getNodeById(edge.source);
            const targetNode = getNodeById(edge.target);
            if (!sourceNode || !targetNode) return null;

            const isPathEdge = currentPath.some(
              path => (path.from === edge.source && path.to === edge.target) ||
                (path.from === edge.target && path.to === edge.source)
            );

            const lineColor = isPathEdge ? "#ff6b00" : "#999";
            const lineWidth = isPathEdge ? 3 : 2;

            // Calculate midpoint for weight label
            const midX = (sourceNode.x + targetNode.x) / 2;
            const midY = (sourceNode.y + targetNode.y) / 2;

            // Offset the label slightly
            const dx = targetNode.x - sourceNode.x;
            const dy = targetNode.y - sourceNode.y;
            const angle = Math.atan2(dy, dx);
            const offset = 15;
            const labelX = midX + offset * Math.sin(angle);
            const labelY = midY - offset * Math.cos(angle);

            return (
              <g key={`edge-${index}`} onClick={(e) => handleEdgeClick(edge, e)}>
                <line
                  x1={sourceNode.x}
                  y1={sourceNode.y}
                  x2={targetNode.x}
                  y2={targetNode.y}
                  stroke={lineColor}
                  strokeWidth={lineWidth}
                  className="cursor-pointer"
                />

                {/* Weight label */}
                <circle
                  cx={labelX}
                  cy={labelY}
                  r={12}
                  fill="white"
                  stroke="#999"
                />
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="12px"
                >
                  {edge.weight}
                </text>

                {/* Arrow for directed edges */}
                {edge.type === 'directed' && (
                  <g>
                    {(() => {
                      const arrow = calculateArrowPosition(sourceNode, targetNode);
                      return (
                        <polygon
                          points="0,-5 10,0 0,5"
                          transform={`translate(${arrow.x},${arrow.y}) rotate(${arrow.angle * 180 / Math.PI})`}
                          fill={lineColor}
                        />
                      );
                    })()}
                  </g>
                )}

                {/* Delete edge button */}
                <g
                  transform={`translate(${midX - 30}, ${midY - 30})`}
                  onClick={(e) => deleteEdge(edge, e)}
                  className="cursor-pointer"
                >
                  <circle
                    cx={0}
                    cy={0}
                    r={8}
                    fill="red"
                  />
                  <text
                    x={0}
                    y={0}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize="12px"
                    fontWeight="bold"
                  >
                    X
                  </text>
                </g>
              </g>
            );
          })}

          {/* Current edge being created */}
          {selectedNode && isAddingEdge && (
            <line
              x1={selectedNode.x}
              y1={selectedNode.y}
              x2="500"
              y2="300"
              stroke="#999"
              strokeWidth={2}
              strokeDasharray="5,5"
            />
          )}

          {/* Nodes */}
          {nodes.map((node) => {
            const isVisited = visitedNodes.includes(node.id);
            const isStartNode = startNode && startNode.id === node.id;
            const isSelected = selectedNode && selectedNode.id === node.id;

            let fillColor = "#4299e1"; // Default blue
            if (isStartNode) fillColor = "#48bb78"; // Green
            if (isVisited) fillColor = "#f56565"; // Red
            if (isSelected) fillColor = "#ed8936"; // Orange

            return (
              <g key={`node-${node.id}`}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={25}
                  fill={fillColor}
                  stroke={isSelected || isStartNode ? "#2c5282" : "#2b6cb0"}
                  strokeWidth={isSelected || isStartNode ? 3 : 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNodeClick(node);
                  }}
                  className="cursor-pointer"
                />
                <text
                  x={node.x}
                  y={node.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="14px"
                  fontWeight="bold"
                >
                  {node.label}
                </text>
                <circle
                  cx={node.x + 18}
                  cy={node.y - 18}
                  r={10}
                  fill="red"
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNode(node.id);
                  }}
                />
                <text
                  x={node.x + 18}
                  y={node.y - 18}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="14px"
                  fontWeight="bold"
                >
                  X
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Instructions Panel */}
      <div className="bg-white p-4 shadow-inner">
        <h3 className="font-bold mb-2">How to use:</h3>
        <ul className="text-sm">
          <li>• Click anywhere on the canvas to add nodes (Node Mode is default)</li>
          <li>• Switch to Edge Mode and click on two nodes to connect them</li>
          <li>• Select edge type (directed/undirected) before creating edges</li>
          <li>• Click on an edge to edit its weight (important for weighted algorithms)</li>
          <li>• Click on a node to set it as the starting point (green node)</li>
          <li>• Select an algorithm from the dropdown menu</li>
          <li>• Click "Start" to visualize the algorithm</li>
          <li>• Red nodes are visited nodes, orange edges show the current path</li>
        </ul>
      </div>
    </div>
  );
}