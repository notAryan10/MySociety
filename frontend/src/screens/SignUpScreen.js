import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { register, login } from '../services/api';
import colors from '../styles/colors';

export default function SignUpScreen({ navigation }) {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', block: '', building: '', floor: '', room_no: '', });
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
      const userData = { name, email, password, block, building, floor: Number(floor), room_no };

      await register(userData);
      await login(email, password);

      Alert.alert('Success', 'Account created successfully!');
      navigation.replace('MainTabs');
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

        <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor={colors.textMuted} value={formData.name} onChangeText={(text) => handleChange('name', text)} autoCapitalize="words" />
        <TextInput style={styles.input} placeholder="Email" placeholderTextColor={colors.textMuted} value={formData.email} onChangeText={(text) => handleChange('email', text.toLowerCase())} keyboardType="email-address" autoCapitalize="none" textContentType="emailAddress" />
        <TextInput style={styles.input} placeholder="Password" placeholderTextColor={colors.textMuted} value={formData.password} onChangeText={(text) => handleChange('password', text)} secureTextEntry textContentType="newPassword" autoComplete="off" />
        <TextInput style={styles.input} placeholder="Confirm Password" placeholderTextColor={colors.textMuted} value={formData.confirmPassword} onChangeText={(text) => handleChange('confirmPassword', text)} secureTextEntry textContentType="newPassword" autoComplete="off" />
        <TextInput style={styles.input} placeholder="Block (e.g., A, B, C)" placeholderTextColor={colors.textMuted} value={formData.block} onChangeText={(text) => handleChange('block', text)} />
        <TextInput style={styles.input} placeholder="Building Name/Number" placeholderTextColor={colors.textMuted} value={formData.building} onChangeText={(text) => handleChange('building', text)} />
        <TextInput style={styles.input} placeholder="Floor Number" placeholderTextColor={colors.textMuted} value={formData.floor} onChangeText={(text) => handleChange('floor', text.replace(/[^0-9]/g, ''))} keyboardType="number-pad" />
        <TextInput style={styles.input} placeholder="Room Number" placeholderTextColor={colors.textMuted} value={formData.room_no} onChangeText={(text) => handleChange('room_no', text)} />

        <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Creating Account...' : 'Sign Up'}</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={{ color: colors.textSecondary }}>Already have an account? </Text>
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
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 40,
    textAlign: 'center',
    color: colors.textPrimary,
  },
  input: {
    height: 50,
    backgroundColor: colors.inputBackground,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 12,
    fontSize: 16,
    color: colors.textPrimary,
  },
  button: {
    backgroundColor: colors.accent,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  link: {
    color: colors.accent,
    fontWeight: '600',
  },
});
