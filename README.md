# Graph Algorithm Visualizer

![Graph Algorithm Visualizer](https://placeholder-for-project-image.png)

## Live Demo
Check out the live demo: [Graph Algorithm Visualizer](https://graph-algorithm-visualizer-v1.netlify.app/)

## Description
Graph Algorithm Visualizer is an interactive web application that allows users to visualize various graph algorithms in action. This tool is designed to help students, educators, and developers understand how different graph algorithms work by providing a visual representation of their execution.

## Features
- **Interactive Graph Builder**: Create custom graphs by adding nodes and edges with a simple and intuitive interface
- **Multiple Algorithm Support**: Visualize various graph algorithms including:
  - Breadth-First Search (BFS)
  - Depth-First Search (DFS)
  - Dijkstra's Algorithm
  - A* Search Algorithm
  - Minimum Spanning Tree (Prim's)
- **Step-by-Step Visualization**: Watch algorithms execute one step at a time to understand the process
- **Speed Control**: Adjust visualization speed to follow algorithm execution at your own pace
- **Graph Export/Import**: Save your graphs and share them with others

## Technologies Used
- HTML5
- CSS3
- JavaScript (ES6+)
- React.js
- D3.js for graph visualization

## Project Structure
```
graph-algo-visualizer/
├── public/                  # Static files and HTML template
│   ├── index.html           # Main HTML file
│   └── ...
├── src/                     # Source code
│   ├── algorithms/          # Implementation of graph algorithms
│   │   ├── AStar.js         # A* search algorithm
│   │   ├── BFS.js           # Breadth-First Search
│   │   ├── DFS.js           # Depth-First Search
│   │   ├── Dijkstra.js      # Dijkstra's algorithm
│   │   └── MST.js           # Minimum Spanning Tree (Prim's)
│   ├── components/          # React components
│   │   ├── AlgorithmBar/    # Algorithm selection and controls
│   │   ├── Canvas/          # Main visualization area
│   │   ├── Controls/        # User controls (speed, reset, etc.)
│   │   ├── Header/          # Application header
│   │   └── Legend/          # Color/symbol explanation
│   ├── utils/               # Utility functions
│   │   ├── graph.js         # Graph data structure operations
│   │   └── helpers.js       # Helper functions
│   ├── App.js               # Main application component
│   ├── index.js             # Entry point
│   └── ...
├── package.json             # Project dependencies and scripts
├── README.md                # Project documentation
└── ...
```

## Installation and Setup
To run this project locally:

```bash
# Clone the repository
git clone https://github.com/sangramsinh123/Graph_Algo_Visualizer.git

# Navigate to the project directory
cd Graph_Algo_Visualizer

# Install dependencies
npm install

# Start the development server
npm start
```

The application will be available at `https://graph-algorithm-visualizer-v1.netlify.app/`.

## Usage Guide

### Creating a Graph
1. Click on the canvas to add a node
2. Select two nodes to create an edge between them
3. For weighted graphs, specify the weight when creating an edge

### Running Algorithms
1. Select an algorithm from the dropdown menu
2. Choose a starting node (and ending node if applicable)
3. Click "Start" to begin the visualization
4. Use the controls to pause, resume, or step through the algorithm

### Additional Controls
- Use the speed slider to adjust the visualization speed
- Toggle grid alignment if needed
- Clear the graph or generate random graphs using the respective buttons

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments
- Inspiration from various algorithm visualization tools
- Thanks to all contributors who have helped to improve this project

---

Created with ❤️ by Sangramsinh Patil