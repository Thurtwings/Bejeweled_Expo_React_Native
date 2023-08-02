import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';

const GRID_SIZE = 8;
const COLORS = ['red', 'green', 'blue', 'yellow', 'orange', 'purple', 'pink'];

function createInitialGrid() {
  let newGrid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill().map(() => COLORS[Math.floor(Math.random() * COLORS.length)]));
  return newGrid;
}

function isAdjacent(cell1, cell2) {
  return Math.abs(cell1.i - cell2.i) + Math.abs(cell1.j - cell2.j) === 1;
}

function getMatches(grid) {
  let matches = [];
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE - 2; j++) {
      if (grid[i][j] && grid[i][j] === grid[i][j + 1] && grid[i][j] === grid[i][j + 2]) {
        matches.push({i, j}, {i, j: j + 1}, {i, j: j + 2});
      }
    }
  }
  for (let j = 0; j < GRID_SIZE; j++) {
    for (let i = 0; i < GRID_SIZE - 2; i++) {
      if (grid[i][j] && grid[i][j] === grid[i + 1][j] && grid[i][j] === grid[i + 2][j]) {
        matches.push({i, j}, {i: i + 1, j}, {i: i + 2, j});
      }
    }
  }
  return matches;
}

function removeMatches(grid, matches) {
  let newGrid = JSON.parse(JSON.stringify(grid));
  for (let match of matches) {
    newGrid[match.i][match.j] = null;
  }
  return newGrid;
}

function applyGravity(grid) {
  let newGrid = JSON.parse(JSON.stringify(grid));
  for (let j = 0; j < GRID_SIZE; j++) {
    let emptyI = GRID_SIZE - 1;
    for (let i = GRID_SIZE - 1; i >= 0; i--) {
      if (newGrid[i][j]) {
        [newGrid[i][j], newGrid[emptyI][j]] = [newGrid[emptyI][j], newGrid[i][j]];
        emptyI--;
      }
    }
  }
  return newGrid;
}

function fillEmptyCells(grid) {
  let newGrid = JSON.parse(JSON.stringify(grid));
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      if (!newGrid[i][j]) {
        newGrid[i][j] = COLORS[Math.floor(Math.random() * COLORS.length)];
      }
    }
  }
  return newGrid;
}

const App = () => {
  const [grid, setGrid] = useState(createInitialGrid());
  const [selectedCell, setSelectedCell] = useState(null);

  useEffect(() => {
    let matches = getMatches(grid);
    if (matches.length > 0) {
      let newGrid = removeMatches(grid, matches);
      newGrid = applyGravity(newGrid);
      newGrid = fillEmptyCells(newGrid);
      setGrid(newGrid);
    }
  }, [grid]);

  function handleCellPress(i, j) {
    if (selectedCell) {
      if (isAdjacent(selectedCell, {i, j})) {
        const newGrid = swap(grid, selectedCell, {i, j});
        setGrid(newGrid);
      }
      setSelectedCell(null);
    } else {
      setSelectedCell({i, j});
    }
  }

  function swap(grid, cell1, cell2) {
    const newGrid = JSON.parse(JSON.stringify(grid)); // copy the grid
    const temp = newGrid[cell1.i][cell1.j];
    newGrid[cell1.i][cell1.j] = newGrid[cell2.i][cell2.j];
    newGrid[cell2.i][cell2.j] = temp;
    return newGrid;
  }

  return (
      <View style={styles.container}>
        {grid.map((row, i) => (
            <View key={i} style={styles.row}>
              {row.map((color, j) => (
                  <TouchableOpacity key={j} style={[styles.cell, {backgroundColor: color}]} onPress={() => handleCellPress(i, j)} />
              ))}
            </View>
        ))}
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: 40,
    height: 40,
    margin: 1,
  },
});

export default App;
