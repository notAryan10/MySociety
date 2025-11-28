import React from 'react';
import { View, Text, Button } from 'react-native';

export default function SignUpScreen({ navigation }) {
    return (
        <View>
            <Button title="Login" onPress={() => navigation.navigate('Login')}/>
        </View>
    );
}

