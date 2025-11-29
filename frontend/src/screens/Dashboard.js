import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPosts, deletePost, pinPost } from '../services/api';
import PostCard from '../components/PostCard';
import CategoryFilter from '../components/CategoryFilter';
import colors from '../styles/colors';

export default function Dashboard({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mutedCategories, setMutedCategories] = useState([]);

  const loadUser = useCallback(async () => {
    try {
      const userData = await AsyncStorage.getItem('user')
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAdmin(parsedUser.is_admin || false);
        setMutedCategories(parsedUser.mutedCategories || []);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');
      setUser(null);
      setIsAdmin(false);
    }
  }, []);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true)
      const filters = selectedCategory !== 'All' ? { category: selectedCategory } : {}
      const data = await getPosts(filters)
      let filteredData = data || [];
      if (selectedCategory === 'All' && mutedCategories.length > 0) {
        filteredData = filteredData.filter(post => !mutedCategories.includes(post.category));
      }
      setPosts(filteredData)
    } catch (error) {
      console.error('Error fetching posts:', error)
      if (error.message === 'Invalid token') {
        await AsyncStorage.removeItem('token')
        await AsyncStorage.removeItem('user')
        navigation.replace('Login')
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [selectedCategory, navigation, mutedCategories]);

  useEffect(() => {
    loadUser();
    fetchPosts();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadUser();
      fetchPosts();
    });
    return unsubscribe;
  }, [navigation]);

  // Fetch posts when category changes
  useEffect(() => {
    if (selectedCategory) {
      fetchPosts();
    }
  }, [selectedCategory]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true)
    fetchPosts()
  }, [fetchPosts])

  const handleNavigateToContacts = useCallback(() => {
    navigation.navigate('Contacts')
  }, [navigation])

  const renderHeader = useMemo(() => (
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
        <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: colors.secondary }]} onPress={handleNavigateToContacts}>
          <Text style={styles.logoutText}>Contacts</Text>
        </TouchableOpacity>
      </View>
    </View>
  ), [user, handleNavigateToContacts])

  const renderEmptyState = useMemo(() => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>No posts yet</Text>
      <Text style={styles.emptySubtext}>Be the first to share something!</Text>
    </View>
  ), [])

  const handleNavigateToPost = useCallback((postId) => {
    navigation.navigate('PostDetail', { postId })
  }, [navigation])

  const handleNavigateToCreatePost = useCallback(() => {
    navigation.navigate('CreatePost')
  }, [navigation])

  const handleReport = useCallback((postId) => {
    navigation.navigate('ReportPost', { postId })
  }, [navigation])

  const handleDelete = useCallback(async (postId) => {
    try {
      await deletePost(postId);
      setPosts(currentPosts => currentPosts.filter(post => post._id !== postId));
      Alert.alert('Success', 'Post deleted successfully');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to delete post');
    }
  }, []);

  const handlePin = useCallback(async (postId) => {
    try {
      const updatedPost = await pinPost(postId);
      setPosts(currentPosts => currentPosts.map(post =>
        post._id === postId ? { ...post, isPinned: updatedPost.isPinned } : post
      ).sort((a, b) => {
        if (a.isPinned === b.isPinned) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        return a.isPinned ? -1 : 1;
      }));
      Alert.alert('Success', updatedPost.isPinned ? 'Post pinned' : 'Post unpinned');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to pin post');
    }
  }, []);

  const renderItem = useCallback(({ item }) => (
    <PostCard
      post={item}
      onPress={() => handleNavigateToPost(item._id)}
      onReport={handleReport}
      isAdmin={isAdmin}
      onDelete={handleDelete}
      onPin={handlePin}
    />
  ), [handleNavigateToPost, handleReport, isAdmin, handleDelete, handlePin]);

  const keyExtractor = useCallback((item) => item._id, []);

  const refreshControl = useMemo(() => (
    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.accent} />
  ), [refreshing, handleRefresh])

  return (
    <View style={styles.container}>
      {renderHeader}

      <CategoryFilter selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <FlatList data={posts} keyExtractor={keyExtractor} renderItem={renderItem} contentContainerStyle={styles.listContent} refreshControl={refreshControl} ListEmptyComponent={renderEmptyState} />
      )}

      <TouchableOpacity style={styles.fab} onPress={handleNavigateToCreatePost} activeOpacity={0.8} >
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
