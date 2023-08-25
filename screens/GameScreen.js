import { LinearGradient } from "expo-linear-gradient";
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Alert, Button, Animated, Image, ImageBackground } from 'react-native';
import { initializeDB, getTopScores, saveScore, getUserBestScore } from '../Utilities/DatabaseOperations';
import { GRID_SIZE, IMAGES, SELECTED_IMAGES, create2DArrayWithNewAnimatedValues, getDelayFromCenter, initializeGrid, getMatches, applyGravity, fillGrid, hasPossibleMoves, getNewPosition} from '../Utilities/Utils';

const MIN_MATCHES = 3;
const ANIMATION_DURATION = 1000;
const PROGRESS_BAR_INITIAL = 50;
const LEVEL_SPEED_INCREASE = 1.2;
const MAX_TRIES = 10;
const GameScreen = ({ route }) => {
    // Récupération depuis la page de Login
    const username = route.params?.username || 'Xx_D4rK$4sùK3_xX';

    // Variables d'état
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(1);
    const [tries, setTries] = useState(MAX_TRIES);
    const [seconds, setSeconds] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [bestScore, setBestScore] = useState(0);
    const [hintCells, setHintCells] = useState([]);
    const [isAnimating, setIsAnimating] = useState(true);
    const [gridVisible, setGridVisible] = useState(true);
    const [gameStarted, setGameStarted] = useState(false);
    const [selectedCell, setSelectedCell] = useState(null);
    const [grid, setGrid] = useState(() => initializeGrid());
    const [progressBar, setProgressBar] = useState(PROGRESS_BAR_INITIAL);

    // Variables pour l'animation de la grille
    const scaleValues = create2DArrayWithNewAnimatedValues();
    const opacityValues = create2DArrayWithNewAnimatedValues();


    // Fonction pour gérer la pause
    const handlePause = () => {
        setIsPaused(prevState => !prevState);
    };

    //handleCellPress, handleSwap, processMatch, updateGridForMatch, reverseSwap, finalizeGridUpdates
    /*
     * Gère l'appui sur une cellule de la grille de jeu.
     * Si une cellule est déjà sélectionnée, elle tente de
     * l'échanger avec la nouvelle cellule sélectionnée.
     */
    const handleCellPress = (row, col) => {
        if (isAnimating || !gameStarted) return;

        if (selectedCell)
        {
            const [selectedRow, selectedCol] = selectedCell;
            const diffX = Math.abs(col - selectedCol);
            const diffY = Math.abs(row - selectedRow);

            if ((diffX === 1 && diffY === 0) || (diffX === 0 && diffY === 1))
            {
                handleSwap(row, col, selectedRow, selectedCol);
            }
            else
            {
                setSelectedCell(null);
            }
        }
        else
        {
            setSelectedCell([row, col]);
        }
    };

    /* Gère le swap de 2 cells dans la grille, puis traite le match si c'en est un, sinon, on annule le swap.*/
    const handleSwap = (row, col, selectedRow, selectedCol) => {
        const newGrid = [...grid];
        [newGrid[row][col], newGrid[selectedRow][selectedCol]] = [newGrid[selectedRow][selectedCol], newGrid[row][col]];

        const isMatched = getMatches(newGrid, row, col).length >= MIN_MATCHES;
        const isSelectedMatched = getMatches(newGrid, selectedRow, selectedCol).length >= MIN_MATCHES;

        if (isMatched || isSelectedMatched)
        {
            processMatch(row, col, selectedRow, selectedCol, newGrid, isMatched, isSelectedMatched);
        }
        else
        {
            reverseSwap(row, col, selectedRow, selectedCol, newGrid);
        }
    };

    /*Réduit le nombre d'essais Traite le match trouvé en faisant une update de la grille, en effaçant (met à null) les cells du match */
    const processMatch = (row, col, selectedRow, selectedCol, newGrid, isMatched, isSelectedMatched) => {
        if(tries > 0)
        {
            setTries(prevState => tries - 1);
        }


        setSelectedCell(null);
        const updatedGrid = [...newGrid];

        updateGridForMatch(row, col, updatedGrid, isMatched);
        updateGridForMatch(selectedRow, selectedCol, updatedGrid, isSelectedMatched);

        setGrid(updatedGrid);

        setTimeout(() => {
            finalizeGridUpdates(updatedGrid);
        }, 100);
    };

    /* Met à jour la grille si un match trouvé, en effaçant les cells correspondantes et update le score et la progressBar.*/
    const updateGridForMatch = (row, col, updatedGrid, isMatched) => {
        if (isMatched) {
            const matches = getMatches(grid, row, col, (numMatches) => {
                // Utilisez numMatches pour augmenter la barre de progression en fonction du nombre de correspondances
                increaseProgressBar(numMatches);
            });
            setScore(score + calculateScore(matches.length));
            matches.forEach(([matchRow, matchCol]) => {
                updatedGrid[matchRow][matchCol] = null;
                scaleValues[matchRow][matchCol].setValue(0);
            });
        }
    };


    const reverseSwap = (row, col, selectedRow, selectedCol, newGrid) => {
        [newGrid[row][col], newGrid[selectedRow][selectedCol]] = [newGrid[selectedRow][selectedCol], newGrid[row][col]];
        scaleValues[row][col].setValue(1);
        scaleValues[selectedRow][selectedCol].setValue(1);
        setGrid(newGrid);
        setSelectedCell(null);
    };

    const finalizeGridUpdates = (updatedGrid) => {
        const gridAfterGravity = applyGravity(updatedGrid);
        const gridAfterFilling = fillGrid(gridAfterGravity);
        setGrid(gridAfterFilling);
        checkAndRemoveMatches(gridAfterFilling);
        for (let r = 0; r < GRID_SIZE; r++)
        {
            for (let c = 0; c < GRID_SIZE; c++)
            {
                scaleValues[r][c].setValue(1);
            }
        }
    };


    /*C'est un peu le "pote" qui donne un coup de main quand on est coincé.
    Il parcourt la grille, cherche une correspondance potentielle,
    et vous donne un indice en mettant en évidence deux cellules que vous pouvez échanger.
    Mais attention, il vous en coûtera 50 points !*/
    const showHint = () => {
        // Début de la recherche d'un indice
        outerLoop:
            for (let row = 0; row < GRID_SIZE; row++)
            {
                for (let col = 0; col < GRID_SIZE; col++)
                {
                    const directions = ['up', 'down', 'left', 'right'];

                    for (let dir of directions)
                    {
                        const [newRow, newCol] = getNewPosition(row, col, dir);
                        // Vérification de la validité de la nouvelle position
                        if (newRow >= 0 && newRow < GRID_SIZE && newCol >= 0 && newCol < GRID_SIZE)
                        {
                            const clonedGrid = JSON.parse(JSON.stringify(grid));
                            // Échange des cellules
                            [clonedGrid[row][col], clonedGrid[newRow][newCol]] = [clonedGrid[newRow][newCol], clonedGrid[row][col]];

                            // Vérification de la correspondance
                            if (getMatches(clonedGrid, newRow, newCol).length >= MIN_MATCHES || getMatches(clonedGrid, row, col).length >= MIN_MATCHES)
                            {
                                const identifiedHintCells = [[row, col], [newRow, newCol]];
                                setHintCells(identifiedHintCells);
                                // Sortie de la boucle si un indice est trouvé
                                break outerLoop;
                            }
                        }
                    }
                }
            }
        // Réduction du score
        setScore(score - 50);
    };

    const calculateScore = (numImages) => {
        switch (numImages) {
            case 3:
                return 100 * level;
            case 4:
                return 300 * level;
            case 5:
                return 1000 * level;
            default:
                return 0;
        }
    };
    const handleLevelCompletion = () => {
        setLevel(prevLevel => prevLevel + 1);
    };
    const increaseProgressBar = (value) => {
        setProgressBar(progressBar + value);
    };
    const startGame = () =>
    {
        const newGrid = fillGrid(initializeGrid())
        setGrid(newGrid);
        setGameStarted(true);
        setGameOver(false);
        setScore(0);
        setLevel(1);
        setSeconds(0);
        setGridVisible(true);
        setProgressBar(PROGRESS_BAR_INITIAL);
        setBestScore(bestScore);
        setTries(MAX_TRIES);
    };
    const endGame = () =>
    {
        if (!gameStarted) return;

        saveScore(username, score, (success, message) => {
            if (success)
            {
                console.log("Score saved successfully");
            }
            else
            {
                console.error("Failed to save score:", message);
            }
        });

        setGameStarted(false);
        setGameOver(true);

        if (!hasPossibleMoves(grid))
        {
            setGameOver(true);
        }

        setGridVisible(false);
    };

    useEffect(() => {

        if (score > level * 1000)
        {
            setLevel(prevLevel => prevLevel + 1);
            setTries(MAX_TRIES);
        }
    }, [score]);

    useEffect(() => {
        initializeDB();
    }, []);

    useEffect(() => {

        if(tries <= 0)
        {
            setGameOver(true);
        }
    });

    useEffect(() => {
        getUserBestScore(username, (success, score) => {
            if (success)
            {
                //console.log("Success pour best score");
                setBestScore(score);
            }
        });
    }, [username]);
    const handleShowTopScores = () => {
        //console.log("Fetching top scores...");
        getTopScores((success, scores) => {
           // console.log("Top scores fetched:", success, scores);

            if (success)
            {
                const topScoresMessage = scores.map((score, index) => `${index + 1}. ${score.username} : ${score.best_score}`).join('\n');
                Alert.alert('Top 3 Scores', topScoresMessage);
            }
            else
            {
                console.error("Failed to fetch top scores");
            }
        });
    };


    //Anim de départ
    useEffect(() => {

        if (gameStarted)
        {
            grid.forEach((row, i) =>
            {
                row.forEach((_, j) =>
                {
                    Animated.sequence([
                        Animated.delay(getDelayFromCenter(i, j, GRID_SIZE, ANIMATION_DURATION)),
                        Animated.parallel([
                            Animated.timing(opacityValues[i][j], {
                                toValue: 1,
                                duration: ANIMATION_DURATION,
                                useNativeDriver: true,
                            }),
                            Animated.spring(scaleValues[i][j], {
                                toValue: 1,
                                friction: 3,
                                useNativeDriver: true,
                            }),
                        ]),
                    ]).start(() =>
                    {
                        setIsAnimating(false);
                    });
                });
            });
        }
    }, [grid, gameStarted]);
    //Anim de indices
    useEffect(() => {
        if (hintCells.length > 0) {
            console.log("Animating hint cells: ", hintCells);
            hintCells.forEach(([row, col]) => {
                Animated.sequence([
                    Animated.timing(scaleValues[row][col], {
                        toValue: 1.2,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(scaleValues[row][col], {
                        toValue: 1,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                ]).start();
            });

            // Vidage du tableau d'indice, pour ne pas avoir d'éventuelle undefined exception
            setTimeout(() => {
                setHintCells([]);
            }, 1000);
        }
    }, [hintCells]);

    useEffect(() => {

        if (gameStarted && !isPaused)
        {
            const timer = setInterval(() => {
                setProgressBar(prev => {
                    const newProgress = prev - (level * LEVEL_SPEED_INCREASE);

                    if (newProgress <= 0)
                    {
                        endGame();
                        clearInterval(timer);
                        return 0;
                    }

                    if (newProgress >= 100)
                    {
                        handleLevelCompletion();
                        return PROGRESS_BAR_INITIAL;
                    }

                    return newProgress;
                });
            }, 3000);

            return () => clearInterval(timer);
        }
    }, [gameStarted, isPaused, level]);

    function checkAndRemoveMatches(grid)
    {
        let hasMatches = false;

        for (let row = 0; row < GRID_SIZE; row++)
        {
            for (let col = 0; col < GRID_SIZE; col++)
            {
                const matches = getMatches(grid, row, col, (numMatches) => {
                    increaseProgressBar(numMatches);
                });

                if (matches.length >= MIN_MATCHES)
                {
                    hasMatches = true;
                    setScore(prevScore => prevScore + calculateScore(matches.length));

                    matches.forEach(([matchRow, matchCol]) => {
                        grid[matchRow][matchCol] = null;
                    });
                }
            }
        }

        if (hasMatches)
        {
            const gridAfterGravity = applyGravity(grid);
            const gridAfterFilling = fillGrid(gridAfterGravity);

            setGrid(gridAfterFilling);
            checkAndRemoveMatches(gridAfterFilling);
        }
    }


    return (
        <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.container}>

            <View style={styles.container}>
                <View style={styles.headerContainer}>
                    <Button onPress={handlePause} title={isPaused ? "Resume" : "Pause"} />
                    <Text style={styles.score}>
                        Best Score: {bestScore}
                    </Text>
                </View>

                <Text style={styles.score}>
                    Score: {score} | Niveau: {level}
                </Text>
                <Text style={styles.tries}>
                    Essais restant: {tries}/{MAX_TRIES}
                </Text>

                <View style={styles.buttonContainer}>

                    {(!gridVisible || !gameOver) && <Button onPress={startGame} title={gameStarted? "Restart" : "Start"}/>}

                    <Button onPress={handleShowTopScores} title={"Top Score"}/>

                </View>


                <View style={styles.gridContainer}>

                    {gridVisible && !isPaused && grid.map((row, i) => (
                        <View key={i} style={styles.row}>
                            {row.map((color, j) => {

                                const isSelected = selectedCell && selectedCell[0] === i && selectedCell[1] === j;
                                const isHinted = hintCells.some(cell => cell[0] === i && cell[1] === j);
                                const imageSource = isSelected || isHinted
                                    ? SELECTED_IMAGES["s" + color.charAt(0).toUpperCase() + color.slice(1)]
                                    : IMAGES[color];
                                const scale = scaleValues[i][j];
                                const opacity = opacityValues[i][j];

                                return (
                                    <Animated.View
                                        key={j}
                                        style={[styles.cellAnimated, {transform: [{scale: scale}], opacity: opacity}]}
                                    >
                                        <TouchableOpacity onPress={() => handleCellPress(i, j)}>
                                            <Image source={imageSource} style={styles.cell}/>
                                        </TouchableOpacity>
                                    </Animated.View>
                                );
                            })}
                        </View>
                    ))}
                </View>
                <View style={styles.progressBarContainer}>
                    <Text style={styles.progressBarText}>{Math.round(progressBar)}%</Text>
                    <ImageBackground source={require('../assets/hud/progress_background.png')} style={styles.progressBackground}>
                        <Image source={require('../assets/hud/progress_foreground.png')} style={{ width: `${progressBar}%`, height: '80%', marginEnd: 3, marginTop: 2 }} />

                    </ImageBackground>
                </View>
                <View>
                    {gridVisible && !gameOver && !isPaused && (
                        <Button onPress={showHint} title="Hint -50 points"/>
                    )}
                </View>
                {gameOver && (
                    <View style={styles.overlayContainer}>
                        <Text style={styles.overlayText}>Game Over</Text>
                        <Text style={styles.finalScore}>{username}, ton score final est: {score}</Text>

                        <Button onPress={startGame} title="Rejouer"/>
                    </View>
                )}

                {isPaused && (
                    <View style={styles.overlayContainer}>
                        <Text style={styles.overlayText}>Game Paused</Text>
                        <Button onPress={handlePause} title="Resume"/>
                    </View>
                )}
            </View>
        </LinearGradient>
    );
};



const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    pauseButtonContainer: {
        position: 'absolute',
        top: 10,
        left: 10,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
    },
    progressBarContainer: {
        marginVertical: 20,
    },
    progressBackground: {
        width: '100%',
        height: 20,
        justifyContent: 'flex-start',
    },
    tries: {
        fontSize: 11,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
        color: 'white',
    },
    progressBarText : {
        fontSize: 13,
        fontWeight: 'bold',
        textAlign: 'center',
        color: 'white',
        marginBottom: 5
    },
    gridContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    row: {
        flexDirection: 'row',
    },
    cell: {
        width: 40,
        height: 40,
        margin: 1,
        resizeMode: 'cover',
    },
    cellAnimated: {
        width: 40,
        height: 40,
        margin: 1,
    },
    score: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
        color: 'white',
    },
    overlayContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 15,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: 10,
    },
    overlayText: {
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 16,
        color: 'white',
        textAlign: 'center',
    },
    finalScore: {
        fontSize: 20,
        marginBottom: 16,
        color: 'white',
        textAlign: 'center',
    },
});

export default GameScreen;

