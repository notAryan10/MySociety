import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Dashboard({ navigation }) {

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token')
    navigation.replace("Login")
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>MySociety</Text>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    color: "black",
  },
  logoutBtn: {
    marginTop: 20,
    backgroundColor: "#e63946",
    paddingVertical: 12,
    borderRadius: 10,
    width: 120,
    alignItems: "center",
  },
  logoutText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
