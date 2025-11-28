import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import colors from '../styles/colors';

const getCategoryColor = (category) => {
    const categoryColors = {
        'Maintenance': colors.maintenance,
        'Buy/Sell': colors.buySell,
        'Lost & Found': colors.lostFound,
        'Events': colors.events,
        'Other': colors.other,
    }
    return categoryColors[category] || colors.other;
};

const formatTimestamp = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
};

export default function PostCard({ post, onPress }) {
    const categoryColor = getCategoryColor(post.category);

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.header}>
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

            <Text style={styles.postText} numberOfLines={4}>
                {post.text}
            </Text>

            {post.images && post.images.length > 0 && ( <Image source={{ uri: post.images[0] }} style={styles.postImage} resizeMode="cover" /> )}
            {post.isPinned && (<View style={styles.pinnedBadge}> <Text style={styles.pinnedText}>📌 Pinned</Text> </View> )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.cardBackground,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    header: {
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
        width: 40,
        height: 40,
        borderRadius: 20,
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
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 2,
    },
    timestamp: {
        fontSize: 12,
        color: colors.textMuted,
    },
    categoryBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginBottom: 12,
    },
    categoryText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#ffffff',
    },
    postText: {
        fontSize: 15,
        color: colors.textPrimary,
        lineHeight: 22,
        marginBottom: 12,
    },
    postImage: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginTop: 8,
    },
    pinnedBadge: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    pinnedText: {
        fontSize: 12,
        color: colors.accent,
        fontWeight: '600',
    },
});
