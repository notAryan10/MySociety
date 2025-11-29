import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Switch, ScrollView, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserProfile, updateProfile, updateSettings } from '../services/api';
import colors from '../styles/colors';
import { Feather } from '@expo/vector-icons';

const CATEGORIES = ["Maintenance", "Buy/Sell", "Lost & Found", "Events", "Other"];

export default function ProfileScreen({ navigation }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editingName, setEditingName] = useState(false);
    const [newName, setNewName] = useState('');
    const [mutedCategories, setMutedCategories] = useState([]);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const userData = await getUserProfile();
            setUser(userData);
            setNewName(userData.name);
            setMutedCategories(userData.mutedCategories || []);
            // Update local storage
            await AsyncStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
            console.error('Error loading profile:', error);
            Alert.alert('Error', 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateName = async () => {
        if (!newName.trim()) {
            Alert.alert('Error', 'Name cannot be empty');
            return;
        }

        try {
            const updatedUser = await updateProfile(newName.trim());
            setUser(updatedUser);
            setEditingName(false);
            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
            Alert.alert('Success', 'Name updated successfully');
        } catch (error) {
            Alert.alert('Error', error.message || 'Failed to update name');
        }
    };

    const toggleCategoryMute = async (category) => {
        try {
            let newMuted = [...mutedCategories];
            if (newMuted.includes(category)) {
                newMuted = newMuted.filter(c => c !== category);
            } else {
                newMuted.push(category);
            }

            setMutedCategories(newMuted); // Optimistic update
            const updatedUser = await updateSettings(newMuted);
            setUser(updatedUser);
            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        } catch (error) {
            setMutedCategories(mutedCategories); // Revert on error
            Alert.alert('Error', 'Failed to update settings');
        }
    };

    const handleLogout = async () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                        await AsyncStorage.removeItem('token');
                        await AsyncStorage.removeItem('user');
                        navigation.replace('Login');
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.accent} />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Profile & Settings</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Personal Information</Text>
                <View style={styles.card}>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Email</Text>
                        <Text style={styles.value}>{user?.email}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Building</Text>
                        <Text style={styles.value}>{user?.block} - {user?.building}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Name</Text>
                        {editingName ? (
                            <View style={styles.editContainer}>
                                <TextInput
                                    style={styles.input}
                                    value={newName}
                                    onChangeText={setNewName}
                                    autoFocus
                                />
                                <TouchableOpacity onPress={handleUpdateName} style={styles.iconButton}>
                                    <Feather name="check" size={20} color={colors.success} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setEditingName(false)} style={styles.iconButton}>
                                    <Feather name="x" size={20} color={colors.error} />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.valueContainer}>
                                <Text style={styles.value}>{user?.name}</Text>
                                <TouchableOpacity onPress={() => setEditingName(true)}>
                                    <Feather name="edit-2" size={16} color={colors.accent} />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notification Settings</Text>
                <Text style={styles.sectionSubtitle}>Mute categories you don't want to see</Text>
                <View style={styles.card}>
                    {CATEGORIES.map(category => (
                        <View key={category} style={styles.settingRow}>
                            <Text style={styles.settingLabel}>{category}</Text>
                            <Switch
                                value={!mutedCategories.includes(category)}
                                onValueChange={() => toggleCategoryMute(category)}
                                trackColor={{ false: colors.border, true: colors.accent }}
                                thumbColor={'#fff'}
                            />
                        </View>
                    ))}
                </View>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    section: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 8,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 12,
    },
    card: {
        backgroundColor: colors.cardBackground,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    infoRow: {
        marginBottom: 16,
    },
    label: {
        fontSize: 12,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    value: {
        fontSize: 16,
        color: colors.textPrimary,
    },
    valueContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    editContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        backgroundColor: colors.inputBackground,
        color: colors.textPrimary,
        padding: 8,
        borderRadius: 8,
        marginRight: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    iconButton: {
        padding: 8,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    settingLabel: {
        fontSize: 16,
        color: colors.textPrimary,
    },
    logoutButton: {
        margin: 20,
        backgroundColor: colors.error,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    logoutText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
