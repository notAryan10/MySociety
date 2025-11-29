import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createPost, uploadImage } from '../services/api';
import colors from '../styles/colors';

const categories = ['Maintenance', 'Buy/Sell', 'Lost & Found', 'Events', 'Other'];

export default function CreatePostScreen({ navigation }) {
    const [text, setText] = useState('');
    const [category, setCategory] = useState('Other');
    const [selectedImage, setSelectedImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Please grant camera roll permissions to upload images');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [4, 3], quality: 0.8 });

        if (!result.canceled && result.assets[0]) {
            setSelectedImage(result.assets[0]);
        }
    };

    const removeImage = () => {
        setSelectedImage(null);
    };

    const handleSubmit = async () => {
        if (!text.trim()) {
            Alert.alert('Error', 'Please enter post content');
            return;
        }

        try {
            setLoading(true);
            const userData = await AsyncStorage.getItem('user');
            const user = JSON.parse(userData);

            let imageUrl = null;

            if (selectedImage) {
                const uploadResult = await uploadImage(selectedImage.uri);
                if (uploadResult.success) {
                    imageUrl = uploadResult.url;
                }
            }

            const postData = { text: text.trim(), category, block: user.block, building: user.building, user_id: user.id, images: imageUrl ? [imageUrl] : [] }
            await createPost(postData);
            Alert.alert('Success', 'Post created successfully!');
            navigation.navigate('MainTabs', {
                screen: 'Home',
                params: { refresh: Date.now() }
            });
        } catch (error) {
            Alert.alert('Error', error.message || 'Failed to create post');
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
                <Text style={styles.headerTitle}>Create Post</Text>
                <TouchableOpacity onPress={handleSubmit} disabled={loading}>
                    <Text style={[styles.postButton, loading && styles.postButtonDisabled]}>
                        {loading ? 'Posting...' : 'Post'}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.form}>
                <Text style={styles.label}>Category</Text>
                <View style={styles.pickerContainer}>
                    <Picker selectedValue={category} onValueChange={setCategory} style={styles.picker} dropdownIconColor={colors.textPrimary} >
                        {categories.map((cat) => (
                            <Picker.Item key={cat} label={cat} value={cat} color={colors.textPrimary} />
                        ))}
                    </Picker>
                </View>

                <Text style={styles.label}>What's on your mind?</Text>
                <TextInput style={styles.textArea} placeholder="Share something with your community..." placeholderTextColor={colors.textMuted} value={text} onChangeText={setText} multiline numberOfLines={8} textAlignVertical="top" />

                <View style={styles.imageSection}>
                    <Text style={styles.label}>Add Image (Optional)</Text>

                    {selectedImage ? (
                        <View style={styles.imagePreviewContainer}>
                            <Image source={{ uri: selectedImage.uri }} style={styles.imagePreview} resizeMode="cover" />
                            <TouchableOpacity style={styles.removeImageButton} onPress={removeImage} >
                                <Text style={styles.removeImageText}>✕</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity style={styles.uploadButton} onPress={pickImage} >
                            <Text style={styles.uploadButtonText}>📷 Choose Image</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading} >
                    <Text style={styles.submitButtonText}>
                        {loading ? 'Creating Post...' : 'Create Post'}
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
    textArea: {
        minHeight: 150,
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
    imageSection: {
        marginTop: 8,
    },
    uploadButton: {
        backgroundColor: colors.inputBackground,
        borderWidth: 2,
        borderColor: colors.border,
        borderStyle: 'dashed',
        borderRadius: 10,
        paddingVertical: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    uploadButtonText: {
        fontSize: 16,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    imagePreviewContainer: {
        position: 'relative',
        borderRadius: 10,
        overflow: 'hidden',
    },
    imagePreview: {
        width: '100%',
        height: 200,
        borderRadius: 10,
    },
    removeImageButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: colors.error,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeImageText: {
        color: '#ffffff',
        fontSize: 18,
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
