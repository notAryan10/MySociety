import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, FlatList, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { getPostById, getComments, createComment } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CommentItem from '../components/CommentItem';
import colors from '../styles/colors';

const getCategoryColor = (category) => {
    const categoryColors = {
        'Maintenance': colors.maintenance,
        'Buy/Sell': colors.buySell,
        'Lost & Found': colors.lostFound,
        'Events': colors.events,
        'Other': colors.other,
    };
    return categoryColors[category] || colors.other;
};

const formatTimestamp = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
};

export default function PostDetailScreen({ route, navigation }) {
    const { postId } = route.params;
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        loadUser();
        fetchPostAndComments();
    }, []);

    const loadUser = async () => {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    };

    const fetchPostAndComments = async () => {
        try {
            setLoading(true);
            const [postData, commentsData] = await Promise.all([
                getPostById(postId),
                getComments(postId),
            ]);
            setPost(postData);
            setComments(commentsData || []);
        } catch (error) {
            console.error('Error fetching post:', error);
            Alert.alert('Error', 'Failed to load post');
        } finally {
            setLoading(false);
        }
    };

    const handleAddComment = async () => {
        if (!commentText.trim()) {
            Alert.alert('Error', 'Please enter a comment');
            return;
        }

        try {
            setSubmitting(true);
            const commentData = {
                post_id: postId,
                user_id: user.id,
                text: commentText.trim(),
            };

            await createComment(commentData);
            setCommentText('');
            fetchPostAndComments();
        } catch (error) {
            Alert.alert('Error', error.message || 'Failed to add comment');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.accent} />
            </View>
        );
    }

    if (!post) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Post not found</Text>
            </View>
        );
    }

    const categoryColor = getCategoryColor(post.category);

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={0} >
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backButton}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Post</Text>
                <View style={{ width: 60 }} />
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.postCard}>
                    <View style={styles.postHeader}>
                        <View style={styles.userInfo}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>
                                    {post.user_id?.name?.charAt(0).toUpperCase() || 'U'}
                                </Text>
                            </View>
                            <View>
                                <Text style={styles.userName}>{post.user_id?.name || 'Unknown User'}</Text>
                                <Text style={styles.userDetails}>
                                    {post.block} • {post.user_id?.building || 'Building'}
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.timestamp}>{formatTimestamp(post.createdAt)}</Text>
                    </View>

                    <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
                        <Text style={styles.categoryText}>{post.category}</Text>
                    </View>

                    <Text style={styles.postText}>{post.text}</Text>

                    {post.isPinned && (
                        <View style={styles.pinnedBadge}>
                            <Text style={styles.pinnedText}>📌 Pinned Post</Text>
                        </View>
                    )}
                </View>

                <View style={styles.commentsSection}>
                    <Text style={styles.commentsTitle}>
                        Comments ({comments.length})
                    </Text>

                    {comments.length === 0 ? (
                        <View style={styles.emptyComments}>
                            <Text style={styles.emptyCommentsText}>No comments yet</Text>
                            <Text style={styles.emptyCommentsSubtext}>Be the first to comment!</Text>
                        </View>
                    ) : (
                        comments.map((comment) => (
                            <CommentItem key={comment._id} comment={comment} />
                        ))
                    )}
                </View>
            </ScrollView>

            <View style={styles.commentInputContainer}>
                <TextInput style={styles.commentInput} placeholder="Add a comment..." placeholderTextColor={colors.textMuted} value={commentText} onChangeText={setCommentText} multiline />
                <TouchableOpacity style={[styles.sendButton, !commentText.trim() && styles.sendButtonDisabled]} onPress={handleAddComment} disabled={submitting || !commentText.trim()} >
                    <Text style={styles.sendButtonText}>
                        {submitting ? '...' : 'Send'}
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
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
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    errorText: {
        fontSize: 16,
        color: colors.textSecondary,
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
    backButton: {
        fontSize: 16,
        color: colors.accent,
    },
    content: {
        flex: 1,
    },
    postCard: {
        backgroundColor: colors.cardBackground,
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    postHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.accent,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '600',
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    userDetails: {
        fontSize: 13,
        color: colors.textSecondary,
        marginTop: 2,
    },
    timestamp: {
        fontSize: 12,
        color: colors.textMuted,
    },
    categoryBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 14,
        alignSelf: 'flex-start',
        marginBottom: 16,
    },
    categoryText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#ffffff',
    },
    postText: {
        fontSize: 16,
        color: colors.textPrimary,
        lineHeight: 24,
    },
    pinnedBadge: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    pinnedText: {
        fontSize: 13,
        color: colors.accent,
        fontWeight: '600',
    },
    commentsSection: {
        marginTop: 8,
    },
    commentsTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.textPrimary,
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    emptyComments: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyCommentsText: {
        fontSize: 16,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    emptyCommentsSubtext: {
        fontSize: 14,
        color: colors.textMuted,
    },
    commentInputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.cardBackground,
    },
    commentInput: {
        flex: 1,
        backgroundColor: colors.inputBackground,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginRight: 8,
        fontSize: 15,
        color: colors.textPrimary,
        maxHeight: 100,
    },
    sendButton: {
        backgroundColor: colors.accent,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    sendButtonDisabled: {
        backgroundColor: colors.textMuted,
    },
    sendButtonText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '600',
    },
});
