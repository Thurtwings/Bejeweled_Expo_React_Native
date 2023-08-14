export const GRID_SIZE = 8;
export const COLORS = ['red', 'green', 'blue', 'yellow', 'orange', 'purple', 'pink'];

export function initializeGrid() {
    const grid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(null));
    return grid;
}

export function getDirection(dx, dy) {
    if (Math.abs(dx) > Math.abs(dy)) {
        return dx > 0 ? 'right' : 'left';
    } else {
        return dy > 0 ? 'down' : 'up';
    }
}

export function getMatches(grid, row, col) {
    const color = grid[row][col];
    const matches = [];

    // check horizontal
    let i = col;
    while (i < GRID_SIZE && grid[row][i] === color) {
        matches.push([row, i]);
        i++;
    }
    i = col - 1;
    while (i >= 0 && grid[row][i] === color) {
        matches.push([row, i]);
        i--;
    }

    // check vertical if there are less than 3 matches
    if (matches.length < 3) {
        matches.length = 0;
        let i = row;
        while (i < GRID_SIZE && grid[i]?.[col] === color) {
            matches.push([i, col]);
            i++;
        }
        i = row - 1;
        while (i >= 0 && grid[i]?.[col] === color) {
            matches.push([i, col]);
            i--;
        }
    }

    if (matches.length < 3) {
        return [];
    }

    return matches;
}

export function applyGravity(grid) {
    const newGrid = [...grid];
    for (let col = 0; col < GRID_SIZE; col++) {
        let ptr = GRID_SIZE - 1;
        for (let row = GRID_SIZE - 1; row >= 0; row--) {
            if (newGrid[row][col] !== null) {
                [newGrid[ptr][col], newGrid[row][col]] = [newGrid[row][col], newGrid[ptr][col]];
                ptr--;
            }
        }
    }
    return newGrid;
}

export function fillGrid(grid) {
    const newGrid = [...grid];
    for (let row = GRID_SIZE - 1; row >= 0; row--) {
        for (let col = 0; col < GRID_SIZE; col++) {
            if (newGrid[row][col] === null) {
                let color;
                do {
                    color = COLORS[Math.floor(Math.random() * COLORS.length)];
                } while (
                    (newGrid[row][col - 1] === color && newGrid[row][col - 2] === color) ||
                    (newGrid[row + 1]?.[col] === color && newGrid[row + 2]?.[col] === color)
                    );
                newGrid[row][col] = color;
            }
        }
    }
    return newGrid;
}

export function hasPossibleMoves(grid) {
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {

            if (col < GRID_SIZE - 1) {
                [grid[row][col], grid[row][col + 1]] = [grid[row][col + 1], grid[row][col]];
                if (getMatches(grid, row, col).length >= 3 || getMatches(grid, row, col + 1).length >= 3) {
                    [grid[row][col], grid[row][col + 1]] = [grid[row][col + 1], grid[row][col]]; // swap back
                    return true;
                }
                [grid[row][col], grid[row][col + 1]] = [grid[row][col + 1], grid[row][col]]; // swap back
            }
            if (row < GRID_SIZE - 1) {
                [grid[row][col], grid[row + 1][col]] = [grid[row + 1][col], grid[row][col]];
                if (getMatches(grid, row, col).length >= 3 || getMatches(grid, row + 1, col).length >= 3) {
                    [grid[row][col], grid[row + 1][col]] = [grid[row + 1][col], grid[row][col]]; // swap back
                    return true;
                }
                [grid[row][col], grid[row + 1][col]] = [grid[row + 1][col], grid[row][col]]; // swap back
            }
        }
    }
    return false;
}