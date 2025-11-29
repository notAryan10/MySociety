import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { reportPost } from '../services/api';
import colors from '../styles/colors';

const REPORT_CATEGORIES = [
    { id: 'scam', label: 'Scam/Fraud' },
    { id: 'adult', label: 'Adult Content' },
    { id: 'violence', label: 'Violence/Hate' },
    { id: 'ip', label: 'Intellectual Property' },
    { id: 'selfharm', label: 'Self-harm' },
    { id: 'false', label: 'False Information' },
    { id: 'other', label: 'Others' },
];

export default function ReportPostScreen({ route, navigation }) {
    const { postId } = route.params;
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [customReason, setCustomReason] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!selectedCategory) {
            Alert.alert('Error', 'Please select a report category');
            return;
        }

        if (selectedCategory === 'other' && !customReason.trim()) {
            Alert.alert('Error', 'Please provide a reason for reporting');
            return;
        }

        try {
            setLoading(true);
            const reason = selectedCategory === 'other' ? customReason.trim() : REPORT_CATEGORIES.find(cat => cat.id === selectedCategory)?.label;
            await reportPost(postId, reason);
            Alert.alert('Success', 'Post reported successfully. Thank you for helping keep our community safe.', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert('Error', error.message || 'Failed to report post');
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
                <Text style={styles.headerTitle}>Report Post</Text>
                <View style={{ width: 60 }} />
            </View>

            <View style={styles.content}>
                <Text style={styles.sectionTitle}>Why are you reporting this post?</Text>
                <Text style={styles.sectionSubtitle}>
                    Your report is anonymous. If someone is in immediate danger, call local emergency services.
                </Text>

                <View style={styles.categoriesContainer}>
                    {REPORT_CATEGORIES.map((category) => (
                        <TouchableOpacity key={category.id} style={[ styles.categoryOption, selectedCategory === category.id && styles.categoryOptionSelected ]}onPress={() => setSelectedCategory(category.id)}>
                            <View style={styles.radioOuter}>
                                {selectedCategory === category.id && <View style={styles.radioInner} />}
                            </View>
                            <Text style={[ styles.categoryLabel, selectedCategory === category.id && styles.categoryLabelSelected ]}>
                                {category.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {selectedCategory === 'other' && (
                    <View style={styles.customReasonContainer}>
                        <Text style={styles.label}>Please specify the reason:</Text>
                        <TextInput style={styles.textInput} placeholder="Enter your reason here..." placeholderTextColor={colors.textMuted} value={customReason} onChangeText={setCustomReason} multiline numberOfLines={4} textAlignVertical="top" />
                    </View>
                )}

                <TouchableOpacity style={[styles.submitButton, loading && styles.submitButtonDisabled]} onPress={handleSubmit} disabled={loading} >
                    {loading ? (
                        <ActivityIndicator color="#ffffff" />
                    ) : (
                        <Text style={styles.submitButtonText}>Submit Report</Text>
                    )}
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
    content: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 8,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 20,
        marginBottom: 24,
    },
    categoriesContainer: {
        marginBottom: 24,
    },
    categoryOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: colors.inputBackground,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 12,
    },
    categoryOptionSelected: {
        borderColor: colors.accent,
        backgroundColor: colors.accentLight || colors.inputBackground,
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.accent,
    },
    categoryLabel: {
        fontSize: 16,
        color: colors.textPrimary,
        flex: 1,
    },
    categoryLabelSelected: {
        fontWeight: '600',
        color: colors.accent,
    },
    customReasonContainer: {
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 8,
    },
    textInput: {
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
    submitButton: {
        backgroundColor: colors.error,
        paddingVertical: 16,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 8,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
});
