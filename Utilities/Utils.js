import {useRef} from "react";
import {Animated} from "react-native";

export const IMAGES = {
    red: require('../assets/img/1.png'),
    blue: require('../assets/img/2.png'),
    green: require('../assets/img/3.png'),
    purple: require('../assets/img/4.png'),
    yellow: require('../assets/img/5.png'),
    orange: require('../assets/img/6.png'),
    lightBlue: require('../assets/img/7.png'),
    brown: require('../assets/img/8.png'),
};
export const SELECTED_IMAGES = {
    sRed: require('../assets/img/s1.png'),
    sBlue: require('../assets/img/s2.png'),
    sGreen: require('../assets/img/s3.png'),
    sPurple: require('../assets/img/s4.png'),
    sYellow: require('../assets/img/s5.png'),
    sOrange: require('../assets/img/s6.png'),
    sLightBlue: require('../assets/img/s7.png'),
    sBrown: require('../assets/img/s8.png'),
}
export const GRID_SIZE = 8
;

export function initializeGrid() {
    return Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(null));
}
export function getDirection(dx, dy) {
    if (Math.abs(dx) > Math.abs(dy)) {
        return dx > 0 ? 'right' : 'left';
    } else {
        return dy > 0 ? 'down' : 'up';
    }
}
export function getNewPosition(row, col, direction) {
    switch(direction) {
        case 'up':
            return [row - 1, col];
        case 'down':
            return [row + 1, col];
        case 'left':
            return [row, col - 1];
        case 'right':
            return [row, col + 1];
        default:
            throw new Error(`Invalid direction: ${direction}`);
    }
}
/*export function getMatches(grid, row, col) {
    const color = grid[row][col];
    const matches = {
        horizontal: [],
        vertical: []
    };

    // Check horizontal
    let i = col;
    while (i < GRID_SIZE && grid[row][i] === color) {
        matches.horizontal.push([row, i]);
        i++;
    }
    i = col - 1;
    while (i >= 0 && grid[row][i] === color) {
        matches.horizontal.push([row, i]);
        i--;
    }

    // Check vertical
    i = row;
    while (i < GRID_SIZE && grid[i][col] === color) {
        matches.vertical.push([i, col]);
        i++;
    }
    i = row - 1;
    while (i >= 0 && grid[i][col] === color) {
        matches.vertical.push([i, col]);
        i--;
    }

    // Consolidate matches if they meet a minimum threshold
    let finalMatches = [];
    if (matches.horizontal.length >= 3) {
        finalMatches = finalMatches.concat(matches.horizontal);
    }
    if (matches.vertical.length >= 3) {
        finalMatches = finalMatches.concat(matches.vertical);
    }

    return finalMatches;
}*/
export const getMatches = (grid, row, col, callback) => {
    const colorToMatch = grid[row][col];
    if (!colorToMatch) return [];

    const directions = [
        { x: 0, y: 1 },
        { x: 0, y: -1 },
        { x: 1, y: 0 },
        { x: -1, y: 0 },
    ];

    const visited = new Set();
    const matches = [];

    const checkDirection = (row, col, direction) => {
        const newRow = row + direction.y;
        const newCol = col + direction.x;

        if (newRow < 0 || newRow >= GRID_SIZE || newCol < 0 || newCol >= GRID_SIZE) {
            return;
        }

        if (visited.has(`${newRow},${newCol}`)) {
            return;
        }

        if (grid[newRow][newCol] === colorToMatch) {
            visited.add(`${newRow},${newCol}`);
            matches.push([newRow, newCol]);
            checkDirection(newRow, newCol, direction);
        }
    };

    visited.add(`${row},${col}`);
    matches.push([row, col]);

    directions.forEach((direction) => checkDirection(row, col, direction));

    // Appelle le rappel avec le nombre de correspondances
    if (callback) {
        callback(matches.length);
    }

    return matches;
};

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
    const colorKeys = Object.keys(IMAGES);
    for (let row = GRID_SIZE - 1; row >= 0; row--) {
        for (let col = 0; col < GRID_SIZE; col++) {
            if (newGrid[row][col] === null) {
                let color;
                do {
                    color = colorKeys[Math.floor(Math.random() * colorKeys.length)];
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

export function create2DArrayWithNewAnimatedValues() {
    return useRef(
        Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill().map(() => new Animated.Value(1)))
    ).current;
}

export function getDelayFromCenter(row, col, GRID_SIZE, ANIMATION_DURATION) {
    const center = (GRID_SIZE - 1) / 2;
    const maxDist = Math.sqrt(center * center + center * center);
    const dist = Math.sqrt((row - center) * (row - center) + (col - center) * (col - center));
    return (dist / maxDist) * ANIMATION_DURATION;
}

