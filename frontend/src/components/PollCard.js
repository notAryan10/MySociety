import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import colors from '../styles/colors';

export default function PollCard({ poll, onVote, onDelete, onPin, isAdmin, currentUserId }) {
    const totalVotes = useMemo(() => {
        return poll.options.reduce((sum, option) => sum + option.votes.length, 0);
    }, [poll.options]);

    const userVotedIndex = useMemo(() => {
        return poll.options.findIndex(option =>
            option.votes.some(vote => vote._id === currentUserId || vote === currentUserId)
        );
    }, [poll.options, currentUserId]);

    const hasVoted = userVotedIndex !== -1;

    const getPercentage = (votes) => {
        if (totalVotes === 0) return 0;
        return Math.round((votes / totalVotes) * 100);
    };

    const getCategoryColor = (category) => {
        const categoryColors = {
            'Maintenance': colors.maintenance,
            'Buy/Sell': colors.buySell,
            'Lost & Found': colors.lostFound,
            'Events': colors.events,
            'Other': colors.other,
        };
        return categoryColors[category] || colors.accent;
    };

    const formatTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    return (
        <View style={styles.card}>
            {poll.isPinned && (
                <View style={styles.pinnedBanner}>
                    <Feather name="bookmark" size={14} color={colors.accent} />
                    <Text style={styles.pinnedText}>Pinned</Text>
                </View>
            )}

            <View style={styles.header}>
                <View style={styles.userInfo}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {poll.user_id?.name?.charAt(0).toUpperCase() || 'U'}
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.userName}>{poll.user_id?.name || 'Unknown'}</Text>
                        <Text style={styles.userDetails}>
                            {poll.user_id?.block} • {poll.user_id?.building}
                        </Text>
                    </View>
                </View>
                <View style={styles.headerRight}>
                    <Text style={styles.timeAgo}>{formatTimeAgo(poll.createdAt)}</Text>
                    {isAdmin && (
                        <View style={styles.adminActions}>
                            <TouchableOpacity onPress={() => onPin(poll._id)} style={styles.iconButton}>
                                <Feather name="bookmark" size={20} color={poll.isPinned ? colors.accent : colors.textSecondary} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => onDelete(poll._id)} style={styles.iconButton}>
                                <Feather name="trash-2" size={20} color={colors.error} />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>

            <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(poll.category) }]}>
                <Text style={styles.categoryText}>{poll.category}</Text>
            </View>

            <Text style={styles.question}>{poll.question}</Text>

            <View style={styles.optionsContainer}>
                {poll.options.map((option, index) => {
                    const percentage = getPercentage(option.votes.length);
                    const isUserVote = index === userVotedIndex;

                    return (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.option,
                                hasVoted && styles.optionVoted,
                                isUserVote && styles.optionUserVoted
                            ]}
                            onPress={() => !hasVoted && onVote(poll._id, index)}
                            disabled={hasVoted}
                            activeOpacity={hasVoted ? 1 : 0.7}
                        >
                            <View style={[styles.progressBar, { width: `${percentage}%` }]} />
                            <View style={styles.optionContent}>
                                <Text style={[styles.optionText, isUserVote && styles.optionTextSelected]}>
                                    {option.text}
                                    {isUserVote && ' ✓'}
                                </Text>
                                {hasVoted && (
                                    <Text style={[styles.percentage, isUserVote && styles.percentageSelected]}>
                                        {percentage}%
                                    </Text>
                                )}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <Text style={styles.totalVotes}>
                {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
            </Text>
        </View>
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
    pinnedBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.accent + '20',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        marginBottom: 12,
        alignSelf: 'flex-start',
    },
    pinnedText: {
        color: colors.accent,
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
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
    headerRight: {
        alignItems: 'flex-end',
    },
    timeAgo: {
        fontSize: 12,
        color: colors.textSecondary,
        marginBottom: 8,
    },
    adminActions: {
        flexDirection: 'row',
        gap: 8,
    },
    iconButton: {
        padding: 4,
    },
    categoryBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginBottom: 12,
    },
    categoryText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '600',
    },
    question: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 16,
    },
    optionsContainer: {
        marginBottom: 12,
    },
    option: {
        position: 'relative',
        borderWidth: 2,
        borderColor: colors.border,
        borderRadius: 8,
        marginBottom: 10,
        overflow: 'hidden',
        minHeight: 48,
    },
    optionVoted: {
        borderColor: colors.accent + '40',
    },
    optionUserVoted: {
        borderColor: colors.accent,
        borderWidth: 2,
    },
    progressBar: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        backgroundColor: colors.accent + '20',
    },
    optionContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        zIndex: 1,
    },
    optionText: {
        fontSize: 16,
        color: colors.textPrimary,
        fontWeight: '500',
        flex: 1,
    },
    optionTextSelected: {
        fontWeight: '700',
        color: colors.accent,
    },
    percentage: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textSecondary,
        marginLeft: 12,
    },
    percentageSelected: {
        color: colors.accent,
    },
    totalVotes: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
    },
});
