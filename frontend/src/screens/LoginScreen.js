import React from 'react';
import { View, Text, Button } from 'react-native';

export default function LoginScreen({ navigation }) {

    return (
        <View>
            <Button title="Sign Up" onPress={() => navigation.navigate('SignUp')}/>
        </View>
    );
}