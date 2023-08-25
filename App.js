import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import GameScreen from './screens/GameScreen';
import RegisterScreen from "./screens/RegisterScreen";
import {logAllUsers, initializeDB} from "./Utilities/DatabaseOperations";

const Stack = createStackNavigator();

const App = () => {

    useEffect(() => {
        console.log('useEffect triggered.');
        initializeDB((success, message) => {
            if (success) {
                console.log("Database initialization successful.");
                logDatabaseContents();
            } else {
                console.error("Database initialization failed:", message);
            }
        });
    }, []);
    console.log('App component rendered.');
    const logDatabaseContents = () => {
        logAllUsers((success, data) => {
            if (success) {
                console.log("Users:", data);
            } else {
                console.error("Error fetching users:", data);
            }
        });


    }

    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Login">
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="Game" component={GameScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default App;
