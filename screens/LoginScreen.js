import React, {useEffect, useState} from 'react';
import { StyleSheet, View, TextInput, Button, Alert, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {authenticateUser} from '../Utilities/DatabaseOperations';

const LoginScreen = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {


        if (!username || !password) {
            Alert.alert('Error', 'Merci de remplir les deux champs.');
            return;
        }

        authenticateUser(username, password, (success, message) => {
            if (success) {

                navigation.navigate('Game', { username });
            } else {
                Alert.alert('Connection ratée', message);
            }
        });
    };


    return (
        <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.container}>
            <Text style={styles.title}>Welcome!</Text>

            <TextInput
                style={styles.input}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            <Text style={styles.text}>No account yet?</Text>
            <TouchableOpacity style={[styles.button, styles.registerButton]} onPress={() => navigation.navigate('Register')}>
                <Text style={styles.buttonText}>Register</Text>
            </TouchableOpacity>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        marginBottom: 40,
    },
    input: {
        height: 50,
        borderColor: 'white',
        borderWidth: 1,
        borderRadius: 25,
        marginBottom: 15,
        paddingLeft: 15,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    button: {
        alignItems: 'center',
        backgroundColor: '#DDDDDD',
        padding: 10,
        borderRadius: 25,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    registerButton: {
        backgroundColor: '#DDDDDD',
    },
    buttonText: {
        fontSize: 16,
        color: 'black',
        fontWeight: "bold"
    },
    text: {
        textAlign: 'center',
        color: 'white',
        marginBottom: 10,
    }
});

export default LoginScreen;
