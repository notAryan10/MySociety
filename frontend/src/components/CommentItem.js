import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../styles/colors';

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

export default function CommentItem({ comment }) {
    return (
        <View style={styles.container}>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                    {comment.user_id?.name?.charAt(0).toUpperCase() || 'U'}
                </Text>
            </View>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.userName}>{comment.user_id?.name || 'Unknown User'}</Text>
                    <Text style={styles.timestamp}>{formatTimestamp(comment.createdAt)}</Text>
                </View>
                <Text style={styles.commentText}>{comment.text}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: colors.background,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.accent,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
    },
    content: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    userName: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    timestamp: {
        fontSize: 12,
        color: colors.textMuted,
    },
    commentText: {
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 20,
    },
});
