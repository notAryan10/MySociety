import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import colors from '../styles/colors';

const categories = ['All', 'Maintenance', 'Buy/Sell', 'Lost & Found', 'Events', 'Other'];

const getCategoryColor = (category) => {
    const categoryColors = {
        'Maintenance': colors.maintenance,
        'Buy/Sell': colors.buySell,
        'Lost & Found': colors.lostFound,
        'Events': colors.events,
        'Other': colors.other,
    }
    return categoryColors[category] || colors.accent
};

export default function CategoryFilter({ selectedCategory, onSelectCategory }) {
    return (
        <View style={styles.container}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent} >
                {categories.map((category) => {
                    const isSelected = selectedCategory === category;
                    const categoryColor = category === 'All' ? colors.accent : getCategoryColor(category)
                    return (
                        <TouchableOpacity key={category} style={[ styles.chip, isSelected && { backgroundColor: categoryColor }, !isSelected && { borderColor: categoryColor, borderWidth: 1 } ]} onPress={() => onSelectCategory(category)} activeOpacity={0.7} >
                            <Text style={[ styles.chipText, isSelected && styles.chipTextSelected, !isSelected && { color: categoryColor } ]}>
                                {category}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.background,
        paddingVertical: 12,
    },
    scrollContent: {
        paddingHorizontal: 16,
        gap: 8,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        backgroundColor: 'transparent',
    },
    chipText: {
        fontSize: 14,
        fontWeight: '600',
    },
    chipTextSelected: {
        color: '#ffffff',
    },
});
