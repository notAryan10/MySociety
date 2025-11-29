import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking } from 'react-native';
import colors from '../styles/colors';
import { Ionicons } from '@expo/vector-icons';

const contacts = [
  { id: '1', name: 'Security Guard', role: 'Main Gate', phone: '9876543210' },
  { id: '2', name: 'Society Office', role: 'Administration', phone: '213456789' },
  { id: '3', name: 'Plumber', role: 'Maintenance', phone: '9876543211' },
  { id: '4', name: 'Electrician', role: 'Maintenance', phone: '9876543212' },
  { id: '5', name: 'Lift Technician', role: 'Emergency', phone: '9876543213' },
  { id: '6', name: 'Ambulance', role: 'Emergency', phone: '102' },
  { id: '7', name: 'Police', role: 'Emergency', phone: '100' },
  { id: '8', name: 'Fire Brigade', role: 'Emergency', phone: '101' },
];

export default function ContactsScreen({ navigation }) {
  const handleCall = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.role}>{item.role}</Text>
        <Text style={styles.phone}>{item.phone}</Text>
      </View>
      <TouchableOpacity style={styles.callButton} onPress={() => handleCall(item.phone)}>
        <Ionicons name="call" size={24} color="#ffffffff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Important Contacts</Text>
      </View>

      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  listContent: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textaccent,
    marginBottom: 4,
  },
  role: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  phone: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: '500',
  },
  callButton: {
    backgroundColor: colors.accent,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
