import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createPoll } from '../services/api';
import colors from '../styles/colors';
import { Feather } from '@expo/vector-icons';

const categories = ['Maintenance', 'Buy/Sell', 'Lost & Found', 'Events', 'Other'];

export default function CreatePollScreen({ navigation }) {
    const [question, setQuestion] = useState('');
    const [category, setCategory] = useState('Other');
    const [options, setOptions] = useState(['', '']);
    const [loading, setLoading] = useState(false);

    const addOption = () => {
        if (options.length < 6) {
            setOptions([...options, '']);
        }
    };

    const removeOption = (index) => {
        if (options.length > 2) {
            setOptions(options.filter((_, i) => i !== index));
        }
    };

    const updateOption = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleSubmit = async () => {
        if (!question.trim()) {
            Alert.alert('Error', 'Please enter a question');
            return;
        }

        const filledOptions = options.filter(opt => opt.trim());
        if (filledOptions.length < 2) {
            Alert.alert('Error', 'Please provide at least 2 options');
            return;
        }

        try {
            setLoading(true);
            const userData = await AsyncStorage.getItem('user');
            const user = JSON.parse(userData);

            const pollData = { question: question.trim(), options: filledOptions, category, block: user.block, building: user.building };

            await createPoll(pollData);
            Alert.alert('Success', 'Poll created successfully!');
            navigation.navigate('MainTabs', {
                screen: 'Home',
                params: { refresh: Date.now() }
            });
        } catch (error) {
            Alert.alert('Error', error.message || 'Failed to create poll');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.cancelButton}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Create Poll</Text>
                <TouchableOpacity onPress={handleSubmit} disabled={loading}>
                    <Text style={[styles.postButton, loading && styles.postButtonDisabled]}>
                        {loading ? 'Creating...' : 'Post'}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.form}>
                <Text style={styles.label}>Category</Text>
                <View style={styles.pickerContainer}>
                    <Picker selectedValue={category} onValueChange={setCategory} style={styles.picker} dropdownIconColor={colors.textPrimary}>
                        {categories.map((cat) => (
                            <Picker.Item key={cat} label={cat} value={cat} color={colors.textPrimary} />
                        ))}
                    </Picker>
                </View>

                <Text style={styles.label}>Question</Text>
                <TextInput style={styles.questionInput} placeholder="Ask a question..." placeholderTextColor={colors.textMuted} value={question} onChangeText={setQuestion} multiline />

                <Text style={styles.label}>Options</Text>
                {options.map((option, index) => (
                    <View key={index} style={styles.optionRow}>
                        <TextInput style={styles.optionInput} placeholder={`Option ${index + 1}`} placeholderTextColor={colors.textMuted} value={option} onChangeText={(value) => updateOption(index, value)} />
                        {options.length > 2 && (
                            <TouchableOpacity onPress={() => removeOption(index)} style={styles.removeButton}>
                                <Feather name="x-circle" size={24} color={colors.error} />
                            </TouchableOpacity>
                        )}
                    </View>
                ))}

                {options.length < 6 && (
                    <TouchableOpacity style={styles.addButton} onPress={addOption}>
                        <Feather name="plus-circle" size={20} color={colors.accent} />
                        <Text style={styles.addButtonText}>Add Option</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
                    <Text style={styles.submitButtonText}>
                        {loading ? 'Creating Poll...' : 'Create Poll'}
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    contentContainer: {
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    cancelButton: {
        fontSize: 16,
        color: colors.textSecondary,
    },
    postButton: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.accent,
    },
    postButtonDisabled: {
        color: colors.textMuted,
    },
    form: {
        padding: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 8,
        marginTop: 16,
    },
    pickerContainer: {
        backgroundColor: colors.inputBackground,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
    },
    picker: {
        color: colors.textPrimary,
        backgroundColor: colors.inputBackground,
    },
    questionInput: {
        minHeight: 100,
        backgroundColor: colors.inputBackground,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: colors.textPrimary,
        textAlignVertical: 'top',
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    optionInput: {
        flex: 1,
        backgroundColor: colors.inputBackground,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: colors.textPrimary,
    },
    removeButton: {
        marginLeft: 12,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        marginTop: 8,
    },
    addButtonText: {
        fontSize: 16,
        color: colors.accent,
        marginLeft: 8,
        fontWeight: '600',
    },
    submitButton: {
        backgroundColor: colors.accent,
        paddingVertical: 16,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 24,
    },
    submitButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
});
