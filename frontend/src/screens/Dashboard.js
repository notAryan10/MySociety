import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Alert, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPosts, deletePost, pinPost, getPolls, voteOnPoll, deletePoll, pinPoll } from '../services/api';
import PostCard from '../components/PostCard';
import PollCard from '../components/PollCard';
import CategoryFilter from '../components/CategoryFilter';
import colors from '../styles/colors';
import { Feather } from '@expo/vector-icons';

export default function Dashboard({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);

  const loadUser = useCallback(async () => {
    try {
      const userData = await AsyncStorage.getItem('user')
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAdmin(parsedUser.is_admin || false);
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

      const [postsData, pollsData] = await Promise.all([
        getPosts(filters),
        getPolls(filters)
      ]);

      let filteredPosts = postsData || [];
      let filteredPolls = pollsData || [];

      setPosts(filteredPosts)
      setPolls(filteredPolls)
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
  }, [selectedCategory, navigation]);

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

  const handleVote = useCallback(async (pollId, optionIndex) => {
    try {
      const updatedPoll = await voteOnPoll(pollId, optionIndex);
      setPolls(currentPolls => currentPolls.map(poll => poll._id === pollId ? updatedPoll : poll));
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to vote on poll');
    }
  }, []);

  const handleDeletePoll = useCallback(async (pollId) => {
    try {
      await deletePoll(pollId);
      setPolls(currentPolls => currentPolls.filter(poll => poll._id !== pollId));
      Alert.alert('Success', 'Poll deleted successfully');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to delete poll');
    }
  }, []);

  const handlePinPoll = useCallback(async (pollId) => {
    try {
      const updatedPoll = await pinPoll(pollId);
      setPolls(currentPolls => currentPolls.map(poll => poll._id === pollId ? updatedPoll : poll));
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to pin poll');
    }
  }, []);

  const combinedFeed = useMemo(() => {
    const postsWithType = posts.map(post => ({ ...post, type: 'post' }));
    const pollsWithType = polls.map(poll => ({ ...poll, type: 'poll' }));
    const combined = [...postsWithType, ...pollsWithType];
    return combined.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return b.isPinned ? 1 : -1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [posts, polls]);

  const renderItem = useCallback(({ item }) => {
    if (item.type === 'poll') {
      return (
        <PollCard
          poll={item}
          onVote={handleVote}
          onDelete={handleDeletePoll}
          onPin={handlePinPoll}
          isAdmin={isAdmin}
          currentUserId={user?._id}
        />
      );
    }
    return (
      <PostCard
        post={item}
        onPress={() => handleNavigateToPost(item._id)}
        onReport={handleReport}
        isAdmin={isAdmin}
        onDelete={handleDelete}
        onPin={handlePin}
      />
    );
  }, [handleNavigateToPost, handleReport, isAdmin, handleDelete, handlePin, handleVote, handleDeletePoll, handlePinPoll, user]);

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
        <FlatList data={combinedFeed} keyExtractor={keyExtractor} renderItem={renderItem} contentContainerStyle={styles.listContent} refreshControl={refreshControl} ListEmptyComponent={renderEmptyState} />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setShowActionModal(true)} activeOpacity={0.8} >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      <Modal visible={showActionModal} transparent animationType="fade" onRequestClose={() => setShowActionModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowActionModal(false)}>
          <View style={styles.actionSheet}>
            <TouchableOpacity style={styles.actionButton} onPress={() => { setShowActionModal(false); navigation.navigate('CreatePost'); }}>
              <Feather name="edit" size={24} color={colors.accent} />
              <Text style={styles.actionButtonText}>Create Post</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => { setShowActionModal(false); navigation.navigate('CreatePoll'); }}>
              <Feather name="bar-chart-2" size={24} color={colors.accent} />
              <Text style={styles.actionButtonText}>Create Poll</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={() => setShowActionModal(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  actionSheet: {
    backgroundColor: colors.cardBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.inputBackground,
    marginBottom: 12,
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: 16,
  },
  cancelButton: {
    backgroundColor: colors.error + '20',
  },
  cancelButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.error,
    textAlign: 'center',
  },
});
