import { StyleSheet } from 'react-native';
import colors from './colors';

export const globalStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },

    scrollContainer: {
        flexGrow: 1,
        backgroundColor: colors.background,
    },

    contentPadding: {
        padding: 20,
    },

    card: {
        backgroundColor: colors.cardBackground,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },

    title: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 8,
    },

    heading: {
        fontSize: 20,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 8,
    },

    subheading: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
    },

    bodyText: {
        fontSize: 14,
        color: colors.textPrimary,
        lineHeight: 20,
    },

    captionText: {
        fontSize: 12,
        color: colors.textSecondary,
    },

    mutedText: {
        fontSize: 12,
        color: colors.textMuted,
    },
    input: {
        height: 50,
        backgroundColor: colors.inputBackground,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 16,
        fontSize: 16,
        color: colors.textPrimary,
        marginBottom: 12,
    },

    textArea: {
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

    primaryButton: {
        backgroundColor: colors.accent,
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },

    primaryButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },

    secondaryButton: {
        backgroundColor: 'transparent',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
    },

    secondaryButtonText: {
        color: colors.accent,
        fontSize: 16,
        fontWeight: '600',
    },

    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        alignSelf: 'flex-start',
    },

    badgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#ffffff',
    },

    divider: {
        height: 1,
        backgroundColor: colors.divider,
        marginVertical: 12,
    },

    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
});

export default globalStyles;
