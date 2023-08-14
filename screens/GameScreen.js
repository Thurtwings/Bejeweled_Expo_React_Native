import React, {useState, useEffect, useRef} from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Alert, Button, Animated } from 'react-native';
import { GRID_SIZE, COLORS, initializeGrid, getDirection, getMatches, applyGravity, fillGrid, hasPossibleMoves } from '../Utilities/Utils';
import { initializeDB } from '../Utilities/DatabaseOperations';
/*import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('scores.db');*/
/*const GRID_SIZE = 8;
const COLORS = ['red', 'green', 'blue', 'yellow', 'orange', 'purple', 'pink'];*/

/*function initializeGrid() {
    const grid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(null));
    return grid;
}

function getDirection(dx, dy) {
    if (Math.abs(dx) > Math.abs(dy)) {
        return dx > 0 ? 'right' : 'left';
    } else {
        return dy > 0 ? 'down' : 'up';
    }
}

function getMatches(grid, row, col) {
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

function applyGravity(grid) {
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

function fillGrid(grid) {
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

function hasPossibleMoves(grid) {
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
}*/
const MIN_MATCHES = 3;
const ANIMATION_DELAY = 100;
const ANIMATION_DURATION = 1000;



const GameScreen = () => {
    const [grid, setGrid] = useState(() => initializeGrid());
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [selectedCell, setSelectedCell] = useState(null);
    const [gameStarted, setGameStarted] = useState(false);
    const [gridVisible, setGridVisible] = useState(true);
    const animationValues = useRef(
        Array(GRID_SIZE).fill().map(() =>
            Array(GRID_SIZE).fill().map(() => new Animated.Value(0))
        )
    ).current;

    const scaleValues = useRef(
        Array(GRID_SIZE)
            .fill()
            .map(() => Array(GRID_SIZE).fill().map(() => new Animated.Value(1)))
    ).current;

    const opacityValues = useRef(
        Array(GRID_SIZE)
            .fill()
            .map(() => Array(GRID_SIZE).fill().map(() => new Animated.Value(1)))
    ).current;

    useEffect(() => {
        initializeDB();
    }, []);

    useEffect(() => {
        if (gameOver) {
            Alert.alert('Game Over', `Your final score is: ${score}`, [
                {
                    text: 'OK',
                    onPress: () => {
                        setGrid(initializeGrid());
                        setScore(0);
                        setGameOver(false);
                    },
                },
            ]);
        }
    }, [gameOver]);

    useEffect(() => {
        Animated.stagger(ANIMATION_DELAY,
            animationValues.flat().map(value =>
                Animated.timing(value, {
                    toValue: 1,
                    duration: ANIMATION_DURATION,
                    useNativeDriver: true,
                })
            )
        ).start();
    }, [grid, gameStarted]);

    useEffect(() => {
        if (gameStarted) {
            Animated.stagger(
                ANIMATION_DELAY,
                animationValues.flat().map((value) =>
                    Animated.timing(value, {
                        toValue: 1,
                        duration: ANIMATION_DURATION,
                        useNativeDriver: true,
                    })
                )
            ).start();
        }
    }, [grid, gameStarted]);


    function checkAndRemoveMatches(grid) {
        let hasMatches = false;

        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                const matches = getMatches(grid, row, col);
                if (matches.length >= MIN_MATCHES) {
                    hasMatches = true;

                    matches.forEach(([matchRow, matchCol]) => {
                        grid[matchRow][matchCol] = null;
                    });
                }
            }
        }

        if (hasMatches) {
            const gridAfterGravity = applyGravity(grid);
            const gridAfterFilling = fillGrid(gridAfterGravity);
            setGrid(gridAfterFilling);
            checkAndRemoveMatches(gridAfterFilling); // Check for more matches recursively
        }
    }


    const handleCellPress = (row, col) => {
        if (!gameStarted) return;

        if (selectedCell) {
            const [selectedRow, selectedCol] = selectedCell;

            const dx = Math.abs(col - selectedCol);
            const dy = Math.abs(row - selectedRow);

            if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
                const newGrid = [...grid];
                [newGrid[row][col], newGrid[selectedRow][selectedCol]] = [newGrid[selectedRow][selectedCol], newGrid[row][col]];

                const isMatched = getMatches(newGrid, row, col).length >= MIN_MATCHES;
                const isSelectedMatched = getMatches(newGrid, selectedRow, selectedCol).length >= MIN_MATCHES;

                if (isMatched || isSelectedMatched) {
                    setSelectedCell(null);

                    const updatedGrid = [...newGrid];

                    if (isMatched) {
                        const matches = getMatches(newGrid, row, col);
                        matches.forEach(([matchRow, matchCol]) => {
                            updatedGrid[matchRow][matchCol] = null;
                            scaleValues[matchRow][matchCol].setValue(0); // Start the animation
                        });
                    }

                    if (isSelectedMatched) {
                        const matches = getMatches(newGrid, selectedRow, selectedCol);
                        matches.forEach(([matchRow, matchCol]) => {
                            updatedGrid[matchRow][matchCol] = null;
                            scaleValues[matchRow][matchCol].setValue(0); // Start the animation
                        });
                    }

                    setGrid(updatedGrid);
                    setScore(score + (isMatched ? 3 : 0) + (isSelectedMatched ? 3 : 0));

                    // Wait for the animation to complete before applying gravity and filling the grid
                    setTimeout(() => {
                        const gridAfterGravity = applyGravity(updatedGrid);
                        const gridAfterFilling = fillGrid(gridAfterGravity);
                        setGrid(gridAfterFilling);

                        // Check for additional matches after gravity and refilling
                        checkAndRemoveMatches(gridAfterFilling);

                        // Reset animation values after the removal and refilling
                        for (let r = 0; r < GRID_SIZE; r++) {
                            for (let c = 0; c < GRID_SIZE; c++) {
                                scaleValues[r][c].setValue(1);
                            }
                        }
                    }, 100);

                    return;
                }

                // If no match, reset cells positions and animation values
                [newGrid[row][col], newGrid[selectedRow][selectedCol]] = [newGrid[selectedRow][selectedCol], newGrid[row][col]];

                // Reset the animation values for the cells
                scaleValues[row][col].setValue(1);
                scaleValues[selectedRow][selectedCol].setValue(1);

                setGrid(newGrid);
                setSelectedCell(null);
            } else {
                setSelectedCell(null);
            }
        } else {
            setSelectedCell([row, col]);
        }
    };


    const startGame = () => {
        const newGrid = initializeGrid();
        fillGrid(newGrid);
        setGrid(newGrid);
        setGameStarted(true);
    };

    const endGame = () => {
        if (!gameStarted) return;
        setGameStarted(false);

        if (!hasPossibleMoves(grid)) {
            setGameOver(true);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.score}>Score: {score}</Text>
            <Button onPress={startGame} title="Start Game" />
            <Button onPress={endGame} title="End Game" />
            {gridVisible && (
                <View>
                    {grid.map((row, i) => (
                        <View key={i} style={styles.row}>
                            {row.map((color, j) => {
                                const scale = scaleValues[i][j].interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, 1],
                                });

                                return (
                                    <Animated.View
                                        key={j}
                                        style={{
                                            transform: [{ scale }],
                                        }}
                                    >
                                        <TouchableOpacity
                                            style={[styles.cell, { backgroundColor: color }]}
                                            onPress={() => handleCellPress(i, j)}
                                        />
                                    </Animated.View>
                                );
                            })}
                        </View>
                    ))}
                </View>
            )}
            {gameOver && (
                <View>
                    <Text style={styles.gameOverText}>Game Over</Text>
                    <Text style={styles.finalScore}>Your final score is: {score}</Text>
                    <Button onPress={startGame} title="Play Again" />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
    },
    row: {
        flexDirection: 'row',
    },
    cell: {
        width: 40,
        height: 40,
        margin: 1,
    },
    score: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
    },
    gameOverContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gameOverText: {
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    finalScore: {
        fontSize: 20,
        marginBottom: 16,
    },

});

export default GameScreen;