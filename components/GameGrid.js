/*
import React from 'react';
import { View, TouchableOpacity, Animated } from 'react-native';
import { IMAGES, SELECTED_IMAGES } from '../Utilities/Utils';
import {styles} from "./AllStyles";
function GameGrid({ grid, handleCellPress, selectedCell, hintCells }) {
    return (
        <View style={styles.gridContainer}>
            {grid.map((row, i) => (
                <View key={i} style={styles.row}>
                    {row.map((color, j) => {
                        const isSelected = selectedCell && selectedCell[0] === i && selectedCell[1] === j;
                        const isHinted = hintCells.some(cell => cell[0] === i && cell[1] === j);
                        const imageSource = isSelected || isHinted
                            ? SELECTED_IMAGES["s" + color.charAt(0).toUpperCase() + color.slice(1)]
                            : IMAGES[color];
                        const scale = scaleValues[i][j]; // Assurez-vous de passer les valeurs d'échelle appropriées
                        const opacity = opacityValues[i][j]; // Assurez-vous de passer les valeurs d'opacité appropriées

                        return (
                            <Animated.View key={j} style={[styles.cellAnimated, { transform: [{ scale: scale }], opacity: opacity }]}>
                                <TouchableOpacity onPress={() => handleCellPress(i, j)}>
                                    <Image source={imageSource} style={styles.cell} />
                                </TouchableOpacity>
                            </Animated.View>
                        );
                    })}
                </View>
            ))}
        </View>
    );
}

export default GameGrid;

*/
