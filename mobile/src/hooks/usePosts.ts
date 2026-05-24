import { useState, useEffect, useCallback } from 'react';
import { FoodPost } from '../types';
import { apiService } from '../services/api';
import { useAuth } from './useAuth';
import { Alert } from 'react-native';

export const usePosts = () => {
  const [posts, setPosts] = useState<FoodPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, refreshSession } = useAuth();

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetched = await apiService.getPosts();
      setPosts(fetched);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  }, []);

  const createPost = async (postData: {
    portions: number;
    mealTime: 'breakfast' | 'lunch' | 'dinner';
    venueType: 'cafe' | 'restaurant' | 'fastfood';
    seatingCapacity: number;
  }) => {
    if (!user) {
      setError('User session not found');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const newPost = await apiService.createPost({
        ...postData,
        currentUser: user,
      });
      setPosts((prev) => [newPost, ...prev]);
      refreshSession();
      Alert.alert(
        'Posted Successfully',
        `Portions: ${newPost.portions}\nAI Waste Prediction: ${newPost.predictedWasteKg} kg`
      );
    } catch (e: any) {
      setError(e.message || 'Failed to create post');
      Alert.alert('Error', e.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const claimPost = async (postId: string) => {
    if (!user) {
      setError('User session not found');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const updatedPost = await apiService.claimPost(postId, user);
      setPosts((prev) =>
        prev.map((post) => (post.id === postId ? updatedPost : post))
      );
      refreshSession();
      Alert.alert(
        'Claimed!',
        `Successfully claimed food from ${updatedPost.restaurantName}!`
      );
    } catch (e: any) {
      setError(e.message || 'Failed to claim post');
      Alert.alert('Error', e.message || 'Failed to claim post');
    } finally {
      setLoading(false);
    }
  };

  const claimBulkOrder = async (postId: string, portions: number) => {
    if (!user) {
      setError('User session not found');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const updatedPost = await apiService.claimBulkOrder(
        postId,
        portions,
        user
      );
      setPosts((prev) =>
        prev.map((post) => (post.id === postId ? updatedPost : post))
      );
      refreshSession();
      Alert.alert(
        'Claimed!',
        `Successfully claimed ${portions} portions from ${updatedPost.restaurantName}!`
      );
    } catch (e: any) {
      setError(e.message || 'Failed to claim bulk order');
      Alert.alert('Error', e.message || 'Failed to claim bulk order');
    } finally {
      setLoading(false);
    }
  };

  const completePost = async (postId: string) => {
    if (!user) {
      setError('User session not found');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const updatedPost = await apiService.completePost(postId, user);
      setPosts((prev) =>
        prev.map((post) => (post.id === postId ? updatedPost : post))
      );
      refreshSession();
      Alert.alert('Completed!', 'Order marked as distributed!');
    } catch (e: any) {
      setError(e.message || 'Failed to complete order');
      Alert.alert('Error', e.message || 'Failed to complete order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return {
    posts,
    loading,
    error,
    fetchPosts,
    createPost,
    claimPost,
    claimBulkOrder,
    completePost,
  };
};
