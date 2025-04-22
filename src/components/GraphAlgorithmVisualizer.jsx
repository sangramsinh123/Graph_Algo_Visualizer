import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RefreshCw, Plus, ChevronDown, X } from 'lucide-react';

export default function GraphAlgorithmVisualizer() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [nodeIdCounter, setNodeIdCounter] = useState(1);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('bfs');
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(500); // milliseconds
  const [isAddingNode, setIsAddingNode] = useState(false);
  const [isAddingEdge, setIsAddingEdge] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [secondSelectedNode, setSecondSelectedNode] = useState(null);
  const [visitedNodes, setVisitedNodes] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [showAlgorithmMenu, setShowAlgorithmMenu] = useState(false);
  const [startNode, setStartNode] = useState(null);
  const svgRef = useRef(null);
  const animationRef = useRef(null);

  // Add a node at the specified position
  const addNode = (x, y) => {
    const newNode = {
      id: nodeIdCounter,
      x: x,
      y: y,
      label: nodeIdCounter.toString()
    };
    
    setNodes([...nodes, newNode]);
    setNodeIdCounter(nodeIdCounter + 1);
  };

  // Handle canvas click for adding nodes or selecting nodes for edges
  const handleCanvasClick = (e) => {
    if (!svgRef.current) return;
    
    const svgRect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - svgRect.left;
    const y = e.clientY - svgRect.top;
    
    if (isAddingNode) {
      addNode(x, y);
      setIsAddingNode(false);
    }
  };

  // Handle node click for edge creation or algorithm starting point
  const handleNodeClick = (node) => {
    if (isAddingEdge) {
      if (!selectedNode) {
        setSelectedNode(node);
      } else if (selectedNode.id !== node.id) {
        // Check if this edge already exists
        const edgeExists = edges.some(edge => 
          (edge.source === selectedNode.id && edge.target === node.id) || 
          (edge.source === node.id && edge.target === selectedNode.id)
        );
        
        if (!edgeExists) {
          const newEdge = {
            source: selectedNode.id,
            target: node.id,
            weight: 1
          };
          setEdges([...edges, newEdge]);
        }
        setSelectedNode(null);
        setIsAddingEdge(false);
      }
    } else if (!isRunning) {
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
  };

  // Run breadth-first search algorithm
  const runBFS = () => {
    if (!startNode) return;
    
    resetVisualization();
    setIsRunning(true);
    
    const visited = new Set();
    const queue = [startNode.id];
    const visitOrder = [];
    const adjList = {};
    
    // Build adjacency list
    nodes.forEach(node => {
      adjList[node.id] = [];
    });
    
    edges.forEach(edge => {
      adjList[edge.source].push(edge.target);
      adjList[edge.target].push(edge.source); // For undirected graph
    });
    
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
        adjList[currentId].forEach(neighborId => {
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
    const adjList = {};
    
    // Build adjacency list
    nodes.forEach(node => {
      adjList[node.id] = [];
    });
    
    edges.forEach(edge => {
      adjList[edge.source].push(edge.target);
      adjList[edge.target].push(edge.source); // For undirected graph
    });
    
    // DFS steps to animate
    const dfsSteps = [];
    
    const dfs = (nodeId) => {
      visited.add(nodeId);
      dfsSteps.push(nodeId);
      
      adjList[nodeId].forEach(neighborId => {
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
    const adjList = {};
    nodes.forEach(node => {
      adjList[node.id] = [];
    });
    
    edges.forEach(edge => {
      adjList[edge.source].push({ node: edge.target, weight: edge.weight });
      adjList[edge.target].push({ node: edge.source, weight: edge.weight }); // For undirected graph
    });
    
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

  // Start algorithm visualization
  const startVisualization = () => {
    if (!startNode || isRunning) return;
    
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

  return (
    <div className="flex flex-col w-full h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold">Graph Algorithm Visualizer</h1>
      </div>
      
      {/* Toolbar */}
      <div className="bg-white shadow p-4 flex items-center space-x-4">
        <button 
          className={`px-3 py-2 rounded ${isAddingNode ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => {
            setIsAddingNode(!isAddingNode);
            setIsAddingEdge(false);
            setSelectedNode(null);
          }}
        >
          <Plus size={16} className="inline mr-1" /> Add Node
        </button>
        
        <button 
          className={`px-3 py-2 rounded ${isAddingEdge ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => {
            setIsAddingEdge(!isAddingEdge);
            setIsAddingNode(false);
            setSelectedNode(null);
          }}
          disabled={nodes.length < 2}
        >
          Add Edge
        </button>
        
        <div className="relative">
          <button 
            className="px-3 py-2 bg-gray-200 rounded flex items-center"
            onClick={() => setShowAlgorithmMenu(!showAlgorithmMenu)}
          >
            {selectedAlgorithm === 'bfs' && 'Breadth-First Search'}
            {selectedAlgorithm === 'dfs' && 'Depth-First Search'}
            {selectedAlgorithm === 'dijkstra' && 'Dijkstra\'s Algorithm'}
            <ChevronDown size={16} className="ml-2" />
          </button>
          
          {showAlgorithmMenu && (
            <div className="absolute z-10 bg-white shadow-lg rounded mt-1 w-48">
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
          disabled={isRunning || !startNode}
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
      
      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <svg 
          ref={svgRef}
          className="w-full h-full"
          onClick={handleCanvasClick}
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
            
            return (
              <line 
                key={`edge-${index}`}
                x1={sourceNode.x}
                y1={sourceNode.y}
                x2={targetNode.x}
                y2={targetNode.y}
                stroke={isPathEdge ? "#ff6b00" : "#999"}
                strokeWidth={isPathEdge ? 3 : 2}
              />
            );
          })}
          
          {/* Current edge being created */}
          {selectedNode && isAddingEdge && (
            <line 
              x1={selectedNode.x}
              y1={selectedNode.y}
              x2={500}
              y2={300}
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
                  onClick={() => handleNodeClick(node)}
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
          <li>• Click "Add Node" then click on the canvas to place nodes</li>
          <li>• Click "Add Edge" then click on two nodes to connect them</li>
          <li>• Click on a node to set it as the starting point (green node)</li>
          <li>• Select an algorithm from the dropdown menu</li>
          <li>• Click "Start" to visualize the algorithm</li>
          <li>• Red nodes are visited nodes, orange edges show the current path</li>
        </ul>
      </div>
    </div>
  );
}