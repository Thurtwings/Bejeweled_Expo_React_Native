import React from 'react';
import { Image, ImageBackground } from 'react-native';

function ProgressBar({ progress }) {
    return (
        <ImageBackground source={require('../assets/hud/progress_background.png')} style={{ width: '100%', height: 20, justifyContent: 'flex-start' }}>
            <Image source={require('../assets/hud/progress_foreground.png')} style={{ width: `${progress}%`, height: '100%', marginEnd: 3 }} />
        </ImageBackground>
    );
}

export default ProgressBar;
