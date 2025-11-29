import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPosts } from '../services/api';
import PostCard from '../components/PostCard';
import CategoryFilter from '../components/CategoryFilter';
import colors from '../styles/colors';

export default function Dashboard({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser()
    fetchPosts()
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [selectedCategory])

  const loadUser = async () => {
    const userData = await AsyncStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const filters = selectedCategory !== 'All' ? { category: selectedCategory } : {}
      const data = await getPosts(filters)
      setPosts(data || [])
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  };

  const handleRefresh = () => {
    setRefreshing(true)
    fetchPosts()
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token')
    await AsyncStorage.removeItem('user')
    navigation.replace('Login')
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.headerTitle}>MySociety</Text>
        {user && (
          <Text style={styles.headerSubtitle}>
            {user.block} • {user.building}
          </Text>
        )}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity style={[styles.logoutBtn, { marginRight: 10, backgroundColor: colors.secondary }]} onPress={() => navigation.navigate('Contacts')}>
          <Text style={styles.logoutText}>Contacts</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>No posts yet</Text>
      <Text style={styles.emptySubtext}>Be the first to share something!</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}

      <CategoryFilter selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <PostCard post={item} onPress={() => navigation.navigate('PostDetail', { postId: item._id })} />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={ <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.accent} /> }
          ListEmptyComponent={renderEmptyState}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreatePost')} activeOpacity={0.8} >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  logoutBtn: {
    backgroundColor: colors.error,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textMuted,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 32,
    color: '#ffffff',
    fontWeight: '300',
  },
});
