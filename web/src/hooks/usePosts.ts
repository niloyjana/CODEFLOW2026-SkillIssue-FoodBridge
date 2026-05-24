import { useState, useEffect, useCallback } from 'react';
import { FoodPost } from 'shared/types';
import { apiService } from '../services/api';
import { useAuth } from './useAuth';

const NEARBY_RADIUS_KM = 20;

export const usePosts = (locationFilter?: { lat?: number; lng?: number }) => {
  const [posts, setPosts] = useState<FoodPost[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user, refreshSession } = useAuth();

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const lat = locationFilter?.lat;
      const lng = locationFilter?.lng;
      const fetched = await apiService.getPosts(
        lat !== undefined && lng !== undefined
          ? { lat, lng, radius: NEARBY_RADIUS_KM }
          : undefined
      );
      setPosts(fetched);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationFilter?.lat, locationFilter?.lng]);

  const createPost = async (postData: {
    portions: number;
    mealTime: 'breakfast' | 'lunch' | 'dinner';
    venueType: 'cafe' | 'restaurant' | 'fastfood';
    seatingCapacity: number;
    useAi: boolean;
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

    } catch (e: any) {
      setError(e.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (postId: string, reason: string) => {
    if (!user) {
      setError('User session not found');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const deletedPost = await apiService.deletePost(postId, reason);
      setPosts((prev) =>
        prev.map((post) => (post.id === postId ? { ...post, status: 'deleted' as const, deleteReason: reason } : post))
      );
      refreshSession();
    } catch (e: any) {
      setError(e.message || 'Failed to delete post');
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
    } catch (e: any) {
      setError(e.message || 'Failed to claim post');
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
      const updatedPost = await apiService.claimBulkOrder(postId, portions, user);
      setPosts((prev) =>
        prev.map((post) => (post.id === postId ? updatedPost : post))
      );
      refreshSession();
    } catch (e: any) {
      setError(e.message || 'Failed to claim bulk order');
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
    } catch (e: any) {
      setError(e.message || 'Failed to complete order');
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
    deletePost,
    claimPost,
    claimBulkOrder,
    completePost,
  };
};
export default usePosts;
