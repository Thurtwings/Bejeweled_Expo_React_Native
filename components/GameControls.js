/*

import React from 'react';
import { View, Text, Button } from 'react-native';
import {styles} from "./AllStyles";
function GameControls({ startGame, togglePause, handleShowTopScores, isPaused, bestScore, score, level, gridVisible, gameOver, gameStarted }) {
    return (
        <View>
            <View style={styles.{/!**!/}headerContainer}>
                <Button onPress={togglePause} title={isPaused ? "Resume" : "Pause"} />
                <Text style={styles.score}>Best Score: {bestScore}</Text>
            </View>
            <Text style={styles.score}>Score: {score} | Level: {level}</Text>

            <View style={styles.buttonContainer}>
                {(!gridVisible || !gameOver) && <Button onPress={startGame} title={gameStarted ? "Restart" : "Start"} />}
                <Button onPress={handleShowTopScores} title={"Top Score"} />
            </View>
        </View>
    );
}

export default GameControls;
*/
