import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { register, login } from '../services/api';

export default function SignUpScreen({ navigation }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    block: '',
    building: '',
    floor: '',
    room_no: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignUp = async () => {
    const { name, email, password, confirmPassword, block, building, floor, room_no } = formData;
    
    if (!name || !email || !password || !confirmPassword || !block || !building || !floor || !room_no) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const userData = {
        name,
        email,
        password,
        block,
        building,
        floor: Number(floor),
        room_no
      };
      
      await register(userData);
      await login(email, password);
      
      Alert.alert('Success', 'Account created successfully!');
    } catch (error) {
      Alert.alert('Sign Up Failed', error.message || 'An error occurred during sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Create Account</Text>
        
        <TextInput style={styles.input} placeholder="Full Name" value={formData.name} onChangeText={(text) => handleChange('name', text)} autoCapitalize="words"/>
        <TextInput style={styles.input} placeholder="Email" value={formData.email} onChangeText={(text) => handleChange('email', text.toLowerCase())} keyboardType="email-address" autoCapitalize="none"/>
        <TextInput style={styles.input} placeholder="Password" value={formData.password} onChangeText={(text) => handleChange('password', text)} secureTextEntry/>
        <TextInput style={styles.input} placeholder="Confirm Password" value={formData.confirmPassword} onChangeText={(text) => handleChange('confirmPassword', text)} secureTextEntry/>
        <TextInput style={styles.input} placeholder="Block (e.g., A, B, C)" value={formData.block} onChangeText={(text) => handleChange('block', text)}/>
        <TextInput style={styles.input} placeholder="Building Name/Number" value={formData.building} onChangeText={(text) => handleChange('building', text)}/>
        <TextInput style={styles.input} placeholder="Floor Number" value={formData.floor} onChangeText={(text) => handleChange('floor', text.replace(/[^0-9]/g, ''))} keyboardType="number-pad"/>
        <TextInput style={styles.input} placeholder="Room Number" value={formData.room_no} onChangeText={(text) => handleChange('room_no', text)}/>
        
        <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Creating Account...' : 'Sign Up'}</Text>
        </TouchableOpacity>
        
        <View style={styles.footer}>
          <Text>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}><Text style={styles.link}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  link: {
    color: '#007AFF',
    fontWeight: '600',
  },
});
